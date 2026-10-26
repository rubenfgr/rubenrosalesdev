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

  it('detrás de Cloudflare cuenta por CF-Connecting-IP, aunque X-Forwarded-For cambie en cada petición', async () => {
    const { get2 } = (() => {
      let t = 1_000_000;
      const app = new Hono();
      app.use(rateLimit({ limit: 2, windowMs: 60_000, now: () => t }));
      app.get('/', (c) => c.text('ok'));
      return { get2: (xff: string, cf: string) => app.request('/', { headers: { 'x-forwarded-for': xff, 'cf-connecting-ip': cf } }) };
    })();
    expect((await get2('172.70.0.1', '203.0.113.7')).status).toBe(200);
    expect((await get2('172.71.9.9', '203.0.113.7')).status).toBe(200);
    expect((await get2('104.23.5.5', '203.0.113.7')).status).toBe(429); // mismo visitante, otro borde de Cloudflare
    expect((await get2('172.70.0.1', '198.51.100.9')).status).toBe(200); // otro visitante
  });

  it('ignora un CF-Connecting-IP con forma inválida y cae al X-Forwarded-For', async () => {
    const { get } = setup(1, 60_000);
    const app = new Hono();
    app.use(rateLimit({ limit: 1, windowMs: 60_000 }));
    app.get('/', (c) => c.text('ok'));
    const hit = () => app.request('/', { headers: { 'cf-connecting-ip': '<script>', 'x-forwarded-for': '1.1.1.1' } });
    expect((await hit()).status).toBe(200);
    expect((await hit()).status).toBe(429);
    void get;
  });

  it('cuenta cada IP por separado y usa solo el primer salto', async () => {
    const { get } = setup(1, 60_000);
    expect((await get('1.1.1.1')).status).toBe(200);
    expect((await get('2.2.2.2')).status).toBe(200);
    expect((await get('1.1.1.1, 9.9.9.9')).status).toBe(429);
  });
});
