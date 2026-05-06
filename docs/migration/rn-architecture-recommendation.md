# RN Architecture Recommendation

## Recommendation
Use a feature-first, layered architecture:
- `core`: shared infrastructure (api/auth/storage/config/ui)
- `features`: domain features with local screens/hooks/models
- `services`: external integrations (analytics, upload, ai)

## Data Strategy
- TanStack Query for server state and caching
- Zustand for minimal app/UI state
- form state localized with React Hook Form

## Dependency Direction
`features` -> `core` (allowed)  
`core` -> `features` (forbidden)

## Migration-Safe Principles
- Keep API contracts explicit and typed.
- Centralize auth token logic and refresh queue.
- Prefer adapters to isolate backend DTO drift.
