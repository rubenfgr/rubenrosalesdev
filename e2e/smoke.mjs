// Prueba de humo extremo a extremo (T-9.3). Uso: pnpm e2e
// Construye la web con el asistente activado, levanta web + API (LLM, email y BD simulados) detrás de un proxy local
// y recorre con Playwright: aviso de consentimiento → texto libre con streaming → flujo guiado (sin precios) → resumen.
// Necesita Chrome (CHROME_PATH, por defecto /usr/bin/google-chrome). No toca servidores reales.
import { spawn, spawnSync } from 'node:child_process';
import { createServer, request } from 'node:http';
import { chromium } from 'playwright-core';

const WEB = 4301, API = 4302, PROXY = 4300;
const children = [];
const stop = () => children.forEach((c) => { try { c.pid ? process.kill(-c.pid, 'SIGTERM') : c.kill('SIGTERM'); } catch {} });
process.on('exit', stop);
const fail = (msg) => { console.error('FALLO:', msg); stop(); process.exit(1); };
const run = (cmd, args, env = {}, cwd) => spawn(cmd, args, { env: { ...process.env, ...env }, cwd, stdio: 'ignore', detached: true }); // grupo propio: se mata entero al terminar
const waitFor = async (url) => { for (let i = 0; i < 60; i++) { try { if ((await fetch(url)).status < 500) return; } catch {} await new Promise((r) => setTimeout(r, 500)); } fail(`no arranca ${url}`); };

console.log('· construyendo la web con el asistente activado…');
const build = spawnSync('pnpm', ['--filter', '@rr/web', 'build'], { env: { ...process.env, PUBLIC_ASSISTANT_ENABLED: '1', PUBLIC_ASSISTANT_LLM: '1' }, stdio: 'ignore' });
if (build.status !== 0) fail('el build de la web falla');

