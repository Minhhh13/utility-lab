export const UTILITY_TYPES = ["Smoke", "Flash", "Molotov", "HE"] as const;
export type UtilityType = (typeof UTILITY_TYPES)[number];
export type UtilityPhotoRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
};
export type UtilityPhoto = {
  image: string;
  caption: string;
  kind?: "position" | "aim" | "release" | "landing" | "context";
  creator?: string;
  source?: string;
  license?: string;
  licenseUrl?: string;
  capturedAt?: string;
  gameBuild?: string;
  annotationId?: string;
  /** A labelled panel of the unchanged source image, in source pixels. */
  region?: UtilityPhotoRegion;
  /** Source-confirmed crosshair point, normalized against the full original image. */
  aimPoint?: { x: number; y: number };
};
export const isBundledPhoto = (value: string): boolean =>
  /^\/lineup-media\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp)$/.test(value);
export type UtilityVideo =
  | { kind: "youtube"; id: string; url: string; start: number }
  | { kind: "file"; url: string; start: number };
export type UtilityPhotoEmbed = {
  provider: "reddit" | "gonade" | "csnades" | "cs2tricks" | "lineupspro";
  postUrl: string;
  embedUrl: string;
  height?: number;
};
export function validatePhotoEmbed(value: unknown): UtilityPhotoEmbed | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (
    !["reddit", "gonade", "csnades", "cs2tricks", "lineupspro"].some(
      (provider) => item.provider === provider,
    ) ||
    typeof item.postUrl !== "string" ||
    typeof item.embedUrl !== "string" ||
    item.postUrl.length > 2000 ||
    item.embedUrl.length > 2500
  )
    return null;
  try {
    const post = new URL(item.postUrl),
      embed = new URL(item.embedUrl);
    if (item.provider !== "reddit") {
      const allowed =
        item.provider === "gonade"
          ? {
              origin: "https://gonade.app",
              path: /^\/nade\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
            }
          : item.provider === "csnades"
            ? {
                origin: "https://csnades.gg",
                path: /^\/(mirage|dust2|inferno|nuke|ancient|anubis|cache|vertigo)\/(smokes|flashes|molotovs|grenades)\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
              }
            : item.provider === "lineupspro"
              ? {
                  origin: "https://lineups.pro",
                  path: /^\/cache\/[a-z0-9]{6}$/,
                }
              : {
                  origin: "https://www.cs2tricks.com",
                  path: /^\/nades\/(mirage|dust2|inferno|nuke|ancient|anubis|cache|vertigo)\/(smokes|flashes|molotovs|grenades)\/[a-z0-9]+(?:-[a-z0-9]+)*$/,
                };
      if (
        post.origin !== allowed.origin ||
        embed.href !== post.href ||
        post.username ||
        post.password ||
        post.search ||
        post.hash ||
        !allowed.path.test(post.pathname)
      )
        return null;
    } else if (
      post.protocol !== "https:" ||
      !["www.reddit.com", "reddit.com"].includes(post.hostname) ||
      post.username ||
      post.password ||
      !/^\/r\/[a-zA-Z0-9_]+\/comments\/[a-zA-Z0-9]+\//.test(post.pathname) ||
      embed.origin !== "https://embed.reddit.com" ||
      embed.username ||
      embed.password ||
      embed.pathname !== post.pathname
    )
      return null;
    if (
      item.height !== undefined &&
      (typeof item.height !== "number" ||
        !Number.isFinite(item.height) ||
        item.height < 200 ||
        item.height > 5000)
    )
      return null;
    return {
      provider: item.provider as UtilityPhotoEmbed["provider"],
      postUrl: post.href,
      embedUrl: embed.href,
      ...(typeof item.height === "number" ? { height: item.height } : {}),
    };
  } catch {
    return null;
  }
}
export type UtilityReference = {
  id: string;
  mapId: string;
  levelId: string;
  side: "T" | "CT";
  type: UtilityType;
  title: string;
  from: string;
  target: string;
  purpose: string;
  throwType: string;
  steps: string[];
  x: number;
  y: number;
  userCreated: boolean;
  image?: string;
  source?: string;
  videoUrl?: string;
  /** The same source guide's alternate player, used if its direct clip fails. */
  videoFallbackUrl?: string;
  videoStart?: number;
  photos?: UtilityPhoto[];
  /** Original online reference images, displayed directly in our gallery. */
  remotePhotos?: UtilityPhoto[];
  creator?: string;
  showMarker?: boolean;
  markerBasis?: "callout-area";
  /** Publisher destination point, in its audited 1000-unit radar frame. */
  markerSource?: { registrationId: string; destinationId: string; x: number; y: number };
  /** Numbering belongs to this publisher's spawn sheet, not a universal map order. */
  spawn?: { family: string; slot: number; total: number; label: string };
  /** A source-confirmed coverage qualifier within the same named target area. */
  landingVariant?: string;
  /** Reviewed existing callout family; source coordinates remain independent. */
  destinationArea?: string;
  site?: "A" | "B" | "Mid" | "Other";
  tags?: string[];
  photoEmbed?: UtilityPhotoEmbed;
};

