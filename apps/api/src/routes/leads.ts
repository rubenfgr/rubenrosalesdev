import { leadSchema, type Lead } from '@rr/shared';
import { Hono } from 'hono';
import type { ResolvedDeps } from '../app';
import { errorBody } from '../lib/errors';
import { rateLimit } from '../lib/rate-limit';
import { validate } from '../lib/validate';

const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Texto del email a Rubén (en español, es para él). */
export function leadEmailText(lead: Lead): string {
  return [`Nombre: ${lead.name}`, `Email: ${lead.email}`, `Idioma de la web: ${lead.lang}`, '', ...lead.summary].join('\n');
}

export const leadRoutes = ({ env, repos, mailer }: ResolvedDeps) => {
  const r = new Hono();
  r.use(rateLimit({ limit: env.RATE_LIMIT_LEADS_PER_HOUR, windowMs: 60 * 60_000 }));

  r.post('/', validate('json', leadSchema), async (c) => {
    const lead = c.req.valid('json');
    // Señuelo relleno: se responde como si todo fuera bien, sin guardar ni enviar.
    if (lead.website?.trim()) return c.json({ ok: true });
    const age = Date.now() - lead.startedAt;
    if (!Number.isFinite(age) || age < MIN_FILL_MS || age > MAX_AGE_MS) return c.json(errorBody('invalid_request'), 400);

    await repos.createLead({ name: lead.name, email: lead.email, lang: lead.lang, summary: lead.summary, conversationId: lead.conversationId });

    try {
      if (!mailer) throw new Error('sin configurar');
      await mailer.send({ replyTo: lead.email, replyToName: lead.name, subject: `Asistente web: ${lead.name}`, text: leadEmailText(lead) });
    } catch (err) {
      // El lead ya está guardado. Sin datos personales en el log.
      console.error('leads: fallo al enviar el email', err instanceof Error ? err.message : 'desconocido');
      return c.json(errorBody('mail_unavailable'), 502);
    }
    return c.json({ ok: true });
  });

  return r;
};
