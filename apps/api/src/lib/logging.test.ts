import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { requestLogger } from './logging';

describe('logging', () => {
  const setup = () => {
    const lines: string[] = [];
    const app = new Hono();
    app.use(requestLogger((l) => lines.push(l)));
    app.post('/chat', (c) => c.json({ ok: true }));
    return { app, lines };
  };

  it('registra una línea JSON sin el cuerpo ni la query', async () => {
    const { app, lines } = setup();
    await app.request('/chat?email=q@example.com', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.9' },
      body: JSON.stringify({ email: 'persona@example.com', text: 'hola, soy Ana' }),
    });
    expect(lines).toHaveLength(1);
    const log = JSON.parse(lines[0]!);
    expect(Object.keys(log).sort()).toEqual(['method', 'ms', 'path', 'requestId', 'status']);
    expect(log).toMatchObject({ method: 'POST', path: '/chat', status: 200 });
    expect(lines[0]).not.toMatch(/persona@example\.com|q@example\.com|Ana|203\.0\.113\.9/);
  });

  it('genera x-request-id y respeta uno válido', async () => {
    const { app } = setup();
    const a = await app.request('/chat', { method: 'POST' });
    expect(a.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
    const b = await app.request('/chat', { method: 'POST', headers: { 'x-request-id': 'abc-123' } });
    expect(b.headers.get('x-request-id')).toBe('abc-123');
    const c = await app.request('/chat', { method: 'POST', headers: { 'x-request-id': 'mal id <x>' } });
    expect(c.headers.get('x-request-id')).not.toContain('<');
  });
});
