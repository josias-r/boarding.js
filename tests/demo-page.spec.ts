import { test, expect } from "@playwright/test";

test.describe("Demo Page (Mini Homepage)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/index.html");
  });

  test("runs animated tour from header button", async ({ page }) => {
    await page.locator("#animated-tour").click();

    const popover = page.locator("#boarding-popover-item");
    await expect(popover).toBeVisible();
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Before we start");

    // Click Next ("Okay, Start!")
    await popover.locator(".boarding-next-btn").click();

    // Second step highlights logo with "Focus Anything"
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Focus Anything");
    await expect(page.locator("#logo_img")).toHaveClass(/boarding-highlighted-element/);

    // Escape closes the tour
    await page.keyboard.press("Escape");
    await expect(popover).toHaveCount(0);
  });

  test("runs boring tour with custom className scope", async ({ page }) => {
    await page.locator("#boring-tour").click();

    const popover = page.locator("#boarding-popover-item");
    await expect(popover).toBeVisible();
    await expect(popover).toHaveClass(/boring-scope/);

    await page.keyboard.press("Escape");
    await expect(popover).toHaveCount(0);
  });

  test("highlights single element without popover", async ({ page }) => {
    await page.locator("#run-single-element-no-popover").click();

    await expect(page.locator("svg.boarding-coutout-svg")).toBeVisible();
    await expect(page.locator("#boarding-popover-item")).toHaveCount(0);
    await expect(page.locator("#single-element-no-popover")).toHaveClass(
      /boarding-highlighted-element/,
    );

    await page.keyboard.press("Escape");
    await expect(page.locator("svg.boarding-coutout-svg")).toHaveCount(0);
  });

  test("highlights single element with popover", async ({ page }) => {
    await page.locator("#run-single-element-with-popover").click();

    const popover = page.locator("#boarding-popover-item");
    await expect(popover).toBeVisible();
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Did you know?");

    await page.keyboard.press("Escape");
    await expect(popover).toHaveCount(0);
  });

  test("focusing form inputs highlights input fields", async ({ page }) => {
    const input = page.locator("#creation-input");
    await input.focus();

    await expect(page.locator("svg.boarding-coutout-svg")).toBeVisible();
    await expect(input).toHaveClass(/boarding-highlighted-element/);

    await page.keyboard.press("Escape");
    await expect(page.locator("svg.boarding-coutout-svg")).toHaveCount(0);
  });

  test("step counter demo appends step numbers to popover title", async ({ page }) => {
    await page.locator("#run-element-with-step-counter").click();

    const popover = page.locator("#boarding-popover-item");
    await expect(popover).toBeVisible();
    await expect(popover.locator(".boarding-popover-title")).toContainText("(1/2)");

    await popover.locator(".boarding-next-btn").click();
    await expect(popover.locator(".boarding-popover-title")).toContainText("(2/2)");

    await popover.locator(".boarding-next-btn").click();
    await expect(popover).toHaveCount(0);
  });

  test("single element no-close demo prevents backdrop click closing", async ({ page }) => {
    await page.locator("#run-single-element-no-close").click();

    const popover = page.locator("#boarding-popover-item");
    await expect(popover).toBeVisible();
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Uh-huh!");

    // Clicking overlay backdrop should NOT close
    await page.locator("svg.boarding-coutout-svg path").click({ position: { x: 10, y: 10 } });
    await expect(popover).toBeVisible();

    // Advance to next step and close
    await popover.locator(".boarding-next-btn").click();
    await page.locator(".boarding-close-btn").click();
    await expect(popover).toHaveCount(0);
  });
});
