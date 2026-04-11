'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const subCtrl = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(protect);

// Plans (read-only for everyone)
router.get('/plans', subCtrl.getPlans);
router.get('/stats', restrictTo('ADMIN'), subCtrl.getStats);

router
  .route('/')
  .get(restrictTo('ADMIN', 'TRAINER'), subCtrl.getAll)
  .post(
    restrictTo('ADMIN'),
    [
      body('memberId').isInt({ gt: 0 }).withMessage('Valid memberId required'),
      body('planId').isInt({ gt: 0 }).withMessage('Valid planId required'),
      body('startDate').isISO8601().withMessage('Valid start date required'),
      body('status').optional().isIn(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']),
      body('amountPaid').optional().isFloat({ min: 0 }),
    ],
    validate,
    subCtrl.create
  );

router
  .route('/:id')
  .get([param('id').isInt({ gt: 0 })], validate, subCtrl.getOne)
  .put(
    restrictTo('ADMIN'),
    [
      param('id').isInt({ gt: 0 }),
      body('status').optional().isIn(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']),
      body('amountPaid').optional().isFloat({ min: 0 }),
      body('startDate').optional().isISO8601(),
      body('planId').optional().isInt({ gt: 0 }),
    ],
    validate,
    subCtrl.update
  );

module.exports = router;
