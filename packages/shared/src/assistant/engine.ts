// Motor de reglas del asistente. Puro y sin dependencias de Astro: lo usan la isla de la web y la API.
// Todos los textos y cifras vienen de los datos (apps/web/src/content/assistant), nunca de aquí.

export type Confidence = 'low' | 'medium' | 'high';

export interface Pricing {
  placeholder: boolean;
  rounding: number;
  types: Record<string, { minEur: number; maxEur: number; minWeeks: number; maxWeeks: number }>;
  multipliers: Record<'systems' | 'team', Record<string, { minFactor?: number | undefined; maxFactor?: number | undefined; extraWeeks?: number | undefined; confidence?: Confidence | undefined }>>;
  defaultConfidence: Confidence;
}

export interface Ctx {
  type?: string;
  systems?: string;
  team?: string;
}

export interface Estimate {
  minEur: number;
  maxEur: number;
  minWeeks: number;
  maxWeeks: number;
  confidence: Confidence;
}

/** El rango solo existe cuando se conocen las tres respuestas: tipo, herramientas y tamaño del equipo. */
export const canEstimate = (ctx: Ctx): ctx is Required<Ctx> => !!(ctx.type && ctx.systems && ctx.team);

export function estimate(pricing: Pricing, ctx: Required<Ctx>): Estimate | null {
  // Solo ids propios de los datos: un id como «constructor» o «__proto__» (puede venir del cliente) no es un tipo.
  if (!Object.hasOwn(pricing.types, ctx.type)) return null;
  const base = pricing.types[ctx.type]!;
  let { minEur, maxEur, minWeeks, maxWeeks } = base;
  let confidence = pricing.defaultConfidence;
  for (const [group, value] of [['systems', ctx.systems], ['team', ctx.team]] as const) {
    if (!Object.hasOwn(pricing.multipliers[group], value)) continue;
    const m = pricing.multipliers[group][value]!;
    minEur *= m.minFactor ?? 1;
    maxEur *= m.maxFactor ?? 1;
    maxWeeks += m.extraWeeks ?? 0;
    if (m.confidence) confidence = m.confidence;
  }
  const round = (n: number) => Math.round(n / pricing.rounding) * pricing.rounding;
  return { minEur: round(minEur), maxEur: round(maxEur), minWeeks, maxWeeks: Math.round(maxWeeks), confidence };
}

/** Acción asociada a un texto libre según las reglas del idioma; `null` si no hay coincidencia. */
export function matchRule(rules: { pattern: string; action: string }[], text: string): string | null {
  for (const r of rules) if (new RegExp(r.pattern, 'i').test(text)) return r.action;
  return null;
}
