import { chooseLandingSpot, landingChoices, waitForUtilityChoice, openUtilityGroupForArea, mainMarkerGroupsForArea, expectReferenceCount, chooseUtilityType,openOriginPhoto,expectOriginRecipes } from "./lineup-helpers";
import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { MAPS, type GameMap, type MapLevel } from "../src/maps";
import { lineupMapFrame } from "../src/lineup-map-layout";
import { PUBLISHED_LINEUPS } from "./catalogue-fixtures";
import { findLineupOrigin, parseOriginLookup } from "../src/lineup-origins";
import { FAVORITE_UTILITIES_KEY, utilityPhotos } from "../src/utility-data";

test.use({ serviceWorkers: "block" });
const picker = (page: Page) => page.getByRole("dialog", { name: "Choose utility", exact: true });
const types = (page: Page) => picker(page).getByRole("group", { name: "Utility types at this target", exact: true }).getByRole("button");
const origins = (page: Page) => page.getByRole("group", { name: "Throw-from locations", exact: true }).getByRole("button", { name: /^Throw from / });
const viewer = (page: Page) => page.locator(".ul-media-dialog");

async function isolateOnlineMedia(page: Page) {
  const image = await readFile("public/icons/icon-192.png");
  await page.route(/^https:\/\//, route => route.request().resourceType() === "image"
    ? route.fulfill({ contentType: "image/png", body: image }) : route.abort());
}

async function expectContext(page: Page, map: GameMap, level: MapLevel, side: "T" | "CT") {
  await expect(page.getByRole("button", { name: "Change map", exact: true })).toHaveText(map.name);
  await expect(page.getByRole("group", { name: "Utility side", exact: true }).getByRole("button", { name: `${side} side`, exact: true })).toHaveAttribute("aria-pressed", "true");
  if (map.levels.length > 1)
    await expect(page.getByRole("group", { name: "Utility map level", exact: true }).getByRole("button", { name: level.name, exact: true })).toHaveAttribute("aria-pressed", "true");
  const expected = PUBLISHED_LINEUPS.filter(record => record.mapId === map.id && record.levelId === level.id && record.side === side);
  await expectReferenceCount(page,expected.length);
  if (expected.length) await expect(page.locator(".ul-map-marker").first()).toBeVisible();
  else {
    await expect(page.locator(".ul-map-marker")).toHaveCount(0);
    await expect(page.getByRole('status').filter({hasText:'No lineups match these filters.'})).toBeVisible();
  }
  return expected;
}

async function openFirstTarget(page: Page) {
  await page.locator(".ul-map-marker").first().click();
  await waitForUtilityChoice(page,{allowUtilitySkip:true});
  await expect(viewer(page)).not.toBeVisible();
  if(await picker(page).count()){
    expect(await types(page).count()).toBeGreaterThan(0);
    expect(await types(page).count()).toBeLessThanOrEqual(4);
    await types(page).first().click();
  }
  await expect(picker(page)).toHaveCount(0);
  await chooseLandingSpot(page);
  await expect(origins(page).first()).toBeVisible();
  await expectOriginRecipes(page);
  await expect(viewer(page)).not.toBeVisible();
}

async function clickFirstOriginAndVerifySource(page: Page, recordId?: string) {
  const pins = origins(page);
  const first = recordId
    ? pins.nth(await pins.evaluateAll((nodes,id)=>nodes.findIndex(node=>JSON.parse(node.getAttribute('data-origin-recipes')||'[]').includes(id)),recordId))
    : pins.first();
  const plotted = {
    x: Number(await first.getAttribute("data-origin-x")),
    y: Number(await first.getAttribute("data-origin-y")),
    levelId: (await first.getAttribute("data-origin-level"))!,
  };
  await openOriginPhoto(page,{recordId});
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole("button", { name: /^Photos/ })).toHaveAttribute("aria-pressed", "true");
  await expect(viewer(page).locator("iframe, video")).toHaveCount(0);
  const id = await page.evaluate(() => new URLSearchParams(location.hash.split("?")[1]).get("lineup"));
  const record = PUBLISHED_LINEUPS.find(item => item.id === id);
  expect(record, `Opened source guide ${id}`).toBeTruthy();
  const lookup = parseOriginLookup(JSON.parse(await readFile(`src/data/lineup-origins/origins-${record!.mapId}.json`, "utf8")));
  expect(findLineupOrigin(record!, lookup, plotted.levelId)).toMatchObject(plotted);
  await expect(viewer(page).locator(".ul-photo-canvas img")).toHaveAttribute("src", utilityPhotos(record!)[0].image);
  return { record: record!, plotted };
}

