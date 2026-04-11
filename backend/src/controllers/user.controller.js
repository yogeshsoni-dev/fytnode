'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success, paginated } = require('../utils/response');

// Fields safe to return in all user responses
const USER_SELECT = {
  id: true, email: true, name: true, role: true,
  isActive: true, createdAt: true, updatedAt: true,
  member: {
    select: {
      id: true, phone: true, age: true, address: true,
      joinDate: true, status: true, trainerId: true,
    },
  },
  trainer: {
    select: {
      id: true, phone: true, specialization: true,
      experience: true, schedule: true, status: true, rating: true,
    },
  },
};

// ─── GET /api/users ───────────────────────────────────────────────────────────
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const where = {};
  if (req.query.role)   where.role = req.query.role.toUpperCase();
  if (req.query.search) {
    where.OR = [
      { name:  { contains: req.query.search, mode: 'insensitive' } },
      { email: { contains: req.query.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: USER_SELECT, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);

  paginated(res, users, total, page, limit);
});

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
exports.getOne = catchAsync(async (req, res, next) => {
  // Non-admin users may only fetch their own profile
  const targetId = parseInt(req.params.id, 10);
  if (req.user.role !== 'ADMIN' && req.user.id !== targetId) {
    return next(new AppError('You can only view your own profile.', 403));
  }

  const user = await prisma.user.findUnique({ where: { id: targetId }, select: USER_SELECT });
  if (!user) return next(new AppError('User not found.', 404));
  success(res, user);
});

// ─── POST /api/users ──────────────────────────────────────────────────────────
exports.create = catchAsync(async (req, res) => {
  const { email, password, name, role = 'MEMBER' } = req.body;

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email: email.toLowerCase().trim(), password: hash, name, role: role.toUpperCase() },
    select: USER_SELECT,
  });

  success(res, user, 201, 'User created successfully');
});

// ─── PUT /api/users/:id ───────────────────────────────────────────────────────
exports.update = catchAsync(async (req, res, next) => {
  const targetId = parseInt(req.params.id, 10);

  // Non-admins can only edit their own profile
  if (req.user.role !== 'ADMIN' && req.user.id !== targetId) {
    return next(new AppError('You can only update your own profile.', 403));
  }

  const existing = await prisma.user.findUnique({ where: { id: targetId } });
  if (!existing) return next(new AppError('User not found.', 404));

  // Prevent non-admin from escalating role or toggling isActive
  const data = {};
  if (req.body.name)  data.name  = req.body.name;
  if (req.body.email) data.email = req.body.email.toLowerCase().trim();
  if (req.user.role === 'ADMIN') {
    if (req.body.role)              data.role     = req.body.role.toUpperCase();
    if (req.body.isActive != null)  data.isActive = req.body.isActive;
  }

  const user = await prisma.user.update({ where: { id: targetId }, data, select: USER_SELECT });
  success(res, user, 200, 'User updated successfully');
});

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
exports.remove = catchAsync(async (req, res, next) => {
  const targetId = parseInt(req.params.id, 10);

  if (targetId === req.user.id) {
    return next(new AppError('You cannot delete your own account.', 400));
  }

  const existing = await prisma.user.findUnique({ where: { id: targetId } });
  if (!existing) return next(new AppError('User not found.', 404));

  await prisma.user.delete({ where: { id: targetId } });
  success(res, null, 200, 'User deleted successfully');
});

// ─── PATCH /api/users/:id/password ───────────────────────────────────────────
exports.changePassword = catchAsync(async (req, res, next) => {
  const targetId = parseInt(req.params.id, 10);

  // Non-admins can only change their own password (and must supply current)
  if (req.user.role !== 'ADMIN' && req.user.id !== targetId) {
    return next(new AppError('You can only change your own password.', 403));
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) return next(new AppError('User not found.', 404));

  // Self-change requires current password verification
  if (req.user.id === targetId) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword) return next(new AppError('Current password is required.', 400));
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return next(new AppError('Current password is incorrect.', 401));
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: targetId }, data: { password: hash } });
  } else {
    // Admin force-reset — no current password needed
    const { newPassword } = req.body;
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: targetId }, data: { password: hash } });
  }

  // Invalidate all existing refresh tokens after password change
  await prisma.refreshToken.deleteMany({ where: { userId: targetId } });

  success(res, null, 200, 'Password updated successfully');
});

// ─── PATCH /api/users/:id/toggle-active ──────────────────────────────────────
exports.toggleActive = catchAsync(async (req, res, next) => {
  const targetId = parseInt(req.params.id, 10);

  if (targetId === req.user.id) {
    return next(new AppError('You cannot deactivate your own account.', 400));
  }

  const existing = await prisma.user.findUnique({ where: { id: targetId } });
  if (!existing) return next(new AppError('User not found.', 404));

  const user = await prisma.user.update({
    where: { id: targetId },
    data: { isActive: !existing.isActive },
    select: USER_SELECT,
  });

  // If deactivated, invalidate all sessions
  if (!user.isActive) {
    await prisma.refreshToken.deleteMany({ where: { userId: targetId } });
  }

  success(res, user, 200, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
});
