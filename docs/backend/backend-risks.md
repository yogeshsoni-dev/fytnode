# Backend Risks

## Contract and Behavior Risks
- Inconsistent API response envelopes across some controllers.
- Business rules encoded in controllers without domain service layer abstraction.
- Role and gym scoping relies on consistent helper usage; easy to regress on new endpoints.

## Data Integrity Risks
- Order cancellation does not clearly restore stock.
- Sequence-sync workaround indicates seeded ID/sequence drift risk.
- Timezone-sensitive attendance logic can cause boundary issues.

## Security Risks
- Refresh tokens stored as plaintext JWTs in DB.
- CORS/origin configuration errors could block clients or allow unintended origins.
- Clear operational distinction between dev/prod secrets required.

## Scalability Risks
- No background job processor for deferred workloads.
- No cache tier for high-read endpoints.
- Limited observability limits incident diagnosis.

## RN Migration Sensitivity
- Do not break auth/me and attendance endpoint semantics.
- Keep backward compatibility during staged mobile rollout.
