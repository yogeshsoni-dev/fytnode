# State Management Strategy

## Split by Concern
- **Server state:** TanStack Query
- **App/session/UI orchestration:** Zustand
- **Forms:** React Hook Form + Zod

## Why
- Avoid monolithic global state.
- Keep cache invalidation tied to API queries.
- Keep business state testable and feature-scoped.

## Migration Mapping
- Android ViewModel transient state -> local feature state/hooks.
- Room/DataStore caches -> secure storage + query cache + optional local DB when needed.
