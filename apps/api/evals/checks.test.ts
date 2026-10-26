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
  it('refers exige derivar a Rubén con nombre y email', () => {
    expect(check('es', { refers: true }, { text: 'Prefiero no afirmarlo: pulsa el botón «Enviar resumen a Rubén» y lo ve él.', source: 'llm' })).toEqual([]);
    expect(check('es', { refers: true }, { text: 'No lo sé.', source: 'llm' })).toHaveLength(1);
  });
  it('detecta que el modelo afirme haber enviado algo', () => {
    expect(check('es', {}, { text: 'Le paso este resumen a Rubén ahora mismo.', source: 'llm' })).toEqual(['afirma haber enviado o anotado algo']);
    expect(check('es', {}, { text: 'Ya se lo he pasado a Rubén.', source: 'llm' })).toEqual(['afirma haber enviado o anotado algo']);
  });
  it('lang distingue es de en y source', () => {
    expect(check('en', { lang: 'en' }, { text: 'I can help you with that.', source: 'llm' })).toEqual([]);
    expect(check('en', { lang: 'en' }, { text: 'Puedo ayudarte con eso para ti.', source: 'llm' })).toHaveLength(1);
    expect(check('es', { source: 'rule' }, { text: 'x', source: 'llm' })).toHaveLength(1);
  });
  it('noLeak detecta reglas literales', () => {
    expect(check('es', { noLeak: true }, { text: 'Nunca des precios, tarifas, presupuestos ni cifras en euros, ni siquiera aproximadas.', source: 'llm' })).toEqual(['filtra el prompt']);
  });
});
