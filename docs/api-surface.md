# NovaLimo API surface (`apps/api-server`)

Global prefix: **`/api`** (e.g. `http://localhost:3000/api/...`).  
Socket.IO namespace: **`/realtime`** (not under `/api`).

## Public (no JWT)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api` | Health / root JSON |
| GET | `/api/trip-batches` | Optional `?status=OPEN\|CLUSTERED\|COMPLETED` |
| GET | `/api/bookings/taken-seats?trip_batch_id=` | `string[]` seat labels |
| GET | `/api/bookings?passenger_phone=` | List bookings |
| POST | `/api/bookings` | Create booking (body matches web-booking wizard) |
| GET | `/api/geocode?q=` | Nominatim proxy → `{ lat, lng, display_name }[]` |

## Auth

| Method | Path | Body |
|--------|------|------|
| POST | `/api/auth/login/admin` | `{ phone, password }` → `{ access_token }` |
| POST | `/api/auth/login/driver` | `{ phone, password }` → `{ access_token }` |

## Driver JWT (`Authorization: Bearer`)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/trips/my-runs?status=PENDING\|IN_PROGRESS\|FINISHED` | |
| GET | `/api/trips/my-runs/:id` | |
| GET | `/api/driver/shifts/current` | 204 if none |
| POST | `/api/driver/shifts/start` | |
| POST | `/api/driver/shifts/end` | |
| POST | `/api/driver/location` | `{ lat, lng }` |
| GET | `/api/cargos/my-tasks` | Cargos on this driver’s runs |

## Admin JWT

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/admin/stats` | Aggregates: trips_today, pending_bookings, vehicles_in_use, active_trip_runs |
| GET | `/api/trip-batches/:id` | |
| POST/PATCH/DELETE | `/api/trip-batches` | CRUD |
| GET | `/api/bookings/all` | List (up to 500) |
| GET/PATCH/DELETE | `/api/bookings/:id` | |
| GET/POST/PATCH/DELETE | `/api/trip-runs` | CRUD |
| GET | `/api/cargos/all` | |
| POST/PATCH | `/api/cargos` | Create / update status |
| GET | `/api/cargos/:id` | |
| POST | `/api/dispatch/assign-booking` | `{ booking_id, trip_run_id \| null }` |
| GET | `/api/finance/transactions` | |
| POST | `/api/finance/transactions` | |
| GET | `/api/customers` | CRUD via POST/PATCH/DELETE |
| GET | `/api/rbac/roles` | |
| GET | `/api/rbac/permissions` | |
| POST | `/api/rbac/audit-logs` | Append audit row |
| GET | `/api/users` | No password hash in JSON |
| GET/POST/PATCH/DELETE | `/api/vehicles` | CRUD |

## Environment

- `DATABASE_URL` — PostgreSQL connection string  
- `TYPEORM_SYNCHRONIZE=true` — dev/stack only; use migrations in production  
- `JWT_SECRET` — signing key for access tokens  

## Smoke script

With API running and DB seeded:

`API_BASE_URL=http://localhost:3000/api node tools/verify-integration.mjs`