type Target = [
  title: string,
  from: string,
  target: string,
  x: number,
  y: number,
];
type MapTargets = { map: string; level?: string; t: Target[]; ct: Target[] };
const targets: MapTargets[] = [
  {
    map: "mirage",
    t: [
      ["Window smoke", "T spawn", "Window", 470, 330],
      ["A entry flash", "A ramp", "A site", 760, 430],
      ["Under balcony fire", "Palace", "Under balcony", 835, 450],
      ["Default grenade", "A ramp", "Default", 755, 465],
    ],
    ct: [
      ["Ramp smoke", "Ticket", "A ramp", 790, 610],
      ["A retake flash", "Ticket", "A site", 750, 430],
      ["Palace fire", "Stairs", "Palace", 865, 460],
      ["Ramp grenade", "Stairs", "A ramp", 800, 570],
    ],
  },
  {
    map: "dust2",
    t: [
      ["CT cross smoke", "Long doors", "CT cross", 815, 330],
      ["Long corner flash", "Long doors", "Long corner", 860, 570],
      ["Back platform fire", "Upper tunnels", "B platform", 235, 270],
      ["Car grenade", "Long", "Car", 870, 415],
    ],
    ct: [
      ["Tunnel exit smoke", "B site", "Upper tunnels", 300, 420],
      ["Long retake flash", "CT spawn", "Long", 805, 400],
      ["Short fire", "A site", "Short", 625, 370],
      ["Mid doors grenade", "CT mid", "Mid doors", 485, 470],
    ],
  },
  {
    map: "inferno",
    t: [
      ["CT entrance smoke", "Banana", "CT entrance", 315, 245],
      ["B entry flash", "Banana", "B site", 245, 300],
      ["New box fire", "Banana", "New box", 235, 225],
      ["Pit grenade", "Apartments", "Pit", 760, 625],
    ],
    ct: [
      ["Banana smoke", "B site", "Banana", 380, 440],
      ["A retake flash", "Library", "A site", 725, 500],
      ["Top banana fire", "B site", "Top banana", 350, 380],
      ["Ramp grenade", "Coffins", "Banana", 375, 470],
    ],
  },
  {
    map: "ancient",
    t: [
      ["Red room smoke", "Mid", "Red room", 515, 350],
      ["A entry flash", "A main", "A site", 275, 305],
      ["Back site fire", "B ramp", "B site", 760, 305],
      ["Cave grenade", "B lane", "Cave", 655, 465],
    ],
    ct: [
      ["A main smoke", "A site", "A main", 285, 520],
      ["B retake flash", "CT spawn", "B site", 740, 315],
      ["B ramp fire", "B site", "B ramp", 795, 490],
      ["Mid grenade", "Red room", "Mid", 505, 515],
    ],
  },
  {
    map: "anubis",
    t: [
      ["Connector smoke", "Canal", "Connector", 520, 390],
      ["A entry flash", "A main", "A site", 280, 300],
      ["Back site fire", "B main", "B site", 745, 315],
      ["Pillar grenade", "B main", "Pillar", 700, 355],
    ],
    ct: [
      ["B main smoke", "B site", "B main", 750, 545],
      ["Canal retake flash", "Connector", "Canal", 510, 555],
      ["A main fire", "A site", "A main", 285, 490],
      ["Water grenade", "Connector", "Water", 470, 570],
    ],
  },
  {
    map: "cache",
    t: [
      ["A highway smoke", "A main", "Highway", 705, 420],
      ["B entry flash", "B main", "B site", 265, 300],
      ["Quad fire", "A main", "Quad", 825, 235],
      ["Headshot grenade", "B main", "Headshot", 285, 325],
    ],
    ct: [
      ["A main smoke", "A site", "A main", 815, 510],
      ["Mid retake flash", "Z connector", "Mid", 515, 465],
      ["B main fire", "B site", "B main", 275, 520],
      ["Squeaky grenade", "A site", "Squeaky", 850, 385],
    ],
  },
  {
    map: "nuke",
    level: "upper",
    t: [
      ["Outside cross smoke", "T roof", "Outside", 680, 600],
      ["A entry flash", "Hut", "A site", 510, 440],
      ["Top hut fire", "Squeaky", "Top hut", 550, 410],
      ["Rafters grenade", "Hut", "Rafters", 510, 340],
    ],
    ct: [
      ["Squeaky smoke", "A site", "Squeaky", 605, 510],
      ["Lobby retake flash", "Heaven", "Lobby", 555, 635],
      ["Hut fire", "A site", "Hut", 470, 540],
      ["Outside grenade", "Garage", "Outside", 735, 565],
    ],
  },
  {
    map: "vertigo",
    level: "upper",
    t: [
      ["A site cross smoke", "A ramp", "A site", 745, 300],
      ["A ramp flash", "Ramp", "Top ramp", 700, 435],
      ["Default fire", "A ramp", "Default", 745, 350],
      ["B stairs grenade", "B stairs", "B site", 280, 330],
    ],
    ct: [
      ["A ramp smoke", "A site", "A ramp", 780, 580],
      ["Mid retake flash", "CT spawn", "Mid", 510, 430],
      ["B stairs fire", "B site", "B stairs", 270, 530],
      ["Sandbags grenade", "A site", "Sandbags", 805, 440],
    ],
  },
];

