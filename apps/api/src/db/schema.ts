import { index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lang: text('lang').notNull(),
    /** Hash con sal de la IP (nunca la IP en claro). */
    ipHash: text('ip_hash'),
    /** Nulo = sin consentimiento: no se guardan mensajes. */
    consentAt: timestamp('consent_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull().default(sql`now() + interval '90 days'`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('conversations_expires_at_idx').on(t.expiresAt)],
);

export const messages = pgTable(
  'messages',
  {
    id: serial('id').primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: text('content').notNull(),
    tokensIn: integer('tokens_in'),
    tokensOut: integer('tokens_out'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('messages_conversation_id_idx').on(t.conversationId)],
);

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    lang: text('lang').notNull(),
    summary: jsonb('summary').$type<string[]>().notNull().default([]),
    consentAt: timestamp('consent_at', { withTimezone: true }).notNull().defaultNow(),
    /** Conservación de 12 meses (D-3). */
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull().default(sql`now() + interval '365 days'`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('leads_expires_at_idx').on(t.expiresAt)],
);

/** Caché de respuestas del LLM a preguntas de texto libre (sin datos personales). TTL de 30 días al leer. */
export const answerCache = pgTable(
  'answer_cache',
  {
    lang: text('lang').notNull(),
    questionHash: text('question_hash').notNull(),
    answer: text('answer').notNull(),
    hits: integer('hits').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.lang, t.questionHash] })],
);
