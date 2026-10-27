import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const [w, url] of [[390, '/blog/capas-de-software-con-agentes-de-ia'], [1280, '/blog/capas-de-software-con-agentes-de-ia'], [390, '/en/blog/layers-of-software-with-ai-agents']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('http://localhost:4322' + url, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '[data-reveal],[data-reveal] > * { opacity: 1 !important; transform: none !important; transition: none !important; }' });
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(w, url, 'desborde horizontal:', over);
  await p.screenshot({ path: `.plan/evidence/articulo-${w}-${url.includes('/en/') ? 'en' : 'es'}.png`, fullPage: true });
  await p.close();
}
await b.close();
