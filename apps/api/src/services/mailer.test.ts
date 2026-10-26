import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { loadEnv } from '../env';
import { createMailer, FileMailer } from './mailer';

const env = (extra: Record<string, string>) => loadEnv({ DATABASE_URL: 'postgres://t', ...extra });
const gmail = { CONTACT_TO: 'a@x.com', GMAIL_SENDER: 'b@x.com', GMAIL_CLIENT_ID: 'i', GMAIL_CLIENT_SECRET: 's', GMAIL_REFRESH_TOKEN: 'r' };

describe('createMailer', () => {
  it('producción sin Gmail: no hay mailer (nunca escribe emails a disco)', () => {
    expect(createMailer(env({ NODE_ENV: 'production' }))).toBeNull();
  });
  it('desarrollo sin Gmail: guarda los emails en ficheros', () => {
    expect(createMailer(env({ NODE_ENV: 'development' }))).toBeInstanceOf(FileMailer);
  });
  it('con Gmail configurado usa Gmail aunque sea desarrollo', () => {
    expect(createMailer(env({ NODE_ENV: 'development', ...gmail }))).not.toBeInstanceOf(FileMailer);
  });
});

describe('FileMailer', () => {
  it('guarda el email completo en un fichero y no lo vuelca al log', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'rr-mail-'));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await new FileMailer(dir).send({ replyTo: 'ana@example.com', replyToName: 'Ana', subject: 'Asistente web: Ana', text: 'Nombre: Ana\nProyecto: web' });
    const [file] = readdirSync(dir);
    expect(file).toMatch(/asistente-web-ana\.txt$/);
    const body = readFileSync(join(dir, file!), 'utf8');
    expect(body).toContain('Reply-To: Ana <ana@example.com>');
    expect(body).toContain('Proyecto: web');
    expect(log.mock.calls.flat().join(' ')).not.toContain('ana@example.com');
    log.mockRestore();
  });
});
