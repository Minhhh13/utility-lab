import { expect, test, type Locator } from "@playwright/test";
import { LAUNCH_SCENES } from "../src/launch-scenes";

test.use({ serviceWorkers: "block" });

const classics = [
  ["dust-1999", "Dust · CS 1999", "dust-1999"],
  ["dust-source", "Dust · Source", "dust-source"],
  ["dust2", "Dust II · CS 1.6", "dust2-16"],
  ["aztec", "Aztec · CS 1.6", "aztec"],
  ["inferno", "Inferno · Source", "inferno-source"],
  ["nuke", "Nuke · Source", "nuke-source"],
  ["train", "Train · CS 1.6", "train"],
  ["office", "Office · Source", "office"],
] as const;

async function landmarkClearances(artwork: Locator, points: number[][]) {
  return artwork.evaluate(async (node, coordinates) => {
    const img = node as HTMLImageElement;
    await img.decode();
    const rect = img.getBoundingClientRect();
    const frame = img.closest(".launch-art-frame")!.getBoundingClientRect();
    const dock = img.closest(".launch-screen")!.querySelector(".launch-destinations")!.getBoundingClientRect();
    return coordinates.map(([column, row]) => {
      const x = rect.left + column * rect.width / img.naturalWidth;
      const y = rect.top + row * rect.height / img.naturalHeight;
      return Math.min(x - frame.left, frame.right - x, y - frame.top, Math.min(dock.top, frame.bottom) - y);
    });
  }, points);
}

test("Aztec keeps its bridge in view on a wide desktop", async ({ page }) => {
  await page.setViewportSize({ width: 2509, height: 1165 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#home");
  await page.getByRole("button", { name: /^Map background:/ }).click();
  await page.getByRole("option", { name: "Aztec · CS 1.6", exact: true }).click();
  const artwork = page.locator(".launch-screen[data-scene='aztec'] img[data-scene='aztec']");
  await expect(artwork).toBeVisible();
  // The far bank's stone portal and the near middle span of the rope bridge.
  const landmarks = await landmarkClearances(artwork, [[486, 168], [342, 246]]);
  expect(Math.min(...landmarks)).toBeGreaterThan(20);
});

test("Home previews each map without fetching its full backdrop until selection", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const fetched = new Set<string>();
  page.on("request", request => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/art/")) fetched.add(path);
  });
  await page.goto("/#home");
  const trigger = page.getByRole("button", { name: /^Map background:/ });
  await expect(trigger).toHaveAttribute("aria-busy", "false");
  const [first, second] = LAUNCH_SCENES;
  expect(LAUNCH_SCENES.map(scene => scene.id)).toEqual(classics.map(([id]) => id));
  expect([...fetched]).toEqual([first.src]);
  await trigger.click();
  const list = page.getByRole("listbox", { name: "Map background", exact: true });
  const options = list.getByRole("option");
  await expect(options).toHaveCount(classics.length);
  for (const [index, [, name]] of classics.entries()) await expect(options.nth(index)).toHaveAccessibleName(name);
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await expect(options.first().locator(".home-scene-check")).toBeVisible();
  const previews = await list.locator("img").evaluateAll(async images =>
    Promise.all(images.map(async node => {
      const image = node as HTMLImageElement;
      await image.decode();
      return { src: image.getAttribute("src"), width: image.naturalWidth, height: image.naturalHeight };
    })));
  expect(previews).toEqual(classics.map(([, , file]) => ({
    src: `/art/map-thumbnails/${file}.webp`, width: 96, height: 54,
  })));
  expect(LAUNCH_SCENES.map(scene => scene.src)).toEqual(classics.map(([, , file]) => `/art/maps/${file}.webp`));
  expect([...fetched].filter(path => path.startsWith("/art/maps/"))).toEqual([first.src]);
  await page.screenshot({ path: testInfo.outputPath("home-background-desktop.png"), animations: "disabled" });
  await options.nth(1).click();
  await expect(list).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator(".launch-screen")).toHaveAttribute("data-scene", second.id);
  expect([...fetched].filter(path => path.startsWith("/art/maps/"))).toEqual([first.src, second.src]);
});

