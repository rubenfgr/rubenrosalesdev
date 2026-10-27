// Genera public/og-es.png y public/og-en.png a partir de scripts/og/og.html.
// Uso (desde apps/web): node scripts/og/render.mjs [ruta-al-chrome]   (requiere playwright-core)
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(here, '../../../../package.json'));
const { chromium } = require('playwright-core');
const browser = await chromium.launch({ executablePath: process.argv[2] ?? '/usr/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const lang of ['es', 'en']) {
  await page.goto(`${pathToFileURL(path.join(here, 'og.html')).href}?lang=${lang}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.resolve(here, `../../public/og-${lang}.png`) });
}
await browser.close();
