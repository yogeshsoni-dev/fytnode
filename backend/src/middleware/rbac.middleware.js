'use strict';

const AppError = require('../utils/AppError');

/**
 * Restricts access to the given roles.
 * Must be used AFTER the protect middleware.
 *
 * Usage: restrictTo('ADMIN', 'TRAINER')
 */
const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

/**
 * Resolves the gymId to apply on a query.
 * - SUPER_ADMIN: can pass ?gymId=X or get all (returns null = no filter)
 * - ADMIN/TRAINER/MEMBER: always scoped to their own gymId
 */
function resolveGymId(req) {
  if (req.user.role === 'SUPER_ADMIN') {
    return req.query.gymId ? parseInt(req.query.gymId, 10) : null;
  }
  return req.user.gymId || null;
}

module.exports = { restrictTo, resolveGymId };
