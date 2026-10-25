import { describe, expect, it } from 'vitest';
import { canEstimate, estimate, matchRule, type Pricing } from './engine';

// Tabla de prueba propia: las pruebas no dependen de las cifras (aún provisionales) de la web.
const pricing: Pricing = {
  placeholder: false,
  rounding: 500,
  types: {
    process: { minEur: 1500, maxEur: 6000, minWeeks: 2, maxWeeks: 5 },
    web: { minEur: 4000, maxEur: 15000, minWeeks: 4, maxWeeks: 10 },
  },
  multipliers: {
    systems: { several: { maxFactor: 1.3, extraWeeks: 2 }, unknown: { maxFactor: 1.4, confidence: 'low' } },
    team: { large: { minFactor: 1.2, maxFactor: 1.25 }, small: { maxFactor: 0.9 } },
  },
  defaultConfidence: 'medium',
};

describe('estimate', () => {
  it('caso base: sin multiplicadores devuelve la tabla y la confianza por defecto', () => {
    expect(estimate(pricing, { type: 'process', systems: 'excel', team: 'medium' })).toEqual({
      minEur: 1500, maxEur: 6000, minWeeks: 2, maxWeeks: 5, confidence: 'medium',
    });
  });

  it('systems=several sube el máximo y las semanas', () => {
    expect(estimate(pricing, { type: 'process', systems: 'several', team: 'medium' })).toMatchObject({
      minEur: 1500, maxEur: 8000, minWeeks: 2, maxWeeks: 7,
    });
  });

  it('systems=unknown baja la confianza', () => {
    expect(estimate(pricing, { type: 'process', systems: 'unknown', team: 'medium' })).toMatchObject({
      maxEur: 8500, confidence: 'low',
    });
  });

  it('team=large sube mínimo y máximo; team=small baja el máximo', () => {
    expect(estimate(pricing, { type: 'web', systems: 'excel', team: 'large' })).toMatchObject({ minEur: 5000, maxEur: 19000 });
    expect(estimate(pricing, { type: 'web', systems: 'excel', team: 'small' })).toMatchObject({ minEur: 4000, maxEur: 13500 });
  });

  it('redondea al múltiplo de `rounding`', () => {
    // 6000 × 0,9 = 5400 → 5500
    expect(estimate(pricing, { type: 'process', systems: 'excel', team: 'small' })?.maxEur).toBe(5500);
  });

  it('ids heredados del prototipo (constructor, __proto__) no cuentan como tipo ni como multiplicador', () => {
    expect(estimate(pricing, { type: 'constructor', systems: 'excel', team: 'small' })).toBeNull();
    expect(estimate(pricing, { type: '__proto__', systems: 'excel', team: 'small' })).toBeNull();
    expect(estimate(pricing, { type: 'process', systems: 'constructor', team: 'toString' })).toEqual(estimate(pricing, { type: 'process', systems: 'excel', team: 'medium' }));
  });

  it('devuelve null si el tipo no existe', () => {
    expect(estimate(pricing, { type: 'nada', systems: 'excel', team: 'small' })).toBeNull();
  });

  it('reproduce las estimaciones que daba la web antes de mover el motor', () => {
    const real: Pricing = {
      placeholder: true, rounding: 500, defaultConfidence: 'medium',
      types: {
        process: { minEur: 1500, maxEur: 6000, minWeeks: 2, maxWeeks: 5 },
        ai: { minEur: 3000, maxEur: 10000, minWeeks: 3, maxWeeks: 8 },
        web: { minEur: 4000, maxEur: 15000, minWeeks: 4, maxWeeks: 10 },
      },
      multipliers: {
        systems: { several: { maxFactor: 1.3, extraWeeks: 2 }, unknown: { maxFactor: 1.4, confidence: 'low' } },
        team: { large: { minFactor: 1.2, maxFactor: 1.25 }, small: { maxFactor: 0.9 } },
      },
    };
    expect(estimate(real, { type: 'process', systems: 'excel', team: 'small' })).toEqual({ minEur: 1500, maxEur: 5500, minWeeks: 2, maxWeeks: 5, confidence: 'medium' });
    expect(estimate(real, { type: 'web', systems: 'several', team: 'large' })).toEqual({ minEur: 5000, maxEur: 24500, minWeeks: 4, maxWeeks: 12, confidence: 'medium' });
    expect(estimate(real, { type: 'ai', systems: 'unknown', team: 'medium' })).toEqual({ minEur: 3000, maxEur: 14000, minWeeks: 3, maxWeeks: 8, confidence: 'low' });
  });
});

describe('canEstimate', () => {
  it('solo con tipo, herramientas y equipo', () => {
    expect(canEstimate({})).toBe(false);
    expect(canEstimate({ type: 'web', systems: 'excel' })).toBe(false);
    expect(canEstimate({ type: 'web', systems: 'excel', team: 'small' })).toBe(true);
  });
});

describe('matchRule', () => {
  const rules = [{ pattern: 'precio|cuesta', action: 'precio' }, { pattern: 'plazo', action: 'plazo' }];
  it('devuelve la primera acción que coincide, sin distinguir mayúsculas', () => {
    expect(matchRule(rules, '¿Cuánto CUESTA?')).toBe('precio');
    expect(matchRule(rules, 'el plazo')).toBe('plazo');
    expect(matchRule(rules, 'hola')).toBeNull();
  });
});
