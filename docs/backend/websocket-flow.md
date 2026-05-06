# Websocket Flow

## Status
No websocket/realtime transport is currently implemented in the backend codebase.

## Evidence
- No socket server bootstrap in `backend/server.js`.
- No websocket route/service modules under `backend/src`.
- Communication model is request-response REST only.

## If Realtime Is Added Later
- Add explicit transport boundary docs:
  - connection auth model
  - room/topic naming rules
  - event versioning and payload schema
  - backpressure and reconnection behavior
