import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';
import { loadEnv } from '../env';
import { FakeMailer } from '../services/mailer';

const setup = (mailer: FakeMailer | null = new FakeMailer(), extra: Record<string, string> = {}) => ({
  mailer,
  app: createApp({ env: loadEnv({ NODE_ENV: 'test', DATABASE_URL: 'postgres://t', ...extra }), db: {} as never, pingDb: async () => {}, mailer, logSink: () => {} }),
});
const valid = {
  lang: 'es', mode: 'guided', goals: ['repetitive', 'connect'], size: '6-20', when: 'quarter', tools: ['excel', 'Odoo'],
  message: 'Quiero conectar mi Excel con el ERP y dejar de copiar datos.', name: 'Ana', company: 'Taller Ana', email: 'ana@example.com',
  preference: 'call', phone: '600123123', consent: true, startedAt: Date.now() - 10_000,
};
const post = (app: ReturnType<typeof setup>['app'], body: unknown, ip = '4.4.4.4') =>
  app.request('/api/v1/contact', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) });

describe('POST /contact', () => {
  it('envía el email con el mismo formato que la web (etiquetas en español, Reply-To del visitante)', async () => {
    const { app, mailer } = setup();
    const res = await post(app, valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const m = mailer!.sent[0]!;
    expect(m).toMatchObject({ replyTo: 'ana@example.com', replyToName: 'Ana', subject: 'Contacto web: Ana' });
    expect(m.text).toBe(
      [
        'Nombre: Ana', 'Email: ana@example.com', 'Empresa: Taller Ana', 'Modo: guided', 'Idioma de la web: es',
        'Preferencia: llamada (600123123)', 'Objetivos: Quitar tareas repetitivas, Conectar mis programas', 'Equipo: 6–20',
        'Plazo: Este trimestre', 'Programas: excel, Odoo', '', 'Quiero conectar mi Excel con el ERP y dejar de copiar datos.',
      ].join('\n'),
    );
  });

  it('campos opcionales vacíos salen con «-»', async () => {
    const { app, mailer } = setup();
    await post(app, { ...valid, goals: [], size: '', when: '', tools: [], company: '', preference: 'email', phone: '' });
    expect(mailer!.sent[0]!.text).toContain('Empresa: -\nModo: guided');
    expect(mailer!.sent[0]!.text).toContain('Preferencia: email\nObjetivos: -\nEquipo: -\nPlazo: -\nProgramas: -');
  });

  it('señuelo relleno: 200 sin enviar', async () => {
    const { app, mailer } = setup();
    expect((await post(app, { ...valid, website: 'x' })).status).toBe(200);
    expect(mailer!.sent).toHaveLength(0);
  });

  it('valida (mensaje corto, email, consentimiento) y el tiempo mínimo', async () => {
    const { app } = setup();
    for (const bad of [{ ...valid, message: 'corto' }, { ...valid, email: 'no' }, { ...valid, consent: false }, { ...valid, startedAt: Date.now() - 500 }]) {
      expect((await post(app, bad)).status).toBe(400);
    }
  });

  it('502 mail_unavailable si el email falla o no está configurado, sin datos personales en el log', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const mailer of [new FakeMailer(true), null]) {
      const res = await post(setup(mailer).app, valid);
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({ error: 'mail_unavailable' });
    }
    expect(spy.mock.calls.flat().join(' ')).not.toContain('ana@example.com');
    spy.mockRestore();
  });

  it('429 al superar el límite por hora', async () => {
    const { app } = setup(new FakeMailer(), { RATE_LIMIT_LEADS_PER_HOUR: '1' });
    expect((await post(app, valid)).status).toBe(200);
    expect((await post(app, valid)).status).toBe(429);
  });
});
