import { describe, expect, it } from 'vitest';
import { matchRule } from './engine';

describe('matchRule', () => {
  const rules = [{ pattern: 'precio|cuesta', action: 'precio' }, { pattern: 'plazo', action: 'plazo' }];
  it('devuelve la primera acción que coincide, sin distinguir mayúsculas', () => {
    expect(matchRule(rules, '¿Cuánto CUESTA?')).toBe('precio');
    expect(matchRule(rules, 'el plazo')).toBe('plazo');
    expect(matchRule(rules, 'hola')).toBeNull();
  });
});
