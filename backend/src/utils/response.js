'use strict';

exports.success = (res, data, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({ success: true, message, data });
};

exports.paginated = (res, data, total, page, limit) => {
  res.status(200).json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};
