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
      name: 'GET /api (root controller)',
      url: `${apiBase}`,
    },
    {
      name: 'GET /api/trip-batches',
      url: `${apiBase}/trip-batches`,
    },
  ];

  for (const { name, url } of checks) {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      console.error(`FAIL: ${name} — HTTP ${res.status} ${res.statusText}`);
      process.exitCode = 1;
      return;
    }
    console.log(`OK: ${name}`);
  }

  const socketOrigin = apiBase.replace(/\/api\/?$/, '');
  console.log(`Socket origin (strip /api): ${socketOrigin} → io('${socketOrigin}/realtime')`);
  console.log('Smoke HTTP checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
