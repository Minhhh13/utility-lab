/**
 * Playable CS2 map catalogue checked against Valve's shipped gamemodes.txt
 * and release notes on 9 November 2026. See docs/map-sources.md.
 * Game radar artwork remains the property of Valve and the map creators.
 */
export interface MapLevel {
  id: string;
  name: string;
  image: string;
  radarImage?: string;
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
  /** Optional original vector drawing; level images use the actual game radars. */
  vectorImage?: string;
}

const radar = (file: string) => `/maps/${file}.png`;
const single = (file: string): MapLevel[] => [
  { id: "main", name: "Overview", image: radar(file) },
];
const floors = (file: string): MapLevel[] => [
  { id: "upper", name: "Upper", image: radar(`${file}_radar_psd`) },
  { id: "lower", name: "Lower", image: radar(`${file}_lower_radar_psd`) },
];
const gameCredit =
  "Radar artwork © Valve Corporation and the respective map creators";
const vectorCredit = "Minimaps by setpos.gg";
const vector = (id: string, file: string): MapLevel[] => [
  {
    id: "main",
    name: "Overview",
    image: `/maps/${id}.svg`,
    radarImage: radar(file),
  },
];
const standard = (
  id: string,
  name: string,
  file: string,
  activeDuty = false,
): GameMap => ({
  id,
  name,
  gameId: `de_${id}`,
  mode: activeDuty ? "Active Duty" : "Competitive",
  status: "available",
  levels: single(file),
  credit: gameCredit,
  activeDuty,
});

export const MAP_CATALOGUE_CHECKED = "2026-11-09";

