// API para la prueba de humo (e2e/smoke.mjs): la API real con LLM, email y base de datos simulados.
// `GET /__e2e/state` (solo existe aquí) permite comprobar qué se guardó y qué email se envió.
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { createApp } from '../src/app';
import { MemoryRepositories } from '../src/db/repositories';
import { loadEnv } from '../src/env';
import type { LlmClient, LlmEvent } from '../src/services/llm';
import type { Mailer, MailMessage } from '../src/services/mailer';

const repos = new MemoryRepositories();
const sent: MailMessage[] = [];
const mailer: Mailer = { send: async (m) => void sent.push(m) };
const llm: LlmClient = {
  async *stream(): AsyncIterable<LlmEvent> {
    for (const text of ['Hago automatizaciones, ', 'webs y apps a medida. ', 'Cuéntame qué necesitas.']) {
      await new Promise((r) => setTimeout(r, 120));
      yield { type: 'text', text };
    }
    yield { type: 'done', usage: { tokensIn: 100, tokensOut: 20 } };
  },
};

const env = loadEnv({ NODE_ENV: 'test', DATABASE_URL: 'unused', RATE_LIMIT_CHAT_PER_MIN: '1000', RATE_LIMIT_LEADS_PER_HOUR: '1000' });
const api = createApp({ env, db: {} as never, pingDb: async () => {}, llm, repos, mailer, logSink: () => {} });
const root = new Hono();
root.route('/', api);
root.get('/__e2e/state', (c) =>
  c.json({ conversations: repos.conversations.size, messages: repos.messages.length, leads: repos.leads.length, emails: sent.map((m) => ({ subject: m.subject, replyTo: m.replyTo, text: m.text })) }),
);
serve({ fetch: root.fetch, port: Number(process.env.PORT ?? 4302) }, (i) => console.log(`e2e api en :${i.port}`));
