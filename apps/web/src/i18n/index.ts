// Capa de i18n: idiomas, rutas localizadas, textos de interfaz tipados y formatos Intl.
import en from './ui/en.json';
import es from './ui/es.json';

export const locales = ['es', 'en'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'es';

/** Código BCP 47 por idioma, para `Intl`, `hreflang` y `og:locale`. */
export const intlLocale: Record<Lang, string> = { es: 'es-ES', en: 'en-GB' };

// ── Textos de interfaz ────────────────────────────────────────────────────────────────────────
type Dict = typeof es;
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];
export type UiKey = Leaves<Dict>;

// Si `en.json` no tiene exactamente la estructura de `es.json`, `astro check` falla aquí.
const dictionaries: Record<Lang, Dict> = { es, en };

const lookup = (dict: Dict, key: string): string | undefined => {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
};

/** `t(lang)(clave, { variable })`. Lanza si la clave no existe o está vacía: el build falla. */
export function t(lang: Lang) {
  return (key: UiKey, vars?: Record<string, string | number>): string => {
    const value = lookup(dictionaries[lang], key);
    if (!value) throw new Error(`i18n: falta la clave «${key}» en «${lang}»`);
    return vars ? value.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`)) : value;
  };
}
export type T = ReturnType<typeof t>;

/** Subárbol de textos de una sección, para pasarlo como prop a una isla. */
export const ui = <K extends keyof Dict>(lang: Lang, section: K): Dict[K] => dictionaries[lang][section];

/** Sustituye `{variable}` en un texto ya resuelto (para islas, que reciben subárboles de `ui`). */
export const fmt = (text: string, vars: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));

// ── Rutas ─────────────────────────────────────────────────────────────────────────────────────
/**
 * Ruta de la URL sin extensión de fichero ni `/index` (con `build.format: 'file'` el pathname del build
 * es `/en.html` o `/index.html`; en desarrollo es `/en` o `/`).
 */
export function cleanPath(url: URL): string {
  return url.pathname.replace(/\.html$/, '').replace(/\/index$/, '') || '/';
}

/** Idioma según la URL: `/en` y `/en/...` → en; el resto → es. */
export function getLang(url: URL): Lang {
  const first = cleanPath(url).split('/')[1];
  return (locales as readonly string[]).includes(first ?? '') && first !== defaultLang ? (first as Lang) : defaultLang;
}

const stripLang = (pathname: string): string => {
  const m = pathname.match(/^\/(es|en)(?=\/|$)/);
  return m ? pathname.slice(m[0].length) || '/' : pathname;
};

/** Ruta interna (con `#ancla` opcional) en el idioma indicado. `/#faq` → `/en#faq`. */
export function getLocalizedPath(path: string, lang: Lang): string {
  const [pathPart = '/', hash] = path.split('#') as [string, string?];
  const bare = stripLang(pathPart || '/');
  const prefixed = lang === defaultLang ? bare : bare === '/' ? `/${lang}` : `/${lang}${bare}`;
  return hash ? `${prefixed}#${hash}` : prefixed;
}

export interface Alternate {
  lang: Lang;
  href: string;
}

/**
 * Páginas equivalentes en cada idioma, con URL absoluta (para `hreflang`) .
 * `paths` permite indicar rutas distintas por idioma (p. ej. un artículo con otro slug).
 */
export function getAlternates(url: URL, site: URL, paths?: Partial<Record<Lang, string>>): Alternate[] {
  const current = stripLang(cleanPath(url));
  // Con `paths` solo hay alternativa en los idiomas indicados (p. ej. un artículo sin traducir).
  const available = paths ? locales.filter((l) => paths[l]) : locales;
  return available.map((lang) => ({ lang, href: new URL(getLocalizedPath(paths?.[lang] ?? current, lang), site).href }));
}

// ── Formatos ──────────────────────────────────────────────────────────────────────────────────
export const formatNumber = (lang: Lang, n: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(intlLocale[lang], options).format(n);

export const formatEuro = (lang: Lang, n: number) =>
  new Intl.NumberFormat(intlLocale[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const formatDate = (lang: Lang, d: Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat(intlLocale[lang], { ...options, timeZone: 'UTC' }).format(d);
