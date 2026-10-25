import { describe, expect, it } from 'vitest';
import cases from './cases.json' with { type: 'json' };
import { check } from './checks';

describe('casos de evaluación', () => {
  it('hay al menos 30 casos en es y en, con id único', () => {
    expect(cases.length).toBeGreaterThanOrEqual(30);
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
    expect(cases.some((c) => c.lang === 'es')).toBe(true);
    expect(cases.some((c) => c.lang === 'en')).toBe(true);
  });
});

describe('check()', () => {
  it('noFigure detecta importes', () => {
    expect(check('es', { noFigure: true }, { text: 'Cuesta 1.500 €', source: 'llm' })).toContain('da una cifra');
    expect(check('es', { noFigure: true }, { text: 'Tarda 3 semanas', source: 'llm' })).toEqual([]);
  });
  it('range exige rango, confianza y aviso', () => {
    expect(check('es', { range: true }, { text: 'Entre 1.500 y 5.500 €, confianza media. No es un presupuesto.', source: 'llm' })).toEqual([]);
    expect(check('es', { range: true }, { text: 'Entre 1.500 y 5.500 €.', source: 'llm' })).toHaveLength(2);
  });
  it('refers exige derivar a Rubén con nombre y email', () => {
    expect(check('es', { refers: true }, { text: 'Se lo paso a Rubén; déjame tu nombre y email.', source: 'llm' })).toEqual([]);
    expect(check('es', { refers: true }, { text: 'No lo sé.', source: 'llm' })).toHaveLength(1);
  });
  it('lang distingue es de en y source', () => {
    expect(check('en', { lang: 'en' }, { text: 'I can help you with that.', source: 'llm' })).toEqual([]);
    expect(check('en', { lang: 'en' }, { text: 'Puedo ayudarte con eso para ti.', source: 'llm' })).toHaveLength(1);
    expect(check('es', { source: 'rule' }, { text: 'x', source: 'llm' })).toHaveLength(1);
  });
  it('noLeak detecta reglas literales', () => {
    expect(check('es', { noLeak: true }, { text: 'Nunca des cifras fuera de la tabla de rangos de abajo.', source: 'llm' })).toEqual(['filtra el prompt']);
  });
});
