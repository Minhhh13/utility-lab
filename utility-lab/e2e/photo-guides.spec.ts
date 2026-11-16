import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {makePersonalCopy,downloadViewedLineup} from './lineup-helpers';

test("a real attributed photo guide zooms, pans and becomes a portable personal copy", async ({
  page,
}) => {
  await page.goto(
    "/#utilities?map=mirage&level=main&side=T&lineup=compendium-mirage-palace-jungle",
  );
  const viewer = page.getByRole("dialog", {
    name: "Jungle smoke · Palace Alley",
    exact: true,
  });
  await expect(viewer).toBeVisible();
  const image = viewer.locator(".ul-photo-canvas img");
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBe(1280);
  await expect(
    viewer.getByRole("link", { name: "CC BY-SA 4.0", exact: true }),
  ).toHaveAttribute("href", "https://creativecommons.org/licenses/by-sa/4.0/");
  await expect(viewer.locator("iframe")).toHaveCount(0);
  await viewer
    .getByRole("button", { name: "Zoom in photo", exact: true })
    .click();
  await expect(
    viewer.getByRole("button", { name: "Fit photo", exact: true }),
  ).toContainText("150%");
  const viewport = viewer.locator(".ul-photo-viewport");
  const before = await viewport.evaluate((element) => element.scrollLeft);
  await viewport.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before);
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1280 ? 720 : 844 });
    await expect(
      viewer.getByRole("button", { name: "Close lineup media", exact: true }),
    ).toBeInViewport();
    await expect(
      viewer.getByRole("button", { name: "Zoom in photo", exact: true }),
    ).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await mkdir("outputs/photo-review", { recursive: true });
    await page.screenshot({ path: `outputs/photo-review/guide-${width}.png` });
  }
  await makePersonalCopy(page);
  await page.getByRole("button", { name: "Save lineup", exact: true }).click();
  await expect(page.locator(".app-notice")).toContainText("saved on this device");
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("utility-lab:utilities:v1")!)[0],
  );
  expect(saved.photos[0].image).toMatch(/^ul-media:/);
  expect(saved.photos[0].license).toBe("CC BY-SA 4.0");
  const pendingDownload = page.waitForEvent("download");
  await downloadViewedLineup(page);
  const download = await pendingDownload;
  const path = resolve("outputs/photo-review/exported-photo-lineup.json");
  await download.saveAs(path);
  const portable = JSON.parse(await readFile(path, "utf8"));
  expect(portable.lineup.photos[0].image).toMatch(/^data:image\/webp;base64,/);
  expect(portable.lineup.photos[0].creator).toContain("spnk");
});

test("online reference photos appear in our own gallery with source credits", async ({
  page,
}) => {
  // An explicit legacy source verifies credit preservation independently of
  // which simpler examples are selected for the current default map list.
  await page.goto("/#utilities?map=anubis&side=CT&lineup=gonade-anubis-b-site-from-back-b-site-flash");
  const viewer = page.locator(".ul-media-dialog");
  await expect(viewer).toBeVisible();
  await expect(viewer.locator(".ul-photo-canvas img")).toHaveAttribute(
    "src",
    /^https:\/\/gonade.app\/images\//,
  );
  await expect(viewer.locator("iframe")).toHaveCount(0);
  await expect(
    viewer.getByRole("link", { name: "Photo source", exact: true }),
  ).toHaveAttribute("href", /^https:\/\/gonade.app\/nade\/anubis-/);
});

test("the explicit photo pack opens an original guide after the network is disconnected", async ({
  page,
  context,
}) => {
  await page.goto("http://127.0.0.1:5180/#utilities");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page
    .getByRole("button", { name: "Workspace settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Download photo guides", exact: true })
    .click();
  await expect(
    page.getByText("All bundled photo guides are ready offline.", {
      exact: true,
    }),
  ).toBeVisible({ timeout: 30_000 });
  await page
    .getByRole("button", { name: "Close workspace settings", exact: true })
    .click();
  await context.setOffline(true);
  await page.goto(
    "http://127.0.0.1:5180/#utilities?map=mirage&side=T&level=main&lineup=compendium-mirage-palace-jungle",
  );
  const image = page.locator(".ul-media-dialog .ul-photo-canvas img");
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBe(1280);
  await context.setOffline(false);
});
