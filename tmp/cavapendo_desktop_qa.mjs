import fs from 'node:fs';
import { chromium } from 'playwright';

const outDir = '/Users/fortune/cavapendolandia/tmp/manual-qa';
fs.mkdirSync(outDir, { recursive: true });
const errors = [];

async function advance(page, frames) {
  for (let i = 0; i < frames; i += 1) {
    await page.evaluate(async () => {
      if (typeof window.advanceTime === 'function') {
        await window.advanceTime(1000 / 60);
      }
    });
  }
}

const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push({ type: 'console', text: msg.text() });
});
page.on('pageerror', (err) => {
  errors.push({ type: 'pageerror', text: String(err) });
});
await page.goto('http://127.0.0.1:4173/galleria', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.render_game_to_text === 'function', null, { timeout: 20000 });
await page.waitForTimeout(1500);
await page.keyboard.down('ArrowUp');
await advance(page, 235);
await page.keyboard.up('ArrowUp');
await advance(page, 8);
await page.keyboard.press('Enter');
await advance(page, 130);
const state = await page.evaluate(() => window.render_game_to_text?.() ?? null);
await page.screenshot({ path: outDir + '/desktop-meadow.png', fullPage: true });
fs.writeFileSync(outDir + '/desktop-state.json', state ?? 'null');
if (errors.length) {
  fs.writeFileSync(outDir + '/desktop-errors.json', JSON.stringify(errors, null, 2));
}
await browser.close();
