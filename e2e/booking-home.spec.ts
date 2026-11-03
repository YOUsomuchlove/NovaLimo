import { expect, test } from '@playwright/test';

const PAGES: { path: string; heading: RegExp }[] = [
  { path: '/', heading: /./ },
  { path: '/pricing', heading: /Giá minh bạch/ },
  { path: '/about', heading: /Hành trình/ },
  { path: '/faq', heading: /Câu hỏi/i },
  { path: '/contact', heading: /sẵn sàng/ },
  { path: '/cargo', heading: /./ },
  { path: '/cargo/track', heading: /./ },
  { path: '/my-tickets', heading: /./ },
  { path: '/terms', heading: /Điều khoản sử dụng/ },
  { path: '/privacy', heading: /Chính sách bảo mật/ },
];

test.describe('Web Booking smoke', () => {
  test.beforeEach(async ({ request, baseURL }) => {
    const up = await request
      .get(baseURL ?? '/')
      .then((r) => r.ok())
      .catch(() => false);
    test.skip(!up, 'web-booking chưa chạy');
  });

  for (const p of PAGES) {
    test(`render ${p.path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(p.path);
      await expect(page.getByRole('heading', { level: 1 }).first()).toHaveText(
        p.heading,
      );
      await expect(page.locator('header')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('404 có nút quay về', async ({ page }) => {
    const res = await page.goto('/khong-ton-tai');
    expect(res?.status()).toBe(404);
    await expect(
      page.getByRole('link', { name: 'Về trang chủ' }),
    ).toBeVisible();
  });

  test('sitemap và robots', async ({ request }) => {
    expect((await request.get('/sitemap.xml')).ok()).toBeTruthy();
    expect(await (await request.get('/robots.txt')).text()).toContain(
      'Sitemap:',
    );
  });
});
