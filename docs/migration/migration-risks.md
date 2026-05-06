# Migration Risks

## Functional Risks
- Losing subtle auth/profile/check-in behavior parity.
- Changing startup routing behavior unintentionally.
- Breaking role-specific payload rules.

## Technical Risks
- Incomplete refresh-token handling causes frequent logouts.
- Environment misconfiguration across dev/staging/prod.
- Divergent error mapping leads to inconsistent UX.

## Operational Risks
- OTA updates introducing contract drift with backend.
- Limited telemetry masking rollout regressions.

## Mitigations
- Maintain explicit parity test matrix.
- Add contract tests against backend critical endpoints.
- Use staged rollout channels and kill switches.
