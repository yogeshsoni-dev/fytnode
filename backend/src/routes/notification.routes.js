'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const notifCtrl = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(protect);

router
  .route('/')
  .get(notifCtrl.getAll)
  .post(
    restrictTo('ADMIN'),
    [
      body('type').isIn(['RENEWAL', 'PAYMENT', 'ANNOUNCEMENT', 'TRAINER']).withMessage('Invalid type'),
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('message').trim().notEmpty().withMessage('Message is required'),
      body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
      body('userId').optional().isInt({ gt: 0 }),
    ],
    validate,
    notifCtrl.create
  );

router.patch('/mark-all-read', notifCtrl.markAllRead);

router.patch(
  '/:id/read',
  [param('id').isInt({ gt: 0 })],
  validate,
  notifCtrl.markRead
);

router.delete(
  '/:id',
  restrictTo('ADMIN'),
  [param('id').isInt({ gt: 0 })],
  validate,
  notifCtrl.remove
);

module.exports = router;
