export const LAUNCH_SCENES = [
  {
    id: "dust-cs1999", name: "Dust · CS 1999", group: "Classic Dust",
    src: "/art/launch-dust-cs1999.webp",
    alt: "Original Dust in pixel art, with green crates below a sandstone tower.",
  },
  {
    id: "dust-source", name: "Dust · Source", group: "Classic Dust",
    src: "/art/launch-dust-source.webp",
    alt: "Source-era Dust in pixel art, with wooden crates and wires over the bombsite arch.",
  },
  {
    id: "dust-csgo", name: "Dust · CS:GO", group: "Classic Dust",
    src: "/art/launch-dust-csgo.webp",
    alt: "Early CS:GO Dust in pixel art, with blue domes above the underpass steps.",
  },
  {
    id: "dunes", name: "Dunes at sunset", group: "Landscapes",
    src: "/art/launch-dunes.webp",
    alt: "The last sunlight falls across a sandstone fortress above a desert canyon.",
  },
  {
    id: "foundry", name: "Foundry at dusk", group: "Landscapes",
    src: "/art/launch-foundry.webp",
    alt: "Amber loading-bay lamps reflect in puddles in a blue-hour industrial yard.",
  },
  {
    id: "temple", name: "Temple gardens", group: "Landscapes",
    src: "/art/launch-temple.webp",
    alt: "Sunlit stone arches, hanging vines and fireflies surround a shaded temple pool.",
  },
] as const;

export type SceneId = (typeof LAUNCH_SCENES)[number]["id"];
export const SMOKE_ART = "/art/pixel-smoke.png";
