# Backend Authentication

## Components
- Controller: `backend/src/controllers/auth.controller.js`
- Guard: `backend/src/middleware/auth.middleware.js`
- Role enforcement: `backend/src/middleware/rbac.middleware.js`
- Storage: `RefreshToken` model in Prisma schema

## Login/Signup
- Validates credentials and payload.
- Hashes passwords with bcrypt.
- Returns `accessToken` + `refreshToken`.
- Persists refresh token with explicit expiry.

## Access Token Verification
- `protect` middleware:
  - reads bearer token
  - verifies JWT
  - loads active user record
  - attaches sanitized `req.user`

## Refresh Lifecycle
- `/auth/refresh` validates refresh token JWT + DB row.
- Rotates refresh token transactionally (delete old, create new).

## Revocation
- `/auth/logout`: remove one token
- `/auth/logout-all`: remove all tokens for user
- Password reset and deactivation paths revoke all tokens

## Security Notes
- Keep JWT secrets and expiries in environment.
- Enforce short access token TTL and controlled refresh TTL.
- Ensure clients actually use refresh route to avoid poor UX on expiry.
