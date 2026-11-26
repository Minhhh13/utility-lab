const maps = [
  { id: "dust2", name: "Dust II", focus: .38, alt: "Dust II's Mid Doors at the bottom of a sunlit street, seen from above." },
  { id: "mirage", name: "Mirage", focus: .47, alt: "Wooden crates beside the red A-site marking in Mirage's sandstone courtyard." },
  { id: "inferno", name: "Inferno", focus: .44, alt: "Inferno's B-site fountain with the church rising behind it." },
  { id: "nuke", name: "Nuke", focus: .41, alt: "Nuke's power station and twin cooling towers across the outdoor yard." },
  { id: "ancient", name: "Ancient", focus: .35, alt: "Ancient's B-site stone doorway and round stone carving beneath a canopy of trees." },
  { id: "anubis", name: "Anubis", focus: .52, alt: "A sandstone obelisk surrounded by the tall temple pillars of Anubis." },
  { id: "cache", name: "Cache", focus: .47, alt: "An industrial yard and striped smokestack beneath an overcast sky on Cache." },
  { id: "vertigo", name: "Vertigo", focus: .55, alt: "Orange site boxes among steel beams on an upper construction floor of Vertigo." },
] as const;

export type SceneId = (typeof maps)[number]["id"];
export const LAUNCH_SCENES = maps.map(map => ({
  ...map,
  src: `/art/maps/${map.id}.webp`,
  thumbnail: `/art/map-thumbnails/${map.id}.webp`,
}));
export type Scene = (typeof LAUNCH_SCENES)[number];
export const DEFAULT_SCENE: SceneId = "dust2";

const previousPreferences: Partial<Record<string, SceneId>> = {
  "dust-cs1999": "dust2", "dust-source": "dust2", "dust-csgo": "dust2",
  dunes: "anubis", foundry: "nuke", temple: "ancient",
  "neon-street": "mirage", "old-town": "inferno", hangar: "nuke",
  factory: "cache", "mountain-pass": "vertigo", cliffside: "ancient",
};

export function resolveScene(value: string | null): SceneId {
  const current = LAUNCH_SCENES.find(scene => scene.id === value);
  if (current) return current.id;
  return value && Object.prototype.hasOwnProperty.call(previousPreferences, value)
    ? previousPreferences[value] ?? DEFAULT_SCENE : DEFAULT_SCENE;
}
