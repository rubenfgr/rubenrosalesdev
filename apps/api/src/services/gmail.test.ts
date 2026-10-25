import { describe, expect, it } from 'vitest';
import { buildMime, sendMail } from './gmail';

const cfg = { clientId: 'id', clientSecret: 'sec', refreshToken: 'rt', from: 'yo@example.com', to: 'rubén@example.com' };
const msg = { replyTo: 'ana@example.com', replyToName: 'Ana\r\nBcc: x@evil.com', subject: 'Asistente web: Ana\nBcc: x', text: 'hola ñ' };

describe('gmail', () => {
  it('construye el MIME sin permitir inyección de cabeceras', () => {
    const mime = buildMime(cfg, msg);
    expect(mime).not.toMatch(/\r\nBcc:/i);
    expect(mime).toContain('Reply-To: =?UTF-8?B?');
    expect(mime).toContain('Content-Type: text/plain; charset=UTF-8');
  });

  it('pide token y envía con Bearer', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const f = async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ access_token: 'tok' }), { status: 200 });
    };
    await sendMail(cfg, msg, f as never);
    expect(calls[0]!.url).toContain('oauth2.googleapis.com/token');
    expect(calls[1]!.url).toContain('gmail.googleapis.com');
    expect((calls[1]!.init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

  it('falla si Gmail rechaza el envío', async () => {
    let n = 0;
    const f = async () => (n++ === 0 ? new Response(JSON.stringify({ access_token: 't' })) : new Response('', { status: 403 }));
    await expect(sendMail(cfg, msg, f as never)).rejects.toThrow('send 403');
  });
});
