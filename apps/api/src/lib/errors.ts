import type { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/** Códigos de error de la API: el cuerpo de todo error es `{ error, message? }`. */
export const errorStatus = {
  invalid_request: 400,
  not_found: 404,
  payload_too_large: 413,
  rate_limited: 429,
  internal: 500,
  llm_unavailable: 503,
  mail_unavailable: 502,
} as const satisfies Record<string, ContentfulStatusCode>;

export type ErrorCode = keyof typeof errorStatus;

export const errorBody = (error: ErrorCode, message?: string) => (message ? { error, message } : { error });

export function registerErrorHandlers(app: Hono) {
  app.notFound((c) => c.json(errorBody('not_found'), 404));
  app.onError((err, c) => {
    // Sin datos personales en el log: nunca el mensaje (el de una consulta fallida incluye sus parámetros), solo el tipo y el código.
    const code = (err as { cause?: { code?: string } })?.cause?.code;
    console.error('api: error no controlado', err instanceof Error ? err.name : 'desconocido', code ?? '');
    return c.json(errorBody('internal'), 500);
  });
}
