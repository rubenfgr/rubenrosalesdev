import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { Db } from './db';
import type { Env } from './env';
import { errorBody, registerErrorHandlers } from './lib/errors';
import { requestLogger, type LogSink } from './lib/logging';
import { healthRoutes } from './routes/health';

export interface Deps {
  env: Env;
  db: Db;
  /** Comprobación de que la base de datos responde (inyectable para las pruebas). */
  pingDb: () => Promise<void>;
  /** Destino de los logs de petición (por defecto, stdout). */
  logSink?: LogSink;
}

/** Tamaño máximo del cuerpo de una petición. */
export const MAX_BODY_BYTES = 32 * 1024;

export function createApp(deps: Deps) {
  const app = new Hono().basePath('/api/v1');

  app.use(requestLogger(deps.logSink));
  app.use(secureHeaders());
  app.use(bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (c) => c.json(errorBody('payload_too_large'), 413) }));
  if (deps.env.ALLOWED_ORIGIN) app.use(cors({ origin: deps.env.ALLOWED_ORIGIN, allowMethods: ['GET', 'POST'] }));

  app.route('/health', healthRoutes(deps));

  registerErrorHandlers(app);
  return app;
}
