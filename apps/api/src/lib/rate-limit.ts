import type { Context, MiddlewareHandler } from 'hono';
import { errorBody } from './errors';

/**
 * IP del cliente: primer valor de `X-Forwarded-For` (lo pone Traefik). Si no hay, un valor fijo
 * (todo el tráfico sin cabecera comparte cubo, que es lo prudente). No se guarda ni se registra en claro.
 */
export const clientIp = (c: Context): string => c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

interface Options {
  limit: number;
  windowMs: number;
  /** Reloj inyectable para las pruebas. */
  now?: () => number;
  key?: (c: Context) => string;
}

/** Ventana deslizante en memoria (válida con una sola instancia de la API). */
export const rateLimit = ({ limit, windowMs, now = Date.now, key = clientIp }: Options): MiddlewareHandler => {
  const hits = new Map<string, number[]>();
  return async (c, next) => {
    const t = now();
    const k = key(c);
    const recent = (hits.get(k) ?? []).filter((ts) => t - ts < windowMs);
    if (recent.length >= limit) {
      hits.set(k, recent);
      c.header('Retry-After', String(Math.max(1, Math.ceil((recent[0]! + windowMs - t) / 1000))));
      return c.json(errorBody('rate_limited'), 429);
    }
    recent.push(t);
    hits.set(k, recent);
    // Limpieza ocasional para que el mapa no crezca sin límite.
    if (hits.size > 5000) for (const [id, list] of hits) if (list.every((ts) => t - ts >= windowMs)) hits.delete(id);
    await next();
  };
};
