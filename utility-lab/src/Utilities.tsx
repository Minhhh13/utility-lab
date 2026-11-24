import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Hand,
  ImagePlus,
  Images,
  Info,
  MapPinned,
  Pencil,
  Plus,
  Play,
  Search,
  Shield,
  Star,
  Trash2,
  UserRound,
  Video,
  X,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  Upload,
  Link2,
} from "lucide-react";
import { MAPS, type GameMap } from "./maps";
import MediaImage from "./MediaImage";
import {preloadPhoto} from "./photo-preload";
import useMapNavigation from "./useMapNavigation";
import {lineupMapFrame} from "./lineup-map-layout";
import PhotoZoom from "./PhotoZoom";
import { withAimPlacement } from "./aim-placement";
import { portableLineups, storeLineupMedia } from "./media-store";
import { lineupLink } from "./routes";
import { exportFile } from "./file-transfer";
import {
  groupUtilityMarkers,
  layoutUtilityMarkers,
  splitUtilityDestinations,
  clusterUtilityAreas,
  type UtilityMarkerGroup,
} from "./utility-markers";
import { PHOTO_GUIDE_LIBRARY } from "./guide-library";
import { cachedMapGuides, loadMapGuides } from "./expanded-catalogue";
import { mergePhotoGuides } from "./expanded-guide-model";
import MarkerChoices from "./MarkerChoices";
import OriginChoices from "./OriginChoices";
import {groupOriginOptions,groupPersonalGuides,layoutPersonalGuides,originRecipeOptions,type OriginChoiceGroup} from "./origin-options";
import GuideActions from "./GuideActions";
import UtilityTargetMarker from "./UtilityTargetMarker";
import { loadMapOrigins, findLineupOrigin, type OriginLookup } from "./lineup-origins";
import { curateLineups } from "./lineup-curation";
import LineupSuggestions from "./LineupSuggestions";
import { photoStepName } from "./lineup-copy";
import { nativePhotoRecord } from "./native-photo-library";
import GrenadeIcon, { type UtilityKind } from "./UtilityIcon";
import {
  FAVORITE_UTILITIES_KEY,
  MAX_SCREENSHOT_BYTES,
  MAX_LINEUP_PHOTOS,
  MAX_PHOTO_DATA_CHARS,
  MAX_USER_UTILITIES,
  USER_UTILITIES_KEY,
  UTILITY_TYPES,
  THROW_METHODS,
  readUserUtilities,
  readUtilityFavorites,
  safeSource,
  parseUtilityVideo,
  utilityPhotos,
  utilityColor,
  validateUtility,
  type UtilityReference,
  type UtilityPhoto,
  type UtilityType,
} from "./utility-data";
import "./utilities.css";
import "./lineups-canvas.css";

