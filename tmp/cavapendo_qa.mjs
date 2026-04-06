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

const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desktopPage = await desktopContext.newPage();
desktopPage.on('console', (msg) => {
  if (msg.type() === 'error') errors.push({ type: 'console', text: msg.text() });
});
desktopPage.on('pageerror', (err) => {
  errors.push({ type: 'pageerror', text: String(err) });
});
await desktopPage.goto('http://127.0.0.1:4174/galleria', { waitUntil: 'networkidle' });
await desktopPage.waitForFunction(() => typeof window.render_game_to_text === 'function');
await desktopPage.waitForTimeout(800);
await desktopPage.keyboard.down('ArrowUp');
await advance(desktopPage, 235);
await desktopPage.keyboard.up('ArrowUp');
await advance(desktopPage, 8);
await desktopPage.keyboard.press('Enter');
await advance(desktopPage, 130);
const desktopState = await desktopPage.evaluate(() => window.render_game_to_text?.() ?? null);
await desktopPage.screenshot({ path: outDir + '/desktop-meadow.png', fullPage: true });
fs.writeFileSync(outDir + '/desktop-state.json', desktopState ?? 'null');

const portraitContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const portraitPage = await portraitContext.newPage();
await portraitPage.goto('http://127.0.0.1:4174/galleria', { waitUntil: 'networkidle' });
await portraitPage.waitForFunction(() => typeof window.render_game_to_text === 'function');
await portraitPage.waitForTimeout(800);
const portraitState = await portraitPage.evaluate(() => window.render_game_to_text?.() ?? null);
await portraitPage.screenshot({ path: outDir + '/mobile-portrait.png', fullPage: true });
fs.writeFileSync(outDir + '/mobile-portrait-state.json', portraitState ?? 'null');

const landscapeContext = await browser.newContext({
  viewport: { width: 844, height: 390 },
  isMobile: true,
  hasTouch: true,
});
const landscapePage = await landscapeContext.newPage();
await landscapePage.goto('http://127.0.0.1:4174/galleria', { waitUntil: 'networkidle' });
await landscapePage.waitForFunction(() => typeof window.render_game_to_text === 'function');
await landscapePage.waitForTimeout(800);
const landscapeState = await landscapePage.evaluate(() => window.render_game_to_text?.() ?? null);
await landscapePage.screenshot({ path: outDir + '/mobile-landscape.png', fullPage: true });
fs.writeFileSync(outDir + '/mobile-landscape-state.json', landscapeState ?? 'null');

if (errors.length) {
  fs.writeFileSync(outDir + '/desktop-errors.json', JSON.stringify(errors, null, 2));
}

await browser.close();
