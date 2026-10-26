// Reglas del asistente. Puro y sin dependencias de Astro: lo usan la isla de la web y la API.
// Todos los textos vienen de los datos (apps/web/src/content/assistant), nunca de aquí.
// El asistente no calcula ni muestra precios: los fija Rubén en cada propuesta.

export interface Ctx {
  type?: string;
  systems?: string;
  team?: string;
}

/** Acción asociada a un texto libre según las reglas del idioma; `null` si no hay coincidencia. */
export function matchRule(rules: { pattern: string; action: string }[], text: string): string | null {
  for (const r of rules) if (new RegExp(r.pattern, 'i').test(text)) return r.action;
  return null;
}
