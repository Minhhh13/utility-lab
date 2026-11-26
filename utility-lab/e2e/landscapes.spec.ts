import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test.use({ serviceWorkers: "block" });

test("artist landscapes sit in the top bar, remain compact on phones, and keep all destinations reachable", async ({
  page,
}) => {
  test.slow(); // Six viewport sizes and six artist frames are captured.
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#home");
  await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveClass(/is-loaded/);
  const landscape = page
    .locator(".studio-header")
    .getByLabel("Landscape", { exact: true });
  await expect(landscape).toBeAttached();
  await expect(page.locator(".launch-screen select")).toHaveCount(0);
  await expect(landscape.locator("option")).toHaveText([
    "Neon street", "Old town", "Hangar", "Factory skyline", "Mountain pass", "Cliffside",
  ]);
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
    if (size.width <= 500) expect(box!.width).toBe(44);
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
  for (const [id, width] of [["neon-street",384], ["old-town",800], ["hangar",352], ["factory",272], ["mountain-pass",272], ["cliffside",816]] as const) {
    await landscape.selectOption(id);
    await expect(page.locator(".launch-screen")).toHaveAttribute(
      "data-scene",
      id,
    );
    await expect(page.locator(".launch-art-previous")).toHaveCount(0);
    expect(
      await page
        .locator(".launch-art:not(.launch-art-previous)")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    ).toBe(width);
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
  const landscape = page.getByLabel("Landscape", { exact: true });
  await expect(art).toHaveClass(/is-loaded/);
  await expect(landscape).toHaveValue("cliffside");
  await expect(page.getByRole("link", { name: /Art by Luis Zuno/ })).toHaveAttribute("href", /magic-cliffs-environment$/);
  expect([...requestedArt]).toEqual(["/art/ansimuz/cliffside.webp"]);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/art/ansimuz/factory.webp", async route => { await gate; await route.continue(); });
  const requested = page.waitForRequest("**/art/ansimuz/factory.webp");
  await landscape.selectOption("factory");
  await requested;
  await expect(art).toHaveAttribute("data-scene", "cliffside");
  await landscape.selectOption("cliffside");
  await expect(landscape).toHaveAttribute("aria-busy", "false");
  release();
  await landscape.selectOption("factory");
  await expect(art).toHaveAttribute("data-scene", "factory");
  await expect(page.locator(".launch-picture:not(.is-previous)")).toHaveCSS("animation-name", "landscape-enter");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".launch-picture:not(.is-previous)")).toHaveCSS("animation-name", "none");
  expect(await page.evaluate(() => localStorage.getItem("ul:launch-scene"))).toBe("factory");
  await page.screenshot({ path: "outputs/launch-polish/factory-mobile-dark.png" });
});
