import { test, expect } from "@playwright/test";

test.describe("Strict Click Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/fixtures/test-page.html");
    await page.evaluate(() => {
      if ((window as any).activeBoarding) {
        (window as any).activeBoarding.reset(true);
      }
    });
  });

  test("strictClickHandling: true blocks outside clicks but allows clicking active element", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        strictClickHandling: true,
        allowClose: false, // keep open on outside clicks
      });
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#interactive-target",
        popover: { title: "Active Element", description: "You can click this element" },
      });
    });

    // Body should have strict pointer events class
    await expect(page.locator("body")).toHaveClass(/boarding-strict-pointer-events/);

    const outsideBtn = page.locator("#outside-button");
    const interactiveTarget = page.locator("#interactive-target");

    // Click outside button -> should be blocked and not trigger handler
    await outsideBtn.click({ force: true });
    await expect(outsideBtn).toHaveText("Outside Button (Clicked: 0)");

    // Boarding should still be active
    const isActivated = await page.evaluate(() => (window as any).activeBoarding.isActivated);
    expect(isActivated).toBe(true);

    // Click interactive element -> should be allowed!
    await interactiveTarget.click();
    await expect(interactiveTarget).toHaveText("Interactive Box (Clicked: 1)");

    // Clean up
    await page.evaluate(() => (window as any).activeBoarding.reset(true));
    await expect(page.locator("body")).not.toHaveClass(/boarding-strict-pointer-events/);
  });

  test("strictClickHandling: 'block-all' blocks everything except popover", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        strictClickHandling: "block-all",
        allowClose: false, // keep open on outside clicks
      });
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#interactive-target",
        popover: { title: "Block All", description: "All clicks blocked" },
      });
    });

    // Body should have no pointer events class
    await expect(page.locator("body")).toHaveClass(/boarding-no-pointer-events/);

    const outsideBtn = page.locator("#outside-button");
    const interactiveTarget = page.locator("#interactive-target");

    // Outside button click blocked
    await outsideBtn.click({ force: true });
    await expect(outsideBtn).toHaveText("Outside Button (Clicked: 0)");

    // In block-all mode, interactive element must have pointer-events: none computed
    const pointerEvents = await interactiveTarget.evaluate(
      (el) => window.getComputedStyle(el).pointerEvents,
    );
    expect(pointerEvents).toBe("none");

    // Popover close button still works!
    await page.locator(".boarding-close-btn").click();
    await expect(page.locator("#boarding-popover-item")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveClass(/boarding-no-pointer-events/);
  });

  test("strictClickHandling: false allows outside clicks to pass through", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        strictClickHandling: false,
        allowClose: false, // don't close when clicking outside so we can verify the button receives click
      });
      (window as any).activeBoarding = boarding;

      boarding.highlight("#box-1");
    });

    await expect(page.locator("body")).not.toHaveClass(/boarding-strict-pointer-events/);
    await expect(page.locator("body")).not.toHaveClass(/boarding-no-pointer-events/);

    const outsideBtn = page.locator("#outside-button");
    await outsideBtn.click();
    await expect(outsideBtn).toHaveText("Outside Button (Clicked: 1)");
  });

  test("step-level strictClickHandling overrides top-level option", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        strictClickHandling: true,
      });
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        {
          element: "#box-1",
          strictClickHandling: false,
          popover: { title: "Step 1", description: "Strict disabled" },
        },
        {
          element: "#box-2",
          strictClickHandling: "block-all",
          popover: { title: "Step 2", description: "Block all enabled" },
        },
      ]);

      boarding.start();
    });

    const body = page.locator("body");

    // Step 1: strictClickHandling: false
    await expect(body).not.toHaveClass(/boarding-strict-pointer-events/);
    await expect(body).not.toHaveClass(/boarding-no-pointer-events/);

    // Advance to Step 2
    await page.locator(".boarding-next-btn").click();

    // Step 2: strictClickHandling: "block-all"
    await expect(body).toHaveClass(/boarding-no-pointer-events/);

    // Reset removes all classes
    await page.evaluate(() => (window as any).activeBoarding.reset(true));
    await expect(body).not.toHaveClass(/boarding-no-pointer-events/);
    await expect(body).not.toHaveClass(/boarding-strict-pointer-events/);
  });
});
