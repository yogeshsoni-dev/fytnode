'use strict';

// Wraps async route handlers so thrown errors flow to the central error middleware
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
