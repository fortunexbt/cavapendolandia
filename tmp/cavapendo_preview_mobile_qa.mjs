import fs from 'node:fs';
import { chromium } from 'playwright';

const outDir = '/Users/fortune/cavapendolandia/tmp/manual-qa';
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });

const portraitContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const portraitPage = await portraitContext.newPage();
await portraitPage.goto('http://127.0.0.1:4175/galleria', { waitUntil: 'domcontentloaded' });
await portraitPage.waitForFunction(() => typeof window.render_game_to_text === 'function', null, { timeout: 20000 });
await portraitPage.waitForTimeout(1200);
const portraitState = await portraitPage.evaluate(() => window.render_game_to_text?.() ?? null);
await portraitPage.screenshot({ path: outDir + '/mobile-portrait.png', fullPage: true });
fs.writeFileSync(outDir + '/mobile-portrait-state.json', portraitState ?? 'null');

const landscapeContext = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
const landscapePage = await landscapeContext.newPage();
await landscapePage.goto('http://127.0.0.1:4175/galleria', { waitUntil: 'domcontentloaded' });
await landscapePage.waitForFunction(() => typeof window.render_game_to_text === 'function', null, { timeout: 20000 });
await landscapePage.waitForTimeout(1200);
const landscapeState = await landscapePage.evaluate(() => window.render_game_to_text?.() ?? null);
await landscapePage.screenshot({ path: outDir + '/mobile-landscape.png', fullPage: true });
fs.writeFileSync(outDir + '/mobile-landscape-state.json', landscapeState ?? 'null');
await browser.close();
