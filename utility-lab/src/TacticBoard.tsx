import {
  useEffect,
  useLayoutEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { exportFile } from "./file-transfer";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpFromLine,
  Check,
  ChevronDown,
  CircleDot,
  Cloud,
  Copy,
  Download,
  Eraser,
  FilePlus2,
  Flame,
  FolderOpen,
  Hand,
  ImagePlus,
  LoaderCircle,
  MousePointer2,
  MoveUpRight,
  Pencil,
  Redo2,
  Save,
  Share2,
  Shield,
  Trash2,
  Type,
  Undo2,
  UserRound,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Settings2,
  UsersRound,
} from "lucide-react";
import type { GameMap } from "./maps";
import {
  MAX_OBJECTS,
  appendPenPoints,
  boardInkColor,
  clamp,
  commit,
  emptyPlan,
  endpointChanged,
  historyFor,
  objectLabel,
  redo,
  samplePlan,
  translateRouteEnd,
  translated,
  uid,
  undo,
  validatePlan,
  validateSavedTactics,
  validateTacticFile,
  type BoardHistory,
  type BoardObject,
  type BoardPlan,
  type ObjectKind,
  type RouteEnd,
  type SavedTactic,
  type TacticFile,
  type XY,
} from "./board-model";
import "./tactic-board.css";
import "./board-edge-controls.css";
import UtilityIcon, { type UtilityKind } from "./UtilityIcon";
import TacticShareDialog from "./TacticShareDialog";
import BoardObjectDrawing, { boardObjectColors } from "./BoardObjectDrawing";
import { FIT_VIEW, MIN_ZOOM, MAX_ZOOM, boundView, panView, viewBox, zoomView, type BoardView } from "./board-navigation";

type Tool = "select" | "hand" | "erase" | ObjectKind;
type Gesture = {
  pointerId: number;
  mode: "draw" | "move";
  endpoint?: RouteEnd;
  start: XY;
  original: BoardHistory;
  objectId: string;
};
type Props = {
  map: GameMap;
  onNotify: (message: string) => void;
  onOpenMaps: () => void;
  compact: boolean;
  theme: "light" | "dark";
  openedTactic?: SavedTactic;
  openedSharedTactic?: TacticFile;
  onOpenSharedTactic?: (file: TacticFile) => void;
};
const SAVED_KEY = "utility-lab:tactics:v1";
const INK_KEY = "utility-lab:board-ink:v1";
type InkPreferences = { pen?: string; route?: string };
const inkSwatches = [
  { label: "Theme default", color: undefined },
  { label: "White", color: "#f4f4f5" },
  { label: "Red", color: "#f16b75" },
  { label: "Orange", color: "#f4a261" },
  { label: "Yellow", color: "#f2d16b" },
  { label: "Green", color: "#79c99e" },
  { label: "Blue", color: "#72a7f5" },
  { label: "Purple", color: "#b79afa" },
];
const draftKey = (map: string, level: string) =>
  `utility-lab:draft:v1:${map}:${level}`;
const imageKey = (map: string, level: string) =>
  `utility-lab:radar:v1:${map}:${level}`;
// This session recovery layer survives editor remounts when browser storage is full or blocked.
// It is deliberately separate from durable saves and never reports itself as a saved tactic.
const sessionDrafts = new Map<string, BoardPlan>();
const toolItems = [
  { id: "select", label: "Select / move", key: "V", icon: MousePointer2 },
  { id: "hand", label: "Pan map", key: "G", icon: Hand },
  { id: "t", label: "T player", key: "T", icon: UserRound },
  { id: "ct", label: "CT player", key: "C", icon: Shield },
  { id: "route", label: "Route arrow", key: "R", icon: MoveUpRight },
  { id: "pen", label: "Draw", key: "P", icon: Pencil },
  { id: "smoke", label: "Smoke", key: "S", icon: Cloud },
  { id: "flash", label: "Flash", key: "F", icon: Zap },
  { id: "molotov", label: "Molotov", key: "M", icon: Flame },
  { id: "he", label: "HE grenade", key: "H", icon: CircleDot },
  { id: "text", label: "Text label", key: "X", icon: Type },
  { id: "erase", label: "Erase object", key: "E", icon: Eraser },
] as const;

