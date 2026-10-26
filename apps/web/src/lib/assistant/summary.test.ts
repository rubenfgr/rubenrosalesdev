import { describe, expect, it } from 'vitest';
import { summaryLines } from './summary';

describe('summaryLines', () => {
  const details = [{ k: 'Proyecto', v: 'Procesos' }, { k: 'Equipo', v: '1–5' }];

  it('detalles y mensajes en lista, sin nombre ni correo', () => {
    expect(summaryLines(details, ['Hola, usamos Factusol', 'nos pasan un excel'], 'Mensajes')).toEqual([
      'Proyecto: Procesos', 'Equipo: 1–5', 'Mensajes:', '- Hola, usamos Factusol', '- nos pasan un excel',
    ]);
  });
  it('sin mensajes no añade la sección', () => {
    expect(summaryLines(details, [], 'Mensajes')).toEqual(['Proyecto: Procesos', 'Equipo: 1–5']);
  });
  it('se queda con los últimos, recorta y limpia espacios', () => {
    const typed = Array.from({ length: 8 }, (_, i) => `m${i}`);
    expect(summaryLines([], typed, 'Mensajes').slice(1)).toEqual(['- m2', '- m3', '- m4', '- m5', '- m6', '- m7']);
    expect(summaryLines([], ['a'.repeat(400)], 'M')[1]).toHaveLength(252);
    expect(summaryLines([], ['  hola \n  mundo  '], 'M')[1]).toBe('- hola mundo');
  });
  it('cabe en el contrato del lead (máx. 20 líneas de 300 caracteres)', () => {
    const lines = summaryLines(details, Array(10).fill('x'.repeat(500)), 'Mensajes');
    expect(lines.length).toBeLessThanOrEqual(20);
    expect(lines.every((l) => l.length <= 300)).toBe(true);
  });
});
