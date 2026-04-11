'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const userCtrl = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

// All user routes require authentication
router.use(protect);

// ── List / Create ─────────────────────────────────────────────────────────────

router
  .route('/')
  .get(restrictTo('ADMIN'), userCtrl.getAll)
  .post(
    restrictTo('ADMIN'),
    [
      body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('role').optional().isIn(['ADMIN', 'TRAINER', 'MEMBER']).withMessage('Invalid role'),
    ],
    validate,
    userCtrl.create
  );

// ── Single user ───────────────────────────────────────────────────────────────

router
  .route('/:id')
  .get(
    [param('id').isInt({ gt: 0 }).withMessage('Invalid user ID')],
    validate,
    userCtrl.getOne
  )
  .put(
    [
      param('id').isInt({ gt: 0 }).withMessage('Invalid user ID'),
      body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('role').optional().isIn(['ADMIN', 'TRAINER', 'MEMBER']).withMessage('Invalid role'),
      body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    ],
    validate,
    userCtrl.update
  )
  .delete(
    restrictTo('ADMIN'),
    [param('id').isInt({ gt: 0 }).withMessage('Invalid user ID')],
    validate,
    userCtrl.remove
  );

// ── Password ──────────────────────────────────────────────────────────────────

router.patch(
  '/:id/password',
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid user ID'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  userCtrl.changePassword
);

// ── Toggle active (admin only) ────────────────────────────────────────────────

router.patch(
  '/:id/toggle-active',
  restrictTo('ADMIN'),
  [param('id').isInt({ gt: 0 }).withMessage('Invalid user ID')],
  validate,
  userCtrl.toggleActive
);

module.exports = router;
