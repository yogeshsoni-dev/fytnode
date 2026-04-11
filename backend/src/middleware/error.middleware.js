'use strict';

const AppError = require('../utils/AppError');

// ─── Prisma error mapper ──────────────────────────────────────────────────────

function handlePrismaError(err) {
  switch (err.code) {
    case 'P2002': {
      const field = err.meta?.target?.[0] ?? 'field';
      return new AppError(`A record with this ${field} already exists.`, 409);
    }
    case 'P2025':
      return new AppError('Record not found.', 404);
    case 'P2003':
      return new AppError('Related record not found.', 400);
    case 'P2000':
      return new AppError('Input value is too long for this field.', 400);
    default:
      return new AppError('Database operation failed.', 500);
  }
}

// ─── JWT error mappers ────────────────────────────────────────────────────────

function handleJWTError() {
  return new AppError('Invalid token. Please log in again.', 401);
}

function handleJWTExpiredError() {
  return new AppError('Your token has expired. Please log in again.', 401);
}

// ─── Dev vs Prod response ─────────────────────────────────────────────────────

function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
}

function sendErrorProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming / unknown error — don't leak details
    console.error('💥 UNHANDLED ERROR:', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

// ─── Central error handler ────────────────────────────────────────────────────

module.exports = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;

    // Map known error types to operational AppErrors
    if (error.code && error.code.startsWith('P')) error = handlePrismaError(error);
    if (error.name === 'JsonWebTokenError')  error = handleJWTError();
    if (error.name === 'TokenExpiredError')  error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
