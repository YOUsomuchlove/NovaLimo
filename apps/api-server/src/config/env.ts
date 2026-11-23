import { z } from 'zod';

const bool = z
  .enum(['true', 'false', '1', '0'])
  .optional()
  .transform((v) => v === 'true' || v === '1');

/**
 * Every env var the API reads, validated once at boot. A bad/missing value fails fast with a
 * readable message instead of surfacing later as a confusing runtime error.
 */
export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),

    DATABASE_URL: z.string().url(),
    DATABASE_SSL: bool,
    TYPEORM_LOGGING: bool,
    /** Run pending migrations on boot (default on outside production). */
    DB_MIGRATE_ON_BOOT: bool,

    JWT_SECRET: z.string().min(32, 'JWT_SECRET phải ≥ 32 ký tự'),
    JWT_ACCESS_TTL: z.string().default('15m'),
    JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

    /** Comma separated list of allowed browser origins. */
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:3001,http://localhost:3002'),

    UPLOADS_DIR: z.string().default('uploads'),
    PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),

    OSRM_BASE_URL: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      z.string().url().optional(),
    ),
    DISPATCH_CLUSTER_EPS_M: z.coerce.number().positive().default(500),

    GEOCODER_USER_AGENT: z.string().default('NovaLimo/1.0 (ops@novalimo.vn)'),

    /** VietQR — bank account receiving transfers. */
    BANK_BIN: z.string().default('970436'),
    BANK_ACCOUNT_NO: z.string().default('0000000000'),
    BANK_ACCOUNT_NAME: z.string().default('CONG TY NOVALIMO'),
    /** Shared secret for the bank-transfer webhook (SePay "Authorization: Apikey …"). */
    PAYMENT_WEBHOOK_SECRET: z.string().min(16).optional(),
    PAYMENT_HOLD_MIN: z.coerce.number().int().positive().default(15),

    /** `console` logs OTP/SMS to the server log (dev); real providers plug in later. */
    SMS_PROVIDER: z.enum(['console', 'esms', 'speedsms']).default('console'),
    SMS_API_KEY: z.string().optional(),
    SMS_API_SECRET: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      if (env.JWT_SECRET.includes('change-me')) {
        ctx.addIssue({
          code: 'custom',
          path: ['JWT_SECRET'],
          message: 'Không dùng secret mẫu ở production',
        });
      }
      if (!env.PAYMENT_WEBHOOK_SECRET) {
        ctx.addIssue({
          code: 'custom',
          path: ['PAYMENT_WEBHOOK_SECRET'],
          message: 'Bắt buộc ở production',
        });
      }
      if (env.SMS_PROVIDER === 'console') {
        ctx.addIssue({
          code: 'custom',
          path: ['SMS_PROVIDER'],
          message: 'Cần nhà cung cấp SMS thật ở production',
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const lines = parsed.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Cấu hình môi trường không hợp lệ:\n${lines}`);
  }
  return parsed.data;
}
