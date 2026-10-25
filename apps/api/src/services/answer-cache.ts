import { createHash } from 'node:crypto';
import { and, eq, gt, sql } from 'drizzle-orm';
import type { Db } from '../db';
import { answerCache } from '../db/schema';
import { normalize } from '../lib/text';

const TTL_DAYS = 30;

export interface AnswerCache {
  get(lang: string, question: string): Promise<string | null>;
  set(lang: string, question: string, answer: string): Promise<void>;
}

export const questionHash = (question: string): string => createHash('sha256').update(normalize(question)).digest('hex');

export class MemoryAnswerCache implements AnswerCache {
  private store = new Map<string, string>();
  async get(lang: string, question: string) {
    return this.store.get(`${lang}:${questionHash(question)}`) ?? null;
  }
  async set(lang: string, question: string, answer: string) {
    this.store.set(`${lang}:${questionHash(question)}`, answer);
  }
}

export class DbAnswerCache implements AnswerCache {
  constructor(private db: Db) {}

  async get(lang: string, question: string) {
    const hash = questionHash(question);
    const [row] = await this.db
      .select({ answer: answerCache.answer })
      .from(answerCache)
      .where(and(eq(answerCache.lang, lang), eq(answerCache.questionHash, hash), gt(answerCache.createdAt, sql`now() - interval '${sql.raw(String(TTL_DAYS))} days'`)));
    if (!row) return null;
    await this.db.update(answerCache).set({ hits: sql`${answerCache.hits} + 1` }).where(and(eq(answerCache.lang, lang), eq(answerCache.questionHash, hash)));
    return row.answer;
  }

  async set(lang: string, question: string, answer: string) {
    const hash = questionHash(question);
    await this.db
      .insert(answerCache)
      .values({ lang, questionHash: hash, answer })
      .onConflictDoUpdate({ target: [answerCache.lang, answerCache.questionHash], set: { answer, hits: 0, createdAt: sql`now()` } });
  }
}
