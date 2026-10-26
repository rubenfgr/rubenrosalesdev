// T7: auditoría responsive. Por página y ancho: scroll horizontal, elementos que se salen del viewport,
// objetivos táctiles < 44 px (≤ 1024 px), texto de párrafo < 16 px en móvil y capturas de página completa.
// Uso: node e2e/visual/t7-audit.mjs <prefijo> [url-base] [anchos...]
import { chromium } from 'playwright-core';
const [prefix = 'audit', base = 'http://localhost:4322', ...ws] = process.argv.slice(2);
const widths = ws.length ? ws.map(Number) : [360, 390, 768, 1024, 1280, 1440];
const pages = { home: '/', 'home-en': '/en', blog: '/blog', articulo: '/blog/plantilla-de-ejemplo', privacidad: '/privacidad', aviso: '/aviso-legal', cookies: '/cookies', '404': '/404' };
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const report = [];
for (const [name, path] of Object.entries(pages)) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, hasTouch: w <= 1024 });
    await page.goto(base + path, { waitUntil: name === '404' ? 'load' : 'networkidle' });
    await page.addStyleTag({ content: '[data-reveal] > * { opacity: 1 !important; transform: none !important; transition: none !important; } *, *::before, *::after { animation: none !important; } .as-fab, .as-fab-mini { display: none !important; } astro-dev-toolbar { display: none !important; }' });
    await page.waitForTimeout(300);
    const r = await page.evaluate((w) => {
      const out = { hscroll: document.documentElement.scrollWidth - innerWidth, overflow: [], small: [], text: [], h1: 0 };
      const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
      const sel = (e) => (e.id ? `#${e.id}` : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : e.tagName.toLowerCase());
      for (const e of document.querySelectorAll('body *')) {
        if (!vis(e)) continue;
        const r = e.getBoundingClientRect();
        if (r.right > innerWidth + 1 && !e.closest('[data-lenis-prevent], pre, .overflow-ok, table') && getComputedStyle(e).position !== 'fixed') out.overflow.push(sel(e) + ' → ' + Math.round(r.right));
      }
      if (w <= 1024) for (const e of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, summary, [role=button], [role=radio]')) {
        if (!vis(e)) continue;
        const r = e.getBoundingClientRect();
        // enlaces dentro de texto corrido están exentos (WCAG 2.5.8)
        const inline = e.tagName === 'A' && getComputedStyle(e).display === 'inline';
        if (!inline && (r.width < 44 || r.height < 44)) out.small.push(`${sel(e)} ${Math.round(r.width)}×${Math.round(r.height)} "${(e.textContent || e.ariaLabel || '').trim().slice(0, 24)}"`);
      }
      if (w <= 768) for (const e of document.querySelectorAll('p, li, dd')) {
        if (!vis(e) || !e.textContent.trim() || e.closest('.doc, .phone, .as-panel, [aria-hidden=true]')) continue;
        const fs = parseFloat(getComputedStyle(e).fontSize);
        if (fs < 16 && e.textContent.trim().length > 60) out.text.push(`${sel(e)} ${fs}px`);
      }
      out.h1 = Math.round(document.querySelector('h1')?.getBoundingClientRect().height ?? 0);
      return out;
    }, w);
    await page.screenshot({ path: `.plan/evidence/${prefix}-${name}-${w}.png`, fullPage: true });
    report.push({ name, w, ...r });
    await page.close();
  }
}
await browser.close();
let n = 0;
for (const r of report) {
  const issues = [r.hscroll > 0 && `SCROLL-X +${r.hscroll}`, ...r.overflow.slice(0, 4).map((x) => 'fuera: ' + x), ...(r.small.length ? [`táctil<44: ${r.small.length} (${[...new Set(r.small)].slice(0, 5).join(' | ')})`] : []), ...(r.text.length ? [`texto<16: ${r.text.length} (${[...new Set(r.text)].slice(0, 4).join(' | ')})`] : [])].filter(Boolean);
  if (issues.length) { n += issues.length; console.log(`\n[${r.name} ${r.w}] h1=${r.h1}px\n  ` + issues.join('\n  ')); }
}
console.log(`\n${n} hallazgos`);
