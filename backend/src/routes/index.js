'use strict';

const { Router } = require('express');

const authRoutes         = require('./auth.routes');
const userRoutes         = require('./user.routes');
const memberRoutes       = require('./member.routes');
const attendanceRoutes   = require('./attendance.routes');
const trainerRoutes      = require('./trainer.routes');
const subscriptionRoutes = require('./subscription.routes');
const notificationRoutes = require('./notification.routes');

const router = Router();

router.use('/auth',          authRoutes);
router.use('/users',         userRoutes);
router.use('/members',       memberRoutes);
router.use('/attendance',    attendanceRoutes);
router.use('/trainers',      trainerRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
