/** Minúsculas, sin tildes ni puntuación y con espacios colapsados (para la caché y la búsqueda por palabras clave). */
export const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Palabras con contenido (≥ 4 letras) de un texto normalizado. */
export const keywords = (s: string): string[] => [...new Set(normalize(s).split(' ').filter((w) => w.length >= 4))];
