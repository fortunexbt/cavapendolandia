import fs from "node:fs";
import { chromium } from "playwright";

const BASE_URL = "http://127.0.0.1:4177/galleria";
const OUT_DIR = "/Users/fortune/cavapendolandia/tmp/manual-qa";

fs.mkdirSync(OUT_DIR, { recursive: true });

function log(step) {
  console.log(`[final-qa] ${step}`);
}

async function waitForGame(page) {
  await page.goto(BASE_URL, {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  await page.waitForFunction(
    () =>
      typeof window.advanceTime === "function" &&
      typeof window.render_game_to_text === "function",
    null,
    { timeout: 45000 },
  );
}

async function advance(page, frames) {
  for (let frame = 0; frame < frames; frame += 1) {
    await page.evaluate(async () => {
      if (typeof window.advanceTime === "function") {
        await window.advanceTime(1000 / 60);
      }
    });
  }
}

async function readState(page) {
  const raw = await page.evaluate(() => window.render_game_to_text?.() ?? null);
  return raw ? JSON.parse(raw) : null;
}

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader"],
});

try {
  log("desktop start");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();
  const desktopErrors = [];
  desktopPage.on("console", (msg) => {
    if (msg.type() === "error") {
      desktopErrors.push({ type: "console", text: msg.text() });
    }
  });
  desktopPage.on("pageerror", (err) => {
    desktopErrors.push({ type: "pageerror", text: String(err) });
  });

  await waitForGame(desktopPage);
  log("desktop ready");
  await desktopPage
    .locator("canvas")
    .first()
    .click({ position: { x: 320, y: 220 }, force: true });
  await desktopPage.waitForTimeout(250);
  const pointerLockAcquired = await desktopPage.evaluate(
    () => document.pointerLockElement !== null,
  );
  log(`desktop pointer lock ${pointerLockAcquired ? "acquired" : "missing"}`);
  await desktopPage.keyboard.press("f");
  await advance(desktopPage, 8);
  const desktopFullscreenState = await readState(desktopPage);
  await desktopPage.keyboard.down("ArrowUp");
  await advance(desktopPage, 235);
  await desktopPage.keyboard.up("ArrowUp");
  await advance(desktopPage, 8);
  await desktopPage.keyboard.press("Enter");
  await advance(desktopPage, 130);
  const desktopMeadowState = await readState(desktopPage);
  log("desktop meadow reached");
  await desktopPage.screenshot({
    path: `${OUT_DIR}/desktop-meadow-ship.png`,
    fullPage: false,
  });
  await desktopPage.keyboard.press("f");
  await advance(desktopPage, 8);
  const desktopExitFullscreenState = await readState(desktopPage);
  fs.writeFileSync(
    `${OUT_DIR}/desktop-ship-results.json`,
    JSON.stringify(
      {
        pointerLockAcquired,
        fullscreenState: desktopFullscreenState,
        meadowState: desktopMeadowState,
        exitFullscreenState: desktopExitFullscreenState,
        errors: desktopErrors,
      },
      null,
      2,
    ),
  );
  await desktopContext.close();
  log("desktop complete");

  log("mobile start");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  const mobileErrors = [];
  mobilePage.on("console", (msg) => {
    if (msg.type() === "error") {
      mobileErrors.push({ type: "console", text: msg.text() });
    }
  });
  mobilePage.on("pageerror", (err) => {
    mobileErrors.push({ type: "pageerror", text: String(err) });
  });

  await waitForGame(mobilePage);
  log("mobile ready");
  const mobilePortraitState = await readState(mobilePage);
  await mobilePage.screenshot({
    path: `${OUT_DIR}/mobile-portrait-ship.png`,
    fullPage: false,
  });
  await mobilePage.setViewportSize({ width: 844, height: 390 });
  await advance(mobilePage, 12);
  const mobileLandscapeState = await readState(mobilePage);
  log("mobile landscape ready");
  await mobilePage.screenshot({
    path: `${OUT_DIR}/mobile-landscape-ship.png`,
    fullPage: false,
  });
  await mobilePage.getByRole("button", { name: "Impostazioni" }).click();
  await mobilePage
    .getByRole("button", { name: /Entra in fullscreen|Esci dal fullscreen/ })
    .click();
  await advance(mobilePage, 8);
  const mobileFullscreenState = await readState(mobilePage);
  fs.writeFileSync(
    `${OUT_DIR}/mobile-ship-results.json`,
    JSON.stringify(
      {
        portraitState: mobilePortraitState,
        landscapeState: mobileLandscapeState,
        fullscreenState: mobileFullscreenState,
        errors: mobileErrors,
      },
      null,
      2,
    ),
  );
  await mobileContext.close();
  log("mobile complete");
} finally {
  await browser.close();
}
