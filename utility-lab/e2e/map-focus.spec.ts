import { test, expect } from "@playwright/test";

test.use({ serviceWorkers: "block" });

for (const workspace of [
  { name: "Lineups", route: "utilities?map=mirage&side=T", selector: ".ul-map-svg" },
  { name: "Tactic board", route: "board", selector: "svg.tb-map" },
]) {
  test(`${workspace.name} pointer gestures stay seamless while Tab and keyboard zoom retain a visible focus indicator`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/#${workspace.route}`);
    const canvas = page.locator(workspace.selector);
    await expect(canvas).toBeVisible();
    let bounds = (await canvas.boundingBox())!;
    await canvas.click({ position: { x: 10, y: bounds.height / 2 } });
    await expect(canvas).toBeFocused();
    await expect(canvas).toHaveCSS("outline-style", "none");

    // Use real Tab navigation rather than forcing focus with JavaScript.
    await canvas.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(canvas).toBeFocused();
    await expect(canvas).toHaveCSS("outline-style", "solid");
    await expect(canvas).toHaveCSS("outline-width", "3px");
    await expect(canvas).toHaveCSS("outline-offset", "-3px");
    const themedColor = await page.evaluate(() => {
      const probe = document.createElement("i");
      probe.style.color = "var(--accent)";
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect(canvas).toHaveCSS("outline-color", themedColor);
    const beforeZoom = await canvas.getAttribute("viewBox");
    await canvas.press("+");
    await expect(canvas).not.toHaveAttribute("viewBox", beforeZoom!);
    await expect(canvas).toHaveCSS("outline-style", "solid");

    // Returning to a real drag removes only the canvas focus ring, not focus
    // itself or the map's ability to pan after zooming.
    bounds = (await canvas.boundingBox())!;
    const beforePan = await canvas.getAttribute("viewBox");
    await page.mouse.move(bounds.x + 10, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await expect(canvas).toBeFocused();
    await expect(canvas).toHaveCSS("outline-style", "none");
    await page.mouse.move(bounds.x + 70, bounds.y + bounds.height / 2, { steps: 5 });
    await page.mouse.up();
    await expect(canvas).not.toHaveAttribute("viewBox", beforePan!);
    await expect(canvas).toHaveCSS("outline-style", "none");
    expect(errors).toEqual([]);
  });
}
