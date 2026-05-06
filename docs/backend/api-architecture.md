# API Architecture

## Route Pattern
Each route module follows:
1. `protect` (when needed)
2. `restrictTo` (role guard)
3. request validators (`express-validator`)
4. `validate` middleware
5. controller handler

## Request Path Example
`/api/products`:
- `backend/src/routes/product.routes.js` defines guards + upload middleware
- `backend/src/controllers/product.controller.js` executes domain logic
- `backend/src/utils/objectStorage.js` resolves storage URLs

## Endpoint Inventory (high level)
- Auth: `/api/auth/*`
- Gym management: `/api/gyms/*`
- User/member/trainer management: `/api/users`, `/api/members`, `/api/trainers`
- Attendance and subscriptions: `/api/attendance`, `/api/subscriptions`
- Commerce: `/api/products`, `/api/orders`
- Notifications: `/api/notifications`

## API Contracts to Keep Stable for RN
- `/api/auth/login`, `/api/auth/signup`, `/api/auth/me`, `/api/auth/refresh`
- `/api/attendance/check-in`, `/api/attendance/:id/check-out`
- Any future mobile screens should add contract docs before UI implementation.
