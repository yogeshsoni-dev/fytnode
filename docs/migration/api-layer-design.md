# API Layer Design

## Structure
- `core/api/httpClient.ts`: axios instance + interceptors
- `core/api/tokenManager.ts`: read/write secure tokens
- `features/*/api/*.ts`: feature endpoint wrappers
- `features/*/adapters/*.ts`: DTO -> domain mapping

## Request Pipeline
1. Attach access token.
2. If 401, attempt refresh once.
3. Replay queued requests after successful refresh.
4. On refresh failure, clear session and route to auth stack.

## Contract Discipline
- Keep endpoint path constants centralized.
- Parse and normalize backend error envelopes in one place.
- Add integration tests for auth and attendance endpoints.
