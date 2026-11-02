/**
 * End-to-end: real PostgreSQL + PostGIS (Testcontainers), real migrations + seed, real HTTP.
 * Run: nx run api-server:e2e   (needs Docker)
 */
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

jest.setTimeout(180_000);

let pg: StartedPostgreSqlContainer;
let app: INestApplication;
let http: App;
const WEBHOOK_SECRET = 'whsec_test_0123456789abcdef';
const sms: {
  phone: string;
  template: string;
  vars: Record<string, string | number>;
}[] = [];

const tomorrow = () =>
  new Date(Date.now() + 7 * 3_600_000 + 86_400_000).toISOString().slice(0, 10);

async function login(
  kind: 'staff' | 'driver',
  phone: string,
  password: string,
): Promise<string> {
  const res = await request(http)
    .post(`/api/auth/${kind}/login`)
    .send({ phone, password })
    .expect(200);
  return res.body.access_token as string;
}

beforeAll(async () => {
  pg = await new PostgreSqlContainer('postgis/postgis:16-3.4')
    .withDatabase('novalimo')
    .withUsername('novalimo')
    .withPassword('novalimo')
    .start();
  Object.assign(process.env, {
    NODE_ENV: 'test',
    DATABASE_URL: pg.getConnectionUri(),
    JWT_SECRET: 'e2e-secret-e2e-secret-e2e-secret-0123',
    PAYMENT_WEBHOOK_SECRET: WEBHOOK_SECRET,
    DB_MIGRATE_ON_BOOT: 'true',
    UPLOADS_DIR: 'tmp/e2e-uploads',
  });

  const { createDataSource } = await import('../src/database/data-source');
  const ds = createDataSource({
    DATABASE_URL: pg.getConnectionUri(),
    DATABASE_SSL: false,
    TYPEORM_LOGGING: false,
  });
  await ds.initialize();
  await ds.runMigrations();
  const { runSeed } = await import('../src/database/seed/seed');
  await runSeed(ds);
  await ds.destroy();

  const { createApp } = await import('../src/app.factory');
  ({ app } = await createApp());
  await app.init();
  http = app.getHttpServer();

  const { NotifyService } = await import(
    '../src/modules/notify/notify.service'
  );
  jest
    .spyOn(app.get(NotifyService), 'sms')
    .mockImplementation(async (phone, template, vars) => {
      sms.push({ phone, template, vars });
    });
});

afterAll(async () => {
  await app?.close();
  await pg?.stop();
});