export const MAPS: GameMap[] = [
  {
    ...standard("mirage", "Mirage", "de_mirage_radar_psd", true),
    levels: vector("mirage", "de_mirage_radar_psd"),
    credit: vectorCredit,
    vectorImage: "/maps/mirage.svg",
  },
  {
    ...standard("dust2", "Dust II", "de_dust2_radar_psd", true),
    levels: vector("dust2", "de_dust2_radar_psd"),
    credit: vectorCredit,
    vectorImage: "/maps/dust2.svg",
  },
  {
    ...standard("inferno", "Inferno", "de_inferno_radar_psd", true),
    levels: vector("inferno", "de_inferno_radar_psd"),
    credit: vectorCredit,
    vectorImage: "/maps/inferno.svg",
  },
  {
    ...standard("nuke", "Nuke", "de_nuke_radar_psd", true),
    levels: [
      {
        id: "upper",
        name: "Upper",
        image: "/maps/nuke.svg",
        radarImage: radar("de_nuke_radar_psd"),
      },
      floors("de_nuke")[1],
    ],
    credit: "Upper minimap by setpos.gg; lower radar © Valve Corporation",
    vectorImage: "/maps/nuke.svg",
  },
  {
    ...standard("ancient", "Ancient", "de_ancient_radar_psd", true),
    levels: vector("ancient", "de_ancient_radar_psd"),
    credit: vectorCredit,
    vectorImage: "/maps/ancient.svg",
  },
  {
    ...standard("anubis", "Anubis", "de_anubis_radar_psd", true),
    levels: vector("anubis", "de_anubis_radar_psd"),
    credit: vectorCredit,
    vectorImage: "/maps/anubis.svg",
  },
  {
    ...standard("cache", "Cache", "de_cache_radar_psd", true),
    levels: vector("cache", "de_cache_radar_psd"),
    credit: vectorCredit,
    vectorImage: "/maps/cache.svg",
  },
  {
    ...standard("train", "Train", "de_train_radar_psd"),
    levels: floors("de_train"),
  },
  standard("overpass", "Overpass", "de_overpass_radar_psd"),
  {
    ...standard("vertigo", "Vertigo", "de_vertigo_radar_psd"),
    levels: floors("de_vertigo"),
  },
  {
    ...standard(
      "ancient-night",
      "Ancient · Night",
      "de_ancient_night_radar_psd",
    ),
    gameId: "de_ancient_night",
    mode: "Casual / Retakes",
  },
  {
    ...standard("boulder", "Boulder", "de_boulder_radar_tga"),
    mode: "Community",
    levels: [
      { id: "main", name: "Main", image: radar("de_boulder_radar_tga") },
      {
        id: "higher1",
        name: "Alternate level",
        image: radar("de_boulder_higher1_radar_tga"),
      },
    ],
    note: "The game names the alternate radar higher1; its altitude band is below the default layer.",
  },
  {
    ...standard("fachwerk", "Fachwerk", "de_fachwerk_radar_tga"),
    mode: "Community",
  },
  {
    id: "shelter",
    name: "Shelter",
    gameId: "cs_shelter",
    mode: "Hostage",
    status: "available",
    levels: single("cs_shelter_radar_tga"),
    credit: gameCredit,
  },
  {
    id: "office",
    name: "Office",
    gameId: "cs_office",
    mode: "Hostage",
    status: "available",
    levels: single("cs_office_radar_psd"),
    credit: gameCredit,
  },
  {
    id: "italy",
    name: "Italy",
    gameId: "cs_italy",
    mode: "Hostage",
    status: "available",
    levels: single("cs_italy_radar_psd"),
    credit: gameCredit,
  },
  { ...standard("debris", "Debris", "de_debris_radar_tga"), mode: "Wingman" },
  {
    ...standard("eldorado", "El Dorado", "de_eldorado_radar_tga"),
    mode: "Wingman",
  },
  {
    ...standard("poseidon", "Poseidon", "de_poseidon_radar_tga"),
    mode: "Wingman",
  },
  {
    id: "baggage",
    name: "Baggage",
    gameId: "ar_baggage",
    mode: "Arms Race",
    status: "available",
    levels: floors("ar_baggage"),
    credit: gameCredit,
  },
  {
    id: "shoots",
    name: "Shoots · Day",
    gameId: "ar_shoots",
    mode: "Arms Race",
    status: "available",
    levels: single("ar_shoots_radar_psd"),
    credit: gameCredit,
  },
  {
    id: "shoots-night",
    name: "Shoots · Night",
    gameId: "ar_shoots_night",
    mode: "Arms Race",
    status: "available",
    levels: single("ar_shoots_night_radar_psd"),
    credit: gameCredit,
  },
  {
    id: "pool-day",
    name: "Pool Day",
    gameId: "ar_pool_day",
    mode: "Arms Race",
    status: "available",
    levels: single("ar_pool_day"),
    credit: gameCredit,
    note: "Radar sourced from the 8 May 2025 game extraction; check against the current game before precise practice.",
  },
  {
    id: "complex",
    name: "Complex",
    gameId: "rush_001",
    mode: "Rush",
    status: "available",
    credit: gameCredit,
    note: "Rush selects battle arenas per match. Use the matching arena layer; an overview does not describe a fixed match route.",
    levels: [
      {
        id: "overview",
        name: "Full complex",
        image: radar("rush_001_radar_tga"),
      },
      ...[
        "101",
        "102",
        "103",
        "104",
        "201",
        "202",
        "203",
        "204",
        "205",
        "206",
        "207",
        "208",
        "209",
        "210",
        "211",
        "212",
        "301",
        "401",
      ].map((room) => ({
        id: `room${room}`,
        name: `Arena ${room}`,
        image: radar(`rush_001_room${room}_radar_tga`),
      })),
      {
        id: "roomparty",
        name: "Party arena",
        image: radar("rush_001_roomparty_radar_tga"),
      },
      {
        id: "convoy",
        name: "Convoy arena",
        image: radar("rush_001_convoy_radar_tga"),
      },
    ],
  },
];

export const getMap = (id: string): GameMap =>
  MAPS.find((map) => map.id === id) ?? MAPS[0];

/** Geometry can change with game updates; the catalogue is versioned, not a promise of exact throw compatibility. */
export const MAP_ARTWORK_NOTICE =
  "Game radar artwork belongs to Valve and the respective map creators. Community fan project; not affiliated with Valve.";
