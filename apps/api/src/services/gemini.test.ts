import { describe, expect, it } from 'vitest';
import { GeminiClient, toContents } from './gemini';
import { FakeLlmClient, type LlmEvent } from './llm';

const sse = (...chunks: object[]) => chunks.map((c) => `data: ${JSON.stringify(c)}\r\n\r\n`).join('');
const respond = (body: string, status = 200) => async () => new Response(body, { status });
const collect = async (it: AsyncIterable<LlmEvent>) => {
  const out: LlmEvent[] = [];
  for await (const e of it) out.push(e);
  return out;
};
const input = { system: 's', turns: [{ role: 'user' as const, text: 'hola' }], maxOutputTokens: 300 };

describe('GeminiClient', () => {
  it('emite texto en streaming y el uso de tokens', async () => {
    const body = sse(
      { candidates: [{ content: { parts: [{ text: 'Ho' }] } }] },
      { candidates: [{ content: { parts: [{ text: 'la' }] } }], usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 4, thoughtsTokenCount: 2 } },
    );
    const c = new GeminiClient({ apiKey: 'k', model: 'm', fetchImpl: respond(body) as never });
    expect(await collect(c.stream(input))).toEqual([
      { type: 'text', text: 'Ho' },
      { type: 'text', text: 'la' },
      { type: 'done', usage: { tokensIn: 10, tokensOut: 6 } },
    ]);
  });


  it('error del proveedor (tras un reintento) -> evento error sin filtrar el cuerpo', async () => {
    let calls = 0;
    const f = async () => (calls++, new Response('clave inválida SECRETO', { status: 503 }));
    const c = new GeminiClient({ apiKey: 'k', model: 'm', fetchImpl: f as never });
    const events = await collect(c.stream(input));
    expect(calls).toBe(2);
    expect(events).toEqual([{ type: 'error', reason: 'proveedor 503' }]);
  });

  it('error de red -> evento error', async () => {
    const c = new GeminiClient({ apiKey: 'k', model: 'm', fetchImpl: (async () => { throw new TypeError('x'); }) as never });
    expect((await collect(c.stream(input)))[0]).toMatchObject({ type: 'error' });
  });

  it('la clave va en cabecera, no en la URL', async () => {
    let seen: { url: string; headers: Record<string, string> } | undefined;
    const f = async (url: string, init: RequestInit) => ((seen = { url, headers: init.headers as Record<string, string> }), new Response(sse({}), { status: 200 }));
    await collect(new GeminiClient({ apiKey: 'clave-x', model: 'gemini-3.5-flash-lite', fetchImpl: f as never }).stream(input));
    expect(seen!.url).toContain('models/gemini-3.5-flash-lite:streamGenerateContent?alt=sse');
    expect(seen!.url).not.toContain('clave-x');
    expect(seen!.headers['x-goog-api-key']).toBe('clave-x');
  });
});

describe('toContents', () => {
  it('traduce roles y une turnos contiguos del mismo rol', () => {
    expect(toContents([{ role: 'user', text: 'a' }, { role: 'user', text: 'b' }, { role: 'assistant', text: 'c' }])).toEqual([
      { role: 'user', parts: [{ text: 'a' }, { text: 'b' }] },
      { role: 'model', parts: [{ text: 'c' }] },
    ]);
  });
});

describe('FakeLlmClient', () => {
  it('reproduce guiones y cuenta llamadas', async () => {
    const f = new FakeLlmClient([[{ type: 'text', text: 'x' }, { type: 'done', usage: { tokensIn: 1, tokensOut: 1 } }]]);
    expect(await collect(f.stream(input))).toHaveLength(2);
    expect(f.calls).toHaveLength(1);
  });
});
