import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
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
  ImagePlus,
  LoaderCircle,
  MousePointer2,
  MoveUpRight,
  Pencil,
  Redo2,
  Save,
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
} from "lucide-react";
import type { GameMap } from "./maps";
import {
  MAX_OBJECTS,
  clamp,
  commit,
  emptyPlan,
  endpointChanged,
  historyFor,
  objectLabel,
  redo,
  samplePlan,
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
  type SavedTactic,
  type XY,
} from "./board-model";
import "./tactic-board.css";

type Tool = "select" | "erase" | ObjectKind;
type Gesture = {
  pointerId: number;
  mode: "draw" | "move";
  start: XY;
  original: BoardHistory;
  objectId: string;
};
type Props = { map: GameMap; onNotify: (message: string) => void };
const SAVED_KEY = "utility-lab:tactics:v1";
const draftKey = (map: string, level: string) =>
  `utility-lab:draft:v1:${map}:${level}`;
const imageKey = (map: string, level: string) =>
  `utility-lab:radar:v1:${map}:${level}`;
// This session recovery layer survives editor remounts when browser storage is full or blocked.
// It is deliberately separate from durable saves and never reports itself as a saved tactic.
const sessionDrafts = new Map<string, BoardPlan>();
const colors: Record<ObjectKind, string> = {
  t: "#e6c986",
  ct: "#91b9ed",
  route: "#d1ef83",
  pen: "#edf0e9",
  smoke: "#d1ef83",
  flash: "#eed69a",
  molotov: "#f59a83",
  he: "#c4a7ed",
  text: "#edf0e9",
};
const toolItems = [
  { id: "select", label: "Select / move", key: "V", icon: MousePointer2 },
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
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
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
function ObjectDrawing({
  object,
  arrowId,
}: {
  object: BoardObject;
  arrowId: string;
}) {
  const color = colors[object.kind];
  if (object.kind === "route" || object.kind === "pen") {
    const points = object.points
      ?.map((point) => `${point.x},${point.y}`)
      .join(" ");
    return (
      <g data-object-id={object.id}>
        <polyline
          points={points}
          fill="none"
          stroke="transparent"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={object.kind === "route" ? 5 : 4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={object.kind === "route" ? "10 8" : undefined}
          markerEnd={object.kind === "route" ? `url(#${arrowId})` : undefined}
        />
      </g>
    );
  }
  if (object.kind === "text")
    return (
      <g
        data-object-id={object.id}
        transform={`translate(${object.x} ${object.y})`}
      >
        <rect
          x="-8"
          y="-24"
          width={Math.max(50, (object.label?.length || 9) * 12.6 + 16)}
          height="36"
          rx="5"
          fill="#101615"
          fillOpacity=".9"
        />
        <text
          x="0"
          y="0"
          fill={color}
          fontSize="22"
          fontFamily="Arial, sans-serif"
          fontWeight="600"
          stroke="none"
        >
          {object.label || "New label"}
        </text>
      </g>
    );
  const isPlayer = object.kind === "t" || object.kind === "ct";
  const code =
    object.kind === "t"
      ? `T${object.number || 1}`
      : object.kind === "ct"
        ? `C${object.number || 1}`
        : (
            { smoke: "S", flash: "F", molotov: "M", he: "H" } as Record<
              string,
              string
            >
          )[object.kind];
  return (
    <g
      data-object-id={object.id}
      transform={`translate(${object.x} ${object.y})`}
    >
      <circle r="28" fill="transparent" />
      {object.kind === "ct" ? (
        <rect
          x="-19"
          y="-19"
          width="38"
          height="38"
          rx="8"
          fill={color}
          stroke="#101615"
          strokeWidth="3"
        />
      ) : object.kind === "flash" ? (
        <path
          d="M0 -25 L25 0 L0 25 L-25 0 Z"
          fill="#28281c"
          stroke={color}
          strokeWidth="3"
        />
      ) : object.kind === "molotov" ? (
        <path
          d="M0 -26 L25 19 L-25 19 Z"
          fill="#32241f"
          stroke={color}
          strokeWidth="3"
        />
      ) : object.kind === "he" ? (
        <path
          d="M-11 -21 L11 -21 L24 0 L11 21 L-11 21 L-24 0 Z"
          fill="#2c2435"
          stroke={color}
          strokeWidth="3"
        />
      ) : (
        <circle
          r={isPlayer ? 21 : 24}
          fill={isPlayer ? color : "#283322"}
          stroke={isPlayer ? "#101615" : color}
          strokeWidth="3"
          strokeDasharray={object.kind === "smoke" ? "6 3" : undefined}
        />
      )}
      <text
        y={object.kind === "molotov" ? 7 : 6}
        textAnchor="middle"
        fill={isPlayer ? "#111815" : color}
        fontFamily="Arial, sans-serif"
        fontSize={isPlayer ? 17 : 18}
        fontWeight="700"
        pointerEvents="none"
      >
        {code}
      </text>
      {object.label && (
        <g pointerEvents="none">
          <rect
            x={-(object.label.length * 5.3 + 7)}
            y="30"
            width={object.label.length * 10.6 + 14}
            height="25"
            rx="4"
            fill="#101615"
            fillOpacity=".94"
          />
          <text
            y="48"
            textAnchor="middle"
            fill="#edf0e9"
            fontSize="18"
            fontFamily="Arial, sans-serif"
          >
            {object.label}
          </text>
        </g>
      )}
    </g>
  );
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
        stroke="#edf0e9"
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
          fill="#edf0e9"
        />
      ))}
    </g>
  );
}