test("classic, landscape and modern scene preferences migrate to an available classic", async ({ page }) => {
  test.slow();
  const previous = {
    "dust-cs1999": "dust-1999", "dust-source": "dust-source", "dust-csgo": "dust-source",
    dunes: "dust-1999", foundry: "nuke", hangar: "nuke",
    temple: "aztec", ancient: "aztec", cliffside: "aztec", "mountain-pass": "aztec",
    cache: "train", factory: "train", mirage: "inferno", "old-town": "inferno",
    anubis: "dust-1999", vertigo: "office", "neon-street": "office",
    dust2: "dust2", nuke: "nuke", inferno: "inferno", unknown: "dust-1999",
  };
  for (const [stored, expected] of Object.entries(previous)) {
    await test.step(`${stored} opens ${expected}`, async () => {
      await page.goto("/#board");
      await page.evaluate(value => localStorage.setItem("ul:launch-scene", value), stored);
      await page.getByRole("link", { name: "Utility Lab home" }).click();
      const scene = classics.find(([id]) => id === expected)!;
      const trigger = page.getByRole("button", { name: `Map background: ${scene[1]}`, exact: true });
      await expect(trigger).toHaveAttribute("aria-busy", "false");
      await expect(page.locator(".launch-art.is-loaded")).toHaveAttribute("src", `/art/maps/${scene[2]}.webp`);
      expect(await page.evaluate(() => localStorage.getItem("ul:launch-scene"))).toBe(expected);
    });
  }
});

test("keyboard users can explore, cancel and select backgrounds without moving the page", async ({ page }) => {
  await page.goto("/#home");
  const trigger = page.getByRole("button", { name: /^Map background:/ });
  const list = page.getByRole("listbox", { name: "Map background" });
  const options = list.getByRole("option");
  // WebKit's native reverse tab order can skip links depending on the OS setting.
  await trigger.press("Shift+Tab");
  const previousTabStop = await page.evaluateHandle(() => document.activeElement);
  await trigger.press("ArrowDown");
  await expect(options.first()).toBeFocused();
  await expect(options.first()).toHaveCSS("outline-style", "solid");
  await expect(page.locator(".home-scene-popup")).toHaveCSS("animation-name", "none");
  await page.keyboard.press("End");
  await expect(options.last()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(options.nth(LAUNCH_SCENES.length - 2)).toBeFocused();
  await expect(options.first()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(list).toHaveCount(0);
  await trigger.press("End");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAccessibleName(`Map background: ${LAUNCH_SCENES[1].name}`);
  await trigger.press("Space");
  await expect(options.nth(1)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(list).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Workspace settings", exact: true })).toBeFocused();
  await trigger.press("Enter");
  await page.keyboard.press("Shift+Tab");
  await expect(list).toHaveCount(0);
  await expect.poll(() => previousTabStop.evaluate(node => node === document.activeElement)).toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test.describe("touch backgrounds", () => {
  test.use({ isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  for (const [width, height, dpr] of [[320, 690, 2], [320, 690, 3], [375, 812, 3]]) {
    test.describe(`${width}×${height} at DPR ${dpr}`, () => {
      test.use({ viewport: { width, height }, deviceScaleFactor: dpr });
      test("the Source car and Inferno fountain stay above the Home dock", async ({ page }) => {
        await page.goto("/#home");
        const trigger = page.getByRole("button", { name: /^Map background:/ });
        const landmarks = [
          { id: "dust-source", name: "Dust · Source", points: [[569, 270], [573, 286]] },
          { id: "inferno", name: "Inferno · Source", points: [[425, 277], [425, 301]] },
        ];
        for (const { id, name, points } of landmarks) {
          await test.step(name, async () => {
            await trigger.tap();
            await page.getByRole("option", { name, exact: true }).tap();
            const artwork = page.locator(`.launch-screen[data-scene='${id}'] img[data-scene='${id}']`);
            await expect(artwork).toBeVisible();
            await expect(trigger).toHaveAttribute("aria-busy", "false");
            const clearances = await landmarkClearances(artwork, points);
            expect(Math.min(...clearances)).toBeGreaterThanOrEqual(16);
          });
        }
      });
    });
  }
  for (const [width, height] of [[320, 568], [568, 320]]) {
    test(`the picker stays within a ${width}×${height} phone and dismisses on an outside tap`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height });
      await page.goto("/#home");
      const trigger = page.getByRole("button", { name: /^Map background:/ });
      const list = page.getByRole("listbox", { name: "Map background" });
      await trigger.tap();
      const panel = page.locator(".home-scene-popup");
      await expect(panel).toHaveCSS("animation-name", "none");
      const box = await panel.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(9);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width - 9);
      expect(box!.y + box!.height).toBeLessThanOrEqual(height - 9);
      expect((await list.getByRole("option").first().boundingBox())!.height).toBeGreaterThanOrEqual(44);
      if (height === 320) {
        await expect(list).toHaveCSS("scrollbar-width", "none");
        expect(await list.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
      }
      if (width === 320) await page.screenshot({ path: testInfo.outputPath("home-background-phone.png"), animations: "disabled" });
      await page.touchscreen.tap(5, Math.floor(height / 2));
      await expect(list).toHaveCount(0);
      await trigger.tap();
      await list.getByRole("option").last().tap();
      await expect(page.locator(".launch-screen")).toHaveAttribute("data-scene", LAUNCH_SCENES.at(-1)!.id);
      await expect(list).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
});
