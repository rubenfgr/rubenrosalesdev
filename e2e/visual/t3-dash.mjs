// T3: la etiqueta «Objetivo» no se solapa con las barras en ningún estado de la animación (3 anchos).
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let bad = 0;
for (const w of [390, 1024, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(process.argv[2] ?? 'http://localhost:4322/', { waitUntil: 'networkidle' });
  await page.locator('.dash').scrollIntoViewIfNeeded();
  for (let i = 0; i < 12; i++) {
    const r = await page.evaluate(() => {
      const k = document.querySelector('.goal-key').getBoundingClientRect(), b = document.querySelector('.bars').getBoundingClientRect();
      return { keyBottom: k.bottom, barsTop: b.top, over: [...document.querySelectorAll('.bars i')].some((i) => { const r = i.getBoundingClientRect(); return r.height > 0 && r.top < k.bottom && r.bottom > k.top && r.left < k.right && r.right > k.left; }) };
    });
    if (r.over || r.keyBottom > r.barsTop) { bad++; console.log('SOLAPE', w, i, r); }
    if (i === 6) await page.screenshot({ path: `.plan/evidence/t3-dash-${w}.png`, clip: await page.locator('.dash').boundingBox() });
    await page.waitForTimeout(1300);
  }
  await page.close();
}
console.log(bad ? 'FALLO' : 'sin solapes'); await browser.close(); process.exit(bad ? 1 : 0);
