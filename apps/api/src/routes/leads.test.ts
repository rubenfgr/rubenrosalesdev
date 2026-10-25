import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';
import { MemoryRepositories } from '../db/repositories';
import { loadEnv } from '../env';
import { FakeMailer } from '../services/mailer';

const setup = (mailer: FakeMailer | null = new FakeMailer(), extraEnv: Record<string, string> = {}) => {
  const repos = new MemoryRepositories();
  const app = createApp({ env: loadEnv({ NODE_ENV: 'test', DATABASE_URL: 'postgres://test', ...extraEnv }), db: {} as never, pingDb: async () => {}, repos, mailer, logSink: () => {} });
  return { app, repos, mailer };
};
const valid = { name: 'Ana', email: 'ana@example.com', consent: true, lang: 'es', summary: ['Proyecto: web', 'Rango: 1.500 – 6.000 €'], startedAt: Date.now() - 10_000 };
const post = (app: ReturnType<typeof setup>['app'], body: unknown, ip = '3.3.3.3') =>
  app.request('/api/v1/leads', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) });

describe('POST /leads', () => {
  it('guarda el lead y envía el email con nombre, email, idioma y resumen', async () => {
    const { app, repos, mailer } = setup();
    const res = await post(app, valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(repos.leads).toHaveLength(1);
    const sent = mailer!.sent[0]!;
    expect(sent).toMatchObject({ replyTo: 'ana@example.com', replyToName: 'Ana', subject: 'Asistente web: Ana' });
    expect(sent.text).toContain('Nombre: Ana');
    expect(sent.text).toContain('Email: ana@example.com');
    expect(sent.text).toContain('Idioma de la web: es');
    expect(sent.text).toContain('Rango: 1.500 – 6.000 €');
  });

  it('señuelo relleno: 200 sin guardar ni enviar', async () => {
    const { app, repos, mailer } = setup();
    const res = await post(app, { ...valid, website: 'http://spam.example' });
    expect(res.status).toBe(200);
    expect(repos.leads).toHaveLength(0);
    expect(mailer!.sent).toHaveLength(0);
  });

  it('rechaza si se envía antes de 3 s o con un formulario de hace más de 24 h', async () => {
    const { app, repos } = setup();
    expect((await post(app, { ...valid, startedAt: Date.now() - 500 })).status).toBe(400);
    expect((await post(app, { ...valid, startedAt: Date.now() - 25 * 3_600_000 })).status).toBe(400);
    expect(repos.leads).toHaveLength(0);
  });

  it('valida email, nombre y consentimiento', async () => {
    const { app } = setup();
    for (const bad of [{ ...valid, email: 'no' }, { ...valid, name: '' }, { ...valid, consent: false }]) {
      const res = await post(app, bad);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid_request' });
    }
  });

  it('si el email falla, el lead queda guardado y responde 502 mail_unavailable', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { app, repos } = setup(new FakeMailer(true));
    const res = await post(app, valid);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'mail_unavailable' });
    expect(repos.leads).toHaveLength(1);
    expect(spy.mock.calls.flat().join(' ')).not.toContain('ana@example.com');
    spy.mockRestore();
  });

  it('429 al superar los envíos por hora', async () => {
    const { app } = setup(new FakeMailer(), { RATE_LIMIT_LEADS_PER_HOUR: '2' });
    expect((await post(app, valid)).status).toBe(200);
    expect((await post(app, valid)).status).toBe(200);
    expect((await post(app, valid)).status).toBe(429);
  });
});
