import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("photo instructions are simple, retain credits, and slide by buttons, keys and touch", async ({
  page,
}) => {
  await page.goto(
    "/#utilities?map=ancient&level=main&side=T&lineup=photo-kielson-ancient-s_ct_0-t",
  );
  const media = page.getByRole("dialog", {
    name: "CT smoke · A main reference",
    exact: true,
  });
  await expect(media).toBeVisible();
  await expect(
    media.getByText("Position", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    media.getByRole("link", { name: "MIT", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Practice targets", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator(".ul-validation-note, .ul-media-disclaimer"),
  ).toHaveCount(0);
  expect(await media.getByRole('group',{name:'Choose lineup photo',exact:true}).getByRole('button').count()).toBeGreaterThanOrEqual(2);
  await expect(media.locator('.ul-viewer-keys')).toBeVisible();
  expect(await media.textContent()).not.toMatch(
    /capture date|current map version|may predate|not independently/i,
  );
  await media.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(media.locator(".ul-photo-kind")).toHaveText("Aim");
  await page.keyboard.press("ArrowLeft");
  await expect(media.locator(".ul-photo-kind")).toHaveText("Position");
  await media.locator(".ul-photo-viewport").dispatchEvent("pointerdown", {
    pointerId: 10,
    pointerType: "touch",
    isPrimary: true,
    clientX: 240,
    clientY: 150,
  });
  await media.locator(".ul-photo-viewport").dispatchEvent("pointerup", {
    pointerId: 10,
    pointerType: "touch",
    isPrimary: true,
    clientX: 120,
    clientY: 155,
  });
  await expect(media.locator(".ul-photo-kind")).toHaveText("Aim");
  await mkdir("outputs/clean-guides", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "outputs/clean-guides/photo-steps-390.png" });
  await media
    .getByRole("button", { name: "Close lineup media", exact: true })
    .click();
  await page.screenshot({
    path: "outputs/clean-guides/sidebar-390.png",
    fullPage: true,
  });
});

test("a guide with both formats lets the player choose photos or video without early remote loads", async ({
  page,
}) => {
  const remote: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://gonade.app"))
      remote.push(request.url());
  });
  await page.route("https://gonade.app/images/**", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  let releaseVideo!: () => void;
  const videoGate = new Promise<void>(resolve => { releaseVideo = resolve; });
  page.once("close", () => releaseVideo());
  await page.route("https://gonade.app/videos/**", async route => {
    await videoGate;
    await route.abort().catch(() => {});
  });
  await page.goto(
    "/#utilities?map=nuke&level=upper&side=T&lineup=gonade-nuke-a-site-from-t-spawn-flash",
  );
  const media = page.getByRole("dialog", {
    name: "A Site flash · T Spawn",
    exact: true,
  });
  await expect(media).toBeVisible();
  await expect(media.getByRole("button", { name: /^Photos/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    media.getByRole("button", { name: "Video", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(remote.every((url) => url.includes("/images/"))).toBe(true);
  await expect(media.locator("iframe")).toHaveCount(0);
  await expect(media.locator(".ul-photo-canvas img")).toHaveAttribute(
    "src",
    /^https:\/\/gonade.app\/images\//,
  );
  await media.getByRole("button", { name: "Video", exact: true }).click();
  await expect(media.locator("iframe, video")).toHaveCount(0);
  await media.getByRole("button", { name: "Load video", exact: true }).click();
  await expect(media.locator("video")).toHaveAttribute(
    "src",
    "https://gonade.app/videos/3002.mp4",
  );
  await expect(media.locator("video")).toHaveAttribute("controls", "");
  await expect(media.locator("video")).not.toHaveAttribute("autoplay", "");
  await media.getByRole("button", { name: /^Photos/ }).click();
  await expect(media.locator("video")).toHaveCount(0);
  releaseVideo();
});