function storedJson(key: string): unknown {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
function storedInk(): InkPreferences {
  const value = storedJson(INK_KEY);
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  return { pen: boardInkColor(raw.pen), route: boardInkColor(raw.route) };
}
function storedImage(key: string): string {
  try {
    const value = localStorage.getItem(key);
    return value &&
      /^data:image\/(png|jpeg|webp);base64,/.test(value) &&
      value.length <= 2_000_000
      ? value
      : "";
  } catch {
    return "";
  }
}
function initialPlan(
  mapId: string,
  levelId: string,
  useExample: boolean,
): BoardPlan {
  const sessionPlan = sessionDrafts.get(draftKey(mapId, levelId));
  if (sessionPlan) return sessionPlan;
  try {
    const plan = validatePlan(storedJson(draftKey(mapId, levelId)));
    if (plan.mapId === mapId && plan.levelId === levelId) return plan;
  } catch {
    /* A malformed draft cannot break the editor. */
  }
  return useExample ? samplePlan(mapId, levelId) : emptyPlan(mapId, levelId);
}
const download = exportFile;
function filename(name: string) {
  return (
    name
      .trim()
      .replace(/[^a-z0-9 _-]/gi, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .slice(0, 80) || "tactic"
  );
}
function imageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new Error(
          "The image could not be read. Try another PNG, JPEG, or WebP.",
        ),
      );
    img.src = src;
  });
}
function blobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read this file."));
    reader.readAsDataURL(blob);
  });
}
function createObject(
  kind: ObjectKind,
  point: XY,
  objects: BoardObject[],
): BoardObject {
  const object: BoardObject = { id: uid(), kind, x: point.x, y: point.y };
  if (kind === "t" || kind === "ct") {
    const used = new Set(
      objects.filter((item) => item.kind === kind).map((item) => item.number),
    );
    object.number =
      Array.from({ length: 99 }, (_, index) => index + 1).find(
        (number) => !used.has(number),
      ) || 99;
  }
  if (kind === "text") object.label = "New label";
  if (kind === "route" || kind === "pen") {
    object.x = 0;
    object.y = 0;
    object.points = [
      { x: clamp(point.x - 75), y: point.y },
      { x: clamp(point.x + 75), y: point.y },
    ];
  }
  return object;
}
function RouteHandles({points, zoom}: {points: XY[]; zoom: number}) {
  const group = useRef<SVGGElement>(null);
  useLayoutEffect(() => {
    const node = group.current, svg = node?.ownerSVGElement;
    if (!node || !svg) return;
    const measure = () => {
      const scale = svg.getScreenCTM()?.a;
      if (scale && scale > 0) node.style.setProperty("--route-grip-scale", String(1 / scale));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, [zoom]);
  const ends = { start: points[0], end: points[points.length - 1] };
  return <g ref={group} data-selection="true" role="group" aria-label="Route endpoints">
    {(["start", "end"] as const).map(end => <g key={end} transform={`translate(${ends[end].x} ${ends[end].y})`}>
      <g className="tb-route-handle" data-route-endpoint={end}
        tabIndex={0} role="group" aria-label={`Route ${end} handle`}
        aria-description="Drag or use the arrow keys to move this endpoint. Hold Shift to move farther."
        aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight">
        <title>{`Move route ${end}`}</title>
        <circle r="22" fill="transparent" />
        <circle className="tb-route-grip-focus" r="9" />
        <circle r="6" fill="var(--surface-raised)" stroke="var(--accent)" strokeWidth="2" />
        {end === "end" && <circle r="2" fill="var(--accent)" />}
      </g>
    </g>)}
  </g>;
}
function Selection({ object }: { object: BoardObject }) {
  const points = object.points || [
    { x: object.x - 29, y: object.y - 29 },
    {
      x:
        object.x +
        (object.kind === "text"
          ? Math.max(50, (object.label?.length || 9) * 12.6)
          : 29),
      y: object.y + 29,
    },
  ];
  const x = Math.min(...points.map((point) => point.x)) - 7,
    y = Math.min(...points.map((point) => point.y)) - 7;
  const width = Math.max(...points.map((point) => point.x)) - x + 7,
    height = Math.max(...points.map((point) => point.y)) - y + 7;
  return (
    <g data-selection="true" pointerEvents="none">
      <rect
        x={x}
        y={y}
        width={Math.max(width, 16)}
        height={Math.max(height, 16)}
        rx="5"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.7"
        strokeDasharray="5 5"
      />
      {[
        [x, y],
        [x + width, y + height],
      ].map(([cx, cy], index) => (
        <rect
          key={index}
          x={cx - 4}
          y={cy - 4}
          width="8"
          height="8"
          fill="var(--text)"
        />
      ))}
    </g>
  );
}

export default function TacticBoard({
  map,
  onNotify,
  onOpenMaps,
  compact,
  theme,
  openedTactic,
  openedSharedTactic,
  onOpenSharedTactic,
}: Props) {
  const [levelId, setLevelId] = useState(
    openedSharedTactic?.plan.levelId || openedTactic?.plan.levelId || map.levels[0]?.id || "main",
  );
  const level = map.levels.find((item) => item.id === levelId) || map.levels[0];
  const [history, setHistory] = useState(() => {
    const previous = historyFor(initialPlan(map.id, levelId, map.id === "mirage"));
    return openedSharedTactic ? commit(previous, openedSharedTactic.plan)
      : openedTactic ? historyFor(openedTactic.plan) : previous;
  });
  const plan = history.present;
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = plan.objects.find((object) => object.id === selectedId);
  const [inkPreferences, setInkPreferences] = useState<InkPreferences>(storedInk);
  const [inkOpen, setInkOpen] = useState(false);
  const [inkPosition, setInkPosition] = useState({ left: 8, top: 8 });
  const inkButton = useRef<HTMLButtonElement>(null);
  const inkPopover = useRef<HTMLDivElement>(null);
  const selectedInk = selected && (selected.kind === "pen" || selected.kind === "route") ? selected : undefined;
  const inkKind = selectedInk?.kind === "route" || tool === "route" ? "route" : "pen";
  const activeInk = selectedInk ? selectedInk.color : inkPreferences[inkKind];
  const showInk = tool === "pen" || tool === "route" || !!selectedInk;
  const [saved, setSaved] = useState<SavedTactic[]>(() =>
    validateSavedTactics(storedJson(SAVED_KEY)),
  );
  const [loadedId, setLoadedId] = useState<string | null>(
    openedTactic?.id || null,
  );
  const [selectedSavedId, setSelectedSavedId] = useState(
    openedTactic?.id || "",
  );
  const [draftStatus, setDraftStatus] = useState<"saving" | "saved" | "error">(
    "saved",
  );
  const [customImage, setCustomImage] = useState(() =>
    openedSharedTactic ? openedSharedTactic.mapImage || "" : storedImage(imageKey(map.id, levelId)),
  );
  const [mapFailed, setMapFailed] = useState(false);
  const [view, setView] = useState<BoardView>(FIT_VIEW);
  const viewRef = useRef(view);
  viewRef.current = view;
  const [panning, setPanning] = useState(false);
  const [spacePan, setSpacePan] = useState(false);
  const spaceHeld = useRef(false);
  const panGesture = useRef<{ pointerId: number; x: number; y: number; view: BoardView; scale: number } | null>(null);
  const touchPoints = useRef(new Map<number, XY>());
  const touchHistory = useRef<BoardHistory | null>(null);
  const touchPlacement = useRef<{ pointerId: number; kind: ObjectKind; point: XY } | null>(null);
  const pinch = useRef<{ distance: number; middle: XY; anchor: XY; view: BoardView; scale: number } | null>(null);
  const [shareMode, setShareMode] = useState<"share" | "open" | null>(null);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"plan" | "objects">("plan");
  const [textEditor, setTextEditor] = useState<{ object: BoardObject; value: string; isNew: boolean } | null>(null);
  const textEditorRef = useRef(textEditor);
  textEditorRef.current = textEditor;
  const textInput = useRef<HTMLInputElement>(null);
  const lastTextPress = useRef<{ id: string; time: number; x: number; y: number } | null>(null);
  const mapStage = useRef<HTMLDivElement>(null);
  const [textPosition, setTextPosition] = useState({ left: 8, top: 8, width: 280 });
  const notify = useRef(onNotify);
  notify.current = onNotify;
  const svgRef = useRef<SVGSVGElement>(null),
    importRef = useRef<HTMLInputElement>(null),
    imageRef = useRef<HTMLInputElement>(null);
  const planToggleRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef(history);
  historyRef.current = history;

  useLayoutEffect(() => {
    if (!textEditor) return;
    function placeText() {
      const matrix = svgRef.current?.getScreenCTM();
      const stage = mapStage.current?.getBoundingClientRect();
      const editing = textEditorRef.current;
      if (!matrix || !stage || !editing) return;
      const point = new DOMPoint(editing.object.x, editing.object.y).matrixTransform(matrix);
      const width = Math.min(320, Math.max(180, stage.width - 16));
      setTextPosition({
        left: Math.max(8, Math.min(point.x - stage.x - 8, stage.width - width - 8)),
        top: Math.max(8, Math.min(point.y - stage.y - 26, stage.height - 60)),
        width,
      });
    }
    placeText();
    const observer = new ResizeObserver(placeText);
    if (mapStage.current) observer.observe(mapStage.current);
    return () => observer.disconnect();
  }, [textEditor?.object.id, view, inspectorOpen]);
  useEffect(() => {
    if (!textEditor) return;
    textInput.current?.focus({ preventScroll: true });
    textInput.current?.select();
  }, [textEditor?.object.id]);
  // Undoing a load must also restore which saved record the board updates.
  const historyOwners = useRef(new WeakMap<BoardPlan, string | null>());
  if (!historyOwners.current.has(plan))
    historyOwners.current.set(plan, loadedId);
  const historyImages = useRef(new WeakMap<BoardPlan, string>());
  historyImages.current.set(plan, customImage);
  if (openedSharedTactic && history.past.length && !historyImages.current.has(history.past[0]))
    historyImages.current.set(history.past[0], storedImage(imageKey(map.id, levelId)));
  const gesture = useRef<Gesture | null>(null);
  const mediaOperation = useRef(0);
  const mounted = useRef(true);
  const latest = useRef({ key: draftKey(map.id, levelId), plan });
  latest.current = { key: draftKey(map.id, levelId), plan };
  const storageWarningShown = useRef(false);
  sessionDrafts.set(latest.current.key, plan);
  const uniqueId = useId().replace(/:/g, "");
  const inkPopoverId = `drawing-colour-${uniqueId}`;
  const originalImage = level?.image || "";
  const image =
    customImage ||
    (theme === "light" && originalImage.endsWith(".svg")
      ? originalImage.replace(".svg", "-light.svg")
      : originalImage);
  const visibleSaved = saved.filter(
    (item) => item.plan.mapId === map.id && item.plan.levelId === levelId,
  );
  const shareFile = useMemo<TacticFile>(() => ({ format: "utility-lab-tactic", version: 1, plan, ...(customImage ? { mapImage: customImage } : {}) }), [plan, customImage]);

  useEffect(() => {
    setDraftStatus("saving");
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey(map.id, levelId), JSON.stringify(plan));
        setDraftStatus("saved");
        storageWarningShown.current = false;
      } catch {
        setDraftStatus("error");
        if (!storageWarningShown.current) {
          storageWarningShown.current = true;
          notify.current(
            `Browser storage is unavailable. Your ${map.name} draft is held for this session; export JSON before closing the app.`,
          );
        }
      }
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [plan, map.id, levelId]);
  useEffect(() => {
    const flush = () => {
      sessionDrafts.set(latest.current.key, latest.current.plan);
      try {
        localStorage.setItem(
          latest.current.key,
          JSON.stringify(latest.current.plan),
        );
      } catch {
        if (!storageWarningShown.current) {
          storageWarningShown.current = true;
          notify.current(
            "Browser storage is unavailable. Your draft is held for this session. Return to its map and export JSON before closing the app.",
          );
        }
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
    };
  }, []);
  useEffect(() => {
    if (selectedId && !plan.objects.some((object) => object.id === selectedId))
      setSelectedId(null);
  }, [plan.objects, selectedId]);
  useEffect(() => {
    if (openedSharedTactic) {
      try {
        if (openedSharedTactic.mapImage) localStorage.setItem(imageKey(map.id, levelId), openedSharedTactic.mapImage);
        else localStorage.removeItem(imageKey(map.id, levelId));
      } catch { notify.current("The shared radar is held for this session. Export the tactic to keep a copy."); }
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    const blur = () => { cancelGesture(); spaceHeld.current = false; setSpacePan(false); };
    const refresh = () => {
      const records = validateSavedTactics(storedJson(SAVED_KEY));
      setSaved(records);
      setLoadedId((id) =>
        id && records.some((item) => item.id === id) ? id : null,
      );
    };
    window.addEventListener("blur", blur);
    window.addEventListener("storage", refresh);
    window.addEventListener("utility-lab:workspace-changed", refresh);
    return () => {
      mounted.current = false;
      mediaOperation.current++;
      window.removeEventListener("blur", blur);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("utility-lab:workspace-changed", refresh);
    };
  }, []);
  useEffect(() => {
    const canvas = svgRef.current;
    if (!canvas) return;
    const wheel = (event: WheelEvent) => {
      if (gesture.current || panGesture.current || pinch.current) return;
      event.preventDefault();
      const matrix = canvas.getScreenCTM();
      if (!matrix) return;
      const anchor = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1);
      setView(current => zoomView(current, current.zoom * Math.exp(-Math.max(-300, Math.min(300, delta)) * .0015), anchor));
    };
    canvas.addEventListener("wheel", wheel, { passive: false });
    // Pointer events already implement tap, drag and pinch on this SVG. Stop
    // the native gesture recognizer swallowing the next toolbar tap after a drag.
    const nativeTouch = (event: TouchEvent) => event.preventDefault();
    canvas.addEventListener("touchstart", nativeTouch, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("touchstart", nativeTouch);
    };
  }, []);

  function changePlan(update: (current: BoardPlan) => BoardPlan) {
    setHistory((current) => commit(current, update(current.present)));
  }
  function changeObject(
    id: string,
    update: (object: BoardObject) => BoardObject,
  ) {
    changePlan((current) => ({
      ...current,
      objects: current.objects.map((object) =>
        object.id === id ? update(object) : object,
      ),
    }));
  }
  function removeSelected() {
    if (selectedId) {
      changePlan((current) => ({
        ...current,
        objects: current.objects.filter((object) => object.id !== selectedId),
      }));
      setSelectedId(null);
    }
  }
  function chooseTool(next: Tool) {
    inkPopover.current?.hidePopover();
    setTool(next);
    if (next !== "select") setSelectedId(null);
  }
  function chooseInk(color: string | undefined) {
    const next = { ...inkPreferences, [inkKind]: color };
    setInkPreferences(next);
    try { localStorage.setItem(INK_KEY, JSON.stringify(next)); } catch { /* The current selection still works when storage is blocked. */ }
    if (selectedInk) changeObject(selectedInk.id, (object) => {
      const { color: previousColor, ...rest } = object;
      void previousColor;
      return color ? { ...rest, color } : rest;
    });
    inkPopover.current?.hidePopover();
    inkButton.current?.focus({ preventScroll: true });
  }
  function editText(object: BoardObject, isNew = false) {
    setSelectedId(null);
    setTextEditor({ object, value: isNew ? "" : object.label || "", isNew });
  }
  function finishText(save: boolean, returnFocus = false) {
    const editing = textEditorRef.current;
    if (!editing) return;
    textEditorRef.current = null;
    setTextEditor(null);
    const label = editing.value.trim();
    if (save && label) {
      const object = { ...editing.object, label };
      changePlan((current) => ({
        ...current,
        objects: editing.isNew
          ? [...current.objects, object]
          : current.objects.map((item) => item.id === object.id ? object : item),
      }));
      setSelectedId(object.id);
    }
    if (returnFocus) requestAnimationFrame(() => svgRef.current?.focus({ preventScroll: true }));
  }
  function switchLevel(next: string) {
    if (next === levelId) return;
    sessionDrafts.set(draftKey(map.id, levelId), plan);
    try {
      localStorage.setItem(draftKey(map.id, levelId), JSON.stringify(plan));
    } catch {
      notify.current(
        "Device storage is full. Your draft is held for this session; return to this level and export JSON before closing the app.",
      );
    }
    setLevelId(next);
    setHistory(historyFor(initialPlan(map.id, next, false)));
    setSelectedId(null);
    setLoadedId(null);
    setSelectedSavedId("");
    setCustomImage(storedImage(imageKey(map.id, next)));
    setMapFailed(false);
    setView(FIT_VIEW);
  }
  function addObject(kind: ObjectKind, point = { x: 500, y: 500 }) {
    if (plan.objects.length >= MAX_OBJECTS) {
      notify.current(
        `This board is full (${MAX_OBJECTS} objects). Remove an object first.`,
      );
      return;
    }
    const object = createObject(kind, point, plan.objects);
    if ((kind === "pen" || kind === "route") && inkPreferences[kind]) object.color = inkPreferences[kind];
    if (kind === "text") {
      editText(object, true);
      return;
    }
    changePlan((current) => ({
      ...current,
      objects: [...current.objects, object],
    }));
    setSelectedId(object.id);
    setInspectorTab("plan");
  }
  function canvasPoint(event: { clientX: number; clientY: number }): XY {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return { x: 500, y: 500 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return { x: clamp(point.x), y: clamp(point.y) };
  }
  function pointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (textEditorRef.current) finishText(true);
    if (event.pointerType === "touch") {
      touchPoints.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      event.currentTarget.setPointerCapture(event.pointerId);
      if (touchPoints.current.size === 1) touchHistory.current = historyRef.current;
      if (touchPoints.current.size === 2) {
        const points = [...touchPoints.current.values()];
        const middle = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        const matrix = event.currentTarget.getScreenCTM();
        if (!matrix) return;
        if (gesture.current) { setHistory(gesture.current.original); gesture.current = null; }
        if (touchHistory.current) setHistory(touchHistory.current);
        touchPlacement.current = null;
        panGesture.current = null;
        setSelectedId(null);
        pinch.current = { distance: Math.max(1, Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)), middle,
          anchor: new DOMPoint(middle.x, middle.y).matrixTransform(matrix.inverse()), view: viewRef.current, scale: matrix.a };
        setPanning(true);
        event.preventDefault();
        return;
      }
      if (pinch.current || touchPoints.current.size > 2) return;
    }
    if ((event.button !== 0 && event.button !== 1) || gesture.current || panGesture.current) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    const point = canvasPoint(event);
    const target = event.target as Element;
    const grip = target.closest<SVGGElement>("[data-route-endpoint]");
    const objectId = grip ? selectedId : target.closest("[data-object-id]")?.getAttribute("data-object-id");
    if (event.button === 1 || spaceHeld.current || tool === "hand" || (tool === "select" && !objectId)) {
      if (tool === "select" && !spaceHeld.current && event.button === 0) setSelectedId(null);
      panGesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, view: viewRef.current, scale: event.currentTarget.getScreenCTM()?.a || 1 };
      setPanning(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (tool === "select") {
      const textObject = plan.objects.find((object) => object.id === objectId && object.kind === "text");
      const previousPress = lastTextPress.current;
      if (textObject && previousPress && previousPress.id === objectId && event.timeStamp - previousPress.time < 400 && Math.hypot(event.clientX - previousPress.x, event.clientY - previousPress.y) < 8) {
        lastTextPress.current = null;
        editText(textObject);
        return;
      }
      lastTextPress.current = textObject ? { id: textObject.id, time: event.timeStamp, x: event.clientX, y: event.clientY } : null;
      setSelectedId(objectId || null);
      if (objectId) setInspectorTab("plan");
      if (objectId) {
        let endpoint: RouteEnd | undefined;
        if (grip && selected?.points?.length) {
          const start = selected.points[0], end = selected.points[selected.points.length - 1];
          const toStart = Math.hypot(point.x - start.x, point.y - start.y);
          const toEnd = Math.hypot(point.x - end.x, point.y - end.y);
          const span = Math.hypot(end.x - start.x, end.y - start.y);
          // On short arrows the touch rings overlap. Keep the shaft draggable
          // between the ends and let each tip keep the nearest side of the hit area.
          const onShortShaft = selected.points.length === 2 && span > 0
            && Math.min(toStart, toEnd) >= span * .35 && toStart + toEnd <= span * 1.1;
          if (!onShortShaft) {
            endpoint = toStart < toEnd ? "start" : "end";
            event.currentTarget.querySelector<SVGGElement>(`[data-route-endpoint="${endpoint}"]`)?.focus({ preventScroll: true });
          }
        }
        gesture.current = {
          pointerId: event.pointerId,
          mode: "move",
          endpoint,
          start: point,
          original: historyRef.current,
          objectId,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (tool === "erase") {
      if (objectId)
        changePlan((current) => ({
          ...current,
          objects: current.objects.filter((object) => object.id !== objectId),
        }));
      return;
    }
    if (tool === "route" || tool === "pen") {
      if (plan.objects.length >= MAX_OBJECTS) {
        notify.current(`This board is full (${MAX_OBJECTS} objects).`);
        return;
      }
      const object: BoardObject = {
        id: uid(),
        kind: tool,
        x: 0,
        y: 0,
        points: [point, point],
        ...(inkPreferences[tool] ? { color: inkPreferences[tool] } : {}),
      };
      gesture.current = {
        pointerId: event.pointerId,
        mode: "draw",
        start: point,
        original: historyRef.current,
        objectId: object.id,
      };
      setHistory((current) => ({
        ...current,
        present: {
          ...current.present,
          objects: [...current.present.objects, object],
        },
      }));
      setSelectedId(tool === "pen" ? null : object.id);
      setInspectorTab("plan");
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (tool === "text" && objectId) {
      const existing = plan.objects.find((object) => object.id === objectId && object.kind === "text");
      if (existing) { editText(existing); return; }
    }
    if (event.pointerType === "touch") touchPlacement.current = { pointerId: event.pointerId, kind: tool, point };
    else addObject(tool, point);
  }
  function pointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.pointerType === "touch" && touchPoints.current.has(event.pointerId))
      touchPoints.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const activePinch = pinch.current;
    if (activePinch) {
      if (touchPoints.current.size >= 2) {
        const points = [...touchPoints.current.values()].slice(0, 2);
        const middle = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        const zoomed = zoomView(activePinch.view, activePinch.view.zoom * distance / activePinch.distance, activePinch.anchor);
        const scale = activePinch.scale * zoomed.zoom / activePinch.view.zoom;
        setView(boundView({ ...zoomed, x: zoomed.x - (middle.x - activePinch.middle.x) / scale, y: zoomed.y - (middle.y - activePinch.middle.y) / scale }));
      }
      return;
    }
    const activePan = panGesture.current;
    if (activePan && activePan.pointerId === event.pointerId) {
      setView(panView(activePan.view, -(event.clientX - activePan.x) / activePan.scale, -(event.clientY - activePan.y) / activePan.scale));
      return;
    }
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const point = canvasPoint(event);
    if (active.mode === "move") {
      const source = active.original.present.objects.find(
        (object) => object.id === active.objectId,
      );
      if (!source) return;
      const dx = point.x - active.start.x, dy = point.y - active.start.y;
      const moved = active.endpoint ? translateRouteEnd(source, active.endpoint, dx, dy) : translated(source, dx, dy);
      setHistory((current) => ({
        ...current,
        present: {
          ...current.present,
          objects: current.present.objects.map((object) =>
            object.id === active.objectId ? moved : object,
          ),
        },
      }));
    } else {
      const coalesced = event.nativeEvent.getCoalescedEvents?.() || [];
      const samples = [...coalesced, event.nativeEvent].map(canvasPoint);
      setHistory((current) => ({
        ...current,
        present: {
          ...current.present,
          objects: current.present.objects.map((object) => {
            if (object.id !== active.objectId) return object;
            if (object.kind === "route")
              return { ...object, points: [active.start, point] };
            return { ...object, points: appendPenPoints(object.points || [active.start], samples) };
          }),
        },
      }));
    }
  }
  function pointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    touchPoints.current.delete(event.pointerId);
    if (pinch.current) {
      if (!touchPoints.current.size) { pinch.current = null; touchHistory.current = null; setPanning(false); }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    if (panGesture.current?.pointerId === event.pointerId) {
      panGesture.current = null; setPanning(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    const placement = touchPlacement.current;
    if (placement?.pointerId === event.pointerId) {
      touchPlacement.current = null;
      addObject(placement.kind, placement.point);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (active.mode === "draw" || active.endpoint) pointerMove(event);
    gesture.current = null;
    setHistory((current) => {
      let next = current.present;
      const drawn = next.objects.find(
        (object) => object.id === active.objectId,
      );
      if (
        active.mode === "draw" &&
        drawn?.points &&
        !drawn.points.some(
          (point) =>
            Math.hypot(point.x - active.start.x, point.y - active.start.y) > 3,
        )
      )
        next = {
          ...next,
          objects: next.objects.filter(
            (object) => object.id !== active.objectId,
          ),
        };
      return commit(active.original, next);
    });
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function cancelGesture() {
    panGesture.current = null;
    pinch.current = null;
    touchPoints.current.clear();
    touchHistory.current = null;
    touchPlacement.current = null;
    setPanning(false);
    const active = gesture.current;
    if (active) {
      gesture.current = null;
      setHistory(active.original);
      if (svgRef.current?.hasPointerCapture(active.pointerId))
        svgRef.current.releasePointerCapture(active.pointerId);
    }
  }
  function navigateHistory(direction: "undo" | "redo") {
    const current = gesture.current?.original || historyRef.current;
    cancelGesture();
    const next = direction === "undo" ? undo(current) : redo(current);
    if (next === current) return;
    setHistory(next);
    const previousImage = historyImages.current.get(next.present);
    if (previousImage !== undefined && previousImage !== customImage) {
      setCustomImage(previousImage);
      try {
        if (previousImage) localStorage.setItem(imageKey(map.id, levelId), previousImage);
        else localStorage.removeItem(imageKey(map.id, levelId));
      } catch { notify.current("The restored radar is held for this session. Export to keep a copy."); }
    }
    const owner = historyOwners.current.get(next.present) || null;
    setLoadedId(
      owner && saved.some((item) => item.id === owner) ? owner : null,
    );
  }
  function keyboard(event: ReactKeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (
      event.defaultPrevented ||
      document.querySelector("dialog[open]") ||
      target.matches("input,textarea,select") ||
      target.isContentEditable
      || !!target.closest("[popover]")
    )
      return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      navigateHistory(event.shiftKey ? "redo" : "undo");
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      navigateHistory("redo");
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target === svgRef.current) {
      if (event.key === " ") { event.preventDefault(); spaceHeld.current = true; setSpacePan(true); return; }
      if (["+", "=", "-", "_", "0"].includes(event.key)) {
        event.preventDefault();
        setView(current => event.key === "0" ? FIT_VIEW : zoomView(current, current.zoom * (["-", "_"].includes(event.key) ? 1 / 1.25 : 1.25)));
        return;
      }
      if ((!selected || tool === "hand" || spaceHeld.current) && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const amount = (event.shiftKey ? 120 : 40) / view.zoom;
        setView(current => panView(current, event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0, event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0));
        return;
      }
    }
    if (event.key === "Escape") {
      if (target.closest("[data-route-endpoint]")) svgRef.current?.focus({ preventScroll: true });
      cancelGesture();
      setSelectedId(null);
      chooseTool("select");
      return;
    }
    if (event.key === "Enter" && event.target === svgRef.current && selected?.kind === "text" && tool === "select") {
      event.preventDefault();
      editText(selected);
      return;
    }
    if (
      selected &&
      event.target === svgRef.current &&
      (event.key === "Delete" || event.key === "Backspace")
    ) {
      event.preventDefault();
      removeSelected();
      return;
    }
    if (
      selected &&
      (event.target === svgRef.current || target.hasAttribute("data-route-endpoint")) &&
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      event.preventDefault();
      const endpoint = target.getAttribute("data-route-endpoint");
      const amount = event.shiftKey ? 20 : endpoint ? 1 : 5;
      const dx = event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0;
      const dy = event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0;
      changeObject(selected.id, object => endpoint === "start" || endpoint === "end"
        ? translateRouteEnd(object, endpoint, dx, dy) : translated(object, dx, dy));
      return;
    }
    if (
      event.key === "Enter" &&
      event.target === svgRef.current &&
      tool !== "select" &&
      tool !== "hand" &&
      tool !== "erase"
    ) {
      event.preventDefault();
      addObject(tool);
      return;
    }
    const nextTool = toolItems.find(
      (item) => item.key.toLowerCase() === event.key.toLowerCase(),
    );
    if (nextTool && !target.closest("button,summary")) {
      event.preventDefault();
      chooseTool(nextTool.id);
    }
  }
  function saveTactic() {
    const name = plan.name.trim();
    if (!name) {
      notify.current("Give this tactic a name before saving.");
      return;
    }
    const existing = validateSavedTactics(storedJson(SAVED_KEY));
    const updateId = existing.some((item) => item.id === loadedId)
      ? loadedId
      : null;
    if (
      existing.some(
        (item) =>
          item.id !== updateId &&
          item.plan.mapId === map.id &&
          item.plan.levelId === levelId &&
          item.plan.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      notify.current(
        "A tactic already uses that name. Choose another name or load the saved tactic to update it.",
      );
      return;
    }
    if (!updateId && existing.length >= 100) {
      notify.current(
        "You have 100 saved tactics. Export and remove one before saving another.",
      );
      return;
    }
    const id = updateId || uid(),
      record: SavedTactic = {
        id,
        updatedAt: new Date().toISOString(),
        plan: { ...plan, name },
      };
    const next = [record, ...existing.filter((item) => item.id !== id)];
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(next);
      setLoadedId(id);
      historyOwners.current.set(plan, id);
      setSelectedSavedId(id);
      notify.current(
        updateId
          ? "Saved tactic updated on this device."
          : "Tactic saved on this device.",
      );
    } catch {
      notify.current(
        "Device storage is full or unavailable. Export your tactic to keep a copy.",
      );
    }
  }
  function loadTactic() {
    const item = saved.find((record) => record.id === selectedSavedId);
    if (!item) return;
    cancelGesture();
    historyOwners.current.set(item.plan, item.id);
    setHistory((current) => commit(current, item.plan));
    setLoadedId(item.id);
    setSelectedId(null);
    notify.current("Tactic loaded. Undo restores the previous board.");
  }
  function deleteTactic() {
    const item = saved.find((record) => record.id === selectedSavedId);
    if (
      !item ||
      !window.confirm(
        `Delete the saved tactic “${item.plan.name}”? The current board will stay open.`,
      )
    )
      return;
    const current = validateSavedTactics(storedJson(SAVED_KEY)),
      next = current.filter((record) => record.id !== item.id);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(next);
      setSelectedSavedId("");
      if (loadedId === item.id) setLoadedId(null);
      notify.current("Saved tactic deleted. The board is still editable.");
    } catch {
      notify.current(
        "Could not update device storage. The saved tactic was kept.",
      );
    }
  }
  function newTactic() {
    cancelGesture();
    changePlan(() => emptyPlan(map.id, levelId));
    setLoadedId(null);
    setSelectedId(null);
    notify.current("New board opened. Undo restores your previous board.");
  }
  function saveCopy() {
    setLoadedId(null);
    changePlan((current) => ({
      ...current,
      name: `${current.name.slice(0, 94)} copy`,
    }));
    notify.current("Copy ready. Give it a name and choose Save tactic.");
  }
  async function exportJson() {
    setExporting(true);
    try {
      await download(
        new Blob(
          [
            JSON.stringify(
              {
                format: "utility-lab-tactic",
                version: 1,
                plan,
                ...(customImage ? { mapImage: customImage } : {}),
              },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        ),
        `${filename(plan.name)}.json`,
      );
      notify.current("Tactic export prepared.");
    } catch (error) {
      notify.current(
        error instanceof Error
          ? error.message
          : "Could not export the tactic. Your saved records are unchanged.",
      );
    } finally {
      setExporting(false);
    }
  }
  async function importJson(file?: File) {
    if (!file) return;
    const expectedKey = latest.current.key;
    const expectedPlan = latest.current.plan;
    const operation = ++mediaOperation.current;
    try {
      if (file.size > 3_000_000)
        throw new Error(
          "This file is too large. Choose a tactic JSON smaller than 3 MB.",
        );
      const imported = validateTacticFile(JSON.parse(await file.text()));
      if (!mounted.current || operation !== mediaOperation.current) return;
      if (
        latest.current.key !== expectedKey ||
        latest.current.plan !== expectedPlan
      )
        throw new Error(
          "The board changed while reading this file. Import it again on the intended map level.",
        );
      if (imported.plan.mapId !== map.id)
        throw new Error(
          `This tactic belongs to ${imported.plan.mapId}. Select that map before importing it.`,
        );
      if (!map.levels.some((item) => item.id === imported.plan.levelId))
        throw new Error(
          "This tactic uses a level that is not available for this map.",
        );
      if (imported.plan.levelId !== levelId)
        throw new Error(
          `Select the ${map.levels.find((item) => item.id === imported.plan.levelId)?.name || imported.plan.levelId} level before importing this tactic.`,
        );
      if (imported.mapImage) {
        await imageElement(imported.mapImage);
        if (!mounted.current || operation !== mediaOperation.current) return;
        if (
          latest.current.key !== expectedKey ||
          latest.current.plan !== expectedPlan
        )
          throw new Error(
            "The board changed while reading this file. Import it again on the intended map level.",
          );
        setCustomImage(imported.mapImage);
        setMapFailed(false);
        try {
          localStorage.setItem(imageKey(map.id, levelId), imported.mapImage);
        } catch {
          notify.current(
            "Map image loaded for this session. Device storage is full.",
          );
        }
      }
      cancelGesture();
      historyOwners.current.set(imported.plan, null);
      setHistory((current) => commit(current, imported.plan));
      setLoadedId(null);
      setSelectedId(null);
      notify.current("Tactic imported. Undo restores the previous board.");
    } catch (error) {
      notify.current(
        error instanceof SyntaxError
          ? "This file is not valid JSON. Choose an exported Utility Lab tactic."
          : error instanceof Error
            ? error.message
            : "Could not import this tactic.",
      );
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }
  async function uploadImage(file?: File) {
    if (!file) return;
    const expectedKey = latest.current.key;
    const operation = ++mediaOperation.current;
    setUploading(true);
    try {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
        throw new Error("Choose a PNG, JPEG, or WebP map image.");
      if (file.size > 8_000_000)
        throw new Error("Choose a map image smaller than 8 MB.");
      const url = URL.createObjectURL(file);
      let loaded: HTMLImageElement;
      try {
        loaded = await imageElement(url);
      } finally {
        URL.revokeObjectURL(url);
      }
      if (loaded.naturalWidth > 10000 || loaded.naturalHeight > 10000)
        throw new Error(
          "This image is too large. Resize it to at most 10,000 pixels per side.",
        );
      const size = Math.min(
        1,
        1600 / Math.max(loaded.naturalWidth, loaded.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(loaded.naturalWidth * size);
      canvas.height = Math.round(loaded.naturalHeight * size);
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error("Image processing is unavailable in this browser.");
      context.drawImage(loaded, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/webp", 0.86);
      if (data.length > 2_000_000)
        throw new Error(
          "This image is still too large after resizing. Try a simpler or smaller radar image.",
        );
      if (!mounted.current || operation !== mediaOperation.current) return;
      if (latest.current.key !== expectedKey)
        throw new Error(
          "The map level changed while preparing this image. Upload it again on the intended level.",
        );
      setCustomImage(data);
      setMapFailed(false);
      try {
        localStorage.setItem(imageKey(map.id, levelId), data);
        notify.current(
          "Custom map image saved on this device. JSON exports include it.",
        );
      } catch {
        notify.current(
          "Map image loaded for this session. Device storage is full; export JSON to keep a copy.",
        );
      }
    } catch (error) {
      notify.current(
        error instanceof Error ? error.message : "Could not load this image.",
      );
    } finally {
      setUploading(false);
      if (imageRef.current) imageRef.current.value = "";
    }
  }
  async function exportPng() {
    if (!svgRef.current) return;
    setExporting(true);
    try {
      const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", "1600");
      clone.setAttribute("height", "1600");
      clone.setAttribute("viewBox", "0 0 1000 1000");
      clone.removeAttribute("class");
      const currentStyle = getComputedStyle(svgRef.current);
      // A standalone SVG has no app stylesheet: resolve currentColor, variables,
      // raster appearance filters and inherited text before rasterizing it.
      const sourceElements = [
        svgRef.current,
        ...svgRef.current.querySelectorAll<SVGElement>("*"),
      ];
      const clonedElements = [
        clone,
        ...clone.querySelectorAll<SVGElement>("*"),
      ];
      sourceElements.forEach((source, index) => {
        const element = clonedElements[index];
        if (!element) return;
        const style = getComputedStyle(source);
        for (const property of [
          "color",
          "fill",
          "stroke",
          "font-family",
          "font-size",
          "font-weight",
          "filter",
        ]) {
          const value = style.getPropertyValue(property);
          if (value) element.style.setProperty(property, value);
        }
      });
      clone
        .querySelectorAll("[data-selection]")
        .forEach((item) => item.remove());
      const radar = clone.querySelector("image");
      if (radar && image) {
        if (image.startsWith("data:")) radar.setAttribute("href", image);
        else {
          const response = await fetch(image);
          if (!response.ok)
            throw new Error("The map could not be loaded for export.");
          radar.setAttribute("href", await blobDataUrl(await response.blob()));
        }
      }
      const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      let img: HTMLImageElement;
      try {
        img = await imageElement(url);
      } finally {
        URL.revokeObjectURL(url);
      }
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1600;
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error(
          "PNG export is unavailable in this browser. Use JSON export.",
        );
      context.drawImage(img, 0, 0);
      context.fillStyle =
        currentStyle.getPropertyValue("--canvas").trim() || "#171d21";
      context.fillRect(0, 1544, 1600, 56);
      context.fillStyle =
        currentStyle.getPropertyValue("--text").trim() || "#edf0e9";
      context.font = "20px Arial";
      context.fillText(`${map.name} · ${plan.name}`, 24, 1579, 1500);
      const output = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(new Error("PNG export failed. Use JSON export.")),
          "image/png",
        ),
      );
      await download(output, `${filename(plan.name)}.png`);
      notify.current("Board exported as PNG.");
    } catch (error) {
      notify.current(
        error instanceof Error
          ? error.message
          : "Could not export PNG. Try JSON export.",
      );
    } finally {
      setExporting(false);
    }
  }

  const activeTool = toolItems.find((item) => item.id === tool)!;
  const toolGroups = [
    ["select", "hand", "route", "pen", "text", "erase"],
    ["t", "ct"],
    ["smoke", "flash", "molotov", "he"],
  ];
  const players = plan.objects.filter(
    (object) => object.kind === (plan.side === "T" ? "t" : "ct"),
  );
  const utilityCount = plan.objects.filter((object) =>
    ["smoke", "flash", "molotov", "he"].includes(object.kind),
  ).length;
  const thumb = (
    map.levels[0]?.radarImage ||
    map.levels[0]?.image ||
    ""
  ).replace("/maps/", "/map-thumbnails/");
  return (
    <section
      className={
        "tactic-board" +
        (inspectorOpen ? " has-inspector" : "") +
        (compact ? " is-overlay" : "")
      }
      aria-label="Tactic editor"
      onKeyDown={keyboard}
      onKeyUp={event => { if (event.key === " ") { spaceHeld.current = false; setSpacePan(false); } }}
    >
      <header className="tb-titlebar">
        <button
          className="tb-map-picker"
          onClick={onOpenMaps}
          aria-label="Change map"
        >
          {thumb && (
            <span className="tb-map-picker-preview">
              <img src={thumb} alt="" />
            </span>
          )}
          <span className="tb-map-picker-name">
            {map.name}
            <small>{map.mode}</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <span className="tb-document-divider" />
        <div className="tb-title-block">
          <input
            className="tb-title-input"
            aria-label="Strategy name"
            value={plan.name}
            maxLength={100}
            onChange={(event) =>
              changePlan((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
          <span
            className={
              "tb-draft-status" + (draftStatus === "error" ? " is-error" : "")
            }
            aria-live="polite"
          >
            {draftStatus === "saved" ? (
              <Check size={13} />
            ) : draftStatus === "saving" ? (
              <span className="tb-status-dot" />
            ) : (
              <CircleDot size={13} />
            )}
            {draftStatus === "saved"
              ? "Saved on this device"
              : draftStatus === "saving"
                ? "Saving draft…"
                : "Storage unavailable · export to keep"}
          </span>
        </div>
        <div className="tb-title-actions">
          <button className="tb-button tb-new-button" onClick={newTactic}>
            <Plus size={17} />
            <span>New</span>
          </button>
          <details className="tb-export">
            <summary className="tb-button">
              <Download size={17} />
              <span>Export</span>
              <ChevronDown size={13} />
            </summary>
            <div className="tb-export-menu">
              <button onClick={event => { setShareMode("open"); event.currentTarget.closest("details")?.removeAttribute("open"); }}><FolderOpen size={17} />Open share code</button>
              <button
                disabled={exporting}
                onClick={(event) => {
                  void exportJson();
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                }}
              >
                <ArrowDownToLine size={17} />
                Export tactic JSON
              </button>
              <button
                disabled={exporting}
                onClick={(event) => {
                  void exportPng();
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                }}
              >
                {exporting ? (
                  <LoaderCircle size={17} />
                ) : (
                  <Download size={17} />
                )}
                Export board PNG
              </button>
              <button
                onClick={(event) => {
                  importRef.current?.click();
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                }}
              >
                <ArrowUpFromLine size={17} />
                Import tactic JSON
              </button>
              <button
                onClick={(event) => {
                  saveCopy();
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                }}
              >
                <Copy size={17} />
                Make a copy
              </button>
            </div>
          </details>
          <button className="tb-button tb-share-button" onClick={() => setShareMode("share")}><Share2 size={17} /><span>Share</span></button>
          <button
            ref={planToggleRef}
            className={
              "tb-button tb-plan-toggle" + (inspectorOpen ? " is-active" : "")
            }
            aria-label={inspectorOpen ? "Close round plan" : "Open round plan"}
            aria-expanded={inspectorOpen}
            onClick={() => setInspectorOpen(!inspectorOpen)}
          >
            {inspectorOpen ? (
              <PanelRightClose size={18} />
            ) : (
              <PanelRightOpen size={18} />
            )}
            <span>Plan</span>
          </button>
          <button className="tb-button tb-primary" onClick={saveTactic}>
            <Save size={17} />
            <span>{loadedId ? "Update tactic" : "Save tactic"}</span>
          </button>
        </div>
      </header>
      <div className="tb-workspace">
        <div className="tb-canvas-area">
          <div className="tb-canvas-top">
            <div className="tb-levels" role="group" aria-label="Map level">
              {map.levels.length > 4 ? (
                <label className="tb-level-select">
                  <LayersLabel />
                  <select
                    aria-label="Map level"
                    value={levelId}
                    onChange={(event) => switchLevel(event.target.value)}
                  >
                    {map.levels.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </label>
              ) : map.levels.length > 1 ? (
                map.levels.map((item) => (
                  <button
                    key={item.id}
                    className={levelId === item.id ? "is-active" : ""}
                    aria-pressed={levelId === item.id}
                    onClick={() => switchLevel(item.id)}
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <span className="tb-level-single">
                  <span className="tb-live-dot" />
                  {level?.name || "Overview"}
                </span>
              )}
            </div>
            <div className="tb-history">
              <button
                className="tb-icon-button"
                disabled={!history.past.length}
                onClick={() => navigateHistory("undo")}
                title="Undo (Ctrl / ⌘ Z)"
                aria-label="Undo"
              >
                <Undo2 size={18} />
              </button>
              <button
                className="tb-icon-button"
                disabled={!history.future.length}
                onClick={() => navigateHistory("redo")}
                title="Redo (Ctrl / ⌘ Shift Z)"
                aria-label="Redo"
              >
                <Redo2 size={18} />
              </button>
              <span className="tb-divider" />
              <button
                className="tb-icon-button"
                disabled={!plan.objects.length}
                onClick={() => {
                  changePlan((current) => ({
                    ...current,
                    objects: [],
                    illustrative: false,
                  }));
                  setSelectedId(null);
                  notify.current("Board cleared. Undo restores all objects.");
                }}
                title="Clear board (undoable)"
                aria-label="Clear board"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
          <div className="tb-map-stage" ref={mapStage}>
            <svg
              ref={svgRef}
              className={"tb-map tb-cursor-" + tool + (panning ? " is-panning" : spacePan ? " is-space-pan" : "")}
              viewBox={viewBox(view)}
              role={tool === "select" && selected?.kind === "route" ? "group" : "img"}
              aria-label={
                map.name +
                " " +
                (level?.name || "") +
                " tactic canvas. " +
                plan.objects.length +
                " objects. Select a tool and click to place, or press Enter to place at center. Drag empty space, hold Space and drag, or use the hand tool to pan. Wheel or plus/minus to zoom; 0 fits the map. Arrow keys move a selected object, otherwise pan."
              }
              tabIndex={0}
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={cancelGesture}
              onDoubleClick={(event) => {
                const id = (event.target as Element).closest("[data-object-id]")?.getAttribute("data-object-id");
                const object = plan.objects.find((item) => item.id === id && item.kind === "text");
                if (object && (tool === "select" || tool === "text")) {
                  event.preventDefault();
                  cancelGesture();
                  editText(object);
                }
              }}
              onLostPointerCapture={event => { if (gesture.current?.pointerId === event.pointerId || panGesture.current?.pointerId === event.pointerId) cancelGesture(); }}
              onBlur={() => { spaceHeld.current = false; setSpacePan(false); }}
            >
              <rect width="1000" height="1000" fill="var(--canvas)" />
              {image && !mapFailed && (
                <image
                  data-raster={image.endsWith(".png") ? "true" : undefined}
                  href={image}
                  width="1000"
                  height="1000"
                  preserveAspectRatio="xMidYMid meet"
                  onLoad={() => setMapFailed(false)}
                  onError={() => setMapFailed(true)}
                />
              )}
              {plan.objects.map((object) => (
                <BoardObjectDrawing
                  key={object.id}
                  object={object}
                />
              ))}
              {selected && tool !== "pen" && !textEditor && (
                tool === "select" && selected.kind === "route" && selected.points?.length
                  ? <RouteHandles points={selected.points} zoom={view.zoom} />
                  : <Selection object={selected} />
              )}
            </svg>
            {textEditor && <div
              className="tb-inline-text-editor"
              role="group"
              aria-label="Edit map label"
              style={textPosition}
              onPointerDown={(event) => event.stopPropagation()}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) finishText(true);
              }}
            >
              <input
                ref={textInput}
                aria-label="Map text label"
                aria-description="Press Enter to save or Escape to cancel."
                placeholder="Type a label"
                maxLength={80}
                value={textEditor.value}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setTextEditor((current) => current ? { ...current, value } : null);
                }}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing) return;
                  if (event.key === "Enter" || event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    finishText(event.key === "Enter", true);
                  }
                }}
              />
              <button type="button" aria-label="Save map label" onClick={() => finishText(true, true)}><Check size={19} /></button>
              <button type="button" aria-label="Cancel map label" onClick={() => finishText(false, true)}><X size={18} /></button>
            </div>}
            {(!image || mapFailed) && (
              <div className="tb-missing-map">
                <ImagePlus size={30} />
                <h3>
                  {mapFailed
                    ? "Map image could not load"
                    : "Add this map’s radar"}
                </h3>
                <p>Upload a PNG, JPEG, or WebP to plan on the real layout.</p>
                <button
                  className="tb-button"
                  onClick={() => imageRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Loading image…" : "Upload radar image"}
                </button>
              </div>
            )}
          </div>
          <div className="tb-canvas-legend" aria-label="Map marker legend">
            <span>
              <i className="tb-legend-t" />T players
            </span>
            <span>
              <i className="tb-legend-ct" />
              CT players
            </span>
            <span>
              <i className="tb-legend-utility" />
              Utility
            </span>
          </div>
          <div className="tb-toolbox" role="group" aria-label="Drawing tools">
            {showInk && <div className="tb-ink-control">
              <button ref={inkButton} className="tb-ink-trigger" aria-label="Drawing colour" aria-expanded={inkOpen}
                aria-controls={inkPopoverId} popoverTarget={inkPopoverId} title="Drawing colour"
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const width = Math.min(264, window.innerWidth - 16);
                  const edgeDock = window.matchMedia("(min-width: 801px)").matches;
                  setInkPosition({
                    left: Math.max(8, Math.min(edgeDock ? rect.right + 12 : rect.left, window.innerWidth - width - 8)),
                    top: Math.max(8, Math.min(edgeDock ? rect.top : rect.top - 184, window.innerHeight - 192)),
                  });
                }}>
                <span className="tb-ink-dot" style={{ background: activeInk || boardObjectColors[inkKind] }} />
                <span>Colour</span><ChevronDown size={14} />
              </button>
              <div ref={inkPopover} id={inkPopoverId} popover="auto" role="dialog" aria-label="Drawing colour choices"
                className="tb-ink-popover" style={inkPosition}
                onToggle={(event) => {
                  const open = event.currentTarget.matches(":popover-open");
                  setInkOpen(open);
                  if (open) requestAnimationFrame(() => inkPopover.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus({ preventScroll: true }));
                }} onKeyDown={(event) => {
                  event.stopPropagation();
                  if(event.key === "Escape") {
                    event.preventDefault();
                    event.currentTarget.hidePopover();
                    inkButton.current?.focus({preventScroll:true});
                  }
                }}>
                <div className="tb-ink-heading"><strong>Drawing colour</strong><span>{selectedInk ? "Selected + new" : "New drawings"}</span></div>
                <div className="tb-ink-swatches" role="group" aria-label="Ink colours">
                  {inkSwatches.map((swatch) => <button key={swatch.label} className="tb-ink-swatch"
                    aria-label={swatch.label} aria-pressed={activeInk === swatch.color} title={swatch.label}
                    onClick={() => chooseInk(swatch.color)} style={{ background: swatch.color || boardObjectColors[inkKind] }}>
                    {!swatch.color && <Pencil size={18} />}
                    {activeInk === swatch.color && <span className="tb-ink-check"><Check size={14} /></span>}
                  </button>)}
                </div>
              </div>
            </div>}
            {toolGroups.map((group, index) => (
              <div
                className="tb-tool-group"
                role="group"
                aria-label={["Drawing", "Players", "Utility"][index]}
                key={index}
              >
                {group.map((id) => {
                  const item = toolItems.find((entry) => entry.id === id)!;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={
                        "tb-tool" +
                        (["smoke", "flash", "molotov", "he"].includes(item.id)
                          ? " tb-utility-tool"
                          : "") +
                        (tool === item.id ? " is-active" : "")
                      }
                      aria-label={item.label + " (" + item.key + ")"}
                      aria-pressed={tool === item.id}
                      title={item.label + " (" + item.key + ")"}
                      data-tooltip={item.label + " · " + item.key}
                      onClick={() => chooseTool(item.id)}
                    >
                      {["smoke", "flash", "molotov", "he"].includes(item.id) ? (
                        <>
                          <UtilityIcon
                            type={item.id as UtilityKind}
                            size={25}
                          />
                          <span className="tb-tool-label">
                            {
                              {
                                smoke: "Smoke",
                                flash: "Flash",
                                molotov: "Molly",
                                he: "HE",
                              }[item.id as UtilityKind]
                            }
                          </span>
                        </>
                      ) : (
                        <Icon size={20} strokeWidth={1.8} />
                      )}
                      {item.id === "t" || item.id === "ct" ? (
                        <span className={"tb-team-dot " + item.id} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="tb-canvas-bottom">
            <div className="tb-canvas-hint">
              <MousePointer2 size={14} />
              <span>
                {tool === "select"
                  ? selected?.kind === "route" ? "Drag a handle to adjust the route · drag the line to move it" : "Drag empty space to pan · wheel to zoom"
                  : tool === "hand" ? "Drag to pan · wheel to zoom"
                  : tool === "erase"
                    ? "Click an object to erase"
                    : tool === "route" || tool === "pen"
                      ? "Drag to draw " +
                        (tool === "route" ? "a route" : "on the map")
                      : "Click to place " + activeTool.label.toLowerCase()}
              </span>
              <kbd>{activeTool.key}</kbd>
            </div>
            <div className="tb-zoom" role="group" aria-label="Map zoom">
              <button
                className="tb-icon-button"
                aria-label="Zoom out"
                disabled={view.zoom <= MIN_ZOOM}
                onClick={() => setView(current => zoomView(current, current.zoom / 1.25))}
              >
                <ZoomOut size={18} />
              </button>
              <button
                className="tb-zoom-value"
                onClick={() => setView(FIT_VIEW)}
                title="Fit map (0)"
                aria-label="Reset map view"
              >
                {Math.round(view.zoom * 100)}%
              </button>
              <button
                className="tb-icon-button"
                aria-label="Zoom in"
                disabled={view.zoom >= MAX_ZOOM}
                onClick={() => setView(current => zoomView(current, current.zoom * 1.25))}
              >
                <ZoomIn size={18} />
              </button>
              <span className="tb-divider" />
              <button
                className="tb-icon-button tb-reset-zoom"
                aria-label="Fit map"
                onClick={() => setView(FIT_VIEW)}
              >
                <Maximize size={17} />
              </button>
            </div>
          </div>
          {map.credit && (
            <div className="tb-map-credit">
              {map.credit.includes("setpos.gg") ? (
                <a href="https://setpos.gg" target="_blank" rel="noreferrer">
                  Minimaps by setpos.gg
                </a>
              ) : (
                map.credit
              )}
            </div>
          )}
        </div>
        <aside
          className={"tb-inspector" + (inspectorOpen ? " is-open" : "")}
          aria-label="Round plan"
          inert={!inspectorOpen}
        >
          <div className="tb-inspector-heading">
            <div>
              <h2>Round plan</h2>
              <span>
                {players.length} {plan.side} players · {utilityCount} utility
              </span>
            </div>
            <button
              className="tb-icon-button"
              aria-label="Close round plan"
              onClick={() => {
                setInspectorOpen(false);
                planToggleRef.current?.focus();
              }}
            >
              <PanelRightClose size={19} />
            </button>
          </div>
          <div
            className="tb-inspector-tabs"
            role="tablist"
            aria-label="Round plan sections"
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? "plan"
                  : event.key === "End"
                    ? "objects"
                    : inspectorTab === "plan"
                      ? "objects"
                      : "plan";
              setInspectorTab(next);
              event.currentTarget
                .querySelectorAll<HTMLButtonElement>('[role="tab"]')
                [next === "plan" ? 0 : 1]?.focus();
            }}
          >
            <button
              role="tab"
              id={uniqueId + "-plan-tab"}
              tabIndex={inspectorTab === "plan" ? 0 : -1}
              aria-controls={uniqueId + "-inspector-panel"}
              aria-selected={inspectorTab === "plan"}
              onClick={() => setInspectorTab("plan")}
            >
              Plan
            </button>
            <button
              role="tab"
              id={uniqueId + "-objects-tab"}
              tabIndex={inspectorTab === "objects" ? 0 : -1}
              aria-controls={uniqueId + "-inspector-panel"}
              aria-selected={inspectorTab === "objects"}
              onClick={() => setInspectorTab("objects")}
            >
              Objects <span>{plan.objects.length}</span>
            </button>
          </div>
          {tool !== "select" && tool !== "hand" && tool !== "erase" && (
            <div className="tb-quick-add">
              <button className="tb-button" onClick={() => addObject(tool)}>
                <Plus size={15} />
                Place {activeTool.label.toLowerCase()} at center
              </button>
            </div>
          )}
          <div
            className="tb-inspector-scroll"
            role="tabpanel"
            id={uniqueId + "-inspector-panel"}
            aria-labelledby={
              uniqueId +
              (inspectorTab === "plan" ? "-plan-tab" : "-objects-tab")
            }
          >
            {inspectorTab === "plan" && (
              <>
                {selected && (
                  <div className="tb-inspector-section tb-selection-editor">
                    <div className="tb-field-label">
                      Selected object{" "}
                      <button
                        className="tb-icon-button"
                        aria-label="Delete selected object"
                        title="Delete selected object"
                        onClick={removeSelected}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="tb-selected-name">{objectLabel(selected)}</p>
                    <label
                      className="tb-small-label"
                      htmlFor={`${uniqueId}-object-label`}
                    >
                      Label
                    </label>
                    <input
                      id={`${uniqueId}-object-label`}
                      className="tb-input"
                      value={selected.label || ""}
                      maxLength={80}
                      placeholder={
                        selected.kind === "text"
                          ? "Text on the map"
                          : "Optional callout"
                      }
                      onChange={(event) =>
                        changeObject(selected.id, (object) => ({
                          ...object,
                          label: event.target.value,
                        }))
                      }
                    />
                    {(selected.kind === "t" || selected.kind === "ct") && (
                      <label className="tb-number-label">
                        Player number
                        <input
                          className="tb-input"
                          type="number"
                          min="1"
                          max="99"
                          value={selected.number || 1}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            if (
                              Number.isInteger(value) &&
                              value >= 1 &&
                              value <= 99
                            )
                              changeObject(selected.id, (object) => ({
                                ...object,
                                number: value,
                              }));
                          }}
                        />
                      </label>
                    )}
                    <span className="tb-small-label tb-position-label">
                      Position on map (0–1000)
                    </span>
                    <div className="tb-position-grid">
                      {(["x", "y"] as const).map((axis) => (
                        <label key={axis}>
                          {axis.toUpperCase()}
                          <input
                            className="tb-input"
                            type="number"
                            min="0"
                            max="1000"
                            step="5"
                            aria-label={`Selected object ${axis.toUpperCase()} position`}
                            value={Math.round(
                              (selected.points?.[0] || selected)[axis],
                            )}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              if (Number.isFinite(value))
                                changeObject(selected.id, (object) =>
                                  translated(
                                    object,
                                    axis === "x"
                                      ? clamp(value) -
                                          (object.points?.[0] || object).x
                                      : 0,
                                    axis === "y"
                                      ? clamp(value) -
                                          (object.points?.[0] || object).y
                                      : 0,
                                  ),
                                );
                            }}
                          />
                        </label>
                      ))}
                    </div>
                    {selected.kind === "route" && selected.points && (
                      <fieldset className="tb-route-endpoints">
                        <legend>Route endpoints</legend>
                        {(["start", "end"] as const).map((endpoint) => (
                          <div className="tb-endpoint-row" key={endpoint}>
                            <span>
                              {endpoint === "start" ? "Start" : "End"}
                            </span>
                            <div className="tb-position-grid">
                              {(["x", "y"] as const).map((axis) => (
                                <label key={axis}>
                                  {axis.toUpperCase()}
                                  <input
                                    className="tb-input"
                                    type="number"
                                    min="0"
                                    max="1000"
                                    step="5"
                                    aria-label={`Route ${endpoint} ${axis.toUpperCase()} position`}
                                    value={Math.round(
                                      selected.points![
                                        endpoint === "start"
                                          ? 0
                                          : selected.points!.length - 1
                                      ][axis],
                                    )}
                                    onChange={(event) => {
                                      const value = Number(event.target.value);
                                      if (Number.isFinite(value))
                                        changeObject(selected.id, (object) =>
                                          endpointChanged(
                                            object,
                                            endpoint,
                                            axis,
                                            value,
                                          ),
                                        );
                                    }}
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </fieldset>
                    )}
                    <div
                      className="tb-nudge-controls"
                      role="group"
                      aria-label="Move selected object without dragging"
                    >
                      {[
                        { label: "left", x: -10, y: 0, icon: ArrowLeft },
                        { label: "up", x: 0, y: -10, icon: ArrowUp },
                        { label: "down", x: 0, y: 10, icon: ArrowDown },
                        { label: "right", x: 10, y: 0, icon: ArrowRight },
                      ].map(({ label, x, y, icon: Icon }) => (
                        <button
                          key={label}
                          className="tb-icon-button"
                          title={`Move ${label} by 10 map units`}
                          aria-label={`Move selected object ${label}`}
                          onClick={() =>
                            changeObject(selected.id, (object) =>
                              translated(object, x, y),
                            )
                          }
                        >
                          <Icon size={15} />
                        </button>
                      ))}
                    </div>
                    <span className="tb-selection-help">
                      Arrow keys move · Shift moves farther · Delete removes
                    </span>
                  </div>
                )}

                <div className="tb-inspector-section tb-team-section">
                  <div className="tb-field-label">
                    Playing side
                    <UsersRound size={16} />
                  </div>
                  <div
                    className="tb-side-toggle"
                    role="group"
                    aria-label="Playing side"
                  >
                    <button
                      className={plan.side === "T" ? "is-active is-t" : ""}
                      aria-pressed={plan.side === "T"}
                      onClick={() =>
                        changePlan((current) => ({ ...current, side: "T" }))
                      }
                    >
                      <UserRound size={16} />T side
                      <span>
                        {
                          plan.objects.filter((object) => object.kind === "t")
                            .length
                        }
                      </span>
                    </button>
                    <button
                      className={plan.side === "CT" ? "is-active is-ct" : ""}
                      aria-pressed={plan.side === "CT"}
                      onClick={() =>
                        changePlan((current) => ({ ...current, side: "CT" }))
                      }
                    >
                      <Shield size={16} />
                      CT side
                      <span>
                        {
                          plan.objects.filter((object) => object.kind === "ct")
                            .length
                        }
                      </span>
                    </button>
                  </div>
                  <div
                    className={
                      "tb-roster " + (plan.side === "T" ? "is-t" : "is-ct")
                    }
                  >
                    {players.map((player) => (
                      <button
                        key={player.id}
                        aria-label={"Select " + objectLabel(player)}
                        title={objectLabel(player)}
                        onClick={() => {
                          setSelectedId(player.id);
                          setTool("select");
                        }}
                      >
                        {plan.side}
                        {player.number}
                      </button>
                    ))}
                    {players.length < 5 &&
                      Array.from({ length: 5 - players.length }, (_, index) => (
                        <button
                          className="tb-empty-player"
                          key={"empty-" + index}
                          onClick={() =>
                            addObject(plan.side === "T" ? "t" : "ct")
                          }
                          aria-label={"Add " + plan.side + " player"}
                        >
                          <Plus size={17} />
                        </button>
                      ))}
                  </div>
                </div>
                <div className="tb-inspector-section tb-notes-section">
                  <label
                    className="tb-field-label"
                    htmlFor={uniqueId + "-notes"}
                  >
                    Tactic notes
                    <Pencil size={15} />
                  </label>
                  <textarea
                    id={uniqueId + "-notes"}
                    className="tb-notes"
                    aria-label="Tactic notes"
                    value={plan.notes}
                    maxLength={8000}
                    placeholder="Add the calls, timings, and roles for this round…"
                    onChange={(event) =>
                      changePlan((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    rows={5}
                  />
                  {plan.illustrative && (
                    <p className="tb-example-note">
                      <CircleDot size={13} />
                      <span>
                        Editable example. Validate positions in practice.
                      </span>
                    </p>
                  )}
                </div>
                <details className="tb-inspector-disclosure tb-saved-section">
                  <summary>
                    <FolderOpen size={17} />
                    <span>Saved tactics</span>
                    <span className="tb-disclosure-count">
                      {visibleSaved.length}
                    </span>
                    <ChevronDown size={15} />
                  </summary>
                  <div className="tb-disclosure-content">
                    <label
                      className="tb-small-label"
                      htmlFor={uniqueId + "-saved"}
                    >
                      Choose a saved tactic
                    </label>
                    <div className="tb-load-row">
                      <select
                        id={uniqueId + "-saved"}
                        className="tb-input"
                        value={selectedSavedId}
                        onChange={(event) =>
                          setSelectedSavedId(event.target.value)
                        }
                      >
                        <option value="">
                          {visibleSaved.length
                            ? "Choose a tactic…"
                            : "No saved tactics yet"}
                        </option>
                        {visibleSaved.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.plan.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="tb-icon-button"
                        disabled={!selectedSavedId}
                        aria-label="Load selected saved tactic"
                        title="Load tactic (undoable)"
                        onClick={loadTactic}
                      >
                        <FolderOpen size={17} />
                      </button>
                      <button
                        className="tb-icon-button"
                        disabled={!selectedSavedId}
                        aria-label="Delete selected saved tactic"
                        onClick={deleteTactic}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="tb-local-note">
                      Saved in this browser. Export to move devices.
                    </p>
                  </div>
                </details>
                <details className="tb-inspector-disclosure tb-map-settings">
                  <summary>
                    <Settings2 size={17} />
                    <span>Map settings</span>
                    <ChevronDown size={15} />
                  </summary>
                  <div className="tb-disclosure-content">
                    {map.note && <p className="tb-local-note">{map.note}</p>}
                    <button
                      className="tb-button"
                      onClick={() => imageRef.current?.click()}
                      disabled={uploading}
                    >
                      <ImagePlus size={17} />
                      {uploading
                        ? "Loading radar…"
                        : customImage
                          ? "Replace custom radar"
                          : "Upload custom radar"}
                    </button>
                    {customImage && (
                      <button
                        className="tb-text-button"
                        onClick={() => {
                          if (
                            !window.confirm(
                              "Restore the supplied radar? Your custom image will be removed from this device.",
                            )
                          )
                            return;
                          try {
                            localStorage.removeItem(imageKey(map.id, levelId));
                            setCustomImage("");
                            setMapFailed(false);
                          } catch {
                            notify.current(
                              "Could not remove the saved custom radar.",
                            );
                          }
                        }}
                      >
                        Restore original radar
                      </button>
                    )}
                  </div>
                </details>
              </>
            )}
            {inspectorTab === "objects" && (
              <div className="tb-inspector-section tb-objects-section">
                <div className="tb-field-label">
                  On the board<span>{plan.objects.length}</span>
                </div>
                {plan.objects.length ? (
                  <div
                    className="tb-object-list"
                    role="list"
                    aria-label="Board objects"
                  >
                    {plan.objects.map((object) => (
                      <div key={object.id} role="listitem">
                        <button
                          className={
                            "tb-object-row" +
                            (selectedId === object.id ? " is-selected" : "")
                          }
                          onClick={() => {
                            setSelectedId(object.id);
                            setInspectorTab("plan");
                            setTool("select");
                            setInspectorTab("plan");
                          }}
                          aria-pressed={selectedId === object.id}
                        >
                          <span
                            className={"tb-object-mark tb-mark-" + object.kind}
                            style={{ color: boardObjectColors[object.kind] }}
                          >
                            {object.kind === "t" || object.kind === "ct" ? (
                              (object.kind === "t" ? "T" : "C") +
                              (object.number || 1)
                            ) : object.kind === "route" ? (
                              <MoveUpRight size={15} />
                            ) : object.kind === "pen" ? (
                              <Pencil size={15} />
                            ) : object.kind === "text" ? (
                              <Type size={15} />
                            ) : (
                              object.kind[0].toUpperCase()
                            )}
                          </span>
                          <span>{objectLabel(object)}</span>
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="tb-empty-objects">
                    <MousePointer2 size={25} />
                    <h3>Make the first move.</h3>
                    <p>
                      Choose a player, route, or utility tool, then place it on
                      the map.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="tb-inspector-footer">
            <span className="tb-local-dot" />
            Private to this browser
          </div>
        </aside>
      </div>
      <input
        className="tb-file-input"
        ref={importRef}
        type="file"
        accept=".json,application/json"
        aria-label="Import tactic JSON file"
        onChange={(event) => void importJson(event.target.files?.[0])}
      />
      <input
        className="tb-file-input"
        ref={imageRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label="Upload custom radar image"
        onChange={(event) => void uploadImage(event.target.files?.[0])}
      />
      {shareMode && <TacticShareDialog
        file={shareMode === "share" ? shareFile : undefined}
        onClose={() => setShareMode(null)}
        onNotify={onNotify}
        onEditCopy={file => {
          if (onOpenSharedTactic) { onOpenSharedTactic(file); return; }
          if (file.plan.mapId !== map.id || file.plan.levelId !== levelId) {
            notify.current("Select the shared tactic’s map and floor before editing a copy."); return;
          }
          historyOwners.current.set(file.plan, null);
          setLoadedId(null);
          setSelectedSavedId("");
          setCustomImage(file.mapImage || "");
          setHistory(current => commit(current, { ...file.plan, name: `${file.plan.name.slice(0, 94)} copy` }));
          setSelectedId(null);
        }}
      />}
    </section>
  );
}
function LayersLabel() {
  return <span>Layer</span>;
}
