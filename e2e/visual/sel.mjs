import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto('http://localhost:4322/'); await p.waitForTimeout(800);
for (const sel of ['h1', '.prob h2', '.ct h2', '.footer .name']) {
  const el = await p.$(sel); if (!el) { console.log('no', sel); continue; }
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  await p.evaluate(s => { const r = document.createRange(); r.selectNodeContents(document.querySelector(s)); const x = getSelection(); x.removeAllRanges(); x.addRange(r); }, sel);
  await el.screenshot({ path: `.plan/evidence/sel-${sel.replace(/\W+/g,'_')}.png` });
}
await b.close();
