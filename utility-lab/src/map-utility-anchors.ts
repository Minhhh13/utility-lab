import type { UtilityReference } from "./utility-data.ts";
import { projectPublisherDestination } from "./publisher-map-registrations.ts";

/** Pins identify named map areas, never measured grenade landings or effect radii. */
export const CALLOUT_MARKER_NOTE = "Pins identify target callout areas. Watch the guide for the demonstrated landing and coverage.";
export type UtilityAnchorInput = Pick<UtilityReference, "mapId" | "levelId" | "target" | "title" | "from"> & Pick<Partial<UtilityReference>, "source">;
export interface UtilityMapAnchor {
 id:string;mapId:string;levelId:string;label:string;x:number;y:number;aliases:string[];
 sourceCallout:string;sourceUrl:string;registrationId:string;
 /** A later, explicitly reviewed point on the same registered artwork (native pixels). */
 artworkPoint?:[number,number];auditedAt?:string;auditNote?:string;
}

// Evidence polygons, landmark registrations and artwork hashes live in
// data/map-utility-anchor-evidence.ts so they are not shipped in the app bundle.
export const UTILITY_MAP_ANCHORS:UtilityMapAnchor[] = [
  {
    "id": "mirage:main:a-site",
    "mapId": "mirage",
    "levelId": "main",
    "label": "A Site",
    "x": 520.63,
    "y": 781.88,
    "aliases": [
      "a site",
      "a"
    ],
    "sourceCallout": "A Site",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:b-site",
    "mapId": "mirage",
    "levelId": "main",
    "label": "B Site",
    "x": 229.38,
    "y": 285.63,
    "aliases": [
      "b site",
      "b"
    ],
    "sourceCallout": "B Site",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:jungle",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Jungle",
    "x": 444.38,
    "y": 613.13,
    "aliases": [
      "jungle"
    ],
    "sourceCallout": "Jungle",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:mid-window",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Sniper's Nest",
    "x": 395.63,
    "y": 526.88,
    "aliases": [
      "window",
      "mid window",
      "sniper's nest"
    ],
    "sourceCallout": "Sniper's Nest",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:market-window",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Window",
    "x": 236.88,
    "y": 393.13,
    "aliases": [
      "market window",
      "b window",
      "shop window"
    ],
    "sourceCallout": "Window",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:stairs",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Stairs",
    "x": 538.13,
    "y": 641.88,
    "aliases": [
      "stairs",
      "a stairs"
    ],
    "sourceCallout": "Stairs",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:mid",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Mid",
    "x": 668.13,
    "y": 450.63,
    "aliases": [
      "mid",
      "middle"
    ],
    "sourceCallout": "Mid",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:a-ramp",
    "mapId": "mirage",
    "levelId": "main",
    "label": "A Ramp",
    "x": 745.63,
    "y": 640.63,
    "aliases": [
      "a ramp",
      "ramp"
    ],
    "sourceCallout": "A Ramp",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:ticket",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Ticket Booth",
    "x": 454.38,
    "y": 828.13,
    "aliases": [
      "ticket",
      "ticket booth"
    ],
    "sourceCallout": "Ticket Booth",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:connector",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Connector",
    "x": 501.88,
    "y": 526.88,
    "aliases": [
      "connector",
      "con"
    ],
    "sourceCallout": "Connector",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:b-short",
    "mapId": "mirage",
    "levelId": "main",
    "label": "B Short",
    "x": 463.13,
    "y": 299.38,
    "aliases": [
      "b short",
      "short",
      "catwalk"
    ],
    "sourceCallout": "B Short",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:ladder-room",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Ladder Room",
    "x": 413.13,
    "y": 358.13,
    "aliases": [
      "ladder room"
    ],
    "sourceCallout": "Ladder Room",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:a-default",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Default",
    "x": 574.38,
    "y": 761.88,
    "aliases": [
      "default",
      "a default"
    ],
    "sourceCallout": "Default",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:tetris",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Tetris",
    "x": 616.88,
    "y": 621.88,
    "aliases": [
      "tetris"
    ],
    "sourceCallout": "Tetris",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:bench",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Bench",
    "x": 135.63,
    "y": 256.88,
    "aliases": [
      "bench"
    ],
    "sourceCallout": "Bench",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:top-mid",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Top Mid",
    "x": 683.13,
    "y": 419.38,
    "aliases": [
      "top mid"
    ],
    "sourceCallout": "Top Mid",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:a-ct",
    "mapId": "mirage",
    "levelId": "main",
    "label": "CT",
    "x": 433.13,
    "y": 801.88,
    "aliases": [
      "ct"
    ],
    "sourceCallout": "CT",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:ct-spawn",
    "mapId": "mirage",
    "levelId": "main",
    "label": "CT Spawn",
    "x": 305.63,
    "y": 713.13,
    "aliases": [
      "ct spawn"
    ],
    "sourceCallout": "CT Spawn",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:t-spawn",
    "mapId": "mirage",
    "levelId": "main",
    "label": "T Spawn",
    "x": 879.38,
    "y": 346.88,
    "aliases": [
      "t spawn"
    ],
    "sourceCallout": "T Spawn",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:palace",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Palace",
    "x": 642.5,
    "y": 787.5,
    "aliases": [
      "palace"
    ],
    "sourceCallout": "Palace",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:underpass",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Underpass",
    "x": 437.5,
    "y": 412.5,
    "aliases": [
      "underpass"
    ],
    "sourceCallout": "Underpass",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:b-apartments",
    "mapId": "mirage",
    "levelId": "main",
    "label": "B Apartments",
    "x": 312.5,
    "y": 187.5,
    "aliases": [
      "b apartments",
      "b apps",
      "apartments",
      "apps"
    ],
    "sourceCallout": "B Apartments",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "mirage:main:under-balcony",
    "mapId": "mirage",
    "levelId": "main",
    "label": "Balcony",
    "x": 645.63,
    "y": 739.38,
    "aliases": [
      "under balcony"
    ],
    "sourceCallout": "Balcony",
    "sourceUrl": "https://totalcsgo.com/callouts/mirage",
    "registrationId": "mirage-main-totalcs"
  },
  {
    "id": "dust2:main:ct-mid",
    "mapId": "dust2",
    "levelId": "main",
    "label": "CT Mid",
    "x": 413.13,
    "y": 201.88,
    "aliases": [
      "ct mid",
      "ct cross"
    ],
    "sourceCallout": "CT Mid",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:upper-tunnels",
    "mapId": "dust2",
    "levelId": "main",
    "label": "Upper B Tunnels",
    "x": 111.88,
    "y": 453.13,
    "aliases": [
      "upper tunnels",
      "upper b tunnels"
    ],
    "sourceCallout": "Upper B Tunnels",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:lower-tunnels",
    "mapId": "dust2",
    "levelId": "main",
    "label": "Lower B Tunnels",
    "x": 403.13,
    "y": 405.63,
    "aliases": [
      "lower tunnels",
      "lower b tunnels"
    ],
    "sourceCallout": "Lower B Tunnels",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:mid",
    "mapId": "dust2",
    "levelId": "main",
    "label": "Mid",
    "x": 464.38,
    "y": 533.13,
    "aliases": [
      "mid"
    ],
    "sourceCallout": "Mid",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:mid-doors",
    "mapId": "dust2",
    "levelId": "main",
    "label": "Mid Doors",
    "x": 468.13,
    "y": 363.13,
    "aliases": [
      "mid doors"
    ],
    "sourceCallout": "Mid Doors",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:a-long",
    "mapId": "dust2",
    "levelId": "main",
    "label": "A Long",
    "x": 869.38,
    "y": 325.63,
    "aliases": [
      "long a",
      "a long",
      "long"
    ],
    "sourceCallout": "A Long",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:long-doors",
    "mapId": "dust2",
    "levelId": "main",
    "label": "Long Doors",
    "x": 690.63,
    "y": 569.38,
    "aliases": [
      "long doors"
    ],
    "sourceCallout": "Long Doors",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:xbox",
    "mapId": "dust2",
    "levelId": "main",
    "label": "Xbox",
    "x": 480.63,
    "y": 404.38,
    "aliases": [
      "xbox"
    ],
    "sourceCallout": "Xbox",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:b-doors",
    "mapId": "dust2",
    "levelId": "main",
    "label": "B Doors",
    "x": 251.88,
    "y": 226.88,
    "aliases": [
      "b doors"
    ],
    "sourceCallout": "B Doors",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:long-corner",
    "mapId": "dust2",
    "levelId": "main",
    "label": "Long Corner",
    "x": 824.38,
    "y": 453.13,
    "aliases": [
      "long corner"
    ],
    "sourceCallout": "Long Corner",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:a-cross",
    "mapId": "dust2",
    "levelId": "main",
    "label": "A Cross",
    "x": 869.38,
    "y": 244.38,
    "aliases": [
      "a cross"
    ],
    "sourceCallout": "A Cross",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:goose",
    "mapId": "dust2",
    "levelId": "main",
    "label": "Goose",
    "x": 799.38,
    "y": 69.38,
    "aliases": [
      "goose"
    ],
    "sourceCallout": "Goose",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:a-car",
    "mapId": "dust2",
    "levelId": "main",
    "label": "A Car",
    "x": 925.63,
    "y": 234.38,
    "aliases": [
      "a car"
    ],
    "sourceCallout": "A Car",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:short-a",
    "mapId": "dust2",
    "levelId": "main",
    "label": "A Short",
    "x": 634.38,
    "y": 390.63,
    "aliases": [
      "short a",
      "a short",
      "short"
    ],
    "sourceCallout": "A Short",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:b-platform",
    "mapId": "dust2",
    "levelId": "main",
    "label": "B Plat",
    "x": 121.88,
    "y": 133.13,
    "aliases": [
      "b platform",
      "b plat"
    ],
    "sourceCallout": "B Plat",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "dust2:main:a-site",
    "mapId": "dust2",
    "levelId": "main",
    "label": "A Default Plant",
    "x": 808.13,
    "y": 166.88,
    "aliases": [
      "a site",
      "a default"
    ],
    "sourceCallout": "A Default Plant",
    "sourceUrl": "https://totalcsgo.com/callouts/dust2",
    "registrationId": "dust2-main-totalcs"
  },
  {
    "id": "inferno:main:ct-entrance",
    "mapId": "inferno",
    "levelId": "main",
    "label": "CT",
    "x": 603.13,
    "y": 233.13,
    "aliases": [
      "ct entrance"
    ],
    "sourceCallout": "CT",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:banana",
    "mapId": "inferno",
    "levelId": "main",
    "label": "Banana",
    "x": 436.88,
    "y": 495.63,
    "aliases": [
      "banana",
      "top banana"
    ],
    "sourceCallout": "Banana",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:banana-car",
    "mapId": "inferno",
    "levelId": "main",
    "label": "Car",
    "x": 516.88,
    "y": 360.63,
    "aliases": [
      "banana car"
    ],
    "sourceCallout": "Car",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:mid",
    "mapId": "inferno",
    "levelId": "main",
    "label": "Mid",
    "x": 573.13,
    "y": 659.38,
    "aliases": [
      "mid"
    ],
    "sourceCallout": "Mid",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:arch",
    "mapId": "inferno",
    "levelId": "main",
    "label": "Arch",
    "x": 780.63,
    "y": 469.38,
    "aliases": [
      "arch"
    ],
    "sourceCallout": "Arch",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:truck",
    "mapId": "inferno",
    "levelId": "main",
    "label": "Truck",
    "x": 828.13,
    "y": 781.88,
    "aliases": [
      "truck",
      "haycart"
    ],
    "sourceCallout": "Truck",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:new-box",
    "mapId": "inferno",
    "levelId": "main",
    "label": "Quad",
    "x": 434.38,
    "y": 251.88,
    "aliases": [
      "new box"
    ],
    "sourceCallout": "Quad",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:b-site",
    "mapId": "inferno",
    "levelId": "main",
    "label": "B Site",
    "x": 485.63,
    "y": 218.13,
    "aliases": [
      "b site"
    ],
    "sourceCallout": "B Site",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:church",
    "mapId": "inferno",
    "levelId": "main",
    "label": "Construction",
    "x": 583.13,
    "y": 123.13,
    "aliases": [
      "church"
    ],
    "sourceCallout": "Construction",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:pit",
    "mapId": "inferno",
    "levelId": "main",
    "label": "Pit",
    "x": 898.13,
    "y": 825.63,
    "aliases": [
      "pit",
      "big pit"
    ],
    "sourceCallout": "Pit",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:a-site",
    "mapId": "inferno",
    "levelId": "main",
    "label": "A Site",
    "x": 805.63,
    "y": 661.88,
    "aliases": [
      "a site"
    ],
    "sourceCallout": "A Site",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "inferno:main:banana-sandbags",
    "mapId": "inferno",
    "levelId": "main",
    "label": "Sand Bags (B)",
    "x": 588.13,
    "y": 395.63,
    "aliases": [
      "sandbags"
    ],
    "sourceCallout": "Sand Bags (B)",
    "sourceUrl": "https://totalcsgo.com/callouts/inferno",
    "registrationId": "inferno-main-totalcs"
  },
  {
    "id": "nuke:upper:outside",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Outside",
    "x": 639.38,
    "y": 694.38,
    "aliases": [
      "outside",
      "outside crossing"
    ],
    "sourceCallout": "Outside",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:squeaky",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Squeaky",
    "x": 503.13,
    "y": 581.88,
    "aliases": [
      "squeaky",
      "squeaky door"
    ],
    "sourceCallout": "Squeaky",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:a-site",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "A Site",
    "x": 575,
    "y": 506.25,
    "aliases": [
      "a site"
    ],
    "sourceCallout": "A Site",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:hut",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Hut",
    "x": 538.13,
    "y": 554.38,
    "aliases": [
      "hut",
      "top hut"
    ],
    "sourceCallout": "Hut",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:lobby",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Lobby",
    "x": 476.88,
    "y": 533.13,
    "aliases": [
      "lobby"
    ],
    "sourceCallout": "Lobby",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:t-red",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "T Red",
    "x": 594.38,
    "y": 715.63,
    "aliases": [
      "t red"
    ],
    "sourceCallout": "T Red",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:silo",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Silo",
    "x": 494.38,
    "y": 636.88,
    "aliases": [
      "silo"
    ],
    "sourceCallout": "Silo",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:main",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Main",
    "x": 566.88,
    "y": 635.63,
    "aliases": [
      "top main"
    ],
    "sourceCallout": "Main",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:lockers",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Lockers",
    "x": 653.13,
    "y": 501.88,
    "aliases": [
      "locker",
      "lockers"
    ],
    "sourceCallout": "Lockers",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:heaven",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Heaven",
    "x": 661.88,
    "y": 464.38,
    "aliases": [
      "heaven"
    ],
    "sourceCallout": "Heaven",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:a-tetris",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Tetris",
    "x": 566.88,
    "y": 574.38,
    "aliases": [
      "a tetris"
    ],
    "sourceCallout": "Tetris",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:upper:rafters",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Rafters",
    "x": 616.88,
    "y": 445.63,
    "aliases": [
      "rafters"
    ],
    "sourceCallout": "Rafters",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs"
  },
  {
    "id": "nuke:lower:b-site",
    "mapId": "nuke",
    "levelId": "lower",
    "label": "B Site",
    "x": 570.25,
    "y": 547.5,
    "aliases": [
      "b site"
    ],
    "sourceCallout": "B Site",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-lower-totalcs-inset"
  },
  {
    "id": "nuke:lower:b-double-doors",
    "mapId": "nuke",
    "levelId": "lower",
    "label": "Doors",
    "x": 626.5,
    "y": 538.75,
    "aliases": [
      "b double doors",
      "double doors"
    ],
    "sourceCallout": "Doors",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-lower-totalcs-inset"
  },
  {
    "id": "nuke:lower:b-dark",
    "mapId": "nuke",
    "levelId": "lower",
    "label": "Dark",
    "x": 600.88,
    "y": 459.38,
    "aliases": [
      "b dark"
    ],
    "sourceCallout": "Dark",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-lower-totalcs-inset"
  },
  {
    "id": "nuke:lower:decon",
    "mapId": "nuke",
    "levelId": "lower",
    "label": "Decon",
    "x": 509.63,
    "y": 600.63,
    "aliases": [
      "decon"
    ],
    "sourceCallout": "Decon",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-lower-totalcs-inset"
  },
  {
    "id": "ancient:main:b-door",
    "mapId": "ancient",
    "levelId": "main",
    "label": "Doors",
    "x": 783.13,
    "y": 610.63,
    "aliases": [
      "b door"
    ],
    "sourceCallout": "Doors",
    "sourceUrl": "https://totalcsgo.com/callouts/ancient",
    "registrationId": "ancient-main-totalcs"
  },
  {
    "id": "ancient:main:a-ct",
    "mapId": "ancient",
    "levelId": "main",
    "label": "CT Lane",
    "x": 415.63,
    "y": 213.13,
    "aliases": [
      "a ct"
    ],
    "sourceCallout": "CT Lane",
    "sourceUrl": "https://totalcsgo.com/callouts/ancient",
    "registrationId": "ancient-main-totalcs"
  },
  {
    "id": "ancient:main:b-site",
    "mapId": "ancient",
    "levelId": "main",
    "label": "B Site",
    "x": 767.5,
    "y": 407.5,
    "aliases": [
      "b site"
    ],
    "sourceCallout": "B Site",
    "sourceUrl": "https://totalcsgo.com/callouts/ancient",
    "registrationId": "ancient-main-totalcs"
  },
  {
    "id": "ancient:main:a-main",
    "mapId": "ancient",
    "levelId": "main",
    "label": "A Main",
    "x": 149.38,
    "y": 403.13,
    "aliases": [
      "a main"
    ],
    "sourceCallout": "A Main",
    "sourceUrl": "https://totalcsgo.com/callouts/ancient",
    "registrationId": "ancient-main-totalcs"
  },
  {
    "id": "ancient:main:b-ramp",
    "mapId": "ancient",
    "levelId": "main",
    "label": "Ramp",
    "x": 826.88,
    "y": 553.13,
    "aliases": [
      "b ramp",
      "b banana"
    ],
    "sourceCallout": "Ramp",
    "sourceUrl": "https://totalcsgo.com/callouts/ancient",
    "registrationId": "ancient-main-totalcs"
  },
  {
    "id": "ancient:main:elbow",
    "mapId": "ancient",
    "levelId": "main",
    "label": "Elbow",
    "x": 395.63,
    "y": 566.88,
    "aliases": [
      "elbow"
    ],
    "sourceCallout": "Elbow",
    "sourceUrl": "https://totalcsgo.com/callouts/ancient",
    "registrationId": "ancient-main-totalcs"
  },
  {
    "id": "ancient:main:a-site",
    "mapId": "ancient",
    "levelId": "main",
    "label": "A Site",
    "x": 316.88,
    "y": 259.38,
    "aliases": [
      "a site"
    ],
    "sourceCallout": "A Site",
    "sourceUrl": "https://totalcsgo.com/callouts/ancient",
    "registrationId": "ancient-main-totalcs"
  },
  {
    "id": "ancient:main:red",
    "mapId": "ancient",
    "levelId": "main",
    "label": "Red",
    "x": 470,
    "y": 268,
    "aliases": [
      "red room",
      "window / red"
    ],
    "sourceCallout": "Red",
    "sourceUrl": "https://cs2.jzr.uz/maps/ancient",
    "registrationId": "ancient-main-atlas"
  },
  {
    "id": "ancient:main:donut",
    "mapId": "ancient",
    "levelId": "main",
    "label": "Donut",
    "x": 274,
    "y": 456,
    "aliases": [
      "a donut",
      "mid donut"
    ],
    "sourceCallout": "Donut",
    "sourceUrl": "https://cs2.jzr.uz/maps/ancient",
    "registrationId": "ancient-main-atlas"
  },
  {
    "id": "ancient:main:mid",
    "mapId": "ancient",
    "levelId": "main",
    "label": "Mid",
    "x": 479.3,
    "y": 552.5,
    "aliases": [
      "mid"
    ],
    "sourceCallout": "Mid",
    "sourceUrl": "https://cs2.jzr.uz/maps/ancient",
    "registrationId": "ancient-main-atlas"
  },
  {
    "id": "ancient:main:cave",
    "mapId": "ancient",
    "levelId": "main",
    "label": "Cave",
    "x": 668.6,
    "y": 399.6,
    "aliases": [
      "cave"
    ],
    "sourceCallout": "Cave",
    "sourceUrl": "https://cs2.jzr.uz/maps/ancient",
    "registrationId": "ancient-main-atlas"
  },
  {
    "id": "ancient:main:b-short",
    "mapId": "ancient",
    "levelId": "main",
    "label": "Short",
    "x": 708,
    "y": 330,
    "aliases": [
      "b short"
    ],
    "sourceCallout": "Short",
    "sourceUrl": "https://cs2.jzr.uz/maps/ancient",
    "registrationId": "ancient-main-atlas"
  },
  {
    "id": "ancient:main:b-long",
    "mapId": "ancient",
    "levelId": "main",
    "label": "Long",
    "x": 819.82,
    "y": 340,
    "artworkPoint": [
      839.5,
      348.16
    ],
    "auditedAt": "2026-11-10",
    "auditNote": "Centre of the displayed Long corridor between native x823.5 and x855.5, rather than seven pixels from its outer wall. The new point remains inside the original published Long polygon.",
    "aliases": [
      "b long"
    ],
    "sourceCallout": "Long",
    "sourceUrl": "https://cs2.jzr.uz/maps/ancient",
    "registrationId": "ancient-main-atlas"
  },
  {
    "id": "anubis:main:a-main",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Main",
    "x": 831.1,
    "y": 423.71,
    "aliases": [
      "a main"
    ],
    "sourceCallout": "Main",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:b-site",
    "mapId": "anubis",
    "levelId": "main",
    "label": "B Site",
    "x": 338.83,
    "y": 498.36,
    "aliases": [
      "b site"
    ],
    "sourceCallout": "B Site",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:cave",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Cave",
    "x": 371.6,
    "y": 327.66,
    "aliases": [
      "cave"
    ],
    "sourceCallout": "Cave",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:e-box",
    "mapId": "anubis",
    "levelId": "main",
    "label": "E Box",
    "x": 392.92,
    "y": 563.16,
    "aliases": [
      "e-box",
      "e box",
      "connector"
    ],
    "sourceCallout": "E Box",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:a-heaven",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Heaven",
    "x": 706.05,
    "y": 206.56,
    "aliases": [
      "a heaven"
    ],
    "sourceCallout": "Heaven",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:a-platform",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Plateau",
    "x": 692.3,
    "y": 357.11,
    "aliases": [
      "a platform"
    ],
    "sourceCallout": "Plateau",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:a-site",
    "mapId": "anubis",
    "levelId": "main",
    "label": "A Site",
    "x": 750,
    "y": 290,
    "aliases": [
      "a site"
    ],
    "sourceCallout": "A Site",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:water",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Water",
    "x": 568.4,
    "y": 585.16,
    "aliases": [
      "water",
      "canal"
    ],
    "sourceCallout": "Water",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:b-main",
    "mapId": "anubis",
    "levelId": "main",
    "label": "B Long",
    "x": 209.96,
    "y": 612.92,
    "aliases": [
      "b main"
    ],
    "sourceCallout": "B Long",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:b-ninja",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Ninja",
    "x": 402.08,
    "y": 517.15,
    "aliases": [
      "b ninja"
    ],
    "sourceCallout": "Ninja",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:bridge",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Bridge",
    "x": 502.61,
    "y": 592.39,
    "aliases": [
      "bridge"
    ],
    "sourceCallout": "Bridge",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:pillar",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Pillar",
    "x": 289.41,
    "y": 561.1,
    "aliases": [
      "pillar"
    ],
    "sourceCallout": "Pillar",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:b-temple",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Palace",
    "x": 358.75,
    "y": 411.25,
    "aliases": [
      "b temple"
    ],
    "sourceCallout": "Palace",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:mid-temple",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Palace",
    "x": 483.75,
    "y": 401.25,
    "aliases": [
      "mid temple"
    ],
    "sourceCallout": "Palace",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "anubis:main:b-ct",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Street",
    "x": 292.5,
    "y": 437.5,
    "aliases": [
      "b ct"
    ],
    "sourceCallout": "Street",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs"
  },
  {
    "id": "cache:main:z",
    "mapId": "cache",
    "levelId": "main",
    "label": "CT Connector",
    "x": 275.63,
    "y": 546.88,
    "aliases": [
      "connector / z",
      "z"
    ],
    "sourceCallout": "CT Connector",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:a-main",
    "mapId": "cache",
    "levelId": "main",
    "label": "A Main",
    "x": 475.63,
    "y": 250.63,
    "aliases": [
      "a main"
    ],
    "sourceCallout": "A Main",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:mid",
    "mapId": "cache",
    "levelId": "main",
    "label": "Mid",
    "x": 354.38,
    "y": 545.63,
    "aliases": [
      "mid"
    ],
    "sourceCallout": "Mid",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:forklift",
    "mapId": "cache",
    "levelId": "main",
    "label": "Forklift",
    "x": 399.38,
    "y": 320.63,
    "aliases": [
      "forklift"
    ],
    "sourceCallout": "Forklift",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:whitebox",
    "mapId": "cache",
    "levelId": "main",
    "label": "White Box",
    "x": 353.13,
    "y": 498.13,
    "aliases": [
      "whitebox"
    ],
    "sourceCallout": "White Box",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:boost",
    "mapId": "cache",
    "levelId": "main",
    "label": "Boost",
    "x": 515.63,
    "y": 461.88,
    "aliases": [
      "boost"
    ],
    "sourceCallout": "Boost",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:b-main",
    "mapId": "cache",
    "levelId": "main",
    "label": "B Main",
    "x": 435.63,
    "y": 718.13,
    "aliases": [
      "b main"
    ],
    "sourceCallout": "B Main",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:garage",
    "mapId": "cache",
    "levelId": "main",
    "label": "Garage",
    "x": 556.88,
    "y": 548.13,
    "aliases": [
      "garage"
    ],
    "sourceCallout": "Garage",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:b-tree",
    "mapId": "cache",
    "levelId": "main",
    "label": "Tree",
    "x": 171.88,
    "y": 744.38,
    "aliases": [
      "b tree"
    ],
    "sourceCallout": "Tree",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:b-heaven",
    "mapId": "cache",
    "levelId": "main",
    "label": "Heaven",
    "x": 261.88,
    "y": 623.13,
    "aliases": [
      "b heaven"
    ],
    "sourceCallout": "Heaven",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:highway",
    "mapId": "cache",
    "levelId": "main",
    "label": "Highway",
    "x": 324.38,
    "y": 468.13,
    "aliases": [
      "highway"
    ],
    "sourceCallout": "Highway",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:sandbags",
    "mapId": "cache",
    "levelId": "main",
    "label": "Sand Bags",
    "x": 361.88,
    "y": 584.38,
    "aliases": [
      "sandbags"
    ],
    "sourceCallout": "Sand Bags",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:vents",
    "mapId": "cache",
    "levelId": "main",
    "label": "Vents",
    "x": 450,
    "y": 600,
    "aliases": [
      "vents"
    ],
    "sourceCallout": "Vents",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:a-site",
    "mapId": "cache",
    "levelId": "main",
    "label": "A Site",
    "x": 312.5,
    "y": 275,
    "aliases": [
      "a site"
    ],
    "sourceCallout": "A Site",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:b-site",
    "mapId": "cache",
    "levelId": "main",
    "label": "B Site",
    "x": 359.38,
    "y": 796.88,
    "aliases": [
      "b site"
    ],
    "sourceCallout": "B Site",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:a-default",
    "mapId": "cache",
    "levelId": "main",
    "label": "A Default",
    "x": 344.38,
    "y": 253.13,
    "aliases": [
      "a default"
    ],
    "sourceCallout": "A Default",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:sunroom",
    "mapId": "cache",
    "levelId": "main",
    "label": "Sun Room",
    "x": 540.63,
    "y": 815.63,
    "aliases": [
      "sunroom / toxic"
    ],
    "sourceCallout": "Sun Room",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:b-default",
    "mapId": "cache",
    "levelId": "main",
    "label": "B Default",
    "x": 325.63,
    "y": 781.88,
    "aliases": [
      "b default"
    ],
    "sourceCallout": "B Default",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:quad",
    "mapId": "cache",
    "levelId": "main",
    "label": "Quad",
    "x": 296.88,
    "y": 194.38,
    "aliases": [
      "quad"
    ],
    "sourceCallout": "Quad",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:headshot",
    "mapId": "cache",
    "levelId": "main",
    "label": "Headshot",
    "x": 290.63,
    "y": 780.63,
    "aliases": [
      "headshot"
    ],
    "sourceCallout": "Headshot",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "cache:main:squeaky",
    "mapId": "cache",
    "levelId": "main",
    "label": "Squeaky",
    "x": 521.88,
    "y": 194.38,
    "aliases": [
      "squeaky"
    ],
    "sourceCallout": "Squeaky",
    "sourceUrl": "https://totalcsgo.com/callouts/cache",
    "registrationId": "cache-main-totalcs"
  },
  {
    "id": "vertigo:upper:a-site",
    "mapId": "vertigo",
    "levelId": "upper",
    "label": "A Site",
    "x": 704.1,
    "y": 583.98,
    "aliases": [
      "a site",
      "a default",
      "default"
    ],
    "sourceCallout": "A Site",
    "sourceUrl": "https://totalcsgo.com/callouts/vertigo",
    "registrationId": "vertigo-upper-totalcs-landmarks"
  },
  {
    "id": "vertigo:upper:b-site",
    "mapId": "vertigo",
    "levelId": "upper",
    "label": "B Site",
    "x": 221.68,
    "y": 236.33,
    "aliases": [
      "b site",
      "b default"
    ],
    "sourceCallout": "B Site",
    "sourceUrl": "https://totalcsgo.com/callouts/vertigo",
    "registrationId": "vertigo-upper-totalcs-landmarks"
  },
  {
    "id": "vertigo:upper:mid",
    "mapId": "vertigo",
    "levelId": "upper",
    "label": "Mid",
    "x": 366.21,
    "y": 472.66,
    "aliases": [
      "mid"
    ],
    "sourceCallout": "Mid",
    "sourceUrl": "https://totalcsgo.com/callouts/vertigo",
    "registrationId": "vertigo-upper-totalcs-landmarks"
  },
  {
    "id": "vertigo:upper:b-stairs",
    "mapId": "vertigo",
    "levelId": "upper",
    "label": "Stairs",
    "x": 209.96,
    "y": 427.73,
    "aliases": [
      "b stairs"
    ],
    "sourceCallout": "Stairs",
    "sourceUrl": "https://totalcsgo.com/callouts/vertigo",
    "registrationId": "vertigo-upper-totalcs-landmarks"
  },
  {
    "id": "vertigo:upper:a-ramp",
    "mapId": "vertigo",
    "levelId": "upper",
    "label": "A Ramp",
    "x": 696.29,
    "y": 724.61,
    "aliases": [
      "a ramp",
      "top ramp"
    ],
    "sourceCallout": "A Ramp",
    "sourceUrl": "https://totalcsgo.com/callouts/vertigo",
    "registrationId": "vertigo-upper-totalcs-landmarks"
  },
  {
    "id": "vertigo:upper:sandbags",
    "mapId": "vertigo",
    "levelId": "upper",
    "label": "Sand Bags",
    "x": 726.56,
    "y": 765.63,
    "aliases": [
      "sandbags"
    ],
    "sourceCallout": "Sand Bags",
    "sourceUrl": "https://totalcsgo.com/callouts/vertigo",
    "registrationId": "vertigo-upper-totalcs-landmarks"
  },
  {
    "id": "nuke:upper:mustang",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Mustang",
    "x": 524.3,
    "y": 486.44,
    "aliases": [
      "mustang"
    ],
    "sourceCallout": "Mustang",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs",
    "auditedAt": "2026-11-10",
    "auditNote": "Original Result shows fire along the elevated A-side catwalk directly above the Hut exit, next to the yellow bridge and opposite the A-site silos. This matches the separate Mustang region, not the northern Rafters anchor."
  },
  {
    "id": "nuke:upper:secret",
    "mapId": "nuke",
    "levelId": "upper",
    "label": "Secret",
    "x": 675.8,
    "y": 723.75,
    "aliases": [
      "secret"
    ],
    "sourceCallout": "Secret",
    "sourceUrl": "https://totalcsgo.com/callouts/nuke",
    "registrationId": "nuke-upper-totalcs",
    "auditedAt": "2026-11-10",
    "auditNote": "Original Result shows the Outside doorway, upper Secret landing and first descending stairs beside the B-arrow sign. The named upper Secret entrance is defensible; it is not the lower Tunnels/Decon room."
  },
  {
    "id": "anubis:main:t-stairs",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Stairs",
    "x": 675.38,
    "y": 654.55,
    "aliases": [
      "t stairs"
    ],
    "sourceCallout": "Stairs",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs",
    "auditedAt": "2026-11-10",
    "auditNote": "Original Result shows the HE at the building/window beside the T-side descending steps. Total CS explicitly lists T Stairs as an alias of the separate Stairs region leading from Alley toward Canal. This is separate from the short Bridge/Double Doors stairs."
  },
  {
    "id": "anubis:main:mid-doors",
    "mapId": "anubis",
    "levelId": "main",
    "label": "Double Doors",
    "x": 560.53,
    "y": 519.05,
    "aliases": [
      "mid doors",
      "double doors"
    ],
    "sourceCallout": "Double Doors",
    "sourceUrl": "https://totalcsgo.com/callouts/anubis",
    "registrationId": "anubis-main-totalcs",
    "auditedAt": "2026-11-10",
    "auditNote": "Original Result shows one fire patch at the foot of the adjacent window and open wooden double door, with the small stair approach in front. This can bind this exact guide to the Double Doors area. Do not generally alias arbitrary composite Mid Doors/Window targets or average different destinations."
  }
];

