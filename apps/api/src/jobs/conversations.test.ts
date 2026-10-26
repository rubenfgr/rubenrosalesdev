import { describe, expect, it } from 'vitest';
import { formatConversation } from './conversations';

describe('formatConversation', () => {
  it('muestra fecha, idioma, caducidad, lead y los mensajes en orden', () => {
    const out = formatConversation({
      id: 'abc', lang: 'es', createdAt: new Date('2026-10-26T10:05:00Z'), expiresAt: new Date('2027-01-24T10:05:00Z'),
      lead: { name: 'Ana', email: 'ana@example.com' },
      messages: [{ role: 'user', content: 'Hola\nquiero una web' }, { role: 'assistant', content: 'Cuéntame más' }],
    });
    expect(out).toContain('2026-10-26 10:05 · es · caduca 2027-01-24 · abc');
    expect(out).toContain('Lead: Ana <ana@example.com>');
    expect(out.indexOf('Visitante: Hola quiero una web')).toBeLessThan(out.indexOf('Asistente: Cuéntame más'));
  });
  it('sin lead lo indica', () => {
    expect(formatConversation({ id: 'x', lang: 'en', createdAt: new Date(0), expiresAt: new Date(0), messages: [] })).toContain('(sin lead)');
  });
});
