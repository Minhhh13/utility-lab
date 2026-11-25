import { startPersonalLineup } from "./lineup-helpers";
import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

// WebKit on Windows with phone emulation; this is not a hardware iPhone test.
test.use({
  browserName: "webkit",
  channel: undefined,
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce",
});

test.beforeEach(() => mkdirSync("outputs/webkit", { recursive: true }));

test("WebKit phone launch, map chooser, SVG placement and drag, and appearance recovery", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".launch-art")).toHaveClass(/is-loaded/);
  for (const name of ["Tactic board", "Lineups", "Playbooks", "Stats"])
    await expect(page.getByRole("button", { name, exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: "outputs/webkit/launch-390.png" });
  await page.getByRole("button", { name: "Tactic board", exact: true }).tap();

  const canvas = page.locator("svg.tb-map");
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "Change map", exact: true }).tap();
  await expect(page.locator(".map-tile")).toHaveCount(8);
  await page.getByLabel("Search maps", { exact: true }).fill("Nuke");
  await page.getByRole("button", { name: "Nuke Active Duty", exact: true }).tap();
  await expect(page.locator(".map-dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Smoke (S)", exact: true }).tap();
  await canvas.scrollIntoViewIfNeeded();
  const position = await canvas.evaluate((element: SVGSVGElement) => {
    const point = new DOMPoint(500, 500).matrixTransform(element.getScreenCTM()!);
    return { x: point.x, y: point.y };
  });
  await page.touchscreen.tap(position.x, position.y);
  await expect(canvas).toHaveAttribute("aria-label", /1 objects/);

  await page.getByRole("button", { name: "Select / move (V)", exact: true }).tap();
  await canvas.scrollIntoViewIfNeeded();
  const marker = canvas.locator("[data-object-id]").first();
  const original = await marker.getAttribute("transform");
  const drag = await canvas.evaluate((element: SVGSVGElement) => {
    const matrix = element.getScreenCTM()!;
    return [new DOMPoint(500, 500), new DOMPoint(650, 600)]
      .map((point) => point.matrixTransform(matrix))
      .map(({ x, y }) => ({ x, y }));
  });
  // Playwright exposes touch taps but no WebKit touch-drag API. Exercise the
  // real engine's pointer capture/drag with its mouse after the touch placement.
  await page.mouse.move(drag[0].x, drag[0].y);
  await page.mouse.down();
  await page.mouse.move(drag[1].x, drag[1].y, { steps: 8 });
  await page.mouse.up();
  await expect(marker).not.toHaveAttribute("transform", original!);
  await page.getByRole("button", { name: "Undo", exact: true }).tap();
  await expect(marker).toHaveAttribute("transform", original!);

  await page.getByLabel("Appearance", { exact: true }).tap();
  await page.getByRole("button", { name: "Dark mode", exact: true }).tap();
  await page.getByRole("button", { name: "Ember palette", exact: true }).tap();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "ember");
  await page.reload();
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("aria-label", /1 objects/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "ember");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: "outputs/webkit/board-dark-390.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("WebKit phone lineups load video on demand and retain local photo slides", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Assert our lazy player wiring, without claiming external YouTube playback.
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<p>External player omitted in automated QA.</p>" }));
  await page.goto("/#utilities?map=mirage&side=T&lineup=creator-mirage-t-jungle");
  await expect(page.getByRole("region", { name: "Utility library", exact: true })).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  const video = page.getByRole("dialog", { name: "Jungle smoke", exact: true });
  await expect(video).toBeVisible();
  await expect(video.locator("iframe")).toHaveCount(0);
  await video.getByRole("button", { name: "Load video", exact: true }).tap();
  await expect(video.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/MJ-dtTYTUS8\?start=280/);
  await expect(video.getByRole("link", { name: /Open original video/ })).toHaveAttribute("href", /youtube\.com\/watch/);
  await video.getByRole("button", { name: "Close lineup media", exact: true }).tap();
  await expect(page.locator("iframe")).toHaveCount(0);

  await startPersonalLineup(page);
  await page.locator('[name="lineup-title"]').fill("WebKit photo smoke");
  await page.locator('[name="lineup-target"]').fill("Window");
  await page.locator('[name="lineup-from"]').fill("T spawn");
  await page.locator('[name="lineup-steps"]').fill("Use my standing and aim reference photos.\nJump and release both buttons.");
  await page.getByLabel("Throw method", { exact: true }).selectOption("Both buttons (LMB + RMB)");
  await page.getByLabel("Lineup screenshot file", { exact: true }).setInputFiles([
    resolve("public/icons/icon-192.png"), resolve("public/icons/apple-touch-icon.png"),
  ]);
  await expect(page.getByLabel("Photo 1 caption", { exact: true })).toBeVisible();
  await page.getByLabel("Photo 1 caption", { exact: true }).fill("Standing position");
  await page.getByLabel("Photo 2 caption", { exact: true }).fill("Aim reference");
  await page.getByRole("button", { name: "Save lineup", exact: true }).tap();
  const photos = page.getByRole("dialog", { name: "WebKit photo smoke", exact: true });
  await expect(photos).toBeVisible();
  await expect(photos.getByAltText("Standing position", { exact: true })).toBeVisible();
  await photos.getByRole("button", { name: "Next photo", exact: true }).tap();
  await expect(photos.getByAltText("Aim reference", { exact: true })).toBeVisible();
  await expect(photos.getByText("Both buttons (LMB + RMB)", { exact: true }).last()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: "outputs/webkit/photo-guide-390.png" });
  await page.reload();
  // The selected lineup's deep link restores its media viewer on reload.
  await expect(photos).toBeVisible();
  await expect(photos.getByAltText("Standing position", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("WebKit phone opens existing saved rounds through Home", async ({ page }) => {
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.addInitScript(()=>localStorage.setItem("utility-lab:playbooks:v1",JSON.stringify([{id:"stored-book",name:"Saved round",notes:"",tacticIds:[],lineupIds:[],steps:[]}])));
  await page.goto("/#home");
  await page.getByRole("button",{name:"Playbooks",exact:true}).tap();
  await expect(page.getByRole("heading",{name:"Saved round",exact:true})).toBeVisible();
  await expect(page.getByRole("tab",{name:"Playbooks",exact:true})).toHaveAttribute("aria-selected","true");
  await page.getByRole("tab",{name:"Stats",exact:true}).tap();
  await expect(page.locator(".stats-summary>div").filter({hasText:"Playbooks"}).locator("strong")).toHaveText("1");
  await page.setViewportSize({width:320,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
  expect(errors).toEqual([]);
});
