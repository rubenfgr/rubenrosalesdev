import { describe, expect, it } from 'vitest';
import { hasPersonalData, matchRule, redactPersonal } from './engine';

describe('matchRule', () => {
  const rules = [{ pattern: 'precio|cuesta', action: 'precio' }, { pattern: 'plazo', action: 'plazo' }];
  it('devuelve la primera acción que coincide, sin distinguir mayúsculas', () => {
    expect(matchRule(rules, '¿Cuánto CUESTA?')).toBe('precio');
    expect(matchRule(rules, 'el plazo')).toBe('plazo');
    expect(matchRule(rules, 'hola')).toBeNull();
  });
});

describe('datos personales', () => {
  it('detecta correos y teléfonos, no números normales', () => {
    expect(hasPersonalData('mi correo es fran@ejemplo.com')).toBe(true);
    expect(hasPersonalData('llámame al 600 123 123')).toBe(true);
    expect(hasPersonalData('+34 600-123-123')).toBe(true);
    expect(hasPersonalData('somos 12 personas y tardamos 3 semanas')).toBe(false);
    expect(hasPersonalData('desde 2019 con Excel')).toBe(false);
  });
  it('los oculta', () => {
    expect(redactPersonal('Soy Ana, ana@x.com, 600 123 123, gracias')).toBe('Soy Ana, [correo omitido], [teléfono omitido], gracias');
  });
});
