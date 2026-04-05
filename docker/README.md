# Docker — NovaLimo (API + Next.js)

## Schema DB trong Docker (`relation "vehicles" does not exist`)

Stack compose đặt `NODE_ENV=production` → TypeORM **tắt `synchronize`** mặc định, nên không tự tạo bảng nếu chưa chạy migration đầy đủ.

- **`docker-compose.stack.yml`** đặt `TYPEORM_SYNCHRONIZE=true` cho service `api` để tự tạo schema từ entity (phù hợp môi trường compose local).
- **Production thật:** dùng `TYPEORM_SYNCHRONIZE=false`, chạy migration có kiểm soát, không bật synchronize.

Code đọc biến trong `database.module.ts` (`resolveSynchronize`).

## Lỗi `npm ci` / `Missing: yaml@… from lock file`

`npm ci` chỉ chạy được khi **`package-lock.json` trùng khớp hoàn toàn** với `package.json`. Nếu lock lệch (sau khi sửa dependency, hoặc dùng npm khác phiên bản), build Docker sẽ báo lỗi.

- **Trên máy dev:** chạy `npm install` ở root repo rồi commit lại `package-lock.json` nếu có thay đổi.
- **Dockerfile** dùng `npm install` thay cho `npm ci` ở bước cài dependency gốc để tránh lỗi lock lệch trong monorepo (build hơi chậm hơn một chút, vẫn ổn định).

## Stack Compose

File **`docker-compose.stack.yml`** bổ sung cho `docker-compose.yml` gốc:

- **`postgres`** — từ compose gốc (PostGIS).
- **`api`** — image build từ `docker/Dockerfile.api`.
- **`web-booking`**, **`web-admin`** — image build từ `docker/Dockerfile.next` với `NX_APP` khác nhau.

```bash
docker compose -f docker-compose.yml -f docker-compose.stack.yml up --build
```

## Build từng image

```bash
# API
docker build -f docker/Dockerfile.api -t novalimo-api .

# Web booking (URL API mà trình duyệt dùng — build-time)
docker build -f docker/Dockerfile.next --build-arg NX_APP=web-booking --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000/api -t novalimo-booking .

# Web admin
docker build -f docker/Dockerfile.next --build-arg NX_APP=web-admin --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000/api -t novalimo-admin .
```

## Biến môi trường (stack)

| Biến | Mô tả |
|------|--------|
| `JWT_SECRET` | Bắt buộc đổi trên production (compose đọc từ môi trường host hoặc `.env`). |
| `NEXT_PUBLIC_API_URL` | URL public tới API có `/api` — **build-arg** khi build image Next; mặc định `http://localhost:3000/api`. |
| `OSRM_BASE_URL` | Tuỳ chọn; nếu chạy OSRM (profile `osrm` trong compose gốc), trỏ tới host/port đạt được từ container `api`. |

## OSRM cùng stack

Bật service OSRM từ compose gốc (cần file `.osrm` trong `tools/osrm-data/`), rồi set `OSRM_BASE_URL` cho container `api` (ví dụ `http://host.docker.internal:5000` trên Docker Desktop, hoặc thêm service `osrm` vào cùng network và dùng `http://osrm:5000`).
