import { defineConfig, devices } from '@playwright/test';

/**
 * Chạy local (web-booking đã serve): E2E_BASE_URL=http://127.0.0.1:3001 npx playwright test
 * CI: bỏ qua nếu không có app — dùng `npm run test:e2e` khi stack dev chạy.
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
});
