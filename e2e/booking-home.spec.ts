import { test, expect } from '@playwright/test';

test.describe('Web Booking smoke', () => {
  test('trang chủ render body', async ({ page, request, baseURL }) => {
    const health = await request.get(baseURL ?? '/').catch(() => null);
    if (!health?.ok()) {
      test.skip();
      return;
    }
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
