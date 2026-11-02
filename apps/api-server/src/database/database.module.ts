import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_ENV } from '../config/config.module';
import type { Env } from '../config/env';
import { dataSourceOptions } from './data-source';
import { ENTITIES } from './entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [APP_ENV],
      useFactory: (env: Env) => ({
        ...dataSourceOptions(env),
        migrationsRun: env.DB_MIGRATE_ON_BOOT ?? env.NODE_ENV !== 'production',
        migrationsTransactionMode: 'each',
      }),
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
