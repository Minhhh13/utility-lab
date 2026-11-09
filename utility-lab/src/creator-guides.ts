/**
 * Source-linked CS2 examples, opened at chapters supplied by the creator.
 * Radar markers are illustrative navigation aids, not measured landing points.
 * See docs/lineup-sources.md for publication dates and verification limits.
 */
export type CreatorGuide = {
  id: string;
  mapId: string;
  levelId: string;
  side: "T" | "CT";
  type: "Smoke" | "Flash" | "Molotov" | "HE";
  title: string;
  from: string;
  target: string;
  purpose: string;
  throwType: string;
  steps: string[];
  x: number;
  y: number;
  userCreated: false;
  videoUrl: string;
  videoStart: number;
  creator: string;
  source: string;
};

type GuideDetails = Pick<
  CreatorGuide,
  "id" | "mapId" | "side" | "title" | "from" | "target" | "x" | "y"
> & { videoId: string; start: number; levelId?: string; published: string };

function smokeGuide(details: GuideDetails): CreatorGuide {
  const videoUrl = `https://www.youtube.com/watch?v=${details.videoId}`;
  return {
    id: details.id,
    mapId: details.mapId,
    levelId: details.levelId ?? "main",
    side: details.side,
    type: "Smoke",
    title: details.title,
    from: details.from,
    target: details.target,
    purpose: `Creator demonstration published ${details.published}. Map marker is illustrative; current geometry has not been independently verified.`,
    throwType: "Follow the video inputs",
    steps: [
      "Play the creator guide at the selected chapter.",
      "Match the standing position and crosshair shown in the video.",
      "Follow the demonstrated mouse buttons, movement, jump and release. Both buttons means LMB + RMB, not the mouse wheel.",
      "Try the throw in practice and check the landing on your current map version.",
    ],
    x: details.x,
    y: details.y,
    userCreated: false,
    videoUrl,
    videoStart: details.start,
    creator: "NartOutHere",
    source: videoUrl,
  };
}

export const CREATOR_GUIDES: CreatorGuide[] = [
  smokeGuide({
    id: "creator-mirage-t-jungle",
    mapId: "mirage",
    side: "T",
    title: "Jungle smoke",
    from: "A ramp",
    target: "Jungle",
    x: 675,
    y: 400,
    videoId: "MJ-dtTYTUS8",
    start: 280,
    published: "20 May 2025",
  }),
  smokeGuide({
    id: "creator-mirage-ct-palace",
    mapId: "mirage",
    side: "CT",
    title: "Palace smoke",
    from: "Ticket",
    target: "Palace",
    x: 865,
    y: 460,
    videoId: "MJ-dtTYTUS8",
    start: 459,
    published: "20 May 2025",
  }),
  smokeGuide({
    id: "creator-dust2-t-mid-b",
    mapId: "dust2",
    side: "T",
    title: "Mid to B smoke",
    from: "Catwalk",
    target: "CT mid",
    x: 460,
    y: 425,
    videoId: "HY85NcZMrAg",
    start: 104,
    published: "28 February 2026",
  }),
  smokeGuide({
    id: "creator-dust2-ct-tunnels",
    mapId: "dust2",
    side: "CT",
    title: "B tunnels smoke",
    from: "B window",
    target: "Upper tunnels",
    x: 300,
    y: 420,
    videoId: "HY85NcZMrAg",
    start: 377,
    published: "28 February 2026",
  }),
  smokeGuide({
    id: "creator-inferno-t-ct",
    mapId: "inferno",
    side: "T",
    title: "CT entrance smoke",
    from: "Stairs",
    target: "CT entrance",
    x: 315,
    y: 245,
    videoId: "eljDZdMTPzs",
    start: 175,
    published: "20 October 2025",
  }),
  smokeGuide({
    id: "creator-inferno-ct-halfwall",
    mapId: "inferno",
    side: "CT",
    title: "Halfwall smoke",
    from: "Coffins",
    target: "Banana halfwall",
    x: 365,
    y: 395,
    videoId: "eljDZdMTPzs",
    start: 400,
    published: "20 October 2025",
  }),
  smokeGuide({
    id: "creator-nuke-t-outside",
    mapId: "nuke",
    levelId: "upper",
    side: "T",
    title: "Outside smoke wall",
    from: "Yard",
    target: "Outside crossing",
    x: 680,
    y: 600,
    videoId: "Fp14IZIHJVQ",
    start: 102,
    published: "24 July 2024",
  }),
  smokeGuide({
    id: "creator-nuke-ct-door",
    mapId: "nuke",
    levelId: "upper",
    side: "CT",
    title: "Door smoke",
    from: "Heaven",
    target: "Squeaky door",
    x: 605,
    y: 510,
    videoId: "Fp14IZIHJVQ",
    start: 527,
    published: "24 July 2024",
  }),
  smokeGuide({
    id: "creator-ancient-t-red",
    mapId: "ancient",
    side: "T",
    title: "Red room smoke",
    from: "Elbow",
    target: "Red room",
    x: 515,
    y: 350,
    videoId: "xEhS-AmIzIw",
    start: 58,
    published: "11 November 2025",
  }),
  smokeGuide({
    id: "creator-ancient-ct-door",
    mapId: "ancient",
    side: "CT",
    title: "B door smoke",
    from: "CT spawn",
    target: "B door",
    x: 795,
    y: 490,
    videoId: "xEhS-AmIzIw",
    start: 424,
    published: "11 November 2025",
  }),
  smokeGuide({
    id: "creator-anubis-t-camera",
    mapId: "anubis",
    side: "T",
    title: "A camera smoke",
    from: "A main",
    target: "A camera",
    x: 340,
    y: 290,
    videoId: "588UtJa98F0",
    start: 251,
    published: "12 January 2026",
  }),
  smokeGuide({
    id: "creator-anubis-ct-a-main",
    mapId: "anubis",
    side: "CT",
    title: "A main smoke",
    from: "CT",
    target: "A main",
    x: 285,
    y: 490,
    videoId: "588UtJa98F0",
    start: 257,
    published: "12 January 2026",
  }),
  smokeGuide({
    id: "creator-cache-t-connector",
    mapId: "cache",
    side: "T",
    title: "Connector smoke",
    from: "T spawn",
    target: "Connector / Z",
    x: 550,
    y: 390,
    videoId: "eI6EnqTgi0E",
    start: 10,
    published: "19 July 2026",
  }),
  smokeGuide({
    id: "creator-cache-ct-a-main",
    mapId: "cache",
    side: "CT",
    title: "A main smoke",
    from: "See standing position in video",
    target: "A main",
    x: 815,
    y: 510,
    videoId: "eI6EnqTgi0E",
    start: 295,
    published: "19 July 2026",
  }),
  smokeGuide({
    id: "creator-vertigo-t-ivy",
    mapId: "vertigo",
    levelId: "upper",
    side: "T",
    title: "Ivy smoke",
    from: "Stairs",
    target: "Ivy",
    x: 690,
    y: 430,
    videoId: "CR3cNNTPQs0",
    start: 102,
    published: "7 August 2024",
  }),
  smokeGuide({
    id: "creator-vertigo-ct-ramp",
    mapId: "vertigo",
    levelId: "upper",
    side: "CT",
    title: "Ramp waterfall smoke",
    from: "Sandbags",
    target: "A ramp",
    x: 780,
    y: 580,
    videoId: "CR3cNNTPQs0",
    start: 420,
    published: "7 August 2024",
  }),
];