describe('platform', () => {
  it('health check reports the database', async () => {
    const res = await request(http).get('/api/health').expect(200);
    expect(res.body.info.database.status).toBe('up');
  });

  it('rejects unauthenticated admin calls and enforces permissions', async () => {
    await request(http).get('/api/admin/bookings').expect(401);
    const accountant = await login('staff', '0900000003', 'Admin@12345');
    await request(http)
      .get('/api/admin/bookings')
      .set('Authorization', `Bearer ${accountant}`)
      .expect(200);
    const res = await request(http)
      .post('/api/admin/routes')
      .set('Authorization', `Bearer ${accountant}`)
      .send({})
      .expect(403);
    expect(res.body.code).toBe('MISSING_PERMISSION');
  });

  it('never leaks password hashes', async () => {
    const admin = await login('staff', '0900000001', 'Admin@12345');
    const res = await request(http)
      .get('/api/admin/drivers')
      .set('Authorization', `Bearer ${admin}`)
      .expect(200);
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it('rotates refresh tokens and detects reuse', async () => {
    const first = await request(http)
      .post('/api/auth/staff/login')
      .send({ phone: '0900000001', password: 'Admin@12345' })
      .expect(200);
    const second = await request(http)
      .post('/api/auth/refresh')
      .send({ refresh_token: first.body.refresh_token })
      .expect(200);
    await request(http)
      .post('/api/auth/refresh')
      .send({ refresh_token: first.body.refresh_token })
      .expect(401);
    // Reuse revoked the whole family.
    await request(http)
      .post('/api/auth/refresh')
      .send({ refresh_token: second.body.refresh_token })
      .expect(401);
  });
});

describe('booking flow (web)', () => {
  let routeId: string;
  let batchId: string;
  let bookingCode: string;
  let bookingId: string;

  it('lists routes and finds tomorrow’s departures with server prices', async () => {
    const routes = await request(http).get('/api/public/routes').expect(200);
    const hnqn = routes.body.find((r: { code: string }) => r.code === 'HNQN');
    routeId = hnqn.id;
    expect(hnqn.stops.length).toBeGreaterThan(0);
    expect(hnqn.from_price_vnd).toBe(290_000);

    const trips = await request(http)
      .get('/api/public/trips')
      .query({ route_id: routeId, date: tomorrow() })
      .expect(200);
    expect(trips.body.length).toBeGreaterThan(0);
    const trip = trips.body.find((t: { bookable: boolean }) => t.bookable);
    batchId = trip.id;
    expect(trip.price_vnd).toBe(290_000);
    expect(trip.seats_total).toBe(18); // 9 seats × 2 planned vehicles
  });

  it('holds seats atomically — a label sells at most planned_vehicles times', async () => {
    const a = await request(http)
      .post('/api/public/seat-holds')
      .send({ trip_batch_id: batchId, seat_labels: ['A1', 'C1'] })
      .expect(201);
    await request(http)
      .post('/api/public/seat-holds')
      .send({ trip_batch_id: batchId, seat_labels: ['A1'] })
      .expect(201);
    const third = await request(http)
      .post('/api/public/seat-holds')
      .send({ trip_batch_id: batchId, seat_labels: ['A1'] })
      .expect(409);
    expect(third.body.code).toBe('SEAT_TAKEN');

    const map = await request(http)
      .get(`/api/public/trips/${batchId}/seats`)
      .expect(200);
    expect(
      map.body.seats.find((s: { label: string }) => s.label === 'A1').remaining,
    ).toBe(0);

    const booking = await request(http)
      .post('/api/public/bookings')
      .send({
        trip_batch_id: batchId,
        hold_token: a.body.hold_token,
        contact_name: 'Nguyễn Văn A',
        contact_phone: '0912345678',
        pickup: {
          address: '36 Hàng Bài, Hoàn Kiếm, Hà Nội',
          lat: 21.0245,
          lng: 105.8532,
        },
        dropoff: { address: 'Bãi Cháy, Hạ Long', lat: 20.9555, lng: 107.0457 },
        passengers: [
          { seat_label: 'A1', name: 'Nguyễn Văn A' },
          { seat_label: 'C1', name: 'Trần Thị B', phone: '0987654321' },
        ],
        payment_method: 'BANK_TRANSFER',
        // A malicious client trying to set its own price is rejected by validation.
      })
      .expect(201);
    bookingCode = booking.body.booking.code;
    bookingId = booking.body.booking.id;
    expect(booking.body.booking.status).toBe('PENDING_PAYMENT');
    expect(booking.body.booking.total_vnd).toBe(290_000 + 50_000 + 290_000); // A1 is VIP
    expect(booking.body.payment.bank.qr_image_url).toContain('img.vietqr.io');
    expect(booking.body.payment.reference).toBe(bookingCode.replace('-', ''));
  });

  it('rejects unknown fields such as a client-side price', async () => {
    const hold = await request(http)
      .post('/api/public/seat-holds')
      .send({ trip_batch_id: batchId, seat_labels: ['D1'] })
      .expect(201);
    await request(http)
      .post('/api/public/bookings')
      .send({
        trip_batch_id: batchId,
        hold_token: hold.body.hold_token,
        contact_name: 'Khách',
        contact_phone: '0912000000',
        pickup: { address: 'Hoàn Kiếm, Hà Nội', lat: 21.02, lng: 105.85 },
        dropoff: { address: 'Hạ Long', lat: 20.95, lng: 107.04 },
        passengers: [{ seat_label: 'D1', name: 'Khách' }],
        payment_method: 'CASH',
        total_vnd: 1000,
      })
      .expect(400);
  });

  it('confirms payment through the bank webhook (authenticated, idempotent)', async () => {
    const body = {
      id: 1,
      referenceCode: 'FT123',
      transferType: 'in',
      transferAmount: 630_000,
      content: `CK ${bookingCode.replace('-', '')} thanh toan`,
    };
    await request(http)
      .post('/api/payments/webhooks/bank')
      .set('Authorization', 'Apikey wrong-secret-wrong-secret')
      .send(body)
      .expect(401);
    const ok = await request(http)
      .post('/api/payments/webhooks/bank')
      .set('Authorization', `Apikey ${WEBHOOK_SECRET}`)
      .send(body)
      .expect(200);
    expect(ok.body.matched).toBe(true);
    await request(http)
      .post('/api/payments/webhooks/bank')
      .set('Authorization', `Apikey ${WEBHOOK_SECRET}`)
      .send(body)
      .expect(200);

    const lookup = await request(http)
      .get('/api/public/bookings/lookup')
      .query({ code: bookingCode, phone: '0912345678' })
      .expect(200);
    expect(lookup.body.booking.status).toBe('CONFIRMED');
    expect(lookup.body.booking.payment_status).toBe('PAID');
    expect(
      sms.some(
        (m) =>
          m.template === 'booking_confirmed' && m.vars.code === bookingCode,
      ),
    ).toBe(true);

    // A passenger's phone also works; a stranger's does not.
    await request(http)
      .get('/api/public/bookings/lookup')
      .query({ code: bookingCode, phone: '0987654321' })
      .expect(200);
    await request(http)
      .get('/api/public/bookings/lookup')
      .query({ code: bookingCode, phone: '0911111111' })
      .expect(404);
  });

  it('lists "my bookings" only after OTP verification', async () => {
    await request(http).get('/api/public/my-bookings').expect(401);
    await request(http)
      .post('/api/public/otp/request')
      .send({ phone: '0912345678' })
      .expect(200);
    const code = String(
      sms.filter((m) => m.template === 'otp').at(-1)?.vars.code,
    );
    await request(http)
      .post('/api/public/otp/verify')
      .send({
        phone: '0912345678',
        code: code === '000000' ? '111111' : '000000',
      })
      .expect(400);
    const v = await request(http)
      .post('/api/public/otp/verify')
      .send({ phone: '0912345678', code })
      .expect(200);
    const mine = await request(http)
      .get('/api/public/my-bookings')
      .set('x-lookup-token', v.body.lookup_token)
      .expect(200);
    expect(mine.body.map((b: { code: string }) => b.code)).toContain(
      bookingCode,
    );
    // The lookup token is not an access token.
    await request(http)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${v.body.lookup_token}`)
      .expect(401);
  });

  it('runs the trip end to end: dispatch → driver app → completion', async () => {
    const admin = await login('staff', '0900000001', 'Admin@12345');
    const auth = { Authorization: `Bearer ${admin}` };
    const drivers = await request(http)
      .get('/api/admin/drivers')
      .set(auth)
      .expect(200);
    const driver = drivers.body.items.find(
      (d: { phone: string }) => d.phone === '0911000001',
    );
    const vehicles = await request(http)
      .get('/api/admin/vehicles')
      .set(auth)
      .expect(200);
    const vehicle = vehicles.body.items.find(
      (v: { vehicle_type: { code: string } }) =>
        v.vehicle_type.code === 'LIMO9',
    );

    const run = await request(http)
      .post('/api/admin/trip-runs')
      .set(auth)
      .send({
        trip_batch_id: batchId,
        vehicle_id: vehicle.id,
        driver_id: driver.id,
      })
      .expect(201);
    await request(http)
      .post('/api/admin/trip-runs')
      .set(auth)
      .send({
        trip_batch_id: batchId,
        vehicle_id: vehicle.id,
        driver_id: driver.id,
      })
      .expect(409); // schedule clash
    await request(http)
      .post('/api/admin/dispatch/assign')
      .set(auth)
      .send({ booking_ids: [bookingId], trip_run_id: run.body.id })
      .expect(200);
    await request(http)
      .post(`/api/admin/trip-runs/${run.body.id}/status`)
      .set(auth)
      .send({ status: 'DISPATCHED' })
      .expect(200);

    const driverToken = await login('driver', '0911000001', 'Driver@12345');
    const d = { Authorization: `Bearer ${driverToken}` };
    await request(http).get('/api/admin/bookings').set(d).expect(403);
    const upcoming = await request(http)
      .get('/api/driver/runs')
      .set(d)
      .expect(200);
    expect(upcoming.body.map((r: { id: string }) => r.id)).toContain(
      run.body.id,
    );

    const detail = await request(http)
      .get(`/api/driver/runs/${run.body.id}`)
      .set(d)
      .expect(200);
    expect(
      detail.body.stops.filter((s: { kind: string }) => s.kind === 'PICKUP')[0]
        .seats,
    ).toEqual(['A1', 'C1']);

    await request(http)
      .post(`/api/driver/runs/${run.body.id}/start`)
      .set(d)
      .expect(409); // no shift yet
    await request(http)
      .post('/api/driver/shifts/start')
      .set(d)
      .send({ location: { lat: 21.03, lng: 105.85 } })
      .expect(200);
    await request(http)
      .post(`/api/driver/runs/${run.body.id}/start`)
      .set(d)
      .expect(200);
    await request(http)
      .post('/api/driver/locations')
      .set(d)
      .send({
        points: [
          { lat: 21.03, lng: 105.85, recorded_at: new Date().toISOString() },
          {
            lat: 21.05,
            lng: 105.9,
            speed_kmh: 40,
            recorded_at: new Date().toISOString(),
          },
        ],
      })
      .expect(200);
    await request(http)
      .post(`/api/driver/bookings/${bookingId}/dropoff`)
      .set(d)
      .expect(409); // must pick up first
    await request(http)
      .post(`/api/driver/bookings/${bookingId}/pickup`)
      .set(d)
      .expect(200);
    await request(http)
      .post(`/api/driver/runs/${run.body.id}/finish`)
      .set(d)
      .expect(409); // passenger still on board
    await request(http)
      .post(`/api/driver/bookings/${bookingId}/dropoff`)
      .set(d)
      .expect(200);
    await request(http)
      .post(`/api/driver/runs/${run.body.id}/finish`)
      .set(d)
      .expect(200);

    await request(http)
      .post('/api/driver/shifts/end')
      .set(d)
      .send({ checklist: { vehicle_clean: true } })
      .expect(400);
    const end = await request(http)
      .post('/api/driver/shifts/end')
      .set(d)
      .send({
        checklist: {
          vehicle_clean: true,
          fuel_checked: true,
          cash_handed_over: true,
        },
      })
      .expect(200);
    expect(end.body.runs_finished).toBe(1);
    expect(end.body.passengers_dropped).toBe(2);

    const audit = await request(http)
      .get('/api/admin/audit-logs')
      .set(auth)
      .query({ resource: 'trip-runs' })
      .expect(200);
    expect(audit.body.total).toBeGreaterThan(0);
  });
});

describe('cargo + COD', () => {
  it('quotes, accepts a public order and tracks it', async () => {
    const routes = await request(http).get('/api/public/routes').expect(200);
    const route = routes.body[0];
    const quote = await request(http)
      .post('/api/public/cargo/quote')
      .send({
        route_id: route.id,
        size: 'M',
        weight_kg: 12,
        is_fragile: true,
        cod_amount_vnd: 500_000,
      })
      .expect(200);
    expect(quote.body.fee_vnd).toBe(80_000 + 2 * 5_000 + 30_000 + 10_000);

    const order = await request(http)
      .post('/api/public/cargo/orders')
      .send({
        route_id: route.id,
        size: 'M',
        weight_kg: 12,
        is_fragile: true,
        cod_amount_vnd: 500_000,
        description: 'Hộp gốm sứ',
        sender: {
          name: 'Lê Gửi',
          phone: '0901111111',
          address: 'Hoàn Kiếm, Hà Nội',
          lat: 21.02,
          lng: 105.85,
        },
        receiver: {
          name: 'Phạm Nhận',
          phone: '0902222222',
          address: 'Hạ Long, Quảng Ninh',
          lat: 20.95,
          lng: 107.04,
        },
      })
      .expect(201);
    expect(order.body.waybill_code).toMatch(/^CG-/);
    await request(http)
      .get('/api/public/cargo/track')
      .query({ code: order.body.waybill_code, phone: '0902222222' })
      .expect(200);
    await request(http)
      .get('/api/public/cargo/track')
      .query({ code: order.body.waybill_code, phone: '0903333333' })
      .expect(404);
  });
});
