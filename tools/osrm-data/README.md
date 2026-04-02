# OSRM data cho Docker

Service `osrm` trong `docker-compose.yml` (profile `osrm`) mount thư mục này vào `/data` và chạy `osrm-routed` với file `map.osrm`.

## Chuẩn bị nhanh (ví dụ khu vực nhỏ)

1. Tải `.osm.pbf` từ [Geofabrik](https://download.geofabrik.de/) (ví dụ `vietnam-latest.osm.pbf`).
2. Trên máy có Docker, chạy pipeline OSRM (extract, partition, customize) theo [wiki OSRM](https://github.com/Project-OSRM/osrm-backend/wiki/Running-OSRM).
3. Đặt file kết quả `map.osrm` (và các file đi kèm cùng prefix) vào thư mục này.

Khi chưa có map, để `OSRM_BASE_URL` trống hoặc không chạy profile `osrm`: API sẽ dùng khoảng cách Haversine làm fallback.

## Chạy OSRM

```bash
docker compose --profile osrm up -d osrm
```
