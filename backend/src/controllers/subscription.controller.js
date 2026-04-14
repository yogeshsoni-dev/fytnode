'use strict';

const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success, paginated } = require('../utils/response');
const { resolveGymId } = require('../middleware/rbac.middleware');
const { syncAutoincrementSequence, isUniqueIdConflict } = require('../utils/sequence');

const SUB_INCLUDE = {
  member: { include: { user: { select: { id: true, name: true, email: true } } } },
  plan: true,
};

// ─── GET /api/subscriptions ───────────────────────────────────────────────────
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, Number.parseInt(req.query.page, 10)  || 1);
  const limit = Math.min(100, Number.parseInt(req.query.limit, 10) || 20);
  const skip  = (page - 1) * limit;

  const where = {};

  const gymId = resolveGymId(req);
  if (gymId) where.member = { gymId };

  if (req.query.status)   where.status   = req.query.status.toUpperCase();
  if (req.query.memberId) where.memberId = Number.parseInt(req.query.memberId, 10);
  if (req.query.planId)   where.planId   = Number.parseInt(req.query.planId, 10);
  if (req.query.search) {
    where.member = { ...where.member, user: { name: { contains: req.query.search, mode: 'insensitive' } } };
  }

  const [subs, total] = await Promise.all([
    prisma.subscription.findMany({ where, include: SUB_INCLUDE, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.subscription.count({ where }),
  ]);

  paginated(res, subs, total, page, limit);
});

// ─── GET /api/subscriptions/plans ─────────────────────────────────────────────
exports.getPlans = catchAsync(async (_req, res) => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });
  success(res, plans);
});

// ─── GET /api/subscriptions/:id ───────────────────────────────────────────────
exports.getOne = catchAsync(async (req, res, next) => {
  const sub = await prisma.subscription.findUnique({
    where: { id: Number.parseInt(req.params.id, 10) },
    include: SUB_INCLUDE,
  });
  if (!sub) return next(new AppError('Subscription not found.', 404));

  const gymId = resolveGymId(req);
  if (gymId && sub.member?.gymId !== gymId) {
    return next(new AppError('Subscription not found.', 404));
  }

  success(res, sub);
});

// ─── POST /api/subscriptions ──────────────────────────────────────────────────
exports.create = catchAsync(async (req, res, next) => {
  const { memberId, planId, startDate, status, amountPaid } = req.body;

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: Number.parseInt(planId, 10) } });
  if (!plan) return next(new AppError('Subscription plan not found.', 404));

  // Ensure member belongs to same gym
  const gymId = resolveGymId(req);
  if (gymId) {
    const member = await prisma.member.findUnique({ where: { id: Number.parseInt(memberId, 10) } });
    if (!member || member.gymId !== gymId) {
      return next(new AppError('Member not found in your gym.', 404));
    }
  }

  const start = new Date(startDate);
  const end   = new Date(startDate);
  end.setMonth(end.getMonth() + plan.duration);

  const data = {
    memberId:   Number.parseInt(memberId, 10),
    planId:     Number.parseInt(planId, 10),
    startDate:  start,
    endDate:    end,
    status:     status ? status.toUpperCase() : 'ACTIVE',
    amountPaid: amountPaid != null ? Number.parseFloat(amountPaid) : plan.price,
  };

  let sub;
  try {
    sub = await prisma.subscription.create({ data, include: SUB_INCLUDE });
  } catch (error) {
    if (!isUniqueIdConflict(error)) throw error;

    await syncAutoincrementSequence('Subscription');
    sub = await prisma.subscription.create({ data, include: SUB_INCLUDE });
  }

  success(res, sub, 201, 'Subscription created');
});

// ─── PUT /api/subscriptions/:id ───────────────────────────────────────────────
exports.update = catchAsync(async (req, res, next) => {
  const subId = Number.parseInt(req.params.id, 10);
  const existing = await prisma.subscription.findUnique({ where: { id: subId }, include: { member: true } });
  if (!existing) return next(new AppError('Subscription not found.', 404));

  const gymId = resolveGymId(req);
  if (gymId && existing.member?.gymId !== gymId) {
    return next(new AppError('Subscription not found.', 404));
  }

  const data = {};
  if (req.body.status     != null) data.status     = req.body.status.toUpperCase();
  if (req.body.amountPaid != null) data.amountPaid = Number.parseFloat(req.body.amountPaid);
  if (req.body.startDate  != null) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: existing.planId } });
    data.startDate = new Date(req.body.startDate);
    data.endDate   = new Date(req.body.startDate);
    data.endDate.setMonth(data.endDate.getMonth() + (plan?.duration || 1));
  }
  if (req.body.planId != null) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: Number.parseInt(req.body.planId, 10) } });
    if (!plan) return next(new AppError('Plan not found.', 404));
    data.planId = plan.id;
    if (!req.body.startDate) {
      data.endDate = new Date(existing.startDate);
      data.endDate.setMonth(data.endDate.getMonth() + plan.duration);
    }
  }

  const sub = await prisma.subscription.update({ where: { id: subId }, data, include: SUB_INCLUDE });
  success(res, sub, 200, 'Subscription updated');
});

// ─── GET /api/subscriptions/stats ─────────────────────────────────────────────
exports.getStats = catchAsync(async (req, res) => {
  const gymId = resolveGymId(req);
  const memberWhere = gymId ? { gymId } : {};

  const [plans, subs] = await Promise.all([
    prisma.subscriptionPlan.findMany(),
    prisma.subscription.findMany({
      where: { member: memberWhere },
      include: { plan: true },
    }),
  ]);

  const revenue = subs
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (s.plan?.price || 0), 0);

  const byStatus = {
    active:    subs.filter((s) => s.status === 'ACTIVE').length,
    expired:   subs.filter((s) => s.status === 'EXPIRED').length,
    pending:   subs.filter((s) => s.status === 'PENDING').length,
    cancelled: subs.filter((s) => s.status === 'CANCELLED').length,
  };

  const planDist = plans.map((plan) => ({
    ...plan,
    activeCount: subs.filter((s) => s.planId === plan.id && s.status === 'ACTIVE').length,
    revenue: subs.filter((s) => s.planId === plan.id && s.status === 'ACTIVE').length * plan.price,
  }));

  success(res, { monthlyRevenue: revenue, byStatus, planDistribution: planDist });
});
