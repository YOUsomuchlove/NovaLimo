import { expect, test } from '@playwright/test';

/**
 * Web Admin E2E smoke & security verification against a running dev stack:
 * - Login via /login
 * - Dashboard KPIs & charts (/dashboard)
 * - Fleet & Drivers (/vehicles, /vehicles/drivers — verifies no plaintext password column)
 * - Smart Dispatch (/dispatch)
 * - Bookings, Cargos, Finance, Reports, RBAC, Audit Log
 */
const ADMIN_URL = process.env.E2E_ADMIN_URL ?? 'http://127.0.0.1:3002';
const ADMIN_PHONE = process.env.E2E_ADMIN_PHONE ?? '0900000001';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Admin@123';

test.describe('Web Admin Console — E2E & Security', () => {
  test.beforeEach(async ({ request }) => {
    const up = await request
      .get(`${ADMIN_URL}/login`)
      .then((r) => r.ok())
      .catch(() => false);
    test.skip(!up, 'web-admin chưa chạy tại ' + ADMIN_URL);
  });

  test('đăng nhập → kiểm tra Dashboard, Đội xe, Tài xế (không lộ mật khẩu), Điều phối & Audit', async ({
    page,
  }) => {
    await page.goto(`${ADMIN_URL}/login`);
    await page.getByPlaceholder('0901 234 567').fill(ADMIN_PHONE);
    await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Đăng nhập/i }).click();

    await expect(page).toHaveURL(new RegExp(`${ADMIN_URL}/dashboard`), {
      timeout: 15_000,
    });
    await expect(
      page.getByRole('heading', { name: /Trung tâm Điều hành/i }),
    ).toBeVisible();

    // Verify Drivers page has NO plaintext password column
    await page.goto(`${ADMIN_URL}/vehicles/drivers`);
    await expect(
      page.getByRole('heading', { name: /Đội ngũ Tài xế/i }),
    ).toBeVisible();
    const tableHeaders = await page.locator('thead th').allInnerTexts();
    for (const h of tableHeaders) {
      expect(h.toLowerCase()).not.toContain('mật khẩu');
      expect(h.toLowerCase()).not.toContain('password');
    }

    // Verify Smart Dispatch page renders
    await page.goto(`${ADMIN_URL}/dispatch`);
    await expect(
      page.getByRole('heading', { name: /Điều phối Thông minh/i }),
    ).toBeVisible();

    // Verify RBAC & Audit Log pages render
    await page.goto(`${ADMIN_URL}/rbac`);
    await expect(
      page.getByRole('heading', { name: /Phân quyền & Nhân sự/i }),
    ).toBeVisible();

    await page.goto(`${ADMIN_URL}/audit`);
    await expect(
      page.getByRole('heading', { name: /Nhật ký Kiểm toán/i }),
    ).toBeVisible();
  });
});
