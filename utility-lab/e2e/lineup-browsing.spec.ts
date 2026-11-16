import { chooseLandingSpot, waitForUtilityChoice, expectReferenceCount, mainMarkers } from "./lineup-helpers";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { MAPS } from "../src/maps";
import { PUBLISHED_LINEUPS as PHOTO_GUIDE_LIBRARY } from "./catalogue-fixtures";
import { utilityPhotos } from "../src/utility-data";
import { curateLineups, targetSpotKey } from "../src/lineup-curation";
import { findLineupOrigin, parseOriginLookup } from "../src/lineup-origins";

test.use({ serviceWorkers: "block" });
const SUGGESTIONS = "utility-lab:suggestions:v1";
const choices = (page: Page) => page.getByRole("dialog", { name: "Choose utility", exact: true });
const utilityOptions = (page: Page) => choices(page).getByRole("group", { name: "Utility types at this target", exact: true }).getByRole("button");
const originOptions = (page: Page) => page.getByRole("group", { name: "Throw-from locations", exact: true }).getByRole("button", { name: /^Throw from / });

/** Fixture bytes isolate interface behavior; source URLs and record coordinates stay unchanged. */
async function stubOnlineMedia(page: Page) {
  const image = await readFile("public/icons/icon-192.png");
  const requests: { url: string; type: string }[] = [];
  await page.route(/^https:\/\//, async route => {
    const request = route.request();
    requests.push({ url: request.url(), type: request.resourceType() });
    if (request.resourceType() === "image") return route.fulfill({ contentType: "image/png", body: image });
    return route.abort();
  });
  return requests;
}

async function openMixedTarget(page: Page): Promise<Locator> {
  const pins = page.locator(".ul-map-marker");
  await expect(pins.first()).toBeVisible();
  const index=await pins.evaluateAll(nodes=>nodes.findIndex(node=>node.querySelectorAll('.ul-target-marker [data-utility]').length>1));
  expect(index,'Nuke exposes a genuinely mixed-kind group').toBeGreaterThanOrEqual(0);
  const pin=pins.nth(index);await pin.locator('.ul-marker-hit').click();await waitForUtilityChoice(page);
  await expect(choices(page)).toBeVisible();expect(await utilityOptions(page).count()).toBeGreaterThan(1);return pin;
}

async function showThrowLocations(page: Page) {
  await openMixedTarget(page);
  await utilityOptions(page).first().click();
  await expect(choices(page)).toHaveCount(0);
  await chooseLandingSpot(page);
  await expect(originOptions(page).first()).toBeVisible();
  expect(await originOptions(page).count()).toBeLessThanOrEqual(4);
  await expect(page.locator(".ul-media-dialog")).not.toBeVisible();
  return originOptions(page);
}

test("every supported map, floor and side exposes its full photo catalogue on a clean map", async ({ page }) => {
  test.setTimeout(90_000);
  await stubOnlineMedia(page);
  const inventorySize = PHOTO_GUIDE_LIBRARY.length;
  for (const map of MAPS) for (const level of map.levels) for (const side of ["T", "CT"] as const) {
    await page.goto(`/#utilities?map=${map.id}&level=${level.id}&side=${side}`);
    const library = page.getByRole("region", { name: "Utility library", exact: true });
    await expect(library).toBeVisible();
    if (map.levels.length > 1)
      await library.getByRole("group", { name: "Utility map level", exact: true }).getByRole("button", { name: level.name, exact: true }).click();
    const context = PHOTO_GUIDE_LIBRARY.filter(record => record.mapId === map.id && record.levelId === level.id && record.side === side);
    const expected = curateLineups(context);
    const groups = new Map<string, number>();
    for (const record of expected) groups.set(targetSpotKey(record), (groups.get(targetSpotKey(record)) || 0) + 1);
    expect([...groups.values()].every(count => count <= 4)).toBe(true);
    await expectReferenceCount(page,context.length);
    await expect(library.locator('.ul-reference-open, .ul-sidebar')).toHaveCount(0);
    if(context.length)await expect(library.locator('.ul-map-marker').first()).toBeVisible();
    await expect(library.locator(".ul-header").getByRole("button", { name: /Import|Add lineup/i })).toHaveCount(0);
    await expect(library.getByRole("textbox")).toHaveCount(0);
    await expect(library.locator(".ul-filterbar").locator("input, select")).toHaveCount(0);
    await expect(library.getByRole("group", { name: /^(Site|Media)$/ })).toHaveCount(0);
    await expect(page.locator(".ul-cluster-count")).toHaveCount(0);
  }
  expect(PHOTO_GUIDE_LIBRARY).toHaveLength(inventorySize);
});

