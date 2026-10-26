// Líneas del resumen que se envían a Rubén. El nombre y el correo no van aquí: la API ya los pone en la cabecera del email.

export interface SummaryRow {
  k: string;
  v: string;
}

/**
 * `details`: proyecto, herramientas y equipo (los que haya). `typed`: lo que el visitante escribió con sus palabras;
 * va como lista, una línea por mensaje, y se queda con los últimos `max`.
 */
export function summaryLines(details: SummaryRow[], typed: string[], chatLabel: string, max = 6): string[] {
  const messages = typed.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(-max);
  return [
    ...details.map((r) => `${r.k}: ${r.v}`),
    ...(messages.length ? [`${chatLabel}:`, ...messages.map((m) => `- ${m.slice(0, 250)}`)] : []),
  ];
}
