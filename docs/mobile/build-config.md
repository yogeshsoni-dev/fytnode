# Build Configuration

## Build System
- Gradle Kotlin DSL multi-module project.
- Root config: `mobile/fytnodes_android/build.gradle.kts`
- Module graph: `mobile/fytnodes_android/settings.gradle.kts`

## App Module
- `fan/build.gradle.kts` configures:
  - compile/target SDK 35
  - min SDK 26
  - compose enabled
  - Hilt + KSP

## Network Config
- API base URL injected via `buildConfigField` in `core/network/build.gradle.kts`.

## Risk Areas
- Hardcoded local IP URL in build config.
- Room destructive migration fallback in `core/data/di/DatabaseModule.kt`.