test('a slow map catalogue shows loading without provisional pins, then enables the complete map choices',async({page})=>{
  await stubOnlineMedia(page);
  let requested=false,release!:()=>void;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/assets/mirage-*.json',async route=>{
    requested=true;await gate;await route.continue();
  });
  try{
    await page.goto('/#utilities?map=mirage&level=main&side=T',{waitUntil:'domcontentloaded'});
    await expect.poll(()=>requested).toBe(true);
    await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','true');
    await expect(page.getByRole('status').filter({hasText:'Loading lineups…'})).toBeVisible();
    await expect(mainMarkers(page)).toHaveCount(0);
    await expect(page.getByRole('dialog',{name:'Choose utility',exact:true})).toHaveCount(0);
    release();
    const expected=PHOTO_GUIDE_LIBRARY.filter(record=>record.mapId==='mirage'&&record.levelId==='main'&&record.side==='T');
    await expectReferenceCount(page,expected.length);
    await expect(page.getByRole('status').filter({hasText:'Loading lineups…'})).toHaveCount(0);
    await expect(mainMarkers(page).first()).toBeVisible();
    await mainMarkers(page).first().locator('.ul-marker-hit').click();
    await waitForUtilityChoice(page);
    if(await choices(page).count())await expect(utilityOptions(page).first()).toBeVisible();
    else await expect(page.locator('.ul-landing-pin').first().or(page.locator('.ul-origin-pin').first()).first()).toBeVisible();
    await expect(page.locator('.ul-media-dialog')).not.toBeVisible();
  }finally{release();}
});

test("utility chips combine Smoke and Flash and restore All only when both are deselected", async ({ page }) => {
  await stubOnlineMedia(page);
  await page.goto("/#utilities?map=nuke&level=upper&side=T");
  const context = PHOTO_GUIDE_LIBRARY.filter(record => record.mapId === "nuke" && record.levelId === "upper" && record.side === "T");
  const types = page.getByRole("group", { name: "Utility type", exact: true });
  const all = types.getByRole("button", { name: /^All / });
  const smoke = types.getByRole("button", { name: /^Smoke / });
  const flash = types.getByRole("button", { name: /^Flash / });
  await expectReferenceCount(page,context.length);
  await smoke.click();
  await expect(smoke).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expectReferenceCount(page,context.filter(record => record.type === "Smoke").length);
  await flash.click();
  await expect(smoke).toHaveAttribute("aria-pressed", "true");
  await expect(flash).toHaveAttribute("aria-pressed", "true");
  await expectReferenceCount(page,context.filter(record => ["Smoke", "Flash"].includes(record.type)).length);
  for(const type of await page.locator('.ul-map-marker [data-utility]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-utility'))))expect(['Smoke','Flash']).toContain(type);
  await smoke.click();
  await expect(smoke).toHaveAttribute("aria-pressed", "false");
  await expect(flash).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expectReferenceCount(page,context.filter(record => record.type === "Flash").length);
  await flash.click();
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expect(flash).toHaveAttribute("aria-pressed", "false");
  await expectReferenceCount(page,context.length);
});

test("target utility selection plots publisher standing coordinates and opens source photos only from a chosen origin", async ({ page }) => {
  const remote = await stubOnlineMedia(page);
  await page.goto("/#utilities?map=nuke&level=upper&side=T");
  await openMixedTarget(page);
  expect(await choices(page).evaluate(element => element.parentElement === document.body)).toBe(true);
  await expect(page.locator(".ul-media-dialog")).not.toBeVisible();
  await expect(page.locator("iframe, video")).toHaveCount(0);
  expect(remote).toEqual([]);
  for (const name of await utilityOptions(page).allTextContents()) expect(name.trim()).toMatch(/^(Smoke|Flash|Molly|HE)$/);
  await utilityOptions(page).first().click();
  await expect(choices(page)).toHaveCount(0);
  await chooseLandingSpot(page);
  const origins = originOptions(page);
  await expect(origins.first()).toBeVisible();
  expect(await origins.count()).toBeLessThanOrEqual(4);
  await expect(page.locator(".ul-media-dialog")).not.toBeVisible();
  const first = origins.first();
  const plotted = { x: Number(await first.getAttribute("data-origin-x")), y: Number(await first.getAttribute("data-origin-y")), levelId: (await first.getAttribute("data-origin-level"))! };
  await expect(first).toHaveAttribute("transform", `translate(${plotted.x} ${plotted.y})`);
  await first.click();
  const viewer = page.locator(".ul-media-dialog");
  await expect(viewer).toBeVisible();
  await expect(viewer.getByRole("button", { name: /^Photos/ })).toHaveAttribute("aria-pressed", "true");
  const image = viewer.locator(".ul-photo-canvas img");
  await expect(image).toBeVisible();
  const id = await page.evaluate(() => new URLSearchParams(location.hash.split("?")[1]).get("lineup"));
  const selected = PHOTO_GUIDE_LIBRARY.find(record => record.id === id)!;
  expect(selected).toBeTruthy();
  const lookup = parseOriginLookup(JSON.parse(await readFile(`src/data/lineup-origins/origins-${selected.mapId}.json`, "utf8")));
  const sourceOrigin = findLineupOrigin(selected, lookup, plotted.levelId);
  expect(sourceOrigin).toMatchObject(plotted);
  await expect(image).toHaveAttribute("src", utilityPhotos(selected)[0].image);
  await expect(viewer.locator("iframe, video")).toHaveCount(0);
  expect(remote.every(request => request.type === "image")).toBe(true);
});

