import { test, expect } from "@playwright/test";

test.describe("Advanced Overlay Behaviors", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/fixtures/test-page.html");
    await page.evaluate(() => {
      if ((window as any).activeBoarding) {
        (window as any).activeBoarding.reset(true);
      }
    });
  });

  test("overlayClickNext: true advances to next step on overlay backdrop click", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        overlayClickNext: true,
      });
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        { element: "#box-1", popover: { title: "Step 1", description: "Click backdrop to advance" } },
        { element: "#box-2", popover: { title: "Step 2", description: "Advanced via backdrop" } },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    // Click the backdrop path
    await page.locator("svg.boarding-coutout-svg path").click({ position: { x: 10, y: 10 } });

    // Should advance to Step 2
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 2");
    const step = await page.evaluate(() => (window as any).activeBoarding.currentStep);
    expect(step).toBe(1);
  });

  test("animate: false omits animated class from SVG cutout and popover", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        animate: false,
      });
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#box-1",
        popover: { title: "No Animation", description: "Immediate rendering" },
      });
    });

    const svg = page.locator("svg.boarding-coutout-svg");
    const popover = page.locator("#boarding-popover-item");

    await expect(svg).not.toHaveClass(/boarding-coutout-svg-animated/);
    await expect(popover).not.toHaveClass(/boarding-popover-item-animated/);
  });

  test("animate: true includes animated classes on SVG cutout and popover", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        animate: true,
      });
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#box-1",
        popover: { title: "With Animation", description: "Animated" },
      });
    });

    const svg = page.locator("svg.boarding-coutout-svg");
    const popover = page.locator("#boarding-popover-item");

    await expect(svg).toHaveClass(/boarding-coutout-svg-animated/);
    await expect(popover).toHaveClass(/boarding-popover-item-animated/);
  });

  test("scrollIntoViewOptions: 'no-scroll' avoids auto-scrolling", async ({ page }) => {
    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        scrollIntoViewOptions: "no-scroll",
      });
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#bottom-element",
        popover: { title: "Bottom", description: "Should not scroll window" },
      });
    });

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });
});
