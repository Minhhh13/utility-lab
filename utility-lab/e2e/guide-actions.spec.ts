import {test, expect, type Page, type TestInfo} from "@playwright/test";
import {readFileSync} from "node:fs";
import {readFile as readAsync} from "node:fs/promises";
import {FAVORITE_UTILITIES_KEY, USER_UTILITIES_KEY, utilityPhotos, type UtilityReference} from "../src/utility-data";

test.use({serviceWorkers: "block"});
const fixture: UtilityReference = JSON.parse(readFileSync(new URL("../src/data/expanded/anubis.json", import.meta.url), "utf8"))
  .find((record: UtilityReference) => record.id === "expanded-cs2tricks-anubis-street-from-upper-cb18-t");
if(!fixture) throw Error("The reviewed Upper to Street guide is missing.");
const route = `/#utilities?${new URLSearchParams({map: fixture.mapId, level: fixture.levelId, side: fixture.side, lineup: fixture.id})}`;
const pixels = new Map<string, {body: Buffer; contentType: string}>();
const viewer = (page: Page) => page.locator(".ul-media-dialog");
const more = (page: Page) => viewer(page).getByRole("button", {name: "Lineup actions", exact: true});
const menu = (page: Page) => viewer(page).getByRole("menu", {name: "Lineup actions", exact: true});

test.beforeAll(async ({request}) => {
  // Original source bytes keep the rendered viewer representative; these
  // requests are isolated from menu behavior and never launch or capture CS2.
  for(const image of new Set(utilityPhotos(fixture).map(photo => photo.image))){
    if(!image.startsWith("https://")) continue;
    const response = await request.get(image);
    expect(response.ok(), image).toBe(true);
    pixels.set(image, {body: await response.body(), contentType: response.headers()["content-type"]});
  }
});

test.beforeEach(async ({page}) => {
  await page.route(/^https:\/\//, route => {
    const original = pixels.get(route.request().url());
    return original ? route.fulfill({status: 200, ...original}) : route.abort();
  });
  // Observe the exact clipboard write without replacing the user's OS clipboard.
  await page.addInitScript(() => {
    const target = window as typeof window & {guideCopiedLinks: string[]};
    target.guideCopiedLinks = [];
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText: async (text: string) => {target.guideCopiedLinks.push(text);}}});
  });
});

async function openGuide(page: Page) {
  await page.goto(route);
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole("heading", {name: fixture.title, exact: true})).toBeVisible();
  await expect(viewer(page).locator(".ul-photo-canvas img")).toBeVisible();
  await expect(page.locator(".ul-sidebar")).toHaveCount(0);
}

async function action(page: Page, name: string) {
  await more(page).click();
  await expect(menu(page)).toBeVisible();
  await menu(page).getByRole("menuitem", {name, exact: true}).click();
}

async function download(page: Page, info: TestInfo, filename: string) {
  const pending = page.waitForEvent("download");
  await action(page, "Download lineup");
  const result = await pending;
  const file = info.outputPath(filename);
  await result.saveAs(file);
  expect(result.suggestedFilename()).toMatch(/\.json$/);
  return JSON.parse(await readAsync(file, "utf8"));
}

test("viewer saves persist, link copying keeps its exact context, and download preserves the source guide", async ({page}, info) => {
  await openGuide(page);
  const save = viewer(page).getByRole("button", {name: `Save ${fixture.title}`, exact: true});
  await expect(save).toHaveAttribute("aria-pressed", "false");
  await save.click();
  await expect(viewer(page).getByRole("button", {name: `Unsave ${fixture.title}`, exact: true})).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]"), FAVORITE_UTILITIES_KEY)).toContain(fixture.id);
  await page.reload();
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole("button", {name: `Unsave ${fixture.title}`, exact: true})).toHaveAttribute("aria-pressed", "true");

  await action(page, "Copy lineup link");
  await expect(menu(page)).toHaveCount(0);
  const copied = await page.evaluate(() => (window as typeof window & {guideCopiedLinks: string[]}).guideCopiedLinks);
  expect(copied).toHaveLength(1);
  const query = new URLSearchParams(new URL(copied[0]).hash.split("?")[1]);
  expect(Object.fromEntries(query)).toMatchObject({map: fixture.mapId, level: fixture.levelId, side: fixture.side, lineup: fixture.id});

  const portable = await download(page, info, "source-guide.json");
  expect(portable).toMatchObject({format: "utility-lab-lineup", version: 1, lineup: {id: fixture.id, source: fixture.source, videoUrl: fixture.videoUrl, throwType: "Tap W + Jump + LMB"}});
  expect(utilityPhotos(portable.lineup).map(photo => [photo.kind, photo.image, photo.source])).toEqual(utilityPhotos(fixture).map(photo => [photo.kind, photo.image, photo.source]));
  await expect(viewer(page).locator("iframe, video")).toHaveCount(0);
  await more(page).click();
  await expect(menu(page).getByRole("menuitem", {name: "Delete your lineup", exact: true})).toHaveCount(0);
  await page.keyboard.press("Escape");
  await viewer(page).getByRole("button", {name: `Unsave ${fixture.title}`, exact: true}).click();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]"), FAVORITE_UTILITIES_KEY)).not.toContain(fixture.id);
});

