import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// One canonical route symbol supplies web installation and native icons.
const path = (value) => fileURLToPath(new URL(value, import.meta.url));
const original = (await readFile(path("../../public/icon.svg"), "utf8")).trim();
const squareIcon = original.replace('color="#365fe4"', 'color="#fff"').replace('</title>', '</title><rect width="128" height="128" fill="#365fe4"/>');
const mark = original.replace(
  /^<svg\b[^>]*>/,
  '<svg x="1174" y="1174" width="384" height="384" viewBox="0 0 128 128" color="#365fe4">',
);
const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732"><rect width="2732" height="2732" fill="#f5f5f2"/>${mark}</svg>`;
const sourceDirectory = path("../BrandAssets/");
const assetsDirectory = path("../App/App/Assets.xcassets/");
const webIconsDirectory = path("../../public/icons/");
await mkdir(sourceDirectory, { recursive: true });
await mkdir(webIconsDirectory, { recursive: true });
await writeFile(`${sourceDirectory}/AppIcon.svg`, `${squareIcon}\n`);
await writeFile(`${sourceDirectory}/LaunchScreen.svg`, `${splash}\n`);

const channel =
  process.env.PLAYWRIGHT_CHANNEL ||
  (process.platform === "win32" ? "msedge" : undefined);
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const browser = await chromium.launch(
  executablePath
    ? { executablePath, headless: true }
    : { channel, headless: true },
);
try {
  // No remote media, font or other network request is needed for these assets.
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.route("**/*", (route) => route.abort());
  async function render(svg, size) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<html><head><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}body>svg{display:block;width:100%;height:100%}</style></head><body>${svg}</body></html>`,
    );
    return page.screenshot({ type: "png", omitBackground: false });
  }
  await writeFile(
    `${assetsDirectory}/AppIcon.appiconset/AppIcon-512@2x.png`,
    await render(squareIcon, 1024),
  );
  for (const [filename, size] of [
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["apple-touch-icon.png", 180],
  ])
    await writeFile(
      `${webIconsDirectory}/${filename}`,
      await render(squareIcon, size),
    );
  const splashPng = await render(splash, 2732);
  for (const filename of [
    "splash-2732x2732.png",
    "splash-2732x2732-1.png",
    "splash-2732x2732-2.png",
  ])
    await writeFile(
      `${assetsDirectory}/Splash.imageset/${filename}`,
      splashPng,
    );
  console.log(
    "Rendered matching web, 1024px native and 2732px launch brand assets.",
  );
} finally {
  await browser.close();
}
