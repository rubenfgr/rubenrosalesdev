import type { APIRoute } from 'astro';
import { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER, CONTACT_TO } from 'astro:env/server';
import { contactData } from '../../data/site';
import { sendMail } from '../../lib/mailer';

export const prerender = false;

const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

export const POST: APIRoute = async ({ request, url }) => {
  // Solo desde la propia web.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return json(403, { error: 'origen no permitido' });

  const form = await request.formData();

  // Antispam: campo señuelo (se responde como si todo fuera bien) y tiempo mínimo.
  if (str(form.get('web'))) return json(200, { ok: true });
  const age = Date.now() - Number(str(form.get('t')));
  if (!Number.isFinite(age) || age < MIN_FILL_MS || age > MAX_AGE_MS) return json(400, { error: 'envío no válido' });

  const nombre = str(form.get('nombre'));
  const email = str(form.get('email'));
  const empresa = str(form.get('empresa'));
  const servicio = str(form.get('servicio'));
  const mensaje = str(form.get('mensaje'));

  const valid =
    nombre.length > 0 && nombre.length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200 &&
    empresa.length <= 150 &&
    (servicio === '' || contactData.serviceOptions.includes(servicio)) &&
    mensaje.length >= 10 && mensaje.length <= 4000;
  if (!valid) return json(400, { error: 'datos no válidos' });

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !GMAIL_SENDER || !CONTACT_TO) {
    console.error('contacto: faltan variables de entorno de Gmail');
    return json(503, { error: 'servicio no disponible' });
  }

  try {
    await sendMail(
      { clientId: GMAIL_CLIENT_ID, clientSecret: GMAIL_CLIENT_SECRET, refreshToken: GMAIL_REFRESH_TOKEN, from: GMAIL_SENDER, to: CONTACT_TO },
      {
        replyTo: email,
        replyToName: nombre,
        subject: `Contacto web: ${nombre}`,
        text: [`Nombre: ${nombre}`, `Email: ${email}`, `Empresa: ${empresa || '-'}`, `Necesita: ${servicio || '-'}`, '', mensaje].join('\n'),
      },
    );
  } catch (err) {
    // Sin datos personales en el log.
    console.error('contacto: fallo al enviar', err instanceof Error ? err.message : 'desconocido');
    return json(502, { error: 'no se pudo enviar' });
  }
  return json(200, { ok: true });
};
