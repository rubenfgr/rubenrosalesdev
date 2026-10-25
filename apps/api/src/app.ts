import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { Db } from './db';
import type { Env } from './env';

export interface Deps {
  env: Env;
  db: Db;
  /** Comprobación de que la base de datos responde (inyectable para las pruebas). */
  pingDb: () => Promise<void>;
}

export function createApp({ env, pingDb }: Deps) {
  const app = new Hono().basePath('/api/v1');

  app.use(secureHeaders());
  if (env.ALLOWED_ORIGIN) app.use(cors({ origin: env.ALLOWED_ORIGIN, allowMethods: ['GET', 'POST'] }));

  app.get('/health', async (c) => {
    try {
      await pingDb();
      return c.json({ status: 'ok' });
    } catch {
      return c.json({ status: 'degraded' }, 503);
    }
  });

  app.notFound((c) => c.json({ error: 'not_found' }, 404));
  app.onError((err, c) => {
    // Sin datos personales en el log.
    console.error('api: error no controlado', err instanceof Error ? err.message : 'desconocido');
    return c.json({ error: 'internal' }, 500);
  });

  return app;
}
