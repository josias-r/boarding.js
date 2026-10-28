import { test, expect } from "@playwright/test";

test.describe("Tour Navigation & Multi-step Tours", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/fixtures/test-page.html");
    await page.evaluate(() => {
      if ((window as any).activeBoarding) {
        (window as any).activeBoarding.reset(true);
      }
    });
  });

  test("runs full 3-step tour using Next and Previous buttons", async ({ page }) => {
    await page.evaluate(() => {
      const events: string[] = [];
      (window as any).tourEvents = events;

      const boarding = new (window as any).Boarding({
        onStart: (el: any) => events.push(`start:${el.getElement().id}`),
        onReset: (_el: any, reason: string) => events.push(`reset:${reason}`),
        startBtnText: "Let's Go!",
        nextBtnText: "Forward",
        prevBtnText: "Back",
        doneBtnText: "All Done!",
      });
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        {
          element: "#box-1",
          popover: { title: "Step 1", description: "First Step" },
          onNext: () => events.push("box1:onNext"),
        },
        {
          element: "#box-2",
          popover: { title: "Step 2", description: "Second Step" },
          onNext: () => events.push("box2:onNext"),
          onPrevious: () => events.push("box2:onPrevious"),
        },
        {
          element: "#box-3",
          popover: { title: "Step 3", description: "Third Step" },
          onPrevious: () => events.push("box3:onPrevious"),
        },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    const prevBtn = popover.locator(".boarding-prev-btn");
    const nextBtn = popover.locator(".boarding-next-btn");

    // --- Step 1 ---
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");
    await expect(nextBtn).toHaveText("Let's Go!");
    await expect(prevBtn).toHaveClass(/boarding-disabled/);
    await expect(page.locator("#box-1")).toHaveClass(/boarding-highlighted-element/);

    let state = await page.evaluate(() => ({
      step: (window as any).activeBoarding.currentStep,
      hasNext: (window as any).activeBoarding.hasNextStep(),
      hasPrev: (window as any).activeBoarding.hasPreviousStep(),
    }));
    expect(state).toEqual({ step: 0, hasNext: true, hasPrev: false });

    // Click Next -> advances to Step 2
    await nextBtn.click();

    // --- Step 2 ---
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 2");
    await expect(nextBtn).toHaveText("Forward");
    await expect(prevBtn).toHaveText("Back");
    await expect(prevBtn).not.toHaveClass(/boarding-disabled/);
    await expect(page.locator("#box-2")).toHaveClass(/boarding-highlighted-element/);
    await expect(page.locator("#box-1")).not.toHaveClass(/boarding-highlighted-element/);

    state = await page.evaluate(() => ({
      step: (window as any).activeBoarding.currentStep,
      hasNext: (window as any).activeBoarding.hasNextStep(),
      hasPrev: (window as any).activeBoarding.hasPreviousStep(),
    }));
    expect(state).toEqual({ step: 1, hasNext: true, hasPrev: true });

    // Click Back -> returns to Step 1
    await prevBtn.click();

    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");
    await expect(prevBtn).toHaveClass(/boarding-disabled/);

    // Click Next twice -> goes to Step 3
    await nextBtn.click();
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 2");
    await nextBtn.click();

    // --- Step 3 ---
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 3");
    await expect(nextBtn).toHaveText("All Done!");
    await expect(page.locator("#box-3")).toHaveClass(/boarding-highlighted-element/);

    state = await page.evaluate(() => ({
      step: (window as any).activeBoarding.currentStep,
      hasNext: (window as any).activeBoarding.hasNextStep(),
      hasPrev: (window as any).activeBoarding.hasPreviousStep(),
    }));
    expect(state).toEqual({ step: 2, hasNext: false, hasPrev: true });

    // Click All Done! -> finishes tour with "finish" exitReason
    await nextBtn.click();

    await expect(popover).toHaveCount(0);
    await expect(page.locator("svg.boarding-coutout-svg")).toHaveCount(0);

    const events = await page.evaluate(() => (window as any).tourEvents);
    expect(events).toContain("start:box-1");
    expect(events).toContain("box1:onNext");
    expect(events).toContain("box2:onPrevious");
    expect(events).toContain("reset:finish");
  });

  test("starts tour from a specific index", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        { element: "#box-1", popover: { title: "Step 1", description: "Desc 1" } },
        { element: "#box-2", popover: { title: "Step 2", description: "Desc 2" } },
        { element: "#box-3", popover: { title: "Step 3", description: "Desc 3" } },
      ]);

      boarding.start(1); // start at index 1 (box-2)
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 2");
    await expect(page.locator("#box-2")).toHaveClass(/boarding-highlighted-element/);

    const step = await page.evaluate(() => (window as any).activeBoarding.currentStep);
    expect(step).toBe(1);
  });

  test("controls tour steps with keyboard (ArrowRight and ArrowLeft)", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({ keyboardControl: true });
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        { element: "#box-1", popover: { title: "Step 1", description: "Desc 1" } },
        { element: "#box-2", popover: { title: "Step 2", description: "Desc 2" } },
        { element: "#box-3", popover: { title: "Step 3", description: "Desc 3" } },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    // ArrowLeft on first step should do nothing
    await page.keyboard.press("ArrowLeft");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    // ArrowRight advances to step 2
    await page.keyboard.press("ArrowRight");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 2");

    // ArrowRight advances to step 3
    await page.keyboard.press("ArrowRight");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 3");

    // ArrowLeft goes back to step 2
    await page.keyboard.press("ArrowLeft");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 2");

    // ArrowRight to 3, then ArrowRight finishes
    await page.keyboard.press("ArrowRight");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 3");
    await page.keyboard.press("ArrowRight");

    // Tour finished
    await expect(popover).toHaveCount(0);
    const isActivated = await page.evaluate(() => (window as any).activeBoarding.isActivated);
    expect(isActivated).toBe(false);
  });

  test("keyboardControl: false disables keyboard navigation", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({ keyboardControl: false });
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        { element: "#box-1", popover: { title: "Step 1", description: "Desc 1" } },
        { element: "#box-2", popover: { title: "Step 2", description: "Desc 2" } },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    await page.keyboard.press("ArrowRight");
    // Should still be on Step 1
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    await page.keyboard.press("Escape");
    // Escape should be ignored as well
    await expect(popover).toBeVisible();
  });

  test("keyboardControlRtl: true inverts left and right arrow navigation", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({
        keyboardControl: true,
        keyboardControlRtl: true,
      });
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        { element: "#box-1", popover: { title: "Step 1", description: "Desc 1" } },
        { element: "#box-2", popover: { title: "Step 2", description: "Desc 2" } },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    // In RTL, ArrowLeft means Next!
    await page.keyboard.press("ArrowLeft");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 2");

    // In RTL, ArrowRight means Previous!
    await page.keyboard.press("ArrowRight");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");
  });

  test("single-step tour behaves like single element with close-only button", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        { element: "#box-1", popover: { title: "Solo Step", description: "Only step" } },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Solo Step");

    // Next and previous buttons should be hidden
    await expect(popover.locator(".boarding-next-btn")).toBeHidden();
    await expect(popover.locator(".boarding-prev-btn")).toBeHidden();
    await expect(popover.locator(".boarding-close-btn")).toHaveClass(/boarding-close-only-btn/);
  });
});
