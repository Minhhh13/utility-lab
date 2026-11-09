/** Active Duty and FACEIT matchmaking only, checked 9 November 2026. */
export interface MapLevel {
  id: string;
  name: string;
  image: string;
  radarImage?: string;
  contentBounds?: { x: number; y: number; width: number; height: number };
}
export interface GameMap {
  id: string;
  name: string;
  mode: string;
  status: "available" | "legacy";
  levels: MapLevel[];
  credit?: string;
  note?: string;
  gameId?: string;
  activeDuty?: boolean;
  faceit?: boolean;
  vectorImage?: string;
}
export const MAP_CATALOGUE_CHECKED = "2026-11-09";
// Visible artwork bounds in the unchanged 1000×1000 coordinate system.
// Fit Lineups to the actual geometry instead of the SVG's empty outer margin.
const contentBounds: Record<string, NonNullable<MapLevel["contentBounds"]>> = {
  mirage: { x: 80, y: 130, width: 860, height: 746 },
  dust2: { x: 23, y: 0, width: 947, height: 1000 },
  inferno: { x: 38, y: 38, width: 935, height: 916 },
  nuke: { x: 44, y: 247, width: 954, height: 520 },
  ancient: { x: 101, y: 43, width: 774, height: 910 },
  anubis: { x: 129, y: 0, width: 754, height: 980 },
  cache: { x: 13, y: 150, width: 950, height: 723 },
};
const vector = (id: string): MapLevel[] => [
  {
    id: "main",
    name: "Overview",
    image: `/maps/${id}.svg`,
    radarImage: `/maps/de_${id}_radar_psd.png`,
    contentBounds: contentBounds[id],
  },
];
const active = (id: string, name: string): GameMap => ({
  id,
  name,
  gameId: `de_${id}`,
  mode: "Active Duty",
  status: "available",
  activeDuty: true,
  faceit: true,
  levels: vector(id),
  credit: "Minimaps by setpos.gg",
  vectorImage: `/maps/${id}.svg`,
});
export const MAPS: GameMap[] = [
  active("mirage", "Mirage"),
  active("dust2", "Dust II"),
  active("inferno", "Inferno"),
  {
    ...active("nuke", "Nuke"),
    levels: [
      {
        id: "upper",
        name: "Upper",
        image: "/maps/nuke.svg",
        radarImage: "/maps/de_nuke_radar_psd.png",
        contentBounds: contentBounds.nuke,
      },
      {
        id: "lower",
        name: "Lower",
        image: "/maps/de_nuke_lower_radar_psd.png",
      },
    ],
    credit: "Upper minimap by setpos.gg; lower radar © Valve Corporation",
  },
  active("ancient", "Ancient"),
  active("anubis", "Anubis"),
  active("cache", "Cache"),
  {
    id: "vertigo",
    name: "Vertigo",
    gameId: "de_vertigo",
    mode: "FACEIT",
    status: "available",
    activeDuty: false,
    faceit: true,
    levels: [
      { id: "upper", name: "Upper", image: "/maps/de_vertigo_radar_psd.png" },
      {
        id: "lower",
        name: "Lower",
        image: "/maps/de_vertigo_lower_radar_psd.png",
      },
    ],
    credit: "Radar artwork © Valve Corporation and the respective map creators",
    note: "Optional FACEIT Season 9 map.",
  },
];
export const getMap = (id: string): GameMap =>
  MAPS.find((map) => map.id === id) ?? MAPS[0];
