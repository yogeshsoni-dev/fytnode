'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success, paginated } = require('../utils/response');
const { resolveGymId } = require('../middleware/rbac.middleware');
const { syncAutoincrementSequence, isUniqueIdConflict } = require('../utils/sequence');

const TRAINER_INCLUDE = {
  user: { select: { id: true, email: true, name: true, role: true, isActive: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
};

// ─── GET /api/trainers ────────────────────────────────────────────────────────
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
  const skip  = (page - 1) * limit;

  const where = {};

  const gymId = resolveGymId(req);
  if (gymId) where.gymId = gymId;

  if (req.query.status) where.status = req.query.status.toUpperCase();
  if (req.query.search) {
    where.user = { name: { contains: req.query.search, mode: 'insensitive' } };
  }

  const [trainers, total] = await Promise.all([
    prisma.trainer.findMany({ where, include: TRAINER_INCLUDE, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.trainer.count({ where }),
  ]);

  paginated(res, trainers, total, page, limit);
});

// ─── GET /api/trainers/:id ────────────────────────────────────────────────────
exports.getOne = catchAsync(async (req, res, next) => {
  const trainer = await prisma.trainer.findUnique({
    where: { id: parseInt(req.params.id, 10) },
    include: TRAINER_INCLUDE,
  });
  if (!trainer) return next(new AppError('Trainer not found.', 404));

  const gymId = resolveGymId(req);
  if (gymId && trainer.gymId !== gymId) {
    return next(new AppError('Trainer not found.', 404));
  }

  success(res, trainer);
});

// ─── POST /api/trainers ───────────────────────────────────────────────────────
exports.create = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, specialization, experience, schedule, status } = req.body;

  const gymId = resolveGymId(req);
  if (!gymId) return next(new AppError('Gym context is required to create a trainer.', 400));

  const hash = await bcrypt.hash(password, 12);

  const createTrainer = () => prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hash,
        name,
        role: 'TRAINER',
        gymId,
      },
    });
    return tx.trainer.create({
      data: {
        userId: user.id,
        gymId,
        phone,
        specialization,
        experience: experience ? parseInt(experience, 10) : 0,
        schedule,
        status: status ? status.toUpperCase() : 'ACTIVE',
      },
      include: TRAINER_INCLUDE,
    });
  });

  let trainer;
  try {
    trainer = await createTrainer();
  } catch (error) {
    if (!isUniqueIdConflict(error)) throw error;

    await syncAutoincrementSequence('Trainer');
    trainer = await createTrainer();
  }

  success(res, trainer, 201, 'Trainer created successfully');
});

// ─── PUT /api/trainers/:id ────────────────────────────────────────────────────
exports.update = catchAsync(async (req, res, next) => {
  const trainerId = parseInt(req.params.id, 10);
  const existing = await prisma.trainer.findUnique({ where: { id: trainerId } });
  if (!existing) return next(new AppError('Trainer not found.', 404));

  const gymId = resolveGymId(req);
  if (gymId && existing.gymId !== gymId) {
    return next(new AppError('Trainer not found.', 404));
  }

  const trainerData = {};
  if (req.body.phone          != null) trainerData.phone          = req.body.phone;
  if (req.body.specialization != null) trainerData.specialization = req.body.specialization;
  if (req.body.experience     != null) trainerData.experience     = parseInt(req.body.experience, 10);
  if (req.body.schedule       != null) trainerData.schedule       = req.body.schedule;
  if (req.body.status         != null) trainerData.status         = req.body.status.toUpperCase();
  if (req.body.rating         != null) trainerData.rating         = parseFloat(req.body.rating);

  const userData = {};
  if (req.body.name  != null) userData.name  = req.body.name;
  if (req.body.email != null) userData.email = req.body.email.toLowerCase().trim();

  const trainer = await prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length) {
      await tx.user.update({ where: { id: existing.userId }, data: userData });
    }
    return tx.trainer.update({ where: { id: trainerId }, data: trainerData, include: TRAINER_INCLUDE });
  });

  success(res, trainer, 200, 'Trainer updated successfully');
});

// ─── DELETE /api/trainers/:id ─────────────────────────────────────────────────
exports.remove = catchAsync(async (req, res, next) => {
  const trainerId = parseInt(req.params.id, 10);
  const existing = await prisma.trainer.findUnique({ where: { id: trainerId } });
  if (!existing) return next(new AppError('Trainer not found.', 404));

  const gymId = resolveGymId(req);
  if (gymId && existing.gymId !== gymId) {
    return next(new AppError('Trainer not found.', 404));
  }

  await prisma.member.updateMany({ where: { trainerId }, data: { trainerId: null } });
  await prisma.user.delete({ where: { id: existing.userId } });
  success(res, null, 200, 'Trainer removed successfully');
});
