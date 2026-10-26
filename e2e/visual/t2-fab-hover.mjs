import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto('http://localhost:4322/');
await p.waitForSelector('.as-fab');
const clip = { x: 1280 - 260, y: 800 - 100, width: 260, height: 100 };
await p.screenshot({ path: '.plan/evidence/t2-fab-reposo.png', clip });
await p.hover('.as-fab'); await p.waitForTimeout(400);
await p.screenshot({ path: '.plan/evidence/t2-fab-hover.png', clip });
await p.mouse.move(10, 10); await p.waitForTimeout(2300);
const ops = [];
for (let i = 0; i < 80; i++) { ops.push(await p.$eval('.as-fab .lm-piece', e => getComputedStyle(e).opacity)); await p.waitForTimeout(100); }
console.log("mín", Math.min(...ops.map(Number)));
console.log('opacidad pieza', ops.join(' '), 'puntos verdes:', await p.$$eval('.as-fab i, .as-fab-mini i', e => e.length));
await b.close();
