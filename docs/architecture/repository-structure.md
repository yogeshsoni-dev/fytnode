# Repository Structure

## Top-Level Modules

| Path | Responsibility | Key Entrypoint |
|---|---|---|
| `backend` | Shared REST API, auth, DB, uploads | `backend/server.js` |
| `frontend` | Admin dashboard web app | `frontend/src/index.js` |
| `user-app` | User/member web app | `user-app/src/main.jsx` |
| `mobile/fytnodes_android` | Native Android app | `fan/src/main/java/com/fytnodes/fan/MainActivity.kt` |

## Backend Internal Layout
- `src/app.js`: middleware pipeline + `/api` mounting
- `src/routes/*`: route-level auth/validation wiring
- `src/controllers/*`: business logic
- `src/middleware/*`: `protect`, `restrictTo`, validation, errors, upload
- `src/utils/*`: Prisma singleton, object storage, response helpers
- `prisma/schema.prisma`: canonical data model

## Android Internal Layout
- `fan`: app shell, nav host, Hilt app
- `core:domain`: use cases + repository contracts
- `core:data`: repository implementations + API DTOs
- `core:network`: Retrofit/OkHttp stack
- `core:database`: Room entities/DAO
- `core:store`: DataStore-backed session store
- `feature:*`: screen-level modules (login/signup/home/profile/checkin)

## Documentation Navigation
- Architecture docs: `docs/architecture`
- Backend implementation docs: `docs/backend`
- Current Android docs: `docs/mobile`
- RN migration strategy docs: `docs/migration`
