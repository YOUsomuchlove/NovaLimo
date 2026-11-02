# Driver Avatar Upload (Local Disk) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an authenticated admin endpoint to upload driver avatars to local disk and update the web-admin “Create Driver” page to crop, upload, and preview the avatar.

**Architecture:** NestJS handles multipart upload using `FileInterceptor` (diskStorage). Static files are served under `/api/uploads/*`. Web-admin uses AntD `Upload` with `antd-img-crop` and `authFetch()` for Bearer auth.

**Tech Stack:** NestJS, Express static, Multer, Next.js, Ant Design, Tailwind, `antd-img-crop`.

---

## File map

- Create: `apps/api-server/src/app/admin/admin-uploads.controller.ts`
- Modify: `apps/api-server/src/app/admin/admin.module.ts`
- Modify: `apps/api-server/src/main.ts`
- Modify: `apps/web-admin/src/app/vehicles/drivers/new/page.tsx`
- Modify: `package.json` (add `antd-img-crop`)
- Modify: `.gitignore` (ignore `uploads/`)

---

### Task 1: Backend upload endpoint

**Files:**
- Create: `apps/api-server/src/app/admin/admin-uploads.controller.ts`
- Modify: `apps/api-server/src/app/admin/admin.module.ts`

- [ ] **Step 1: Create controller with guarded upload route**
  - Route: `POST /admin/uploads/avatar`
  - Guard: `AdminJwtGuard`
  - Interceptor: `FileInterceptor('file', ...)`
  - Validate mime + size and return `{ url }`
- [ ] **Step 2: Ensure upload dirs exist**
  - Create `<uploads>/avatars` with `mkdirSync({ recursive: true })`
- [ ] **Step 3: Wire controller into `AdminModule`**

---

### Task 2: Serve static uploads

**Files:**
- Modify: `apps/api-server/src/main.ts`

- [ ] **Step 1: Mount express static**
  - `app.use('/api/uploads', express.static(UPLOADS_DIR))`
  - Ensure this matches response URLs.

---

### Task 3: Frontend avatar crop + upload + preview

**Files:**
- Modify: `apps/web-admin/src/app/vehicles/drivers/new/page.tsx`
- Modify: `package.json`

- [ ] **Step 1: Add dependency**
  - Install `antd-img-crop`
- [ ] **Step 2: Add Upload block**
  - Crop 1:1
  - Validate types and size on client as well
  - Upload via `customRequest` with `authFetch()`
  - Store resulting URL and preview inside avatar circle
  - Add “Xóa ảnh” action

---

### Task 4: Verification

- [ ] **Step 1: Lint**
  - Run: `npx nx run web-admin:lint`
  - Run: `npx nx run api-server:lint` (if target exists)
- [ ] **Step 2: Quick manual**
  - Start API + admin, login, upload an image, see preview, verify 401 without token.

