export const LAUNCH_SCENES = [
  {
    id: "neon-street", name: "Neon street", group: "City",
    width: 384, height: 192, focus: .40,
    src: "/art/ansimuz/neon-street.webp",
    foreground: "/art/ansimuz/neon-street-front.webp",
    source: "https://opengameart.org/content/cyberpunk-street-environment",
    alt: "Neon restaurant signs frame an empty street beneath a blue city skyline.",
  },
  {
    id: "old-town", name: "Old town", group: "City",
    width: 800, height: 288, focus: .36,
    src: "/art/ansimuz/old-town.webp",
    source: "https://opengameart.org/content/gothicvania-town",
    alt: "Stone houses and tiled roofs line a cobbled street under a rose-coloured sky.",
  },
  {
    id: "hangar", name: "Hangar", group: "Industrial",
    width: 352, height: 224, focus: .55,
    src: "/art/ansimuz/hangar.webp",
    source: "https://opengameart.org/content/bulkhead-walls-hangar",
    alt: "Steel columns, overhead pipes and turquoise lights inside a hangar.",
  },
  {
    id: "factory", name: "Factory skyline", group: "Industrial",
    width: 272, height: 160, focus: .50,
    src: "/art/ansimuz/factory.webp",
    source: "https://opengameart.org/content/industrial-parallax-background",
    alt: "Steam rises between factory chimneys beneath an overcast sky.",
  },
  {
    id: "mountain-pass", name: "Mountain pass", group: "Outdoors",
    width: 272, height: 160, focus: .52,
    src: "/art/ansimuz/mountain-pass.webp",
    source: "https://opengameart.org/content/mountain-at-dusk-background",
    alt: "Pine silhouettes and layered mountain ridges against the last light of dusk.",
  },
  {
    id: "cliffside", name: "Cliffside", group: "Outdoors",
    width: 816, height: 304, focus: .30,
    src: "/art/ansimuz/cliffside.webp",
    source: "https://opengameart.org/content/magic-cliffs-environment",
    alt: "A narrow bridge connects mossy cliffs high above a cloud-filled valley.",
  },
] as const;

export type Scene = (typeof LAUNCH_SCENES)[number];
export type SceneId = Scene["id"];
export const DEFAULT_SCENE = LAUNCH_SCENES[0].id;

const previousPreferences: Record<string, SceneId> = {
  "dust-cs1999": "neon-street",
  "dust-source": "old-town",
  "dust-csgo": "hangar",
  dunes: "mountain-pass",
  foundry: "factory",
  temple: "cliffside",
};

export function resolveScene(value: string | null): SceneId {
  return LAUNCH_SCENES.find(scene => scene.id === value)?.id
    ?? (value && Object.prototype.hasOwnProperty.call(previousPreferences, value) ? previousPreferences[value] : DEFAULT_SCENE);
}

export function sceneAssets(scene: Scene): string[] {
  return "foreground" in scene ? [scene.src, scene.foreground] : [scene.src];
}
