# AI Integrations

## Status
No direct AI service integration is implemented inside `backend`.

## Observed Context
- AI endpoint usage appears in web client (`user-app`) proxy configuration, not in backend server modules.
- Backend remains domain API focused (auth, gyms, users, attendance, commerce).

## Recommended Future Approach
- Add AI as an isolated backend service module when needed:
  - separate route namespace (for example `/api/ai/*`)
  - strict request quotas and audit logging
  - prompt/data redaction policy
  - fallback behavior when model provider is unavailable
