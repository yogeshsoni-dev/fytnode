# Storage and Cache

## Storage Layers
- DataStore (`DefaultSessionStore`):
  - `token`, `email`, `name`
- Room (`AppDatabase`):
  - `UserEntity` cache
  - `SessionEntity` (present, limited active usage)
- In-memory ViewModel state:
  - dashboard stats cache
  - check-in streak + attendance id

## Files
- `core/store/src/main/java/com/fytnodes/core/store/session/DefaultSessionStore.kt`
- `core/database/src/main/java/com/fytnodes/core/database/AppDatabase.kt`
- `core/database/src/main/java/com/fytnodes/core/database/dao/UserDao.kt`

## Offline/Caching Behavior
- No full offline sync model.
- Network failures handled per request with user-facing errors.
- Cached user profile may remain after logout unless explicitly cleared from DB.
