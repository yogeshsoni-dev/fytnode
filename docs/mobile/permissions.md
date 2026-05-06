# Permissions

## Manifest Permissions in Current App
- `android.permission.INTERNET` (`fan/src/main/AndroidManifest.xml`)

## Security-Related Manifest Flags
- `android:usesCleartextTraffic="true"` (currently enabled)

## Operational Notes
- Current app does not request camera, location, storage, or notifications permissions.
- Cleartext traffic should be disabled for production-grade environments and replaced with HTTPS-only transport.

## RN Migration Notes
- Start from least-privilege permission model.
- Add permissions only when a feature requires it, with explicit product/security approval.
