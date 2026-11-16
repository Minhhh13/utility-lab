import { test, expect, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });

async function openDisplay(page: Page) {
  const menu = page.locator(".display-menu");
  if (!(await menu.evaluate((element) => element.hasAttribute("open"))))
    await page.getByLabel("Display settings", { exact: true }).click();
  return menu;
}

async function expectFit(page: Page, aspect: "auto" | "16:9" | "4:3") {
  const main = page.locator("#workspace");
  await expect(main).toHaveAttribute("data-aspect-ratio", aspect);
  await expect.poll(async () => {
    const frame = await main.boundingBox();
    const available = await page.locator(".workspace-viewport").boundingBox();
    if (!frame || !available) return false;
    const fitted = frame.x >= available.x - 1 && frame.y >= available.y - 1 &&
      frame.x + frame.width <= available.x + available.width + 1 &&
      frame.y + frame.height <= available.y + available.height + 1;
    const centered = Math.abs(frame.x + frame.width / 2 - available.x - available.width / 2) < 1 &&
      Math.abs(frame.y + frame.height / 2 - available.y - available.height / 2) < 1;
    const maxFit = Math.min(Math.abs(frame.width - available.width), Math.abs(frame.height - available.height)) < 1;
    const ratio = aspect === "auto" ? true : Math.abs(frame.width / frame.height - (aspect === "16:9" ? 16 / 9 : 4 / 3)) < .002;
    return fitted && centered && maxFit && ratio;
  }).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const preset of [
  { viewport: { width: 1440, height: 810 }, ratio: "16:9" as const },
  { viewport: { width: 1280, height: 960 }, ratio: "4:3" as const },
]) {
  test(`desktop ${preset.ratio} fits normal, compact and hidden controls without changing the map camera`, async ({ page }) => {
    await page.setViewportSize(preset.viewport);
    await page.goto("/#utilities?map=mirage&side=T");
    const canvas = page.locator(".ul-map-svg");
    await expect(canvas).toBeVisible();
    await canvas.focus();
    await canvas.press("+");
    const viewBox = await canvas.getAttribute("viewBox");
    const sameCanvas = await canvas.elementHandle();
    await openDisplay(page);
    await page.getByRole("radio", { name: preset.ratio, exact: true }).check();
    await expectFit(page, preset.ratio);
    await expect(page.locator(".studio-header")).toHaveCSS("height", "64px");
    await page.getByRole("switch", { name: "In-game view", exact: true }).click();
    await expect(page.locator(".studio-header")).toHaveCSS("height", "48px");
    await expectFit(page, preset.ratio);
    await page.getByLabel("Display settings", { exact: true }).press("Escape");
    await page.getByRole("button", { name: "Hide top bar", exact: true }).click();
    const restore = page.getByRole("button", { name: "Show top bar", exact: true });
    await expect(restore).toBeFocused();
    await expect(page.locator(".studio-header")).toBeHidden();
    await expectFit(page, preset.ratio);
    const target = await restore.boundingBox();
    expect(target!.width).toBeGreaterThanOrEqual(44);
    expect(target!.height).toBeGreaterThanOrEqual(44);
    await expect(canvas).toHaveAttribute("viewBox", viewBox!);
    expect(await sameCanvas!.evaluate((element) => element === document.querySelector(".ul-map-svg"))).toBe(true);
    await restore.press("Enter");
    await expect(page.getByLabel("Display settings", { exact: true })).toBeFocused();
    await expect(page.locator(".studio-header")).toBeVisible();
    await expectFit(page, preset.ratio);
    await page.getByRole("button", { name: "Hide top bar", exact: true }).click();
    await page.reload();
    await expect(page.getByRole("button", { name: "Show top bar", exact: true })).toBeVisible();
    await expectFit(page, preset.ratio);
    await page.getByRole("button", { name: "Show top bar", exact: true }).click();
    await openDisplay(page);
    await expect(page.getByRole("switch", { name: "In-game view", exact: true })).toBeChecked();
    await expect(page.getByRole("radio", { name: preset.ratio, exact: true })).toBeChecked();
    await page.getByRole("radio", { name: "Auto", exact: true }).check();
    await expectFit(page, "auto");
  });
}

