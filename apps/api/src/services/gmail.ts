// Envío de email con la API de Gmail (OAuth2 con refresh token). Solo usa `fetch`. Portado de la web (T-4.5).

export interface MailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  from: string;
  to: string;
}

export interface MailMessage {
  replyTo: string;
  replyToName: string;
  subject: string;
  text: string;
}

/** Quita saltos de línea para evitar inyección de cabeceras. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

const toBase64 = (bytes: Uint8Array): string => {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const utf8 = (s: string) => toBase64(new TextEncoder().encode(s));
const base64Url = (s: string) => utf8(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const wrap76 = (s: string) => s.replace(/(.{76})/g, '$1\r\n');

/** Construye el mensaje RFC 2822 en UTF-8. */
export function buildMime(cfg: Pick<MailConfig, 'from' | 'to'>, msg: MailMessage): string {
  const name = oneLine(msg.replyToName).replace(/["<>]/g, '');
  return [
    `From: ${oneLine(cfg.from)}`,
    `To: ${oneLine(cfg.to)}`,
    `Reply-To: =?UTF-8?B?${utf8(name)}?= <${oneLine(msg.replyTo)}>`,
    `Subject: =?UTF-8?B?${utf8(oneLine(msg.subject))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(utf8(msg.text)),
  ].join('\r\n');
}

export async function sendMail(cfg: MailConfig, msg: MailMessage, fetchImpl: typeof fetch = fetch): Promise<void> {
  const tokenRes = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!tokenRes.ok) throw new Error(`token ${tokenRes.status}`);
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) throw new Error('token vacío');

  const sendRes = await fetchImpl('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: base64Url(buildMime(cfg, msg)) }),
  });
  if (!sendRes.ok) throw new Error(`send ${sendRes.status}`);
}
