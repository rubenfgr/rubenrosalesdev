import { describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { loadEnv } from '../env';
import { MemoryRepositories } from '../db/repositories';
import { FakeLlmClient, type LlmEvent } from '../services/llm';

const base = { NODE_ENV: 'test', DATABASE_URL: 'postgres://test' };
const make = (llm: FakeLlmClient | null, extraEnv: Record<string, string> = {}) =>
  createApp({ env: loadEnv({ ...base, ...extraEnv }), db: {} as never, pingDb: async () => {}, llm, logSink: () => {} });
const post = (app: ReturnType<typeof make>, body: unknown, ip = '1.1.1.1') =>
  app.request('/api/v1/chat', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) });
const body = (content: string) => ({ lang: 'es', messages: [{ role: 'user', content }] });
const say = (t: string): LlmEvent[] => [{ type: 'text', text: t }, { type: 'done', usage: { tokensIn: 1, tokensOut: 1 } }];

describe('POST /chat', () => {
  it('503 llm_unavailable si el LLM está desactivado', async () => {
    const res = await post(make(null), body('hola'));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'llm_unavailable' });
  });

  it('400 ante entrada inválida', async () => {
    const res = await post(make(new FakeLlmClient([])), { lang: 'fr', messages: [] });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_request' });
  });

  it('streaming SSE: eventos delta y done', async () => {
    const res = await post(make(new FakeLlmClient([say('Hola. Soy el asistente.')])), body('¿Qué servicios ofreces?'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const text = await res.text();
    expect(text).toContain('event: delta');
    expect(text).toContain('"text":"Hola. "');
    expect(text).toMatch(/event: done\ndata: \{"conversationId":"[0-9a-f-]{36}","source":"llm"\}/);
  });

  it('una pregunta de reglas responde en streaming sin LLM', async () => {
    const llm = new FakeLlmClient([]);
    const text = await (await post(make(llm), body('¿Cuánto cuesta?'))).text();
    expect(text).toContain('"source":"rule"');
    expect(llm.calls).toHaveLength(0);
  });

  it('503 si el proveedor falla antes de producir texto', async () => {
    const res = await post(make(new FakeLlmClient([[{ type: 'error', reason: 'x' }]])), body('¿Qué servicios ofreces?'));
    expect(res.status).toBe(503);
  });

  it('429 al exceder el límite por IP', async () => {
    const app = make(new FakeLlmClient([]), { RATE_LIMIT_CHAT_PER_MIN: '2' });
    expect((await post(app, body('¿Cuánto cuesta?'))).status).toBe(200);
    expect((await post(app, body('¿Cuánto cuesta?'))).status).toBe(200);
    const res = await post(app, body('¿Cuánto cuesta?'));
    expect(res.status).toBe(429);
    expect((await post(app, body('¿Cuánto cuesta?'), '2.2.2.2')).status).toBe(200);
  });

  it('límite diario por IP: tras 20 llamadas al LLM, deja de llamarlo', async () => {
    const llm = new FakeLlmClient(Array.from({ length: 30 }, () => say('ok')));
    const app = make(llm, { RATE_LIMIT_CHAT_PER_MIN: '100' });
    let last = 200;
    for (let i = 0; i < 21; i++) last = (await post(app, body(`pregunta distinta número ${i} sobre servicios`))).status;
    expect(llm.calls).toHaveLength(20);
    expect(last).toBe(503);
  });
});

describe('persistencia con consentimiento', () => {
  const setup = () => {
    const repos = new MemoryRepositories();
    const lines: string[] = [];
    const app = createApp({
      env: loadEnv({ ...base, RATE_LIMIT_CHAT_PER_MIN: '100' }),
      db: {} as never,
      pingDb: async () => {},
      llm: new FakeLlmClient([say('Hago webs y automatizaciones.')]),
      repos,
      logSink: (l) => lines.push(l),
    });
    return { app, repos, lines };
  };
  const secret = 'pregunta privada sobre servicios zzz';

  it('sin consentimiento no hay filas', async () => {
    const { app, repos } = setup();
    expect((await post(app, body(secret))).status).toBe(200);
    expect(repos.conversations.size).toBe(0);
    expect(repos.messages).toHaveLength(0);
  });

  it('con consentimiento se guardan la conversación y los dos mensajes, con IP solo con hash', async () => {
    const { app, repos } = setup();
    const res = await post(app, { ...body(secret), consent: true });
    const text = await res.text();
    const id = /"conversationId":"([0-9a-f-]{36})"/.exec(text)![1]!;
    expect(repos.conversations.get(id)).toMatchObject({ lang: 'es' });
    expect(repos.conversations.get(id)!.ipHash).toMatch(/^[0-9a-f]{64}$/);
    expect(repos.messages.map((m) => [m.role, m.content])).toEqual([
      ['user', secret],
      ['assistant', 'Hago webs y automatizaciones.'],
    ]);
  });

  it('el contenido del mensaje no aparece en los logs', async () => {
    const { app, lines } = setup();
    await post(app, { ...body(secret), consent: true });
    expect(lines.join('\n')).not.toContain('zzz');
    expect(lines.join('\n')).not.toContain('1.1.1.1');
  });
});

describe('tope de gasto en el chat', () => {
  it('sin LLM disponible por presupuesto responde 503 (la web usa reglas) pero las reglas siguen sin coste', async () => {
    const llm = new FakeLlmClient([]);
    const app = createApp({ env: loadEnv({ ...base, RATE_LIMIT_CHAT_PER_MIN: '100' }), db: {} as never, pingDb: async () => {}, llm, llmAvailable: () => false, logSink: () => {} });
    expect((await post(app, body('¿Qué servicios ofreces?'))).status).toBe(503);
    expect(llm.calls).toHaveLength(0);
    const rule = await post(app, body('¿Cuánto cuesta?'));
    expect(rule.status).toBe(200);
    expect(await rule.text()).toContain('"source":"rule"');
  });
});
