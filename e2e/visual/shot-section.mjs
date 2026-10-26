// Captura una sección/selector en varios anchos. Uso: node e2e/visual/shot-section.mjs <selector> <prefijo> [url] [anchos...]
import { chromium } from 'playwright-core';
const [sel, prefix, url = 'http://localhost:4322/', ...ws] = process.argv.slice(2);
const widths = ws.length ? ws.map(Number) : [360, 390, 768, 1024, 1280, 1440];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] });
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.addInitScript(() => matchMedia); 
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '[data-reveal] > * { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
  await el.screenshot({ path: `.plan/evidence/${prefix}-${w}.png` });
  const h = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(w, h ? 'SCROLL-X' : 'ok', Math.round((await el.boundingBox()).height));
  await page.close();
}
await browser.close();
