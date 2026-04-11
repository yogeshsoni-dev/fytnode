'use strict';

const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success, paginated } = require('../utils/response');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strips time from a Date, returning midnight UTC for that calendar date */
function toDateOnly(d = new Date()) {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}

/** Resolves a memberId for the authenticated user.
 *  Members always operate on their own record.
 *  Admins/trainers pass memberId explicitly in the body.
 */
async function resolveMemberId(req, next) {
  if (req.user.role === 'MEMBER') {
    const member = await prisma.member.findUnique({ where: { userId: req.user.id } });
    if (!member) {
      next(new AppError('No member profile found for this account.', 404));
      return null;
    }
    return member.id;
  }
  const id = parseInt(req.body.memberId, 10);
  if (!id) { next(new AppError('memberId is required.', 400)); return null; }
  return id;
}

const ATT_INCLUDE = {
  member: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
};

// ─── POST /api/attendance/check-in ───────────────────────────────────────────
exports.checkIn = catchAsync(async (req, res, next) => {
  const memberId = await resolveMemberId(req, next);
  if (!memberId) return;

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return next(new AppError('Member not found.', 404));

  const today = toDateOnly();
  const now   = new Date();

  // Prevent double check-in on the same day
  const existing = await prisma.attendance.findUnique({
    where: { memberId_date: { memberId, date: today } },
  });
  if (existing) {
    if (existing.checkIn && !existing.checkOut) {
      return next(new AppError('Member has already checked in today. Use check-out to record departure.', 409));
    }
    if (existing.checkIn && existing.checkOut) {
      return next(new AppError('Member has already completed an attendance record today.', 409));
    }
  }

  const record = await prisma.attendance.upsert({
    where: { memberId_date: { memberId, date: today } },
    create: { memberId, date: today, checkIn: now },
    update: { checkIn: now, checkOut: null },
    include: ATT_INCLUDE,
  });

  success(res, record, 201, 'Check-in recorded');
});

// ─── PATCH /api/attendance/:id/check-out ─────────────────────────────────────
exports.checkOut = catchAsync(async (req, res, next) => {
  const attId = parseInt(req.params.id, 10);

  const record = await prisma.attendance.findUnique({
    where: { id: attId },
    include: { member: true },
  });
  if (!record) return next(new AppError('Attendance record not found.', 404));

  // Members can only check out themselves
  if (req.user.role === 'MEMBER' && record.member.userId !== req.user.id) {
    return next(new AppError('You can only check yourself out.', 403));
  }
  if (!record.checkIn) return next(new AppError('Cannot check out — no check-in recorded.', 400));
  if (record.checkOut) return next(new AppError('Already checked out.', 409));

  const updated = await prisma.attendance.update({
    where: { id: attId },
    data: { checkOut: new Date() },
    include: ATT_INCLUDE,
  });

  success(res, updated, 200, 'Check-out recorded');
});

// ─── GET /api/attendance ──────────────────────────────────────────────────────
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const where = {};

  // Date range filter
  if (req.query.from || req.query.to) {
    where.date = {};
    if (req.query.from) where.date.gte = toDateOnly(new Date(req.query.from));
    if (req.query.to)   where.date.lte = toDateOnly(new Date(req.query.to));
  }

  // Trainers see only their members' attendance
  if (req.user.role === 'TRAINER') {
    const trainer = await prisma.trainer.findUnique({ where: { userId: req.user.id } });
    if (trainer) {
      const memberIds = (await prisma.member.findMany({
        where: { trainerId: trainer.id },
        select: { id: true },
      })).map((m) => m.id);
      where.memberId = { in: memberIds };
    }
  }

  if (req.query.memberId) where.memberId = parseInt(req.query.memberId, 10);

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: ATT_INCLUDE,
      skip,
      take: limit,
      orderBy: [{ date: 'desc' }, { checkIn: 'desc' }],
    }),
    prisma.attendance.count({ where }),
  ]);

  paginated(res, records, total, page, limit);
});

