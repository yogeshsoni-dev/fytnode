'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const memberCtrl = require('../controllers/member.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(protect);

router
  .route('/')
  .get(restrictTo('ADMIN', 'TRAINER'), memberCtrl.getAll)
  .post(
    restrictTo('ADMIN'),
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
      body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
      body('phone').optional(),
      body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
      body('trainerId').optional().isInt({ gt: 0 }).withMessage('Valid trainerId required'),
      body('status').optional().isIn(['ACTIVE', 'EXPIRED', 'PENDING', 'INACTIVE']).withMessage('Invalid status'),
    ],
    validate,
    memberCtrl.create
  );

router
  .route('/:id')
  .get(
    [param('id').isInt({ gt: 0 }).withMessage('Invalid member ID')],
    validate,
    memberCtrl.getOne
  )
  .put(
    [
      param('id').isInt({ gt: 0 }).withMessage('Invalid member ID'),
      body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
      body('status').optional().isIn(['ACTIVE', 'EXPIRED', 'PENDING', 'INACTIVE']).withMessage('Invalid status'),
      body('trainerId').optional().isInt({ gt: 0 }).withMessage('Valid trainerId required'),
    ],
    validate,
    memberCtrl.update
  )
  .delete(
    restrictTo('ADMIN'),
    [param('id').isInt({ gt: 0 }).withMessage('Invalid member ID')],
    validate,
    memberCtrl.remove
  );

module.exports = router;
