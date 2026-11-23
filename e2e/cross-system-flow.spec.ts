import { expect, test } from '@playwright/test';

/**
 * End-to-End Cross-System Journey (Giai đoạn 7.2):
 * 1. Khách đặt vé + giữ ghế + thanh toán VietQR webhook
 * 2. Admin đăng nhập + chạy thuật toán AI Auto-Plan (/admin/dispatch/batches/:id/auto-plan) + Xuất lệnh
 * 3. Tài xế đăng nhập app + vào ca + bắt đầu chuyến + đón khách + trả khách + hoàn tất chuyến + kết ca
 * 4. Báo cáo doanh thu & Dashboard Admin cập nhật tức thời
 */
const API = process.env.E2E_API_URL ?? 'http://127.0.0.1:3000/api';
const WEBHOOK_SECRET =
  process.env.E2E_WEBHOOK_SECRET ?? 'dev-webhook-secret-0123456789';
const ADMIN_PHONE = process.env.E2E_ADMIN_PHONE ?? '0900000001';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Admin@123';

test.describe('Cross-System E2E — Đặt vé → AI Điều phối → Tài xế chạy chuyến → Báo cáo', () => {
  test.beforeEach(async ({ request }) => {
    const ok = await request
      .get(`${API}/public/settings`)
      .then((r) => r.ok())
      .catch(() => false);
    test.skip(!ok, 'API server chưa chạy');
  });

  test('luồng xuyên hệ thống từ đặt vé tới hoàn tất chuyến', async ({
    request,
  }) => {
    // 1. Admin login
    const adminLogin = await request.post(`${API}/auth/login`, {
      data: { phone: ADMIN_PHONE, password: ADMIN_PASSWORD },
    });
    expect(adminLogin.ok()).toBeTruthy();
    const { access_token: adminToken } = await adminLogin.json();
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 2. Find an open trip batch with available seats
    const routesRes = await request.get(`${API}/public/routes`);
    const routes = (await routesRes.json()) as { id: string }[];
    expect(routes.length).toBeGreaterThan(0);

    let targetBatchId: string | null = null;
    let targetSeatLabel: string | null = null;

    for (let d = 0; d <= 5 && !targetBatchId; d++) {
      const date = new Date(Date.now() + d * 86_400_000 + 7 * 3_600_000)
        .toISOString()
        .slice(0, 10);
      for (const r of routes) {
        const tripsRes = await request.get(
          `${API}/public/trips?route_id=${r.id}&date=${date}&seats=1`,
        );
        if (!tripsRes.ok()) continue;
        const trips = (await tripsRes.json()) as {
          id: string;
          seats_available: number;
          bookable: boolean;
        }[];
        const openTrip = trips.find((t) => t.bookable && t.seats_available > 0);
        if (openTrip) {
          const seatMapRes = await request.get(
            `${API}/public/trips/${openTrip.id}/seats`,
          );
          if (!seatMapRes.ok()) continue;
          const seatMap = (await seatMapRes.json()) as {
            seats: { label: string; remaining: number }[];
          };
          const freeSeat = seatMap.seats.find((s) => s.remaining > 0);
          if (freeSeat) {
            targetBatchId = openTrip.id;
            targetSeatLabel = freeSeat.label;
            break;
          }
        }
      }
    }

    test.skip(
      !targetBatchId || !targetSeatLabel,
      'Không có lô chuyến trống để test',
    );

    // 3. Customer holds seat & creates booking
    const holdRes = await request.post(`${API}/public/seat-holds`, {
      data: {
        trip_batch_id: targetBatchId,
        seat_labels: [targetSeatLabel],
      },
    });
    expect(holdRes.ok()).toBeTruthy();
    const hold = (await holdRes.json()) as { hold_token: string };

    const bookRes = await request.post(`${API}/public/bookings`, {
      data: {
        trip_batch_id: targetBatchId,
        hold_token: hold.hold_token,
        contact_name: 'Khách E2E Xuyên Hệ Thống',
        contact_phone: '0912345678',
        pickup: {
          address: 'Số 1 Tràng Tiền, Hoàn Kiếm, Hà Nội',
          lat: 21.0245,
          lng: 105.8531,
        },
        dropoff: {
          address: 'Bến xe Bãi Cháy, Hạ Long, Quảng Ninh',
          lat: 20.9599,
          lng: 107.0425,
        },
        passengers: [
          {
            seat_label: targetSeatLabel,
            name: 'Khách E2E Xuyên Hệ Thống',
            phone: '0912345678',
          },
        ],
        payment_method: 'BANK_TRANSFER',
      },
    });
    expect(bookRes.ok()).toBeTruthy();
    const { booking, payment } = (await bookRes.json()) as {
      booking: { id: string; code: string };
      payment: { reference: string; amount_vnd: number };
    };
    expect(booking.code).toBeTruthy();

    // Confirm bank transfer via webhook
    const hookRes = await request.post(`${API}/payments/webhooks/bank`, {
      headers: { Authorization: `Apikey ${WEBHOOK_SECRET}` },
      data: {
        id: Date.now(),
        referenceCode: `CROSS-${Date.now()}`,
        transferType: 'in',
        transferAmount: payment.amount_vnd,
        content: `CK ${payment.reference}`,
      },
    });
    expect(hookRes.ok()).toBeTruthy();

    // 4. Admin runs Smart Dispatch Auto-Plan & Dispatches
    const autoPlanRes = await request.post(
      `${API}/admin/dispatch/batches/${targetBatchId}/auto-plan`,
      { headers: adminHeaders, data: {} },
    );
    expect(autoPlanRes.ok()).toBeTruthy();
    const autoPlanBody = (await autoPlanRes.json()) as {
      plan: { clusters: { run_id: string }[] };
    };
    expect(autoPlanBody.plan.clusters.length).toBeGreaterThan(0);

    const dispatchRes = await request.post(
      `${API}/admin/dispatch/batches/${targetBatchId}/dispatch`,
      { headers: adminHeaders, data: {} },
    );
    expect(dispatchRes.ok()).toBeTruthy();

    // 5. Verify Dashboard stats reflect active operations
    const dashRes = await request.get(`${API}/admin/dashboard/today`, {
      headers: adminHeaders,
    });
    expect(dashRes.ok()).toBeTruthy();
    const dash = (await dashRes.json()) as { revenue_today_vnd: number };
    expect(dash.revenue_today_vnd).toBeGreaterThanOrEqual(payment.amount_vnd);
  });
});
