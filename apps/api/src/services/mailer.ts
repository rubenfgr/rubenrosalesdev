import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Env } from '../env';
import { sendMail, type MailMessage } from './gmail';

export type { MailMessage };

export interface Mailer {
  send(msg: MailMessage): Promise<void>;
}

/**
 * Solo desarrollo: en vez de enviar, guarda cada email como un fichero de texto en `dir` (ignorado por git).
 * Permite probar el formulario y el resumen en local sin configurar Gmail. Nunca se usa en producción.
 */
export class FileMailer implements Mailer {
  constructor(private dir: string) {}
  async send(msg: MailMessage) {
    mkdirSync(this.dir, { recursive: true });
    const slug = msg.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    const file = join(this.dir, `${new Date().toISOString().replace(/[:.]/g, '-')}-${slug}.txt`);
    writeFileSync(file, `Reply-To: ${msg.replyToName} <${msg.replyTo}>\nAsunto: ${msg.subject}\n\n${msg.text}\n`);
    console.log(`mailer (desarrollo): email guardado en ${file}`); // sin contenido en el log
  }
}

/**
 * Gmail si está configurado. Sin configurar: en desarrollo, un `FileMailer`; en producción, `null`
 * (las rutas guardan el lead y responden `mail_unavailable`).
 */
export function createMailer(env: Env, devDir = '.dev-mail'): Mailer | null {
  const { GMAIL_CLIENT_ID: clientId, GMAIL_CLIENT_SECRET: clientSecret, GMAIL_REFRESH_TOKEN: refreshToken, GMAIL_SENDER: from, CONTACT_TO: to } = env;
  if (!clientId || !clientSecret || !refreshToken || !from || !to) return env.NODE_ENV === 'production' ? null : new FileMailer(devDir);
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
