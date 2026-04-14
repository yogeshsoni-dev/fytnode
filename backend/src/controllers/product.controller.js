'use strict';

const prisma = require('../utils/prismaClient');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success, paginated } = require('../utils/response');
const {
  serializeProductImage,
  serializeProducts,
  uploadProductImageToMinio,
} = require('../utils/objectStorage');
const { syncAutoincrementSequence, isUniqueIdConflict } = require('../utils/sequence');

// ─── GET /api/products ────────────────────────────────────────────────────────
exports.getAll = catchAsync(async (req, res) => {
  const page  = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Number.parseInt(req.query.limit, 10) || 50);
  const skip  = (page - 1) * limit;

  const where = { isActive: true };
  if (req.query.category) where.category = req.query.category.toUpperCase();
  if (req.query.search) {
    where.name = { contains: req.query.search, mode: 'insensitive' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  paginated(res, await serializeProducts(products), total, page, limit);
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
exports.getOne = catchAsync(async (req, res, next) => {
  const product = await prisma.product.findUnique({
    where: { id: Number.parseInt(req.params.id, 10) },
  });
  if (!product || !product.isActive) return next(new AppError('Product not found.', 404));
  success(res, await serializeProductImage(product));
});

// ─── POST /api/products (SUPER_ADMIN only) ────────────────────────────────────
exports.create = catchAsync(async (req, res) => {
  const { name, description, price, stock, category, imageUrl } = req.body;
  const normalizedCategory = category.toUpperCase();
  const uploadedImageUrl = req.file ? await uploadProductImageToMinio({ file: req.file, category: normalizedCategory }) : null;

  const data = {
    name,
    description,
    price: Number.parseFloat(price),
    stock: Number.parseInt(stock, 10) || 0,
    category: normalizedCategory,
    imageUrl: uploadedImageUrl || imageUrl || null,
  };

  let product;
  try {
    product = await prisma.product.create({ data });
  } catch (error) {
    if (!isUniqueIdConflict(error)) throw error;

    // Seeded rows can leave the backing Postgres sequence behind the max Product.id.
    await syncAutoincrementSequence('Product');
    product = await prisma.product.create({ data });
  }

  success(res, await serializeProductImage(product), 201, 'Product created');
});

// ─── PUT /api/products/:id (SUPER_ADMIN only) ─────────────────────────────────
exports.update = catchAsync(async (req, res, next) => {
  const productId = Number.parseInt(req.params.id, 10);
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) return next(new AppError('Product not found.', 404));
  const nextCategory = req.body.category != null ? req.body.category.toUpperCase() : existing.category;

  const data = {};
  if (req.body.name        != null) data.name        = req.body.name;
  if (req.body.description != null) data.description = req.body.description;
  if (req.body.price       != null) data.price       = Number.parseFloat(req.body.price);
  if (req.body.stock       != null) data.stock       = Number.parseInt(req.body.stock, 10);
  if (req.body.category    != null) data.category    = nextCategory;
  if (req.body.imageUrl    != null) data.imageUrl    = req.body.imageUrl;
  if (req.body.isActive    != null) data.isActive    = Boolean(req.body.isActive);
  if (req.file) data.imageUrl = await uploadProductImageToMinio({ file: req.file, category: nextCategory });

  const product = await prisma.product.update({ where: { id: productId }, data });
  success(res, await serializeProductImage(product));
});

// ─── DELETE /api/products/:id (SUPER_ADMIN only) ──────────────────────────────
exports.remove = catchAsync(async (req, res, next) => {
  const productId = Number.parseInt(req.params.id, 10);
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) return next(new AppError('Product not found.', 404));

  // Soft delete
  await prisma.product.update({ where: { id: productId }, data: { isActive: false } });
  success(res, null, 200, 'Product removed');
});
