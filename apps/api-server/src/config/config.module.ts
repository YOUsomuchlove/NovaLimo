import { Global, Inject, Module } from '@nestjs/common';
import { validateEnv } from './env';

export const APP_ENV = Symbol('APP_ENV');

/** Inject the validated, typed environment: `constructor(@InjectEnv() env: Env)` */
export const InjectEnv = () => Inject(APP_ENV);

@Global()
@Module({
  providers: [{ provide: APP_ENV, useFactory: () => validateEnv(process.env) }],
  exports: [APP_ENV],
})
export class AppConfigModule {}
