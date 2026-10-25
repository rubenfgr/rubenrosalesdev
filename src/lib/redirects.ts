// Redirecciones 301 de las URL del portal anterior (tabla generada por scripts/generate-redirects.mjs).
import rules from '../data/redirects.generated.json';

const exact = new Map<string, string>();
const wildcard: [string, string][] = [];
for (const [from, to] of rules as [string, string][]) {
  if (from.endsWith('/*')) wildcard.push([from.slice(0, -1), to]);
  else exact.set(from, to);
}

/** Destino de la redirección para una ruta, o `undefined` si no hay regla. */
export function legacyTarget(pathname: string): string | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  const hit = exact.get(path);
  if (hit) return hit;
  for (const [prefix, to] of wildcard) {
    if (path.startsWith(prefix)) return to.replace(':splat', path.slice(prefix.length));
  }
  return undefined;
}
