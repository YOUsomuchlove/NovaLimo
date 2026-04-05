#!/usr/bin/env node
/**
 * Smoke HTTP checks against a running api-server.
 * Usage: API_BASE_URL=http://localhost:3000/api node tools/verify-integration.mjs
 */

const apiBase =
  process.env.API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3000/api';

async function main() {
  const root = new URL(apiBase);
  const origin = `${root.protocol}//${root.host}`;

  const checks = [
    {
      name: 'GET /api (root)',
      url: `${apiBase}`,
    },
    {
      name: 'GET /api/trip-batches',
      url: `${apiBase}/trip-batches`,
    },
    {
      name: 'POST /api/auth/login/admin',
      url: `${apiBase}/auth/login/admin`,
      method: 'POST',
      body: JSON.stringify({ phone: '0000000000', password: 'demo' }),
      expectJsonToken: true,
    },
  ];

  let adminToken = '';
  for (const c of checks) {
    const name = c.name;
    const url = c.url;
    const method = c.method ?? 'GET';
    const headers = { ...(c.body ? { 'content-type': 'application/json' } : {}) };
    const res = await fetch(url, {
      method,
      headers,
      body: c.body,
    });
    if (!res.ok) {
      console.error(`FAIL: ${name} — HTTP ${res.status} ${res.statusText}`);
      process.exitCode = 1;
      return;
    }
    if (c.expectJsonToken) {
      const data = await res.json();
      if (!data.access_token) {
        console.error(`FAIL: ${name} — missing access_token`);
        process.exitCode = 1;
        return;
      }
      adminToken = data.access_token;
    }
    console.log(`OK: ${name}`);
  }

  if (adminToken) {
    const res = await fetch(`${apiBase}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) {
      console.error(`FAIL: GET /admin/stats with Bearer — HTTP ${res.status}`);
      process.exitCode = 1;
      return;
    }
    const stats = await res.json();
    console.log('OK: GET /api/admin/stats (Bearer admin)', stats);
  }

  // --- Extended smoke (public + driver) ---
  const geo = await fetch(`${apiBase}/geocode?q=${encodeURIComponent('Hanoi')}`);
  if (!geo.ok) {
    console.error(`FAIL: GET /geocode — HTTP ${geo.status}`);
    process.exitCode = 1;
    return;
  }
  const geoJson = await geo.json();
  if (!Array.isArray(geoJson)) {
    console.error('FAIL: GET /geocode — expected JSON array');
    process.exitCode = 1;
    return;
  }
  console.log(`OK: GET /api/geocode (hits: ${geoJson.length})`);

  const batchesRes = await fetch(`${apiBase}/trip-batches`);
  const batches = batchesRes.ok ? await batchesRes.json() : [];
  const batchId = Array.isArray(batches) && batches[0]?.id ? batches[0].id : null;

  if (batchId) {
    const ts = await fetch(
      `${apiBase}/bookings/taken-seats?trip_batch_id=${encodeURIComponent(batchId)}`,
    );
    if (!ts.ok) {
      console.error(`FAIL: GET /bookings/taken-seats — HTTP ${ts.status}`);
      process.exitCode = 1;
      return;
    }
    const seats = await ts.json();
    console.log(
      `OK: GET /api/bookings/taken-seats (batch ${batchId}, count ${Array.isArray(seats) ? seats.length : '?'})`,
    );

    const createBooking = await fetch(`${apiBase}/bookings`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        trip_batch_id: batchId,
        passenger_name: 'Smoke Test',
        passenger_phone: '0999999999',
        pickup_address: 'Test pickup',
        pickup_location: { lat: 21.03, lng: 105.85 },
        dropoff_address: 'Test dropoff',
        dropoff_location: { lat: 21.22, lng: 105.8 },
        seat_label: 'Z9',
        unit_price: 350000,
        total_amount: 350000,
        payment_method: 'COD',
      }),
    });
    if (!createBooking.ok) {
      const txt = await createBooking.text();
      console.error(`FAIL: POST /bookings — HTTP ${createBooking.status} ${txt}`);
      process.exitCode = 1;
      return;
    }
    console.log('OK: POST /api/bookings (smoke)');
  } else {
    console.log('SKIP: POST /bookings (no trip batch in DB)');
  }

  const driverLogin = await fetch(`${apiBase}/auth/login/driver`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phone: '0900000000', password: 'demo' }),
  });
  if (!driverLogin.ok) {
    console.error(`FAIL: POST /auth/login/driver — HTTP ${driverLogin.status}`);
    process.exitCode = 1;
    return;
  }
  const driverData = await driverLogin.json();
  if (!driverData.access_token) {
    console.error('FAIL: driver login — missing access_token');
    process.exitCode = 1;
    return;
  }
  console.log('OK: POST /api/auth/login/driver');

  const driverToken = driverData.access_token;
  const myRuns = await fetch(
    `${apiBase}/trips/my-runs?status=PENDING`,
    { headers: { Authorization: `Bearer ${driverToken}` } },
  );
  if (!myRuns.ok) {
    console.error(`FAIL: GET /trips/my-runs — HTTP ${myRuns.status}`);
    process.exitCode = 1;
    return;
  }
  const runs = await myRuns.json();
  if (!Array.isArray(runs)) {
    console.error('FAIL: GET /trips/my-runs — expected array');
    process.exitCode = 1;
    return;
  }
  console.log(`OK: GET /api/trips/my-runs?status=PENDING (runs: ${runs.length})`);

  const socketOrigin = apiBase.replace(/\/api\/?$/, '');
  console.log(`Socket origin (strip /api): ${socketOrigin} → io('${socketOrigin}/realtime')`);
  console.log('Smoke HTTP checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
