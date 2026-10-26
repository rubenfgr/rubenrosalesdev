// Lista las últimas conversaciones guardadas (solo las que aceptaron guardar) con su lead, si lo hay. Solo lectura.
// Contiene datos personales: ejecútalo únicamente tú, en el VPS o en local.
//   local:      pnpm --filter @rr/api conversations [N]
//   producción: docker exec rubenrosales-api node dist/jobs/conversations.js [N]
import { desc, inArray } from 'drizzle-orm';
import { createDb } from '../db';
import { conversations, leads, messages } from '../db/schema';
import { loadEnv } from '../env';

export interface ConversationView {
  id: string;
  lang: string;
  createdAt: Date;
  expiresAt: Date;
  lead?: { name: string; email: string } | undefined;
  messages: { role: string; content: string }[];
}

export function formatConversation(c: ConversationView): string {
  const day = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ');
  return [
    `━━ ${day(c.createdAt)} · ${c.lang} · caduca ${day(c.expiresAt).slice(0, 10)} · ${c.id}`,
    c.lead ? `   Lead: ${c.lead.name} <${c.lead.email}>` : '   (sin lead)',
    ...c.messages.map((m) => `   ${m.role === 'user' ? 'Visitante' : 'Asistente'}: ${m.content.replace(/\s+/g, ' ')}`),
  ].join('\n');
}

async function main() {
  const limit = Math.min(Math.max(Number(process.argv[2]) || 10, 1), 100);
  const env = loadEnv({ DATABASE_URL: process.env.DATABASE_URL ?? '', ...process.env });
  const { db, client } = createDb(env.DATABASE_URL);
  const convs = await db.select().from(conversations).orderBy(desc(conversations.createdAt)).limit(limit);
  if (!convs.length) console.log('No hay conversaciones guardadas.');
  const ids = convs.map((c) => c.id);
  const msgs = ids.length ? await db.select().from(messages).where(inArray(messages.conversationId, ids)).orderBy(messages.id) : [];
  const ls = ids.length ? await db.select().from(leads).where(inArray(leads.conversationId, ids)) : [];
  for (const c of convs) {
    const lead = ls.find((l) => l.conversationId === c.id);
    console.log(formatConversation({ id: c.id, lang: c.lang, createdAt: c.createdAt, expiresAt: c.expiresAt, lead: lead && { name: lead.name, email: lead.email }, messages: msgs.filter((m) => m.conversationId === c.id) }) + '\n');
  }
  await client.end();
}

if (process.argv[1]?.includes('conversations')) await main();
