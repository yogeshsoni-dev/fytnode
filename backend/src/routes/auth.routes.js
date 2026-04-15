'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const authCtrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

// Public: list active gyms for the member signup form
router.get('/gyms', authCtrl.getPublicGyms);

// Public: member self-registration
router.post(
  '/member-signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('gymId').isInt({ min: 1 }).withMessage('Please select a gym'),
    body('phone').optional().isString(),
    body('age').optional().isInt({ min: 10, max: 120 }).withMessage('Age must be between 10 and 120'),
    body('address').optional().isString(),
  ],
  validate,
  authCtrl.memberSignup
);

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().isString(),
    body('age').optional().isInt({ min: 10, max: 120 }).withMessage('Age must be between 10 and 120'),
    body('address').optional().isString(),
  ],
  validate,
  authCtrl.signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authCtrl.login
);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('refreshToken is required')],
  validate,
  authCtrl.refresh
);

router.post('/logout', authCtrl.logout);
router.post('/logout-all', protect, authCtrl.logoutAll);
router.get('/me', protect, authCtrl.getMe);

module.exports = router;