// ─── GET /api/attendance/today ────────────────────────────────────────────────
exports.getToday = catchAsync(async (req, res) => {
  const today = toDateOnly();
  const where = { date: today };

  if (req.user.role === 'TRAINER') {
    const trainer = await prisma.trainer.findUnique({ where: { userId: req.user.id } });
    if (trainer) {
      const memberIds = (await prisma.member.findMany({
        where: { trainerId: trainer.id },
        select: { id: true },
      })).map((m) => m.id);
      where.memberId = { in: memberIds };
    }
  }

  const records = await prisma.attendance.findMany({
    where,
    include: ATT_INCLUDE,
    orderBy: { checkIn: 'desc' },
  });

  success(res, { date: today, count: records.length, records });
});

// ─── GET /api/attendance/member/:memberId ─────────────────────────────────────
exports.getMemberHistory = catchAsync(async (req, res, next) => {
  const memberId = parseInt(req.params.memberId, 10);

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return next(new AppError('Member not found.', 404));

  // Members can only view their own history
  if (req.user.role === 'MEMBER' && member.userId !== req.user.id) {
    return next(new AppError('You can only view your own attendance history.', 403));
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 30);
  const skip  = (page - 1) * limit;

  const where = { memberId };
  if (req.query.from || req.query.to) {
    where.date = {};
    if (req.query.from) where.date.gte = toDateOnly(new Date(req.query.from));
    if (req.query.to)   where.date.lte = toDateOnly(new Date(req.query.to));
  }

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: ATT_INCLUDE,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.attendance.count({ where }),
  ]);

  paginated(res, records, total, page, limit);
});

// ─── GET /api/attendance/stats ────────────────────────────────────────────────
exports.getStats = catchAsync(async (req, res) => {
  const now  = new Date();
  const days = parseInt(req.query.days) || 7;

  // Build date buckets for the last N days
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.push(toDateOnly(d));
  }

  const from = buckets[0];
  const to   = buckets[buckets.length - 1];

  const records = await prisma.attendance.findMany({
    where: { date: { gte: from, lte: to } },
    select: { date: true, checkIn: true, checkOut: true },
  });

  // Group by date
  const grouped = {};
  for (const b of buckets) {
    grouped[b.toISOString()] = { date: b, count: 0, avgDurationMin: null };
  }

  const durationByDate = {};
  for (const r of records) {
    const key = toDateOnly(r.date).toISOString();
    if (grouped[key]) grouped[key].count++;
    if (r.checkIn && r.checkOut) {
      durationByDate[key] = durationByDate[key] || [];
      durationByDate[key].push((r.checkOut - r.checkIn) / 60_000);
    }
  }

  // Average durations
  for (const key of Object.keys(durationByDate)) {
    const arr = durationByDate[key];
    if (arr.length && grouped[key]) {
      grouped[key].avgDurationMin = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    }
  }

  // Weekly aggregation (Mon–Sun label)
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daily = Object.values(grouped).map((g) => ({
    date: g.date.toISOString().split('T')[0],
    day: DAY_NAMES[g.date.getUTCDay()],
    count: g.count,
    avgDurationMin: g.avgDurationMin,
  }));

  // Overall stats
  const totalCheckins = records.length;
  const checkedOut    = records.filter((r) => r.checkIn && r.checkOut);
  const avgDuration   = checkedOut.length
    ? Math.round(checkedOut.reduce((acc, r) => acc + (r.checkOut - r.checkIn) / 60_000, 0) / checkedOut.length)
    : null;

  // Today's live count
  const todayCount = grouped[toDateOnly(now).toISOString()]?.count ?? 0;

  success(res, {
    period: { days, from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] },
    totalCheckins,
    todayCount,
    avgDurationMin: avgDuration,
    daily,
  });
});

// ─── DELETE /api/attendance/:id (admin only) ──────────────────────────────────
exports.remove = catchAsync(async (req, res, next) => {
  const attId = parseInt(req.params.id, 10);
  const record = await prisma.attendance.findUnique({ where: { id: attId } });
  if (!record) return next(new AppError('Attendance record not found.', 404));
  await prisma.attendance.delete({ where: { id: attId } });
  success(res, null, 200, 'Attendance record deleted');
});
