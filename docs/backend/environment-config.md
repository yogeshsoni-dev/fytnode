# Environment Configuration

## Backend Environment Variables (observed usage)
- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `FRONTEND_URL`
- `MINIO_ENDPOINT`
- `MINIO_BUCKET_NAME`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_PUBLIC_BASE_URL`
- `MINIO_USE_SSL`
- `MINIO_SUPPLEMENTS_PREFIX`
- `MINIO_GYMPRODUCTS_PREFIX`

## Runtime Notes
- `server.js` sets `NODE_EXTRA_CA_CERTS` before Prisma connect.
- `app.js` configures CORS using `FRONTEND_URL` (comma-separated origins).

## Operational Recommendations
- Keep separate `.env` sets per environment.
- Do not hardcode local URLs in production.
- Rotate JWT and storage credentials regularly.
