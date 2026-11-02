import { createApp } from './app.factory';

async function bootstrap() {
  const { app, env } = await createApp();
  await app.listen(env.PORT);
}

void bootstrap();
