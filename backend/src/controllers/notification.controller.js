'use strict';

const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success, paginated } = require('../utils/response');

// ─── GET /api/notifications ───────────────────────────────────────────────────
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const where = {};
  // Members only see notifications addressed to them
  if (req.user.role === 'MEMBER') {
    where.OR = [{ userId: req.user.id }, { userId: null }];
  }
  if (req.query.read === 'true')  where.read = true;
  if (req.query.read === 'false') where.read = false;
  if (req.query.type) where.type = req.query.type.toUpperCase();

  const [notifs, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);

  const unreadCount = await prisma.notification.count({
    where: req.user.role === 'MEMBER'
      ? { OR: [{ userId: req.user.id }, { userId: null }], read: false }
      : { read: false },
  });

  paginated(res, notifs, total, page, limit);
  // Patch meta into response — re-do with manual response
});

// Override getAll with unreadCount in meta
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const where = {};
  if (req.user.role === 'MEMBER') {
    where.OR = [{ userId: req.user.id }, { userId: null }];
  }
  if (req.query.read === 'true')  where.read = true;
  if (req.query.read === 'false') where.read = false;
  if (req.query.type) where.type = req.query.type.toUpperCase();

  const [notifs, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        ...( req.user.role === 'MEMBER'
          ? { OR: [{ userId: req.user.id }, { userId: null }] }
          : {}),
        read: false,
      },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: notifs,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount },
  });
});

// ─── POST /api/notifications ──────────────────────────────────────────────────
exports.create = catchAsync(async (req, res) => {
  const { type, title, message, priority, userId } = req.body;

  const notif = await prisma.notification.create({
    data: {
      type:     type.toUpperCase(),
      title,
      message,
      priority: priority ? priority.toUpperCase() : 'LOW',
      userId:   userId ? parseInt(userId, 10) : null,
    },
  });

  success(res, notif, 201, 'Notification created');
});

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
exports.markRead = catchAsync(async (req, res, next) => {
  const notifId = parseInt(req.params.id, 10);
  const existing = await prisma.notification.findUnique({ where: { id: notifId } });
  if (!existing) return next(new AppError('Notification not found.', 404));

  const notif = await prisma.notification.update({
    where: { id: notifId },
    data: { read: true },
  });
  success(res, notif);
});

// ─── PATCH /api/notifications/mark-all-read ───────────────────────────────────
exports.markAllRead = catchAsync(async (req, res) => {
  const where =
    req.user.role === 'MEMBER'
      ? { OR: [{ userId: req.user.id }, { userId: null }], read: false }
      : { read: false };

  await prisma.notification.updateMany({ where, data: { read: true } });
  success(res, null, 200, 'All notifications marked as read');
});

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
exports.remove = catchAsync(async (req, res, next) => {
  const notifId = parseInt(req.params.id, 10);
  const existing = await prisma.notification.findUnique({ where: { id: notifId } });
  if (!existing) return next(new AppError('Notification not found.', 404));
  await prisma.notification.delete({ where: { id: notifId } });
  success(res, null, 200, 'Notification deleted');
});
