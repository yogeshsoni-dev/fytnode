'use strict';

const { Router } = require('express');
const { body, param, query } = require('express-validator');
const attCtrl = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(protect);

// POST /api/attendance/check-in
router.post(
  '/check-in',
  [
    body('memberId')
      .if((_, { req }) => req.user?.role !== 'MEMBER')
      .isInt({ gt: 0 })
      .withMessage('memberId is required for admin/trainer'),
  ],
  validate,
  attCtrl.checkIn
);

// PATCH /api/attendance/:id/check-out
router.patch(
  '/:id/check-out',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid attendance ID')],
  validate,
  attCtrl.checkOut
);

// GET /api/attendance/stats
router.get(
  '/stats',
  restrictTo('ADMIN', 'TRAINER'),
  [query('days').optional().isInt({ min: 1, max: 90 }).withMessage('days must be 1–90')],
  validate,
  attCtrl.getStats
);

// GET /api/attendance/today
router.get('/today', restrictTo('ADMIN', 'TRAINER'), attCtrl.getToday);

// GET /api/attendance/member/:memberId/streak
router.get(
  '/member/:memberId/streak',
  [
    param('memberId').isInt({ gt: 0 }).withMessage('Invalid member ID'),
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('days must be 1–365'),
  ],
  validate,
  attCtrl.getStreak
);

// GET /api/attendance/member/:memberId
router.get(
  '/member/:memberId',
  [param('memberId').isInt({ gt: 0 }).withMessage('Invalid member ID')],
  validate,
  attCtrl.getMemberHistory
);

// GET /api/attendance
router.get(
  '/',
  restrictTo('ADMIN', 'TRAINER'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('from').optional().isISO8601().withMessage('from must be ISO date'),
    query('to').optional().isISO8601().withMessage('to must be ISO date'),
    query('memberId').optional().isInt({ gt: 0 }),
  ],
  validate,
  attCtrl.getAll
);

// DELETE /api/attendance/:id
router.delete(
  '/:id',
  restrictTo('ADMIN'),
  [param('id').isInt({ gt: 0 }).withMessage('Invalid attendance ID')],
  validate,
  attCtrl.remove
);

module.exports = router;
