'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(protect);

router.get('/', ctrl.getAll);
router.get('/:id', [param('id').isInt({ gt: 0 })], validate, ctrl.getOne);

router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('Items are required'),
  body('items.*.productId').isInt({ gt: 0 }).withMessage('Valid productId required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
], validate, ctrl.create);

router.patch('/:id/status', [
  param('id').isInt({ gt: 0 }),
  body('status').isIn(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).withMessage('Invalid status'),
], validate, ctrl.updateStatus);

module.exports = router;
