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
    return next(
      new AppError('You do not have permission to perform this action.', 403)
    );
  }
  next();
};

module.exports = { restrictTo };