test("making, saving and editing a personal copy returns to photos and retains portable media before deletion", async ({page}, info) => {
  await openGuide(page);
  await action(page, "Make my own");
  await expect(viewer(page)).not.toBeVisible();
  await expect(page.locator('[name="lineup-title"]')).toHaveValue(fixture.title);
  await page.locator('[name="lineup-title"]').fill("My Upper to Street smoke");
  await page.getByRole("button", {name: "Save lineup", exact: true}).click();
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole("heading", {name: "My Upper to Street smoke", exact: true})).toBeVisible();
  await expect(page.locator(".ul-sidebar")).toHaveCount(0);
  const record: UtilityReference = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]")[0], USER_UTILITIES_KEY);
  expect(record.id).not.toBe(fixture.id);
  expect(record).toMatchObject({userCreated: true, source: fixture.source, throwType: fixture.throwType});
  expect(utilityPhotos(record).map(photo => photo.image)).toEqual(utilityPhotos(fixture).map(photo => photo.image));

  await action(page, "Edit personal lineup");
  await expect(viewer(page)).not.toBeVisible();
  await expect(page.locator('[name="lineup-title"]')).toHaveValue("My Upper to Street smoke");
  await page.locator('[name="lineup-title"]').fill("My revised Upper to Street smoke");
  await page.getByRole("button", {name: "Update lineup", exact: true}).click();
  await expect(viewer(page).getByRole("heading", {name: "My revised Upper to Street smoke", exact: true})).toBeVisible();
  const portable = await download(page, info, "personal-guide.json");
  expect(portable.lineup).toMatchObject({id: record.id, userCreated: true, title: "My revised Upper to Street smoke", source: fixture.source});
  expect(utilityPhotos(portable.lineup).find(photo => photo.kind === "aim")?.aimPoint).toEqual(utilityPhotos(fixture).find(photo => photo.kind === "aim")?.aimPoint);

  await more(page).click();
  const confirmation = page.waitForEvent("dialog");
  const click = menu(page).getByRole("menuitem", {name: "Delete your lineup", exact: true}).click();
  const prompt = await confirmation;
  expect(prompt.message()).toContain("My revised Upper to Street smoke");
  await prompt.accept();
  await click;
  await expect(viewer(page)).not.toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]").map((item: {id: string}) => item.id), USER_UTILITIES_KEY)).not.toContain(record.id);
});

test("320px viewer menu stays in the dialog top layer, supports keyboard navigation and returns focus", async ({page}, info) => {
  await page.setViewportSize({width: 320, height: 640});
  await openGuide(page);
  await more(page).focus();
  await more(page).press("ArrowDown");
  await expect(menu(page)).toBeVisible();
  const items = menu(page).getByRole("menuitem");
  await expect(items.first()).toBeFocused();
  const bounds = await menu(page).boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(12);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(308);
  expect(bounds!.y).toBeGreaterThanOrEqual(12);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(628);
  expect(await menu(page).evaluate(element => element.closest("dialog")?.open)).toBe(true);
  for(const item of await items.all()){
    const box = (await item.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(await item.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
    })).toBe(true);
  }
  await page.screenshot({path: info.outputPath("guide-menu-320.png")});
  await page.keyboard.press("End");
  await expect(items.last()).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(items.first()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(items.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(items.first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu(page)).toHaveCount(0);
  await expect(more(page)).toBeFocused();
  await expect(viewer(page)).toBeVisible();

  await more(page).press("ArrowUp");
  await expect(items.last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(menu(page)).toHaveCount(0);
  await expect(viewer(page).getByRole("button", {name: "Close lineup media", exact: true})).toBeFocused();
  await more(page).focus();
  await more(page).press("ArrowDown");
  await page.keyboard.press("Shift+Tab");
  await expect(menu(page)).toHaveCount(0);
  await expect(viewer(page).getByRole("button", {name: `Save ${fixture.title}`, exact: true})).toBeFocused();

  await more(page).click();
  await viewer(page).getByRole("heading", {name: fixture.title, exact: true}).click();
  await expect(menu(page)).toHaveCount(0);
  await expect(viewer(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  for(const button of [more(page), viewer(page).getByRole("button", {name: `Save ${fixture.title}`, exact: true})])
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});
