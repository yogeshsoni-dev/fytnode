# Auth Strategy (RN)

## Session Model
- Access token in `expo-secure-store`
- Refresh token handling aligned with backend `/auth/refresh`
- Optional in-memory token mirror for performance

## Flow
```mermaid
flowchart TD
  A[Login] --> B[Persist tokens securely]
  B --> C[Call /auth/me]
  C --> D[Cache profile + role context]
  D --> E[App usable]
  E --> F[401]
  F --> G[Refresh token flow]
  G --> H{Success?}
  H -- Yes --> E
  H -- No --> I[Clear session + navigate auth]
```

## Preserve from Android
- Validation and user-visible error semantics.
- Post-login profile sync before role-sensitive actions.
- Logout should clear local caches and call backend revocation endpoints.
