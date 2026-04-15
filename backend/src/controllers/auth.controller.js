'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/response');

function signAccessToken(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );
}

function signRefreshToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
}

function getRefreshExpiry() {
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid JWT_REFRESH_EXPIRES_IN format');

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const msMap = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + value * msMap[unit]);
}

const AUTH_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  gymId: true,
  createdAt: true,
  gym: {
    select: { id: true, name: true, isActive: true },
  },
  member: {
    select: {
      id: true,
      gymId: true,
      phone: true,
      age: true,
      address: true,
      joinDate: true,
      status: true,
      trainerId: true,
    },
  },
  trainer: {
    select: {
      id: true,
      gymId: true,
      phone: true,
      specialization: true,
      experience: true,
      schedule: true,
      status: true,
      rating: true,
    },
  },
};

async function buildAuthResponse(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: AUTH_USER_SELECT,
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshExpiry(),
    },
  });

  return { user, accessToken, refreshToken };
}

// Public list of active gyms — used by the member self-signup form
exports.getPublicGyms = catchAsync(async (req, res) => {
  const gyms = await prisma.gym.findMany({
    where: { isActive: true },
    select: { id: true, name: true, address: true },
    orderBy: { name: 'asc' },
  });
  success(res, gyms);
});

// Self-service signup for gym members
exports.memberSignup = catchAsync(async (req, res, next) => {
  const { name, email, password, gymId, phone, age, address } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  const gym = await prisma.gym.findUnique({
    where: { id: Number(gymId) },
    select: { id: true, isActive: true },
  });
  if (!gym || !gym.isActive) {
    return next(new AppError('Selected gym not found or is no longer active.', 404));
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const createdUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: passwordHash,
      name: name.trim(),
      role: 'MEMBER',
      gymId: gym.id,
      member: {
        create: {
          gymId: gym.id,
          phone: phone?.trim() || null,
          age: age ? parseInt(age, 10) : null,
          address: address?.trim() || null,
        },
      },
    },
    select: { id: true },
  });

  const authData = await buildAuthResponse(createdUser.id);
  success(res, authData, 201, 'Account created successfully');
});

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    return next(new AppError('An account with this email already exists.', 409));
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const createdUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: passwordHash,
      name: name.trim(),
      role: 'ADMIN',
    },
    select: { id: true },
  });

  const authData = await buildAuthResponse(createdUser.id);
  success(res, authData, 201, 'Signup successful');
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      password: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid email or password.', 401));
  }
  if (!user.isActive) {
    return next(new AppError('This account has been deactivated. Contact an administrator.', 403));
  }

  const authData = await buildAuthResponse(user.id);
  success(res, authData, 200, 'Login successful');
});

exports.refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new AppError('Refresh token is required.', 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return next(new AppError('Invalid or expired refresh token.', 401));
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true, isActive: true },
      },
    },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    return next(new AppError('Refresh token has expired. Please log in again.', 401));
  }
  if (!stored.user.isActive) {
    return next(new AppError('This account has been deactivated.', 403));
  }

  const newRefreshToken = signRefreshToken(stored.user.id);
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.user.id,
        expiresAt: getRefreshExpiry(),
      },
    }),
  ]);

  const newAccessToken = signAccessToken(stored.user.id, stored.user.role);

  success(res, {
    user: stored.user,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

exports.logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  success(res, null, 200, 'Logged out successfully');
});

exports.logoutAll = catchAsync(async (req, res) => {
  await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });
  success(res, null, 200, 'Logged out from all devices');
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: AUTH_USER_SELECT,
  });
  if (!user) return next(new AppError('User not found.', 404));
  success(res, user);
});
