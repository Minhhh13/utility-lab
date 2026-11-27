import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { MAPS } from "../src/maps";
import { USER_UTILITIES_KEY, type UtilityPhoto, type UtilityReference } from "../src/utility-data";
import { PUBLISHED_LINEUPS } from "./catalogue-fixtures";

const fixtureImage = readFileSync("public/icons/icon-192.png");
const personalPhotoFiles = [
  { kind: "position", caption: "My standing position", image: "icon-192.png" },
  { kind: "aim", caption: "My aim point", image: "apple-touch-icon.png" },
  { kind: "landing", caption: "My landing", image: "icon-512.png" },
] satisfies UtilityPhoto[];
const personalPhotos = personalPhotoFiles.map(photo => ({
  ...photo,
  image: `data:image/png;base64,${readFileSync(`public/icons/${photo.image}`).toString("base64")}`,
}));

async function checkGallery(page: Page, record: UtilityReference, touch: boolean) {
  const params = new URLSearchParams({
    map: record.mapId, level: record.levelId, side: record.side, lineup: record.id,
  });
  await page.goto(`/#utilities?${params}`, { waitUntil: "domcontentloaded" });
  const viewer = page.locator(".ul-media-dialog[open]");
  // A cold deep link loads that map's catalogue before opening the dialog.
  await expect(viewer.getByRole("heading", { name: record.title, exact: true })).toBeVisible({ timeout: 15_000 });
  const steps = viewer.getByRole("group", { name: "Choose lineup photo", exact: true }).getByRole("button");
  const total = record.userCreated ? personalPhotos.length : 5;
  await expect(steps).toHaveCount(total);

  async function checkSlide(index: number) {
    await expect(steps.nth(index)).toHaveAttribute("aria-pressed", "true");
    await expect(viewer.locator(".ul-photo-caption > span")).toHaveText(`${index + 1} / ${total}`);
    if (record.userCreated) {
      await expect(viewer.locator(".ul-photo-caption p")).toHaveText(personalPhotos[index].caption);
    }
  }
  await checkSlide(0);
  const previous = viewer.getByRole("button", { name: "Previous photo", exact: true });
  const next = viewer.getByRole("button", { name: "Next photo", exact: true });
  for (const [button, key] of [[previous, "A"], [next, "D"]] as const) {
    await expect(button).toHaveAttribute("aria-keyshortcuts", key);
    await expect(button.locator("kbd")).toHaveText(key);
    await expect(button.locator("kbd")).toBeVisible();
    await expect.poll(() => button.evaluate((el, key) => {
      const box = el.getBoundingClientRect();
      const stage = el.closest(".ul-photo-stage")!.getBoundingClientRect();
      const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      const mid = stage.left + stage.width / 2;
      return {
        inside: box.left >= Math.max(0, stage.left) && box.right <= Math.min(innerWidth, stage.right)
          && box.top >= Math.max(0, stage.top) && box.bottom <= Math.min(innerHeight, stage.bottom),
        side: key === "A" ? box.right < mid : box.left > mid,
        reachable: document.elementFromPoint(cx, cy)?.closest("button") === el,
        touchSize: box.width >= 44 && box.height >= 44,
      };
    }, key)).toEqual({ inside: true, side: true, reachable: true, touchSize: true });
  }
  await viewer.getByRole("button", { name: "Close lineup media" }).focus();
  await page.keyboard.press("a");
  await checkSlide(total - 1);
  await page.keyboard.press("d");
  await checkSlide(0);
  for (let index = 1; index < total; index++) {
    if (touch) await next.tap(); else await next.click();
    await checkSlide(index);
  }
  for (let index = total - 2; index >= 0; index--) {
    if (touch) await previous.tap(); else await previous.click();
    await checkSlide(index);
  }
  await viewer.getByRole("button", { name: "Close lineup media" }).click();
  await expect(viewer).toHaveCount(0);
}

for (const layout of [
  { name: "4:3 desktop", viewport: { width: 1440, height: 1080 }, touch: false, side: "T" },
  { name: "narrow phone", viewport: { width: 320, height: 640 }, touch: true, side: "CT" },
] as const) {
  test.describe(layout.name, () => {
    test.use({ viewport: layout.viewport, hasTouch: layout.touch, serviceWorkers: "block" });
    for (const map of MAPS) {
      for (const level of map.levels) {
        test(`${map.name} ${level.name} published and personal photo controls`, async ({ page, baseURL }) => {
          const candidates = PUBLISHED_LINEUPS.filter(item => item.mapId === map.id && item.levelId === level.id);
          const published = candidates.find(item => item.side === layout.side) ?? candidates[0];
          if (!published) throw new Error(`Missing published ${map.name} ${level.name} guide`);
          const personal: UtilityReference = {
            id: `personal-gallery-${map.id}-${level.id}`, title: `My ${map.name} ${level.name} guide`,
            mapId: map.id, levelId: level.id, side: layout.side, type: "Smoke", from: "Start", target: "End",
            purpose: "Practice", throwType: "Left click", steps: ["Stand", "Aim"], x: 500, y: 500,
            userCreated: true, photos: personalPhotos,
          };
          await page.addInitScript(({ key, data }) => localStorage.setItem(key, JSON.stringify([data])), {
            key: USER_UTILITIES_KEY, data: personal,
          });
          // Navigation must work independently of publishers' media hosts.
          const origin = new URL(baseURL!).origin;
          await page.route(url => url.protocol === "https:" && url.origin !== origin, route =>
            route.request().resourceType() === "image"
              ? route.fulfill({ contentType: "image/png", body: fixtureImage }) : route.abort());
          await checkGallery(page, published, layout.touch);
          await checkGallery(page, personal, layout.touch);
        });
      }
    }
  });
}
