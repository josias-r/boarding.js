import { test, expect } from "@playwright/test";

test.describe("Single Element Highlighting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/fixtures/test-page.html");
    // Ensure any previously active boarding is reset
    await page.evaluate(() => {
      if ((window as any).activeBoarding) {
        (window as any).activeBoarding.reset(true);
      }
    });
  });

  test("highlights element by CSS selector without popover", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;
      boarding.highlight("#box-1");
    });

    const box = page.locator("#box-1");
    await expect(box).toHaveClass(/boarding-highlighted-element/);

    // Cutout SVG overlay should be mounted
    const overlay = page.locator("svg.boarding-coutout-svg");
    await expect(overlay).toBeVisible();

    // No popover should exist
    const popover = page.locator("#boarding-popover-item");
    await expect(popover).toHaveCount(0);

    // Boarding state
    const state = await page.evaluate(() => ({
      isActivated: (window as any).activeBoarding.isActivated,
      hasHighlighted: (window as any).activeBoarding.hasHighlightedElement(),
    }));
    expect(state.isActivated).toBe(true);
    expect(state.hasHighlighted).toBe(true);
  });

  test("highlights element by HTMLElement reference with popover", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById("box-2") as HTMLElement;
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;
      boarding.highlight({
        element: el,
        popover: {
          title: "Box 2 Title",
          description: "Box 2 Description content",
        },
      });
    });

    await expect(page.locator("#box-2")).toHaveClass(/boarding-highlighted-element/);

    const popover = page.locator("#boarding-popover-item");
    await expect(popover).toBeVisible();
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Box 2 Title");
    await expect(popover.locator(".boarding-popover-description")).toHaveText("Box 2 Description content");

    // Single element highlight with popover should only have close button (no prev/next buttons)
    const prevBtn = popover.locator(".boarding-prev-btn");
    const nextBtn = popover.locator(".boarding-next-btn");
    await expect(prevBtn).toBeHidden();
    await expect(nextBtn).toBeHidden();

    const closeBtn = popover.locator(".boarding-close-btn");
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveClass(/boarding-close-only-btn/);
  });

  test("supports HTML in popover title and description", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;
      boarding.highlight({
        element: "#box-1",
        popover: {
          title: "<strong id='custom-title'>Formatted Title</strong>",
          description: "<span id='custom-desc'>Formatted <em>Description</em></span>",
        },
      });
    });

    await expect(page.locator("#custom-title")).toHaveText("Formatted Title");
    await expect(page.locator("#custom-desc em")).toHaveText("Description");
  });

  test("cutout applies custom padding and radius options", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        padding: 25,
        radius: 12,
        opacity: 0.85,
        overlayColor: "rgb(20, 20, 20)",
      });
      (window as any).activeBoarding = boarding;
      boarding.highlight("#box-1");
    });

    const svgPath = page.locator("svg.boarding-coutout-svg path");
    await expect(svgPath).toBeVisible();

    const pathStyle = await svgPath.evaluate((el: SVGPathElement) => ({
      fill: el.style.fill,
      opacity: el.style.opacity,
    }));
    expect(pathStyle.fill).toBe("rgb(20, 20, 20)");
    expect(pathStyle.opacity).toBe("0.85");

    // Check SVG path "d" contains radius arc commands 'a12,12'
    const d = await svgPath.getAttribute("d");
    expect(d).toContain("a12,12");
  });

  test("step-level custom padding and radius override top-level options", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        padding: 10,
        radius: 5,
      });
      (window as any).activeBoarding = boarding;
      boarding.highlight({
        element: "#box-1",
        padding: 30,
        radius: 18,
      });
    });

    const svgPath = page.locator("svg.boarding-coutout-svg path");
    const d = await svgPath.getAttribute("d");
    expect(d).toContain("a18,18");
  });

  test("closes when close button is clicked", async ({ page }) => {
    await page.evaluate(() => {
      const events: string[] = [];
      (window as any).recordedEvents = events;

      const boarding = new (window as any).Boarding({
        onReset: (_el: any, exitReason: string) => {
          events.push(`reset:${exitReason}`);
        },
      });
      (window as any).activeBoarding = boarding;
      boarding.highlight({
        element: "#box-1",
        popover: { title: "Title", description: "Desc" },
      });
    });

    await page.locator(".boarding-close-btn").click();

    await expect(page.locator("svg.boarding-coutout-svg")).toHaveCount(0);
    await expect(page.locator("#boarding-popover-item")).toHaveCount(0);
    await expect(page.locator("#box-1")).not.toHaveClass(/boarding-highlighted-element/);

    const events = await page.evaluate(() => (window as any).recordedEvents);
    expect(events).toContain("reset:cancel");
  });

  test("clicking overlay backdrop resets when allowClose is true", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({ allowClose: true });
      (window as any).activeBoarding = boarding;
      boarding.highlight("#box-1");
    });

    await expect(page.locator("svg.boarding-coutout-svg")).toBeVisible();

    // Click backdrop
    await page.locator("svg.boarding-coutout-svg path").click({ position: { x: 10, y: 10 } });

    await expect(page.locator("svg.boarding-coutout-svg")).toHaveCount(0);
    const isActivated = await page.evaluate(() => (window as any).activeBoarding.isActivated);
    expect(isActivated).toBe(false);
  });

  test("clicking overlay backdrop does NOT reset when allowClose is false", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({ allowClose: false });
      (window as any).activeBoarding = boarding;
      boarding.highlight("#box-1");
    });

    await page.locator("svg.boarding-coutout-svg path").click({ position: { x: 10, y: 10 } });

    // Overlay should remain visible
    await expect(page.locator("svg.boarding-coutout-svg")).toBeVisible();
    const isActivated = await page.evaluate(() => (window as any).activeBoarding.isActivated);
    expect(isActivated).toBe(true);
  });

  test("pressing Escape closes when allowClose is true and ignores when allowClose is false", async ({ page }) => {
    // 1. allowClose: false
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({ allowClose: false, keyboardControl: true });
      (window as any).activeBoarding = boarding;
      boarding.highlight("#box-1");
    });

    await page.keyboard.press("Escape");
    await expect(page.locator("svg.boarding-coutout-svg")).toBeVisible();

    // 2. allowClose: true
    await page.evaluate(() => {
      (window as any).activeBoarding.reset(true);
      const boarding = new (window as any).Boarding({ allowClose: true, keyboardControl: true });
      (window as any).activeBoarding = boarding;
      boarding.highlight("#box-1");
    });

    await page.keyboard.press("Escape");
    await expect(page.locator("svg.boarding-coutout-svg")).toHaveCount(0);
  });

  test("triggers lifecycle hooks: onBeforeHighlighted, onHighlighted, onDeselected, onReset", async ({ page }) => {
    await page.evaluate(() => {
      const log: string[] = [];
      (window as any).lifecycleLog = log;

      const boarding = new (window as any).Boarding({
        onReset: (_el: any, reason: string) => log.push(`top:onReset:${reason}`),
      });
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#box-1",
        onBeforeHighlighted: () => log.push("box1:onBeforeHighlighted"),
        onHighlighted: () => log.push("box1:onHighlighted"),
        onDeselected: () => log.push("box1:onDeselected"),
      });
    });

    let log = await page.evaluate(() => (window as any).lifecycleLog);
    expect(log).toEqual(["box1:onBeforeHighlighted", "box1:onHighlighted"]);

    // Transition to box-2
    await page.evaluate(() => {
      (window as any).activeBoarding.highlight({
        element: "#box-2",
        onBeforeHighlighted: () => (window as any).lifecycleLog.push("box2:onBeforeHighlighted"),
        onHighlighted: () => (window as any).lifecycleLog.push("box2:onHighlighted"),
        onDeselected: () => (window as any).lifecycleLog.push("box2:onDeselected"),
      });
    });

    log = await page.evaluate(() => (window as any).lifecycleLog);
    expect(log).toContain("box1:onDeselected");
    expect(log).toContain("box2:onBeforeHighlighted");
    expect(log).toContain("box2:onHighlighted");

    // Reset
    await page.evaluate(() => {
      (window as any).activeBoarding.reset(true, "cancel");
    });

    log = await page.evaluate(() => (window as any).lifecycleLog);
    expect(log).toContain("box2:onDeselected");
    expect(log).toContain("top:onReset:cancel");
  });

  test("tracked getters getHighlightedElement and getLastHighlightedElement", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;
      boarding.highlight("#box-1");
    });

    let currentId = await page.evaluate(() =>
      (window as any).activeBoarding.getHighlightedElement()?.getElement()?.id
    );
    let lastId = await page.evaluate(() =>
      (window as any).activeBoarding.getLastHighlightedElement()?.getElement()?.id
    );
    expect(currentId).toBe("box-1");
    expect(lastId).toBeUndefined();

    // Highlight box-2
    await page.evaluate(() => {
      (window as any).activeBoarding.highlight("#box-2");
    });

    currentId = await page.evaluate(() =>
      (window as any).activeBoarding.getHighlightedElement()?.getElement()?.id
    );
    lastId = await page.evaluate(() =>
      (window as any).activeBoarding.getLastHighlightedElement()?.getElement()?.id
    );
    expect(currentId).toBe("box-2");
    expect(lastId).toBe("box-1");
  });
});
