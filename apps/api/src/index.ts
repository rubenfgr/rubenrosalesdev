import { serve } from '@hono/node-server';
import { sql } from 'drizzle-orm';
import { createApp } from './app';
import { createDb } from './db';
import { loadEnv } from './env';
import { DbRepositories } from './db/repositories';
import { DbAnswerCache } from './services/answer-cache';
import { startPurgeJob } from './jobs/purge';
import { BudgetGuard, DbUsageStore } from './services/budget';
import { createMailer } from './services/mailer';
import { createLlmClient } from './services/llm-factory';

const env = loadEnv();
const { db, client } = createDb(env.DATABASE_URL);
const repos = new DbRepositories(db, { conversationDays: env.CONVERSATION_RETENTION_DAYS, leadDays: env.LEAD_RETENTION_DAYS });
const budget = new BudgetGuard({
  provider: env.ASSISTANT_LLM_PROVIDER,
  budgetEur: env.ASSISTANT_LLM_MONTHLY_BUDGET_EUR,
  priceInPerMtok: env.ASSISTANT_LLM_PRICE_IN_PER_MTOK,
  priceOutPerMtok: env.ASSISTANT_LLM_PRICE_OUT_PER_MTOK,
  store: new DbUsageStore(db),
});
await budget.init();
const llm = createLlmClient(env, budget);
const app = createApp({ env, db, llm, llmAvailable: () => llm?.available() ?? false, mailer: createMailer(env), cache: new DbAnswerCache(db), repos, pingDb: async () => void (await db.execute(sql`select 1`)) });

startPurgeJob(repos);

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => console.log(`api escuchando en :${info.port}`));

const shutdown = async () => {
  server.close();
  await client.end();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
