# Android Overview (Current Native App)

## Stack
- Kotlin + Jetpack Compose
- Hilt dependency injection
- Retrofit/OkHttp + Kotlin serialization
- Room + DataStore

## Entrypoints
- `fan/src/main/java/com/fytnodes/fan/FytNodesApplication.kt`
- `fan/src/main/java/com/fytnodes/fan/MainActivity.kt`
- Nav host: `fan/src/main/java/com/fytnodes/fan/navigation/AppNavHost.kt`

## Scope in Current App
- Auth (login/signup/profile bootstrap)
- Home dashboard and check-in card
- Profile/logout
- Placeholder routes for some tabs

## Migration Context
This app is being replaced by a new React Native implementation; its behavioral contracts are migration inputs, not long-term target architecture.
