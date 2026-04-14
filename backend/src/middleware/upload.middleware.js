'use strict';

const multer = require('multer');
const AppError = require('../utils/AppError');

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError('Only JPG, PNG, WEBP, and GIF images are allowed.', 400));
      return;
    }
    cb(null, true);
  },
});

function uploadProductImage(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(new AppError('Image must be 5 MB or smaller.', 400));
        return;
      }
      next(new AppError(error.message, 400));
      return;
    }

    next(error);
  });
}

module.exports = {
  uploadProductImage,
};
