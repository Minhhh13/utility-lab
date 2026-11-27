import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });
const url = "/#utilities?map=mirage&level=main&side=T&lineup=expanded-cs2tricks-mirage-window-from-back-alley-61ab-t";
const steps = [
  ["Where to stand", "329f7172-aaf2-4e1e-8712-aa9d814d1dbc"],
  ["First-person standing view", "/first-person/cs2tricks/mirage/window-from-back-alley-61ab.webp"],
  ["First-person aim", "3686baa6-6d86-4bba-8ab4-ee55f61a310d"],
  ["Aim detail", "374c9cec-6d63-41eb-8f11-fd6cd6404903"],
  ["Landing", "e3ca91c8-ebee-4f2f-b422-ce17c7192018"],
];

for (const width of [1280, 320]) {
  test(`the five Back Alley steps show the source photos and close aim at ${width}px`, async ({ page }) => {
    await page.setViewportSize({width, height: width === 320 ? 640 : 720});
    await page.goto(url);
    const viewer = page.getByRole("dialog", { name: "Window smoke · Back Alley" });
    for (const [i, [name, filename]] of steps.entries()) {
      const tab = viewer.getByRole("button", { name: `Step ${i + 1}: ${name}`, exact: true });
      await expect(tab).toHaveAttribute("aria-pressed", "true");
      await expect(tab).toBeInViewport();
      const img = viewer.locator(".ul-photo-canvas img");
      await expect(img).toHaveAttribute("src", new RegExp(filename));
      await img.evaluate((el: HTMLImageElement) => el.decode());
      await expect(viewer.getByRole("img", {name: "Aim here"})).toHaveCount(i === 2 || i === 3 ? 1 : 0);
      if (i === 3) {
        await expect(viewer.locator(".ul-photo-region")).toHaveCount(0);
        const detail = (await img.boundingBox())!;
        const mark = (await viewer.getByRole("img", {name: "Aim here"}).boundingBox())!;
        // The verified point on this original frame is its actual camera center.
        expect(Math.abs(mark.x + mark.width / 2 - detail.x - detail.width / 2)).toBeLessThan(.1);
        expect(Math.abs(mark.y + mark.height / 2 - detail.y - detail.height / 2)).toBeLessThan(.1);
      }
      await viewer.getByRole("button", { name: "Next photo", exact: true }).click();
    }
    await expect(viewer.getByRole("button", { name: "Step 1: Where to stand" })).toHaveAttribute("aria-pressed", "true");
    await viewer.getByRole("button", { name: "Previous photo", exact: true }).click();
    await expect(viewer.getByRole("button", { name: "Step 5: Landing" })).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test("a guide with a single original aim image magnifies the crosshair by 2.5×", async ({ page }) => {
  await page.goto("/#utilities?map=ancient&level=main&side=T&lineup=expanded-cs2tricks-ancient-b-alley-from-ruins-6af7-t");
  const viewer = page.getByRole("dialog", { name: "B Alley smoke · Ruins" });
  const image = viewer.locator(".ul-photo-canvas img");
  await viewer.getByRole("button", { name: "Step 3: First-person aim", exact: true }).click();
  await image.evaluate((el: HTMLImageElement) => el.decode());
  const wideWidth = await image.evaluate((el: HTMLImageElement) => {
    const box = el.getBoundingClientRect();
    return Math.min(box.width, box.height * el.naturalWidth / el.naturalHeight);
  });
  await viewer.getByRole("button", { name: "Step 4: Aim detail", exact: true }).click();
  await expect(viewer.locator(".ul-photo-region")).toBeVisible();
  expect((await image.boundingBox())!.width / wideWidth).toBeCloseTo(2.5, 2);
});
