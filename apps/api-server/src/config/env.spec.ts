import { validateEnv } from './env';

const base = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_SECRET: 'x'.repeat(40),
};

describe('validateEnv', () => {
  it('applies defaults', () => {
    const env = validateEnv(base);
    expect(env.PORT).toBe(3000);
    expect(env.JWT_ACCESS_TTL).toBe('15m');
    expect(env.SMS_PROVIDER).toBe('console');
  });

  it('rejects a short JWT secret with a readable message', () => {
    expect(() => validateEnv({ ...base, JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('refuses unsafe production settings', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        JWT_SECRET: `change-me-${'x'.repeat(40)}`,
      }),
    ).toThrow(/JWT_SECRET[\s\S]*PAYMENT_WEBHOOK_SECRET[\s\S]*SMS_PROVIDER/);
  });
});
