import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PUBLISHED_LINEUPS } from "./catalogue-fixtures";
import { mainMarkerGroupsForArea, openOriginPhoto } from "./lineup-helpers";
import { lineupLink } from "../src/routes";
import { MAPS } from "../src/maps";

test.use({serviceWorkers:"block"});
test.beforeEach(async ({page}) => {
  const photo = await readFile("public/icons/icon-192.png");
  await page.route(/^https:\/\//, route => route.request().resourceType() === "image"
    ? route.fulfill({contentType:"image/png",body:photo}) : route.abort());
});

for (const {width,height,touch} of [{width:1440,height:1080,touch:false},{width:320,height:844,touch:true}]) {
  test.describe(`exploring a shared guide at ${width}px`, () => {
    test.use({viewport:{width,height},hasTouch:touch});
    test("opens every matching Mid Doors origin and keeps the map camera", async ({page,baseURL}) => {
      const records = PUBLISHED_LINEUPS.filter(record => record.mapId === "dust2" && record.side === "T" &&
        record.type === "Smoke" && record.target === "Mid Doors");
      const first = records.find(record => record.from === "Lower Tunnels")!;
      await page.goto(lineupLink(first,baseURL!));
      const svg = page.locator(".ul-map-svg");
      const camera = await svg.getAttribute("viewBox");
      const action = page.getByRole("button",{name:"Show throw locations on map",exact:true});
      await expect(action).toBeInViewport();
      if (touch) await action.tap(); else await action.press("Enter");
      await expect(page.locator(".ul-media-dialog")).not.toBeVisible();
      const pins = page.locator(".ul-origin-pin");
      const active = pins.and(page.locator('[aria-current="location"]'));
      await expect(active).toBeFocused();
      expect(JSON.parse((await active.getAttribute("data-origin-recipes"))!)).toContain(first.id);
      const ids = await pins.evaluateAll(nodes => nodes.flatMap(n => JSON.parse(n.getAttribute("data-origin-recipes")!)));
      expect(ids.sort()).toEqual(records.map(record=>record.id).sort());
      await expect(svg).toHaveAttribute("viewBox",camera!);
      await expect(page).not.toHaveURL(/lineup=/);
      const next = records.find(record=>record.id !== first.id)!;
      await openOriginPhoto(page,{recordId:next.id,touch});
      await expect(page.locator("#lineup-media-title")).toHaveText(next.title);
      await page.getByRole("button",{name:"Close lineup media"}).click();
      await expect(svg).toHaveAttribute("viewBox",camera!);
      await expect(page).not.toHaveURL(/lineup=/);
      await page.reload();
      await expect(page.locator(".ul-map-marker").first()).toBeVisible();
      await expect(page.locator(".ul-media-dialog")).not.toBeVisible();
    });
  });
}

test("an upper-floor Nuke origin links back to its lower-floor landing", async ({page,baseURL}) => {
  const record = PUBLISHED_LINEUPS.find(item=>item.id==="cs2tricks-nuke-new-end-he-from-ramp")!;
  await page.goto(lineupLink(record,baseURL!));
  await page.getByRole("button",{name:"Show throw locations on map"}).click();
  const active = page.locator('.ul-origin-pin[aria-current="location"]');
  await expect(active).toBeFocused();
  await expect(active).toHaveAttribute("data-origin-level","upper");
  await expect(page.getByRole("group",{name:"Throw-from locations"})).toHaveAttribute("data-target-level","lower");
  await expect(page).toHaveURL(/level=upper/);
  await page.getByRole("button",{name:"Back to targets"}).click();
  await expect(page).toHaveURL(/level=lower/);
});

test("the Dumpster standing pin keeps keyboard focus on the circle", async ({page,baseURL}) => {
  const guide = PUBLISHED_LINEUPS.find(row => row.mapId === "cache" && row.from === "Dumpster")!;
  await page.goto(lineupLink(guide,baseURL!));
  await page.getByRole("button",{ name:"Show throw locations on map" }).press("Enter");
  const pin = page.locator('.ul-origin-pin[aria-current="location"]');
  await expect(pin).toBeFocused();
  await expect(pin).toHaveCSS("outline-style","none");
  await expect(pin.locator("circle").first()).not.toHaveCSS("stroke","none");
});

