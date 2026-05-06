# Migration Overview

## Objective
Replace `mobile/fytnodes_android` with a new React Native app while reusing `backend` APIs and preserving business behavior.

## Scope
- Rebuild mobile client from scratch.
- Keep backend as primary business logic source.
- Migrate incrementally with parity checks for critical flows.

## Non-Goals
- No backend feature rewrite during initial migration.
- No direct port of Android module structure.

## Critical Parity Areas
- auth lifecycle and token semantics
- `/auth/me` profile sync timing
- role-aware attendance payload rules
- check-in/check-out state transitions
