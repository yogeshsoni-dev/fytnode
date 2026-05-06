# Image Handling (Android)

## Current State
- No remote image loading stack (no Coil/Glide/Picasso usage in app modules).
- UI uses icons, placeholders, and vector assets.
- No image upload client path implemented in current Android app.

## Migration Implication
- React Native app will need to introduce:
  - remote image rendering strategy
  - caching policy
  - upload flow for backend product/media endpoints (if mobile scope includes it)

## Related Backend Contract
- Upload pipeline exists in backend (`/api/products` with multipart `image`) but is not currently used by Android client.