const normalize = (value:string):string => value.trim().toLowerCase().replace(/’/g, "'").replace(/\s+/g, " ");

/** Conservative exact aliases only. Unknown/ambiguous/floor-mismatched targets stay off the map. */
export function resolveUtilityAnchor(guide: UtilityAnchorInput):UtilityMapAnchor|null {
 // Its original Result shows one fire patch at the adjacent window/door foot.
 // This exact-source review does not make arbitrary composite targets aliases.
 if(guide.mapId==="anubis"&&guide.levelId==="main"&&
    guide.source==="https://gonade.app/nade/anubis-mid-doorswindow-from-ruins-molotov"&&
    normalize(guide.target)==="mid doors/window")
   return UTILITY_MAP_ANCHORS.find(anchor=>anchor.id==="anubis:main:mid-doors")??null;
 let target=normalize(guide.target);
 // The original Dust II source places this throw in Bombsite-A and shows
 // the Long standing reference. A bare "Car" remains ambiguous elsewhere.
 if(guide.mapId==="dust2"&&guide.levelId==="main"&&target==="car"&&
    /\blong\b/i.test(guide.from)&&/\bcar\b/i.test(guide.title)) target="a car";
 return UTILITY_MAP_ANCHORS.find(a=>a.mapId===guide.mapId&&a.levelId===guide.levelId&&a.aliases.some(alias=>normalize(alias)===target))??null;
}

/** Register bundled content only. User-authored coordinates belong to the user. */
export function applyRegisteredUtilityAnchor<T extends UtilityReference>(guide:T):T {
 if(guide.userCreated)return guide;
 const destination=projectPublisherDestination(guide);
 if(destination)return {...guide,...destination,showMarker:true,markerBasis:"callout-area"};
 const anchor=resolveUtilityAnchor(guide);
 return anchor?{...guide,x:anchor.x,y:anchor.y,showMarker:true,markerBasis:"callout-area"}:{...guide,showMarker:false};
}
