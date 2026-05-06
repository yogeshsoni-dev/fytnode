# Android Technical Debt

## High-Impact Debt
- Splash flow ignores available startup/session use case and always routes onboarding.
- Refresh token lifecycle is not fully exercised by client despite backend support.
- Hardcoded API base URL and cleartext traffic configuration.
- Mixed storage consistency on logout (token cleared, profile cache may remain).

## Structural Debt
- Parallel signup repository path (`SignupRepositoryImpl`) appears stale versus active auth repository path.
- Feature-level data coupling in `feature:checkin` to Room user cache.
- `fallbackToDestructiveMigration()` may cause local data loss during schema changes.

## Migration Guidance
- Treat current app as behavior reference, not architecture template.
- Preserve business-critical UX and API semantics, but rebuild cleanly in RN.