test("each supported map exposes the opened guide among its standing pins", async ({page,baseURL}) => {
  for (const mapId of new Set(PUBLISHED_LINEUPS.map(record => record.mapId))) {
    const record = PUBLISHED_LINEUPS.find(item => item.mapId === mapId && item.type === "Smoke")!;
    await page.goto(lineupLink(record,baseURL!));
    const dialog = page.getByRole("dialog",{name:record.title,exact:true});
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button",{name:"Show throw locations on map"}).click();
    const active = page.locator('.ul-origin-pin[aria-current="location"]');
    await expect(active).toBeFocused();
    expect(JSON.parse((await active.getAttribute("data-origin-recipes"))!)).toContain(record.id);
    await expect(page.getByRole("group",{name:"Throw-from locations"})).toHaveAttribute("data-target-utility","Smoke");
  }
});

test("spawn smoke mode matches the numbered recipes on each map, side and floor", async ({page}) => {
  test.setTimeout(90000);
  for (const map of MAPS) for (const floor of map.levels) for (const side of ["T","CT"]) {
    const rows = PUBLISHED_LINEUPS.filter(row => row.mapId === map.id && row.levelId === floor.id && row.side === side);
    const smokes = rows.filter(row => row.type === "Smoke");
    const spawns = smokes.filter(row => row.spawn);
    await page.goto(`/?audit=${map.id}-${floor.id}-${side}#utilities?map=${map.id}&level=${floor.id}&side=${side}`);
    const library = page.locator(".utility-workspace");
    await expect(library).toHaveAttribute("aria-busy","false");
    await expect(page.getByRole("button",{name:`${side} side`,exact:true})).toHaveAttribute("aria-pressed","true");
    const filters = page.getByRole("group",{name:"Utility type",exact:true});
    const smoke = filters.locator('[data-utility="Smoke"]');
    if (await smoke.getAttribute("aria-pressed") !== "true") await smoke.click();
    const spawn = page.getByRole("button",{name:/^Spawn smokes/});
    if (!spawns.length) { await expect(spawn).toHaveCount(0); continue; }
    const svg = page.locator(".ul-map-svg");
    const camera = await svg.getAttribute("viewBox");
    await spawn.click();
    await expect(spawn).toHaveAttribute("aria-pressed","true");
    await expect(library).toHaveAttribute("data-reference-count",String(spawns.length));
    await expect(svg).toHaveAttribute("viewBox",camera!);
    await spawn.click();
    await expect(library).toHaveAttribute("data-reference-count",String(smokes.length));
    await filters.locator('[data-utility="All"]').click();
  }
});

test("on a phone the spawn filter shows the recorded Mirage starts and yields to multi-select", async ({page}) => {
  await page.setViewportSize({width:320,height:844});
  await page.goto("/#utilities?map=mirage&level=main&side=T");
  const filters = page.getByRole("group",{name:"Utility type",exact:true});
  await filters.locator('[data-utility="Smoke"]').click();
  const spawn = page.getByRole("button",{name:/^Spawn smokes/});
  await spawn.click();
  const windowGroup = mainMarkerGroupsForArea(page,"mirage:main:mid-window").first();
  await windowGroup.locator(".ul-marker-hit").click();
  const landing = page.locator(".ul-landing-pin").first();
  await expect(landing.or(page.locator(".ul-origin-pin").first()).first()).toBeVisible();
  if (await landing.count()) await landing.click();
  const pins = page.locator(".ul-origin-pin");
  await expect(pins.first()).toBeVisible();
  const ids = await pins.evaluateAll(nodes => nodes.flatMap(node => JSON.parse(node.getAttribute("data-origin-recipes")!)));
  expect(ids.length).toBeGreaterThan(0);
  expect(ids.every(id => PUBLISHED_LINEUPS.some(row => row.id === id && row.spawn))).toBe(true);
  await page.getByRole("button",{name:"Back to targets"}).click();
  await expect(spawn).toHaveAttribute("aria-pressed","true");
  await filters.locator('[data-utility="Flash"]').click();
  await expect(spawn).toHaveCount(0);
  await expect(filters.locator('[data-utility="Smoke"]')).toHaveAttribute("aria-pressed","true");
});
