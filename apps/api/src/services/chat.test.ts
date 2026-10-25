import { estimate } from '@rr/shared';
import { knowledge } from '@rr/shared/knowledge';
import { describe, expect, it } from 'vitest';
import { MemoryAnswerCache } from './answer-cache';
import { chatTurn, MAX_LLM_USER_MESSAGES, type ChatDeps, type ChatEvent } from './chat';
import { FakeLlmClient, type LlmEvent } from './llm';

const done: LlmEvent = { type: 'done', usage: { tokensIn: 100, tokensOut: 20 } };
const say = (text: string): LlmEvent[] => [{ type: 'text', text }, done];

const run = async (deps: Partial<ChatDeps> & { llm: FakeLlmClient }, content: string, extra: object = {}) => {
  const events: ChatEvent[] = [];
  const full: ChatDeps = { knowledge, cache: new MemoryAnswerCache(), maxOutputTokens: 300, ...deps };
  const req = { lang: 'es' as const, messages: [{ role: 'user' as const, content }], ...extra };
  for await (const ev of chatTurn(full, req as never)) events.push(ev);
  return { events, text: events.flatMap((e) => (e.type === 'delta' ? [e.text] : [])).join(''), last: events[events.length - 1]! };
};

describe('chatTurn', () => {
  it('una pregunta cubierta por reglas no llama al LLM', async () => {
    const llm = new FakeLlmClient([]);
    const r = await run({ llm }, '¿Cuánto cuesta una web?');
    expect(llm.calls).toHaveLength(0);
    expect(r.last).toMatchObject({ type: 'done', source: 'rule' });
    expect(r.text).toContain(knowledge.assistant.es.actions.precio!.say[0]!);
  });

  it('la segunda pregunta idéntica sale de la caché', async () => {
    const llm = new FakeLlmClient([say('Hago automatizaciones y webs para pymes.')]);
    const cache = new MemoryAnswerCache();
    const a = await run({ llm, cache }, '¿Qué servicios ofreces?');
    expect(a.last).toMatchObject({ source: 'llm' });
    const b = await run({ llm, cache }, '  que SERVICIOS ofreces ');
    expect(llm.calls).toHaveLength(1);
    expect(b.last).toMatchObject({ source: 'cache' });
    expect(b.text).toBe(a.text);
  });

  it('no cachea respuestas con cifras ni preguntas con datos personales', async () => {
    const cache = new MemoryAnswerCache();
    const llm = new FakeLlmClient([say('ok'), say('ok')]);
    await run({ llm, cache }, 'Soy ana@example.com, ¿qué servicios ofreces?');
    await run({ llm, cache }, 'Soy ana@example.com, ¿qué servicios ofreces?');
    expect(llm.calls).toHaveLength(2);
  });

  it('el prompt enviado cabe en ~1.200 tokens y el historial se recorta', async () => {
    const llm = new FakeLlmClient([say('ok')]);
    await run({ llm }, '¿Qué servicios ofreces?');
    expect(llm.calls[0]!.system.length / 4).toBeLessThanOrEqual(1200);
    expect(llm.calls[0]!.maxOutputTokens).toBe(300);

    const long = new FakeLlmClient([say('ok')]);
    const events: ChatEvent[] = [];
    const messages = Array.from({ length: 9 }, (_, i) => ({ role: i % 2 ? ('assistant' as const) : ('user' as const), content: 'x'.repeat(900) + i }));
    messages.push({ role: 'user', content: '¿y qué más ofreces?' });
    for await (const ev of chatTurn({ knowledge, llm: long, cache: new MemoryAnswerCache(), maxOutputTokens: 300 }, { lang: 'es', messages } as never)) events.push(ev);
    expect(long.calls[0]!.turns).toHaveLength(6);
    for (const t of long.calls[0]!.turns) if ('text' in t) expect(t.text.length).toBeLessThanOrEqual(500);
  });

  it('bloquea el mensaje 13 de la conversación', async () => {
    const llm = new FakeLlmClient([say('ok')]);
    const messages = Array.from({ length: MAX_LLM_USER_MESSAGES + 1 }, () => ({ role: 'user' as const, content: 'hola qué tal' }));
    const events: ChatEvent[] = [];
    for await (const ev of chatTurn({ knowledge, llm, cache: new MemoryAnswerCache(), maxOutputTokens: 300 }, { lang: 'es', messages } as never)) events.push(ev);
    expect(events).toEqual([{ type: 'error', error: 'llm_unavailable' }]);
    expect(llm.calls).toHaveLength(0);
  });

  it('respeta allowLlm (tope de gasto / límite diario)', async () => {
    const llm = new FakeLlmClient([say('ok')]);
    const r = await run({ llm, allowLlm: () => false }, '¿Qué servicios ofreces?');
    expect(r.events).toEqual([{ type: 'error', error: 'llm_unavailable' }]);
  });

  it('herramienta estimate: la respuesta final usa el resultado y la cifra está autorizada', async () => {
    const expected = estimate(knowledge.pricing, { type: 'process', systems: 'excel', team: 'small' })!;
    const fmt = (n: number) => n.toLocaleString('es-ES');
    const llm = new FakeLlmClient([
      [{ type: 'tool_call', name: 'estimate', args: { type: 'process', systems: 'excel', team: 'small' } }, done],
      say(`Entre ${fmt(expected.minEur)} y ${fmt(expected.maxEur)} €, confianza media. No es un presupuesto.`),
    ]);
    const r = await run({ llm }, 'Quiero automatizar un proceso en Excel con un equipo pequeño');
    expect(r.text).toContain(fmt(expected.maxEur));
    expect(r.last).toMatchObject({ source: 'llm', estimate: expected });
    const second = llm.calls[1]!.turns;
    expect(second.some((t) => t.role === 'tool_result' && (t.result as { maxEur?: number }).maxEur === expected.maxEur)).toBe(true);
  });

  it('parámetros inválidos: la herramienta no da cifras y una cifra inventada se sustituye por la derivación', async () => {
    const llm = new FakeLlmClient([
      [{ type: 'tool_call', name: 'estimate', args: { type: 'luna', systems: 'excel', team: 'small' } }, done],
      say('Serán 3.000 € aproximadamente.'),
    ]);
    const blocked: number[] = [];
    const r = await run({ llm, onBlocked: () => blocked.push(1) }, 'Quiero algo');
    const toolTurn = llm.calls[1]!.turns.find((t) => t.role === 'tool_result');
    expect(toolTurn).toMatchObject({ result: { error: expect.any(String) } });
    expect(r.text).not.toContain('3.000');
    expect(r.text).toContain(knowledge.assistant.es.actions.fallback!.say[0]!);
    expect(blocked).toHaveLength(1);
    expect(r.last).not.toHaveProperty('estimate');
  });

  it('una cifra de la tabla sin estimate en la conversación se bloquea', async () => {
    const llm = new FakeLlmClient([say('Una web cuesta entre 4.000 y 15.000 €.')]);
    const r = await run({ llm }, 'Háblame de webs');
    expect(r.text).toContain(knowledge.assistant.es.actions.fallback!.say[0]!);
  });

  it('con contexto completo en la petición, esa estimación queda autorizada', async () => {
    const expected = estimate(knowledge.pricing, { type: 'web', systems: 'excel', team: 'small' })!;
    const llm = new FakeLlmClient([say(`Te salió de ${expected.minEur} a ${expected.maxEur} €, no es un presupuesto.`)]);
    const r = await run({ llm }, 'Repítemelo', { ctx: { type: 'web', systems: 'excel', team: 'small' } });
    expect(r.text).toContain(String(expected.maxEur));
  });

  it('error del proveedor -> llm_unavailable', async () => {
    const llm = new FakeLlmClient([[{ type: 'error', reason: 'x' }]]);
    const r = await run({ llm }, '¿Qué servicios ofreces?');
    expect(r.events).toEqual([{ type: 'error', error: 'llm_unavailable' }]);
  });

  it('registra el uso de tokens', async () => {
    const llm = new FakeLlmClient([say('ok')]);
    const used: unknown[] = [];
    await run({ llm, recordUsage: (u) => used.push(u) }, '¿Qué servicios ofreces?');
    expect(used).toEqual([{ tokensIn: 100, tokensOut: 20 }]);
  });
});
