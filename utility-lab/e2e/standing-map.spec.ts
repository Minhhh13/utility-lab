import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const guide = "expanded-cs2tricks-ancient-elbow-from-ct-spawn-4-8b27-ct";
const route = `/#utilities?map=ancient&level=main&side=CT&lineup=${guide}`;
const source = "https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-4-8b27";
const original = "/lineup-media/source-video-stills/cs2tricks/ancient/8ee5a6fb-7370-4f53-b423-fb835ef2c990.jpg";
test.use({ serviceWorkers: "block" });

for (const width of [1280, 390]) {
  test(`the CT Spawn 4 pin and first-person standing frame keep their original source at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const firstPersonRequests: string[] = [];
    page.on("request", request => {
      if (new URL(request.url()).pathname === original) firstPersonRequests.push(request.url());
    });
    await page.goto(route);
    const viewer = page.getByRole("dialog", { name: "Instant Elbow smoke · CT Spawn 4" });
    const map = viewer.locator(".ul-standing-map");
    await expect(map.getByRole("img", { name: /Recorded standing position: Ancient · CT Spawn #4/ })).toBeVisible();
    await expect(map).toHaveAttribute("data-origin-registration", "world-ancient-main");
    await expect(map.locator(".ul-standing-map-pin")).toHaveAttribute("transform", "translate(489.26 85.16)");
    await expect(map.getByRole("link", { name: "Minimap by setpos.gg" })).toHaveAttribute("href", "https://setpos.gg");
    await expect(map.getByRole("link", { name: "Standing position source" })).toHaveAttribute("href", source);
    await expect(viewer.locator(".ul-photo-credit")).toBeHidden();
    expect(firstPersonRequests).toHaveLength(0);
    await viewer.getByRole("button", { name: "Step 2: First-person standing view" }).click();
    await expect(map).toHaveCount(0);
    await expect(viewer.locator(".ul-photo-canvas img")).toHaveAttribute("src", original);
    await expect.poll(() => firstPersonRequests.length).toBe(1);
    await expect(viewer.getByRole("link", { name: "Photo source" })).toHaveAttribute("href", source);
    await expect(viewer.getByRole("img", { name: "Aim here" })).toHaveCount(0);
  });
}

test("an unavailable standing-map image leaves its original photo and toolbar usable", async ({ page }) => {
  await page.route("**/maps/ancient.svg", route => route.abort());
  await page.goto(route);
  const viewer = page.getByRole("dialog", { name: "Instant Elbow smoke · CT Spawn 4" });
  const photo = viewer.locator(".ul-photo-canvas img");
  await expect(photo).toHaveAttribute("src", original);
  await photo.evaluate((img: HTMLImageElement) => img.decode());
  await expect(viewer.locator(".ul-standing-map")).toHaveCount(0);
  await expect(viewer.getByRole("link", { name: "Photo source" })).toHaveAttribute("href", source);
  await viewer.getByRole("button", { name: "Zoom in photo", exact: true }).click();
  await expect(viewer.getByRole("button", { name: "Fit photo", exact: true })).toContainText("150%");
});

test("a close crop reuses the wide aim photo and leaves the alternate release photo on demand", async ({ page }) => {
  const requested: string[] = [];
  const body = readFileSync("public/icons/icon-192.png");
  await page.route("https://media.setpos.gg/**", route => {
    requested.push(route.request().url());
    return route.fulfill({ contentType: "image/png", body });
  });
  await page.goto("/#utilities?map=dust2&level=main&side=CT&lineup=precise-setpos-dust2-69");
  const viewer = page.getByRole("dialog");
  await viewer.getByRole("button", { name: "Step 3: First-person aim" }).click();
  await expect(viewer.locator("[data-image-ready=true]")).toBeVisible();
  const releaseRequests = () => requested.filter(url => url.includes("display-pre-gesture-release"));
  await viewer.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(viewer.locator(".ul-photo-region[data-image-ready=true]")).toBeVisible();
  expect(releaseRequests()).toHaveLength(0);
  await viewer.getByRole("button", { name: "Previous photo", exact: true }).click();
  await viewer.getByRole("button", { name: "Throw", exact: true }).click();
  await expect.poll(() => releaseRequests().length).toBe(1);
});
