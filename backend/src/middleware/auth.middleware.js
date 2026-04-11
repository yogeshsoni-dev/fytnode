'use strict';

const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const prisma = require('../utils/prismaClient');

/**
 * Verifies the access token from the Authorization header.
 * Attaches the full user object to req.user on success.
 */
const protect = catchAsync(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }
  if (!user.isActive) {
    return next(new AppError('This account has been deactivated. Contact an administrator.', 403));
  }

  req.user = user;
  next();
});

module.exports = { protect };
