# Technical Debt Register

## High Priority

| Area | Debt | Risk |
|---|---|---|
| Android startup | Session-aware startup use case exists but splash always routes onboarding | Behavior mismatch and migration ambiguity |
| Token lifecycle | Backend supports refresh rotation, Android largely access-token-only | Session fragility and forced relogin |
| Backend responses | Inconsistent response schema across some endpoints | Client parsing complexity |
| Order status | Cancel path does not restore stock | Inventory drift |

## Medium Priority
- Hardcoded Android API base URL in build config.
- Parallel/unused architecture paths (`SignupRepositoryImpl`, unused session DAO path).
- Limited cleanup on client logout (profile cache persistence risk).
- `fallbackToDestructiveMigration()` in Android Room DB module.

## Debt Control Plan
- Add architecture decision records (ADRs) for auth, storage, and API schema.
- Enforce API response contracts in tests.
- Introduce shared error envelope and endpoint contract documentation.
- Implement migration parity tests for preserved business flows.
