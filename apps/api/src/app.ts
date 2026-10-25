import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { Db } from './db';
import type { Env } from './env';
import { registerErrorHandlers } from './lib/errors';
import { healthRoutes } from './routes/health';

export interface Deps {
  env: Env;
  db: Db;
  /** Comprobación de que la base de datos responde (inyectable para las pruebas). */
  pingDb: () => Promise<void>;
}

export function createApp(deps: Deps) {
  const app = new Hono().basePath('/api/v1');

  app.use(secureHeaders());
  if (deps.env.ALLOWED_ORIGIN) app.use(cors({ origin: deps.env.ALLOWED_ORIGIN, allowMethods: ['GET', 'POST'] }));

  app.route('/health', healthRoutes(deps));

  registerErrorHandlers(app);
  return app;
}
