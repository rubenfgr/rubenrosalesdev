// Herramienta `estimate`: el LLM nunca calcula precios; llama a esta función, que usa el mismo motor que la web.
import { canEstimate, estimate, type Estimate } from '@rr/shared';
import type { Knowledge } from '@rr/shared/knowledge';
import type { LlmTool } from './llm';

export const estimateTool = (k: Knowledge, lang: 'es' | 'en'): LlmTool => ({
  name: 'estimate',
  description:
    'Calcula el rango orientativo de precio y plazo. Úsala solo cuando conozcas el tipo de proyecto, las herramientas y el tamaño del equipo. Es la única fuente de cifras.',
  parameters: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: Object.keys(k.pricing.types), description: 'Tipo de proyecto' },
      systems: { type: 'string', enum: Object.keys(k.assistant[lang].systems), description: 'Herramientas que usan hoy' },
      team: { type: 'string', enum: Object.keys(k.assistant[lang].team), description: 'Tamaño del equipo' },
    },
    required: ['type', 'systems', 'team'],
  },
});

export type ToolOutcome = { ok: true; estimate: Estimate } | { ok: false };

/** Ejecuta `estimate` con argumentos del modelo. Valida los enums contra los datos; si algo no cuadra no devuelve cifras. */
export function runEstimate(k: Knowledge, lang: 'es' | 'en', args: Record<string, unknown>): ToolOutcome {
  const { type, systems, team } = args;
  const valid =
    typeof type === 'string' && type in k.pricing.types &&
    typeof systems === 'string' && systems in k.assistant[lang].systems &&
    typeof team === 'string' && team in k.assistant[lang].team;
  if (!valid) return { ok: false };
  const ctx = { type, systems, team };
  if (!canEstimate(ctx)) return { ok: false };
  const result = estimate(k.pricing, ctx);
  return result ? { ok: true, estimate: result } : { ok: false };
}

/** Lo que ve el modelo como resultado de la herramienta. */
export const toolResult = (o: ToolOutcome): Record<string, unknown> =>
  o.ok ? { ...o.estimate } : { error: 'datos_incompletos_o_invalidos' };
