'use strict';

const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success, paginated } = require('../utils/response');

const ORDER_INCLUDE = {
  user: { select: { id: true, name: true, email: true, gymId: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, category: true, imageUrl: true } },
    },
  },
};

// ─── GET /api/orders (SUPER_ADMIN sees all; others see own) ───────────────────
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Number.parseInt(req.query.limit, 10) || 20);
  const skip  = (page - 1) * limit;

  const where = {};

  if (req.user.role === 'SUPER_ADMIN') {
    if (req.query.gymId) where.gymId = Number.parseInt(req.query.gymId, 10);
  } else {
    where.userId = req.user.id;
  }

  if (req.query.status) where.status = req.query.status.toUpperCase();

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, include: ORDER_INCLUDE, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.order.count({ where }),
  ]);

  paginated(res, orders, total, page, limit);
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
exports.getOne = catchAsync(async (req, res, next) => {
  const order = await prisma.order.findUnique({
    where: { id: Number.parseInt(req.params.id, 10) },
    include: ORDER_INCLUDE,
  });
  if (!order) return next(new AppError('Order not found.', 404));

  // Only owner or super admin can see order
  if (req.user.role !== 'SUPER_ADMIN' && order.userId !== req.user.id) {
    return next(new AppError('Order not found.', 404));
  }

  success(res, order);
});

// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Body: { items: [{ productId, quantity }], address, note }
exports.create = catchAsync(async (req, res, next) => {
  const { items, address, note } = req.body;

  if (!items || !items.length) return next(new AppError('Order must contain at least one item.', 400));

  // Fetch products and validate stock
  const productIds = items.map((i) => Number.parseInt(i.productId, 10));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    return next(new AppError('One or more products not found or inactive.', 400));
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(Number.parseInt(item.productId, 10));
    const qty = Number.parseInt(item.quantity, 10);
    if (qty < 1) return next(new AppError(`Invalid quantity for ${product.name}.`, 400));
    if (product.stock < qty) {
      return next(new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}.`, 400));
    }
  }

  // Build order in transaction
  const order = await prisma.$transaction(async (tx) => {
    let total = 0;
    const itemsData = items.map((item) => {
      const product = productMap.get(Number.parseInt(item.productId, 10));
      const qty = Number.parseInt(item.quantity, 10);
      total += product.price * qty;
      return { productId: product.id, quantity: qty, price: product.price };
    });

    // Decrement stock
    await Promise.all(
      items.map((item) =>
        tx.product.update({
          where: { id: Number.parseInt(item.productId, 10) },
          data: { stock: { decrement: Number.parseInt(item.quantity, 10) } },
        })
      )
    );

    return tx.order.create({
      data: {
        userId:  req.user.id,
        gymId:   req.user.gymId || null,
        total,
        address: address || null,
        note:    note || null,
        items:   { create: itemsData },
      },
      include: ORDER_INCLUDE,
    });
  });

  success(res, order, 201, 'Order placed successfully');
});

// ─── PATCH /api/orders/:id/status (SUPER_ADMIN only) ─────────────────────────
exports.updateStatus = catchAsync(async (req, res, next) => {
  const orderId = Number.parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!status) return next(new AppError('Status is required.', 400));

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return next(new AppError('Order not found.', 404));

  // Members/Admins can cancel their own orders if still PENDING
  if (req.user.role !== 'SUPER_ADMIN') {
    if (order.userId !== req.user.id) return next(new AppError('Order not found.', 404));
    if (status.toUpperCase() !== 'CANCELLED') {
      return next(new AppError('You can only cancel your own orders.', 403));
    }
    if (order.status !== 'PENDING') {
      return next(new AppError('Only pending orders can be cancelled.', 400));
    }
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: status.toUpperCase() },
    include: ORDER_INCLUDE,
  });

  success(res, updated);
});
