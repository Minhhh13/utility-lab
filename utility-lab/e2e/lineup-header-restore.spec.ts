import { expect, test } from "@playwright/test";
import { openUtilityGroupForArea } from "./lineup-helpers";

test.use({ serviceWorkers: "block" });

for (const viewport of [
  { width: 1280, height: 960, compact: false },
  { width: 1280, height: 960, compact: true },
  { width: 1440, height: 900, compact: true },
  { width: 390, height: 844, compact: true },
  { width: 320, height: 640, compact: false },
  { width: 568, height: 320, compact: true },
]) {
  test(`restore and lineup controls stay independently clickable at ${viewport.width}×${viewport.height}, compact=${viewport.compact}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.addInitScript(compact => localStorage.setItem("ul:display", JSON.stringify({
      compact, aspect: "4:3", headerHidden: true,
    })), viewport.compact);
    await page.goto("/#utilities?map=cache&side=T");
    await expect(page.locator(".utility-workspace")).toHaveAttribute("aria-busy", "false");
    const restore = page.getByRole("button", { name: "Show top bar", exact: true });
    await expect(page.locator("#workspace")).toHaveAttribute("data-aspect-ratio", viewport.width > 860 ? "4:3" : "auto");
    const cornerControls = page.locator(".ul-map-top, .ul-map-top button, .ul-header, .ul-header button, .ul-side-toggle");
    async function expectCornersClear() {
      await expect(restore).toBeVisible();
      await expect.poll(() => cornerControls.evaluateAll(elements => {
        const button = document.querySelector(".restore-topbar")!.getBoundingClientRect();
        return elements.filter(element => {
          const area = element.getBoundingClientRect();
          return area.left < button.right && area.right > button.left && area.top < button.bottom && area.bottom > button.top;
        }).map(element => element.className);
      }), { timeout: 1800 }).toEqual([]);
    }
    await expectCornersClear();
    await openUtilityGroupForArea(page, "cache:main:mid", { keyboard: true });
    await page.getByRole("dialog", { name: "Choose utility" }).getByRole("button", { name: "Smoke", exact: true }).click();
    const back = page.getByRole("button", { name: "Back to targets", exact: true });
    await expect(back).toBeVisible();
    await expectCornersClear();
    const size = (await back.boundingBox())!;
    const position = { x: size.width - 3, y: size.height / 2 };
    if (testInfo.project.use.hasTouch) await back.tap({ position });
    else await back.click({ position });
    await expect(back).toHaveCount(0);
    if (testInfo.project.use.hasTouch) await restore.tap();
    else await restore.click();
    await expect(restore).toBeHidden();
    await expect(page.locator(".studio-header")).toBeVisible();
    await expect(page.getByLabel("Display settings", { exact: true })).toBeFocused();
  });
}
