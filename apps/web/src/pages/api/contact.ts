// Recibe el formulario de contacto y el resumen del asistente. Responde JSON; el cliente muestra carga y error.
import type { APIRoute } from 'astro';
import { deliver, MailNotConfigured } from '../../lib/mail';
import { ui } from '../../i18n';

export const prerender = false;

const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const str = (v: unknown, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x, 120)).filter(Boolean).slice(0, 20) : []);

export const POST: APIRoute = async ({ request, url }) => {
  // Solo desde la propia web.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return json(403, { error: 'forbidden' });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: 'invalid' });
  }

  // Antispam: campo señuelo (se responde como si todo fuera bien) y tiempo mínimo desde que se abrió el formulario.
  if (str(body.website)) return json(200, { ok: true });
  const age = Date.now() - Number(body.startedAt);
  if (!Number.isFinite(age) || age < MIN_FILL_MS || age > MAX_AGE_MS) return json(400, { error: 'invalid' });

  const kind = body.kind === 'assistant' ? 'assistant' : 'form';
  const name = str(body.name, 100);
  const email = str(body.email, 200);
  if (!name || !EMAIL.test(email) || body.consent !== true) return json(400, { error: 'invalid' });

  const c = ui('es', 'contact');
  let subject: string;
  let lines: string[];
  if (kind === 'assistant') {
    subject = `Asistente web: ${name}`;
    lines = [`Nombre: ${name}`, `Email: ${email}`, `Idioma de la web: ${str(body.lang, 5) || '-'}`, '', ...list(body.summary)];
  } else {
    const message = str(body.message);
    if (message.length < 10) return json(400, { error: 'invalid' });
    const goals = list(body.goals).map((g) => (c.goals as Record<string, { title: string }>)[g]?.title ?? g);
    const label = (map: Record<string, string>, k: string) => map[k] ?? k;
    subject = `Contacto web: ${name}`;
    lines = [
      `Nombre: ${name}`, `Email: ${email}`, `Empresa: ${str(body.company, 150) || '-'}`,
      `Modo: ${str(body.mode, 20) || '-'}`, `Idioma de la web: ${str(body.lang, 5) || '-'}`,
      `Preferencia: ${str(body.preference, 10) === 'call' ? `llamada (${str(body.phone, 40) || 'sin teléfono'})` : 'email'}`,
      `Objetivos: ${goals.join(', ') || '-'}`,
      `Equipo: ${label(c.sizes, str(body.size, 20)) || '-'}`,
      `Plazo: ${label(c.whens, str(body.when, 20)) || '-'}`,
      `Programas: ${list(body.tools).join(', ') || '-'}`,
      '', message,
    ];
  }

  try {
    await deliver({ replyTo: email, replyToName: name, subject, text: lines.join('\n') });
  } catch (err) {
    // Sin datos personales en el log.
    console.error('contact: fallo al enviar', err instanceof Error ? err.message : 'desconocido');
    return json(err instanceof MailNotConfigured ? 503 : 502, { error: 'unavailable' });
  }
  return json(200, { ok: true });
};
