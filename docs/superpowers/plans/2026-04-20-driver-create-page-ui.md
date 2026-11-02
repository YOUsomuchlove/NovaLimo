# Driver Create Page UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder “Tạo tài xế” page with a pixel-faithful dark UI matching the provided mock screenshot.

**Architecture:** Implement the page as a single client component using Ant Design primitives (Form/Input/Select/Button) but fully skinned with scoped Tailwind utility classes, following the existing `FleetManagementView` styling patterns. Keep changes isolated to this page (and a narrowly-scoped global CSS tweak only if needed for dropdown popups).

**Tech Stack:** Next.js App Router, React, Ant Design, Tailwind v4, `@limousine-workspace/shared-ui` (`AdminShell`, `AdminDarkPanel`).

---

## File map

- Modify: `apps/web-admin/src/app/vehicles/drivers/new/page.tsx`
  - Implement header actions (Cancel / Create)
  - Implement 2-column layout + avatar placeholder + dark form card
  - Apply scoped Tailwind class skin to AntD inputs/selects/buttons
- (Optional) Modify: `apps/web-admin/src/app/global.css`
  - Add a narrowly-scoped dark popup skin for select dropdowns used on this page only

---

### Task 1: Locate shared admin UI patterns

**Files:**
- Read: `apps/web-admin/src/components/vehicles/FleetManagementView.tsx`
- Read: shared-ui `AdminShell` usage across pages

- [ ] **Step 1: Search for `AdminShell` props usage**
  - Identify how to render header right-side actions (`headerExtra`) and subtitle.
- [ ] **Step 2: Find existing dark panel/card component**
  - Prefer `AdminDarkPanel` from shared-ui for consistent dark surfaces.

---

### Task 2: Implement Driver Create page UI

**Files:**
- Modify: `apps/web-admin/src/app/vehicles/drivers/new/page.tsx`

- [ ] **Step 1: Replace placeholder content with new layout**
  - `AdminShell` title: “Tạo tài xế mới”
  - `AdminShell` subtitle: “Tạo hồ sơ và tài khoản đăng nhập ứng dụng cho tài xế”
  - Header actions:
    - Cancel button (ghost/dark)
    - Create button (gold primary)
- [ ] **Step 2: Build 2-column responsive layout**
  - Left: avatar placeholder circle + label “Ảnh đại diện”
  - Right: section title + subtext + dark form card
- [ ] **Step 3: Build form groups**
  - “Thông tin liên hệ”: Full name, phone, email
  - “Tài khoản ứng dụng”: username, password (password type)
  - “Trạng thái tài khoản”: select
  - “App Mobile”: select
  - “Ghi chú”: textarea
- [ ] **Step 4: Style AntD components to match mock**
  - Inputs/selects: height ~40, rounded ~12, dark bg `white/5`, border `white/10`
  - Buttons: match existing gold + ghost style

---

### Task 3: Fix dropdown popup theming (if needed)

**Files:**
- (Optional) Modify: `apps/web-admin/src/app/global.css`

- [ ] **Step 1: Verify select dropdowns render dark**
  - If popup is white, add a page-scoped class to the page root (e.g. `driver-create-page`)
  - Add CSS to theme `.ant-select-dropdown` under that scope:
    - dark background, border `white/10`, item hover/selected states

---

### Task 4: Verification

**Files:**
- Lint: `apps/web-admin/src/app/vehicles/drivers/new/page.tsx`

- [ ] **Step 1: Run lints for the edited file**
  - Use editor lint (or `ReadLints`) and fix any issues.
- [ ] **Step 2: Quick manual check**
  - Ensure layout matches mock: header actions present, 2-column layout, dark card and fields, password input hides characters.

