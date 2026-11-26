import {
  readdir,
  mkdir,
  copyFile,
  readFile,
  writeFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, basename, relative, sep } from "node:path";
import { MAPS } from "../src/maps.ts";
import { LAUNCH_SCENES, sceneAssets } from "../src/launch-scenes.ts";
import { BUNDLED_GUIDE_PHOTOS, PHOTO_GUIDE_LIBRARY } from "../src/guide-library.ts";
import { mergePhotoGuides, normalizeExpandedGuides } from "../src/expanded-guide-model.ts";
import { lineupWalkthrough } from "../src/lineup-walkthrough.ts";
import { withAimPlacement } from "../src/aim-placement.ts";
import { utilityPhotos } from "../src/utility-data.ts";
import { highResolutionPhoto } from "../src/data/high-resolution-photos.ts";

const project = fileURLToPath(new URL("../", import.meta.url));
const version = JSON.parse(
  await readFile(join(project, "package.json"), "utf8"),
).version;
const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
const target = join(
  project,
  "outputs",
  "releases",
  `utility-lab-local-${version}-${stamp}`,
);
const mapFiles = new Set(
  MAPS.flatMap((map) =>
    map.levels.flatMap((level) => [
      basename(level.image),
      ...(level.image.endsWith(".svg")
        ? [basename(level.image).replace(".svg", "-light.svg")]
        : []),
      ...(level.radarImage ? [basename(level.radarImage)] : []),
    ]),
  ),
);
const photoFiles = new Set(BUNDLED_GUIDE_PHOTOS);
// The optional offline pack and the photos a player can open on demand have
// different inventories. Publish the exact stills chosen by the live viewer.
for (const map of MAPS) {
  const raw = await readFile(join(project, "src", "data", "expanded", map.id + ".json"), "utf8");
  const guides = mergePhotoGuides(PHOTO_GUIDE_LIBRARY.filter(guide => guide.mapId === map.id), normalizeExpandedGuides(JSON.parse(raw), map.id));
  for (const guide of guides) {
    const steps = lineupWalkthrough(guide, utilityPhotos(withAimPlacement(guide)));
    for (const step of steps) for (const {photo} of step.views) {
      if (!photo) continue;
      if (photo.image.startsWith("/lineup-media/")) photoFiles.add(photo.image);
      const detail = highResolutionPhoto(photo.image);
      if (detail?.image.startsWith("/lineup-media/")) photoFiles.add(detail.image);
    }
  }
}
const missingPhotos = new Set(photoFiles);
const landscapeFiles = new Set([...LAUNCH_SCENES.flatMap(sceneAssets), "/art/credits.txt"]);
let files = 0,
  bytes = 0;
async function copyTree(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink())
      throw new Error(
        "Release assets must be ordinary files, not symbolic links.",
      );
    const from = join(source, entry.name),
      to = join(destination, entry.name),
      path = relative(join(project, "dist"), from).split(sep).join("/");
    if (path === "favicon.svg") continue;
    if (path.startsWith("lineup-media/") && !entry.isDirectory() && !photoFiles.has(`/${path}`)) continue;
    if (
      path.startsWith("art/") && !entry.isDirectory() &&
      !landscapeFiles.has(`/${path}`)
    )
      continue;
    if (entry.isDirectory()) {
      await copyTree(from, to);
      continue;
    }
    if (
      (path.startsWith("maps/") || path.startsWith("map-thumbnails/")) &&
      /\.(png|svg)$/.test(entry.name) &&
      !mapFiles.has(entry.name)
    )
      continue;
    if (
      path.startsWith("fonts/") &&
      !/^(manrope-latin\.woff2|Manrope-OFL\.txt)$/.test(entry.name)
    )
      continue;
    await copyFile(from, to);
    missingPhotos.delete("/" + path);
    files++;
    bytes += (await readFile(from)).length;
  }
}
await copyTree(join(project, "dist"), join(target, "dist"));
if (missingPhotos.size) {
  throw new Error(`Release is missing ${missingPhotos.size} referenced photos: ${[...missingPhotos].slice(0, 10).join(", ")}`);
}
await mkdir(join(target, "scripts"), { recursive: true });
await copyFile(
  join(project, "scripts", "serve-local.mjs"),
  join(target, "scripts", "serve-local.mjs"),
);
await writeFile(
  join(target, "Start-UtilityLab.cmd"),
  '@echo off\r\nnode "%~dp0scripts\\serve-local.mjs" %*\r\nif errorlevel 1 pause\r\n',
);
await writeFile(
  join(target, "README.txt"),
  `Utility Lab ${version} — local build\n\nRequires Node.js 22.13 or newer. No npm install is needed for this packaged app.\nDouble-click Start-UtilityLab.cmd, then open http://127.0.0.1:5180\nLeave its terminal open while using the app. Ctrl+C stops it.\n\nThe server listens only on this PC by default and never uploads the website.\nOptional same-network access: Start-UtilityLab.cmd --lan\nPlain HTTP phone access cannot install offline service workers; localhost and HTTPS can.\n\nKeep the same address and port to use the same browser workspace. Steam, other browsers and phones have separate storage. Use Workspace settings > Export workspace to transfer your saved records and photos. Save unfinished lineups and playbooks before making a backup.\n\nOriginal publisher photos and creator videos remain on their source hosts. Photo guides open in the app’s own swipe/zoom viewer with position, aim and throw inputs. The explicit offline action keeps bundled photos and maps; your uploads stay local. A separate bounded browser cache can retain up to 12 successfully viewed publisher photos for seven days. Other publisher photos and videos need internet. Guides are demonstrations, not independent validation on the current game build. Only Active Duty/FACEIT map entries are included.\n\nMap drawings by setpos.gg (CC BY 4.0); retain the linked in-app credit. Game radars belong to Valve and the map creators. Home pixel art by Luis Zuno (ansimuz); sources and license details are in dist/art/credits.txt. Font license is in dist/fonts/Manrope-OFL.txt. This is an unofficial fan app.\n`,
);
await writeFile(
  join(target, "release.json"),
  JSON.stringify(
    {
      name: "Utility Lab",
      version,
      createdAt: new Date().toISOString(),
      files,
      bytes,
      maps: MAPS.map((map) => map.id),
      localOnly: true,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ directory: target, files, bytes }, null, 2));
