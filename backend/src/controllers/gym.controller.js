'use strict';

const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success, paginated } = require('../utils/response');
const { syncAutoincrementSequence, isUniqueIdConflict } = require('../utils/sequence');

const GYM_SELECT = {
  id: true,
  name: true,
  address: true,
  phone: true,
  email: true,
  isActive: true,
  createdAt: true,
  _count: {
    select: { members: true, trainers: true },
  },
  // Include the admin user for this gym
  users: {
    where: { role: 'ADMIN' },
    select: { id: true, name: true, email: true, isActive: true },
    take: 1,
  },
};

// ─── GET /api/gyms ────────────────────────────────────────────────────────────
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip  = (page - 1) * limit;

  const where = {};
  if (req.query.search) {
    where.name = { contains: req.query.search, mode: 'insensitive' };
  }
  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === 'true';
  }

  const [gyms, total] = await Promise.all([
    prisma.gym.findMany({ where, select: GYM_SELECT, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.gym.count({ where }),
  ]);

  paginated(res, gyms, total, page, limit);
});

// ─── GET /api/gyms/:id ────────────────────────────────────────────────────────
exports.getOne = catchAsync(async (req, res, next) => {
  const gym = await prisma.gym.findUnique({
    where: { id: parseInt(req.params.id, 10) },
    select: GYM_SELECT,
  });
  if (!gym) return next(new AppError('Gym not found.', 404));
  success(res, gym);
});

// ─── POST /api/gyms ───────────────────────────────────────────────────────────
// Creates a gym. Optionally creates an admin user for it in the same call.
exports.create = catchAsync(async (req, res) => {
  const { name, address, phone, email } = req.body;

  const data = { name, address, phone, email };

  let gym;
  try {
    gym = await prisma.gym.create({ data, select: GYM_SELECT });
  } catch (error) {
    if (!isUniqueIdConflict(error)) throw error;

    await syncAutoincrementSequence('Gym');
    gym = await prisma.gym.create({ data, select: GYM_SELECT });
  }

  success(res, gym, 201, 'Gym created successfully');
});

// ─── PUT /api/gyms/:id ────────────────────────────────────────────────────────
exports.update = catchAsync(async (req, res, next) => {
  const gymId = parseInt(req.params.id, 10);

  const existing = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!existing) return next(new AppError('Gym not found.', 404));

  const data = {};
  if (req.body.name     != null) data.name     = req.body.name;
  if (req.body.address  != null) data.address  = req.body.address;
  if (req.body.phone    != null) data.phone    = req.body.phone;
  if (req.body.email    != null) data.email    = req.body.email;
  if (req.body.isActive != null) data.isActive = Boolean(req.body.isActive);

  const gym = await prisma.gym.update({ where: { id: gymId }, data, select: GYM_SELECT });
  success(res, gym, 200, 'Gym updated successfully');
});

// ─── DELETE /api/gyms/:id ─────────────────────────────────────────────────────
exports.remove = catchAsync(async (req, res, next) => {
  const gymId = parseInt(req.params.id, 10);

  const existing = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!existing) return next(new AppError('Gym not found.', 404));

  await prisma.gym.delete({ where: { id: gymId } });
  success(res, null, 200, 'Gym deleted successfully');
});

// ─── GET /api/gyms/:id/stats ──────────────────────────────────────────────────
exports.getStats = catchAsync(async (req, res, next) => {
  const gymId = parseInt(req.params.id, 10);

  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym) return next(new AppError('Gym not found.', 404));

  const [memberCount, trainerCount, activeSubCount, todayAttCount] = await Promise.all([
    prisma.member.count({ where: { gymId } }),
    prisma.trainer.count({ where: { gymId } }),
    prisma.subscription.count({
      where: { status: 'ACTIVE', member: { gymId } },
    }),
    prisma.attendance.count({
      where: {
        date: (() => { const d = new Date(); d.setUTCHours(0,0,0,0); return d; })(),
        member: { gymId },
      },
    }),
  ]);

  success(res, { gymId, memberCount, trainerCount, activeSubCount, todayAttCount });
});
