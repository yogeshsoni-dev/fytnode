# Expo vs Bare Analysis

## Recommendation: Expo (with prebuild capability)

| Criteria | Expo | Bare RN |
|---|---|---|
| Setup speed | Fast | Slower |
| OTA updates | First-class (EAS Update) | Manual/custom |
| Native complexity | Limited but improving | Full control |
| Team onboarding | Easier | Harder |
| CI/CD complexity | Lower | Higher |

## Why Expo Fits This Migration
- Faster path to parity and rollout.
- Strong release channel control with EAS.
- Lower operational burden while replacing an existing app.

## Escalation Trigger to Bare
- Required native SDK unsupported by Expo.
- Deep background execution constraints.
- Mandatory low-level platform customizations.
