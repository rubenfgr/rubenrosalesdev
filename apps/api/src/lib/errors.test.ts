import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { registerErrorHandlers } from './errors';
import { validate } from './validate';

const make = () => {
  const app = new Hono();
  app.post('/echo', validate('json', z.object({ n: z.number() })), (c) => c.json(c.req.valid('json')));
  app.get('/boom', () => {
    throw new Error('secreto@example.com');
  });
  registerErrorHandlers(app);
  return app;
};

const post = (body: unknown) =>
  make().request('/echo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

describe('errores de la API', () => {
  it('400 invalid_request si la entrada no cumple el esquema', async () => {
    const res = await post({ n: 'no' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_request' });
  });

  it('acepta una entrada válida', async () => {
    const res = await post({ n: 3 });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ n: 3 });
  });

  it('404 not_found en JSON', async () => {
    const res = await make().request('/nada');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_found' });
  });

  it('500 internal sin filtrar el mensaje del error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await make().request('/boom');
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'internal' });
    expect(spy.mock.calls.flat().join(' ')).not.toContain('secreto@example.com'); // el mensaje del error no llega al log
    spy.mockRestore();
  });
});
