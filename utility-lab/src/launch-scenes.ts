const maps = [
  { id: "dust-1999", file: "dust-1999", name: "Dust · CS 1999", focus: .51, alt: "A stone ramp leads to Dust’s low underpass, between recessed arches and timber crates." },
  { id: "dust-source", file: "dust-source", name: "Dust · Source", focus: .65, alt: "A cream saloon stands across from the sunken road beneath a sandstone dome and overhead wires." },
  { id: "dust2", file: "dust2-16", name: "Dust II · CS 1.6", focus: .49, alt: "Olive crates and a faded red B-site marking frame Dust II’s wooden double doors." },
  { id: "aztec", file: "aztec", name: "Aztec · CS 1.6", focus: .58, alt: "A sagging rope-and-plank bridge crosses the water between green stone ruins." },
  { id: "inferno", file: "inferno-source", name: "Inferno · Source", focus: .49, alt: "Crates of yellow fruit sit beside the B-site fountain, with the chapel and tiled arcade behind." },
  { id: "nuke", file: "nuke-source", name: "Nuke · Source", focus: .12, alt: "A yellow silo overlooks timber crates, a red cargo container and the fenced industrial yard." },
  { id: "train", file: "train", name: "Train · CS 1.6", focus: .50, alt: "Green and rust-red freight cars flank a narrow track between two concrete sheds." },
  { id: "office", file: "office", name: "Office · Source", focus: .42, alt: "A bare tree stands in the snowy front yard between a loading shutter and the stone office entrance." },
] as const;

export type SceneId = (typeof maps)[number]["id"];
export const LAUNCH_SCENES = maps.map(map => ({
  ...map,
  src: `/art/maps/${map.file}.webp`,
  thumbnail: `/art/map-thumbnails/${map.file}.webp`,
}));
export type Scene = (typeof LAUNCH_SCENES)[number];
export const DEFAULT_SCENE: SceneId = "dust-1999";

const previousPreferences: Partial<Record<string, SceneId>> = {
  "dust-cs1999": "dust-1999", "dust-csgo": "dust-source",
  dunes: "dust-1999", foundry: "nuke", temple: "aztec",
  "neon-street": "office", "old-town": "inferno", hangar: "nuke",
  factory: "train", "mountain-pass": "aztec", cliffside: "aztec",
  anubis: "dust-1999", ancient: "aztec", cache: "train", mirage: "inferno", vertigo: "office",
};

export function resolveScene(value: string | null): SceneId {
  const current = LAUNCH_SCENES.find(scene => scene.id === value);
  if (current) return current.id;
  return value && Object.prototype.hasOwnProperty.call(previousPreferences, value)
    ? previousPreferences[value] ?? DEFAULT_SCENE : DEFAULT_SCENE;
}
