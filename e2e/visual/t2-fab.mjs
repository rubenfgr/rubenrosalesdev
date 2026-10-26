// T2: capturas del botón flotante (opciones A y B) en reposo, en pleno pulso y con hover. Uso: node e2e/visual/t2-fab.mjs [url]
import { chromium, devices } from 'playwright-core';
const URL = process.argv[2] ?? 'http://localhost:4322/';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] });
for (const v of ['a']) {
  for (const [name, opts, sel] of [['escritorio', { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }, '.as-fab'], ['movil', { ...devices['Pixel 7'], viewport: { width: 390, height: 800 } }, '.as-fab-mini']]) {
    const ctx = await browser.newContext(opts); const page = await ctx.newPage();
    await page.goto(`${URL}?fab=${v}`, { waitUntil: 'networkidle' });
    await page.waitForSelector(`${sel}.as-fab-${v}`);
    const clip = await page.locator(sel).evaluate((e) => { const b = e.getBoundingClientRect(); return { x: Math.max(0, b.x - 20), y: b.y - 20, width: b.width + 40, height: b.height + 40 }; });
    await page.screenshot({ path: `.plan/evidence/t2-${v}-${name}-reposo.png`, clip });
    if (v === 'a') { await page.waitForTimeout(2500); await page.screenshot({ path: `.plan/evidence/t2-${v}-${name}-pulso.png`, clip }); }
    else { await page.waitForTimeout(3100); await page.screenshot({ path: `.plan/evidence/t2-${v}-${name}-guino.png`, clip }); }
    if (name === 'escritorio') { await page.hover(sel); await page.waitForTimeout(300); await page.screenshot({ path: `.plan/evidence/t2-${v}-${name}-hover.png`, clip }); await page.keyboard.press('Tab'); }
    await ctx.close();
  }
}
await browser.close();
