import { estimate } from '@rr/shared';
import { knowledge } from '@rr/shared/knowledge';
import { describe, expect, it } from 'vitest';
import { estimateTool, runEstimate, toolResult } from './tools';

describe('herramienta estimate', () => {
  it('declara como enums los ids de los datos, en los dos idiomas', () => {
    for (const lang of ['es', 'en'] as const) {
      const props = (estimateTool(knowledge, lang).parameters as { properties: Record<string, { enum: string[] }>; required: string[] }).properties;
      expect(props.type!.enum).toEqual(Object.keys(knowledge.pricing.types));
      expect(props.systems!.enum).toEqual(Object.keys(knowledge.assistant[lang].systems));
      expect(props.team!.enum).toEqual(Object.keys(knowledge.assistant[lang].team));
    }
  });

  it('con las tres respuestas válidas devuelve exactamente lo que calcula el motor', () => {
    const args = { type: 'web', systems: 'several', team: 'large' };
    const r = runEstimate(knowledge, 'es', args);
    expect(r).toEqual({ ok: true, estimate: estimate(knowledge.pricing, args as never) });
  });

  it('regla 3: sin tipo, herramientas o equipo (o con ids inválidos) no hay ninguna cifra', () => {
    for (const args of [{}, { type: 'web' }, { type: 'web', systems: 'excel' }, { systems: 'excel', team: 'small' }, { type: 'web', systems: 'x', team: 'small' }, { type: 5, systems: 'excel', team: 'small' }, { type: '__proto__', systems: 'excel', team: 'small' }, { type: 'constructor', systems: 'excel', team: 'small' }]) {
      const r = runEstimate(knowledge, 'es', args);
      expect(r.ok).toBe(false);
      expect(toolResult(r)).toEqual({ error: expect.any(String) });
    }
  });
});
