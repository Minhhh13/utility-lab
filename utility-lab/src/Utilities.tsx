import {
  useEffect,
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
} from "lucide-react";
import type { GameMap } from "./maps";
import { CREATOR_GUIDES } from "./creator-guides";
import GrenadeIcon, { type UtilityKind } from "./UtilityIcon";
import {
  FAVORITE_UTILITIES_KEY,
  MAX_SCREENSHOT_BYTES,
  MAX_LINEUP_PHOTOS,
  MAX_PHOTO_DATA_CHARS,
  MAX_USER_UTILITIES,
  USER_UTILITIES_KEY,
  UTILITY_REFERENCES,
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

export type UtilitiesProps = {
  map: GameMap;
  side: "T" | "CT";
  onSideChange: (side: "T" | "CT") => void;
  onOpenMaps: () => void;
  onNotify: (message: string) => void;
  theme: "light" | "dark";
  compact: boolean;
};
type Draft = {
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
  videoStart: string;
  creator: string;
};
type DraftRecovery = { draft: Draft; editingId: string | null };
const recoveredDrafts = new Map<string, DraftRecovery>();
const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `lineup-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const boundedPosition = (value: number) =>
  Math.max(0, Math.min(1000, Math.round(value)));
const utilityLabel = (type: UtilityType) =>
  type === "Molotov" ? "Molly" : type === "HE" ? "HE grenade" : type;
function blankDraft(levelId: string, side: "T" | "CT"): Draft {
  return {
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
function fromReference(item: UtilityReference): Draft {
  return {
    ...item,
    steps: item.steps.join("\n"),
    image: item.image || "",
    source: item.source || "",
    photos: utilityPhotos(item),
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
function downloadLineup(item: UtilityReference) {
  const blob = new Blob(
    [
      JSON.stringify(
        { format: "utility-lab-lineup", version: 1, lineup: item },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${
    item.title
      .replace(/[^a-z0-9 -]/gi, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "lineup"
  }.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ThrowInputs({ method }: { method: string }) {
  const label = method.replace(
    /middle[ -]?click/gi,
    "Both buttons (LMB + RMB)",
  );
  const both = /both/i.test(label),
    left = both || /LMB|left[ -]?click/i.test(label),
    right = both || /RMB|right[ -]?click/i.test(label),
    jump = /jump/i.test(label),
    run = /\brun\b/i.test(label);
  return (
    <div className="ul-throw-inputs">
      <div
        className="ul-input-badges"
        aria-label={label || "Throw inputs not recorded"}
      >
        {jump && <span className="ul-key-input">Jump</span>}
        {run && <span className="ul-key-input">Run</span>}
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
          <span className="ul-key-input">Not recorded</span>
        )}
      </div>
      <p>
        {both
          ? "Both buttons (LMB + RMB)"
          : label || "Throw inputs not recorded"}
      </p>
    </div>
  );
}

function LineupMedia({ record }: { record: UtilityReference }) {
  const photos = utilityPhotos(record);
  let video = null;
  try {
    video = parseUtilityVideo(record.videoUrl || "", record.videoStart);
  } catch {
    /* Invalid media retains the original source link. */
  }
  const [mode, setMode] = useState<"video" | "photos">(
    video ? "video" : "photos",
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
  return (
    <div
      className="ul-lineup-media"
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
      {video && photos.length > 0 && (
        <div
          className="ul-media-tabs"
          role="group"
          aria-label="Lineup media type"
        >
          <button
            aria-pressed={mode === "video"}
            onClick={() => {
              setMode("video");
              setLoaded(false);
            }}
          >
            <Video size={17} />
            Video
          </button>
          <button
            aria-pressed={mode === "photos"}
            onClick={() => {
              setMode("photos");
              setLoaded(false);
            }}
          >
            <Images size={17} />
            Photos <span>{photos.length}</span>
          </button>
        </div>
      )}
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
              <span>
                The player loads after your click. Playback stays in your
                control.
              </span>
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
              preload="none"
              aria-label={`${record.title} video guide`}
            />
          )}
        </div>
      )}
      {mode === "photos" && photos.length > 0 && (
        <div className="ul-photo-viewer" aria-label="Lineup photo slides">
          <div className="ul-photo-stage">
            <img
              src={photos[index].image}
              alt={
                photos[index].caption || `${record.title}, photo ${index + 1}`
              }
              width="1600"
              height="900"
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
          <div className="ul-photo-caption" aria-live="polite">
            <span>
              {index + 1} / {photos.length}
            </span>
            <p>{photos[index].caption || `Photo ${index + 1}`}</p>
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
                  <span />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="ul-media-footer">
        <ThrowInputs method={record.throwType} />
        {source && (
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
}: UtilitiesProps) {
  const [levelId, setLevelId] = useState(map.levels[0]?.id || "main");
  const [type, setType] = useState<UtilityType | "All">("All");
  const [search, setSearch] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [custom, setCustom] = useState(readUserUtilities);
  const [favorites, setFavorites] = useState(readUtilityFavorites);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(
    () =>
      recoveredDrafts.get(map.id)?.draft ||
      blankDraft(map.levels[0]?.id || "main", side),
  );
  const [formError, setFormError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [mapFallback, setMapFallback] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapUnit, setMapUnit] = useState(2.3);
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
  const fit = level?.contentBounds || { x: 0, y: 0, width: 1000, height: 1000 };
  const viewWidth = fit.width / zoom;
  const viewHeight = fit.height / zoom;
  const guideKeys = new Set(
    CREATOR_GUIDES.map(
      (item) =>
        `${item.mapId}:${item.levelId}:${item.side}:${item.type}:${item.title.toLowerCase()}`,
    ),
  );
  const contextRecords: UtilityReference[] = [
    ...custom,
    ...CREATOR_GUIDES,
    ...UTILITY_REFERENCES.filter(
      (item) =>
        !guideKeys.has(
          `${item.mapId}:${item.levelId}:${item.side}:${item.type}:${item.title.toLowerCase()}`,
        ),
    ),
  ].filter(
    (item) =>
      item.mapId === map.id && item.levelId === levelId && item.side === side,
  );
  const visibleRecords = contextRecords.filter(
    (item) =>
      (type === "All" || item.type === type) &&
      (!savedOnly || favorites.includes(item.id)) &&
      (!search ||
        `${item.title} ${item.from} ${item.target} ${item.type}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const selected =
    visibleRecords.find((item) => item.id === selectedId) ||
    visibleRecords[0] ||
    null;
  const sourceImage = level?.image || "";
  const preferredImage =
    theme === "light" && sourceImage.endsWith(".svg")
      ? sourceImage.replace(/(?:-light)?\.svg$/, "-light.svg")
      : sourceImage;
  const mapImage = mapFallback ? sourceImage : preferredImage;
  const draftPhotos = draft.photos || [];

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    setLevelId(map.levels[0]?.id || "main");
    setSelectedId(null);
    setZoom(1);
    setEditing(false);
    setFormError("");
    setPlacing(false);
  }, [map.id]);
  useEffect(() => {
    setMapFallback(false);
    setMapFailed(false);
  }, [map.id, levelId, theme]);
  useEffect(() => {
    if (!editing) return;
    recoveredDrafts.set(map.id, { draft, editingId });
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
        setMapUnit(
          Math.max(viewWidth / bounds.width, viewHeight / bounds.height),
        );
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
    if (item.videoUrl || utilityPhotos(item).length) openMedia(item);
  }
  function openMedia(item: UtilityReference) {
    setMediaRecord(item);
    requestAnimationFrame(() => mediaDialog.current?.showModal());
  }
  function changeLevel(id: string) {
    setLevelId(id);
    setSelectedId(null);
    setZoom(1);
    setPlacing(false);
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
    const recovered = !item ? recoveredDrafts.get(map.id) : undefined;
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
      ...(draftPhotos.length
        ? { photos: draftPhotos }
        : draft.image
          ? { image: draft.image }
          : {}),
      ...(draft.source.trim() ? { source: safeSource(draft.source) } : {}),
      ...(video ? { videoUrl: video.url, videoStart: video.start } : {}),
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
  function saveLineup(event: FormEvent) {
    event.preventDefault();
    try {
      const record = draftReference();
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
      setType("All");
      setSearch("");
      setSavedOnly(false);
      setSelectedId(record.id);
      setLevelId(record.levelId);
      onSideChange(record.side);
      cancelEditor();
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
        event.currentTarget
          .querySelector<HTMLInputElement>('[name="lineup-target"]')
          ?.focus();
      else if (!draft.steps.trim())
        event.currentTarget
          .querySelector<HTMLTextAreaElement>('[name="lineup-steps"]')
          ?.focus();
    }
  }
  function exportDraft() {
    try {
      downloadLineup(draftReference());
      onNotify("Lineup backup prepared for download.");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Add the required fields before exporting.",
      );
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
      const next: UtilityPhoto[] = [...draftPhotos];
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
      if (alive.current && context === currentContext.current)
        setDraft((current) => ({ ...current, photos: next, image: "" }));
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
      x: boundedPosition(point.x),
      y: boundedPosition(point.y),
    }));
    setPlacing(false);
    titleRef.current?.focus();
  }
  const setDraftField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <section
      className={`utility-workspace${compact ? " ul-compact" : ""}`}
      aria-label="Utility library"
    >
      <header className="ul-header">
        <div className="ul-heading">
          <h2>Utility library</h2>
          <span>Find the utility. Make the space.</span>
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
              className={side === "T" ? "is-active" : ""}
              onClick={() => onSideChange("T")}
            >
              <UserRound size={15} />
              <span>T side</span>
            </button>
            <button
              aria-pressed={side === "CT"}
              className={side === "CT" ? "is-active" : ""}
              onClick={() => onSideChange("CT")}
            >
              <Shield size={15} />
              <span>CT side</span>
            </button>
          </div>
          <button className="ul-primary-button" onClick={() => startEditor()}>
            <Plus size={17} />
            <span>Add lineup</span>
          </button>
        </div>
      </header>
      <div className="ul-filterbar">
        <div className="ul-types" role="group" aria-label="Utility type">
          {(["All", ...UTILITY_TYPES] as const).map((item) => (
            <button
              key={item}
              aria-pressed={type === item}
              className={type === item ? "is-active" : ""}
              onClick={() => setType(item)}
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
              <span>{item === "All" ? "All utility" : utilityLabel(item)}</span>
              <small>
                {
                  contextRecords.filter(
                    (record) => item === "All" || record.type === item,
                  ).length
                }
              </small>
            </button>
          ))}
        </div>
        <button
          className={`ul-favorites-filter${savedOnly ? " is-active" : ""}`}
          aria-pressed={savedOnly}
          onClick={() => setSavedOnly(!savedOnly)}
        >
          <Star size={15} fill={savedOnly ? "currentColor" : "none"} />
          <span>Saved</span>
          <small>
            {
              contextRecords.filter((item) => favorites.includes(item.id))
                .length
            }
          </small>
        </button>
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
                    onClick={() => changeLevel(item.id)}
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <span>{level?.name || "Overview"}</span>
              )}
            </div>
            <span className="ul-map-count">
              {visibleRecords.length}{" "}
              {visibleRecords.length === 1 ? "reference" : "references"}
            </span>
          </div>
          <div className={`ul-map-stage${placing ? " is-placing" : ""}`}>
            <svg
              ref={svgRef}
              className={`ul-map-svg${!sourceImage.endsWith(".svg") ? " is-raster" : ""}`}
              viewBox={`${fit.x + (fit.width - viewWidth) / 2} ${fit.y + (fit.height - viewHeight) / 2} ${viewWidth} ${viewHeight}`}
              role="group"
              aria-label={`${map.name} ${level?.name || ""} utility map`}
              onClick={setTargetOnMap}
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
              {!mapFailed &&
                visibleRecords.map((item) => (
                  <g
                    key={item.id}
                    className={`ul-map-marker${selected?.id === item.id ? " is-selected" : ""}`}
                    transform={`translate(${item.x} ${item.y})`}
                    style={
                      {
                        "--ul-marker": utilityColor(item.type),
                      } as CSSProperties
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.title}, ${item.type}, ${item.userCreated ? "your lineup" : item.videoUrl ? "creator guide" : "practice reference"}`}
                    aria-pressed={selected?.id === item.id}
                    onClick={(event) => {
                      if (placing) return;
                      event.stopPropagation();
                      selectRecord(item);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectRecord(item);
                      }
                    }}
                  >
                    <title>{item.title}</title>
                    <circle
                      className="ul-marker-hit"
                      r={22 * mapUnit}
                      fill="transparent"
                    />
                    {selected?.id === item.id && (
                      <circle
                        className="ul-marker-ring"
                        r={15 * mapUnit}
                        fill="none"
                        strokeWidth={2 * mapUnit}
                      />
                    )}
                    <circle
                      className="ul-marker-body"
                      r={11 * mapUnit}
                      strokeWidth={1.5 * mapUnit}
                    />
                    <g
                      transform={`translate(${-9 * mapUnit} ${-9 * mapUnit})`}
                      className="ul-marker-glyph"
                    >
                      <UtilityIcon type={item.type} size={18 * mapUnit} />
                    </g>
                  </g>
                ))}
              {editing && (
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
            {mapFailed && (
              <div className="ul-map-error">
                <MapPinned size={28} />
                <h2>The radar could not load.</h2>
                <p>Your references are still available in the list.</p>
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
              <span>
                Target locations are illustrative. Validate throws in game.
              </span>
            </p>
            <div className="ul-zoom">
              <button
                aria-label="Zoom utility map out"
                disabled={zoom <= 1}
                onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => setZoom(1)}
                aria-label="Reset utility map zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                aria-label="Zoom utility map in"
                disabled={zoom >= 2}
                onClick={() => setZoom((value) => Math.min(2, value + 0.25))}
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
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
        <aside
          ref={panelRef}
          className={`ul-sidebar${editing ? " is-editing" : ""}`}
          aria-label={
            editing ? "Add or edit utility lineup" : "Utility references"
          }
        >
          {editing ? (
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
                  {draftPhotos.map((photo, index) => (
                    <div className="ul-photo-edit" key={index}>
                      <div className="ul-upload-preview">
                        <img
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
                    disabled={imageLoading}
                  >
                    <Check size={16} />
                    {editingId ? "Update lineup" : "Save lineup"}
                  </button>
                  <button
                    type="button"
                    className="ul-secondary-button"
                    onClick={cancelEditor}
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
          ) : (
            <>
              <div className="ul-list-heading">
                <div>
                  <h2>{side === "T" ? "T-side" : "CT-side"} utility</h2>
                  <span>
                    {map.name}
                    {map.levels.length > 1 ? ` · ${level?.name}` : ""}
                  </span>
                </div>
                <button
                  className="ul-icon-button"
                  aria-label="Add your own lineup"
                  onClick={() => startEditor()}
                >
                  <Plus size={19} />
                </button>
              </div>
              <label className="ul-search">
                <Search size={16} />
                <input
                  type="search"
                  name="utility-search"
                  autoComplete="off"
                  value={search}
                  aria-label="Search utilities"
                  placeholder="Find a callout or lineup…"
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    aria-label="Clear utility search"
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
              <div
                className="ul-reference-list"
                role="list"
                aria-label="Matching utility references"
              >
                {visibleRecords.map((item) => (
                  <div
                    className={`ul-reference-row${selected?.id === item.id ? " is-selected" : ""}`}
                    role="listitem"
                    key={item.id}
                  >
                    <button
                      className="ul-reference-open"
                      aria-label={`Open ${item.title}`}
                      aria-pressed={selected?.id === item.id}
                      onClick={() => selectRecord(item)}
                    >
                      <span
                        className="ul-reference-icon"
                        style={{ color: utilityColor(item.type) }}
                      >
                        <UtilityIcon type={item.type} size={27} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>
                          {utilityLabel(item.type)}{" "}
                          <span className="ul-inline-dot" />{" "}
                          {item.from || "Position not recorded"}{" "}
                          <ArrowUpRight size={10} /> {item.target}
                        </small>
                      </span>
                    </button>
                    <button
                      className={`ul-favorite-button${favorites.includes(item.id) ? " is-saved" : ""}`}
                      aria-label={`${favorites.includes(item.id) ? "Unsave" : "Save"} ${item.title}`}
                      aria-pressed={favorites.includes(item.id)}
                      onClick={() => toggleFavorite(item)}
                    >
                      <Star
                        size={15}
                        fill={
                          favorites.includes(item.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  </div>
                ))}
                {!visibleRecords.length && (
                  <div className="ul-empty">
                    <Search size={25} />
                    <h3>No utilities match.</h3>
                    <p>
                      {savedOnly
                        ? "Save a reference with its star, or view all utilities."
                        : `Try another callout or add your own ${side}-side lineup for this level.`}
                    </p>
                    <button
                      className="ul-secondary-button"
                      onClick={() => {
                        setType("All");
                        setSearch("");
                        setSavedOnly(false);
                      }}
                    >
                      Clear filters
                    </button>
                    <button
                      className="ul-text-button"
                      onClick={() => startEditor()}
                    >
                      Add a lineup <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>
              {selected && (
                <article
                  className="ul-detail"
                  aria-label={`${selected.title} details`}
                >
                  <div className="ul-detail-title">
                    <span
                      className="ul-detail-symbol"
                      style={{ color: utilityColor(selected.type) }}
                    >
                      <UtilityIcon type={selected.type} size={32} />
                    </span>
                    <div>
                      <span>
                        {utilityLabel(selected.type)}{" "}
                        <span className="ul-inline-dot" />{" "}
                        {selected.userCreated
                          ? "Your lineup"
                          : selected.videoUrl
                            ? "Creator guide"
                            : "Practice reference"}
                      </span>
                      <h2>{selected.title}</h2>
                    </div>
                  </div>
                  {(selected.videoUrl ||
                    utilityPhotos(selected).length > 0) && (
                    <button
                      className="ul-media-preview"
                      aria-label="Open lineup media"
                      onClick={() => openMedia(selected)}
                    >
                      {selected.videoUrl ? (
                        <Video size={24} />
                      ) : (
                        <Images size={24} />
                      )}
                      <span>
                        <strong>
                          {selected.videoUrl
                            ? "Watch lineup"
                            : "View photo steps"}
                        </strong>
                        <small>
                          {selected.creator
                            ? `By ${selected.creator}`
                            : `${utilityPhotos(selected).length} captioned ${utilityPhotos(selected).length === 1 ? "photo" : "photos"}`}
                        </small>
                      </span>
                      <Play size={19} />
                    </button>
                  )}
                  <div className="ul-validation-note">
                    <Info size={15} />
                    <p>
                      {selected.userCreated
                        ? "Your own notes. Verify the throw in a practice server before relying on it."
                        : selected.videoUrl
                          ? "Original creator demonstration. Match the video inputs and test on your current map version; the radar marker is illustrative."
                          : "Needs in-game validation. This is a target and practice checklist, not a verified aim-point lineup."}
                    </p>
                  </div>
                  <p className="ul-purpose">
                    {selected.purpose ||
                      "Add a purpose to explain when your team should use this lineup."}
                  </p>
                  <dl className="ul-lineup-facts">
                    <div>
                      <dt>From</dt>
                      <dd>{selected.from || "Not recorded"}</dd>
                    </div>
                    <div>
                      <dt>Target</dt>
                      <dd>{selected.target}</dd>
                    </div>
                    <div>
                      <dt>Throw</dt>
                      <dd>{selected.throwType || "Not recorded"}</dd>
                    </div>
                  </dl>
                  <ThrowInputs method={selected.throwType} />
                  <h3>
                    {selected.userCreated
                      ? "Your instructions"
                      : selected.videoUrl
                        ? "Follow the demonstration"
                        : "Practice checklist"}
                  </h3>
                  <ol className="ul-instructions">
                    {selected.steps.map((step, index) => (
                      <li key={`${selected.id}-${index}`}>
                        <span>{index + 1}</span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                  {selected.source && (
                    <a
                      className="ul-source-link"
                      href={selected.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source <ArrowUpRight size={15} />
                    </a>
                  )}
                  <div className="ul-detail-actions">
                    <button
                      className="ul-secondary-button"
                      onClick={() => startEditor(selected)}
                    >
                      <Pencil size={14} />
                      {selected.userCreated
                        ? "Edit lineup"
                        : "Make your own version"}
                    </button>
                    <button
                      className="ul-icon-button"
                      aria-label="Export selected lineup"
                      onClick={() => downloadLineup(selected)}
                    >
                      <ArrowDownToLine size={17} />
                    </button>
                    {selected.userCreated && (
                      <button
                        className="ul-icon-button ul-delete-button"
                        aria-label="Delete your lineup"
                        onClick={() => deleteLineup(selected)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </article>
              )}
            </>
          )}
        </aside>
      </div>
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
          <button
            className="ul-icon-button"
            aria-label="Close lineup media"
            onClick={() => mediaDialog.current?.close()}
          >
            <X size={22} />
          </button>
        </div>
        {mediaRecord && (
          <LineupMedia key={mediaRecord.id} record={mediaRecord} />
        )}
        <p className="ul-media-disclaimer">
          <Info size={14} />
          Match the demonstrated standing position, aim, and inputs. Check the
          result in a practice server.
        </p>
      </dialog>
    </section>
  );
}
