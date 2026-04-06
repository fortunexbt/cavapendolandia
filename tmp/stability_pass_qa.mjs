import fs from 'node:fs';
import { chromium } from 'playwright';

const outDir = '/Users/fortune/cavapendolandia/tmp/manual-qa/stability-pass';
fs.mkdirSync(outDir, { recursive: true });

function parseState(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function advance(page, frames) {
  for (let i = 0; i < frames; i += 1) {
    await page.evaluate(async () => {
      if (typeof window.advanceTime === 'function') {
        await window.advanceTime(1000 / 60);
      }
    });
  }
}

async function waitForGame(page) {
  await page.goto('http://127.0.0.1:4173/galleria', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForFunction(
    () =>
      typeof window.advanceTime === 'function' &&
      typeof window.render_game_to_text === 'function',
    null,
    { timeout: 20000 },
  );
  await page.waitForTimeout(1500);
}

async function readState(page) {
  const raw = await page.evaluate(() => window.render_game_to_text?.() ?? null);
  return {
    raw,
    parsed: parseState(raw),
  };
}

async function saveJson(filename, payload) {
  fs.writeFileSync(`${outDir}/${filename}`, JSON.stringify(payload, null, 2));
}

async function dispatchJoystickDrag(page, label, offsetX) {
  await page.evaluate(async ({ label, offsetX }) => {
    const root = Array.from(document.querySelectorAll('div')).find(
      (node) => node.textContent?.trim() === label,
    )?.parentElement?.parentElement;
    if (!root) {
      throw new Error(`Joystick ${label} not found`);
    }
    const rect = root.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const moveX = startX + offsetX;
    const moveY = startY;

    const emit = (type, x, y) => {
      const touch = new Touch({
        identifier: 1,
        target: root,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
        radiusX: 2,
        radiusY: 2,
      });
      const activeTouches = type === 'touchend' ? [] : [touch];
      root.dispatchEvent(
        new TouchEvent(type, {
          changedTouches: [touch],
          touches: activeTouches,
          targetTouches: activeTouches,
          bubbles: true,
          cancelable: true,
        }),
      );
    };

    emit('touchstart', startX, startY);
    emit('touchmove', moveX, moveY);
    if (typeof window.advanceTime === 'function') {
      await window.advanceTime(1000 / 60 * 24);
    }
    emit('touchend', moveX, moveY);
  }, { label, offsetX });
}

const browser = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader'],
});

const desktopContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const desktopPage = await desktopContext.newPage();
const desktopErrors = [];
desktopPage.on('console', (msg) => {
  if (msg.type() === 'error') {
    desktopErrors.push({ type: 'console', text: msg.text() });
  }
});
desktopPage.on('pageerror', (err) => {
  desktopErrors.push({ type: 'pageerror', text: String(err) });
});

await waitForGame(desktopPage);
const canvas = desktopPage.locator('canvas').first();
await canvas.click({ position: { x: 320, y: 220 } });
await desktopPage.waitForTimeout(250);
const pointerLockAcquired = await desktopPage.evaluate(
  () => document.pointerLockElement !== null,
);
await desktopPage.keyboard.press('f');
await advance(desktopPage, 8);
const desktopFullscreenState = await readState(desktopPage);
await desktopPage.keyboard.down('ArrowUp');
await advance(desktopPage, 235);
await desktopPage.keyboard.up('ArrowUp');
await advance(desktopPage, 8);
await desktopPage.keyboard.press('Enter');
await advance(desktopPage, 130);
const desktopMeadowState = await readState(desktopPage);
await desktopPage.screenshot({
  path: `${outDir}/desktop-meadow.png`,
  fullPage: true,
});
await desktopPage.keyboard.press('f');
await advance(desktopPage, 8);
const desktopExitFullscreenState = await readState(desktopPage);
await saveJson('desktop-results.json', {
  pointerLockAcquired,
  fullscreenState: desktopFullscreenState.parsed,
  meadowState: desktopMeadowState.parsed,
  exitFullscreenState: desktopExitFullscreenState.parsed,
  errors: desktopErrors,
});
await desktopContext.close();

const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const mobilePage = await mobileContext.newPage();
const mobileErrors = [];
mobilePage.on('console', (msg) => {
  if (msg.type() === 'error') {
    mobileErrors.push({ type: 'console', text: msg.text() });
  }
});
mobilePage.on('pageerror', (err) => {
  mobileErrors.push({ type: 'pageerror', text: String(err) });
});

await waitForGame(mobilePage);
const mobilePortraitState = await readState(mobilePage);
await mobilePage.screenshot({
  path: `${outDir}/mobile-portrait.png`,
  fullPage: true,
});
await mobilePage.setViewportSize({ width: 844, height: 390 });
await advance(mobilePage, 12);
const mobileLandscapeState = await readState(mobilePage);
await dispatchJoystickDrag(mobilePage, 'PASSI', 48);
const mobileAfterTouchState = await readState(mobilePage);
await mobilePage.getByRole('button', { name: 'Impostazioni' }).click();
await mobilePage
  .getByRole('button', { name: /Entra in fullscreen|Esci dal fullscreen/ })
  .click();
await advance(mobilePage, 8);
const mobileFullscreenState = await readState(mobilePage);
await mobilePage.screenshot({
  path: `${outDir}/mobile-landscape.png`,
  fullPage: true,
});
await saveJson('mobile-results.json', {
  portraitState: mobilePortraitState.parsed,
  landscapeState: mobileLandscapeState.parsed,
  afterTouchState: mobileAfterTouchState.parsed,
  fullscreenState: mobileFullscreenState.parsed,
  errors: mobileErrors,
});
await mobileContext.close();

await browser.close();
