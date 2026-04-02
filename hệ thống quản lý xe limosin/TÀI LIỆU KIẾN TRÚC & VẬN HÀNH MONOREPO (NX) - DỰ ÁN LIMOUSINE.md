Dưới đây là tài liệu kỹ thuật hoàn chỉnh và chuẩn mực cho hệ thống Monorepo quản lý dự án Limousine của bạn, sử dụng công cụ Nx. Tài liệu này được thiết kế để bạn (hoặc bất kỳ lập trình viên nào gia nhập team sau này) có thể đọc hiểu toàn bộ bức tranh hệ thống, cách các dự án giao tiếp với nhau và cách vận hành mã nguồn một cách trơn tru nhất.

Đặc biệt với thế mạnh về Frontend (Next.js, React), bạn sẽ thấy kiến trúc này tổ chức các UI component và State management cực kỳ gọn gàng và có tính tái sử dụng cao.

---

# TÀI LIỆU KIẾN TRÚC & VẬN HÀNH MONOREPO (NX) - DỰ ÁN LIMOUSINE

## 1. Tổng quan Kiến trúc (Architecture Overview)

Dự án sử dụng kiến trúc **Integrated Monorepo** quản lý bởi Nx. Thay vì tách rời thành 4 kho chứa mã nguồn (repositories) khác nhau, toàn bộ hệ thống được đặt trong một thư mục gốc duy nhất.

**Mục tiêu cốt lõi:**

- **Single Source of Truth (Một nguồn sự thật duy nhất):** Quản lý chung một file `package.json` cho toàn bộ hệ thống, tránh xung đột phiên bản thư viện giữa Frontend và Backend.

- **Code Sharing (Chia sẻ mã nguồn tối đa):** Tái sử dụng các Interface/Type (như `TripRun`, `Booking`), các hàm tiện ích (tính toán khoảng cách Google Maps) và các React Components giữa Web Admin, Web Booking và Mobile App.

- **End-to-End Type Safety:** Khi Backend thay đổi cấu trúc API trả về, Frontend và Mobile App sẽ lập tức báo lỗi ngay lúc biên dịch (compile time), ngăn chặn lỗi phát sinh (runtime errors) ở môi trường thật.

---

## 2. Cấu trúc Thư mục Chi tiết (Directory Structure)

Thư mục gốc `limousine-workspace` được chia làm 2 phân vùng logic chính: **Apps** (Ứng dụng chạy độc lập) và **Libs** (Thư viện dùng chung).

Plaintext

```
limousine-workspace/
├── apps/
│   ├── web-booking/        # [Next.js] App 1: Website đặt vé cho khách hàng
│   ├── web-admin/          # [Next.js] App 2: CMS quản trị điều hành, cấu hình chuyến
│   ├── app-driver/         # [Expo/React Native] App 3: Mobile app cho tài xế
│   └── api-server/         # [NestJS/Node.js] App 4: Backend API, Thuật toán VRP, Socket.io
│
├── libs/
│   ├── shared-types/       # [TypeScript] Chứa các Entity, DTOs (Data Transfer Objects)
│   ├── shared-ui/          # [React] Các UI Component dùng chung (Button, Form, Table)
│   ├── utils-map/          # [JS/TS] Logic tính toán khoảng cách OSRM, gọi Google Maps API
│   └── utils-core/         # [JS/TS] Logic format tiền tệ (VND), format ngày tháng
│
├── nx.json                 # Cấu hình cache, task runner của Nx
├── package.json            # File quản lý thư viện duy nhất cho CẢ 4 apps
├── tsconfig.base.json      # File mapping đường dẫn import (Path Aliases)
└── README.md               # Tài liệu dự án
```

---

## 3. Luồng chia sẻ dữ liệu (Dependency Flow)

Để đảm bảo kiến trúc không bị rác (circular dependencies), dự án tuân thủ luồng phụ thuộc một chiều như sau:

1. **`libs/shared-types`**: Nằm ở tầng thấp nhất. Chứa định nghĩa cấu trúc dữ liệu tĩnh. Cả `apps` và các `libs` khác đều có thể gọi nó.

2. **`libs/shared-ui`**: Kế thừa `shared-types`. Chỉ được sử dụng bởi `web-admin` và `web-booking` (vì React Native dùng thẻ UI khác với Web).

3. **`apps/*`**: Nằm ở tầng cao nhất. Nhập (Import) các thư viện từ `libs/` để ráp thành tính năng hoàn chỉnh. Các app **tuyệt đối không** import code chéo của nhau (VD: `web-admin` không được import file trực tiếp từ thư mục `api-server`).

**Ví dụ thực tế về sức mạnh của chia sẻ Type:**

Tại file `libs/shared-types/src/lib/trip.type.ts`:

TypeScript

```
export interface TripRun {
  id: string;
  vehicle_id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'FINISHED';
  passengers: number;
}
```

Tại `api-server`, `web-admin`, và `app-driver`, bạn đều lấy ra sử dụng thông qua alias chuẩn của Nx:

TypeScript

```
import { TripRun } from '@limo/shared-types';
```

---

## 4. Hướng dẫn Vận hành Dành cho Lập trình viên

### 4.1. Cài đặt lần đầu

Kéo mã nguồn về và cài đặt toàn bộ thư viện:

Bash

```
npm install
```

### 4.2. Khởi chạy Ứng dụng (Development Mode)

Nx cung cấp các lệnh cực kỳ mạnh mẽ để chạy các project.

- **Chạy từng App đơn lẻ:**
  
  Bash
  
  ```
  npx nx serve api-server
  npx nx serve web-admin
  npx nx serve app-driver  # Khởi động Expo Metro Bundler
  ```

- **Chạy đồng thời nhiều App (Cực kỳ hữu ích khi dev full-flow):**
  
  Bash
  
  ```
  npx nx run-many --target=serve --projects=api-server,web-admin,web-booking
  ```

### 4.3. Xây dựng bản Production (Build)

Khi chuẩn bị deploy lên server (VD: Vercel, AWS):

Bash

```
npx nx build api-server
npx nx build web-admin
```

---

## 5. Quy trình Mở rộng Mã nguồn (Generators)

Khi cần thêm một tính năng dùng chung mới, đừng tạo thư mục bằng tay. Hãy dùng Nx Generators để hệ thống tự động cập nhật file `tsconfig.base.json` và liên kết đúng chuẩn:

**Tạo một thư viện UI Component mới:**

Bash

```
npx nx g @nx/react:library map-components --directory=libs/map-components
```

Sau lệnh này, bạn có thể tạo một component "Bản đồ hiển thị lộ trình" và lập tức dùng nó ở cả trang Đặt vé lẫn trang Admin bằng cú pháp: `import { MapRoute } from '@limo/map-components';`.

---

Với bộ tài liệu này, cấu trúc Monorepo của bạn đã sẵn sàng để phát triển thực tế. Bước tiếp theo, bạn có muốn chúng ta đi sâu vào việc viết cấu trúc thư mục cụ thể cho phần **`api-server` (Backend NestJS)** để xử lý triệt để thuật toán chia nhóm 10 khách/xe không?