async function expectDistinctSourceHitAreas(page: Page) {
  const hits = await Promise.all((await origins(page).all()).map(pin => pin.locator("circle").first().boundingBox()));
  for (let a = 0; a < hits.length; a++) for (let b = a + 1; b < hits.length; b++) {
    const first = hits[a]!, second = hits[b]!;
    const distance = Math.hypot(first.x + first.width / 2 - second.x - second.width / 2, first.y + first.height / 2 - second.y - second.height / 2);
    expect(distance, "Published source hit areas must remain independently clickable on the displayed floor").toBeGreaterThanOrEqual(Math.min(first.width, second.width) - .5);
  }
}

test("Cache CT overlapping Quad variants yield one clickable standing point", async ({ page }) => {
  await isolateOnlineMedia(page);
  const map = MAPS.find(item => item.id === "cache")!;
  await page.goto("/#utilities?map=cache&level=main&side=CT");
  await expectContext(page, map, map.levels[0], "CT");
  await openUtilityGroupForArea(page,"cache:main:a-main");
  await chooseUtilityType(page,'Smoke');
  await chooseLandingSpot(page,{areaId:'cache:main:a-main'});
  const retained=await expectOriginRecipes(page);
  const quadIds=retained.records.filter(record=>/Quad/i.test(record.from)).map(record=>record.id);
  expect(quadIds.length).toBeGreaterThan(0);
  const quadGroups=retained.groups.filter(group=>group.ids.some(id=>quadIds.includes(id)));
  expect(quadGroups).toHaveLength(1);
  for(const id of quadIds)expect(quadGroups[0].ids).toContain(id);
  await expectDistinctSourceHitAreas(page);
  const selected = await clickFirstOriginAndVerifySource(page,quadIds[0]);
  expect(selected.record.from).toMatch(/Quad/i);
});

test("every map, floor and side opens a real target flow or recovers from an empty floor", async ({ page }) => {
  test.setTimeout(120_000);
  await isolateOnlineMedia(page);
  let checked = 0;
  for (const map of MAPS) for (const level of map.levels) for (const side of ["T", "CT"] as const) {
    await test.step(`${map.name} ${level.name} ${side}`, async () => {
      await page.goto(`/#utilities?map=${map.id}&level=${level.id}&side=${side}`);
      const expected = await expectContext(page, map, level, side);
      let targetLevel = level;
      if (!expected.length) {
        // A floor used to stand on can have no published landing targets.
        // Keep the absence honest and exercise the offered guide recovery.
        targetLevel = map.levels.find(candidate => candidate.id !== level.id)!;
        expect(targetLevel).toBeTruthy();
        await page.getByRole("button", { name: `View ${targetLevel.name} guides`, exact: true }).click();
        await expectContext(page, map, targetLevel, side);
      }
      const targetCamera = await page.locator('.ul-map-svg').getAttribute('viewBox');
      await openFirstTarget(page);
      await expectDistinctSourceHitAreas(page);
      const sourceLevelId = await origins(page).first().getAttribute('data-origin-level');
      if (sourceLevelId === targetLevel.id) {
        await expect(page.locator('.ul-map-svg')).toHaveAttribute('viewBox', targetCamera!);
      } else {
        const sourceLevel = map.levels.find(candidate => candidate.id === sourceLevelId)!;
        expect(sourceLevel).toBeTruthy();
        const frame = lineupMapFrame(sourceLevel.contentBounds || {x:0,y:0,width:1000,height:1000});
        await expect.poll(async()=>(await page.locator('.ul-map-svg').getAttribute('viewBox'))!.split(' ').map(value=>Number(Number(value).toFixed(6)))).toEqual([frame.x,frame.y,frame.width,frame.height].map(value=>Number(value.toFixed(6))));
      }
      const sourceCamera = await page.locator('.ul-map-svg').getAttribute('viewBox');
      const selected = await clickFirstOriginAndVerifySource(page);
      expect(selected.record).toMatchObject({ mapId: map.id, levelId: targetLevel.id, side });
      await expect(page.locator('.ul-map-svg')).toHaveAttribute('viewBox', sourceCamera!);
      await viewer(page).getByRole("button", { name: "Close lineup media", exact: true }).click();
      await expect(page.locator('.ul-map-svg')).toHaveAttribute('viewBox', sourceCamera!);
      checked++;
    });
  }
  expect(checked).toBe(20);
});

