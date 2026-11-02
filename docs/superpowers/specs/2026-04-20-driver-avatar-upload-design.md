# NovaLimo Admin — Upload avatar tài xế (local disk)

## Mục tiêu

- Cho phép admin **crop vuông** và **upload avatar** khi tạo tài xế mới.
- File được lưu **local disk** trong `api-server` và được serve qua URL tĩnh.
- Bảo vệ endpoint upload bằng **Admin JWT** (role `ADMIN`).

## Ràng buộc

- Định dạng: **JPG/PNG/WEBP**
- Dung lượng tối đa: **5MB**
- Crop: **vuông 1:1** ở web-admin (client-side) trước khi upload.

## Backend (api-server)

### Endpoint upload

- `POST /api/admin/uploads/avatar`
  - Guard: `AdminJwtGuard`
  - Input: `multipart/form-data` field `file`
  - Validate:
    - mime: `image/jpeg`, `image/png`, `image/webp`
    - size <= 5MB
  - Storage:
    - Base dir: `process.env.UPLOADS_DIR ?? <repo>/uploads`
    - Avatar dir: `<base>/avatars`
    - Filename: `<uuid>.<ext>`
  - Response:

```json
{ "url": "/api/uploads/avatars/<filename>" }
```

### Serve static

- Mount static: `GET /api/uploads/*` -> serve from `<base>`
- Rationale: trả URL cùng domain API, đơn giản để web-admin hiển thị preview.

## Frontend (web-admin)

### UX/UI

- Khu vực “Ảnh đại diện”:
  - Nút “Tải ảnh” → mở chọn file
  - Crop vuông 1:1
  - Upload progress (loading trạng thái nút)
  - Upload xong: preview ảnh trong vòng tròn avatar
  - Nút “Xóa ảnh” (reset về placeholder)

### Kỹ thuật

- Dùng `antd-img-crop` bọc AntD `Upload`.
- Dùng `customRequest` + `authFetch()` để gắn `Authorization: Bearer <token>`.
- Nhận response `{ url }`, chuyển thành absolute URL bằng `new URL(url, getApiBaseUrl()).toString()`.

## Tiêu chí nghiệm thu

- Upload chỉ nhận JPG/PNG/WEBP và chặn file > 5MB.
- Endpoint yêu cầu admin token; không có token → 401.
- Preview avatar hiển thị ngay sau upload.
- Không phát sinh lỗi lint/typescript ở các file chỉnh sửa.

