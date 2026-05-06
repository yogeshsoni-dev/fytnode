# Services and Modules

## Route-to-Controller Mapping
- `auth.routes.js` -> `auth.controller.js`
- `gym.routes.js` -> `gym.controller.js`
- `member.routes.js` -> `member.controller.js`
- `trainer.routes.js` -> `trainer.controller.js`
- `user.routes.js` -> `user.controller.js`
- `attendance.routes.js` -> `attendance.controller.js`
- `subscription.routes.js` -> `subscription.controller.js`
- `notification.routes.js` -> `notification.controller.js`
- `product.routes.js` -> `product.controller.js`
- `order.routes.js` -> `order.controller.js`

## Middleware Responsibilities
- `auth.middleware.js`: authentication
- `rbac.middleware.js`: authorization and gym scope helper
- `validate.middleware.js`: request validation envelope
- `upload.middleware.js`: file type/size guarding
- `error.middleware.js`: global error translation

## Utility Responsibilities
- `prismaClient.js`: Prisma singleton
- `objectStorage.js`: MinIO upload + URL resolution
- `response.js`: success/pagination helpers
- `sequence.js`: sequence repair for seeded-id conflicts
