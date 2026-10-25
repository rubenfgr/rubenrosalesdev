import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { knowledge as bundledKnowledge, type Knowledge } from '@rr/shared/knowledge';
import type { Db } from './db';
import { MemoryRepositories, type Repositories } from './db/repositories';
import type { Env } from './env';
import { errorBody, registerErrorHandlers } from './lib/errors';
import { requestLogger, type LogSink } from './lib/logging';
import { MemoryAnswerCache, type AnswerCache } from './services/answer-cache';
import type { LlmClient, LlmUsage } from './services/llm';
import { chatRoutes } from './routes/chat';
import { healthRoutes } from './routes/health';

export interface Deps {
  env: Env;
  db: Db;
  /** Comprobación de que la base de datos responde (inyectable para las pruebas). */
  pingDb: () => Promise<void>;
  /** Destino de los logs de petición (por defecto, stdout). */
  logSink?: LogSink;
  /** Cliente del LLM; `null` = apagado (la ruta de chat responde 503). */
  llm?: LlmClient | null;
  cache?: AnswerCache;
  /** Persistencia (por defecto en memoria, solo para pruebas; `index.ts` pasa la de Postgres). */
  repos?: Repositories;
  knowledge?: Knowledge;
  /** Control de gasto (T-7.3). */
  usage?: { allowed(): boolean; record(u: LlmUsage): void };
}

export type ResolvedDeps = Deps & { llm: LlmClient | null; cache: AnswerCache; repos: Repositories; knowledge: Knowledge };

/** Tamaño máximo del cuerpo de una petición. */
export const MAX_BODY_BYTES = 32 * 1024;

export function createApp(input: Deps) {
  const deps: ResolvedDeps = {
    ...input,
    llm: input.llm ?? null,
    cache: input.cache ?? new MemoryAnswerCache(),
    repos: input.repos ?? new MemoryRepositories(),
    knowledge: input.knowledge ?? bundledKnowledge,
  };
  const app = new Hono().basePath('/api/v1');

  app.use(requestLogger(deps.logSink));
  app.use(secureHeaders());
  app.use(bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (c) => c.json(errorBody('payload_too_large'), 413) }));
  if (deps.env.ALLOWED_ORIGIN) app.use(cors({ origin: deps.env.ALLOWED_ORIGIN, allowMethods: ['GET', 'POST'] }));

  app.route('/health', healthRoutes(deps));
  app.route('/chat', chatRoutes(deps));

  registerErrorHandlers(app);
  return app;
}
