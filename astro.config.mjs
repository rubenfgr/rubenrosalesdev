// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rubenrosales.dev',
  trailingSlash: 'never',
  build: { format: 'file' },
});