children.push(run('node', ['dist/server/entry.mjs'], { HOST: '127.0.0.1', PORT: String(WEB) }, 'apps/web'));
children.push(run('pnpm', ['--filter', '@rr/api', 'exec', 'tsx', 'e2e/server.ts'], { PORT: String(API) }));
const proxy = createServer((req, res) => {
  const target = req.url.startsWith('/api/v1') || req.url.startsWith('/__e2e') ? API : WEB;
  const up = request({ host: '127.0.0.1', port: target, path: req.url, method: req.method, headers: req.headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  up.on('error', () => { res.writeHead(502); res.end(); });
  req.pipe(up);
}).listen(PROXY);
children.push({ kill: () => proxy.close() });
await waitFor(`http://127.0.0.1:${WEB}/`);
await waitFor(`http://127.0.0.1:${API}/api/v1/health`);

const state = async () => (await fetch(`http://127.0.0.1:${PROXY}/__e2e/state`)).json();
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] });
try {
  for (const [name, viewport] of [['escritorio', { width: 1280, height: 800 }], ['móvil', { width: 390, height: 800 }]]) {
    const page = await browser.newPage({ viewport });
    const apiCalls = [];
    page.on('request', (r) => r.url().includes('/api/v1/') && apiCalls.push(r.url()));
    await page.goto(`http://127.0.0.1:${PROXY}/`, { waitUntil: 'networkidle' });
    await page.locator('.as-fab, .as-fab-mini').locator('visible=true').first().click();
    await page.waitForSelector('.as-consent-box');
    if (apiCalls.length) fail(`${name}: hay llamadas a la API antes de elegir el consentimiento`);
    await page.click('.as-consent-actions .as-submit');
    await page.waitForSelector('.as-chips');

    // texto libre → /chat con streaming (LLM simulado)
    await page.fill('.as-input input', 'Háblame de lo que haces');
    await page.press('.as-input input', 'Enter');
    await page.waitForFunction(() => [...document.querySelectorAll('.as-bot')].some((e) => e.textContent.includes('Cuéntame qué necesitas')), null, { timeout: 15000 });

    // flujo guiado hasta la estimación (en el cliente)
    await page.waitForSelector('.as-chips .as-chip');
    await page.locator('.as-chips .as-chip', { hasText: 'Tengo un proyecto' }).click();
    for (let i = 0; i < 3; i++) { await page.waitForSelector('.as-chips .as-chip'); await page.waitForTimeout(250); await page.locator('.as-chips .as-chip').first().click(); }
    await page.waitForFunction(() => [...document.querySelectorAll('.as-bot')].some((e) => e.textContent.includes('propuesta concreta')), null, { timeout: 15000 });
    if (await page.locator('.as-bot', { hasText: '€' }).count()) fail(`${name}: el asistente muestra importes en euros`);
    await page.locator('.as-chip', { hasText: 'Enviar resumen' }).click();
    await page.fill('.as-form input[type=text]', `Ana ${name}`);
    await page.fill('.as-form input[type=email]', 'ana@example.com');
    await page.check('.as-consent input');
    await page.click('.as-submit');
    await page.waitForSelector('.as-sum', { timeout: 15000 });
    // formulario de contacto (modo directo) → /api/v1/contact (se cierra antes el panel del asistente)
    await page.locator('.as-panel button[aria-label="Cerrar"]').evaluate((el) => el.click());
    await page.waitForSelector('.as-panel', { state: 'detached' });
    await page.locator('.ct-tab').nth(1).scrollIntoViewIfNeeded();
    await page.waitForSelector('astro-island:not([ssr]) .ct-tab'); // la isla se hidrata al ser visible
    await page.locator('.ct-tab').nth(1).evaluate((el) => el.click()); // la cabecera fija puede tapar el botón
    await page.fill('.ct-form input[type=text] >> nth=0', `Bea ${name}`);
    await page.fill('.ct-form input[type=email]', 'bea@example.com');
    await page.fill('.ct-form textarea', 'Quiero automatizar mis facturas con mi Excel actual.');
    await page.locator('.ct-form input[type=checkbox]').evaluate((el) => el.click());
    await page.waitForTimeout(3200); // antispam: mínimo 3 s desde que se abrió el formulario
    const contactRes = page.waitForResponse((r) => r.url().includes('/api/v1/contact'));
    await page.locator('.ct-form button[type=submit]').evaluate((el) => el.click());
    const cr = await contactRes;
    if (cr.status() !== 200) fail(`contacto respondió ${cr.status()}: ${await cr.text()}`);
    await page.waitForSelector('.ct-form', { state: 'detached', timeout: 15000 });
    await page.close();
    console.log(`✓ ${name}: consentimiento, streaming, flujo guiado sin precios, resumen y formulario de contacto`);
  }
  const s = await state();
  if (s.leads !== 2 || s.emails.length !== 4) fail(`se esperaban 2 leads y 4 emails (2 resúmenes + 2 formularios); hay ${s.leads} y ${s.emails.length}`);
  if (s.emails.filter((m) => m.subject.startsWith('Contacto web: Bea')).length !== 2) fail('faltan los emails del formulario de contacto');
  for (const m of s.emails.filter((m) => m.subject.startsWith('Asistente web'))) {
    if ((m.text.match(/Nombre:/g) ?? []).length !== 1 || (m.text.match(/Email:/g) ?? []).length !== 1) fail('el resumen del asistente repite nombre o correo');
    if (m.text.includes('undefined')) fail('el resumen del asistente contiene «undefined»');
    if (!m.text.includes('Mensajes:\n- Háblame de lo que haces')) fail('el resumen no incluye lo que escribió el visitante como lista');
  }
  if (!s.emails[0].subject.startsWith('Asistente web: Ana')) fail(`asunto inesperado: ${s.emails[0].subject}`);
  if (s.conversations !== 2 || s.messages < 4) fail(`la conversación aceptada no se guardó (${s.conversations} conv., ${s.messages} mensajes)`);
  console.log(`✓ API: ${s.leads} leads guardados, ${s.emails.length} emails enviados (asunto «${s.emails[0].subject}», Reply-To ${s.emails[0].replyTo}), ${s.conversations} conversaciones con ${s.messages} mensajes`);
} catch (err) {
  fail(err.message);
} finally {
  await browser.close();
}
stop();
process.exit(0);
