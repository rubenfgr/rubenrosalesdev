// Pruebas de integración contra un Postgres real. Se saltan si no hay TEST_DATABASE_URL
// (en CI lo define el servicio postgres de ci.yml; en local: ver docs/backend.md).
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createDb } from './index';
import { DbRepositories } from './repositories';
import { conversations, leads, messages } from './schema';

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('DbRepositories (Postgres real)', () => {
  const { db, client } = createDb(url ?? 'postgres://unused');
  const repos = new DbRepositories(db, { conversationDays: 90, leadDays: 365 });

  beforeAll(async () => {
    await migrate(db, { migrationsFolder: './drizzle' });
  });
  beforeEach(async () => {
    await db.execute(sql`truncate messages, leads, conversations restart identity cascade`);
  });
  afterAll(async () => {
    await client.end();
  });

  it('crea una conversación (idempotente) y guarda mensajes en orden', async () => {
    const id = await repos.createConversation({ lang: 'es', ipHash: 'abc' });
    expect(await repos.createConversation({ id, lang: 'es', ipHash: 'abc' })).toBe(id);
    await repos.appendMessage(id, 'user', 'hola');
    await repos.appendMessage(id, 'assistant', 'qué tal', { tokensIn: 10, tokensOut: 3 });
    await repos.appendMessage(id, 'user', 'bien');
    expect(await repos.getRecentMessages(id, 2)).toEqual([
      { role: 'assistant', content: 'qué tal' },
      { role: 'user', content: 'bien' },
    ]);
    const [row] = await db.select().from(conversations);
    expect(row!.consentAt).not.toBeNull();
    expect(row!.expiresAt.getTime()).toBeGreaterThan(Date.now() + 89 * 86_400_000);
  });

  it('crea un lead con caducidad de 12 meses', async () => {
    const id = await repos.createLead({ name: 'Ana', email: 'ana@example.com', lang: 'es', summary: ['a', 'b'] });
    const [row] = await db.select().from(leads);
    expect(row!.id).toBe(id);
    expect(row!.summary).toEqual(['a', 'b']);
    expect(row!.expiresAt.getTime()).toBeGreaterThan(Date.now() + 364 * 86_400_000);
  });

  it('deleteExpired borra la conversación caducada con sus mensajes y NO el lead asociado', async () => {
    const id = await repos.createConversation({ lang: 'es', ipHash: null });
    await repos.appendMessage(id, 'user', 'hola');
    const leadId = await repos.createLead({ name: 'Ana', email: 'ana@example.com', lang: 'es', summary: [], conversationId: id });
    const keep = await repos.createConversation({ lang: 'es', ipHash: null });
    await db.execute(sql`update conversations set expires_at = now() - interval '1 day' where id = ${id}`);

    expect(await repos.deleteExpired()).toEqual({ conversations: 1, leads: 0 });
    expect((await db.select().from(conversations)).map((c) => c.id)).toEqual([keep]);
    expect(await db.select().from(messages)).toHaveLength(0);
    const [lead] = await db.select().from(leads);
    expect(lead).toMatchObject({ id: leadId, conversationId: null });
  });

  it('deleteExpired borra los leads caducados', async () => {
    await repos.createLead({ name: 'Ana', email: 'ana@example.com', lang: 'es', summary: [] });
    await db.execute(sql`update leads set expires_at = now() - interval '1 day'`);
    expect(await repos.deleteExpired()).toEqual({ conversations: 0, leads: 1 });
  });
});
