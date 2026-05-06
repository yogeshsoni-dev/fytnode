# Recommended Folder Structure (RN)

```text
src/
  app/
    App.tsx
    navigation/
    providers/
  core/
    api/
    auth/
    config/
    storage/
    ui/
    utils/
  features/
    auth/
    home/
    checkin/
    profile/
    onboarding/
  services/
    analytics/
    upload/
    ai/
  types/
```

## Rules
- Feature code stays inside `features/<feature>`.
- Shared infra only in `core`.
- No direct backend DTO use in UI; map through feature adapters.
