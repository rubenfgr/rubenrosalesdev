import { describe, expect, it } from 'vitest';
import { createApp } from './app';
import { loadEnv } from './env';

const env = loadEnv({ NODE_ENV: 'test', DATABASE_URL: 'postgres://test' });
const make = (ping: () => Promise<void>) => createApp({ env, db: {} as never, pingDb: ping });

describe('api', () => {
  it('health responde ok si la base de datos responde', async () => {
    const res = await make(async () => {}).request('/api/v1/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('health responde 503 si la base de datos falla', async () => {
    const res = await make(async () => { throw new Error('down'); }).request('/api/v1/health');
    expect(res.status).toBe(503);
  });

  it('una ruta desconocida da 404 en JSON', async () => {
    const res = await make(async () => {}).request('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_found' });
  });
});

describe('límites de la API', () => {
  it('un cuerpo mayor de 32 KB da 413 en JSON', async () => {
    const res = await make(async () => {}).request('/api/v1/health', {
      method: 'POST',
      headers: { 'content-length': String(40 * 1024) },
      body: 'x'.repeat(40 * 1024),
    });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'payload_too_large' });
  });

  it('añade cabeceras de seguridad y x-request-id', async () => {
    const res = await make(async () => {}).request('/api/v1/health');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});
