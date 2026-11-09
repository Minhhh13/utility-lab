import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// Render the existing Waypoints artwork without redrawing its geometry.
const path = (value) => fileURLToPath(new URL(value, import.meta.url));
const original = (await readFile(path("../../public/icon.svg"), "utf8")).trim();
const squareIcon = original.replace(' rx="30"', "");
const mark = original.replace(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">',
  '<svg x="1174" y="1174" width="384" height="384" viewBox="0 0 128 128">',
);
const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="#f5f5f2"/>${mark}</svg>`;
const sourceDirectory = path("../BrandAssets/");
const assetsDirectory = path("../App/App/Assets.xcassets/");
await mkdir(sourceDirectory, { recursive: true });
await writeFile(`${sourceDirectory}/AppIcon.svg`, `${squareIcon}\n`);
await writeFile(`${sourceDirectory}/LaunchScreen.svg`, `${splash}\n`);

const channel = process.env.PLAYWRIGHT_CHANNEL ||
  (process.platform === "win32" ? "msedge" : undefined);
const browser = await chromium.launch({ channel, headless: true });
try {
  // No remote media, font or other network request is needed for these assets.
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.route("**/*", (route) => route.abort());
  async function render(svg, size) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><head><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}body>svg{display:block;width:100%;height:100%}</style></head><body>${svg}</body></html>`);
    return page.screenshot({ type: "png", omitBackground: false });
  }
  await writeFile(
    `${assetsDirectory}/AppIcon.appiconset/AppIcon-512@2x.png`,
    await render(squareIcon, 1024),
  );
  const splashPng = await render(splash, 2732);
  for (const filename of [
    "splash-2732x2732.png",
    "splash-2732x2732-1.png",
    "splash-2732x2732-2.png",
  ]) await writeFile(`${assetsDirectory}/Splash.imageset/${filename}`, splashPng);
  console.log("Rendered branded 1024px app icon and 2732px launch assets.");
} finally {
  await browser.close();
}
