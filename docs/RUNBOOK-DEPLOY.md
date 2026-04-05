# Runbook — triển khai NovaLimo

## Biến môi trường

- Sao chép [.env.example](../.env.example); **không** commit `.env` production.
- `JWT_SECRET`: xoay định kỳ; khác nhau mỗi môi trường.
- `DATABASE_URL`: PostgreSQL + PostGIS.
- `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL`: kết thúc `/api`.

## Docker

- `npm run docker:stack` — xem [docker-compose.stack.yml](../docker-compose.stack.yml) và [docker/Dockerfile.api](../docker/Dockerfile.api).

## Socket

- Client: `getSocketOriginFromApiBaseUrl()` — kết nối `io(origin + '/realtime')` (không gắn `/api`).

## Backup

- Backup Postgres định kỳ; thử restore trên staging trước khi production.

## Smoke HTTP

- API chạy: `API_BASE_URL=https://host/api node tools/verify-integration.mjs`

## E2E (Playwright)

- Cần web-booking (hoặc URL khác): `E2E_BASE_URL=http://127.0.0.1:3001 npm run test:e2e`
