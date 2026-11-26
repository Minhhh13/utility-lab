import { test, expect, type Locator } from "@playwright/test";
import { PUBLISHED_LINEUPS } from "./catalogue-fixtures";
import { curateLineups } from "../src/lineup-curation";
import { hasCompleteGuideMedia } from "../src/expanded-guide-model";
import { FAVORITE_UTILITIES_KEY, utilityPhotos } from "../src/utility-data";
import {expectReferenceCount,waitForUtilityChoice,chooseLandingSpot,chooseUtilityType,openOriginPhoto} from './lineup-helpers';

test.use({ serviceWorkers: "block" });
const guide = PUBLISHED_LINEUPS.find(row => row.id === "expanded-cs2tricks-mirage-stairs-from-a-ramp-door-a722-t")!;
const context = PUBLISHED_LINEUPS.filter(row => row.mapId === "mirage" && row.levelId === "main" && row.side === "T");
const curated = curateLineups(context);
const photos = utilityPhotos(guide);
const originals = new Map<string, { body: Buffer; contentType: string }>();

test.beforeAll(async ({ request }) => {
  expect(guide).toBeTruthy();
  expect(hasCompleteGuideMedia(guide)).toBe(true);
  expect(curated.some(row => row.id === guide.id), "regression fixture is excluded from default four-per-spot curation").toBe(false);
  for (const photo of photos.filter(photo => photo.image.startsWith("https://"))) {
    const response = await request.get(photo.image);
    expect(response.ok(), `Original guide photo: ${photo.image}`).toBeTruthy();
    originals.set(photo.image, { body: await response.body(), contentType: response.headers()["content-type"] });
  }
});

async function decoded(viewer: Locator, index: number) {
  const image = viewer.locator(".ul-photo-canvas img");
  await expect(image).toHaveAttribute("src", photos[index].image);
  await image.evaluate(async (image: HTMLImageElement) => image.decode());
  await expect(image).toHaveCSS("opacity", "1");
}

test("saving a complete guide outside the curated four preserves its count, filters, photos and direct link", async ({ page }, info) => {
  await page.addInitScript(({ key, id }) => localStorage.setItem(key, JSON.stringify([id])), { key: FAVORITE_UTILITIES_KEY, id: guide.id });
  // Keep original source image bytes: the regression concerns selection, while
  // the photo viewer still opens the actual saved guide rather than a substitute.
  await page.route(/^https:\/\//, route => {
    const image = originals.get(route.request().url());
    return image ? route.fulfill({ status: 200, ...image }) : route.abort();
  });
  await page.goto("/#utilities?map=mirage&level=main&side=T");
  const library = page.getByRole("region", { name: "Utility library", exact: true });
  await expectReferenceCount(page,context.length);
  const saved = library.getByRole("button", { name: /^Saved / });
  await expect(saved).toHaveText("Saved1");
  await expect(saved).toHaveAttribute("aria-pressed", "false");
  await expect(library.locator('.ul-reference-open')).toHaveCount(0);

  await saved.click();
  await expect(saved).toHaveAttribute("aria-pressed", "true");
  await expectReferenceCount(page,1);
  const types = library.getByRole("group", { name: "Utility type", exact: true });
  const all = types.getByRole("button", { name: /^All / });
  const smoke = types.getByRole("button", { name: /^Smoke / });
  await expect(all).toHaveText("All1");
  await expect(smoke).toHaveText("Smoke1");
  for (const type of ["Flash", "Molly", "HE"])
    await expect(types.getByRole("button", { name: new RegExp(`^${type} `) })).toHaveText(`${type}0`);
  await smoke.click();
  await expect(smoke).toHaveAttribute("aria-pressed", "true");
  await expectReferenceCount(page,1);
  await smoke.click();
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await expectReferenceCount(page,1);
  await page.screenshot({ path: info.outputPath("saved-uncurated-guide.png") });

  await page.locator('.ul-map-marker').first().click();await waitForUtilityChoice(page);
  await chooseUtilityType(page,'Smoke');
  await chooseLandingSpot(page);await openOriginPhoto(page,{recordId:guide.id});
  const viewer = page.getByRole("dialog", { name: guide.title, exact: true });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByRole('button',{name:`Unsave ${guide.title}`,exact:true})).toHaveAttribute('aria-pressed','true');
  await decoded(viewer, 0);
  await expect(viewer.locator(".ul-photo-kind")).toHaveText("Position");
  await expect(viewer.getByRole("button", { name: /^Photos / })).toHaveAttribute("aria-pressed", "true");
  const steps = viewer.getByRole("group", { name: "Choose lineup photo", exact: true }).getByRole("button");
  await expect(steps).toHaveCount(5);
  for (const [index, label] of ["Where to stand", "First-person standing view", "First-person aim", "Aim detail", "Landing"].entries()) {
    await expect(steps.nth(index)).toHaveAccessibleName(`Step ${index + 1}: ${label}`);
  }
  const aimIndex = photos.findIndex(photo => photo.kind === "aim");
  await viewer.getByRole("button", { name: "Step 3: First-person aim", exact: true }).click();
  await decoded(viewer, aimIndex);
  await expect(viewer.locator(".ul-photo-kind")).toHaveText("Aim");
  await expect(viewer.getByRole("img", { name: "Aim here", exact: true })).toBeVisible();
  const link = page.url();
  expect(new URLSearchParams(new URL(link).hash.split("?")[1]).get("lineup")).toBe(guide.id);
  await page.screenshot({ path: info.outputPath("saved-uncurated-aim.png") });

  // A fresh route load must still resolve the complete original record even
  // though it is deliberately absent from the default curated map list.
  await page.goto(link);
  await page.reload();
  await expect(viewer).toBeVisible();
  await decoded(viewer, 0);
  await expect(viewer.locator(".ul-photo-kind")).toHaveText("Position");
  await expect(viewer.locator(".ul-media-footer")).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "[]"), FAVORITE_UTILITIES_KEY)).toEqual([guide.id]);
});
