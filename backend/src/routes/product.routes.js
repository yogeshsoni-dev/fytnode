'use strict';

const { Router } = require('express');
const { body, param, query } = require('express-validator');
const ctrl = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(protect);

// All authenticated users can browse products
router.get('/', [
  query('category').optional().isIn(['PROTEIN', 'EQUIPMENT']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], validate, ctrl.getAll);

router.get('/:id', [param('id').isInt({ gt: 0 })], validate, ctrl.getOne);

// Only SUPER_ADMIN can manage products
router.post('/', restrictTo('SUPER_ADMIN'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be positive'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be >= 0'),
  body('category').isIn(['PROTEIN', 'EQUIPMENT']).withMessage('Category must be PROTEIN or EQUIPMENT'),
], validate, ctrl.create);

router.put('/:id', restrictTo('SUPER_ADMIN'), [param('id').isInt({ gt: 0 })], validate, ctrl.update);
router.delete('/:id', restrictTo('SUPER_ADMIN'), [param('id').isInt({ gt: 0 })], validate, ctrl.remove);

module.exports = router;
