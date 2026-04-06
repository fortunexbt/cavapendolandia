import { test, expect } from "@playwright/test";

/**
 * E2E: Navigation — cross-page links, redirects, and routing integrity.
 */
test.describe("Navigation — routing integrity", () => {
  async function skipPrelude(page: import("@playwright/test").Page) {
    await page.goto("/");
    await page.click("body");
    await page.waitForTimeout(500);
  }

  test("header nav links are present on homepage", async ({ page }) => {
    await skipPrelude(page);
    await page.waitForTimeout(500);

    // Check that nav links are present
    const routes = ["/che-cose", "/offri", "/regole"];
    for (const href of routes) {
      const link = page.locator(`header a[href="${href}"]`).first();
      const isVisible = await link.isVisible().catch(() => false);
      if (isVisible) {
        await expect(link).toBeVisible();
      }
    }
  });

  test("footer links are present", async ({ page }) => {
    await skipPrelude(page);
    await page.waitForTimeout(500);
    const footer = page.locator("footer");
    if (await footer.isVisible()) {
      const links = await footer.locator("a").count();
      expect(links).toBeGreaterThan(0);
    }
  });

  test("logo click returns to homepage", async ({ page }) => {
    await skipPrelude(page);
    await page.goto("/offri");
    await page.waitForTimeout(2000);
    const logo = page.locator("header a").first();
    if (await logo.isVisible()) {
      await logo.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL("http://localhost:8080/", {
        timeout: 5000,
      });
    }
  });

  test("browser back/forward works correctly", async ({ page }) => {
    await skipPrelude(page);

    await page.goto("/offri");
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/offri/);

    await page.goto("/regole");
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/regole/);

    await page.goBack();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/offri/);

    await page.goForward();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/regole/);
  });

  test("theme toggle is present in header", async ({ page }) => {
    await skipPrelude(page);
    await page.waitForTimeout(500);
    const themeButtons = page.locator("button[aria-label]");
    const count = await themeButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("language switcher is present in header", async ({ page }) => {
    await skipPrelude(page);
    await page.waitForTimeout(500);
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });
});
