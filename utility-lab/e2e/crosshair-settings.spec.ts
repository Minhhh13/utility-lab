import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 320, height: 640 }, serviceWorkers: "block" });

test("A and D cycle the photo guide from the dialog and leave other controls alone", async ({ page }) => {
  await page.goto("/#utilities?map=nuke&level=lower&side=CT&lineup=expanded-cs2nades-nuke-b-retake-flash-ambxvjoxmg8");
  const viewer = page.locator(".ul-media-dialog[open]");
  const stages = viewer.getByRole("group", { name: "Choose lineup photo" }).getByRole("button");
  const position = stages.nth(0), setup = stages.nth(1), aim = stages.nth(2);
  await expect(viewer.getByRole("button", { name: "Next photo" })).toHaveAttribute("aria-keyshortcuts", "D");
  await viewer.getByRole("button", { name: "Close lineup media" }).focus();
  await page.keyboard.press("a");
  await expect(stages.last()).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("d");
  await expect(position).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Shift+D");
  await expect(position).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("d");
  await expect(setup).toHaveAttribute("aria-pressed", "true");
  await viewer.locator(".ul-photo-viewport").focus();
  await page.keyboard.press("d");
  await expect(aim).toHaveAttribute("aria-pressed", "true");
  await expect(aim).toBeFocused();
  await page.keyboard.press("d");
  await expect(stages.nth(3)).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("a");
  await expect(aim).toHaveAttribute("aria-pressed", "true");
  await viewer.getByRole("button", { name: "Crosshair settings" }).click();
  const settings = page.getByRole("dialog", { name: "Crosshair settings" });
  await settings.getByRole("combobox").focus();
  await page.keyboard.press("a");
  await settings.getByRole("button", { name: "Done" }).click();
  await expect(aim).toHaveAttribute("aria-pressed", "true");
  await viewer.getByRole("button", { name: "Video", exact: true }).click();
  await page.keyboard.press("d");
  await viewer.getByRole("button", { name: /^Photos/ }).click();
  await expect(aim).toHaveAttribute("aria-pressed", "true");
  await aim.press("a");
  await expect(setup).toHaveAttribute("aria-pressed", "true");
  await expect(setup).toBeFocused();
});

test("custom photo crosshair stays registered at zoom, persists, resets and fits a 320px phone", async ({ page }) => {
  await page.goto("/#utilities?map=nuke&level=lower&side=CT&lineup=expanded-cs2nades-nuke-b-retake-flash-ambxvjoxmg8");
  const viewer = page.locator(".ul-media-dialog");
  const photos = viewer.getByRole("group", { name: "Choose lineup photo" });
  const settingsButton = viewer.getByRole("button", { name: "Crosshair settings", exact: true });
  await photos.getByRole("button", { name: "Step 3: First-person aim", exact: true }).click();
  const aim = viewer.getByRole("img", { name: "Aim here" });
  await expect(aim).toBeVisible();
  const center = () => aim.evaluate(element => {
    const box = element.getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  });
  const original = await center();
  const buttons = await viewer.locator(".ul-photo-toolbar button").evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height, inside: box.left >= 0 && box.right <= innerWidth,
      hit: document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest("button") === element };
  }));
  for (const control of buttons) {
    expect(control.width).toBeGreaterThanOrEqual(44);
    expect(control.height).toBeGreaterThanOrEqual(44);
    expect(control.inside && control.hit).toBe(true);
  }
  await settingsButton.focus();
  await page.keyboard.press("Enter");
  const settings = page.getByRole("dialog", { name: "Crosshair settings" });
  await settings.getByRole("combobox", { name: "Style", exact: true }).selectOption("dot");
  await settings.getByLabel("Colour", { exact: true }).fill("#ff3399");
  const size = settings.getByRole("slider", { name: "Crosshair size" });
  await size.focus();
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await expect(size).toHaveValue("55");
  await page.keyboard.press("Escape");
  await expect(settings).toHaveCount(0);
  await expect(settingsButton).toBeFocused();
  await expect(aim).toHaveCSS("width", "55px");
  await expect(aim).toHaveAttribute("data-crosshair-shape", "dot");
  await expect(aim.locator(".ul-aim-point-color")).toHaveCSS("stroke", "rgb(255, 51, 153)");
  expect(await center()).toEqual(original);
  await viewer.getByRole("button", { name: "Zoom in photo", exact: true }).click();
  const zoomed = await center();
  await settingsButton.click();
  await settings.getByRole("combobox", { name: "Style", exact: true }).selectOption("cross");
  await settings.getByRole("button", { name: "Done", exact: true }).click();
  expect(await center()).toEqual(zoomed);
  await viewer.getByRole("button", { name: "Hide aim point", exact: true }).click();
  await expect(aim).toHaveCount(0);
  await viewer.getByRole("button", { name: "Show aim point", exact: true }).click();
  await expect(aim).toHaveAttribute("data-crosshair-shape", "cross");
  await page.reload();
  await photos.getByRole("button", { name: "Step 3: First-person aim", exact: true }).click();
  await expect(aim).toHaveCSS("width", "55px");
  await settingsButton.click();
  await settings.getByRole("button", { name: "Reset to default" }).click();
  await expect(settings.getByLabel("Colour", { exact: true })).toHaveValue("#4dffd1");
  await expect(size).toHaveValue("34");
  await settings.getByRole("button", { name: "Done", exact: true }).click();
  await expect(aim).toHaveAttribute("data-crosshair-shape", "cross");
  await expect(aim.locator("circle")).toHaveCount(0);
  await expect(aim).toHaveCSS("width", "34px");
});
