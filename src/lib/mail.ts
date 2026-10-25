// Envío de los mensajes de contacto. El proveedor se elige con CONTACT_PROVIDER ('gmail' por defecto o 'resend').
import { CONTACT_FROM, CONTACT_PROVIDER, CONTACT_TO, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER, RESEND_API_KEY } from 'astro:env/server';
import { sendMail, type MailMessage } from './mailer';

export class MailNotConfigured extends Error {}

async function sendResend(msg: MailMessage): Promise<void> {
  if (!RESEND_API_KEY || !CONTACT_FROM || !CONTACT_TO) throw new MailNotConfigured('resend');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: CONTACT_FROM, to: [CONTACT_TO], reply_to: `${msg.replyToName.replace(/[<>"\r\n]/g, '')} <${msg.replyTo}>`, subject: msg.subject.replace(/[\r\n]+/g, ' '), text: msg.text }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}

async function sendGmail(msg: MailMessage): Promise<void> {
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !GMAIL_SENDER || !CONTACT_TO) throw new MailNotConfigured('gmail');
  await sendMail({ clientId: GMAIL_CLIENT_ID, clientSecret: GMAIL_CLIENT_SECRET, refreshToken: GMAIL_REFRESH_TOKEN, from: GMAIL_SENDER, to: CONTACT_TO }, msg);
}

export const deliver = (msg: MailMessage) => ((CONTACT_PROVIDER ?? 'gmail') === 'resend' ? sendResend(msg) : sendGmail(msg));
