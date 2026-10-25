import { contactSchema } from '@rr/shared';
import { Hono } from 'hono';
import type { ResolvedDeps } from '../app';
import { errorBody } from '../lib/errors';
import { rateLimit } from '../lib/rate-limit';
import { validate } from '../lib/validate';
import { contactEmailText } from '../services/contact-email';

const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Formulario de contacto: no se guarda en la base de datos, solo se envía por email a Rubén. */
export const contactRoutes = ({ env, mailer, knowledge }: ResolvedDeps) => {
  const r = new Hono();
  r.use(rateLimit({ limit: env.RATE_LIMIT_LEADS_PER_HOUR, windowMs: 60 * 60_000 }));

  r.post('/', validate('json', contactSchema), async (c) => {
    const form = c.req.valid('json');
    if (form.website?.trim()) return c.json({ ok: true }); // señuelo: se responde como si todo fuera bien
    const age = Date.now() - form.startedAt;
    if (!Number.isFinite(age) || age < MIN_FILL_MS || age > MAX_AGE_MS) return c.json(errorBody('invalid_request'), 400);

    try {
      if (!mailer) throw new Error('sin configurar');
      await mailer.send({ replyTo: form.email, replyToName: form.name, subject: `Contacto web: ${form.name}`, text: contactEmailText(form, knowledge) });
    } catch (err) {
      console.error('contact: fallo al enviar el email', err instanceof Error ? err.message : 'desconocido'); // sin datos personales
      return c.json(errorBody('mail_unavailable'), 502);
    }
    return c.json({ ok: true });
  });

  return r;
};
