// Guardarraíl de salida: ningún importe en euros puede llegar al visitante si no sale de `estimate()`.

const CURRENCY = String.raw`(?:€|eur\b|euros?\b)`;
const NUM = String.raw`\d{1,3}(?:[.,\s]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?`;

/** "1.500", "1,500", "1 500" y "1500" → 1500. Decimales ("2,5") se conservan. */
export function parseAmount(raw: string): number {
  const s = raw.replace(/\s/g, '');
  if (/^\d{1,3}([.,]\d{3})+$/.test(s)) return Number(s.replace(/[.,]/g, ''));
  return Number(s.replace(',', '.'));
}

/** Importes monetarios que aparecen en el texto (junto a €/EUR/euros, o ≥ 100 en frases con moneda). */
export function extractAmounts(text: string): number[] {
  const out = new Set<number>();
  const num = new RegExp(NUM, 'g');
  // Cifras pegadas a la moneda: «1.500 €», «€ 1500», «EUR 3.000».
  for (const m of text.matchAll(new RegExp(`(${NUM})\\s*${CURRENCY}|${CURRENCY}\\s*(${NUM})`, 'gi'))) {
    out.add(parseAmount((m[1] ?? m[2])!));
  }
  // Frases con moneda: cualquier cifra de 3 o más dígitos (rangos «1.500–6.000 euros», «desde 1.500 hasta 6.000 euros»).
  for (const sentence of text.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚ¿¡])|\n/)) {
    if (!new RegExp(CURRENCY, 'i').test(sentence)) continue;
    for (const m of sentence.matchAll(num)) {
      const n = parseAmount(m[0]);
      const plainYear = /^(19|20)\d{2}$/.test(m[0]);
      if (n >= 100 && !plainYear) out.add(n);
    }
  }
  return [...out];
}

/** Importes expresados de formas que no se pueden verificar («cinco mil euros», «5k»). */
export const hasUnverifiableAmount = (text: string): boolean =>
  /\b(?:mil|thousand|k)\s+(?:€|euros?|eur)\b|\b\d+\s?k\s?(?:€|euros?|eur)?\b(?=.*(?:€|euros?|eur))|\b\d+(?:[.,]\d+)?\s*(?:millones?|million)\b/i.test(text);

export interface AllowedRange {
  minEur: number;
  maxEur: number;
}

/** Texto válido si cada importe coincide con un extremo de un rango producido por `estimate()` en esta conversación. */
export function checkAmounts(text: string, ranges: AllowedRange[]): { ok: true } | { ok: false; offending: number[] } {
  const allowed = new Set(ranges.flatMap((r) => [r.minEur, r.maxEur]));
  const offending = extractAmounts(text).filter((n) => !allowed.has(n));
  if (hasUnverifiableAmount(text)) offending.push(NaN);
  return offending.length ? { ok: false, offending } : { ok: true };
}
