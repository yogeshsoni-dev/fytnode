# API Communication

## Transport Contract
- Protocol: HTTP JSON REST
- Backend mount point: `/api` in `backend/src/app.js`
- Auth transport: bearer token in `Authorization` header

## Client Communication Patterns

| Client | API Client | Base URL Strategy |
|---|---|---|
| `frontend` | Axios (`frontend/src/api/client.js`) | `REACT_APP_API_URL` or local default |
| `user-app` | Axios (`user-app/src/api/client.js`) | `VITE_API_URL` or local default |
| Android | Retrofit (`core/network`) | `BuildConfig.API_BASE_URL` |

## Common Response Shape
- Success helpers use:
  - `success: true`
  - `message`
  - `data`
  - optional `meta` for pagination
- Implemented via `backend/src/utils/response.js`

## Communication Risks
- Inconsistent response formatting in some controllers (for example notification list returns custom payload format).
- Android hardcoded API base URL (`core/network/build.gradle.kts`) can drift from deployment environments.
