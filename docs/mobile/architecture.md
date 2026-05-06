# Android Architecture

## Module Map
- App shell: `fan`
- Shared: `core:common`, `core:domain`, `core:data`, `core:network`, `core:database`, `core:store`, `core:ui`, `core:designsystem`
- Features: `feature:login`, `feature:signup`, `feature:splash`, `feature:onboarding`, `feature:home`, `feature:profile`, `feature:checkin`

## Architectural Style
- MVVM per feature
- Use-case orchestration in `core:domain`
- Repositories primarily in `core:data`
- Hilt DI graph across modules

## Coupling Hotspots
- `feature:checkin` uses `UserDao` directly (feature-level data coupling)
- `feature:home` depends on `feature:checkin`
- startup domain path exists but splash hardcodes onboarding

## Preserve During Migration
- ViewModel-level validation semantics
- sequence of login -> token store -> profile sync
- check-in state machine and role-specific payload behavior
