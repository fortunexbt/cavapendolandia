import { test, expect } from "@playwright/test";

/**
 * E2E: Homepage (Index)
 * Critical: tests the blanking fix — page must render even when
 * DB tables (initiatives, page_content) are absent/unreachable.
 */
test.describe("Homepage (Index) — blanking fix verification", () => {
  test("renders without blanking in dark mode (default)", async ({ page }) => {
    await page.goto("/");
    await page.click("body");
    await page.waitForTimeout(1000);

    await expect(
      page.getByRole("heading", { name: /Cavapendolandia/i })
    ).toBeVisible({ timeout: 10_000 });
    const seahorse = page.locator("svg").first();
    await expect(seahorse).toBeVisible();
  });

  test("renders in light mode without blanking", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.click("body");
    await page.waitForTimeout(1000);

    await expect(
      page.getByRole("heading", { name: /Cavapendolandia/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("nav links are all present and point to valid routes", async ({
    page,
  }) => {
    await page.goto("/");
    await page.click("body");
    await page.waitForTimeout(1000);

    const routes = ["/che-cose", "/galleria", "/offri", "/regole", "/rimozione"];
    for (const href of routes) {
      const link = page.locator(`a[href="${href}"]`).first();
      await expect(link).toBeVisible();
    }
  });

  test("three quick-nav links work", async ({ page }) => {
    await page.goto("/");
    await page.click("body");
    await page.waitForTimeout(1000);

    await page.locator("a[href=\"/galleria\"]").first().click();
    await expect(page).toHaveURL(/\/galleria/, { timeout: 5000 });

    await page.goto("/");
    await page.click("body");
    await page.waitForTimeout(500);
    await page.locator("a[href=\"/offri\"]").first().click();
    await expect(page).toHaveURL(/\/offri/, { timeout: 5000 });
  });

  test("page does NOT throw uncaught errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await page.click("body");
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("404") &&
        !e.includes("net::ERR") &&
        !e.toLowerCase().includes("webgl") &&
        !e.includes("406") // Supabase auth in e2e context
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("Mystical opening text blocks are rendered", async ({ page }) => {
    await page.goto("/");
    await page.click("body");
    await page.waitForTimeout(1500);

    // At least some mystical opening paragraphs should be visible
    const paragraphs = page.locator("p");
    const count = await paragraphs.count();
    expect(count).toBeGreaterThan(3);
  });

  test("footer is visible", async ({ page }) => {
    await page.goto("/");
    await page.click("body");
    await page.waitForTimeout(1500);
    await expect(page.getByText(/cavapendolandia/i).last()).toBeVisible();
  });
});
