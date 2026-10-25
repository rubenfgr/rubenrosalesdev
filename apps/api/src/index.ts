import { serve } from '@hono/node-server';
import { sql } from 'drizzle-orm';
import { createApp } from './app';
import { createDb } from './db';
import { loadEnv } from './env';

const env = loadEnv();
const { db, client } = createDb(env.DATABASE_URL);
const app = createApp({ env, db, pingDb: async () => void (await db.execute(sql`select 1`)) });

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => console.log(`api escuchando en :${info.port}`));

const shutdown = async () => {
  server.close();
  await client.end();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
