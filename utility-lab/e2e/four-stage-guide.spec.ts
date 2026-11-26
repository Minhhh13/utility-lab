import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });
const url = "/#utilities?map=mirage&level=main&side=T&lineup=expanded-cs2tricks-mirage-window-from-back-alley-61ab-t";
const steps = [
  ["Where to stand", "329f7172-aaf2-4e1e-8712-aa9d814d1dbc"],
  ["First-person standing view", "/first-person/cs2tricks/mirage/window-from-back-alley-61ab.webp"],
  ["First-person aim", "3686baa6-6d86-4bba-8ab4-ee55f61a310d"],
  ["Landing", "e3ca91c8-ebee-4f2f-b422-ce17c7192018"],
];

for (const width of [1280, 320]) {
  test(`the four Back Alley steps show their source photos at ${width}px`, async ({ page }) => {
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
      await expect(viewer.getByRole("img", {name: "Aim here"})).toHaveCount(i === 2 ? 1 : 0);
      await viewer.getByRole("button", { name: "Next photo", exact: true }).click();
    }
    await expect(viewer.getByRole("button", { name: "Step 1: Where to stand" })).toHaveAttribute("aria-pressed", "true");
    await viewer.getByRole("button", { name: "Previous photo", exact: true }).click();
    await expect(viewer.getByRole("button", { name: "Step 4: Landing" })).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}