export default function TacticBoard({ map, onNotify }: Props) {
  const [levelId, setLevelId] = useState(map.levels[0]?.id || "main");
  const level = map.levels.find((item) => item.id === levelId) || map.levels[0];
  const [history, setHistory] = useState(() =>
    historyFor(initialPlan(map.id, levelId, map.id === "mirage")),
  );
  const plan = history.present;
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = plan.objects.find((object) => object.id === selectedId);
  const [saved, setSaved] = useState<SavedTactic[]>(() =>
    validateSavedTactics(storedJson(SAVED_KEY)),
  );
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState("");
  const [draftStatus, setDraftStatus] = useState<"saving" | "saved" | "error">(
    "saved",
  );
  const [customImage, setCustomImage] = useState(() =>
    storedImage(imageKey(map.id, levelId)),
  );
  const [mapFailed, setMapFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const notify = useRef(onNotify);
  notify.current = onNotify;
  const svgRef = useRef<SVGSVGElement>(null),
    importRef = useRef<HTMLInputElement>(null),
    imageRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef(history);
  historyRef.current = history;
  const gesture = useRef<Gesture | null>(null);
  const latest = useRef({ key: draftKey(map.id, levelId), plan });
  latest.current = { key: draftKey(map.id, levelId), plan };
  const storageWarningShown = useRef(false);
  sessionDrafts.set(latest.current.key, plan);
  const uniqueId = useId().replace(/:/g, ""),
    arrowId = `route-arrow-${uniqueId}`;
  const image = customImage || level?.image || "";
  const visibleSaved = saved.filter(
    (item) => item.plan.mapId === map.id && item.plan.levelId === levelId,
  );

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
    setTool(next);
    if (next !== "select") setSelectedId(null);
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
    setZoom(1);
  }
  function addObject(kind: ObjectKind, point = { x: 500, y: 500 }) {
    if (plan.objects.length >= MAX_OBJECTS) {
      notify.current(
        `This board is full (${MAX_OBJECTS} objects). Remove an object first.`,
      );
      return;
    }
    const object = createObject(kind, point, plan.objects);
    changePlan((current) => ({
      ...current,
      objects: [...current.objects, object],
    }));
    setSelectedId(object.id);
    if (kind === "text") setInspectorOpen(true);
  }
  function canvasPoint(event: ReactPointerEvent<SVGSVGElement>): XY {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return { x: 500, y: 500 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return { x: clamp(point.x), y: clamp(point.y) };
  }
  function pointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || gesture.current) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    const point = canvasPoint(event),
      objectId = (event.target as Element)
        .closest("[data-object-id]")
        ?.getAttribute("data-object-id");
    if (tool === "select") {
      setSelectedId(objectId || null);
      if (objectId) {
        gesture.current = {
          pointerId: event.pointerId,
          mode: "move",
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
      setSelectedId(object.id);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    addObject(tool, point);
  }
  function pointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const point = canvasPoint(event);
    if (active.mode === "move") {
      const source = active.original.present.objects.find(
        (object) => object.id === active.objectId,
      );
      if (!source) return;
      const moved = translated(
        source,
        point.x - active.start.x,
        point.y - active.start.y,
      );
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
      setHistory((current) => ({
        ...current,
        present: {
          ...current.present,
          objects: current.present.objects.map((object) => {
            if (object.id !== active.objectId) return object;
            if (object.kind === "route")
              return { ...object, points: [active.start, point] };
            const previous = object.points || [active.start],
              last = previous[previous.length - 1];
            return previous.length < 800 &&
              Math.hypot(last.x - point.x, last.y - point.y) > 2
              ? { ...object, points: [...previous, point] }
              : object;
          }),
        },
      }));
    }
  }
  function pointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
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
    const active = gesture.current;
    if (active) {
      gesture.current = null;
      setHistory(active.original);
    }
  }
  function keyboard(event: ReactKeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.matches("input,textarea,select") || target.isContentEditable)
      return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      setHistory((current) => (event.shiftKey ? redo(current) : undo(current)));
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      setHistory(redo);
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Escape") {
      cancelGesture();
      setSelectedId(null);
      chooseTool("select");
      return;
    }
    if (selected && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault();
      removeSelected();
      return;
    }
    if (
      selected &&
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      event.preventDefault();
      const amount = event.shiftKey ? 20 : 5;
      changeObject(selected.id, (object) =>
        translated(
          object,
          event.key === "ArrowLeft"
            ? -amount
            : event.key === "ArrowRight"
              ? amount
              : 0,
          event.key === "ArrowUp"
            ? -amount
            : event.key === "ArrowDown"
              ? amount
              : 0,
        ),
      );
      return;
    }
    if (
      event.key === "Enter" &&
      event.target === svgRef.current &&
      tool !== "select" &&
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
    if (
      existing.some(
        (item) =>
          item.id !== loadedId &&
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
    if (!loadedId && existing.length >= 100) {
      notify.current(
        "You have 100 saved tactics. Export and remove one before saving another.",
      );
      return;
    }
    const id = loadedId || uid(),
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
      setSelectedSavedId(id);
      notify.current(
        loadedId
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
  function exportJson() {
    download(
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
    notify.current("Tactic exported as JSON.");
  }
  async function importJson(file?: File) {
    if (!file) return;
    const expectedKey = latest.current.key;
    try {
      if (file.size > 3_000_000)
        throw new Error(
          "This file is too large. Choose a tactic JSON smaller than 3 MB.",
        );
      const imported = validateTacticFile(JSON.parse(await file.text()));
      if (latest.current.key !== expectedKey)
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
        if (latest.current.key !== expectedKey)
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
      context.fillStyle = "#101615";
      context.fillRect(0, 1544, 1600, 56);
      context.fillStyle = "#edf0e9";
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
      download(output, `${filename(plan.name)}.png`);
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
  return (
    <section
      className="tactic-board"
      aria-label="Tactic editor"
      onKeyDown={keyboard}
    >
      <header className="tb-titlebar">
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
            className={`tb-draft-status ${draftStatus === "error" ? "is-error" : ""}`}
            aria-live="polite"
          >
            {draftStatus === "saved" ? (
              <Check size={12} />
            ) : draftStatus === "saving" ? (
              <span className="tb-status-dot" />
            ) : (
              <CircleDot size={12} />
            )}
            {draftStatus === "saved"
              ? "Saved on this device"
              : draftStatus === "saving"
                ? "Saving draft…"
                : "Storage unavailable · export to keep"}
          </span>
        </div>
        <div className="tb-title-actions">
          <button
            className="tb-icon-button tb-mobile-inspector"
            aria-label={inspectorOpen ? "Close round plan" : "Open round plan"}
            aria-expanded={inspectorOpen}
            onClick={() => setInspectorOpen(!inspectorOpen)}
          >
            <FolderOpen size={18} />
          </button>
          <button className="tb-button tb-new-button" onClick={newTactic}>
            <FilePlus2 size={16} />
            <span>New</span>
          </button>
          <details className="tb-export">
            <summary className="tb-button">
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={13} />
            </summary>
            <div className="tb-export-menu">
              <button
                onClick={(event) => {
                  exportJson();
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open");
                }}
              >
                <ArrowDownToLine size={16} />
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
                  <LoaderCircle size={16} />
                ) : (
                  <Download size={16} />
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
                <ArrowUpFromLine size={16} />
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
                <Copy size={16} />
                Make a copy
              </button>
            </div>
          </details>
          <button className="tb-button tb-primary" onClick={saveTactic}>
            <Save size={16} />
            <span>{loadedId ? "Update tactic" : "Save tactic"}</span>
          </button>
        </div>
      </header>
      <div className="tb-workspace">
        <div className="tb-canvas-area">
          <div className="tb-canvas-top">
            <div className="tb-levels" role="group" aria-label="Map level">
              {map.levels.length > 1 ? (
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
                <span>{level?.name || "Main level"}</span>
              )}
            </div>
            <div className="tb-history">
              <button
                className="tb-icon-button"
                disabled={!history.past.length}
                onClick={() => setHistory(undo)}
                title="Undo (Ctrl / ⌘ Z)"
                aria-label="Undo"
              >
                <Undo2 size={17} />
              </button>
              <button
                className="tb-icon-button"
                disabled={!history.future.length}
                onClick={() => setHistory(redo)}
                title="Redo (Ctrl / ⌘ Shift Z)"
                aria-label="Redo"
              >
                <Redo2 size={17} />
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
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="tb-toolbox" role="group" aria-label="Drawing tools">
            {toolItems.map(({ id, label, key, icon: Icon }, index) => (
              <button
                key={id}
                className={`tb-tool ${tool === id ? "is-active" : ""} ${[1, 5, 10].includes(index) ? "tb-tool-section" : ""}`}
                aria-label={`${label} (${key})`}
                aria-pressed={tool === id}
                title={`${label} (${key})`}
                data-tooltip={`${label} (${key})`}
                onClick={() => chooseTool(id)}
              >
                <Icon size={19} strokeWidth={1.7} />
                {id === "t" || id === "ct" ? (
                  <span className={`tb-team-dot ${id}`} />
                ) : null}
              </button>
            ))}
          </div>
          <div className="tb-map-stage">
            <svg
              ref={svgRef}
              className={`tb-map tb-cursor-${tool}`}
              viewBox={`${500 - 500 / zoom} ${500 - 500 / zoom} ${1000 / zoom} ${1000 / zoom}`}
              role="img"
              aria-label={`${map.name} ${level?.name || ""} tactic canvas. ${plan.objects.length} objects. Select a tool and click to place, or press Enter to place at center. Arrow keys move the selected object.`}
              tabIndex={0}
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={cancelGesture}
              onLostPointerCapture={cancelGesture}
            >
              <defs>
                <marker
                  id={arrowId}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0 L10 5 L0 10 Z" fill="#d1ef83" />
                </marker>
              </defs>
              <rect width="1000" height="1000" fill="#141a19" />
              {image && !mapFailed && (
                <image
                  href={image}
                  x="0"
                  y="0"
                  width="1000"
                  height="1000"
                  preserveAspectRatio="xMidYMid meet"
                  pointerEvents="none"
                  onError={() => setMapFailed(true)}
                />
              )}
              {plan.objects.map((object) => (
                <ObjectDrawing
                  key={object.id}
                  object={object}
                  arrowId={arrowId}
                />
              ))}
              {selected && <Selection object={selected} />}
            </svg>
            {(!image || mapFailed) && (
              <div className="tb-missing-map">
                <ImagePlus size={27} />
                <h3>
                  {mapFailed
                    ? "Map image could not load"
                    : "Add this map’s radar"}
                </h3>
                <p>
                  Upload your own PNG, JPEG, or WebP to plan on the real layout.
                </p>
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
          <div className="tb-canvas-bottom">
            <div className="tb-canvas-hint">
              <span className="tb-hint-dot" />
              {tool === "select"
                ? "Select and drag to move"
                : tool === "erase"
                  ? "Click an object to erase it"
                  : tool === "route" || tool === "pen"
                    ? "Click and drag to draw"
                    : `Click to place ${activeTool.label.toLowerCase()}`}
              <span className="tb-keyboard-hint"> · Arrow keys to nudge</span>
            </div>
            <div className="tb-zoom">
              <button
                className="tb-icon-button"
                aria-label="Zoom out"
                disabled={zoom <= 0.75}
                onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))}
              >
                <ZoomOut size={16} />
              </button>
              <button
                className="tb-zoom-value"
                onClick={() => setZoom(1)}
                title="Reset zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                className="tb-icon-button"
                aria-label="Zoom in"
                disabled={zoom >= 2}
                onClick={() => setZoom((value) => Math.min(2, value + 0.25))}
              >
                <ZoomIn size={16} />
              </button>
              <button
                className="tb-icon-button tb-reset-zoom"
                aria-label="Fit map"
                onClick={() => setZoom(1)}
              >
                <Maximize size={15} />
              </button>
            </div>
          </div>
          {map.credit && (
            <span className="tb-map-credit">
              {map.credit.includes("setpos.gg") ? (
                <a href="https://setpos.gg" target="_blank" rel="noreferrer">
                  Minimaps by setpos.gg
                </a>
              ) : (
                map.credit
              )}
            </span>
          )}
        </div>
        <aside
          className={`tb-inspector ${inspectorOpen ? "is-open" : ""}`}
          aria-label="Round plan"
        >
          <div className="tb-inspector-heading">
            <h2>Round plan</h2>
            <button
              className="tb-icon-button tb-mobile-inspector"
              aria-label="Close round plan"
              onClick={() => setInspectorOpen(false)}
            >
              <X size={17} />
            </button>
            <span className="tb-round-count">
              {plan.objects.length} objects
            </span>
          </div>
          {plan.illustrative && (
            <div className="tb-example-note">
              <span>Editable example</span>
              <p>
                Illustrative positions and timings. Validate this execute in a
                practice server.
              </p>
            </div>
          )}
          <div className="tb-inspector-section">
            <label className="tb-field-label">Playing side</label>
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
                <UserRound size={14} />
                Terrorist <span>T</span>
              </button>
              <button
                className={plan.side === "CT" ? "is-active is-ct" : ""}
                aria-pressed={plan.side === "CT"}
                onClick={() =>
                  changePlan((current) => ({ ...current, side: "CT" }))
                }
              >
                <Shield size={14} />
                Counter <span>CT</span>
              </button>
            </div>
          </div>
          <div className="tb-inspector-section">
            <label className="tb-field-label" htmlFor={`${uniqueId}-notes`}>
              Tactic notes <Pencil size={12} />
            </label>
            <textarea
              id={`${uniqueId}-notes`}
              className="tb-notes"
              value={plan.notes}
              maxLength={8000}
              placeholder="Call the play. Who takes first contact? When does the utility land?"
              onChange={(event) =>
                changePlan((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              rows={4}
            />
          </div>
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
                      if (Number.isInteger(value) && value >= 1 && value <= 99)
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
                      <span>{endpoint === "start" ? "Start" : "End"}</span>
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
          <div className="tb-inspector-section tb-objects-section">
            <div className="tb-field-label">
              On the board <span>{plan.objects.length}</span>
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
                      className={`tb-object-row ${selectedId === object.id ? "is-selected" : ""}`}
                      onClick={() => {
                        setSelectedId(object.id);
                        setTool("select");
                      }}
                      aria-pressed={selectedId === object.id}
                    >
                      <span
                        className={`tb-object-mark tb-mark-${object.kind}`}
                        style={{ color: colors[object.kind] }}
                      >
                        {object.kind === "t" || object.kind === "ct" ? (
                          `${object.kind === "t" ? "T" : "C"}${object.number || 1}`
                        ) : object.kind === "route" ? (
                          <MoveUpRight size={13} />
                        ) : object.kind === "pen" ? (
                          <Pencil size={12} />
                        ) : object.kind === "text" ? (
                          <Type size={12} />
                        ) : (
                          object.kind[0].toUpperCase()
                        )}
                      </span>
                      <span>{objectLabel(object)}</span>
                      <span className="tb-object-select-dot" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tb-empty-objects">
                <p>Your next round starts here.</p>
                <span>
                  Choose a player or utility from the toolbar, then click the
                  map to place it.
                </span>
              </div>
            )}
            {tool !== "select" && tool !== "erase" && (
              <button
                className="tb-button tb-place-center"
                onClick={() => addObject(tool)}
              >
                Place {activeTool.label.toLowerCase()} at center
              </button>
            )}
          </div>
          <div className="tb-inspector-section tb-saved-section">
            <label className="tb-field-label" htmlFor={`${uniqueId}-saved`}>
              Saved tactics <span>{visibleSaved.length}</span>
            </label>
            <div className="tb-load-row">
              <select
                id={`${uniqueId}-saved`}
                className="tb-input"
                value={selectedSavedId}
                onChange={(event) => setSelectedSavedId(event.target.value)}
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
                <FolderOpen size={16} />
              </button>
              <button
                className="tb-icon-button"
                disabled={!selectedSavedId}
                aria-label="Delete selected saved tactic"
                onClick={deleteTactic}
              >
                <Trash2 size={15} />
              </button>
            </div>
            <span className="tb-local-note">
              Stored in this browser. Export a copy to move devices.
            </span>
          </div>
          <div className="tb-inspector-footer">
            <button
              onClick={() => imageRef.current?.click()}
              disabled={uploading}
            >
              <ImagePlus size={14} />
              {uploading
                ? "Loading radar…"
                : customImage
                  ? "Replace custom radar"
                  : "Upload custom radar"}
            </button>
            {customImage && (
              <button
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
                    notify.current("Could not remove the saved custom radar.");
                  }
                }}
              >
                Restore original radar
              </button>
            )}
            <span>No account needed. Your board stays local.</span>
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
    </section>
  );
}
