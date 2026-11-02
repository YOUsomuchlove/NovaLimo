import { DataSource, type DataSourceOptions } from 'typeorm';
import type { Env } from '../config/env';
import { ENTITIES } from './entities';
import { MIGRATIONS } from './migrations';

/** Shared TypeORM options for the Nest app, the CLI (`scripts/db.ts`) and e2e tests. */
export function dataSourceOptions(
  env: Pick<Env, 'DATABASE_URL' | 'DATABASE_SSL' | 'TYPEORM_LOGGING'>,
): DataSourceOptions {
  return {
    type: 'postgres',
    url: env.DATABASE_URL,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
    entities: ENTITIES,
    migrations: MIGRATIONS,
    migrationsTableName: 'schema_migrations',
    // Schema changes only ever happen through reviewed migrations.
    synchronize: false,
    uuidExtension: 'pgcrypto',
    installExtensions: true,
    logging: env.TYPEORM_LOGGING ? ['query', 'error'] : ['error'],
  };
}

export function createDataSource(
  env: Parameters<typeof dataSourceOptions>[0],
): DataSource {
  return new DataSource(dataSourceOptions(env));
}
