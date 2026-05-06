# Android Authentication Flow

## Login Path
1. `LoginViewModel` validates email/password.
2. `LoginUseCase` calls `AuthRepository.login`.
3. `AuthRepositoryImpl` calls backend `POST auth/login`.
4. Access token stored in `SessionStore`.

## Profile Sync Path
1. `DashboardViewModel` triggers `SyncUserProfileUseCase`.
2. Repository calls `GET auth/me`.
3. Profile cached in Room (`UserDao.insertUser`) and DataStore (`email`, `name`).

## Logout Path
- `ProfileViewModel` clears session store and navigates to login.
- Backend token revocation endpoint is not always used in current app flow.

## Migration-Sensitive Rules
- Preserve validation/error semantics from login/signup viewmodels.
- Preserve post-login profile sync timing before role-sensitive actions.
