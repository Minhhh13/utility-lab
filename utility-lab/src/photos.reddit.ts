import type { UtilityReference } from "./utility-data";

export type RedditPhotoEmbed = {
  provider: "reddit";
  postUrl: string;
  embedUrl: string;
  height?: number;
};
export type RedditPhotoGuide = UtilityReference & {
  photoEmbed: RedditPhotoEmbed;
};

/** URLs returned by Reddit oEmbed are rendered by the provider's widgets.js as
 * this allowlisted iframe. No third-party HTML is evaluated or injected here.
 * Keep the complete Reddit presentation, creator attribution and source link.
 * This is an online embed permission, never an offline image-copy license.
 */
function redditPhoto(postUrl: string): RedditPhotoEmbed {
  return {
    provider: "reddit",
    postUrl,
    embedUrl:
      `https://embed.reddit.com${new URL(postUrl).pathname}` +
      "?embed=true&ref_source=embed&ref=share&utm_medium=widgets&utm_source=embedv2&utm_term=23&utm_name=post_embed",
    height: 500,
  };
}

const shared = {
  levelId: "main",
  type: "Smoke",
  site: "Mid",
  x: 500,
  y: 500,
  showMarker: false,
  userCreated: false,
  photos: [] as NonNullable<UtilityReference["photos"]>,
} as const;

const infernoPost =
  "https://www.reddit.com/r/cs2/comments/1lkgx2s/inferno_instant_smokes_ct_to_lower_mid/";
const stairsPost =
  "https://www.reddit.com/r/cs2/comments/1lkboof/anubis_instant_smokes_ct_to_stairs_cheatsheet/";
const midPost =
  "https://www.reddit.com/r/cs2/comments/1llubl1/anubis_instant_smoke_ct_to_mid_cheatsheet/";
const housePost =
  "https://www.reddit.com/r/GlobalOffensive/comments/1ard0jk/anubis_house_aka_window_instant_smoke_cheat_sheet/";

/** One row per original photographic guide, preserving its complete panel or
 * gallery. A multi-spawn sheet is not counted as several independently reviewed
 * current-game lineups. Inputs absent from source text are not guessed.
 */
export const REDDIT_PHOTO_LINEUPS: RedditPhotoGuide[] = [
  {
    ...shared,
    id: "reddit-inferno-biio-ct-lower-mid",
    mapId: "inferno",
    side: "CT",
    title: "Lower mid smoke · six-spawn photo guide",
    from: "CT spawn · numbered positions 1–6",
    target: "Lower mid",
    creator: "u/biio1337",
    source: infernoPost,
    purpose:
      "Original creator photo gallery for six CT-spawn approaches to lower mid. Published 25 June 2025; source geometry and inputs need checking on the current map. This is a complete hosted source guide, not six independently verified app lineups.",
    throwType: "Jump / W + Jump · varies by spawn",
    tags: ["Photo guide", "Online", "Spawn specific", "Source: June 2025"],
    steps: [
      "Load the original Reddit gallery. Its first slide identifies the six spawn positions; match your position to the corresponding numbered aim slide.",
      "The author's text specifies W + jump throw for spawns 1, 3, 4, 5 and 6. Use that spawn's own aim reference.",
      "Spawn 2 has conflicting source labels: the post text says jump throw, while its gallery caption says W. Inspect the original panel and confirm the movement before using this variant.",
      "Mouse-button detail is not established by the post text. Read the selected source photo rather than assuming a button or reusing another spawn's input.",
    ],
    photoEmbed: redditPhoto(infernoPost),
  },
  {
    ...shared,
    id: "reddit-anubis-vien-ct-stairs",
    mapId: "anubis",
    side: "CT",
    title: "Stairs smoke · CT-spawn photo sheet",
    from: "CT spawn · source positions 1–4",
    target: "T stairs",
    creator: "u/Vien78",
    source: stairsPost,
    purpose:
      "Creator's numbered standing and aim photo sheet for CT-to-stairs instant smokes. Published 25 June 2025, before later Anubis changes; treat it as a dated source reference until checked on the current geometry.",
    throwType: "Read the selected source panel",
    tags: ["Photo guide", "Online", "Spawn specific", "Source: June 2025"],
    steps: [
      "Load the complete source sheet and match a numbered CT spawn to its own aim reference.",
      "Use only source positions 1–4. The author explicitly marks source position 0 as unusable.",
      "Read the movement, mouse buttons and release instructions in the matching photo panel. The source post text does not establish those inputs, so none are inferred here.",
      "Check the photo's map geometry and landing before relying on this 2025 guide. No precise app-map marker or current-build result is asserted.",
    ],
    photoEmbed: redditPhoto(stairsPost),
  },
  {
    ...shared,
    id: "reddit-anubis-vien-ct-mid",
    mapId: "anubis",
    side: "CT",
    title: "Mid smoke · CT-spawn photo gallery",
    from: "CT spawn · numbered positions and standard setup",
    target: "Mid",
    creator: "u/Vien78",
    source: midPost,
    purpose:
      "Original two-slide guide: numbered instant-smoke setups and a separate standard lineup. Published 27 June 2025, before later Anubis changes; current geometry and throw success are unverified.",
    throwType: "Read the selected source panel",
    tags: ["Photo guide", "Online", "Spawn specific", "Source: June 2025"],
    steps: [
      "The original gallery has an Instant Smokes slide and a separate Standard Lineup slide. Choose one setup and keep its standing position, aim and input together.",
      "For an instant variant, match the numbered source spawn to that variant's aim reference. The post supplies five source positions, numbered 1–5.",
      "Read the movement and button instructions in that panel. They are not specified in the post text and are not substituted with a guessed default.",
      "The author describes this as complementary to the stairs sheet. Each is a different target; do not interchange their aim references.",
    ],
    photoEmbed: redditPhoto(midPost),
  },
  {
    ...shared,
    id: "reddit-anubis-markfoged-t-house",
    mapId: "anubis",
    side: "T",
    title: "House / Window smoke · dated T-spawn sheet",
    from: "T spawn · source positions 1–5",
    target: "Mid House / Window opening",
    creator: "u/markfoged",
    source: housePost,
    purpose:
      "Author's original CS2 five-spawn photo sheet for the opening ahead of T-side mid. Published 15 February 2024. This older guide predates later Anubis changes and is retained as a clearly dated source reference, without a current-geometry claim.",
    throwType: "Read the selected source panel",
    tags: ["Photo guide", "Online", "Spawn specific", "Source: February 2024"],
    steps: [
      "Read the numbered standing and aim references in the complete original sheet. Use the same number for both.",
      "The author clarifies that House / Window is the opening straight ahead from T-side mid, parallel with the double doors; it is not the A-site window callout.",
      "Read the selected panel's movement and mouse-button instruction; the app does not invent a release frame or input timing.",
      "Compare the current map geometry before using this February 2024 source. Numbered positions and aim references may have changed since publication.",
    ],
    photoEmbed: redditPhoto(housePost),
  },
];

export const REDDIT_PHOTO_SOURCES = [
  { postUrl: infernoPost, creator: "u/biio1337", publishedAt: "2025-06-25", media: "gallery" },
  { postUrl: stairsPost, creator: "u/Vien78", publishedAt: "2025-06-25", media: "image" },
  { postUrl: midPost, creator: "u/Vien78", publishedAt: "2025-06-27", media: "gallery" },
  { postUrl: housePost, creator: "u/markfoged", publishedAt: "2024-02-15", media: "image" },
] as const;
