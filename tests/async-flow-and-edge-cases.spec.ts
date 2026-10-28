import { test, expect } from "@playwright/test";

test.describe("Async Flow & Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tests/fixtures/test-page.html");
    await page.evaluate(() => {
      if ((window as any).activeBoarding) {
        (window as any).activeBoarding.reset(true);
      }
    });
  });

  test("prepareElement receives correct initiator and can mount dynamic elements", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const log: string[] = [];
      (window as any).prepareLog = log;

      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        {
          element: "#box-1",
          popover: { title: "Step 1", description: "First" },
          prepareElement: (initiator: string) => log.push(`step1:${initiator}`),
        },
        {
          element: "#dynamic-box",
          popover: { title: "Dynamic Step", description: "Created on the fly" },
          prepareElement: (initiator: string) => {
            log.push(`dynamic:${initiator}`);
            // Mount the element into DOM right now!
            const container = document.getElementById("dynamic-container");
            if (container && !document.getElementById("dynamic-box")) {
              const div = document.createElement("div");
              div.id = "dynamic-box";
              div.className = "box";
              div.textContent = "I was dynamically created!";
              container.appendChild(div);
            }
          },
        },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    let log = await page.evaluate(() => (window as any).prepareLog);
    expect(log).toEqual(["step1:init"]);

    // Advance to step 2 (dynamic element)
    await page.locator(".boarding-next-btn").click();

    await expect(popover.locator(".boarding-popover-title")).toHaveText("Dynamic Step");
    await expect(page.locator("#dynamic-box")).toHaveClass(/boarding-highlighted-element/);

    log = await page.evaluate(() => (window as any).prepareLog);
    expect(log).toContain("dynamic:next");

    // Go back to step 1
    await page.locator(".boarding-prev-btn").click();
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    log = await page.evaluate(() => (window as any).prepareLog);
    expect(log).toContain("step1:prev");
  });

  test("preventMove() halts movement and continue() resumes asynchronously", async ({ page }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      (window as any).activeBoarding = boarding;

      boarding.defineSteps([
        {
          element: "#box-1",
          popover: { title: "Step 1", description: "First" },
        },
        {
          element: "#box-2",
          popover: { title: "Step 2", description: "Async transition" },
          prepareElement: () => {
            // Halt transition
            boarding.preventMove();
            // Simulate async task (e.g. fetching data or animating), then continue
            setTimeout(() => {
              boarding.continue();
            }, 300);
          },
        },
      ]);

      boarding.start();
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    // Click next -> will be prevented by prepareElement
    await page.locator(".boarding-next-btn").click();

    // While waiting for 300ms, should still be on Step 1
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 1");

    // After async continue(), should advance to Step 2
    await expect(popover.locator(".boarding-popover-title")).toHaveText("Step 2", {
      timeout: 3000,
    });
    await expect(page.locator("#box-2")).toHaveClass(/boarding-highlighted-element/);
  });

  test("marks popover with boarding-popover-element-missing when highlighted element is removed from DOM", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const boarding = new (window as any).Boarding({ animate: false });
      (window as any).activeBoarding = boarding;

      boarding.highlight({
        element: "#box-1",
        popover: { title: "Will disappear", description: "Element is going away" },
      });
    });

    const popover = page.locator("#boarding-popover-item");
    await expect(popover).toBeVisible();
    await expect(popover).not.toHaveClass(/boarding-popover-element-missing/);

    // Remove the element from the DOM
    await page.evaluate(() => {
      document.getElementById("box-1")?.remove();
      // Trigger getDOMRect by reading it
      (window as any).activeBoarding.getHighlightedElement()?.getDOMRect();
    });

    await expect(popover).toHaveClass(/boarding-popover-element-missing/);
  });

  test("throws error when starting without any steps defined", async ({ page }) => {
    const errorMsg = await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      try {
        boarding.start();
        return null;
      } catch (err: any) {
        return err.message;
      }
    });

    expect(errorMsg).toBe("There are no steps defined to iterate");
  });

  test("throws error when starting with a selector that does not resolve to an element", async ({
    page,
  }) => {
    const errorMsg = await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      boarding.defineSteps([
        {
          element: "#non-existent-element",
          popover: { title: "404", description: "Does not exist" },
        },
      ]);
      try {
        boarding.start();
        return null;
      } catch (err: any) {
        return err.message;
      }
    });

    expect(errorMsg).toBe("The step with starting index 0 could not resolve to an element.");
  });

  test("highlight() with invalid selector gracefully does not activate", async ({ page }) => {
    const activated = await page.evaluate(() => {
      const boarding = new (window as any).Boarding();
      boarding.highlight("#non-existent-target");
      return boarding.isActivated;
    });

    expect(activated).toBe(false);
    await expect(page.locator("svg.boarding-coutout-svg")).toHaveCount(0);
  });
});