function seed(
  mapId: string,
  levelId: string,
  side: "T" | "CT",
  type: UtilityType,
  target: Target,
  index: number,
): UtilityReference {
  const [title, from, to, x, y] = target;
  return {
    id: `practice-${mapId}-${levelId}-${side}-${index}`,
    mapId,
    levelId,
    side,
    type,
    title,
    from,
    target: to,
    x,
    y,
    userCreated: false,
    purpose:
      type === "Smoke"
        ? `Practice blocking the ${to.toLowerCase()} sightline before committing to the next space.`
        : type === "Flash"
          ? `Practice a coordinated flash around ${to.toLowerCase()} and call the timing to your team.`
          : type === "Molotov"
            ? `Practice clearing ${to.toLowerCase()} before your team takes the space.`
            : `Practice utility damage and timing around ${to.toLowerCase()}.`,
    throwType: "Record in practice",
    steps: [
      `Open a local practice server on ${mapId === "dust2" ? "Dust II" : mapId.charAt(0).toUpperCase() + mapId.slice(1)} and use ${from} as a planning origin.`,
      `Find and record your exact standing position, aim reference, and throw inputs. No exact aim point is supplied in this reference.`,
      `Check the result at ${to}, repeat it from the same position, and add your own screenshot and tested notes.`,
    ],
  };
}

