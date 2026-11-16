import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  chooseLandingSpot,
  chooseUtilityType,
  mainMarkerGroupsForArea,
  waitForUtilityChoice,
} from "./lineup-helpers";

test.use({ serviceWorkers: "block" });

async function ready(page: Page, headerHidden: boolean) {
  const image = await readFile("public/icons/icon-192.png");
  await page.route(/^https:\/\//, route => route.request().resourceType() === "image"
    ? route.fulfill({ contentType: "image/png", body: image }) : route.abort());
  await page.goto("/#utilities?map=dust2&level=main&side=T");
  await expect(page.locator(".utility-workspace")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".ul-map-marker").first()).toBeVisible();
  if (headerHidden) {
    const menu = page.locator(".display-menu");
    if (!(await menu.evaluate(element => element.hasAttribute("open"))))
      await page.getByLabel("Display settings", { exact: true }).click();
    await menu.getByRole("button", { name: "Hide top bar", exact: true }).click();
    await expect(page.locator(".studio-header")).toBeHidden();
  } else {
    await expect(page.locator(".studio-header")).toBeVisible();
  }
}

async function expectFullCanvas(page: Page) {
  await expect.poll(() => page.locator(".ul-map-svg").evaluate(svg => {
    const canvas = svg.closest(".utility-workspace")!.getBoundingClientRect();
    const viewport = svg.getBoundingClientRect();
    return Math.max(...[
      viewport.left - canvas.left,
      viewport.top - canvas.top,
      viewport.right - canvas.right,
      viewport.bottom - canvas.bottom,
    ].map(value => Math.abs(value)));
  })).toBeLessThanOrEqual(.5);
}

async function moveMapFromTopEdge(page: Page, mobileWebKit: boolean) {
  const svg = page.locator(".ul-map-svg");
  const canvas = (await page.locator(".utility-workspace").boundingBox())!;
  const point = { x: canvas.x + canvas.width / 2, y: canvas.y + 8 };
  // This strip was inside the canvas but above the padded SVG. Its real hit
  // target and input response expose both clipping and dead-space regressions.
  expect(await page.evaluate(({ x, y }) =>
    Boolean(document.elementFromPoint(x, y)?.closest(".ul-map-svg")), point)).toBe(true);
  const fit = await svg.getAttribute("viewBox");
  // Mobile WebKit has no mouse-wheel API. Its zoom control plus a real drag
  // still exercise this strip; desktop engines also exercise wheel input here.
  if (mobileWebKit) await page.getByRole("button", {name:"Zoom utility map in",exact:true}).click();
  else {
    await page.mouse.move(point.x, point.y);
    await page.mouse.wheel(0, -200);
  }
  await expect(svg).not.toHaveAttribute("viewBox", fit!);
  const zoomed = await svg.getAttribute("viewBox");
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 24, point.y + 28, { steps: 4 });
  await page.mouse.up();
  await expect(svg).not.toHaveAttribute("viewBox", zoomed!);
  return (await svg.getAttribute("viewBox"))!;
}

async function expectSelectionKeepsCamera(page: Page, camera: string) {
  const svg = page.locator(".ul-map-svg");
  await mainMarkerGroupsForArea(page, "dust2:main:mid-doors").first().locator(".ul-marker-hit").click();
  await waitForUtilityChoice(page);
  await expect(svg).toHaveAttribute("viewBox", camera);
  await chooseUtilityType(page, "Smoke");
  await expect(svg).toHaveAttribute("viewBox", camera);
  await chooseLandingSpot(page, { areaId: "dust2:main:mid-doors" });
  await expect(page.locator(".ul-origin-pin").first()).toBeVisible();
  await expect(svg).toHaveAttribute("viewBox", camera);
  const back=page.getByRole("button", { name: "Back to targets", exact: true });
  await expect(back).toHaveCSS("font-size","12px");
  expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await back.click();
  await expect(page.locator(".ul-origin-pin")).toHaveCount(0);
  await expect(svg).toHaveAttribute("viewBox", camera);
}

for (const viewport of [{ width: 1440, height: 810 }, { width: 320, height: 844 }]) {
  test.describe(`${viewport.width}px full map canvas`, () => {
    test.use({ viewport, hasTouch: viewport.width === 320, isMobile: viewport.width === 320 });
    for (const headerHidden of [false, true]) {
      test(`top bar ${headerHidden ? "hidden" : "shown"}: SVG fills the canvas and top-edge navigation survives selection`, async ({ page, browserName }) => {
        await ready(page, headerHidden);
        await expectFullCanvas(page);
        const camera = await moveMapFromTopEdge(page, browserName === "webkit" && viewport.width === 320);
        await expectSelectionKeepsCamera(page, camera);
        await expectFullCanvas(page);
      });
    }
  });
}
