import { desc, eq, lt, sql } from 'drizzle-orm';
import type { Db } from './index';
import { conversations, leads, messages } from './schema';

export interface NewLead {
  name: string;
  email: string;
  lang: string;
  summary: string[];
  conversationId?: string | undefined;
}

export interface Repositories {
  /** Crea la conversación si no existe (idempotente) y devuelve su id. Solo se llama con consentimiento. */
  createConversation(input: { id?: string | undefined; lang: string; ipHash: string | null }): Promise<string>;
  appendMessage(conversationId: string, role: 'user' | 'assistant', content: string, usage?: { tokensIn: number; tokensOut: number }): Promise<void>;
  getRecentMessages(conversationId: string, limit: number): Promise<{ role: 'user' | 'assistant'; content: string }[]>;
  createLead(lead: NewLead): Promise<string>;
  /** Borra lo caducado (conversaciones con sus mensajes; leads aparte). Devuelve solo recuentos. */
  deleteExpired(): Promise<{ conversations: number; leads: number }>;
}

interface Retention {
  conversationDays: number;
  leadDays: number;
}

export class DbRepositories implements Repositories {
  constructor(private db: Db, private retention: Retention) {}

  async createConversation({ id, lang, ipHash }: { id?: string | undefined; lang: string; ipHash: string | null }) {
    const [row] = await this.db
      .insert(conversations)
      .values({
        ...(id ? { id } : {}),
        lang,
        ipHash,
        consentAt: new Date(),
        expiresAt: sql`now() + make_interval(days => ${this.retention.conversationDays})`,
      })
      .onConflictDoNothing()
      .returning({ id: conversations.id });
    return row?.id ?? id!;
  }

  async appendMessage(conversationId: string, role: 'user' | 'assistant', content: string, usage?: { tokensIn: number; tokensOut: number }) {
    await this.db.insert(messages).values({ conversationId, role, content, tokensIn: usage?.tokensIn ?? null, tokensOut: usage?.tokensOut ?? null });
  }

  async getRecentMessages(conversationId: string, limit: number) {
    const rows = await this.db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.id))
      .limit(limit);
    return rows.reverse() as { role: 'user' | 'assistant'; content: string }[];
  }

  async createLead(lead: NewLead) {
    const [row] = await this.db
      .insert(leads)
      .values({
        name: lead.name,
        email: lead.email,
        lang: lead.lang,
        summary: lead.summary,
        conversationId: lead.conversationId ?? null,
        expiresAt: sql`now() + make_interval(days => ${this.retention.leadDays})`,
      })
      .returning({ id: leads.id });
    return row!.id;
  }

  async deleteExpired() {
    const c = await this.db.delete(conversations).where(lt(conversations.expiresAt, sql`now()`)).returning({ id: conversations.id });
    const l = await this.db.delete(leads).where(lt(leads.expiresAt, sql`now()`)).returning({ id: leads.id });
    return { conversations: c.length, leads: l.length };
  }
}

/** Implementación en memoria para pruebas de rutas (sin base de datos). */
export class MemoryRepositories implements Repositories {
  conversations = new Map<string, { lang: string; ipHash: string | null }>();
  messages: { conversationId: string; role: 'user' | 'assistant'; content: string }[] = [];
  leads: (NewLead & { id: string })[] = [];

  async createConversation({ id, lang, ipHash }: { id?: string | undefined; lang: string; ipHash: string | null }) {
    const key = id ?? crypto.randomUUID();
    if (!this.conversations.has(key)) this.conversations.set(key, { lang, ipHash });
    return key;
  }
  async appendMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
    this.messages.push({ conversationId, role, content });
  }
  async getRecentMessages(conversationId: string, limit: number) {
    return this.messages.filter((m) => m.conversationId === conversationId).slice(-limit);
  }
  async createLead(lead: NewLead) {
    const id = crypto.randomUUID();
    this.leads.push({ ...lead, id });
    return id;
  }
  async deleteExpired() {
    return { conversations: 0, leads: 0 };
  }
}

