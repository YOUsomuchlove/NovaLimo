import { expect, test, type APIRequestContext } from '@playwright/test';

/**
 * Full customer journey against a running dev stack (API + seeded DB + web-booking):
 * search → seat hold → passenger info → checkout → VietQR → bank webhook → success page.
 *
 * Env: E2E_API_URL (default http://127.0.0.1:3000/api), E2E_WEBHOOK_SECRET (default dev secret).
 */
const API = process.env.E2E_API_URL ?? 'http://127.0.0.1:3000/api';
const WEBHOOK_SECRET =
  process.env.E2E_WEBHOOK_SECRET ?? 'dev-webhook-secret-0123456789';

type Route = { id: string };
type Trip = { id: string; seats_available: number };

/** First route/date over the next week that still has a free seat. */
async function findBookableTrip(request: APIRequestContext) {
  const routes = (await (
    await request.get(`${API}/public/routes`)
  ).json()) as Route[];
  for (let d = 1; d <= 7; d++) {
    const date = new Date(Date.now() + d * 86_400_000 + 7 * 3_600_000)
      .toISOString()
      .slice(0, 10);
    for (const r of routes) {
      const res = await request.get(
        `${API}/public/trips?route_id=${r.id}&date=${date}&seats=1`,
      );
      if (!res.ok()) continue;
      const trip = ((await res.json()) as Trip[]).find(
        (t) => t.seats_available > 0,
      );
      if (trip) return { route: r.id, date, trip: trip.id };
    }
  }
  return null;
}

test.describe('Web Booking — đặt vé & thanh toán', () => {
  test.beforeEach(async ({ request }) => {
    const ok = await request
      .get(`${API}/public/settings`)
      .then((r) => r.ok())
      .catch(() => false);
    test.skip(!ok, 'API dev chưa chạy');
  });

  test('chọn ghế → thông tin → VietQR → webhook → vé thành công', async ({
    page,
    request,
  }) => {
    const target = await findBookableTrip(request);
    test.skip(!target, 'Không có chuyến còn ghế trong 7 ngày tới');

    await page.goto(
      `/search?route=${target!.route}&date=${target!.date}&seats=1`,
    );
    await page.locator(`a[href="/booking/${target!.trip}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/booking/${target!.trip}$`));

    // Seat step — pick the first free seat and hold it.
    await page
      .getByRole('button', { name: /còn trống/ })
      .first()
      .click();
    await page.getByRole('button', { name: 'Giữ ghế & tiếp tục' }).click();
    await expect(page).toHaveURL(/\/info$/);

    // Info step.
    await page.getByPlaceholder('Nguyễn Văn A').fill('Khách Kiểm Thử');
    await page.getByPlaceholder('0912 345 678').fill('0987654321');
    const stops = page.locator('button[aria-pressed]');
    if (await stops.count()) {
      // Stop chips: first group = pickup, last = dropoff.
      await stops.first().click();
      await stops.last().click();
    }
    await page.getByRole('button', { name: 'Tiếp tục thanh toán' }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    // Checkout — bank transfer is the default method.
    await page.getByRole('checkbox').check();
    const created = page.waitForResponse(
      (r) =>
        r.url().endsWith('/public/bookings') && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Đặt vé & thanh toán' }).click();
    const { booking, payment } = await (await created).json();
    expect(payment?.reference).toBeTruthy();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('img', { name: /VietQR/ })).toBeVisible();
    await expect(dialog).toContainText(payment.reference);

    // Simulate the bank notifying the transfer.
    const hook = await request.post(`${API}/payments/webhooks/bank`, {
      headers: { Authorization: `Apikey ${WEBHOOK_SECRET}` },
      data: {
        id: Date.now(),
        referenceCode: `E2E${Date.now()}`,
        transferType: 'in',
        transferAmount: payment.amount_vnd,
        content: `CK ${payment.reference} e2e`,
      },
    });
    expect(hook.ok()).toBeTruthy();

    await expect(page).toHaveURL(
      new RegExp(`/booking/success/${booking.code}`),
      { timeout: 20_000 },
    );
    await expect(
      page.getByRole('heading', { name: 'Đặt vé thành công!' }),
    ).toBeVisible();
  });
});
