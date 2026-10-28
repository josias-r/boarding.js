import { test, expect } from "@playwright/test";

test.describe("Popover Features & Customization", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/fixtures/test-page.html");
    await page.evaluate(() => {
      if ((window as any).activeBoarding) {
        (window as any).activeBoarding.reset(true);
      }
    });
  });

  test("positions popover according to preferredSide and alignment", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#box-2",
        popover: {
          title: "Side Test",
          description: "Testing bottom alignment",
          preferredSide: "bottom",
          alignment: "center",
        },
      });
    });

    const tip = page.locator("#boarding-popover-item .boarding-popover-tip");
    await expect(tip).toHaveClass(/boarding-tipside-bottom/);
    await expect(tip).toHaveClass(/boarding-tipalign-center/);
  });

  test("merges top-level className with step-level className", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        className: "global-scope-class",
      });
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#box-1",
        popover: {
          className: "step-specific-class",
          title: "Class Test",
          description: "Classes should be merged",
        },
      });
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover).toHaveClass(/global-scope-class/);
    await expect(popover).toHaveClass(/step-specific-class/);
  });

  test("showButtons: false hides the popover footer completely", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#box-1",
        popover: {
          title: "No Buttons",
          description: "Footer should be hidden",
          showButtons: false,
        },
      });
    });

    const footer = page.locator("#boarding-popover-item .boarding-popover-footer");
    await expect(footer).toHaveClass(/boarding-popover-footer-hidden/);
    await expect(footer).toBeHidden();
  });

  test("showButtons array filters which buttons are rendered", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        showButtons: ["close"],
      });
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        { element: "#box-1", popover: { title: "Step 1", description: "Desc 1" } },
        { element: "#box-2", popover: { title: "Step 2", description: "Desc 2" } },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover.locator(".boarding-close-btn")).toBeVisible();
    await expect(popover.locator(".boarding-next-btn")).toBeHidden();
    await expect(popover.locator(".boarding-prev-btn")).toBeHidden();
  });

  test("disableButtons disables specific buttons and prevents keyboard triggers", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        {
          element: "#box-1",
          popover: {
            title: "Disabled Next",
            description: "Cannot go forward",
            disableButtons: ["next"],
          },
        },
        { element: "#box-2", popover: { title: "Step 2", description: "Desc 2" } },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    const nextBtn = popover.locator(".boarding-next-btn");
    await expect(nextBtn).toHaveClass(/boarding-disabled/);

    // Keyboard ArrowRight should be ignored
    await page.keyboard.press("ArrowRight");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Disabled Next");

    const step = await page.evaluate(() => (window as any).activeBoarding.currentStep);
    expect(step).toBe(0);
  });

  test("onPopoverRender allows custom DOM enrichment", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        onPopoverRender: (elements: any) => {
          const badge = document.createElement("span");
          badge.id = "custom-badge";
          badge.textContent = "NEW FEATURE";
          badge.style.backgroundColor = "gold";
          elements.popoverTitle.prepend(badge);
        },
      });
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#box-1",
        popover: { title: " Title With Badge", description: "Desc" },
      });
    });

    const badge = page.locator("#custom-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("NEW FEATURE");
  });

  test("links inside description execute default action without resetting tour", async ({
    page,
  }) => {
    await page.evaluate(() => {
      window.location.hash = "";
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#box-1",
        popover: {
          title: "Link Test",
          description: '<a id="desc-link" href="#target-hash">Click Me</a>',
        },
      });
    });

    const link = page.locator("#desc-link");
    await link.click();

    // Default action (navigating to hash) should have succeeded
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toBe("#target-hash");

    // Popover should still be open
    await expect(page.locator("#boarding-popover-item")).toBeVisible();
  });

  test("dynamically positions and clamps popover tip near viewport boundaries", async ({
    page,
  }) => {
    await page.evaluate(() => {
      // Mount an element pinned near the right edge of the viewport
      let edgeEl = document.getElementById("edge-element");
      if (!edgeEl) {
        edgeEl = document.createElement("div");
        edgeEl.id = "edge-element";
        document.body.appendChild(edgeEl);
      }
      edgeEl.style.position = "absolute";
      edgeEl.style.top = "150px";
      edgeEl.style.right = "15px";
      edgeEl.style.width = "50px";
      edgeEl.style.height = "50px";
      edgeEl.style.background = "red";

      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#edge-element",
        popover: {
          title: "Boundary Clamping Test",
          description: "Popover is constrained by the right viewport boundary",
          preferredSide: "bottom",
          alignment: "center",
        },
      });
    });

    const popover = page.locator("#boarding-popover-item");
    const tip = popover.locator(".boarding-popover-tip");

    await expect(popover).toBeVisible();
    await expect(tip).toBeVisible();

    // Verify dynamic inline positioning applied to tip
    const tipInlineStyle = await tip.evaluate((el: HTMLElement) => ({
      left: el.style.left,
      right: el.style.right,
      marginLeft: el.style.marginLeft,
    }));

    // PR #37 sets dynamic left pixel value and negative half-size margin
    expect(tipInlineStyle.left).toMatch(/^\d+(\.\d+)?px$/);
    expect(tipInlineStyle.right).toBe("auto");
    expect(tipInlineStyle.marginLeft).toMatch(/^-\d+(\.\d+)?px$/);

    // Verify tip is physically constrained within the popover bounds
    const popoverBox = await popover.boundingBox();
    const tipBox = await tip.boundingBox();
    const targetBox = await page.locator("#edge-element").boundingBox();

    expect(popoverBox).not.toBeNull();
    expect(tipBox).not.toBeNull();
    expect(targetBox).not.toBeNull();

    // Tip should stay inside popover horizontally
    expect(tipBox!.x).toBeGreaterThanOrEqual(popoverBox!.x);
    expect(tipBox!.x + tipBox!.width).toBeLessThanOrEqual(popoverBox!.x + popoverBox!.width + 1);

    // Tip should be shifted towards the target element near the right side of the popover
    const popoverCenterX = popoverBox!.x + popoverBox!.width / 2;
    expect(tipBox!.x + tipBox!.width / 2).toBeGreaterThan(popoverCenterX);

    // Verify popover width doesn't exceed viewport clientWidth
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(popoverBox!.width).toBeLessThanOrEqual(clientWidth);

    // Highlighting a 'left' side element with enough room resets horizontal tip styles and applies vertical ones
    await page.evaluate(() => {
      let centerEl = document.getElementById("center-element");
      if (!centerEl) {
        centerEl = document.createElement("div");
        centerEl.id = "center-element";
        document.body.appendChild(centerEl);
      }
      centerEl.style.position = "absolute";
      centerEl.style.top = "200px";
      centerEl.style.left = "400px";
      centerEl.style.width = "80px";
      centerEl.style.height = "80px";

      (window as any).activeBoarding.highlight({
        element: "#center-element",
        popover: {
          title: "Center Element",
          description: "Testing vertical tip positioning on left side",
          preferredSide: "left",
        },
      });
    });

    const verticalTipStyles = await tip.evaluate((el: HTMLElement) => ({
      left: el.style.left,
      marginLeft: el.style.marginLeft,
      top: el.style.top,
      marginTop: el.style.marginTop,
    }));
    expect(verticalTipStyles.left).toBe("");
    expect(verticalTipStyles.marginLeft).toBe("");
    expect(verticalTipStyles.top).toMatch(/^\d+(\.\d+)?px$/);
    expect(verticalTipStyles.marginTop).toMatch(/^-\d+(\.\d+)?px$/);

    // Reset should unmount popover completely
    await page.evaluate(() => (window as any).activeBoarding.reset(true));
    await expect(popover).toHaveCount(0);
  });
});
