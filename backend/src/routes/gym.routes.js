'use strict';

const { Router } = require('express');
const { body, param, query } = require('express-validator');
const gymCtrl = require('../controllers/gym.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(protect);
router.use(restrictTo('SUPER_ADMIN'));

// GET /api/gyms
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('isActive').optional().isBoolean(),
  ],
  validate,
  gymCtrl.getAll
);

// GET /api/gyms/:id
router.get(
  '/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid gym ID')],
  validate,
  gymCtrl.getOne
);

// GET /api/gyms/:id/stats
router.get(
  '/:id/stats',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid gym ID')],
  validate,
  gymCtrl.getStats
);

// POST /api/gyms
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Gym name is required'),
    body('email').optional().isEmail().withMessage('Invalid email'),
  ],
  validate,
  gymCtrl.create
);

// PUT /api/gyms/:id
router.put(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('Invalid gym ID'),
    body('email').optional().isEmail().withMessage('Invalid email'),
  ],
  validate,
  gymCtrl.update
);

// DELETE /api/gyms/:id
router.delete(
  '/:id',
  [param('id').isInt({ gt: 0 }).withMessage('Invalid gym ID')],
  validate,
  gymCtrl.remove
);

module.exports = router;
