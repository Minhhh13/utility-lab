import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { MAPS } from "../src/maps";
import {
  chooseLandingSpot,
  chooseUtilityType,
  mainMarkerGroupsForArea,
  waitForUtilityChoice,
  openOriginPhoto,
} from "./lineup-helpers";

test.use({ serviceWorkers: "block" });

async function isolateOnlineMedia(page: Page) {
  const image = await readFile("public/icons/icon-192.png");
  await page.route(/^https:\/\//, route =>
    route.request().resourceType() === "image"
      ? route.fulfill({ contentType: "image/png", body: image })
      : route.abort(),
  );
}

async function ready(page: Page, map = "inferno", level = "main") {
  await page.goto(`/#utilities?map=${map}&level=${level}&side=T`);
  await expect(page.locator(".utility-workspace")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".ul-map-marker").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset utility map zoom", exact: true })).toHaveText("100%");
}

async function expectUsableCanvas(page: Page, touch: boolean) {
  const library = page.locator(".utility-workspace");
  const bounds = (await library.boundingBox())!;
  const stage = (await page.locator(".ul-map-stage").boundingBox())!;
  expect(Math.abs(stage.y - bounds.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(stage.height - bounds.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(stage.width - bounds.width)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => ({
    horizontal: document.documentElement.scrollWidth > innerWidth,
    vertical: document.documentElement.scrollHeight > innerHeight,
  }))).toEqual({ horizontal: false, vertical: false });

  // Test where real pointer/touch input lands, rather than assuming that a
  // visible floating control or a visually visible pin can receive input.
  const blockedControls = await library.locator(
    ".ul-map-controls button, .ul-map-top button, .ul-zoom button",
  ).evaluateAll((buttons, canvasBounds) => buttons.flatMap(button => {
    const rect = button.getBoundingClientRect();
    if (!rect.width || !rect.height) return [];
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    const inside = rect.x >= canvasBounds.x - 1 && rect.y >= canvasBounds.y - 1 &&
      rect.right <= canvasBounds.x + canvasBounds.width + 1 &&
      rect.bottom <= canvasBounds.y + canvasBounds.height + 1;
    return inside && (hit === button || button.contains(hit)) ? [] : [{
      name: button.getAttribute("aria-label") || button.textContent?.trim(),
      inside,
      blockedBy: hit?.closest("button")?.getAttribute("aria-label") || hit?.getAttribute("class"),
    }];
  }), bounds);
  expect(blockedControls, "Every visible map control stays inside the map and receives pointer input").toEqual([]);

  if (touch) {
    const undersized = await library.locator(
      ".ul-map-chip, .ul-suggest-trigger, .ul-types button, .ul-favorites-filter, .ul-zoom button",
    ).evaluateAll(buttons => buttons.flatMap(button => {
      const rect = button.getBoundingClientRect();
      return !rect.width || !rect.height || rect.width >= 43.5 && rect.height >= 43.5 ? [] : [{
        name: button.getAttribute("aria-label") || button.textContent?.trim(),
        width: rect.width,
        height: rect.height,
      }];
    }));
    expect(undersized, "Map actions retain usable touch targets").toEqual([]);
  }

  const blockedPins = await page.locator(".ul-map-marker").evaluateAll(markers => markers.flatMap(marker => {
    const hitArea = marker.querySelector(".ul-marker-hit");
    const rect = hitArea?.getBoundingClientRect();
    if (!rect) return [{ name: marker.getAttribute("aria-label"), blockedBy: "Missing hit target" }];
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return hit?.closest(".ul-map-marker") === marker ? [] : [{
      name: marker.getAttribute("aria-label"),
      blockedBy: hit?.closest("button")?.getAttribute("aria-label") || hit?.getAttribute("class") || "Outside viewport",
    }];
  }));
  expect(blockedPins, "Floating docks must not cover map-pin centers at Fit").toEqual([]);
}

for (const viewport of [
  { width: 1440, height: 810 },
  { width: 1280, height: 960 },
  { width: 768, height: 1024 },
  { width: 320, height: 844 },
  { width: 960, height: 540 },
]) {
  test.describe(`${viewport.width}×${viewport.height} Lineups canvas`, () => {
    const touch = viewport.width <= 768;
    test.use({ viewport, hasTouch: touch, isMobile: touch });
    test("fits the map workspace and keeps controls and Inferno/Nuke pins reachable", async ({ page }) => {
      await isolateOnlineMedia(page);
      for (const context of [{ map: "inferno", level: "main" }, { map: "nuke", level: "upper" }]) {
        await ready(page, context.map, context.level);
        await expect(page.locator(".studio-header")).toHaveCSS("height", "64px");
        await expectUsableCanvas(page, touch);
      }
    });
  });
}

for (const viewport of [{width:1440,height:810},{width:960,height:540},{width:320,height:844}]) test(`floating controls leave all eight maps' Fit pins selectable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize(viewport);
  await isolateOnlineMedia(page);
  for (const map of MAPS) {
    await ready(page, map.id, map.levels[0].id);
    await expectUsableCanvas(page, false);
  }
});

test("compact mode keeps global navigation behavior and the mounted map camera", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 960 });
  await isolateOnlineMedia(page);
  await ready(page);
  const svg = page.locator(".ul-map-svg");
  await svg.focus();
  await svg.press("+");
  const camera = await svg.getAttribute("viewBox");
  const mountedMap = await svg.elementHandle();
  await page.getByLabel("Display settings", { exact: true }).click();
  await page.getByRole("switch", { name: "In-game view", exact: true }).click();
  await expect(page.locator(".studio-header")).toHaveCSS("height", "48px");
  await page.getByLabel("Display settings", { exact: true }).press("Escape");
  await expect(svg).toHaveAttribute("viewBox", camera!);
  expect(await mountedMap!.evaluate(element => element === document.querySelector(".ul-map-svg"))).toBe(true);
  const navigation = page.getByRole("tablist", { name: "Main navigation", exact: true });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("tab", { name: "Lineups", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(navigation.getByRole("tab", { name: "Playbooks", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Reset utility map zoom", exact: true }).click();
  await expectUsableCanvas(page, false);
  await navigation.getByRole("tab", { name: "Stats", exact: true }).click();
  await expect(page.locator(".workspace-library")).toBeVisible();
  await expect(navigation.getByRole("tab", { name: "Stats", exact: true })).toHaveAttribute("aria-selected", "true");
  await navigation.getByRole("tab", { name: "Lineups", exact: true }).click();
  await expect(page.locator(".utility-workspace")).toBeVisible();
  await expect(page.locator(".studio-header")).toHaveCSS("height", "48px");
});

test("floating utility filters and the full visual selection path preserve manual map position", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await isolateOnlineMedia(page);
  await ready(page, "dust2");
  const svg = page.locator(".ul-map-svg");
  const mountedMap = await svg.elementHandle();
  await svg.focus();
  await svg.press("+");
  await svg.press("ArrowRight");
  const camera = await svg.getAttribute("viewBox");
  const types = page.getByRole("group", { name: "Utility type", exact: true });
  const smoke = types.getByRole("button", { name: /^Smoke/ });
  const flash = types.getByRole("button", { name: /^Flash/ });
  const all = types.getByRole("button", { name: /^All/ });
  await smoke.click();
  await flash.click();
  await expect(smoke).toHaveAttribute("aria-pressed", "true");
  await expect(flash).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expect(svg).toHaveAttribute("viewBox", camera!);
  await smoke.click();
  await expect(flash).toHaveAttribute("aria-pressed", "true");
  await flash.click();
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(svg).toHaveAttribute("viewBox", camera!);

  const group = mainMarkerGroupsForArea(page, "dust2:main:mid-doors").first();
  await group.locator(".ul-marker-hit").click();
  await waitForUtilityChoice(page);
  await chooseUtilityType(page, "Smoke");
  await chooseLandingSpot(page, { areaId: "dust2:main:mid-doors" });
  await openOriginPhoto(page);
  const viewer = page.locator(".ul-media-dialog");
  await expect(viewer).toBeVisible();
  await expect(svg).toHaveAttribute("viewBox", camera!);
  await viewer.getByRole("button", { name: "Close lineup media", exact: true }).click();
  await page.getByRole("button", { name: "Back to targets", exact: true }).click();
  await expect(svg).toHaveAttribute("viewBox", camera!);
  expect(await mountedMap!.evaluate(element => element === document.querySelector(".ul-map-svg"))).toBe(true);
});
