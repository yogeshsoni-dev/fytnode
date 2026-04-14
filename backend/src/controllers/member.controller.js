'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success, paginated } = require('../utils/response');
const { resolveGymId } = require('../middleware/rbac.middleware');

const MEMBER_INCLUDE = {
  user: { select: { id: true, email: true, name: true, role: true, isActive: true } },
  trainer: {
    include: {
      user: { select: { name: true, email: true } },
    },
  },
  subscriptions: {
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
    take: 1,
  },
};

// ─── GET /api/members ─────────────────────────────────────────────────────────
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip  = (page - 1) * limit;

  const where = {};

  const gymId = resolveGymId(req);
  if (gymId) where.gymId = gymId;

  if (req.query.status) where.status = req.query.status.toUpperCase();
  if (req.query.search) {
    where.user = {
      OR: [
        { name:  { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
      ],
    };
  }

  // Trainers can only see members they manage
  if (req.user.role === 'TRAINER') {
    const trainer = await prisma.trainer.findUnique({ where: { userId: req.user.id } });
    if (trainer) where.trainerId = trainer.id;
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({ where, include: MEMBER_INCLUDE, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.member.count({ where }),
  ]);

  paginated(res, members, total, page, limit);
});

// ─── GET /api/members/:id ─────────────────────────────────────────────────────
exports.getOne = catchAsync(async (req, res, next) => {
  const memberId = parseInt(req.params.id, 10);

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      ...MEMBER_INCLUDE,
      subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
      attendance: { orderBy: { date: 'desc' }, take: 30 },
    },
  });
  if (!member) return next(new AppError('Member not found.', 404));

  // Members can only view their own profile
  if (req.user.role === 'MEMBER' && member.userId !== req.user.id) {
    return next(new AppError('You can only view your own member profile.', 403));
  }

  // ADMIN/TRAINER scoped to their gym
  const gymId = resolveGymId(req);
  if (gymId && member.gymId !== gymId) {
    return next(new AppError('Member not found.', 404));
  }

  success(res, member);
});

// ─── POST /api/members ────────────────────────────────────────────────────────
exports.create = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, age, address, trainerId, status } = req.body;

  const gymId = resolveGymId(req);
  if (!gymId) return next(new AppError('Gym context is required to create a member.', 400));

  const hash = await bcrypt.hash(password, 12);

  const member = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hash,
        name,
        role: 'MEMBER',
        gymId,
      },
    });
    return tx.member.create({
      data: {
        userId: user.id,
        gymId,
        phone,
        age: age ? parseInt(age, 10) : undefined,
        address,
        trainerId: trainerId ? parseInt(trainerId, 10) : undefined,
        status: status ? status.toUpperCase() : 'ACTIVE',
      },
      include: MEMBER_INCLUDE,
    });
  });

  success(res, member, 201, 'Member created successfully');
});

// ─── PUT /api/members/:id ─────────────────────────────────────────────────────
exports.update = catchAsync(async (req, res, next) => {
  const memberId = parseInt(req.params.id, 10);

  const existing = await prisma.member.findUnique({ where: { id: memberId } });
  if (!existing) return next(new AppError('Member not found.', 404));

  // Gym scope check
  const gymId = resolveGymId(req);
  if (gymId && existing.gymId !== gymId) {
    return next(new AppError('Member not found.', 404));
  }

  // Members can only edit their own profile
  if (req.user.role === 'MEMBER' && existing.userId !== req.user.id) {
    return next(new AppError('You can only update your own member profile.', 403));
  }

  const data = {};
  if (req.body.phone   != null) data.phone   = req.body.phone;
  if (req.body.age     != null) data.age     = parseInt(req.body.age, 10);
  if (req.body.address != null) data.address = req.body.address;
  if (req.user.role !== 'MEMBER') {
    if (req.body.status    != null) data.status    = req.body.status.toUpperCase();
    if (req.body.trainerId != null) data.trainerId = parseInt(req.body.trainerId, 10);
  }

  const member = await prisma.member.update({ where: { id: memberId }, data, include: MEMBER_INCLUDE });
  success(res, member, 200, 'Member updated successfully');
});

// ─── DELETE /api/members/:id ──────────────────────────────────────────────────
exports.remove = catchAsync(async (req, res, next) => {
  const memberId = parseInt(req.params.id, 10);

  const existing = await prisma.member.findUnique({ where: { id: memberId } });
  if (!existing) return next(new AppError('Member not found.', 404));

  const gymId = resolveGymId(req);
  if (gymId && existing.gymId !== gymId) {
    return next(new AppError('Member not found.', 404));
  }

  await prisma.user.delete({ where: { id: existing.userId } });
  success(res, null, 200, 'Member deleted successfully');
});
