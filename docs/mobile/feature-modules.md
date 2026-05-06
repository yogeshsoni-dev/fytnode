# Feature Modules

## Active Feature Responsibilities

| Module | Responsibility | Key Files |
|---|---|---|
| `feature:splash` | initial transition | `SplashViewModel.kt` |
| `feature:onboarding` | onboarding UI | `OnboardingScreen.kt` |
| `feature:login` | login UI + validation | `LoginViewModel.kt` |
| `feature:signup` | signup UI + `nextAction` handling | `SignupViewModel.kt` |
| `feature:home` | dashboard + profile sync trigger | `HomeViewModel.kt` |
| `feature:profile` | profile display + logout | `ProfileViewModel.kt` |
| `feature:checkin` | check-in/check-out API + state machine | `CheckInViewModel.kt`, `CheckInRepositoryImpl.kt` |

## Couplings to Preserve Carefully
- `home` module depends on `checkin`.
- `checkin` depends on Room user cache for role/memberId logic.
- auth/profile/cache interactions span `feature:*` and `core:*` modules.