export type UtilitiesProps = {
  map: GameMap;
  side: "T" | "CT";
  onSideChange: (side: "T" | "CT") => void;
  onOpenMaps: () => void;
  onNotify: (message: string) => void;
  theme: "light" | "dark";
  compact: boolean;
  initialLineup?: UtilityReference;
  initialLevelId?: string;
  onOpenLineup?: (record: UtilityReference) => void;
};
type MapSelection = {
  records: UtilityReference[];
  type: UtilityType;
  target: {x:number;y:number;levelId:string;label:string;name?:string;variant?:string};
  animate: boolean;
};
type Draft = {
  showMarker?: boolean;
  site?: UtilityReference["site"];
  tags?: string[];
  photoEmbed?: UtilityReference["photoEmbed"];
  remotePhotos?: UtilityPhoto[];
  title: string;
  from: string;
  target: string;
  purpose: string;
  throwType: string;
  steps: string;
  type: UtilityType;
  side: "T" | "CT";
  levelId: string;
  x: number;
  y: number;
  image: string;
  source: string;
  photos: UtilityPhoto[];
  videoUrl: string;
  videoFallbackUrl?: string;
  videoStart: string;
  creator: string;
};
type DraftRecovery = { draft: Draft; editingId: string | null };
const recoveredDrafts = new Map<string, DraftRecovery>();
const recoveryKey = (map: string) => `utility-lab:lineup-draft:v1:${map}`;
function readRecovery(map: GameMap): DraftRecovery | undefined {
  if (recoveredDrafts.has(map.id)) return recoveredDrafts.get(map.id);
  try {
    const raw = JSON.parse(localStorage.getItem(recoveryKey(map.id)) || "null"),
      draft = raw?.draft;
    if (
      !draft ||
      typeof draft !== "object" ||
      !(raw.editingId === null || typeof raw.editingId === "string")
    )
      return;
    for (const key of [
      "title",
      "from",
      "target",
      "purpose",
      "throwType",
      "steps",
      "image",
      "source",
      "videoUrl",
      "videoStart",
      "creator",
    ])
      if (
        typeof draft[key] !== "string" ||
        draft[key].length > (key === "image" ? 1_450_000 : 10_000)
      )
        return;
    if (
      !map.levels.some((level) => level.id === draft.levelId) ||
      !["T", "CT"].includes(draft.side) ||
      !UTILITY_TYPES.includes(draft.type)
    )
      return;
    if (
      !validateUtility({
        id: "draft",
        mapId: map.id,
        levelId: draft.levelId,
        side: draft.side,
        type: draft.type,
        title: "Draft",
        target: "Draft",
        from: "",
        purpose: "",
        throwType: "",
        steps: [],
        x: draft.x,
        y: draft.y,
        photos: draft.photos,
        remotePhotos: draft.remotePhotos,
        image: draft.image || undefined,
        userCreated: true,
        showMarker: draft.showMarker,
        site: draft.site,
        tags: draft.tags,
        photoEmbed: draft.photoEmbed,
      })
    )
      return;
    return raw as DraftRecovery;
  } catch {
    return;
  }
}
const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `lineup-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const boundedPosition = (value: number) =>
  Math.max(0, Math.min(1000, Math.round(value*100)/100));
const utilityLabel = (type: UtilityType) =>
  type === "Molotov" ? "Molly" : type === "HE" ? "HE grenade" : type;
function blankDraft(levelId: string, side: "T" | "CT"): Draft {
  return {
    showMarker: false,
    title: "",
    from: "",
    target: "",
    purpose: "",
    throwType: "",
    steps: "",
    type: "Smoke",
    side,
    levelId,
    x: 500,
    y: 500,
    image: "",
    source: "",
    photos: [],
    videoUrl: "",
    videoStart: "",
    creator: "",
  };
}
function fromReference(original: UtilityReference): Draft {
  const item = withAimPlacement(original);
  return {
    ...item,
    steps: item.steps.join("\n"),
    image: item.image || "",
    source: item.source || "",
    photos: item.remotePhotos?.length ? item.photos || [] : utilityPhotos(item),
    videoUrl: item.videoUrl || "",
    videoStart: item.videoStart === undefined ? "" : String(item.videoStart),
    creator: item.creator || "",
  };
}
async function prepareLineupPhoto(file: File): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("Choose PNG, JPEG, or WebP lineup photos.");
  if (file.size > 8_388_608)
    throw new Error(
      "Each source photo must be smaller than 8 MB. Photos are resized locally before saving.",
    );
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("A photo could not be read. Choose the file again."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () =>
      reject(
        new Error(
          "One file is not a readable image. Choose another screenshot.",
        ),
      );
    element.src = data;
  });
  if (
    data.length <= 750_000 &&
    Math.max(image.naturalWidth, image.naturalHeight) <= 1600
  )
    return data;
  const scale = Math.min(
    1,
    1600 / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error(
      "Photos could not be prepared in this browser. Try a smaller JPEG.",
    );
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let result = canvas.toDataURL("image/jpeg", 0.86);
  if (result.length > 750_000) result = canvas.toDataURL("image/jpeg", 0.7);
  if (result.length > 1_400_000)
    throw new Error(
      "This photo is still too large after resizing. Choose a smaller image.",
    );
  return result;
}
function UtilityIcon({
  type,
  size = 22,
  className,
}: {
  type: UtilityType;
  size?: number;
  className?: string;
}) {
  return (
    <GrenadeIcon
      type={type.toLowerCase() as UtilityKind}
      size={size}
      className={className}
    />
  );
}
async function downloadLineup(item: UtilityReference) {
  const [portable] = await portableLineups([item]);
  const blob = new Blob(
    [
      JSON.stringify(
        { format: "utility-lab-lineup", version: 1, lineup: portable },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  await exportFile(
    blob,
    `${
      item.title
        .replace(/[^a-z0-9 -]/gi, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase() || "lineup"
    }.json`,
  );
}

function ThrowInputs({ method }: { method: string }) {
  const label = method.replace(/\bmiddle[ -]?(?:click|throw)\b/gi, "LMB + RMB");
  const both = /both|middle[ -]?click/i.test(label) || (/LMB/i.test(label) && /RMB/i.test(label)),
    left = both || /LMB|left[ -]?click/i.test(label),
    right = both || /RMB|right[ -]?click/i.test(label),
    jump = /jump/i.test(label),
    run = /\b(?:run|running)\b/i.test(label);
  return (
    <div className="ul-throw-inputs">
      <div
        className="ul-input-badges"
        aria-label={label || "Throw inputs not recorded"}
      >
        {jump && <span className="ul-key-input">Jump</span>}
        {/\bshift\b/i.test(label) && <span className="ul-key-input">Shift</span>}
        {/\bW\b/.test(label) && <span className="ul-key-input">{/W tap|tap W/i.test(label) ? "Tap W" : "W"}</span>}
        {(["A", "S", "D"] as const).filter(key => new RegExp(`\\b${key}\\b`).test(label)).map(key => <span key={key} className="ul-key-input">{key}</span>)}
        {run && <span className="ul-key-input">Run</span>}
        {/\b(?:walk|walking)\b/i.test(label) && (
          <span className="ul-key-input">Walk</span>
        )}
        {/crouch/i.test(label) && <span className="ul-key-input">Crouch</span>}
        {(left || right) && (
          <span className="ul-mouse-input">
            <svg
              width="25"
              height="32"
              viewBox="0 0 25 32"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="1"
                width="21"
                height="29"
                rx="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              {left && (
                <path
                  d="M12.5 2C6 2 3 6 3 11v3h9.5z"
                  fill="currentColor"
                  fillOpacity=".3"
                />
              )}
              {right && (
                <path
                  d="M12.5 2C19 2 22 6 22 11v3h-9.5z"
                  fill="currentColor"
                  fillOpacity=".3"
                />
              )}
              <path
                d="M12.5 1v13M2.5 14h20"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
            <span>{both ? "LMB + RMB" : left ? "LMB" : "RMB"}</span>
          </span>
        )}
        {!jump && !run && !left && !right && (
          <span className="ul-key-input">
            {/video/i.test(label)
              ? "Shown in video"
              : label
                ? "See guide"
                : "Not recorded"}
          </span>
        )}
      </div>
      <p>
        {label || "Throw inputs not recorded"}
      </p>
    </div>
  );
}

function LineupMedia({ record }: { record: UtilityReference }) {
  const photos = useMemo(() => utilityPhotos(withAimPlacement(record)), [record]);
  const [fileFailed, setFileFailed] = useState(false);
  let video = null;
  try {
    video = parseUtilityVideo(record.videoUrl || "", record.videoStart);
  } catch {
    /* Invalid media retains the original source link. */
  }
  if (fileFailed && record.videoFallbackUrl) {
    try { video = parseUtilityVideo(record.videoFallbackUrl); } catch { /* Keep the original source link. */ }
  }
  const [mode, setMode] = useState<"video" | "photos">(
    photos.length ? "photos" : "video",
  );
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const changePhoto = (offset: number) =>
    setIndex((current) => (current + offset + photos.length) % photos.length);
  const source = video
    ? video.kind === "youtube"
      ? `https://www.youtube.com/watch?v=${video.id}${video.start ? `&t=${video.start}s` : ""}`
      : `${video.url.split("#")[0]}${video.start ? `#t=${video.start}` : ""}`
    : record.source;
  const formats = photos.length > 0 ? (
    <div className="ul-media-tabs" role="group" aria-label="Lineup media type">
      <button title="Photos" aria-pressed={mode === "photos"} onClick={() => { setMode("photos"); setLoaded(false); }}>
        <Images size={16} />Photos <span>{photos.length}</span>
      </button>
      <button aria-pressed={mode === "video"} disabled={!video} title={video ? "Watch video" : "No video for this guide"} onClick={() => { setMode("video"); setLoaded(false); }}>
        <Video size={16} />Video
      </button>
    </div>
  ) : null;
  return (
    <div
      className={`ul-lineup-media is-${mode}`}
      onKeyDown={(event) => {
        if (
          mode === "photos" &&
          photos.length > 1 &&
          ["ArrowLeft", "ArrowRight"].includes(event.key)
        ) {
          event.preventDefault();
          changePhoto(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      {mode === "video" && formats}
      {!photos.length && !video && <div className="ul-text-guide">
        {record.from && <p>Throw from {record.from} to {record.target}.</p>}
        {record.purpose && <p>{record.purpose}</p>}
        <ol className="ul-instructions">{record.steps.map((step,index) => <li key={index}><span>{index+1}</span><p>{step}</p></li>)}</ol>
      </div>}
      {mode === "video" && video && (
        <div className="ul-video-stage">
          {!loaded ? (
            <div className="ul-video-ready">
              <button className="ul-video-load" onClick={() => setLoaded(true)}>
                <Play size={29} fill="currentColor" />
                <span>Load video</span>
              </button>
              <p>
                {record.creator
                  ? `Guide by ${record.creator}`
                  : "Original video guide"}
                {video.start > 0
                  ? ` · starts at ${Math.floor(video.start / 60)}:${String(video.start % 60).padStart(2, "0")}`
                  : ""}
              </p>
            </div>
          ) : fileFailed && video.kind === "file" && !record.videoFallbackUrl ? (
            <div className="ul-video-ready" role="status">
              <p>The video couldn’t load.</p>
              <button className="ul-video-load" onClick={() => setFileFailed(false)}>Try video again</button>
            </div>
          ) : video.kind === "youtube" ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?start=${video.start}&rel=0`}
              title={`${record.title} video guide`}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video
              src={`${video.url.split("#")[0]}${video.start ? `#t=${video.start}` : ""}`}
              controls
              playsInline
              preload="metadata"
              onError={() => setFileFailed(true)}
              aria-label={`${record.title} video guide`}
            />
          )}
        </div>
      )}
      {mode === "photos" && photos.length > 0 && (
        <div className="ul-photo-viewer" aria-label="Lineup photo slides">
          <div className="ul-photo-stage">
            <PhotoZoom
              key={`${photos[index].image}:${index}`}
              formats={formats}
              photo={photos[index]}
              title={`${record.title}, photo ${index + 1}`}
              onSwipe={photos.length > 1 ? changePhoto : undefined}
              onReady={()=>{const next=photos[(index+1)%photos.length];if(next&&next.image!==photos[index].image)preloadPhoto(next.image);}}
            />
            {photos.length > 1 && (
              <>
                <button
                  className="ul-slide-prev"
                  aria-label="Previous photo"
                  onClick={() => changePhoto(-1)}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="ul-slide-next"
                  aria-label="Next photo"
                  onClick={() => changePhoto(1)}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          <div className="ul-photo-details">
          <div className="ul-photo-caption" aria-live="polite">
            <span>
              {index + 1} / {photos.length}
            </span>
            <div>
              {photos[index].kind && (
                <strong className="ul-photo-kind">
                  {photoStepName(
                    photos[index].kind,
                    index,
                    photos[index].caption,
                  )}
                </strong>
              )}
              <p>
                {!record.userCreated &&
                index === 0 &&
                (photos[index].kind === "position" ||
                  /^Position & aim/i.test(photos[index].caption))
                  ? record.steps[0] || photos[index].caption
                  : photos[index].caption || `Photo ${index + 1}`}
              </p>
            </div>
          </div>
          {(photos[index].creator ||
            photos[index].source ||
            photos[index].license ||
            photos[index].capturedAt ||
            photos[index].gameBuild) && (
            <div className="ul-photo-credit">
              {photos[index].region && <span>Source panel</span>}
              {photos[index].creator && (
                <span>Photo: {photos[index].creator}</span>
              )}
              {photos[index].source && (
                <a href={photos[index].source} target="_blank" rel="noreferrer">
                  Photo source
                </a>
              )}
              {photos[index].license &&
                (photos[index].licenseUrl ? (
                  <a
                    href={photos[index].licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {photos[index].license}
                  </a>
                ) : (
                  <span>{photos[index].license}</span>
                ))}
              {photos[index].gameBuild && (
                <span>CS2 build {photos[index].gameBuild}</span>
              )}
              {photos[index].capturedAt && (
                <span>Captured {photos[index].capturedAt}</span>
              )}
            </div>
          )}
          </div>
          {photos.length > 1 && (
            <div
              className="ul-photo-dots"
              role="group"
              aria-label="Choose lineup photo"
            >
              {photos.map((photo, photoIndex) => (
                <button
                  key={photoIndex}
                  className={index === photoIndex ? "is-active" : ""}
                  aria-label={`Photo ${photoIndex + 1}${photo.caption ? `: ${photo.caption}` : ""}`}
                  aria-pressed={index === photoIndex}
                  onClick={() => setIndex(photoIndex)}
                >
                  <span className="ul-photo-step-number">{photoIndex + 1}</span>
                  <span>
                    {photoStepName(photo.kind, photoIndex, photo.caption)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="ul-media-footer">
        <div className="ul-viewer-keys">
          <h3>Keys</h3>
          <ThrowInputs method={record.throwType} />
        </div>
        {source && (mode === "video" || !photos[index]?.source) && (
          <a href={source} target="_blank" rel="noreferrer">
            Open original {video ? "video" : "source"}{" "}
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function Utilities({
  map,
  side,
  onSideChange,
  onOpenMaps,
  onNotify,
  theme,
  compact,
  initialLineup: suppliedLineup,
  initialLevelId,
  onOpenLineup,
}: UtilitiesProps) {
  const initialLineup = useMemo(
    () => (suppliedLineup ? nativePhotoRecord(suppliedLineup) : undefined),
    [suppliedLineup],
  );
  const [levelId, setLevelId] = useState(
    initialLineup?.levelId ||
      initialLevelId ||
      readRecovery(map)?.draft.levelId ||
      map.levels[0]?.id ||
      "main",
  );
  const [types, setTypes] = useState<UtilityType[]>([]);
  const [origins, setOrigins] = useState<{mapId:string; lookup:OriginLookup; error:string}>({mapId:map.id,lookup:{},error:""});
  const [originSelection, setOriginSelection] = useState<MapSelection | null>(null);
  const [landingSelection, setLandingSelection] = useState<MapSelection | null>(null);
  const [loadingStanding, setLoadingStanding] = useState(false);
  const selectionRequest = useRef(0);
  const [catalogue, setCatalogue] = useState(() => ({
    mapId: map.id,
    records: cachedMapGuides(map.id) || [],
    loading: !cachedMapGuides(map.id),
    error: "",
  }));
  const [catalogueRetry, setCatalogueRetry] = useState(0);
  useEffect(() => {
    let current = true;
    const cached = cachedMapGuides(map.id);
    setOrigins({mapId:map.id,lookup:{},error:""});
    void loadMapOrigins(map.id).then(lookup => {
      if(current) setOrigins({mapId:map.id,lookup,error:""});
    }).catch(() => {
      if(current) setOrigins({mapId:map.id,lookup:{},error:"Standing locations couldn’t load. Try loading this map again."});
    });
    setCatalogue({ mapId: map.id, records: cached || [], loading: !cached, error: "" });
    void loadMapGuides(map.id).then((records) => {
      if (current) setCatalogue({ mapId: map.id, records, loading: false, error: "" });
    }).catch(() => {
      if (current) setCatalogue({ mapId: map.id, records: [], loading: false, error: "Couldn’t load this map’s lineups." });
    });
    return () => { current = false; };
  }, [map.id, catalogueRetry]);
  const [markerFilter, setMarkerFilter] = useState<string[]>([]);
  const [targetLabelId, setTargetLabelId] = useState<string | null>(null);
  const [markerChoice, setMarkerChoice] = useState<{
    records: UtilityReference[];
    anchor: { x: number; y: number };
    target: {x:number;y:number;levelId:string;label:string};
    trigger: SVGElement;
    animate: boolean;
  } | null>(null);
  const [originChoice,setOriginChoice]=useState<{group:OriginChoiceGroup;anchor:{x:number;y:number};trigger:SVGElement}|null>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [custom, setCustom] = useState(readUserUtilities);
  const [favorites, setFavorites] = useState(readUtilityFavorites);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialLineup?.id || null,
  );
  const [saving, setSaving] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(
    () =>
      !initialLineup &&
      !!readRecovery(map) &&
      (!initialLevelId || initialLevelId === readRecovery(map)?.draft.levelId),
  );
  const [editingId, setEditingId] = useState<string | null>(
    () => readRecovery(map)?.editingId || null,
  );
  const [draft, setDraft] = useState<Draft>(
    () =>
      readRecovery(map)?.draft || blankDraft(map.levels[0]?.id || "main", side),
  );
  const [formError, setFormError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [mapFallback, setMapFallback] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapUnit, setMapUnit] = useState(2.3);
  const [mapSize, setMapSize] = useState({width:0,height:0});
  const [mediaRecord, setMediaRecord] = useState<UtilityReference | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const mediaDialog = useRef<HTMLDialogElement>(null);
  const alive = useRef(true);
  const currentContext = useRef(`${map.id}:${levelId}`);
  currentContext.current = `${map.id}:${levelId}`;
  const level = map.levels.find((item) => item.id === levelId) || map.levels[0];
  const fit = lineupMapFrame(level?.contentBounds || { x: 0, y: 0, width: 1000, height: 1000 });
  const navigation = useMapNavigation(
    svgRef,
    fit,
    `${map.id}:${levelId}`,
    placing,
  );
  const zoom = navigation.zoom;
  useEffect(() => { selectionRequest.current++;setMarkerChoice(null);setOriginChoice(null);setLoadingStanding(false); }, [map.id, levelId, side, types, zoom]);
  useEffect(() => { selectionRequest.current++;setOriginSelection(null);setLandingSelection(null);setLoadingStanding(false); }, [map.id, side, types, savedOnly, initialLevelId]);
  const viewWidth = fit.width / zoom;
  const viewHeight = fit.height / zoom;
  const mapRecords: UtilityReference[] = useMemo(() => [...new Map([
    ...mergePhotoGuides(PHOTO_GUIDE_LIBRARY, catalogue.mapId === map.id ? catalogue.records : []),
    ...custom.map(nativePhotoRecord),
  ].map(record => [record.id, record])).values()].filter(
    (item) =>
      item.mapId === map.id && item.side === side,
  ), [map.id,side,catalogue,custom]);
  const allContextRecords = mapRecords.filter(item => item.levelId === levelId);
  const contextRecords = useMemo(() => curateLineups(allContextRecords), [mapRecords,levelId]);
  const countContext = originSelection ? mapRecords.filter(item => item.levelId === originSelection.target.levelId) : allContextRecords;
  const filterCountRecords = savedOnly ? countContext.filter(item => favorites.includes(item.id)) : countContext;
  const targetRecords = (savedOnly ? allContextRecords : contextRecords).filter(
    (item) =>
      (!types.length || types.includes(item.type)) &&
      (!savedOnly || favorites.includes(item.id)) &&
      (!markerFilter.length || markerFilter.includes(item.id)),

  );
  const mapMarkerRecords = useMemo(() => {
    const preferred = new Set(targetRecords.map(record => record.id));
    return [...targetRecords,...allContextRecords.filter(record => !preferred.has(record.id) &&
      (!types.length || types.includes(record.type)) && (!savedOnly || favorites.includes(record.id)) &&
      (!markerFilter.length || markerFilter.includes(record.id)))];
  }, [contextRecords,mapRecords,levelId,types,savedOnly,favorites,markerFilter]);
  const landingGroups = useMemo(() => landingSelection ? splitUtilityDestinations(landingSelection.records.filter(record => !savedOnly || favorites.includes(record.id))) : [], [landingSelection,savedOnly,favorites]);
  const originRecords = originSelection?.records.filter(record => !savedOnly || favorites.includes(record.id)) || [];
  const visibleRecords = originSelection ? originRecords : mapMarkerRecords;
  const originChoices = originRecords.flatMap(record => {
    if(record.userCreated)return [];
    const point = findLineupOrigin(record, origins.mapId === map.id ? origins.lookup : {}, levelId);
    return point?.levelId === levelId ? [{record,point}] : [];
  });
  const originGroups=groupOriginOptions(originChoices,mapUnit);
  const personalGroups=groupPersonalGuides(originRecords.filter(record=>record.levelId===levelId),mapUnit);
  const originFloors = originSelection ? map.levels.filter(floor => originRecords.some(record =>
    record.userCreated ? record.levelId===floor.id : findLineupOrigin(record,origins.lookup,floor.id)?.levelId === floor.id)) : [];
  const spawnAlternatives=mediaRecord?.spawn ? originRecipeOptions(mapRecords.filter(record=>
    record.spawn?.family===mediaRecord.spawn?.family && record.side===mediaRecord.side && record.type===mediaRecord.type && !record.userCreated)) : [];
  const spawnIndex=spawnAlternatives.findIndex(record=>record.id===mediaRecord?.id);
  useEffect(() => {
    if(!originSelection || !originRecords.length || originChoices.length || personalGroups.length) return;
    const original=originRecords.find(record=>!record.userCreated&&findLineupOrigin(record,origins.lookup));
    const sourceLevel=original?findLineupOrigin(original,origins.lookup,levelId)?.levelId:
      originRecords.find(record=>record.userCreated)?.levelId;
    if(sourceLevel && sourceLevel !== levelId) setLevelId(sourceLevel);
  }, [originSelection, origins.lookup, levelId, favorites, savedOnly]);
  useEffect(() => {
    if(savedOnly && originSelection && !originSelection.records.some(record => favorites.includes(record.id))) backToTargets();
    if(savedOnly && landingSelection && !landingGroups.length) backToTargets();
  }, [savedOnly, originSelection, landingSelection, favorites]);
  useEffect(() => {
    if(originSelection && !originSelection.animate) requestAnimationFrame(() => svgRef.current?.querySelector<SVGGElement>(".ul-origin-pin,.ul-personal-guide-pin")?.focus({preventScroll:true}));
  }, [originSelection, levelId, origins.lookup]);
  useEffect(() => {
    if(landingSelection && !landingSelection.animate) requestAnimationFrame(() => svgRef.current?.querySelector<SVGGElement>(".ul-landing-pin")?.focus({preventScroll:true}));
  }, [landingSelection,levelId]);
  const selected =
    visibleRecords.find((item) => item.id === selectedId) ||
    (initialLineup?.id === selectedId && initialLineup.mapId === map.id &&
      initialLineup.levelId === levelId && initialLineup.side === side &&
      (!types.length || types.includes(initialLineup.type)) ? initialLineup : null) ||
    (!originSelection ? visibleRecords[0] : null) ||
    null;
  const catalogueReady = !catalogue.loading && catalogue.mapId === map.id && !catalogue.error;
  const markerGroups = useMemo(() => groupUtilityMarkers(catalogueReady ? mapMarkerRecords : [],mapUnit,zoom<=1.01), [catalogueReady,mapMarkerRecords,mapUnit,zoom]);
  const markerBounds = useMemo(() => {
    const [x,y,width,height] = navigation.viewBox.split(/\s+/).map(Number);
    const visibleWidth = mapSize.width ? mapSize.width * mapUnit : width;
    const visibleHeight = mapSize.height ? mapSize.height * mapUnit : height;
    return {
      x:x-(visibleWidth-width)/2,y:y-(visibleHeight-height)/2,
      width:visibleWidth,height:visibleHeight,
    };
  }, [mapUnit,mapSize,navigation.viewBox]);
  const personalMarkers=layoutPersonalGuides(personalGroups,originGroups,mapUnit,markerBounds);
  const mainClusters = useMemo(() => clusterUtilityAreas(markerGroups.filter(group =>
    group.x >= markerBounds.x && group.x <= markerBounds.x+markerBounds.width &&
    group.y >= markerBounds.y && group.y <= markerBounds.y+markerBounds.height),mapUnit), [markerGroups,markerBounds,mapUnit]);
  const clusterById = useMemo(() => new Map(mainClusters.map(group=>[group.id,group])), [mainClusters]);
  const destinationCounts = useMemo(() => new Map(mainClusters.map(group => [group.id,splitUtilityDestinations(group.records).length])), [mainClusters]);
  const laidOutMarkers = useMemo(() => landingSelection ? layoutUtilityMarkers(landingGroups,mapUnit,markerBounds) :
    mainClusters.map(group=>({...group,displayX:group.x,displayY:group.y,inView:true})),
    [landingSelection,landingGroups,mapUnit,markerBounds,mainClusters]);
  useEffect(() => setMarkerFilter([]), [side]);
  const sourceImage = level?.image || "";
  const preferredImage =
    theme === "light" && sourceImage.endsWith(".svg")
      ? sourceImage.replace(/(?:-light)?\.svg$/, "-light.svg")
      : sourceImage;
  const mapImage = mapFallback ? sourceImage : preferredImage;
  const draftPhotos = draft.photos || [];

  useEffect(() => {
    if (!initialLineup) return;
    setLevelId(initialLineup.levelId);
    setSelectedId(initialLineup.id);
    if (initialLineup.userCreated || initialLineup.videoUrl || utilityPhotos(initialLineup).length) {
      setMediaRecord(initialLineup);
      requestAnimationFrame(() => mediaDialog.current?.showModal());
    }
  }, [initialLineup]);
  useEffect(() => {
    if (!initialLineup) mediaDialog.current?.close();
  }, [map.id, side, initialLevelId, initialLineup]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    setLevelId(
      initialLineup?.levelId ||
        initialLevelId ||
        readRecovery(map)?.draft.levelId ||
        map.levels[0]?.id ||
        "main",
    );
    setSelectedId(initialLineup?.id || null);
    navigation.reset();
    setFormError("");
    setPlacing(false);
  }, [map.id, initialLevelId, side]);
  useEffect(() => {
    setMapFallback(false);
    setMapFailed(false);
  }, [map.id, levelId, theme]);
  useEffect(() => {
    if (!editing) return;
    recoveredDrafts.set(map.id, { draft, editingId });
    try {
      localStorage.setItem(
        recoveryKey(map.id),
        JSON.stringify({ draft, editingId }),
      );
    } catch {
      /* Session recovery and explicit export remain available. */
    }
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editing, draft, editingId, map.id]);
  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;
    const measure = () => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width > 0 && bounds.height > 0)
      {
        setMapUnit(
          Math.max(viewWidth / bounds.width, viewHeight / bounds.height),
        );
        setMapSize(previous => previous.width === bounds.width && previous.height === bounds.height ? previous : {width:bounds.width,height:bounds.height});
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [viewWidth, viewHeight, map.id]);

  function selectRecord(item: UtilityReference) {
    if (editing) {
      onNotify("Save or cancel your lineup before opening another reference.");
      return;
    }
    setSelectedId(item.id);
    history.replaceState(null, "", lineupLink(item, location.href));
    if (item.userCreated || item.videoUrl || utilityPhotos(item).length) openMedia(item);
  }
  function selectMarker(group: UtilityMarkerGroup, trigger: SVGElement, animate = true) {
    if (editing) {
      onNotify("Save or cancel your lineup before opening another reference.");
      return;
    }
    const box = trigger.getBoundingClientRect();
    selectionRequest.current++;
    setLoadingStanding(false);
    const choice = {
      records: group.records,
      anchor: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      target: {x:group.x,y:group.y,levelId,label:group.label},
      trigger,
      animate,
    };
    const available = UTILITY_TYPES.filter(type => group.records.some(record => record.type === type));
    if(available.length === 1) chooseTargetUtility(available[0],choice);
    else setMarkerChoice(choice);
  }
  function chooseTargetUtility(type: UtilityType, choice = markerChoice) {
    if (!choice) return;
    const records = choice.records.filter(record => record.type === type);
    if(!records.length) return;
    const animate = choice.animate && !document.activeElement?.matches(":focus-visible");
    selectionRequest.current++;
    setLandingSelection({records,type,target:choice.target,animate});
    setMarkerChoice(null);
    setSelectedId(null);
    setTargetLabelId(null);
    const destinations = splitUtilityDestinations(records);
    if(destinations.length === 1) {
      setLandingSelection(null);
      const destination = destinations[0];
      void openThrowFrom(destination.records,type,{
        x:destination.x,y:destination.y,levelId:choice.target.levelId,label:destination.label,name:destination.records[0]?.target,variant:destination.variant,
      },animate);
    }
  }
  function chooseLandingSpot(group: UtilityMarkerGroup, keyboard = false) {
    if(!landingSelection) return;
    void openThrowFrom(group.records,landingSelection.type,{
      x:group.x,y:group.y,levelId:landingSelection.target.levelId,label:group.label,name:group.records[0]?.target,variant:group.variant,
    },landingSelection.animate && !keyboard && !document.activeElement?.matches(":focus-visible"));
  }
  async function openThrowFrom(input: UtilityReference[], type: UtilityType, target: MapSelection["target"], animate: boolean) {
    const request = ++selectionRequest.current;
    const choices=originRecipeOptions(input);
    if(!choices.length)return;
    if(choices.length===1&&choices[0].userCreated){
      setOriginSelection(null);setOriginChoice(null);setLandingSelection(null);setMarkerChoice(null);
      setLoadingStanding(false);setMarkerFilter([]);selectRecord(choices[0]);return;
    }
    let lookup = origins.mapId === map.id ? origins.lookup : {};
    if(choices.some(record=>!record.userCreated)&&!Object.keys(lookup).length) {
      setLoadingStanding(true);
      try {
        lookup = await loadMapOrigins(map.id);
        if(!alive.current || selectionRequest.current !== request) return;
        setOrigins({mapId:map.id,lookup,error:""});
      } catch {
        if(!alive.current || selectionRequest.current!==request)return;
        if(alive.current && selectionRequest.current === request)
          onNotify("Standing locations couldn’t load. Choose the spot again to retry.");
        if(!choices.some(record=>record.userCreated))return;
      } finally {
        if(alive.current && selectionRequest.current === request) setLoadingStanding(false);
      }
    }
    // All source recipes remain available. Nearby hit areas form an expandable
    // map choice instead of deleting numbered spawns or limiting origins to four.
    const first = choices.find(record=>!record.userCreated&&findLineupOrigin(record,lookup));
    const point = first?findLineupOrigin(first,lookup,levelId):undefined;
    setOriginSelection({records:choices,type,target,animate});
    setLoadingStanding(false);
    setLandingSelection(null);
    setMarkerChoice(null);
    setSelectedId(null);
    setMarkerFilter([]);
    if(point) setLevelId(point.levelId);
  }
  function backToTargets() {
    selectionRequest.current++;
    setLoadingStanding(false);
    const selection = originSelection || landingSelection;
    if(selection) {
      setLevelId(selection.target.levelId);
      history.replaceState(null,"",`#utilities?${new URLSearchParams({map:map.id,level:selection.target.levelId,side})}`);
    }
    setOriginSelection(null);
    setOriginChoice(null);
    setLandingSelection(null);
    
    setSelectedId(null);
  }
  function chooseOriginGroup(group:OriginChoiceGroup,trigger:SVGElement){
    if(group.options.length===1){selectRecord(group.options[0].record);return;}
    const bounds=trigger.getBoundingClientRect();
    setOriginChoice({group,trigger,anchor:{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2}});
  }
  function openMedia(item: UtilityReference) {
    setMediaRecord(item);
    requestAnimationFrame(() => mediaDialog.current?.showModal());
  }
  async function copyLineup(item: UtilityReference) {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(lineupLink(item, location.href));
      onNotify(
        "Local lineup link copied. Personal guides need a lineup export or workspace backup on another device.",
      );
    } catch {
      onNotify(
        "The browser could not copy the link. Export the lineup to share it.",
      );
    }
  }
  function changeLevel(id: string) {
    setMarkerFilter([]);
    setLevelId(id);
    setSelectedId(null);
    navigation.reset();
    setPlacing(false);
    if(!originSelection && !landingSelection) history.replaceState(
      null,
      "",
      `#utilities?${new URLSearchParams({ map: map.id, level: id, side })}`,
    );
    if (editing) setDraft((current) => ({ ...current, levelId: id }));
  }
  function toggleFavorite(item: UtilityReference) {
    const previous = readUtilityFavorites();
    const next = previous.includes(item.id)
      ? previous.filter((id) => id !== item.id)
      : [...previous, item.id].slice(-500);
    try {
      localStorage.setItem(FAVORITE_UTILITIES_KEY, JSON.stringify(next));
      setFavorites(next);
    } catch {
      onNotify(
        "Saved utilities could not be updated. Browser storage is full or unavailable; your lineup is still open.",
      );
    }
  }
  function startEditor(item?: UtilityReference) {
    const recovered = !item ? readRecovery(map) : undefined;
    const next = item
      ? fromReference(item)
      : recovered?.draft || blankDraft(levelId, side);
    setDraft(next);
    setLevelId(next.levelId);
    onSideChange(next.side);
    setEditingId(item?.userCreated ? item.id : recovered?.editingId || null);
    setEditing(true);
    setPlacing(false);
    setFormError("");
    requestAnimationFrame(() => {
      titleRef.current?.focus();
      panelRef.current?.scrollIntoView({ block: "nearest" });
    });
  }
  function cancelEditor() {
    recoveredDrafts.delete(map.id);
    try {
      localStorage.removeItem(recoveryKey(map.id));
    } catch {
      /* Session draft is still cleared. */
    }
    setEditing(false);
    setEditingId(null);
    setFormError("");
    setPlacing(false);
  }
  function draftReference(): UtilityReference {
    const steps = draft.steps
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean);
    if (!draft.title.trim() || !draft.target.trim() || !steps.length)
      throw new Error(
        "Add a title, target callout, and at least one instruction to save your lineup.",
      );
    if (steps.length > 20 || steps.some((step) => step.length > 500))
      throw new Error(
        "Use up to 20 instructions, each shorter than 501 characters.",
      );
    const start = (draft.videoStart || "").trim();
    if (
      start &&
      (!Number.isFinite(Number(start)) ||
        Number(start) < 0 ||
        Number(start) > 86_400)
    )
      throw new Error("Use a video start between 0 and 86400 seconds.");
    const video = parseUtilityVideo(
      draft.videoUrl || "",
      start ? Number(start) : undefined,
    );
    const record: UtilityReference = {
      id: editingId || uid(),
      mapId: map.id,
      levelId: draft.levelId,
      side: draft.side,
      type: draft.type,
      title: draft.title.trim(),
      from: draft.from.trim(),
      target: draft.target.trim(),
      purpose: draft.purpose.trim(),
      throwType: draft.throwType.trim(),
      steps,
      x: boundedPosition(draft.x),
      y: boundedPosition(draft.y),
      userCreated: true,
      ...(draft.showMarker === false ? { showMarker: false } : {}),
      ...(draft.site ? { site: draft.site } : {}),
      ...(draft.tags ? { tags: draft.tags } : {}),
      ...(draft.remotePhotos?.length
        ? { remotePhotos: draft.remotePhotos }
        : {}),
      ...(draft.photoEmbed ? { photoEmbed: draft.photoEmbed } : {}),
      ...(draftPhotos.length
        ? { photos: draftPhotos }
        : draft.image
          ? { image: draft.image }
          : {}),
      ...(draft.source.trim() ? { source: safeSource(draft.source) } : {}),
      ...(video ? { videoUrl: video.url, videoStart: video.start } : {}),
      ...(video && draft.videoFallbackUrl ? { videoFallbackUrl: draft.videoFallbackUrl } : {}),
      ...((draft.creator || "").trim()
        ? { creator: draft.creator.trim() }
        : {}),
    };
    if (!validateUtility(record))
      throw new Error(
        "Check the field lengths, source link, and screenshot, then try saving again.",
      );
    return record;
  }
  async function saveLineup(event: FormEvent) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    try {
      const [record] = await storeLineupMedia([draftReference()]);
      const existing = readUserUtilities();
      if (!editingId && existing.length >= MAX_USER_UTILITIES)
        throw new Error(
          `This browser has ${MAX_USER_UTILITIES} personal lineups. Export and remove one before adding another.`,
        );
      const next = [
        record,
        ...existing.filter((item) => item.id !== record.id),
      ];
      try {
        localStorage.setItem(USER_UTILITIES_KEY, JSON.stringify(next));
      } catch {
        throw new Error(
          "Browser storage is full or unavailable. Your draft is still open. Export the draft below to keep a backup.",
        );
      }
      setCustom(next);
      setTypes([]);

      setSavedOnly(false);
      setSelectedId(record.id);
      setLevelId(record.levelId);
      onSideChange(record.side);
      cancelEditor();
      history.replaceState(null, "", lineupLink(record, location.href));
      openMedia(record);
      onNotify(
        editingId
          ? "Your lineup was updated on this device."
          : "Your lineup was saved on this device.",
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "The lineup could not be saved. Keep this form open and export a backup.",
      );
      if (!draft.title.trim()) titleRef.current?.focus();
      else if (!draft.target.trim())
        form.querySelector<HTMLInputElement>('[name="lineup-target"]')?.focus();
      else if (!draft.steps.trim())
        form
          .querySelector<HTMLTextAreaElement>('[name="lineup-steps"]')
          ?.focus();
    } finally {
      setSaving(false);
    }
  }
  async function exportDraft() {
    try {
      await downloadLineup(draftReference());
      onNotify("Lineup backup prepared for download.");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Add the required fields before exporting.",
      );
    }
  }
  async function importLineup(file: File | undefined) {
    if (!file) return;
    setSaving(true);
    try {
      if (file.size > 5_000_000)
        throw new Error("Choose a lineup JSON file smaller than 5 MB.");
      const data = JSON.parse(await file.text());
      if (data?.format !== "utility-lab-lineup" || data.version !== 1)
        throw new Error("Choose a Utility Lab lineup export.");
      const record = validateUtility(data.lineup);
      if (
        record &&
        [
          record.image,
          ...(record.photos || []).map((photo) => photo.image),
        ].some((image) => image?.startsWith("ul-media:"))
      )
        throw new Error(
          "This file is missing its photos. Export a complete lineup from the original device.",
        );
      if (
        !record ||
        !MAPS.some(
          (item) =>
            item.id === record.mapId &&
            item.levels.some((level) => level.id === record.levelId),
        )
      )
        throw new Error(
          "This lineup is invalid or uses a map outside the supported pool.",
        );
      const existing = readUserUtilities();
      if (existing.length >= MAX_USER_UTILITIES)
        throw new Error(
          "Your personal library is full. Export and remove a lineup before importing another.",
        );
      const [saved] = await storeLineupMedia([
        {
          ...record,
          id: existing.some((item) => item.id === record.id)
            ? uid()
            : record.id,
        },
      ]);
      const next = [saved, ...existing];
      localStorage.setItem(USER_UTILITIES_KEY, JSON.stringify(next));
      setCustom(next);
      onNotify("Lineup imported with its photos and instructions.");
      onOpenLineup?.(saved);
    } catch (error) {
      onNotify(
        error instanceof Error
          ? error.message
          : "This lineup could not be imported. Your library was kept.",
      );
    } finally {
      setSaving(false);
      if (importRef.current) importRef.current.value = "";
    }
  }
  function deleteLineup(item: UtilityReference) {
    if (
      !window.confirm(
        `Remove your saved lineup “${item.title}”? Export it first if you want a backup.`,
      )
    )
      return;
    try {
      const next = readUserUtilities().filter(
        (record) => record.id !== item.id,
      );
      localStorage.setItem(USER_UTILITIES_KEY, JSON.stringify(next));
      setCustom(next);
      setSelectedId(null);
      if(mediaRecord?.id === item.id) mediaDialog.current?.close();
      onNotify("Your saved lineup was removed from this device.");
    } catch {
      onNotify(
        "Could not remove the lineup because browser storage is unavailable. The saved lineup was kept.",
      );
    }
  }
  async function addScreenshot(files: FileList | null) {
    if (!files?.length) return;
    const context = currentContext.current;
    setFormError("");
    if (draftPhotos.length + files.length > MAX_LINEUP_PHOTOS) {
      setFormError(
        "Keep up to 4 photos per lineup. Remove a photo before adding another.",
      );
      return;
    }
    setImageLoading(true);
    try {
      const [expanded] = await portableLineups([
        {
          id: "photo-draft",
          mapId: map.id,
          levelId,
          side,
          type: "Smoke",
          title: "Draft",
          target: "Draft",
          from: "",
          purpose: "",
          throwType: "",
          steps: [],
          x: 500,
          y: 500,
          userCreated: true,
          photos: draftPhotos,
        },
      ]);
      const next: UtilityPhoto[] = [...(expanded.photos || [])];
      for (const file of Array.from(files)) {
        const image = await prepareLineupPhoto(file);
        if (
          next.reduce((sum, photo) => sum + photo.image.length, 0) +
            image.length >
          MAX_PHOTO_DATA_CHARS
        )
          throw new Error(
            "These photos exceed the combined 2 MB limit. Choose fewer or smaller photos.",
          );
        next.push({ image, caption: "" });
      }
      const [prepared] = await storeLineupMedia([
        {
          id: "photo-draft",
          mapId: map.id,
          levelId,
          side,
          type: "Smoke",
          title: "Draft",
          target: "Draft",
          from: "",
          purpose: "",
          throwType: "",
          steps: [],
          x: 500,
          y: 500,
          userCreated: true,
          photos: next,
        },
      ]);
      if (alive.current && context === currentContext.current)
        setDraft((current) => ({
          ...current,
          photos: prepared.photos || [],
          image: "",
        }));
    } catch (error) {
      if (alive.current)
        setFormError(
          error instanceof Error
            ? error.message
            : "The photos could not be read. Try another file.",
        );
    } finally {
      if (alive.current) {
        setImageLoading(false);
        if (screenshotRef.current) screenshotRef.current.value = "";
      }
    }
  }
  function setTargetOnMap(event: React.MouseEvent<SVGSVGElement>) {
    if (!editing || !placing) return;
    const svg = event.currentTarget;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    setDraft((current) => ({
      ...current,
      showMarker: true,
      x: boundedPosition(point.x),
      y: boundedPosition(point.y),
    }));
    setPlacing(false);
    titleRef.current?.focus();
  }
  const setDraftField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === "videoUrl" ? { videoFallbackUrl: undefined } : {}),
      ...(["x", "y"].includes(key) ? { showMarker: true } : {}),
    }));

  return (
    <section
      className={`utility-workspace${compact ? " ul-compact" : ""}${!editing ? " ul-map-only" : ""}`}
      aria-busy={catalogue.loading || catalogue.mapId !== map.id}
      data-reference-count={visibleRecords.length}
      aria-label="Utility library"
    >
      <div className="ul-map-controls">
      <header className="ul-header">
        <div className="ul-heading">
          <h2>Lineups</h2>
        </div>
        <div className="ul-context-controls">
          <button
            className="ul-map-chip"
            aria-label="Change map"
            onClick={onOpenMaps}
          >
            <MapPinned size={18} />
            <span>{map.name}</span>
            <ChevronDown size={14} />
          </button>
          <div
            className="ul-side-toggle"
            role="group"
            aria-label="Utility side"
          >
            <button
              aria-pressed={side === "T"}
              disabled={editing}
              className={side === "T" ? "is-active" : ""}
              onClick={() => {if(originSelection || landingSelection) backToTargets();onSideChange("T");}}
            >
              <UserRound size={15} />
              <span>T side</span>
            </button>
            <button
              aria-pressed={side === "CT"}
              disabled={editing}
              className={side === "CT" ? "is-active" : ""}
              onClick={() => {if(originSelection || landingSelection) backToTargets();onSideChange("CT");}}
            >
              <Shield size={15} />
              <span>CT side</span>
            </button>
          </div>
          <LineupSuggestions map={map} side={side} onNotify={onNotify} />
        </div>
      </header>
      <div className="ul-filterbar">
        <div className="ul-types" role="group" aria-label="Utility type">
          {(["All", ...UTILITY_TYPES] as const).map((item) => (
            <button
              key={item}
              data-utility={item}
              aria-pressed={item === "All" ? !types.length : types.includes(item)}
              className={(item === "All" ? !types.length : types.includes(item)) ? "is-active" : ""}
              onClick={() => {
                if(originSelection || landingSelection) backToTargets();
                setTypes(current => item === "All" ? [] : current.includes(item) ? current.filter(type => type !== item) : [...current,item]);
                setMarkerFilter([]);
              }}
            >
              {item === "All" ? (
                <span className="ul-all-icon">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <UtilityIcon type={item} />
              )}
              <span>
                {item === "All"
                  ? "All"
                  : item === "HE"
                    ? "HE"
                    : utilityLabel(item)}
              </span>
              <small>
                {
                  filterCountRecords.filter(
                    (record) => item === "All" || record.type === item,
                  ).length
                }
              </small>
            </button>
          ))}
        </div>
        <button
          className={`ul-favorites-filter${savedOnly ? " is-active" : ""}`}
          aria-label={`Saved ${countContext.filter(item => favorites.includes(item.id)).length}`}
          title="Saved lineups"
          aria-pressed={savedOnly}
          onClick={() => {if(originSelection || landingSelection) backToTargets();setSavedOnly(!savedOnly);}}
        >
          <Star size={15} fill={savedOnly ? "currentColor" : "none"} />
          <span>Saved</span>
          <small>
            {
              countContext.filter((item) => favorites.includes(item.id))
                .length
            }
          </small>
        </button>
      </div>
      </div>
      <div className="ul-workspace-body">
        <div className="ul-map-area">
          <div className="ul-map-top">
            <div
              className="ul-levels"
              role="group"
              aria-label="Utility map level"
            >
              {map.levels.length > 1 ? (
                map.levels.map((item) => (
                  <button
                    key={item.id}
                    className={levelId === item.id ? "is-active" : ""}
                    aria-pressed={levelId === item.id}
                    disabled={!!landingSelection ? item.id !== landingSelection.target.levelId : !!originSelection && !originFloors.some(floor => floor.id === item.id)}
                    onClick={() => changeLevel(item.id)}
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <span>{level?.name || "Overview"}</span>
              )}
            </div>
            {originSelection || landingSelection || loadingStanding ? <button className="ul-origin-back ul-text-button" onClick={backToTargets}><ArrowLeft size={16}/>Back to targets</button> : <span className="ul-map-count">{visibleRecords.length} {visibleRecords.length === 1 ? "reference" : "references"}</span>}
          </div>
          <div className={`ul-map-stage${placing ? " is-placing" : ""}`}>
            <svg
              ref={svgRef}
              className={`ul-map-svg${!sourceImage.endsWith(".svg") ? " is-raster" : ""}${navigation.hand || navigation.space ? " is-hand" : ""}${navigation.panning ? " is-panning" : ""}`}
              viewBox={navigation.viewBox}
              role="group"
              aria-label={`${map.name} ${level?.name || ""} utility map`}
              aria-describedby="utility-map-navigation-help"
              tabIndex={0}
              {...navigation.handlers}
              onClick={(event) => {
                if (!navigation.shouldIgnoreClick()) setTargetOnMap(event);
              }}
            >
              {mapImage && !mapFailed && (
                <image
                  href={mapImage}
                  x="0"
                  y="0"
                  width="1000"
                  height="1000"
                  preserveAspectRatio="xMidYMid meet"
                  className="ul-radar-image"
                  onError={() => {
                    if (mapImage !== sourceImage) setMapFallback(true);
                    else setMapFailed(true);
                  }}
                />
              )}
              <g role={landingSelection ? "group" : undefined} aria-label={landingSelection ? "Landing locations" : undefined} aria-busy={landingSelection ? loadingStanding : undefined}
                visibility={markerChoice || loadingStanding ? "hidden" : undefined}
                aria-hidden={markerChoice || loadingStanding ? true : undefined}>
              {!mapFailed && !originSelection && !!landingSelection && <g className="ul-target-leaders" aria-hidden="true" pointerEvents="none">
                {laidOutMarkers.filter(group => group.inView && Math.hypot(group.displayX-group.x,group.displayY-group.y)>mapUnit).map(group => <g key={group.id}>
                  <line x1={group.x} y1={group.y} x2={group.displayX} y2={group.displayY} strokeWidth={mapUnit}/>
                  <circle cx={group.x} cy={group.y} r={2.5*mapUnit}/>
                </g>)}
              </g>}
              {!mapFailed && !originSelection && laidOutMarkers.filter(group => group.inView).map((group,index) => {
                const available = UTILITY_TYPES.filter(type => group.records.some(record => record.type === type));
                const active = !landingSelection && !!selectedId && group.records.some(record => record.id === selectedId);
                const groupedAreas = !landingSelection ? clusterById.get(group.id)?.areas || [group] : [];
                const grouped = groupedAreas.length > 1;
                const locationNames = groupedAreas.map(area=>area.label).join(", ");
                return <g key={group.id} className={`ul-map-marker${landingSelection ? " ul-landing-pin" : ""}${active ? " is-selected" : ""}`}
                  transform={`translate(${group.displayX} ${group.displayY})`} role="button" tabIndex={markerChoice || loadingStanding ? -1 : 0}
                  data-target-area={group.areaId} data-target-label={group.label}
                  data-group-area-ids={!landingSelection ? JSON.stringify(groupedAreas.map(area=>area.areaId)) : undefined}
                  data-group-area-labels={!landingSelection ? JSON.stringify(groupedAreas.map(area=>area.label)) : undefined}
                  data-group-size={!landingSelection ? groupedAreas.length : undefined}
                  data-target-destinations={landingSelection ? undefined : destinationCounts.get(group.id)}
                  data-target-x={group.x} data-target-y={group.y}
                  data-landing-id={landingSelection ? group.id : undefined}
                  data-landing-x={landingSelection ? group.x : undefined} data-landing-y={landingSelection ? group.y : undefined}
                  data-landing-level={landingSelection?.target.levelId}
                  aria-label={landingSelection ? `${group.label}, landing spot ${index+1}, choose throw-from location` : `${grouped ? locationNames : group.label}: ${available.map(utilityLabel).join(", ")}, choose utility`}
                  aria-pressed={landingSelection ? undefined : active} aria-haspopup={landingSelection ? undefined : "dialog"} aria-controls={landingSelection ? undefined : "ul-map-lineup-choices"}
                  aria-expanded={landingSelection ? undefined : !!markerChoice?.records.some(record => group.records.some(item => item.id === record.id))}
                  onPointerEnter={() => setTargetLabelId(group.id)}
                  onPointerLeave={() => setTargetLabelId(null)}
                  onFocus={() => setTargetLabelId(group.id)}
                  onBlur={() => setTargetLabelId(null)}
                  onClick={event => {
                    if(navigation.shouldIgnoreClick() || placing) return;
                    event.stopPropagation();
                    if(landingSelection) chooseLandingSpot(group); else selectMarker(group,event.currentTarget);
                  }}
                  onKeyDown={event => {
                    if(event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if(landingSelection) chooseLandingSpot(group,true); else selectMarker(group,event.currentTarget,false);
                    }
                  }}>
                  <title>{grouped ? locationNames : group.label} — {landingSelection ? "choose throw-from location" : "choose utility"}</title>
                  <circle className="ul-marker-hit" r={23 * mapUnit} fill="transparent"/>
                  <g className={landingSelection?.animate ? "ul-origin-glyph can-animate" : undefined}>
                  {grouped && <circle cx={3*mapUnit} cy={-3*mapUnit} r={18*mapUnit} className="ul-group-stack" strokeWidth={mapUnit}/>}
                  <UtilityTargetMarker types={available} radius={18 * mapUnit} compact={!landingSelection}/>
                  </g>
                </g>;
              })}
              {!mapFailed && !originSelection && !markerChoice && !loadingStanding && <g aria-hidden="true" pointerEvents="none">
                {laidOutMarkers.filter(group => group.inView && (group.id === targetLabelId || (!!landingSelection && laidOutMarkers.length <= 6))).map(group => <text
                  key={group.id} className="ul-target-label" textAnchor="middle"
                  x={group.displayX} y={group.displayY+33*mapUnit} fontSize={11*mapUnit}
                  strokeWidth={4*mapUnit}>{!landingSelection && (clusterById.get(group.id)?.areas.length || 0)>1 ? `${clusterById.get(group.id)!.areas.length} locations` : group.label}</text>)}
              </g>}
              </g>
              {!mapFailed && originSelection && <g role="group" aria-label={originChoices.length?'Throw-from locations':'Your lineup targets'}
                data-target-x={originSelection.target.x} data-target-y={originSelection.target.y}
                data-target-level={originSelection.target.levelId} data-target-label={originSelection.target.label}
                data-target-name={originSelection.target.name||originSelection.target.label} data-target-variant={originSelection.target.variant}
                data-target-utility={originSelection.type}>
                {originSelection.target.levelId === levelId && <g className="ul-origin-target" transform={`translate(${originSelection.target.x} ${originSelection.target.y})`} aria-hidden="true">
                  <circle r={13 * mapUnit} fill="var(--surface-raised)" stroke={utilityColor(originSelection.type)} strokeWidth={2 * mapUnit}/>
                  <circle r={4 * mapUnit} fill={utilityColor(originSelection.type)}/>
                  <text className="ul-origin-label" textAnchor="middle" y={25*mapUnit} fontSize={11*mapUnit} strokeWidth={3*mapUnit}>{originSelection.target.label}</text>
                </g>}
                {originGroups.map((group,index) => <g key={group.id}
                  visibility={originChoice?"hidden":undefined} aria-hidden={originChoice?true:undefined}
                  className="ul-origin-pin" transform={`translate(${group.point.x} ${group.point.y})`}
                  role="button" tabIndex={originChoice?-1:0} aria-label={`Throw from ${group.label}${group.options.length>1?`, ${group.options.length} options`:''}`}
                  data-origin-x={group.point.x} data-origin-y={group.point.y} data-origin-level={group.point.levelId}
                  data-origin-recipes={JSON.stringify(group.options.map(option=>option.record.id))}
                  onClick={event => {if(navigation.shouldIgnoreClick())return;event.stopPropagation();chooseOriginGroup(group,event.currentTarget);}}
                  onKeyDown={event => {if(event.key === "Enter" || event.key === " "){event.preventDefault();chooseOriginGroup(group,event.currentTarget);}}}>
                  <title>{group.label} — {group.options.length>1?`${group.options.length} throws`:'open photos'}</title>
                  <circle r={23 * mapUnit} fill="transparent"/>
                  <g className={originSelection.animate ? "ul-origin-glyph can-animate" : "ul-origin-glyph"} style={{animationDelay:`${index * 30}ms`}}>
                    <circle className="ul-origin-disc" r={15 * mapUnit} strokeWidth={1.5 * mapUnit}/>
                    <Crosshair x={-9 * mapUnit} y={-9 * mapUnit} size={18 * mapUnit} strokeWidth={2}/>
                    {group.options.length>1&&<g className="ul-origin-count"><circle cx={13*mapUnit} cy={-12*mapUnit} r={8*mapUnit}/><text x={13*mapUnit} y={-9*mapUnit} textAnchor="middle" fontSize={9*mapUnit}>{group.options.length}</text></g>}
                    <text className="ul-origin-label" textAnchor="middle" y={-23 * mapUnit} fontSize={11 * mapUnit} strokeWidth={3 * mapUnit}>{group.label.length > 23 ? `${group.label.slice(0,22)}…` : group.label}</text>
                  </g>
                </g>)}
                {!originChoice&&personalMarkers.some(group=>group.displayX!==group.target.x||group.displayY!==group.target.y)&&<g aria-hidden="true" pointerEvents="none">
                  {personalMarkers.filter(group=>group.displayX!==group.target.x||group.displayY!==group.target.y).map(group=><line key={group.id}
                    x1={group.target.x} y1={group.target.y} x2={group.displayX} y2={group.displayY}
                    stroke="var(--muted)" strokeWidth={mapUnit}/>)}</g>}
                {personalMarkers.map(group=><g key={group.id}
                  visibility={originChoice?"hidden":undefined} aria-hidden={originChoice?true:undefined}
                  className="ul-personal-guide-pin" transform={`translate(${group.displayX} ${group.displayY})`}
                  style={{color:'var(--accent)',cursor:'pointer'}}
                  role="button" tabIndex={originChoice?-1:0}
                  aria-label={`${group.label}${group.options.length>1?`, ${group.options.length} saved lineups`:''}`}
                  data-personal-target-x={group.target.x} data-personal-target-y={group.target.y}
                  data-personal-recipes={JSON.stringify(group.options.map(option=>option.record.id))}
                  onClick={event=>{if(navigation.shouldIgnoreClick())return;event.stopPropagation();chooseOriginGroup(group,event.currentTarget);}}
                  onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();chooseOriginGroup(group,event.currentTarget);}}}>
                  <title>{group.label} — open your saved guide at its target</title>
                  <circle r={23*mapUnit} fill="transparent"/>
                  <circle className="ul-origin-disc" r={15*mapUnit} strokeWidth={1.5*mapUnit}/>
                  <UserRound x={-9*mapUnit} y={-9*mapUnit} size={18*mapUnit} strokeWidth={2}/>
                  <text className="ul-origin-label" textAnchor="middle" y={-23*mapUnit} fontSize={11*mapUnit} strokeWidth={3*mapUnit}>{group.label}</text>
                </g>)}
              </g>}

              {editing && (draft.showMarker !== false || placing) && (
                <g
                  transform={`translate(${draft.x} ${draft.y})`}
                  aria-label="Your lineup target"
                >
                  <circle
                    r={23 * mapUnit}
                    className="ul-draft-ring"
                    strokeWidth={2 * mapUnit}
                    fill="none"
                    strokeDasharray={`${4 * mapUnit} ${3 * mapUnit}`}
                  />
                  <path
                    d={`M ${-8 * mapUnit} 0 H ${8 * mapUnit} M 0 ${-8 * mapUnit} V ${8 * mapUnit}`}
                    className="ul-draft-cross"
                    strokeWidth={2 * mapUnit}
                  />
                </g>
              )}
            </svg>
            {!mapFailed && (catalogue.loading || catalogue.mapId !== map.id) && <p className="ul-map-feedback" role="status">Loading lineups…</p>}
            {!mapFailed && catalogue.error && <div className="ul-map-feedback" role="alert">{catalogue.error}<button className="ul-text-button" onClick={() => setCatalogueRetry(attempt => attempt+1)}>Try again</button></div>}
            {!mapFailed && !catalogue.loading && !catalogue.error && !visibleRecords.length && <div className="ul-map-feedback" role="status">
              {savedOnly ? "No saved lineups on this map yet." : "No lineups match these filters."}
              <button className="ul-text-button" onClick={() => {setTypes([]);setSavedOnly(false);setMarkerFilter([]);}}>Show all</button>
              {map.levels.length > 1 && levelId !== map.levels[0].id && <button className="ul-text-button" onClick={() => changeLevel(map.levels[0].id)}>View {map.levels[0].name} guides</button>}
            </div>}
            {loadingStanding && <p className="ul-map-feedback" role="status">Loading throw-from locations…</p>}
            {mapFailed && (
              <div className="ul-map-error">
                <MapPinned size={28} />
                <h2>The radar could not load.</h2>
                <p>Reload the radar to choose your lineup.</p>
                <button
                  className="ul-secondary-button"
                  onClick={() => {
                    setMapFailed(false);
                    setMapFallback(false);
                  }}
                >
                  Try the map again
                </button>
              </div>
            )}
            {placing && (
              <div className="ul-placement-hint">
                <Crosshair size={16} />
                Click the map to set your target.
                <button
                  aria-label="Cancel target placement"
                  onClick={() => setPlacing(false)}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="ul-map-bottom">
            <p>
              <Info size={14} />
              <span>{landingSelection ? "Choose the exact landing spot." : originSelection ? "Choose where to throw from." : "Choose a target, then utility."}</span>
            </p>
            <div className="ul-zoom">
              <button
                className={navigation.hand ? "is-active" : ""}
                aria-label="Pan utility map"
                aria-pressed={navigation.hand}
                title="Hand tool (G). Space or middle-button drag also pans."
                onClick={navigation.toggleHand}
              >
                <Hand size={16} />
              </button>
              <button
                aria-label="Zoom utility map out"
                disabled={zoom <= 1}
                onClick={() => navigation.zoomBy(1 / 1.25)}
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={navigation.reset}
                aria-label="Reset utility map zoom"
                title="Fit map (0)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                aria-label="Zoom utility map in"
                disabled={zoom >= 4}
                onClick={() => navigation.zoomBy(1.25)}
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
          <p
            id="utility-map-navigation-help"
            className="ul-navigation-help"
            title="Drag empty space, hold Space and drag, or use the hand tool to pan. Scroll or +/− to zoom; 0 fits the map. Arrow keys pan while the map is focused."
          >
            <span className="ul-navigation-desktop">
              Drag to pan · Scroll to zoom · 0 to fit
            </span>
            <span className="ul-navigation-touch">
              Drag to pan · Pinch to zoom
            </span>
            <span className="ul-navigation-shortcuts">
              . Keyboard: + or − to zoom, 0 to fit, arrow keys to pan. Space and
              drag pans while placing a target.
            </span>
          </p>
          <footer className="ul-map-credit">
            {sourceImage.endsWith(".svg") ? (
              <a href="https://setpos.gg" target="_blank" rel="noreferrer">
                Minimaps by setpos.gg
              </a>
            ) : (
              <span>Radar artwork © Valve and the map creators</span>
            )}
          </footer>
        </div>
        {editing && <aside
          ref={panelRef}
          className={`ul-sidebar${editing ? " is-editing" : ""}`}
          aria-label={
            editing ? "Add or edit utility lineup" : "Utility references"
          }
        >
            <>
              <div className="ul-editor-heading">
                <button
                  className="ul-icon-button"
                  aria-label="Back to utility references"
                  onClick={cancelEditor}
                >
                  <ArrowLeft size={19} />
                </button>
                <div>
                  <h2>{editingId ? "Edit your lineup" : "Add your lineup"}</h2>
                  <p>Keep your tested notes on this device.</p>
                </div>
              </div>
              <form className="ul-lineup-form" onSubmit={saveLineup} noValidate>
                <label className="ul-field">
                  Title
                  <input
                    ref={titleRef}
                    name="lineup-title"
                    autoComplete="off"
                    value={draft.title}
                    maxLength={100}
                    onChange={(event) =>
                      setDraftField("title", event.target.value)
                    }
                    placeholder="e.g. Window from T spawn…"
                    required
                  />
                </label>
                <div className="ul-form-grid">
                  <label className="ul-field">
                    Side
                    <select
                      name="lineup-side"
                      value={draft.side}
                      onChange={(event) =>
                        setDraftField("side", event.target.value as "T" | "CT")
                      }
                    >
                      <option value="T">T side</option>
                      <option value="CT">CT side</option>
                    </select>
                  </label>
                  <label className="ul-field">
                    Utility
                    <select
                      name="lineup-type"
                      value={draft.type}
                      onChange={(event) =>
                        setDraftField("type", event.target.value as UtilityType)
                      }
                    >
                      {UTILITY_TYPES.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="ul-field">
                  Target callout
                  <input
                    name="lineup-target"
                    autoComplete="off"
                    maxLength={100}
                    value={draft.target}
                    onChange={(event) =>
                      setDraftField("target", event.target.value)
                    }
                    placeholder="e.g. Window…"
                    required
                  />
                </label>
                <label className="ul-field">
                  Throwing position
                  <input
                    name="lineup-from"
                    autoComplete="off"
                    maxLength={100}
                    value={draft.from}
                    onChange={(event) =>
                      setDraftField("from", event.target.value)
                    }
                    placeholder="Where do you stand?…"
                  />
                </label>
                <label className="ul-field">
                  Purpose
                  <textarea
                    name="lineup-purpose"
                    rows={2}
                    maxLength={600}
                    value={draft.purpose}
                    onChange={(event) =>
                      setDraftField("purpose", event.target.value)
                    }
                    placeholder="What does this utility make possible?…"
                  />
                </label>
                <label className="ul-field">
                  Throw method
                  <select
                    name="lineup-throw"
                    aria-label="Throw method"
                    value={draft.throwType || "Not recorded"}
                    onChange={(event) =>
                      setDraftField("throwType", event.target.value)
                    }
                  >
                    {draft.throwType &&
                      !THROW_METHODS.some(
                        (item) => item === draft.throwType,
                      ) && (
                        <option value={draft.throwType}>
                          {draft.throwType.replace(
                            /middle[ -]?click/gi,
                            "Both buttons (LMB + RMB)",
                          )}
                        </option>
                      )}
                    {THROW_METHODS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <span>Both buttons means LMB + RMB together.</span>
                </label>
                <ThrowInputs method={draft.throwType} />
                <label className="ul-field">
                  Instructions <span>One step per line</span>
                  <textarea
                    name="lineup-steps"
                    rows={5}
                    maxLength={7000}
                    value={draft.steps}
                    onChange={(event) =>
                      setDraftField("steps", event.target.value)
                    }
                    placeholder="Record your position, aim reference, and throw…"
                    required
                  />
                </label>
                <fieldset className="ul-target-position">
                  <legend>Target on the map</legend>
                  <div className="ul-position-inputs">
                    <label>
                      X
                      <input
                        type="number"
                        name="lineup-x"
                        min={0}
                        max={1000}
                        step={.01}
                        value={draft.x}
                        onChange={(event) =>
                          setDraftField(
                            "x",
                            boundedPosition(Number(event.target.value) || 0),
                          )
                        }
                      />
                    </label>
                    <label>
                      Y
                      <input
                        type="number"
                        name="lineup-y"
                        min={0}
                        max={1000}
                        step={.01}
                        value={draft.y}
                        onChange={(event) =>
                          setDraftField(
                            "y",
                            boundedPosition(Number(event.target.value) || 0),
                          )
                        }
                      />
                    </label>
                  </div>
                  <button
                    className={`ul-secondary-button${placing ? " is-active" : ""}`}
                    type="button"
                    onClick={() => {
                      setPlacing(!placing);
                      svgRef.current?.scrollIntoView({ block: "center" });
                    }}
                  >
                    <Crosshair size={15} />
                    {placing ? "Cancel map placement" : "Choose target on map"}
                  </button>
                  <span>Map positions use a 0–1000 scale.</span>
                  <label className="ul-pin-choice">
                    <input
                      type="checkbox"
                      checked={draft.showMarker !== false}
                      onChange={(event) =>
                        setDraftField("showMarker", event.target.checked)
                      }
                    />
                    Show target on map
                  </label>
                </fieldset>
                <div className="ul-screenshot-field">
                  <span className="ul-field-label">
                    Photo steps{" "}
                    <small>
                      Up to 4 photos · about 2 MB combined after resizing
                    </small>
                  </span>
                  <p className="ul-photo-help">
                    Add your real standing position, aim reference, and throw
                    screenshots. Caption each step.
                  </p>
                  {!!draft.remotePhotos?.length && (
                    <div className="ul-linked-photos">
                      <span>
                        {draft.remotePhotos.length} source photos included
                      </span>
                      <button
                        type="button"
                        className="ul-text-button"
                        onClick={() => setDraftField("remotePhotos", [])}
                      >
                        Remove source photos
                      </button>
                    </div>
                  )}
                  {draftPhotos.map((photo, index) => (
                    <div className="ul-photo-edit" key={index}>
                      <div className="ul-upload-preview">
                        <MediaImage
                          src={photo.image}
                          alt={`Lineup photo ${index + 1}`}
                          width="160"
                          height="90"
                        />
                        <button
                          type="button"
                          className="ul-icon-button"
                          aria-label={`Remove photo ${index + 1}`}
                          onClick={() =>
                            setDraftField(
                              "photos",
                              draftPhotos.filter((_, at) => at !== index),
                            )
                          }
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <label className="ul-field">
                        Photo {index + 1} caption
                        <input
                          name={`photo-caption-${index}`}
                          value={photo.caption}
                          maxLength={240}
                          placeholder="e.g. Stand against this corner…"
                          onChange={(event) =>
                            setDraftField(
                              "photos",
                              draftPhotos.map((item, at) =>
                                at === index
                                  ? { ...item, caption: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="ul-photo-step-kind">
                        Photo {index + 1} type
                        <select
                          aria-label={`Photo ${index + 1} type`}
                          value={photo.kind || "context"}
                          onChange={(event) =>
                            setDraftField(
                              "photos",
                              draftPhotos.map((item, at) =>
                                at === index
                                  ? {
                                      ...item,
                                      kind: event.target
                                        .value as UtilityPhoto["kind"],
                                    }
                                  : item,
                              ),
                            )
                          }
                        >
                          <option value="position">Standing position</option>
                          <option value="aim">Aim reference</option>
                          <option value="release">Throw / release</option>
                          <option value="landing">Landing result</option>
                          <option value="context">Context / other</option>
                        </select>
                      </label>
                      <div
                        className="ul-photo-order"
                        role="group"
                        aria-label={`Reorder photo ${index + 1}`}
                      >
                        {([-1, 1] as const).map((direction) => (
                          <button
                            key={direction}
                            type="button"
                            className="ul-icon-button"
                            disabled={
                              saving ||
                              index + direction < 0 ||
                              index + direction >= draftPhotos.length
                            }
                            aria-label={`Move photo ${index + 1} ${direction < 0 ? "up" : "down"}`}
                            onClick={() => {
                              const photos = [...draftPhotos];
                              [photos[index], photos[index + direction]] = [
                                photos[index + direction],
                                photos[index],
                              ];
                              setDraftField("photos", photos);
                            }}
                          >
                            {direction < 0 ? (
                              <ArrowUp size={16} />
                            ) : (
                              <ArrowDown size={16} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="ul-secondary-button"
                    onClick={() => screenshotRef.current?.click()}
                    disabled={
                      imageLoading || draftPhotos.length >= MAX_LINEUP_PHOTOS
                    }
                  >
                    <ImagePlus size={16} />
                    {imageLoading ? "Preparing photos…" : "Add photos"}
                  </button>
                  <input
                    ref={screenshotRef}
                    className="ul-file-input"
                    aria-label="Lineup screenshot file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={(event) => void addScreenshot(event.target.files)}
                  />
                </div>
                <label className="ul-field">
                  Video URL{" "}
                  <span>Optional · YouTube or a direct https video file</span>
                  <input
                    name="lineup-video"
                    type="url"
                    autoComplete="off"
                    inputMode="url"
                    value={draft.videoUrl || ""}
                    maxLength={2000}
                    placeholder="https://www.youtube.com/watch?v=…"
                    onChange={(event) =>
                      setDraftField("videoUrl", event.target.value)
                    }
                  />
                </label>
                <div className="ul-form-grid">
                  <label className="ul-field">
                    Video start (seconds)
                    <input
                      name="lineup-video-start"
                      type="number"
                      min={0}
                      max={86400}
                      value={draft.videoStart || ""}
                      placeholder="0"
                      onChange={(event) =>
                        setDraftField("videoStart", event.target.value)
                      }
                    />
                  </label>
                  <label className="ul-field">
                    Creator
                    <input
                      name="lineup-creator"
                      autoComplete="off"
                      value={draft.creator || ""}
                      maxLength={120}
                      placeholder="Original creator…"
                      onChange={(event) =>
                        setDraftField("creator", event.target.value)
                      }
                    />
                  </label>
                </div>
                <label className="ul-field">
                  Source link <span>Optional</span>
                  <input
                    name="lineup-source"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={2000}
                    value={draft.source}
                    onChange={(event) =>
                      setDraftField("source", event.target.value)
                    }
                    placeholder="https://…"
                  />
                </label>
                {formError && (
                  <div className="ul-form-error" role="alert">
                    <Info size={17} />
                    <p>{formError}</p>
                  </div>
                )}
                <div className="ul-form-actions">
                  <button
                    className="ul-primary-button"
                    type="submit"
                    disabled={imageLoading || saving}
                  >
                    <Check size={16} />
                    {saving
                      ? "Saving…"
                      : editingId
                        ? "Update lineup"
                        : "Save lineup"}
                  </button>
                  <button
                    type="button"
                    className="ul-secondary-button"
                    onClick={cancelEditor}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
                <button
                  className="ul-backup-button"
                  type="button"
                  onClick={exportDraft}
                >
                  <ArrowDownToLine size={14} />
                  Export draft as JSON
                </button>
                <p className="ul-local-note">
                  Your screenshots and notes stay in this browser. Export
                  important lineups before clearing browser data.
                </p>
              </form>
            </>
        </aside>}
      </div>
      {markerChoice && (
        <MarkerChoices
          {...markerChoice}
          targetLabel={markerChoice.target.label}
          busy={loadingStanding}
          onClose={() => {selectionRequest.current++;setMarkerChoice(null);setLoadingStanding(false);}}
          onSelectType={chooseTargetUtility}
        />
      )}
      {originChoice && <OriginChoices key={originChoice.group.id} {...originChoice} mapImage={mapImage}
        onClose={()=>setOriginChoice(null)}
        onChoose={record=>{setOriginChoice(null);selectRecord(record);}}/>}
      <dialog
        className="ul-media-dialog"
        ref={mediaDialog}
        aria-labelledby="lineup-media-title"
        onClose={() => setMediaRecord(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget)
            mediaDialog.current?.close();
        }}
      >
        <div className="ul-media-dialog-heading">
          <div>
            <span>
              {mediaRecord?.type} · {mediaRecord?.side} side · {map.name}
            </span>
            <h2 id="lineup-media-title">
              {mediaRecord?.title || "Lineup media"}
            </h2>
          </div>
          <div className="ul-media-heading-actions">
          {mediaRecord?.spawn&&<div className="ul-spawn-switch" role="group" aria-label="Spawn lineup" title="Numbering matches this guide’s original spawn sheet">
            <button aria-label="Previous spawn lineup" disabled={spawnIndex<=0} onClick={()=>selectRecord(spawnAlternatives[spawnIndex-1])}><ChevronLeft size={18}/></button>
            <span>{mediaRecord.spawn.label}</span>
            <button aria-label="Next spawn lineup" disabled={spawnIndex<0||spawnIndex>=spawnAlternatives.length-1} onClick={()=>selectRecord(spawnAlternatives[spawnIndex+1])}><ChevronRight size={18}/></button>
          </div>}
          {mediaRecord && <GuideActions
            record={mediaRecord} saved={favorites.includes(mediaRecord.id)}
            onToggleSaved={() => toggleFavorite(mediaRecord)}
            onCopyLink={() => void copyLineup(mediaRecord)}
            onDownload={() => void downloadLineup(mediaRecord).catch(error => onNotify(error instanceof Error ? error.message : "This lineup could not be exported."))}
            onEdit={() => {const record=mediaRecord;mediaDialog.current?.close();startEditor(record);}}
            onDelete={mediaRecord.userCreated ? () => deleteLineup(mediaRecord) : undefined}
          />}
          <button
            className="ul-icon-button"
            aria-label="Close lineup media"
            onClick={() => mediaDialog.current?.close()}
          >
            <X size={22} />
          </button>
          </div>
        </div>
        {mediaRecord && (
          <LineupMedia key={mediaRecord.id} record={mediaRecord} />
        )}
      </dialog>
    </section>
  );
}