for (const scenario of [{ mapId: "nuke", type: "HE" }, { mapId: "vertigo", type: "Smoke" }])
  test(`${scenario.mapId} lower target switches to its real upper-floor origin and back`, async ({ page }) => {
    await isolateOnlineMedia(page);
    const map = MAPS.find(item => item.id === scenario.mapId)!;
    const lower = map.levels.find(level => level.id === "lower")!;
    await page.goto(`/#utilities?map=${map.id}&level=lower&side=CT`);
    await expectContext(page, map, lower, "CT");
    await page.getByRole("group", { name: "Utility type", exact: true }).getByRole("button", { name: new RegExp(`^${scenario.type} `) }).click();
    await openFirstTarget(page);
    const floors = page.getByRole("group", { name: "Utility map level", exact: true });
    await expect(floors.getByRole("button", { name: "Upper", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(origins(page).first()).toHaveAttribute("data-origin-level", "upper");
    await expect(page).toHaveURL(/level=lower/);
    const selected = await clickFirstOriginAndVerifySource(page);
    expect(selected.record.levelId).toBe("lower");
    expect(selected.plotted.levelId).toBe("upper");
    await viewer(page).getByRole("button", { name: "Close lineup media", exact: true }).click();
    await page.getByRole("button", { name: "Back to targets", exact: true }).click();
    await expect(floors.getByRole("button", { name: "Lower", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/level=lower/);
    await expect(origins(page)).toHaveCount(0);
    await expect(page.locator(".ul-map-marker").first()).toBeVisible();
  });

test("external same-map floor hashes clear source selection and show the requested floor", async ({ page }) => {
  await isolateOnlineMedia(page);
  const map = MAPS.find(item => item.id === "nuke")!;
  const upper = map.levels.find(level => level.id === "upper")!, lower = map.levels.find(level => level.id === "lower")!;
  await page.goto("/#utilities?map=nuke&level=upper&side=T");
  await expectContext(page, map, upper, "T");
  await openFirstTarget(page);
  await page.evaluate(() => { location.hash = "utilities?map=nuke&level=lower&side=T"; });
  await expectContext(page, map, lower, "T");
  await expect(origins(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Back to targets", exact: true })).toHaveCount(0);
  await expect(viewer(page)).not.toBeVisible();
  await page.evaluate(() => { location.hash = "utilities?map=nuke&level=upper&side=T"; });
  await expectContext(page, map, upper, "T");
  await expect(origins(page)).toHaveCount(0);
});

test("external side hash restores the target floor after a cross-floor source selection", async ({ page }) => {
  await isolateOnlineMedia(page);
  const map = MAPS.find(item => item.id === "vertigo")!;
  const upper = map.levels.find(level => level.id === "upper")!;
  await page.goto("/#utilities?map=vertigo&level=upper&side=T");
  await expectContext(page, map, upper, "T");
  // Use an explicit upper destination with an exclusively lower source.
  // The first overview area need not be a cross-floor throw.
  await openUtilityGroupForArea(page,"vertigo:upper:named:ramp lurk");
  await chooseUtilityType(page,'Smoke');
  await chooseLandingSpot(page,{areaId:'vertigo:upper:named:ramp lurk'});
  await expect(origins(page).first()).toBeVisible();
  await expect(page.getByRole("group", { name: "Utility map level", exact: true }).getByRole("button", { name: "Lower", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => { location.hash = "utilities?map=vertigo&level=upper&side=CT"; });
  await expectContext(page, map, upper, "CT");
  await expect(origins(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Back to targets", exact: true })).toHaveCount(0);
  await expect(viewer(page)).not.toBeVisible();
});

test("manual lower-floor selection survives normal side toggles", async ({ page }) => {
  await isolateOnlineMedia(page);
  const map = MAPS.find(item => item.id === "nuke")!;
  const upper = map.levels.find(level => level.id === "upper")!, lower = map.levels.find(level => level.id === "lower")!;
  await page.goto("/#utilities?map=nuke&level=upper&side=T");
  await expectContext(page, map, upper, "T");
  await page.getByRole("group", { name: "Utility map level", exact: true }).getByRole("button", { name: "Lower", exact: true }).click();
  await expectContext(page, map, lower, "T");
  await expect(page).toHaveURL(/level=lower/);
  const side = page.getByRole("group", { name: "Utility side", exact: true });
  await side.getByRole("button", { name: "CT side", exact: true }).click();
  await expectContext(page, map, lower, "CT");
  await expect(page).toHaveURL(/level=lower/);
  await side.getByRole("button", { name: "T side", exact: true }).click();
  await expectContext(page, map, lower, "T");
  await expect(page).toHaveURL(/level=lower/);
});

test("closing an upper deep link then selecting Lower and another side keeps the lower floor", async ({ page }) => {
  await isolateOnlineMedia(page);
  const map = MAPS.find(item => item.id === "nuke")!;
  const lower = map.levels.find(level => level.id === "lower")!;
  const guide = PUBLISHED_LINEUPS.find(record => record.mapId === "nuke" && record.levelId === "upper" && record.side === "T" && record.id.startsWith("expanded-"))!;
  const query = new URLSearchParams({ map: map.id, level: "upper", side: "T", lineup: guide.id });
  await page.goto(`/#utilities?${query}`);
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole("heading", { name: guide.title, exact: true })).toBeVisible();
  await viewer(page).getByRole("button", { name: "Close lineup media", exact: true }).click();
  await page.getByRole("group", { name: "Utility map level", exact: true }).getByRole("button", { name: "Lower", exact: true }).click();
  await expectContext(page, map, lower, "T");
  await page.getByRole("group", { name: "Utility side", exact: true }).getByRole("button", { name: "CT side", exact: true }).click();
  await expectContext(page, map, lower, "CT");
  await expect(page).toHaveURL(/level=lower/);
  expect(new URLSearchParams(new URL(page.url()).hash.split("?")[1]).has("lineup")).toBe(false);
  await expect(viewer(page)).not.toBeVisible();
});

const originAsset = (mapId: string) => new RegExp(`/origins-${mapId}(?:-[A-Za-z0-9_-]+)?\\.json(?:[?#]|$)`);
async function delayOriginFetch(page: Page, mapId: string) {
  const body = await readFile(`src/data/lineup-origins/origins-${mapId}.json`);
  let requested = false;
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  await page.route(originAsset(mapId), async route => {
    // Vite also imports a tiny ?url script. Hold only the data fetch so the
    // catalogue and interface can finish loading independently of origins.
    if (route.request().resourceType() !== "fetch") return route.continue();
    requested = true;
    await barrier;
    await route.fulfill({ contentType: "application/json", body });
  });
  return { release, requested: () => requested };
}

test("pending origins wait after choosing a landing and Back cancels the request", async ({ page, context }) => {
  await isolateOnlineMedia(page);
  const map = MAPS.find(item => item.id === "cache")!;
  const held = await delayOriginFetch(page, map.id);
  let dismissedPage: Page | undefined;
  let releaseDismissed: (() => void) | undefined;
  async function choosePendingLanding(target: Page) {
    await target.goto("/#utilities?map=cache&level=main&side=T");
    await expectContext(target,map,map.levels[0],"T");
    await openUtilityGroupForArea(target,"cache:main:mid");
    await picker(target).getByRole("button",{name:"Smoke",exact:true}).click();
    await expect(picker(target)).toHaveCount(0);
    await expect(landingChoices(target).first()).toBeVisible();
    expect(await landingChoices(target).count()).toBeGreaterThan(1);
    await expect(origins(target)).toHaveCount(0);
    await landingChoices(target).first().click();
    await expect(origins(target)).toHaveCount(0);
    await expect(viewer(target)).not.toBeVisible();
    await expect(target.getByRole("button",{name:"Back to targets",exact:true})).toBeVisible();
  }
  try {
    await choosePendingLanding(page);
    await expect.poll(held.requested).toBe(true);
    const response = page.waitForResponse(item=>item.request().resourceType()==="fetch"&&originAsset(map.id).test(item.url()));
    held.release();await(await response).finished();
    await expect(landingChoices(page)).toHaveCount(0);
    await expect(origins(page).first()).toBeVisible();
    await expectOriginRecipes(page);
    await expectDistinctSourceHitAreas(page);
    const opened=await clickFirstOriginAndVerifySource(page);
    expect(opened.record.type).toBe("Smoke");
    expect(opened.record.target).toMatch(/mid/i);

    dismissedPage=await context.newPage();
    await isolateOnlineMedia(dismissedPage);
    const cancelled=await delayOriginFetch(dismissedPage,map.id);
    releaseDismissed=cancelled.release;
    await choosePendingLanding(dismissedPage);
    await expect.poll(cancelled.requested).toBe(true);
    await dismissedPage.getByRole("button",{name:"Back to targets",exact:true}).click();
    await expect(landingChoices(dismissedPage)).toHaveCount(0);
    await expect(origins(dismissedPage)).toHaveCount(0);
    const cancelledResponse=dismissedPage.waitForResponse(item=>item.request().resourceType()==="fetch"&&originAsset(map.id).test(item.url()));
    cancelled.release();await(await cancelledResponse).finished();
    await dismissedPage.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(null)))));
    await expect(origins(dismissedPage)).toHaveCount(0);
    await expect(landingChoices(dismissedPage)).toHaveCount(0);
    await expect(picker(dismissedPage)).toHaveCount(0);
    await expect(dismissedPage.getByRole("button",{name:"Back to targets",exact:true})).toHaveCount(0);
    await expect(viewer(dismissedPage)).not.toBeVisible();
    await expect(mainMarkerGroupsForArea(dismissedPage,"cache:main:mid").first()).toBeVisible();
  } finally {held.release();releaseDismissed?.();await dismissedPage?.close();}
});

test("keyboard group, utility and landing selection focuses an immediate origin without an entry animation", async ({ page }) => {
  await isolateOnlineMedia(page);
  const map = MAPS.find(item => item.id === "cache")!;
  await page.goto("/#utilities?map=cache&level=main&side=CT");
  await expectContext(page, map, map.levels[0], "CT");
  const target = page.locator(".ul-map-marker").first();
  await target.focus();
  await target.press("Enter");
  await waitForUtilityChoice(page);
  await expect(picker(page)).toBeVisible();
  await expect(types(page).first()).toBeFocused();
  await types(page).first().press("Enter");
  await expect(picker(page)).toHaveCount(0);
  await chooseLandingSpot(page,{keyboard:true});
  await expect(origins(page).first()).toBeVisible();
  await expect(origins(page).first()).toBeFocused();
  await expect(page.locator(".ul-origin-glyph.can-animate")).toHaveCount(0);
  expect(await origins(page).first().locator(".ul-origin-glyph").evaluate(element => getComputedStyle(element).animationName)).toBe("none");
  await expect(viewer(page)).not.toBeVisible();
  await openOriginPhoto(page,{keyboard:true});
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole("button", { name: /^Photos/ })).toHaveAttribute("aria-pressed", "true");
});

test("unsaving the last Saved source removes its pin and returns to the empty target view", async ({ page }) => {
  await isolateOnlineMedia(page);
  const map = MAPS.find(item => item.id === "cache")!;
  const guide = PUBLISHED_LINEUPS.find(record => record.id === "expanded-cs2tricks-cache-a-main-from-quad-b906-ct")!;
  expect(guide).toBeTruthy();
  await page.addInitScript(({ key, id }) => localStorage.setItem(key, JSON.stringify([id])), { key: FAVORITE_UTILITIES_KEY, id: guide.id });
  await page.goto("/#utilities?map=cache&level=main&side=CT");
  await expectContext(page, map, map.levels[0], "CT");
  const saved = page.getByRole("button", { name: /^Saved / });
  await saved.click();
  await expect(saved).toHaveAttribute("aria-pressed", "true");
  await expectReferenceCount(page,1);
  await openFirstTarget(page);
  await expect(origins(page)).toHaveCount(1);
  await openOriginPhoto(page,{recordId:guide.id});
  await expect(viewer(page)).toBeVisible();
  await viewer(page).getByRole("button", { name: `Unsave ${guide.title}`, exact: true }).click();
  await viewer(page).getByRole("button", { name: "Close lineup media", exact: true }).click();
  await expect(origins(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Back to targets", exact: true })).toHaveCount(0);
  await expect(page.locator(".ul-map-marker")).toHaveCount(0);
  await expectReferenceCount(page,0);
  await expect(page.getByRole('status').filter({hasText:'No saved lineups on this map yet.'})).toBeVisible();
  await expect(saved).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), FAVORITE_UTILITIES_KEY)).toEqual([]);
  await expect(viewer(page)).not.toBeVisible();
});
