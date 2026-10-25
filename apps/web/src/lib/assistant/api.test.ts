import { describe, expect, it } from 'vitest';
import { LlmUnavailable, sendLead, streamChat } from './api';

const ID = '3f6c1d0e-6a53-4b6c-9a6f-0a1b2c3d4e5f';
const req = { lang: 'es' as const, messages: [{ role: 'user' as const, content: 'hola' }] };
const sse = (...events: [string, object][]) => events.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join('');
const streamOf = (chunks: string[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      const enc = new TextEncoder();
      for (const ch of chunks) c.enqueue(enc.encode(ch));
      c.close();
    },
  });
const ok = (chunks: string[]) => (async () => new Response(streamOf(chunks), { status: 200 })) as unknown as typeof fetch;

describe('streamChat', () => {
  it('entrega los deltas en orden y devuelve done, aunque los eventos lleguen partidos', async () => {
    const body = sse(['delta', { text: 'Ho' }], ['delta', { text: 'la' }], ['done', { conversationId: ID, source: 'llm' }]);
    const parts = [body.slice(0, 17), body.slice(17, 60), body.slice(60)];
    const got: string[] = [];
    const done = await streamChat(req, (t) => got.push(t), { fetchImpl: ok(parts) });
    expect(got).toEqual(['Ho', 'la']);
    expect(done).toMatchObject({ conversationId: ID, source: 'llm' });
  });

  it('503 -> LlmUnavailable', async () => {
    const f = (async () => new Response('{"error":"llm_unavailable"}', { status: 503 })) as unknown as typeof fetch;
    await expect(streamChat(req, () => {}, { fetchImpl: f })).rejects.toBeInstanceOf(LlmUnavailable);
  });

  it('corte de red -> LlmUnavailable', async () => {
    const f = (async () => {
      throw new TypeError('network');
    }) as unknown as typeof fetch;
    await expect(streamChat(req, () => {}, { fetchImpl: f })).rejects.toMatchObject({ partial: false });
  });

  it('corte a mitad de respuesta -> LlmUnavailable con partial', async () => {
    const f = ok([sse(['delta', { text: 'Ho' }])]);
    await expect(streamChat(req, () => {}, { fetchImpl: f })).rejects.toMatchObject({ partial: true });
  });

  it('evento error -> LlmUnavailable', async () => {
    const f = ok([sse(['error', { error: 'llm_unavailable' }])]);
    await expect(streamChat(req, () => {}, { fetchImpl: f })).rejects.toBeInstanceOf(LlmUnavailable);
  });

  it('un evento con forma inválida no se acepta', async () => {
    const f = ok([sse(['done', { conversationId: 'no-uuid', source: 'llm' }])]);
    await expect(streamChat(req, () => {}, { fetchImpl: f })).rejects.toBeInstanceOf(LlmUnavailable);
  });

  it('cancelar con la señal propaga el aborto (no es un fallo del LLM)', async () => {
    const ac = new AbortController();
    ac.abort();
    const f = (async (_u: string, init: RequestInit) => {
      init.signal?.throwIfAborted();
      return new Response();
    }) as unknown as typeof fetch;
    await expect(streamChat(req, () => {}, { fetchImpl: f, signal: ac.signal })).rejects.not.toBeInstanceOf(LlmUnavailable);
  });
});

describe('sendLead', () => {
  const lead = { name: 'Ana', email: 'ana@example.com', consent: true as const, lang: 'es' as const, summary: [], startedAt: 1 };
  it('envía el lead con el señuelo vacío', async () => {
    let sent: { url: string; body: Record<string, unknown> } | undefined;
    const f = (async (url: string, init: RequestInit) => {
      sent = { url, body: JSON.parse(init.body as string) };
      return new Response('{"ok":true}');
    }) as unknown as typeof fetch;
    await sendLead(lead, { fetchImpl: f });
    expect(sent!.url).toBe('/api/v1/leads');
    expect(sent!.body.website).toBe('');
  });
  it('lanza si la API responde error', async () => {
    const f = (async () => new Response('', { status: 502 })) as unknown as typeof fetch;
    await expect(sendLead(lead, { fetchImpl: f })).rejects.toThrow('502');
  });
});
