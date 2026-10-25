import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
  const setup = (limit: number, windowMs: number) => {
    let t = 1_000_000;
    const app = new Hono();
    app.use(rateLimit({ limit, windowMs, now: () => t }));
    app.get('/', (c) => c.text('ok'));
    const get = (ip: string) => app.request('/', { headers: { 'x-forwarded-for': ip } });
    return { get, advance: (ms: number) => (t += ms) };
  };

  it('la petición n+1 recibe 429 con Retry-After y vuelve a pasar tras la ventana', async () => {
    const { get, advance } = setup(3, 60_000);
    for (let i = 0; i < 3; i++) expect((await get('1.1.1.1')).status).toBe(200);
    const blocked = await get('1.1.1.1');
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({ error: 'rate_limited' });
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
    advance(60_001);
    expect((await get('1.1.1.1')).status).toBe(200);
  });

  it('cuenta cada IP por separado y usa solo el primer salto', async () => {
    const { get } = setup(1, 60_000);
    expect((await get('1.1.1.1')).status).toBe(200);
    expect((await get('2.2.2.2')).status).toBe(200);
    expect((await get('1.1.1.1, 9.9.9.9')).status).toBe(429);
  });
});
