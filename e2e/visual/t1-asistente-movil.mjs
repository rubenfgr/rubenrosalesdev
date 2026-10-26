// T1: el panel del asistente en móvil cubre la cabecera, se cierra y no solapa. Uso: node e2e/visual/t1-asistente-movil.mjs [url] [prefijo]
import { chromium, devices } from 'playwright-core';
const URL = process.argv[2] ?? 'http://localhost:4322/';
const tag = process.argv[3] ?? 'despues';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let bad = 0;
for (const [w, h] of [[360, 740], [390, 844], [412, 915]]) {
  const ctx = await browser.newContext({ ...devices['Pixel 7'], viewport: { width: w, height: h }, screen: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => scrollTo(0, 600));
  await page.locator('.as-fab-mini').tap();
  await page.waitForSelector('.as-panel');
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const box = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return { t: b.top, b: b.bottom, l: b.left, r: b.right, w: b.width, h: b.height }; };
    const close = document.querySelectorAll('.as-head .as-icon')[1];
    const cb = close.getBoundingClientRect();
    const hit = document.elementFromPoint(cb.left + cb.width / 2, cb.top + cb.height / 2);
    return { panel: box('.as-panel'), close: { w: cb.width, h: cb.height, top: cb.top, hit: close.contains(hit) }, hscroll: document.documentElement.scrollWidth > innerWidth, locked: getComputedStyle(document.documentElement).overflow, y: scrollY };
  });
  console.log(w, h, JSON.stringify(r));
  if (!r.close.hit || r.close.w < 44 || r.close.h < 44 || r.panel.t > 1 || Math.abs(r.panel.h - h) > 2 || r.hscroll) { bad++; console.log('  FALLO'); }
  await page.screenshot({ path: `.plan/evidence/t1-${tag}-${w}x${h}.png` });
  await page.locator('.as-head .as-icon').nth(1).tap();
  await page.waitForSelector('.as-panel', { state: 'detached' });
  await page.locator('.as-fab-mini').tap(); await page.waitForSelector('.as-panel'); await page.waitForTimeout(300);
  await page.keyboard.press('Escape'); await page.waitForSelector('.as-panel', { state: 'detached' });
  await page.waitForTimeout(200); const unlocked = await page.evaluate(() => !document.documentElement.classList.contains('as-lock'));
  if (!unlocked) { bad++; console.log('  scroll sigue bloqueado'); }
  await ctx.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
