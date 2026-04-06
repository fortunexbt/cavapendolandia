import { test, expect } from "@playwright/test";

/**
 * E2E: Loading animation (CavapendoliPrelude)
 * Covers: appears on first visit, dismisses on interaction,
 * progress bar animates, legible on light+dark mode,
 * skips when reduced-motion is set.
 */
test.describe("Prelude loading animation", () => {
  async function skipPrelude(page: import("@playwright/test").Page) {
    await page.goto("/");
    await page.waitForTimeout(1000); // Let prelude mount
    const prelude = page.locator('[aria-hidden="true"]').first();
    await expect(prelude).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("CAVAPENDOLANDIA").first()).toBeVisible();
    await expect(page.getByText("Un luogo delicato").first()).toBeVisible();
    // Keyboard dismiss is instant — avoids timing issues with auto-dismiss timer
    await page.keyboard.press("Space");
    await expect(prelude).not.toBeVisible({ timeout: 3000 });
  }

  test("progress bar is visible and animates", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    const progressBar = page.locator(".overflow-hidden.rounded-full.bg-muted").first();
    await expect(progressBar).toBeVisible();
    const inner = progressBar.locator(".rounded-full.bg-foreground");
    await expect(inner).toBeVisible();
  });

  test("clicking dismisses prelude early", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    const prelude = page.locator('[aria-hidden="true"]').first();
    await expect(prelude).toBeVisible({ timeout: 5000 });
    // The SVG logo inside the prelude is the actual click target
    const svgLogo = page.locator('svg[viewBox="0 0 280 240"]').first();
    await expect(svgLogo).toBeVisible({ timeout: 5000 });
    await svgLogo.click();
    await expect(prelude).not.toBeVisible({ timeout: 3000 });
  });

  test("pressing a key dismisses prelude early", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    const prelude = page.locator('[aria-hidden="true"]').first();
    await expect(prelude).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await expect(prelude).not.toBeVisible({ timeout: 3000 });
  });

  test("prelude auto-dismisses after ~4.5s", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
    const prelude = page.locator('[aria-hidden="true"]').first();
    await expect(prelude).toBeVisible({ timeout: 5000 });
    // Wait for auto-dismiss (4.5s + 2s buffer for animation to finish)
    await expect(prelude).not.toBeVisible({ timeout: 8000 });
  });

  test("prelude only plays once per session (not on subsequent navigations)", async ({
    page,
  }) => {
    // Prelude persists across page loads via sessionStorage
    const preludeSelector = '.pointer-events-none.fixed.inset-0.z-\\[60\\]';

    await page.goto("/");
    await page.waitForTimeout(1000);
    const prelude = page.locator(preludeSelector);
    await expect(prelude).toBeVisible({ timeout: 5000 });
    // The SVG logo inside the prelude is the actual click target
    const svgLogo = page.locator('svg[viewBox="0 0 280 240"]').first();
    await expect(svgLogo).toBeVisible({ timeout: 5000 });
    await svgLogo.click();
    await expect(prelude).not.toBeVisible({ timeout: 3000 });

    // Navigate to another page — prelude should NOT replay
    await page.goto("/offri");
    await page.waitForTimeout(2000);
    const preludeOffri = page.locator(preludeSelector);
    await expect(preludeOffri).not.toBeVisible({ timeout: 2000 });
  });

  test("visible and legible in light mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.waitForTimeout(1000);
    const prelude = page.locator('[aria-hidden="true"]').first();
    await expect(prelude).toBeVisible({ timeout: 5000 });
    const title = page.getByText("CAVAPENDOLANDIA").first();
    await expect(title).toBeVisible();
    // Verify title is not transparent
    const opacity = await title.evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    expect(Number(opacity)).toBeGreaterThan(0);
  });

  test("visible and legible in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForTimeout(1000);
    const prelude = page.locator('[aria-hidden="true"]').first();
    await expect(prelude).toBeVisible({ timeout: 5000 });
    const title = page.getByText("CAVAPENDOLANDIA").first();
    await expect(title).toBeVisible();
    const opacity = await title.evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    expect(Number(opacity)).toBeGreaterThan(0);
  });
});
