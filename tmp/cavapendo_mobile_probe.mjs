import fs from 'node:fs';
import { chromium } from 'playwright';

const outDir = '/Users/fortune/cavapendolandia/tmp/manual-qa';
fs.mkdirSync(outDir, { recursive: true });
const errors = [];
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push({ type: 'console', text: msg.text() });
});
page.on('pageerror', (err) => {
  errors.push({ type: 'pageerror', text: String(err) });
});
await page.goto('http://127.0.0.1:4173/galleria', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.render_game_to_text === 'function', null, { timeout: 20000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: outDir + '/mobile-probe.png', fullPage: true });
await page.screenshot({ path: outDir + '/mobile-portrait-viewport.png', fullPage: true });
fs.writeFileSync(outDir + '/mobile-probe-text.txt', await page.locator('body').innerText());
fs.writeFileSync(
  outDir + '/mobile-portrait-state.json',
  await page.evaluate(() => window.render_game_to_text?.() ?? 'null'),
);
await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(1500);
await page.screenshot({ path: outDir + '/mobile-landscape-viewport.png', fullPage: true });
fs.writeFileSync(
  outDir + '/mobile-landscape-state.json',
  await page.evaluate(() => window.render_game_to_text?.() ?? 'null'),
);
await page.getByRole('button', { name: 'Impostazioni' }).click();
await page.getByRole('button', { name: /Entra in fullscreen|Esci dal fullscreen/ }).click();
await page.waitForTimeout(1200);
fs.writeFileSync(
  outDir + '/mobile-fullscreen-state.json',
  await page.evaluate(() => window.render_game_to_text?.() ?? 'null'),
);
fs.writeFileSync(outDir + '/mobile-probe-errors.json', JSON.stringify(errors, null, 2));
await browser.close();
