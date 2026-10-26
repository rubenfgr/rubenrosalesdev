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

export const chatRoutes = (deps: ResolvedDeps) => {
  const { env, llm, cache, knowledge, repos } = deps;
  const daily = dailyCounter(env.ASSISTANT_LLM_PER_IP_PER_DAY);
  const r = new Hono();
  r.use(rateLimit({ limit: env.RATE_LIMIT_CHAT_PER_MIN, windowMs: 60_000 }));

  r.post('/', validate('json', chatRequestSchema), async (c) => {
    if (!llm) return c.json(errorBody('llm_unavailable'), 503);
    const req = c.req.valid('json');
    const ipKey = hashIp(clientIp(c), env.IP_HASH_SALT);
    let lastUsage: { tokensIn: number; tokensOut: number } | undefined;
    const events = chatTurn(
      {
        knowledge,
        llm,
        cache,
        maxOutputTokens: env.ASSISTANT_LLM_MAX_OUTPUT_TOKENS,
        allowLlm: () => ((deps.llmAvailable?.() ?? true) ? (daily.take(ipKey) ? null : 'limite_diario_ip') : 'presupuesto'),
        recordUsage: (u) => {
          lastUsage = u;
        },
        onBlocked: () => console.warn('chat: respuesta bloqueada por el validador de cifras'),
      },
      req,
      c.req.raw.signal,
    );

    // Si falla antes de producir texto, responde 503 normal para que la web degrade a reglas.
    const first = await events.next();
    if (first.done) return c.json(errorBody('llm_unavailable'), 503);
    if (first.value.type === 'error') {
      // El motivo (sin contenido ni datos personales) ayuda a diagnosticar por qué la web cae a reglas.
      console.warn(`chat: llm_unavailable (${first.value.reason})`);
      return c.json(errorBody('llm_unavailable'), 503);
    }

    // Persistencia solo con consentimiento (D-3). Sin él, la conversación es efímera.
    let conversationId = req.conversationId ?? randomUUID();
    let persist = false;
    if (req.consent === true) {
      try {
        conversationId = await repos.createConversation({ id: req.conversationId, lang: req.lang, ipHash: ipKey });
        persist = true;
      } catch {
        console.error('chat: no se pudo crear la conversación'); // sin contenido
      }
    }
    const send = async (stream: { writeSSE: (m: { event: string; data: string }) => Promise<void> }, ev: ChatEvent) => {
      if (ev.type === 'delta') await stream.writeSSE({ event: 'delta', data: JSON.stringify({ text: ev.text }) });
      else if (ev.type === 'done')
        await stream.writeSSE({ event: 'done', data: JSON.stringify({ conversationId, source: ev.source }) });
      else {
        console.warn(`chat: llm_unavailable a mitad de respuesta (${ev.reason})`);
        await stream.writeSSE({ event: 'error', data: JSON.stringify({ error: ev.error }) });
      }
    };
    return streamSSE(c, async (stream) => {
      let answer = '';
      const handle = async (ev: ChatEvent) => {
        if (ev.type === 'delta') answer += ev.text;
        await send(stream, ev);
      };
      await handle(first.value);
      for await (const ev of events) await handle(ev);
      if (persist) {
        try {
          await repos.appendMessage(conversationId, 'user', req.messages[req.messages.length - 1]!.content);
          await repos.appendMessage(conversationId, 'assistant', answer, lastUsage);
        } catch {
          console.error('chat: no se pudo guardar el mensaje'); // sin contenido
        }
      }
    });
  });

  return r;
};
