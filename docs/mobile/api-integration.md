# Android API Integration

## Network Stack
- Retrofit/OkHttp configured in `core/network/src/main/java/com/fytnodes/core/network/di/NetworkModule.kt`
- Base URL from `core/network/build.gradle.kts` (`BuildConfig.API_BASE_URL`)

## APIs Consumed
- Auth API: `core/data/remote/api/AuthApiService.kt`
  - `POST auth/signup`
  - `POST auth/login`
  - `GET auth/me`
- Check-in API: `feature/checkin/data/remote/CheckInApiService.kt`
  - `POST attendance/check-in`
  - `PATCH attendance/{attendanceId}/check-out`

## Integration Pattern
- ViewModel -> UseCase -> Repository -> Retrofit.
- Repositories map network errors to user-friendly messages.

## Migration Notes
- Keep API contracts stable during RN rollout.
- Replace hardcoded base URL with environment-driven config.
