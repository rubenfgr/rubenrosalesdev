import type { Env } from '../env';
import { sendMail, type MailMessage } from './gmail';

export type { MailMessage };

export interface Mailer {
  send(msg: MailMessage): Promise<void>;
}

/** `null` si falta configuración de Gmail (la ruta de leads guarda el lead y responde `mail_unavailable`). */
export function createMailer(env: Env): Mailer | null {
  const { GMAIL_CLIENT_ID: clientId, GMAIL_CLIENT_SECRET: clientSecret, GMAIL_REFRESH_TOKEN: refreshToken, GMAIL_SENDER: from, CONTACT_TO: to } = env;
  if (!clientId || !clientSecret || !refreshToken || !from || !to) return null;
  return { send: (msg) => sendMail({ clientId, clientSecret, refreshToken, from, to }, msg) };
}

export class FakeMailer implements Mailer {
  sent: MailMessage[] = [];
  constructor(private fail = false) {}
  async send(msg: MailMessage) {
    if (this.fail) throw new Error('fallo simulado');
    this.sent.push(msg);
  }
}
