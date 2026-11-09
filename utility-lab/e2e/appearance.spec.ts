import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("theme and palette apply to the full board and survive reload", async ({
  page,
}) => {
  await page.goto("/#board");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(
    await page
      .locator(".tb-canvas-area")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe("rgb(233, 237, 240)");
  await expect(page.locator(".tb-map image")).toHaveAttribute(
    "href",
    "/maps/mirage-light.svg",
  );
  await page.getByLabel("Appearance", { exact: true }).click();
  await page.getByRole("button", { name: "Dark mode", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page
      .locator(".tb-canvas-area")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe("rgb(16, 22, 28)");
  expect(
    await page
      .locator(".studio-header")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe("rgb(34, 41, 49)");
  await expect(page.locator(".tb-map image")).toHaveAttribute(
    "href",
    "/maps/mirage.svg",
  );
  await page
    .getByRole("button", { name: "Ember palette", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "ember");
  await expect(page.locator(".tb-primary")).toHaveCSS(
    "background-color",
    "rgb(243, 170, 116)",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "ember");
  mkdirSync("outputs/overhaul", { recursive: true });
  await page.screenshot({ path: "outputs/overhaul/dark-ember.png" });
});

test("the rebuilt board and map chooser fit every target width", async ({
  page,
}) => {
  for (const size of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 800 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/#board");
    await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue(
      "A site execute",
    );
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `page at ${size.width}`,
    ).toBe(size.width);
    if (size.width >= 1000)
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight),
      ).toBeLessThanOrEqual(size.height + 1);
    const mapBox = await page.locator(".tb-map").boundingBox();
    expect(mapBox!.height).toBeGreaterThan(200);
    mkdirSync("outputs/overhaul", { recursive: true });
    await page.screenshot({
      path: `outputs/overhaul/board-${size.width}.png`,
      fullPage: size.width < 1000,
    });
    await page.getByRole("button", { name: "Change map", exact: true }).click();
    await expect(page.getByLabel("Search maps", { exact: true })).toBeFocused();
    await expect(page.locator(".map-tile")).toHaveCount(8);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(size.width);
    if (size.width === 1440)
      await page.screenshot({ path: "outputs/overhaul/map-chooser.png" });
    await page
      .getByRole("button", { name: "Close map chooser", exact: true })
      .click();
  }
});