export const UTILITY_REFERENCES: UtilityReference[] = targets.flatMap((group) =>
  (["T", "CT"] as const).flatMap((side) =>
    group[side === "T" ? "t" : "ct"].map((target, index) =>
      seed(
        group.map,
        group.level || "main",
        side,
        UTILITY_TYPES[index],
        target,
        index,
      ),
    ),
  ),
);
UTILITY_REFERENCES.push(
  seed(
    "nuke",
    "lower",
    "T",
    "Smoke",
    ["Decon smoke", "Ramp", "Decon", 520, 560],
    8,
  ),
  seed(
    "nuke",
    "lower",
    "CT",
    "Molotov",
    ["Double doors fire", "B site", "Double doors", 625, 470],
    9,
  ),
  seed(
    "vertigo",
    "lower",
    "T",
    "Flash",
    ["Stairs flash", "T spawn", "Stairs", 710, 460],
    8,
  ),
  seed(
    "vertigo",
    "lower",
    "CT",
    "Smoke",
    ["Lower stairs smoke", "Stairs", "Lower stairs", 685, 530],
    9,
  ),
);

export const USER_UTILITIES_KEY = "utility-lab:utilities:v1";
export const FAVORITE_UTILITIES_KEY = "utility-lab:utility-favorites:v1";
export const MAX_USER_UTILITIES = 80;
export const MAX_SCREENSHOT_BYTES = 1_048_576;
export const MAX_LINEUP_PHOTOS = 4;
export const MAX_REMOTE_LINEUP_PHOTOS = 12;
export const MAX_PHOTO_DATA_CHARS = 2_900_000;
export const isLocalPhoto = (value: string): boolean =>
  /^ul-media:[a-zA-Z0-9-]{1,100}$/.test(value);
