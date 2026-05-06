# Native Module Strategy

## Default Policy
Stay in Expo-managed capabilities unless a requirement forces custom native integration.

## Candidate Native Needs
- Advanced camera/media processing
- custom BLE/sensor support
- specialized background services

## Decision Gate
Before adding custom native code:
1. Confirm product necessity.
2. Verify Expo alternative.
3. Estimate maintenance and CI burden.
4. Record decision in migration ADR.
