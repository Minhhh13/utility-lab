import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { LAUNCH_SCENES } from "../src/launch-scenes";

test.use({ serviceWorkers: "block" });

async function sampleColours(image: HTMLImageElement) {
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 14;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return Array.from(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
}

test("CS map backgrounds sit in the top bar, remain compact on phones, and keep all destinations reachable", async ({
  page,
}) => {
  test.slow(); // Capture all eight maps and six viewport sizes.
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#home");
  await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveClass(/is-loaded/);
  const landscape = page.getByRole("button", {name: /^Map background:/});
  await expect(landscape).toBeVisible();
  await landscape.click();
  const menu = page.getByRole("listbox", {name:"Map background"});
  await expect(menu.getByRole("option")).toHaveCount(8);
  const previewColours = await Promise.all((await menu.locator("img").all())
    .map(image => image.evaluate(sampleColours)));
  await page.keyboard.press("Escape");
  await mkdir("outputs/artist-art-review", { recursive: true });
  for (const size of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 568, height: 320 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(size);
    await expect(landscape).toBeInViewport();
    const box = await landscape.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.y).toBeLessThan(80);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(size.width);
    if (size.width <= 500) expect(box!.width).toBeLessThanOrEqual(54);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(size.width);
    for (const name of ["Tactic board", "Lineups", "Playbooks", "Stats"])
      await expect(
        page.getByRole("button", { name, exact: true }),
      ).toBeInViewport();
    await page.screenshot({
      path: `outputs/artist-art-review/header-${size.width}.png`,
    });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const scene of LAUNCH_SCENES) {
    const {id} = scene;
    await landscape.click();
    await menu.getByRole("option", {name:scene.name,exact:true}).click();
    await expect(page.locator(".launch-screen")).toHaveAttribute(
      "data-scene",
      id,
    );
    await expect(page.locator(".launch-art-previous")).toHaveCount(0);
    const art = page.locator(".launch-art:not(.launch-art-previous)");
    await expect(art).toHaveAttribute("src", scene.src);
    await expect(art).toHaveAttribute("alt", scene.alt);
    expect(await art.evaluate((image: HTMLImageElement) => [image.naturalWidth, image.naturalHeight])).toEqual([768, 432]);
    // A valid thumbnail URL can still contain another map's drawing.
    const colours = await art.evaluate(sampleColours);
    const differences = previewColours.map(preview => preview.reduce((sum, value, i) => sum + Math.abs(value - colours[i]), 0));
    expect(differences.indexOf(Math.min(...differences)), `Matching picker artwork for ${scene.name}`).toBe(LAUNCH_SCENES.indexOf(scene));
    await page.screenshot({
      path: `outputs/artist-art-review/${id}-1440.png`,
    });
  }
  await page.getByRole("button", { name: "Tactic board", exact: true }).click();
  await expect(page.locator(".launch-header-slot")).toHaveCount(0);
  await expect(page.locator(".tb-map")).toBeVisible();
  expect(errors).toEqual([]);
});

test("returning home recalls the workspace, and keyboard navigation transfers focus immediately", async ({ page }) => {
  await page.goto("/#home");
  const screen = page.locator(".launch-screen");
  for (const [name, id] of [["Lineups", "utilities"], ["Stats", "stats"], ["Tactic board", "board"]]) {
    await screen.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".app-shell")).toHaveAttribute("data-entered-from-home", "pointer");
    const selectedTab = page.locator('.studio-header [aria-selected="true"]');
    await expect(selectedTab).toHaveAttribute("aria-label", name);
    await expect(selectedTab.locator("svg")).toHaveCSS("animation-name", "workspace-icon-arrives");
    if (id === "stats") await page.goBack();
    else await page.getByRole("link", { name: "Utility Lab home" }).click();
    await expect(screen).toHaveAttribute("data-return", "pointer");
    await expect(screen.locator("[data-returned]")).toHaveAccessibleName(name);
    await expect(screen.locator(".launch-destinations")).toHaveCSS("animation-name", "home-dock-arrives");
  }
  const lineups = screen.getByRole("button", { name: "Lineups", exact: true });
  await lineups.press("Enter");
  await expect(page.locator("#workspace")).toBeFocused();
  await expect(page.locator('.studio-header [aria-selected="true"] svg')).toHaveCSS("animation-name", "none");
  await page.getByRole("link", { name: "Utility Lab home" }).press("Enter");
  await expect(lineups).toBeFocused();
  await expect(screen.locator(".launch-destinations")).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await lineups.click();
  await page.getByRole("link", { name: "Utility Lab home" }).click();
  await expect(screen.locator(".launch-destinations")).toHaveCSS("animation-name", "none");
});

test("a saved landscape loads alone, preserves the decoded scene during a switch and honours reduced motion", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ul:launch-scene", "temple");
    localStorage.setItem("ul:appearance", JSON.stringify({ mode: "dark", palette: "mint" }));
  });
  const requestedArt = new Set<string>();
  page.on("request", request => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/art/")) requestedArt.add(path);
  });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#home");
  const art = page.locator(".launch-art:not(.launch-art-previous)");
  const landscape = page.getByRole("button", {name:/^Map background:/});
  const choose = async (name: string) => {
    await landscape.click();
    await page.getByRole("option", { name, exact:true }).click();
  };
  await expect(art).toHaveClass(/is-loaded/);
  await expect(landscape).toHaveAttribute("data-scene", "aztec");
  await expect(page.getByRole("link", { name: /map art(work)? credits/i })).toHaveCount(0);
  expect([...requestedArt]).toEqual(["/art/maps/aztec.webp"]);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/art/maps/nuke-source.webp", async route => { await gate; await route.continue(); });
  const requested = page.waitForRequest("**/art/maps/nuke-source.webp");
  await choose("Nuke · Source");
  await requested;
  await expect(art).toHaveAttribute("data-scene", "aztec");
  await choose("Aztec · CS 1.6");
  await expect(landscape).toHaveAttribute("aria-busy", "false");
  release();
  await choose("Nuke · Source");
  await expect(art).toHaveAttribute("data-scene", "nuke");
  await expect(page.locator(".launch-picture:not(.is-previous)")).toHaveCSS("animation-name", "landscape-enter");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".launch-picture:not(.is-previous)")).toHaveCSS("animation-name", "none");
  expect(await page.evaluate(() => localStorage.getItem("ul:launch-scene"))).toBe("nuke");
  await page.screenshot({ path: "outputs/launch-polish/nuke-mobile-dark.png" });
});
