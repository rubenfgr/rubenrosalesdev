import { describe, expect, it } from 'vitest';
import { checkAmounts, extractAmounts, parseAmount } from './validator';

const range = [{ minEur: 1500, maxEur: 6000 }];
const ok = (text: string, ranges = range) => checkAmounts(text, ranges).ok;

describe('parseAmount', () => {
  it.each([['1.500', 1500], ['1,500', 1500], ['1 500', 1500], ['1500', 1500], ['2,5', 2.5]])('%s -> %s', (raw, n) => {
    expect(parseAmount(raw)).toBe(n);
  });
});

describe('validador de cifras', () => {
  it('permite el rango producido por estimate (varios formatos)', () => {
    expect(ok('Entre 1.500 y 6.000 € de forma orientativa.')).toBe(true);
    expect(ok('Entre 1.500–6.000 €, confianza media.')).toBe(true);
    expect(ok('From 1,500 to 6,000 euros, not a quote.')).toBe(true);
    expect(ok('Desde 1500 EUR hasta 6000 EUR.')).toBe(true);
  });

  it('bloquea una cifra inventada', () => {
    expect(ok('Te costará 3.000 €.')).toBe(false);
    expect(ok('Cuesta 100 €.')).toBe(false);
    expect(ok('It costs 100 euros.')).toBe(false);
  });

  it('bloquea una cifra de la tabla que no salió de estimate en esta conversación', () => {
    expect(ok('Una web suele costar entre 4.000 y 15.000 €.')).toBe(false);
  });

  it('bloquea una cifra suelta de un rango dentro de una frase con moneda', () => {
    expect(ok('Desde 1.500 hasta 7.000 euros.')).toBe(false);
  });

  it('bloquea importes no verificables', () => {
    expect(ok('Unos cinco mil euros.')).toBe(false);
    expect(ok('Unos 5k €.')).toBe(false);
    expect(ok('Más de 2 millones de euros.')).toBe(false);
  });

  it('sin ningún rango autorizado, cualquier importe se bloquea', () => {
    expect(ok('Son 1.500 €.', [])).toBe(false);
  });

  it('no confunde números no monetarios', () => {
    expect(ok('El proyecto tarda 3 semanas.')).toBe(true);
    expect(ok('Rubén construye software desde 2019.')).toBe(true);
    expect(ok('La reunión dura 30 minutos.')).toBe(true);
    expect(ok('Entregas cada 1–2 semanas.')).toBe(true);
    expect(ok('Plazos de 2 a 16 semanas.')).toBe(true);
  });

  it('un año no activa el filtro dentro de una frase con moneda', () => {
    expect(extractAmounts('En 2019 empecé. El rango es 1.500 €.')).toEqual([1500]);
  });
});
