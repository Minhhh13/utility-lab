import type { UtilityPhoto, UtilityReference } from "../utility-data.ts";
import { utilityPhotos } from "../utility-data.ts";
import sourceFrames from "./cs2tricks-setup-frames.json" with { type: "json" };
import youtubeFrames from "./cs2tricks-youtube-setup-frames.json" with { type: "json" };

const setupSeconds: Record<string, number> = { ...sourceFrames, ...youtubeFrames };
const setupCaptions: Record<string, string> = {
  "ancient/flashbangs/lane-from-lamp-183b": "Pre-throw view from behind the orange panel at Jaguar, facing the wooden cover.",
  "dust2/smokes/ct-cross-from-taxi-corner-f042": "Pre-throw view from Taxi Corner beside the wooden pole, with the wall on your right.",
  "mirage/flashbangs/b-stairs-from-underpass-2a39": "Look down Underpass from the starting spot. This is the player’s view just before the running jump.",
  "mirage/smokes/window-from-back-alley-61ab": "Face the leftmost pipe on the red Back Alley wall before turning toward the roofline.",
};
// In these original videos the Position frame already shows the player's
// actual spawn in first person. Each one also has a registered world pin.
const firstPersonSpawns = new Set([
  "ancient/smokes/elbow-from-ct-spawn-4-8b27",
  "ancient/smokes/top-mid-from-spawn-5-f2a3",
  "ancient/smokes/top-mid-from-t-spawn-1-bf6e",
  "ancient/smokes/top-mid-from-t-spawn-2-2490",
  "ancient/smokes/top-mid-from-t-spawn-4-cf20",
]);

export function cs2tricksStagePhotos(record: UtilityReference): { setup?: UtilityPhoto; landing?: UtilityPhoto } {
  const prefix = "https://www.cs2tricks.com/nades/";
  if (record.userCreated || !record.source?.startsWith(prefix)) return {};
  const path = record.source.slice(prefix.length);
  if (firstPersonSpawns.has(path)) {
    return { setup: utilityPhotos(record).find(photo => photo.kind === "position") };
  }
  const seconds = setupSeconds[path];
  if (typeof seconds !== "number") return {};
  const [map, , slug] = path.split("/");
  return { setup: {
    kind: "position",
    image: `/lineup-media/first-person/cs2tricks/${map}/${slug.replace(/'/g, "")}.webp`,
    caption: setupCaptions[path] ?? `First-person setup at ${record.from} · source video ${seconds.toFixed(2)}s`,
    source: record.source,
    annotationId: `sourceframe@${Math.round(seconds * 1000)}ms`,
    creator: record.creator || "CS2Tricks",
  } };
}
