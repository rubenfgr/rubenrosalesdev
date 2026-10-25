// Cliente de la API del asistente (`/api/v1`): chat por SSE y envío del resumen (lead).
import { chatDeltaEventSchema, chatDoneEventSchema, chatErrorEventSchema, type ChatDoneEvent, type ChatRequest, type Contact, type Lead } from '@rr/shared';

/** El LLM no está disponible (503, límite, error de red o corte): la isla degrada al motor de reglas. */
export class LlmUnavailable extends Error {
  /** `true` si ya se había recibido texto cuando se cortó. */
  constructor(readonly partial = false) {
    super('llm_unavailable');
  }
}

const TIMEOUT_MS = 30_000;
const BASE = '/api/v1';

interface Options {
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  base?: string;
}

/** Lee un cuerpo SSE y llama a `onEvent` por cada evento completo. */
async function readSse(body: ReadableStream<Uint8Array>, onEvent: (event: string, data: string) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  const flush = (block: string) => {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
    }
    if (data.length) onEvent(event, data.join('\n'));
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buf += decoder.decode(value, { stream: true });
    const blocks = buf.split(/\r?\n\r?\n/);
    buf = blocks.pop() ?? '';
    for (const block of blocks) flush(block);
    if (done) {
      if (buf.trim()) flush(buf);
      return;
    }
  }
}

/** Envía un turno y entrega el texto a medida que llega. Devuelve el evento `done`. */
export async function streamChat(req: ChatRequest, onDelta: (text: string) => void, opts: Options = {}): Promise<ChatDoneEvent> {
  const { fetchImpl = fetch, base = BASE } = opts;
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout;
  let received = false;
  let done: ChatDoneEvent | undefined;
  try {
    const res = await fetchImpl(`${base}/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
      signal,
    });
    if (!res.ok || !res.body) throw new LlmUnavailable();
    await readSse(res.body, (event, data) => {
      const json: unknown = JSON.parse(data);
      if (event === 'delta') {
        onDelta(chatDeltaEventSchema.parse(json).text);
        received = true;
      } else if (event === 'done') done = chatDoneEventSchema.parse(json);
      else if (event === 'error') {
        chatErrorEventSchema.parse(json);
        throw new LlmUnavailable(received);
      }
    });
  } catch (err) {
    if (opts.signal?.aborted) throw err;
    throw err instanceof LlmUnavailable ? err : new LlmUnavailable(received);
  }
  if (!done) throw new LlmUnavailable(received);
  return done;
}

/** Envía el formulario de contacto (guiado o directo). Lanza si la API no responde bien. */
export async function sendContact(form: Omit<Contact, 'website'> & { website?: string }, opts: Options = {}): Promise<void> {
  const { fetchImpl = fetch, base = BASE } = opts;
  const res = await fetchImpl(`${base}/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ website: '', ...form }),
    ...(opts.signal ? { signal: opts.signal } : {}),
  });
  if (!res.ok) throw new Error(String(res.status));
}

/** Envía el resumen a Rubén. Lanza si la API no responde bien. */
export async function sendLead(lead: Omit<Lead, 'website'> & { website?: string }, opts: Options = {}): Promise<void> {
  const { fetchImpl = fetch, base = BASE } = opts;
  const res = await fetchImpl(`${base}/leads`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ website: '', ...lead }),
    ...(opts.signal ? { signal: opts.signal } : {}),
  });
  if (!res.ok) throw new Error(String(res.status));
}
