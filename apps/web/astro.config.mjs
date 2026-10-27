// @ts-check
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import remarkDirective from 'remark-directive';
import rehypeHeadingAnchors from './src/plugins/rehype-heading-anchors.ts';
import remarkAdmonitions from './src/plugins/remark-admonitions.ts';

// Colores del tema de código: valores resueltos de `--color-code-*` (tokens.css).
// El resaltador necesita valores literales; el resto del marco usa las variables.
/**
 * @param {string} name
 * @param {'light' | 'dark'} type
 * @param {Record<string, string>} c
 */
const codeTheme = (name, type, c) => ({
  name,
  type,
  colors: {
    'editor.background': c.background,
    'editor.foreground': c.foreground,
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment, fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control'], settings: { foreground: c.keyword } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: c.string } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: c.number } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: c.function } },
    { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: c.punctuation } },
  ],
});

/** @typedef {any} Loose */
const light = codeTheme('rr-light', 'light', {
  background: '#F4F5F2',
  foreground: '#2B3533',
  comment: '#5C6662',
  keyword: '#285A6E',
  string: '#4F5A3E',
  number: '#8E3B26',
  function: '#635234',
  punctuation: '#444F4C',
});
export default defineConfig({
  site: 'https://rubenrosales.dev',
  // Servidor Node (contenedor Docker en el VPS): sirve lo estático y ejecuta las rutas /api y las redirecciones.
  adapter: node({ mode: 'standalone' }),
  session: false,
  // Detrás de Traefik, Astro solo confía en el Host si coincide con estos dominios; si no, `url` es localhost y /api rechaza el origen (403).
  security: { allowedDomains: [{ hostname: 'rubenrosales.dev', protocol: 'https' }, { hostname: 'localhost' }] },
  // i18n nativo: español sin prefijo (/), inglés en /en.
  i18n: { defaultLocale: 'es', locales: ['es', 'en'], routing: { prefixDefaultLocale: false } },
  // Desarrollo accesible por Tailscale (pnpm dev:tailscale): permite los nombres MagicDNS *.ts.net.
  // En local, /api/v1 se reenvía a la API (pnpm dev:api, puerto 3000); en producción lo hace Traefik.
  vite: { server: { allowedHosts: ['.ts.net'], proxy: { '/api/v1': 'http://localhost:3000' } } },
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [
    sitemap({ i18n: { defaultLocale: 'es', locales: { es: 'es-ES', en: 'en-GB' } } }),
    expressiveCode({
      themes: /** @type {Loose} */ ([light]),
      useDarkModeMediaQuery: false,
      styleOverrides: {
        borderRadius: 'var(--radius-md)',
        borderColor: 'var(--color-rule)',
        borderWidth: 'var(--border-width-thick)',
        frames: { frameBoxShadowCssValue: 'none' },
        codeFontFamily: 'var(--font-family-mono)',
        codeFontSize: 'var(--font-size-label)',
        codeLineHeight: 'var(--line-height-relaxed)',
        uiFontFamily: 'var(--font-family-sans)',
      },
    }),
    mdx(),
    preact(),
  ],
  markdown: {
    processor: unified(),
    remarkPlugins: /** @type {Loose} */ ([remarkDirective, remarkAdmonitions]),
    rehypePlugins: [rehypeHeadingAnchors],
  },
});
