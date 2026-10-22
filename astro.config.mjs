// @ts-check
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { defineConfig, envField } from 'astro/config';
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
  // Sin sesiones (no se crea KV) y con imágenes optimizadas en el build (no se usa el binding de Images).
  adapter: cloudflare({ imageService: 'compile' }),
  session: false,
  // Secretos del formulario de contacto: solo variables de entorno, nunca en el repo.
  env: {
    schema: {
      GMAIL_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      GMAIL_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      GMAIL_REFRESH_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      GMAIL_SENDER: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap(),
    expressiveCode({
      themes: /** @type {Loose} */ ([light]),
      useDarkModeMediaQuery: false,
      styleOverrides: {
        borderRadius: 'var(--radius-md)',
        borderColor: 'var(--color-border)',
        codeFontFamily: 'var(--font-family-mono)',
        codeFontSize: 'var(--font-size-label)',
        codeLineHeight: 'var(--line-height-relaxed)',
        uiFontFamily: 'var(--font-family-sans)',
      },
    }),
  ],
  markdown: {
    processor: unified(),
    remarkPlugins: /** @type {Loose} */ ([remarkDirective, remarkAdmonitions]),
    rehypePlugins: [rehypeHeadingAnchors],
  },
});
