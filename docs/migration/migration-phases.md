# Migration Phases

## Phase 0: Preparation
- Freeze and document mobile-critical backend contracts.
- Define parity checklist from current Android behavior.

## Phase 1: Foundations
- Scaffold Expo TS app.
- Implement navigation shell, env config, auth client, secure storage.

## Phase 2: Core Feature Parity
- Login/signup/profile sync.
- Home shell + check-in/check-out state machine.
- Error mapping parity.

## Phase 3: Hardening
- Upload/media pipeline integration (if in mobile scope).
- Instrumentation (Sentry, analytics), E2E tests.

## Phase 4: Rollout
- Internal dogfooding -> beta -> staged production.
- Monitor crash-free sessions, auth failures, check-in success rates.

## Phase 5: Sunset
- Decommission native Android client after stability and parity KPIs.