export const THROW_METHODS = [
  "Not recorded",
  "LMB (left button)",
  "RMB (right button)",
  "Both buttons (LMB + RMB)",
  "Jump + LMB",
  "Jump + RMB",
  "Jump + both buttons (LMB + RMB)",
  "Run + LMB",
  "Run + jump + LMB",
  "Walk + LMB",
  "Walk + jump + LMB",
  "Crouch + LMB",
  "Crouch + RMB",
  "Crouch + both buttons (LMB + RMB)",
  "Crouch + jump + LMB",
  "Run + RMB",
  "Run + jump + both buttons (LMB + RMB)",
] as const;
export function utilityColor(type: UtilityType): string {
  return `var(--marker-${type.toLowerCase()})`;
}
export function safeSource(value: string): string {
  if (!value.trim()) return "";
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(
      "Use a full source link beginning with https:// or http://.",
    );
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error(
      "Use an http or https source link without sign-in details.",
    );
  return url.href;
}
function timestamp(value: string | null): number {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Math.min(86_400, Number(value));
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  return match
    ? Math.min(
        86_400,
        Number(match[1] || 0) * 3600 +
          Number(match[2] || 0) * 60 +
          Number(match[3] || 0),
      )
    : 0;
}
export function parseUtilityVideo(
  value: string,
  start?: number,
): UtilityVideo | null {
  if (!value.trim()) return null;
  const url = new URL(safeSource(value));
  const host = url.hostname.toLowerCase();
  const at =
    typeof start === "number" && Number.isFinite(start)
      ? Math.max(0, Math.min(86_400, Math.floor(start)))
      : timestamp(url.searchParams.get("t") || url.searchParams.get("start"));
  if (
    [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
      "www.youtu.be",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
    ].includes(host)
  ) {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = host.endsWith("youtu.be")
      ? parts[0]
      : parts[0] === "watch"
        ? url.searchParams.get("v")
        : ["embed", "shorts", "live"].includes(parts[0])
          ? parts[1]
          : null;
    if (!id || !/[A-Za-z0-9_-]{11}/.test(id) || id.length !== 11)
      throw new Error(
        "Use a complete YouTube video link with its 11-character video ID.",
      );
    return { kind: "youtube", id, url: url.href, start: at };
  }
  if (url.protocol === "https:" && /\.(mp4|webm|ogv|ogg)$/i.test(url.pathname))
    return { kind: "file", url: url.href, start: at };
  throw new Error(
    "Use a YouTube link or a direct https MP4, WebM, or Ogg video link.",
  );
}
export function utilityPhotos(item: UtilityReference): UtilityPhoto[] {
  const personal = item.photos?.length
    ? item.photos
    : item.image
      ? [{ image: item.image, caption: "Lineup reference" }]
      : [];
  return [...(item.remotePhotos || []), ...personal];
}
function object(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function bounded(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}
function validatePhotos(
  value: unknown,
  limit: number,
  remote = false,
): UtilityPhoto[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > limit) return null;
  const photos: UtilityPhoto[] = [];
  for (const photo of value) {
    if (
      !object(photo) ||
      !bounded(photo.image, remote ? 2000 : 1_450_000) ||
      !bounded(photo.caption, 240)
    )
      return null;
    if (
      remote ||
      (!isLocalPhoto(photo.image) &&
        !isBundledPhoto(photo.image) &&
        !/^data:image\/(png|jpeg|webp);base64,/.test(photo.image))
    ) {
      try {
        if (new URL(safeSource(photo.image)).protocol !== "https:") return null;
      } catch {
        return null;
      }
    }
    if (
      photo.kind !== undefined &&
      !["position", "aim", "release", "landing", "context"].some(
        (kind) => kind === photo.kind,
      )
    )
      return null;
    const metadata: Partial<UtilityPhoto> = {};
    if (photo.aimPoint !== undefined) {
      const point = photo.aimPoint;
      if (
        photo.kind !== "aim" || !object(point) ||
        !["x", "y"].every(key => typeof point[key] === "number" &&
          Number.isFinite(point[key]) && point[key] >= 0 && point[key] <= 1)
      ) return null;
      metadata.aimPoint = { x: point.x as number, y: point.y as number };
    }
    if (photo.region !== undefined) {
      const region = photo.region;
      if (
        !object(region) ||
        !["x", "y", "width", "height", "sourceWidth", "sourceHeight"].every(
          (key) => typeof region[key] === "number" && Number.isFinite(region[key]),
        ) ||
        (region.x as number) < 0 || (region.y as number) < 0 ||
        (region.width as number) <= 0 || (region.height as number) <= 0 ||
        (region.sourceWidth as number) > 20_000 ||
        (region.sourceHeight as number) > 20_000 ||
        (region.x as number) + (region.width as number) > (region.sourceWidth as number) ||
        (region.y as number) + (region.height as number) > (region.sourceHeight as number)
      ) return null;
      metadata.region = {
        x: region.x as number, y: region.y as number,
        width: region.width as number, height: region.height as number,
        sourceWidth: region.sourceWidth as number, sourceHeight: region.sourceHeight as number,
      };
    }
    for (const [key, max] of [
      ["creator", 120],
      ["license", 160],
      ["capturedAt", 40],
      ["gameBuild", 80],
      ["annotationId", 160],
    ] as const) {
      if (photo[key] !== undefined) {
        if (!bounded(photo[key], max)) return null;
        metadata[key] = photo[key];
      }
    }
    for (const key of ["source", "licenseUrl"] as const)
      if (photo[key] !== undefined) {
        if (!bounded(photo[key], 2000)) return null;
        try {
          metadata[key] = safeSource(photo[key]);
        } catch {
          return null;
        }
      }
    photos.push({
      image: photo.image,
      caption: photo.caption,
      ...(photo.kind ? { kind: photo.kind as UtilityPhoto["kind"] } : {}),
      ...metadata,
    });
  }
  return photos;
}
export function validateUtility(value: unknown): UtilityReference | null {
  if (
    !object(value) ||
    !bounded(value.id, 160) ||
    !value.id ||
    !bounded(value.mapId, 80) ||
    !bounded(value.levelId, 80) ||
    !bounded(value.title, 100) ||
    !value.title.trim() ||
    !bounded(value.from, 100) ||
    !bounded(value.target, 100) ||
    !value.target.trim() ||
    !bounded(value.purpose, 600) ||
    !bounded(value.throwType, 100) ||
    !["T", "CT"].includes(String(value.side)) ||
    !UTILITY_TYPES.includes(value.type as UtilityType)
  )
    return null;
  let video: UtilityVideo | null = null;
  const photoEmbed =
    value.photoEmbed === undefined
      ? null
      : validatePhotoEmbed(value.photoEmbed);
  if (value.photoEmbed !== undefined && !photoEmbed) return null;
  if (value.videoUrl !== undefined) {
    if (!bounded(value.videoUrl, 2000)) return null;
    try {
      video = parseUtilityVideo(
        value.videoUrl,
        typeof value.videoStart === "number" ? value.videoStart : undefined,
      );
    } catch {
      return null;
    }
  }
  let videoFallback: UtilityVideo | null = null;
  if (value.videoFallbackUrl !== undefined) {
    if (!bounded(value.videoFallbackUrl, 2000)) return null;
    try {
      videoFallback = parseUtilityVideo(value.videoFallbackUrl);
    } catch {
      return null;
    }
  }
  if (
    value.videoStart !== undefined &&
    (typeof value.videoStart !== "number" ||
      !Number.isFinite(value.videoStart) ||
      value.videoStart < 0 ||
      value.videoStart > 86_400)
  )
    return null;
  if (value.creator !== undefined && !bounded(value.creator, 120)) return null;
  if (value.landingVariant !== undefined && (!bounded(value.landingVariant,60)||!value.landingVariant.trim())) return null;
  if (value.destinationArea !== undefined && (!bounded(value.destinationArea,120)||!value.destinationArea.trim())) return null;
  if (value.showMarker !== undefined && typeof value.showMarker !== "boolean")
    return null;
  if (value.markerBasis !== undefined && value.markerBasis !== "callout-area")
    return null;
  let markerSource: UtilityReference["markerSource"];
  if (value.markerSource !== undefined) {
    const point = value.markerSource as Record<string, unknown>;
    if (!point || typeof point !== "object" || Array.isArray(point) ||
        !bounded(point.registrationId, 100) || !bounded(point.destinationId, 100) ||
        typeof point.x !== "number" || typeof point.y !== "number" ||
        !Number.isFinite(point.x) || !Number.isFinite(point.y) ||
        point.x < 0 || point.x > 1000 || point.y < 0 || point.y > 1000) return null;
    markerSource = { registrationId: point.registrationId as string,
      destinationId: point.destinationId as string, x: point.x, y: point.y };
  }
  let spawn: UtilityReference["spawn"];
  if (value.spawn !== undefined) {
    const item=value.spawn as Record<string,unknown>;
    if (!object(item) || !bounded(item.family,100) || !item.family ||
        !bounded(item.label,100) || !item.label || typeof item.slot!=="number" ||
        !Number.isInteger(item.slot) || item.slot<0 || typeof item.total!=="number" ||
        !Number.isInteger(item.total) || item.total<1 || item.total>32 || item.slot>item.total) return null;
    spawn={family:item.family,slot:item.slot,total:item.total,label:item.label};
  }
  if (
    value.site !== undefined &&
    !["A", "B", "Mid", "Other"].includes(String(value.site))
  )
    return null;
  if (
    value.tags !== undefined &&
    (!Array.isArray(value.tags) ||
      value.tags.length > 20 ||
      !value.tags.every((tag) => bounded(tag, 40)))
  )
    return null;
  const photos = validatePhotos(value.photos, MAX_LINEUP_PHOTOS);
  const remotePhotos = validatePhotos(
    value.remotePhotos,
    MAX_REMOTE_LINEUP_PHOTOS,
    true,
  );
  if (!photos || !remotePhotos) return null;
  if (
    photos.reduce((total, photo) => total + photo.image.length, 0) +
      (typeof value.image === "string" ? value.image.length : 0) >
    MAX_PHOTO_DATA_CHARS
  )
    return null;
  if (
    typeof value.x !== "number" ||
    typeof value.y !== "number" ||
    !Number.isFinite(value.x) ||
    !Number.isFinite(value.y) ||
    value.x < 0 ||
    value.x > 1000 ||
    value.y < 0 ||
    value.y > 1000
  )
    return null;
  if (
    !Array.isArray(value.steps) ||
    value.steps.length > 20 ||
    !value.steps.every((step) => bounded(step, 500))
  )
    return null;
  if (
    value.image !== undefined &&
    (!bounded(value.image, 1_450_000) ||
      (!isLocalPhoto(value.image) &&
        !isBundledPhoto(value.image) &&
        !/^data:image\/(png|jpeg|webp);base64,/.test(value.image)))
  )
    return null;
  let source = "";
  try {
    source =
      value.source === undefined
        ? ""
        : safeSource(bounded(value.source, 2000) ? value.source : "invalid:");
  } catch {
    return null;
  }
  return {
    id: value.id,
    mapId: value.mapId,
    levelId: value.levelId,
    title: value.title,
    from: value.from,
    target: value.target,
    purpose: value.purpose,
    throwType: value.throwType,
    side: value.side as "T" | "CT",
    type: value.type as UtilityType,
    x: value.x,
    y: value.y,
    steps: value.steps as string[],
    userCreated: true,
    ...(value.image ? { image: value.image as string } : {}),
    ...(source ? { source } : {}),
    ...(video ? { videoUrl: video.url, videoStart: video.start } : {}),
    ...(videoFallback ? { videoFallbackUrl: videoFallback.url } : {}),
    ...(photos.length ? { photos } : {}),
    ...(remotePhotos.length ? { remotePhotos } : {}),
    ...(value.creator ? { creator: value.creator as string } : {}),
    ...(typeof value.showMarker === "boolean"
      ? { showMarker: value.showMarker }
      : {}),
    ...(value.markerBasis === "callout-area"
      ? { markerBasis: "callout-area" as const }
      : {}),
    ...(markerSource ? { markerSource } : {}),
    ...(spawn ? { spawn } : {}),
    ...(value.landingVariant ? {landingVariant:value.landingVariant as string} : {}),
    ...(value.destinationArea ? {destinationArea:value.destinationArea as string} : {}),
    ...(value.site ? { site: value.site as UtilityReference["site"] } : {}),
    ...(Array.isArray(value.tags) ? { tags: value.tags as string[] } : {}),
    ...(photoEmbed ? { photoEmbed } : {}),
  };
}
export function readUserUtilities(): UtilityReference[] {
  try {
    const raw: unknown = JSON.parse(
      localStorage.getItem(USER_UTILITIES_KEY) || "[]",
    );
    if (!Array.isArray(raw)) return [];
    const ids = new Set<string>();
    return raw.slice(0, MAX_USER_UTILITIES).flatMap((item) => {
      const record = validateUtility(item);
      if (!record || ids.has(record.id)) return [];
      ids.add(record.id);
      return [record];
    });
  } catch {
    return [];
  }
}
export function readUtilityFavorites(): string[] {
  try {
    const raw: unknown = JSON.parse(
      localStorage.getItem(FAVORITE_UTILITIES_KEY) || "[]",
    );
    return Array.isArray(raw)
      ? [...new Set(raw.filter((item) => bounded(item, 160)))].slice(0, 500)
      : [];
  } catch {
    return [];
  }
}