test("display controls preserve a tactic's unsaved name, objects and manual zoom", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await page.goto("/#board");
  const canvas = page.locator("svg.tb-map");
  await expect(canvas).toBeVisible();
  await page.getByLabel("Strategy name", { exact: true }).fill("Display draft");
  await page.getByRole("button", { name: "T player (T)", exact: true }).click();
  await canvas.press("Enter");
  const description = await canvas.getAttribute("aria-label");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  const viewBox = await canvas.getAttribute("viewBox");
  const sameCanvas = await canvas.elementHandle();
  await openDisplay(page);
  await page.getByRole("radio", { name: "4:3", exact: true }).check();
  await page.getByRole("switch", { name: "In-game view", exact: true }).click();
  await page.getByLabel("Display settings", { exact: true }).press("Escape");
  await page.getByRole("button", { name: "Hide top bar", exact: true }).click();
  await expectFit(page, "4:3");
  await expect(canvas).toHaveAttribute("viewBox", viewBox!);
  await expect(canvas).toHaveAttribute("aria-label", description!);
  expect(await sameCanvas!.evaluate((element) => element === document.querySelector("svg.tb-map"))).toBe(true);
  await page.getByRole("button", { name: "Show top bar", exact: true }).click();
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue("Display draft");
});

test("320px phones use their full screen and keep the saved desktop ratio for later", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.addInitScript(() => localStorage.setItem("ul:display", JSON.stringify({ compact: false, aspect: "4:3", headerHidden: false })));
  await page.goto("/#utilities?map=dust2&side=T");
  await expect(page.locator(".ul-map-svg")).toBeVisible();
  await expectFit(page, "auto");
  const before = (await page.locator("#workspace").boundingBox())!;
  await openDisplay(page);
  await expect(page.getByRole("radio", { name: "4:3", exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Hide top bar", exact: true }).click();
  const restore = page.getByRole("button", { name: "Show top bar", exact: true });
  await expect(restore).toBeFocused();
  await expect(page.locator(".phone-tabs")).toBeHidden();
  await expectFit(page, "auto");
  expect((await page.locator("#workspace").boundingBox())!.height).toBeGreaterThan(before.height + 100);
  await restore.press("Enter");
  await expect(page.getByLabel("Display settings", { exact: true })).toBeFocused();
  await expect(page.locator(".phone-tabs")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 960 });
  await expectFit(page, "4:3");
  await openDisplay(page);
  await expect(page.getByRole("radio", { name: "4:3", exact: true })).toBeChecked();
});

test("Home stays full screen with working display controls and animated artwork", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ul:display", JSON.stringify({ compact: true, aspect: "4:3", headerHidden: false })));
  await page.setViewportSize({ width: 1440, height: 810 });
  await page.goto("/#home");
  const scene = page.locator(".launch-screen");
  await expect(scene).toBeVisible();
  await expectFit(page, "auto");
  expect((await scene.boundingBox())!.height).toBe(810);
  const sameScene = await scene.elementHandle();
  await page.getByRole("button", { name: "Hide top bar", exact: true }).click();
  await page.getByRole("button", { name: "Show top bar", exact: true }).click();
  expect(await sameScene!.evaluate((element) => element === document.querySelector(".launch-screen"))).toBe(true);
  await page.setViewportSize({ width: 320, height: 844 });
  await expect(page.getByLabel("Display settings", { exact: true })).toBeVisible();
  await expect(page.locator(".brand .ul-brand-mark")).toBeVisible();
  await expectFit(page, "auto");
  await openDisplay(page);
  await page.getByRole("button", { name: "Hide top bar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Show top bar", exact: true })).toBeVisible();
});

test("Stats content remains scrollable and Playbooks stays contained in the fitted workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await page.goto("/#stats");
  await expect(page.locator(".workspace-library")).toBeVisible();
  await openDisplay(page);
  await page.getByRole("radio", { name: "4:3", exact: true }).check();
  await page.getByLabel("Display settings", { exact: true }).press("Escape");
  await expectFit(page, "4:3");
  const scrolled = await page.locator("#workspace").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return element.scrollHeight <= element.clientHeight || element.scrollTop > 0;
  });
  expect(scrolled).toBe(true);
  await page.goto("/#playbooks");
  await expect(page.locator(".playbooks-coming-soon")).toContainText("Coming soon");
  await expectFit(page, "4:3");
  expect(await page.locator("#workspace").evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
});
