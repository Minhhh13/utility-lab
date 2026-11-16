import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test.use({ serviceWorkers: "block" });

test("classic landscapes sit in the top bar, remain compact on phones, and keep all destinations reachable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#home");
  await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveClass(/is-loaded/);
  const landscape = page
    .locator(".studio-header")
    .getByLabel("Landscape", { exact: true });
  await expect(landscape).toBeAttached();
  await expect(page.locator(".launch-screen select")).toHaveCount(0);
  await expect(landscape.locator("option")).toHaveText([
    "Dust · CS 1999",
    "Dust · Source",
    "Dust · CS:GO",
  ]);
  await mkdir("outputs/classic-map-art/review", { recursive: true });
  for (const size of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    await page.setViewportSize(size);
    await expect(landscape).toBeInViewport();
    const box = await landscape.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.y).toBeLessThan(80);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(size.width);
    if (size.width <= 500) expect(box!.width).toBe(44);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(size.width);
    for (const name of ["Tactic board", "Lineups", "Playbooks", "Stats"])
      await expect(
        page.getByRole("button", { name, exact: true }),
      ).toBeInViewport();
    await page.screenshot({
      path: `outputs/classic-map-art/review/header-${size.width}.png`,
    });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const id of ["dust-cs1999", "dust-source", "dust-csgo"]) {
    await landscape.selectOption(id);
    await expect(page.locator(".launch-screen")).toHaveAttribute(
      "data-scene",
      id,
    );
    expect(
      await page
        .locator(".launch-art:not(.launch-art-previous)")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    ).toBe(1672);
    await page.screenshot({
      path: `outputs/classic-map-art/review/${id}-1440.png`,
    });
  }
  await page.getByRole("button", { name: "Tactic board", exact: true }).click();
  await expect(page.locator(".launch-header-slot")).toHaveCount(0);
  await expect(page.locator(".tb-map")).toBeVisible();
  expect(errors).toEqual([]);
});
