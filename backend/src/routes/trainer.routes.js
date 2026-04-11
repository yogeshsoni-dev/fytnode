'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const trainerCtrl = require('../controllers/trainer.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(protect);

router
  .route('/')
  .get(trainerCtrl.getAll)
  .post(
    restrictTo('ADMIN'),
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
      body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
      body('specialization').trim().notEmpty().withMessage('Specialization is required'),
      body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
      body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Invalid status'),
    ],
    validate,
    trainerCtrl.create
  );

router
  .route('/:id')
  .get([param('id').isInt({ gt: 0 })], validate, trainerCtrl.getOne)
  .put(
    restrictTo('ADMIN'),
    [
      param('id').isInt({ gt: 0 }),
      body('email').optional().isEmail().normalizeEmail(),
      body('experience').optional().isInt({ min: 0 }),
      body('rating').optional().isFloat({ min: 0, max: 5 }),
      body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
    ],
    validate,
    trainerCtrl.update
  )
  .delete(
    restrictTo('ADMIN'),
    [param('id').isInt({ gt: 0 })],
    validate,
    trainerCtrl.remove
  );

module.exports = router;
