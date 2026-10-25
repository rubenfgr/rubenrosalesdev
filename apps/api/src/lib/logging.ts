import { randomUUID } from 'node:crypto';
import type { MiddlewareHandler } from 'hono';

export type LogSink = (line: string) => void;

/**
 * Una línea JSON por petición. Solo método, ruta, estado, duración e id: nunca cuerpos, query,
 * cabeceras, IPs en claro, emails ni mensajes de usuarios.
 */
export const requestLogger =
  (sink: LogSink = (line) => console.log(line)): MiddlewareHandler =>
  async (c, next) => {
    const incoming = c.req.header('x-request-id');
    const requestId = incoming && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();
    c.header('x-request-id', requestId);
    const start = performance.now();
    await next();
    sink(
      JSON.stringify({
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        ms: Math.round(performance.now() - start),
        requestId,
      }),
    );
  };
