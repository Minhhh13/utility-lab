import { test, expect } from "@playwright/test";
import {makePersonalCopy,downloadViewedLineup} from './lineup-helpers';

test.use({ viewport: { width: 320, height: 844 }, hasTouch: true });

test("an active saved notice permits a phone export tap and its dismiss button still works", async ({ page }) => {
  await page.goto("/#utilities?map=mirage&level=main&side=T&lineup=compendium-mirage-palace-jungle");
  await makePersonalCopy(page);
  await page.getByRole("button", { name: "Save lineup", exact: true }).click();
  const notice = page.locator(".app-notice");
  await expect(notice).toContainText("saved on this device");
  await expect(notice).toHaveCSS("pointer-events", "none");
  await expect(page.getByRole("button", { name: "Dismiss message", exact: true })).toHaveCSS("pointer-events", "auto");
  const download = page.waitForEvent("download");
  await downloadViewedLineup(page);
  expect((await download).suggestedFilename()).toMatch(/\.json$/);
  await expect(notice).toBeVisible();
  await page.getByRole("button", { name: "Dismiss message", exact: true }).tap();
  await expect(notice).toHaveCount(0);
});
