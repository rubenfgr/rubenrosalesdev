import { describe, expect, it } from 'vitest';
import { FakeLlmClient, type LlmEvent } from './llm';
import { chatTurn } from './chat';
import { MemoryAnswerCache } from './answer-cache';
import { knowledge } from '@rr/shared/knowledge';
import { estimate } from '@rr/shared';
import { OllamaClient, toMessages } from './ollama';

const collect = async (it: AsyncIterable<LlmEvent>) => {
  const out: LlmEvent[] = [];
  for await (const e of it) out.push(e);
  return out;
};
const ndjson = (...lines: object[]) => lines.map((l) => JSON.stringify(l) + '\n').join('');
const input = { system: 's', turns: [{ role: 'user' as const, text: 'hola' }], maxOutputTokens: 300 };

describe('OllamaClient (servidor simulado)', () => {
  it('emite texto en streaming y el uso de tokens', async () => {
    let sent: { url: string; body: { stream: boolean; options: { num_predict: number }; model: string } } | undefined;
    const f = async (url: string, init: RequestInit) => {
      sent = { url, body: JSON.parse(init.body as string) };
      return new Response(
        ndjson(
          { message: { role: 'assistant', content: 'Ho' }, done: false },
          { message: { role: 'assistant', content: 'la' }, done: false },
          { message: { role: 'assistant', content: '' }, done: true, prompt_eval_count: 11, eval_count: 5 },
        ),
      );
    };
    const c = new OllamaClient({ baseUrl: 'http://ollama:11434/', model: 'm', fetchImpl: f as never });
    expect(await collect(c.stream(input))).toEqual([
      { type: 'text', text: 'Ho' },
      { type: 'text', text: 'la' },
      { type: 'done', usage: { tokensIn: 11, tokensOut: 5 } },
    ]);
    expect(sent!.url).toBe('http://ollama:11434/api/chat');
    expect(sent!.body).toMatchObject({ stream: true, model: 'm', options: { num_predict: 300 } });
  });

  it('error HTTP o de red -> evento error', async () => {
    const bad = new OllamaClient({ baseUrl: 'http://x', model: 'm', fetchImpl: (async () => new Response('', { status: 500 })) as never });
    expect(await collect(bad.stream(input))).toEqual([{ type: 'error', reason: 'ollama 500' }]);
    const down = new OllamaClient({ baseUrl: 'http://x', model: 'm', fetchImpl: (async () => { throw new TypeError('x'); }) as never });
    expect((await collect(down.stream(input)))[0]).toMatchObject({ type: 'error' });
  });

  it('toMessages omite turnos de herramienta', () => {
    expect(toMessages('s', [{ role: 'user', text: 'a' }, { role: 'tool_call', name: 'x', args: {} }])).toEqual([
      { role: 'system', content: 's' },
      { role: 'user', content: 'a' },
    ]);
  });
});

describe('proveedor sin function calling', () => {
  it('no envía herramientas y entrega la estimación del contexto como dato en el prompt', async () => {
    const llm = new FakeLlmClient([[{ type: 'text', text: 'ok' }, { type: 'done', usage: { tokensIn: 1, tokensOut: 1 } }]]);
    Object.defineProperty(llm, 'supportsTools', { value: false });
    const ctx = { type: 'web', systems: 'excel', team: 'small' };
    const est = estimate(knowledge.pricing, ctx as never)!;
    for await (const _ of chatTurn({ knowledge, llm, cache: new MemoryAnswerCache(), maxOutputTokens: 300 }, { lang: 'es', messages: [{ role: 'user', content: 'Cuéntame más' }], ctx } as never));
    expect(llm.calls[0]!.tools).toEqual([]);
    expect(llm.calls[0]!.system).toContain(`${est.minEur}–${est.maxEur} €`);
  });
});
