import { chatRequestSchema } from '@rr/shared';
import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { ResolvedDeps } from '../app';
import { dailyCounter, hashIp } from '../lib/daily-counter';
import { errorBody } from '../lib/errors';
import { clientIp, rateLimit } from '../lib/rate-limit';
import { validate } from '../lib/validate';
import { chatTurn, type ChatEvent } from '../services/chat';

/** Mensajes al LLM por IP y día; a partir de ahí, solo reglas (T-3.8). */
const LLM_PER_IP_PER_DAY = 20;

export const chatRoutes = (deps: ResolvedDeps) => {
  const { env, llm, cache, knowledge } = deps;
  const daily = dailyCounter(LLM_PER_IP_PER_DAY);
  const r = new Hono();
  r.use(rateLimit({ limit: env.RATE_LIMIT_CHAT_PER_MIN, windowMs: 60_000 }));

  r.post('/', validate('json', chatRequestSchema), async (c) => {
    if (!llm) return c.json(errorBody('llm_unavailable'), 503);
    const req = c.req.valid('json');
    const ipKey = hashIp(clientIp(c), env.IP_HASH_SALT);
    const events = chatTurn(
      {
        knowledge,
        llm,
        cache,
        maxOutputTokens: env.ASSISTANT_LLM_MAX_OUTPUT_TOKENS,
        allowLlm: () => (deps.usage?.allowed() ?? true) && daily.take(ipKey),
        ...(deps.usage ? { recordUsage: (u) => deps.usage!.record(u) } : {}),
        onBlocked: () => console.warn('chat: respuesta bloqueada por el validador de cifras'),
      },
      req,
      c.req.raw.signal,
    );

    // Si falla antes de producir texto, responde 503 normal para que la web degrade a reglas.
    const first = await events.next();
    if (first.done || first.value.type === 'error') return c.json(errorBody('llm_unavailable'), 503);

    const conversationId = req.conversationId ?? randomUUID();
    const send = async (stream: { writeSSE: (m: { event: string; data: string }) => Promise<void> }, ev: ChatEvent) => {
      if (ev.type === 'delta') await stream.writeSSE({ event: 'delta', data: JSON.stringify({ text: ev.text }) });
      else if (ev.type === 'done')
        await stream.writeSSE({ event: 'done', data: JSON.stringify({ conversationId, source: ev.source, ...(ev.estimate ? { estimate: ev.estimate } : {}) }) });
      else await stream.writeSSE({ event: 'error', data: JSON.stringify({ error: ev.error }) });
    };
    return streamSSE(c, async (stream) => {
      await send(stream, first.value);
      for await (const ev of events) await send(stream, ev);
    });
  });

  return r;
};
