import { expect, test } from "@playwright/test";
import { PUBLISHED_LINEUPS } from "./catalogue-fixtures";
import { lineupWalkthrough } from "../src/lineup-walkthrough";
import { parseUtilityVideo, utilityPhotos } from "../src/utility-data";

const guide = PUBLISHED_LINEUPS.find(record => {
  const video = parseUtilityVideo(record.videoUrl || "", record.videoStart);
  if (video?.kind !== "youtube") return false;
  const setup = lineupWalkthrough(record, utilityPhotos(record)).find(step => step.stage === "setup");
  return setup && !setup.views[0].photo;
});

for (const width of [1280, 390]) {
  test(`the standing-video fallback opens its credited clip and preserves keyboard navigation at ${width}px`, async ({ page }) => {
    test.skip(!guide, "Every published YouTube guide currently has a standing photo.");
    const record = guide!;
    const video = parseUtilityVideo(record.videoUrl!, record.videoStart);
    if (!video || video.kind !== "youtube") throw Error("Missing source video");
    const iframeRequests: string[] = [];
    await page.route("https://www.youtube-nocookie.com/**", route => {
      iframeRequests.push(route.request().url());
      return route.fulfill({ contentType: "text/html", body: "<title>Source player</title>" });
    });
    await page.setViewportSize({ width, height: width === 390 ? 844 : 720 });
    await page.goto("/#utilities?" + new URLSearchParams({ map: record.mapId, level: record.levelId, side: record.side, lineup: record.id }));
    const viewer = page.getByRole("dialog", { name: record.title, exact: true });
    await viewer.getByRole("button", { name: "Step 1: Where to stand", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    const watch = viewer.getByRole("button", { name: "Watch standing setup", exact: true });
    await expect(watch).toBeVisible();
    expect(iframeRequests).toEqual([]);
    const original = new URL((await viewer.getByRole("link", { name: "Open original video" }).getAttribute("href"))!);
    expect(original.searchParams.get("v")).toBe(video.id);
    await watch.focus();
    await page.keyboard.press("Enter");
    const frame = viewer.locator("iframe");
    await expect(frame).toBeVisible();
    const embed = new URL((await frame.getAttribute("src"))!);
    expect(embed.origin + embed.pathname).toBe(`https://www.youtube-nocookie.com/embed/${video.id}`);
    expect(embed.searchParams.get("start")).toBe(String(video.start));
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByRole("button", { name: "Step 3: First-person aim", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(frame).toHaveCount(0);
    const aim = utilityPhotos(record).find(photo => photo.kind === "aim")!;
    await expect(viewer.locator(".ul-photo-canvas img")).toHaveAttribute("src", aim.image);
    await expect(viewer.getByRole("img", { name: "Aim here", exact: true })).toBeVisible();
  });
}
