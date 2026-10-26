// T4: al cambiar de modo cambian el estado de cada elemento, el contador y el registro. Uso: node e2e/visual/t4-control.mjs [url]
import { chromium } from 'playwright-core';
const URL = process.argv[2] ?? 'http://localhost:4322/';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let bad = 0;
const expectations = [[0, 6, 0], [1, 3, 3], [2, 1, 5]]; // modo → [pasan solos, esperan]
for (const w of [390, 1280]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.locator('#como-funciona').scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  for (const [mode, review, auto] of expectations) {
    await page.locator('.tray-mode').nth(mode).click(); await page.waitForTimeout(500);
    const got = await page.evaluate(() => [+document.querySelector('.tray-stat.auto b').textContent, +document.querySelector('.tray-stat.review b').textContent, document.querySelectorAll('.tray-item.auto').length, document.querySelectorAll('.tray-item.review').length, document.documentElement.scrollWidth > innerWidth]);
    const ok = got[0] === auto && got[1] === review && got[2] === auto && got[3] === review && !got[4];
    console.log(w, 'modo', mode, JSON.stringify(got), ok ? 'ok' : 'FALLO'); if (!ok) bad++;
    await page.locator('#como-funciona .tray-grid').screenshot({ path: `.plan/evidence/t4-despues-${w}-modo${mode}.png` });
  }
  await page.close();
}
await browser.close(); process.exit(bad ? 1 : 0);
