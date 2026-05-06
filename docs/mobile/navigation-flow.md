# Navigation Flow

## Route Graph
```mermaid
flowchart TD
  A[Splash] --> B[Onboarding]
  B --> C[Login]
  C --> D[Signup]
  C --> E[Dashboard/Home]
  E --> F[Territory]
  E --> G[Community]
  E --> H[Profile]
  H --> C
```

## Source of Truth
- `fan/navigation/AppNavHost.kt`
- feature route declarations:
  - `feature/splash/SplashNavigation.kt`
  - `feature/onboarding/.../OnboardingNavigation.kt`
  - `feature/login/LoginNavigation.kt`
  - `feature/signup/SignupNavigation.kt`
  - `feature/home/HomeNavigation.kt`
  - `feature/profile/presentation/ProfileScreen.kt`

## Behavior Notes
- Start destination is splash.
- Splash currently emits onboarding unconditionally (`SplashViewModel`).
- Bottom nav routes: `home`, `territory`, `community`, `profile`.
- Back from non-home tabs returns to home via `BackHandler`.
