# Scalability Considerations

## Current Strengths
- Clear module separation in backend routes/controllers/middleware.
- Prisma ORM with typed schema and relational integrity.
- Transaction usage in stock-critical order creation.

## Current Bottlenecks
- No queue/background worker for async jobs (notifications, renewals, media processing).
- No distributed cache layer for hot reads/rate-limited operations.
- No websocket/realtime channel for live updates.
- Limited observability instrumentation (metrics/traces absent).

## Scaling Priorities
1. Add metrics + tracing + request IDs.
2. Introduce job queue for non-request-bound work.
3. Add caching strategy for high-read entities (plans/products/dashboards).
4. Externalize file upload processing and signed URL management for high volume.
5. Introduce API versioning discipline before RN rollout.

## Mobile/RN Impact
- RN app should assume backend remains REST-first and eventually consistent for some domains.
- Client-side cache invalidation rules should be explicit (TanStack Query recommended in migration docs).
