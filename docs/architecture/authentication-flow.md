# Authentication Flow

## Backend Auth Model
- Access token JWT: short-lived, sent in `Authorization: Bearer`
- Refresh token JWT: persisted in `RefreshToken` table
- Token services implemented in `backend/src/controllers/auth.controller.js`

## Lifecycle
```mermaid
flowchart TD
  A[Signup/Login] --> B[Issue access + refresh]
  B --> C[Store refresh in DB]
  C --> D[Client calls protected APIs]
  D --> E[protect middleware verifies access token]
  E --> F[User loaded + active check]
  F --> G[Business controller executes]
  D --> H[/auth/refresh when expired]
  H --> I[Rotate refresh token in DB]
```

## Middleware/Guards
- `backend/src/middleware/auth.middleware.js`: token verification + account activity checks
- `backend/src/middleware/rbac.middleware.js`: role-based authorization and gym scoping

## Mobile-Specific Notes
- Android currently stores access token in DataStore (`DefaultSessionStore`), uses interceptor for bearer injection, and does not fully use refresh endpoint.
- React Native migration must implement complete refresh + logout-all revocation to match backend capabilities.