test("actual origin choices and photo viewer fit a 320px phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await stubOnlineMedia(page);
  await page.goto("/#utilities?map=nuke&level=upper&side=T");
  const origins = await showThrowLocations(page);
  await expect(page.getByRole("button", { name: "Back to targets", exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await origins.first().click();
  const viewer = page.locator(".ul-media-dialog");
  await expect(viewer).toBeVisible();
  await expect(viewer.locator(".ul-photo-canvas img")).toBeVisible();
  await expect(viewer.getByRole("button", { name: "Close lineup media", exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await expect(viewer.locator("iframe, video")).toHaveCount(0);
});
test("suggestions remain local, retain the selected context and export actual JSON", async ({ page }) => {
  await stubOnlineMedia(page);
  const submissions: string[] = [];
  page.on("request", request => { if (request.method() === "POST") submissions.push(request.url()); });
  await page.goto("/#utilities?map=ancient&side=CT");
  await page.getByRole("button", { name: "Suggest a lineup", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Suggest a lineup", exact: true });
  await expect(form).toContainText("Ancient · CT side");
  await expect(form).toContainText("Saved locally on this device.");
  await form.getByRole("combobox").selectOption("HE");
  await form.getByLabel("Target callout", { exact: true }).fill("B ramp");
  await form.getByLabel(/Throw from/).fill("CT spawn");
  await form.getByLabel(/Photo or video link/).fill("https://example.com/lineup?throw=one");
  await form.getByLabel(/Details/).fill("A source photo showing the exact standing corner.");
  await form.getByRole("button", { name: "Save suggestion", exact: true }).click();
  await expect(form.getByRole("heading", { name: "Suggestion saved", exact: true })).toBeVisible();
  await expect(form).toContainText("Kept on this device. Export it to share it.");
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SUGGESTIONS);
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({ mapId: "ancient", side: "CT", type: "HE", target: "B ramp", from: "CT spawn", source: "https://example.com/lineup?throw=one", notes: "A source photo showing the exact standing corner." });
  expect(Number.isFinite(Date.parse(stored[0].createdAt))).toBe(true);
  const downloading = page.waitForEvent("download");
  await form.getByRole("button", { name: "Export suggestions", exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("utility-lab-suggestions.json");
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported).toEqual({ format: "utility-lab-suggestions", version: 1, suggestions: stored });
  expect(submissions).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: "Suggest a lineup", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Suggest a lineup", exact: true })).toContainText("1 local suggestion");
});

test("unsafe suggestion links and unavailable storage do not produce a false saved state", async ({ page }) => {
  await stubOnlineMedia(page);
  await page.goto("/#utilities?map=mirage&side=T");
  await page.getByRole("button", { name: "Suggest a lineup", exact: true }).click();
  const form = page.getByRole("dialog", { name: "Suggest a lineup", exact: true });
  await form.getByLabel("Target callout", { exact: true }).fill("Window");
  await form.getByLabel(/Photo or video link/).fill("javascript:alert(1)");
  await form.getByRole("button", { name: "Save suggestion", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText(/http|https/);
  expect(await page.evaluate(key => localStorage.getItem(key), SUGGESTIONS)).toBeNull();
  await form.getByLabel(/Photo or video link/).fill("https://example.com/guide");
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("Storage is unavailable.", "QuotaExceededError");
      return original.call(this, name, value);
    };
  }, SUGGESTIONS);
  await form.getByRole("button", { name: "Save suggestion", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText(/storage|save/i);
  await expect(form.getByRole("heading", { name: "Suggestion saved", exact: true })).toHaveCount(0);
  await expect(form.getByLabel("Target callout", { exact: true })).toHaveValue("Window");
  expect(await page.evaluate(key => localStorage.getItem(key), SUGGESTIONS)).toBeNull();
});


