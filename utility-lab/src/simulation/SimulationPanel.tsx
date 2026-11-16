import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  Bomb,
  Check,
  ChevronDown,
  CloudFog,
  Crosshair,
  Flame,
  Footprints,
  Maximize,
  Minus,
  MousePointer2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Shield,
  Trash2,
  Undo2,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  compileScenario,
  DEFAULTS,
  type Actor,
  type Grenade,
  type GrenadeKind,
  type Point,
  type Scenario,
} from "./engine";
import "./simulation.css";
import { LIMITS, type BoardInput } from "./scenario-io";

export interface SimulationPanelProps {
  plan: BoardInput;
  mapName: string;
  levelName: string;
  image: string;
  initialScenario: Scenario;
  onChange: (next: Scenario) => void;
  onClose: () => void;
  fileControls?: ReactNode;
  saveStatus?: string;
}
type Tool =
  | "select"
  | "waypoint"
  | "movePlayer"
  | "addT"
  | "addCT"
  | "addGrenade"
  | "moveGrenade"
  | "wall";
type Inspector = "players" | "utility" | "setup";
type Frame = ReturnType<ReturnType<typeof compileScenario>["frameAt"]>;
const utilityNames: Record<GrenadeKind, string> = {
  smoke: "Smoke",
  flash: "Flash",
  he: "HE",
  molotov: "Molotov",
  incendiary: "Incendiary",
};
const utilityIcons = {
  smoke: CloudFog,
  flash: Zap,
  he: Bomb,
  molotov: Flame,
  incendiary: Flame,
};
const round = (number: number) => Math.round(number * 10) / 10;
const bounded = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const shortTime = (value: number) => {
  const ticks = Math.round(Math.max(0, value) * 10);
  return `${Math.floor(ticks / 600)}:${String(Math.floor(ticks / 10) % 60).padStart(2, "0")}.${ticks % 10}`;
};
const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `sim-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const isFire = (kind: GrenadeKind) =>
  kind === "molotov" || kind === "incendiary";
const fullRadar = { x: 0, y: 0, width: 1000, height: 1000 };
function frameAction(scenario: Scenario) {
  const points = [
    ...scenario.actors.flatMap((actor) => [actor.start, ...actor.waypoints]),
    ...scenario.grenades.map((item) => item.at),
    ...(scenario.walls ?? []).flatMap((wall) => [wall.a, wall.b]),
  ];
  if (!points.length) return fullRadar;
  const xs = points.map((p) => p.x),
    ys = points.map((p) => p.y);
  const left = Math.min(...xs),
    right = Math.max(...xs),
    top = Math.min(...ys),
    bottom = Math.max(...ys);
  const width = Math.min(1000, Math.max(240, (right - left) * 1.24 + 50));
  const height = Math.min(1000, Math.max(200, (bottom - top) * 1.24 + 50));
  return {
    x: bounded((left + right - width) / 2, 0, 1000 - width),
    y: bounded((top + bottom - height) / 2, 0, 1000 - height),
    width,
    height,
  };
}
function actorStatus(actor: Frame["actors"][number]) {
  if (!actor.hp) return "Down";
  const states: string[] = [];
  if (actor.blind > 0) states.push(`Blind ${actor.blindRemaining.toFixed(1)}s`);
  if (actor.burning) states.push("In fire");
  if (actor.inSmoke) states.push("In smoke");
  if (actor.blockedByWall) states.push("Blocked");
  return states.join(" · ");
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onCommit: (value: number) => void;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText(String(value));
  }, [value]);
  function commit() {
    const next = Number(text);
    if (text.trim() && Number.isFinite(next)) {
      const safe = bounded(next, min, max);
      if (safe !== value) onCommit(safe);
      setText(String(safe));
    } else setText(String(value));
  }
  return (
    <label className="sim-field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
    </label>
  );
}

export default function SimulationPanel({
  plan,
  mapName,
  levelName,
  image,
  initialScenario: scenario,
  onChange,
  onClose,
  fileControls,
  saveStatus,
}: SimulationPanelProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const radar = useRef<SVGSVGElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [inspector, setInspector] = useState<Inspector>("players");
  const [tool, setTool] = useState<Tool>("select");
  const [playerId, setPlayerId] = useState<string | undefined>(
    scenario.actors[0]?.id,
  );
  const [grenadeId, setGrenadeId] = useState<string | undefined>(
    scenario.grenades[0]?.id,
  );
  const [newKind, setNewKind] = useState<GrenadeKind>("smoke");
  const [waypointIndex, setWaypointIndex] = useState(0);
  const [wallStart, setWallStart] = useState<Point | null>(null);
  const [cursor, setCursor] = useState<Point>({ x: 500, y: 500 });
  const [keyboardCursor, setKeyboardCursor] = useState(false);
  const [notice, setNotice] = useState("");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [iconScale, setIconScale] = useState(1);
  const [view, setView] = useState(() => frameAction(scenario));
  const [pixelsPerUnit, setPixelsPerUnit] = useState(0.5);
  const playhead = useRef(0);
  const compiled = useMemo(() => compileScenario(scenario), [scenario]);
  const time = Math.min(compiled.duration, seconds);
  const frame = useMemo(() => compiled.frameAt(time), [compiled, time]);
  const selected =
    scenario.actors.find((actor) => actor.id === playerId) ??
    scenario.actors[0];
  const grenade =
    scenario.grenades.find((item) => item.id === grenadeId) ??
    scenario.grenades[0];
  const rosterNames = useMemo(() => {
    const names = new Map<string, string>();
    const used = { T: new Set<number>(), CT: new Set<number>() };
    for (const actor of scenario.actors) {
      const number = plan.objects.find(
        (object) => object.id === actor.id,
      )?.number;
      if (number && !used[actor.team].has(number)) {
        names.set(actor.id, actor.team + number);
        used[actor.team].add(number);
      }
    }
    for (const actor of scenario.actors) {
      if (names.has(actor.id)) continue;
      let number = 1;
      while (used[actor.team].has(number)) number++;
      names.set(actor.id, actor.team + number);
      used[actor.team].add(number);
    }
    return names;
  }, [plan.objects, scenario.actors]);
  const radius = (10.5 * iconScale) / pixelsPerUnit;

  useEffect(() => {
    const modal = dialog.current;
    returnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    modal?.showModal();
    return () => {
      modal?.close();
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    const svg = radar.current;
    if (!svg) return;
    const measure = () => {
      const rect = svg.getBoundingClientRect();
      const scale = Math.min(
        rect.width / view.width,
        rect.height / view.height,
      );
      if (scale > 0) setPixelsPerUnit(scale);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, [view]);
  useEffect(() => {
    if (!playing) return;
    const origin = performance.now();
    const start = playhead.current;
    let request = 0;
    let lastPaint = 0;
    function draw(now: number) {
      const next = Math.min(
        compiled.duration,
        start + ((now - origin) * speed) / 1000,
      );
      if (now - lastPaint >= 30 || next >= compiled.duration) {
        lastPaint = now;
        playhead.current = next;
        setSeconds(next);
      }
      if (next >= compiled.duration) setPlaying(false);
      else request = requestAnimationFrame(draw);
    }
    request = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(request);
  }, [playing, speed, compiled]);
  useEffect(() => {
    const pauseHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseHidden);
    return () => document.removeEventListener("visibilitychange", pauseHidden);
  }, []);
  function seek(next: number) {
    setPlaying(false);
    playhead.current = bounded(next, 0, compiled.duration);
    setSeconds(playhead.current);
  }
  function edit(next: Scenario) {
    seek(0);
    setNotice("");
    onChange(next);
  }
  function playerEdit(patch: Partial<Actor>) {
    if (selected)
      edit({
        ...scenario,
        actors: scenario.actors.map((actor) =>
          actor.id === selected.id ? { ...actor, ...patch } : actor,
        ),
      });
  }
  function grenadeEdit(patch: Partial<Grenade>) {
    if (grenade)
      edit({
        ...scenario,
        grenades: scenario.grenades.map((item) =>
          item.id === grenade.id ? { ...item, ...patch } : item,
        ),
      });
  }
  function removePlayer(actorId: string) {
    const grenades = scenario.grenades.map((item) => {
      if (item.throwerId !== actorId) return item;
      const {
        throwerId: _throwerId,
        flightSeconds: _flightSeconds,
        ...unassigned
      } = item;
      return unassigned;
    });
    edit({
      ...scenario,
      actors: scenario.actors.filter((actor) => actor.id !== actorId),
      grenades,
    });
    resetTool();
  }
  function resetTool() {
    setTool("select");
    setWallStart(null);
  }
  function chooseInspector(next: Inspector) {
    setInspector(next);
    resetTool();
    setNotice("");
  }
  function arm(next: Tool) {
    seek(0);
    setWallStart(null);
    setNotice("");
    if (tool === next) {
      resetTool();
      return;
    }
    setTool(next);
    const origin =
      next === "waypoint"
        ? (selected?.waypoints.at(-1) ?? selected?.start)
        : next === "movePlayer"
          ? selected?.start
          : next === "moveGrenade"
            ? grenade?.at
            : undefined;
    setCursor(
      origin ?? { x: view.x + view.width / 2, y: view.y + view.height / 2 },
    );
    setKeyboardCursor(false);
    radar.current?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 720px)").matches)
      radar.current?.scrollIntoView({ block: "center" });
  }
  function togglePlay() {
    resetTool();
    if (!playing && time >= compiled.duration) seek(0);
    setPlaying(!playing);
  }
  function place(point: Point) {
    const at = {
      x: round(bounded(point.x, 0, 1000)),
      y: round(bounded(point.y, 0, 1000)),
    };
    setCursor(at);
    if (tool === "addT" || tool === "addCT") {
      if (scenario.actors.length >= LIMITS.actors) return;
      const team = tool === "addT" ? "T" : "CT";
      const actor: Actor = {
        id: newId(),
        team,
        start: at,
        waypoints: [],
        delay: 0,
        speed: DEFAULTS.speed,
        facing: team === "T" ? 270 : 90,
        faceRoute: true,
      };
      edit({ ...scenario, actors: [...scenario.actors, actor] });
      setPlayerId(actor.id);
      resetTool();
    } else if (tool === "waypoint" && selected) {
      if (selected.waypoints.length >= LIMITS.waypoints) {
        setNotice(`Route limit reached (${LIMITS.waypoints} waypoints).`);
        return;
      }
      playerEdit({ waypoints: [...selected.waypoints, at] });
      setWaypointIndex(selected.waypoints.length);
    } else if (tool === "movePlayer") {
      playerEdit({ start: at });
      resetTool();
    } else if (tool === "addGrenade") {
      if (scenario.grenades.length >= LIMITS.grenades) return;
      const item: Grenade = { id: newId(), kind: newKind, at, time: 2 };
      edit({ ...scenario, grenades: [...scenario.grenades, item] });
      setGrenadeId(item.id);
      resetTool();
    } else if (tool === "moveGrenade") {
      grenadeEdit({ at });
      resetTool();
    } else if (tool === "wall") {
      if (!wallStart) {
        setWallStart(at);
        return;
      }
      if (Math.hypot(at.x - wallStart.x, at.y - wallStart.y) < 2) {
        setNotice("Choose a different endpoint.");
        return;
      }
      edit({
        ...scenario,
        walls: [...(scenario.walls ?? []), { a: wallStart, b: at }],
      });
      resetTool();
    }
  }
  function keyOnRadar(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "Enter" && tool !== "select") {
      event.preventDefault();
      setKeyboardCursor(true);
      place(cursor);
      return;
    }
    const offsets: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const delta = offsets[event.key];
    if (delta && tool !== "select") {
      event.preventDefault();
      setKeyboardCursor(true);
      const step = event.shiftKey ? 1 : 10;
      setCursor((p) => ({
        x: bounded(p.x + delta.x * step, 0, 1000),
        y: bounded(p.y + delta.y * step, 0, 1000),
      }));
    }
  }
  const playerName = selected ? rosterNames.get(selected.id) : "";
  const hints: Record<Tool, string> = {
    select:
      inspector === "players"
        ? "Select a player to edit their route."
        : inspector === "utility"
          ? "Select utility to edit its detonation."
          : "Cover lines block movement and grenade exposure.",
    waypoint: `Click the radar to add waypoints for ${playerName}.`,
    movePlayer: `Click the new start for ${playerName}.`,
    addT: "Click the radar to place a T player.",
    addCT: "Click the radar to place a CT player.",
    addGrenade: `Click where the ${utilityNames[newKind].toLowerCase()} detonates.`,
    moveGrenade: "Click the new detonation point.",
    wall: wallStart
      ? "Click the end of the cover line."
      : "Click the start of the cover line.",
  };
  const selectedFrame = frame.actors.find((actor) => actor.id === selected?.id);
  const activeWaypoint = Math.min(
    waypointIndex,
    Math.max(0, (selected?.waypoints.length ?? 1) - 1),
  );
  const closeOnEscape = (event: KeyboardEvent<HTMLDialogElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      if (tool !== "select") resetTool();
      else onClose();
    }
  };
  const canPlay = Boolean(scenario.actors.length || scenario.grenades.length);

  return createPortal(
    <dialog
      ref={dialog}
      className="sim-dialog"
      aria-labelledby="sim-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={closeOnEscape}
      onKeyUp={(event) => event.stopPropagation()}
    >
      <div className="sim-shell">
        <header className="sim-header">
          <div className="sim-title-icon">
            <Footprints size={23} />
          </div>
          <div className="sim-header-copy">
            <div className="sim-context">
              {mapName} <span>/</span> {levelName}
            </div>
            <h2 id="sim-title">Round simulation</h2>
          </div>
          <div className="sim-header-end">
            {saveStatus && <small role="status">{saveStatus}</small>}
            <button
              type="button"
              className="sim-icon"
              aria-label="Close simulation"
              onClick={onClose}
            >
              <X size={19} />
            </button>
          </div>
        </header>
        <div className="sim-body">
          <section className="sim-map-panel" aria-label="Simulation radar">
            <div className="sim-map-strip">
              <span className="sim-tactic-name">
                {plan.name || "Untitled tactic"}
              </span>
              <div className="sim-map-tools">
                <button
                  className="sim-camera"
                  disabled={!canPlay}
                  onClick={() => {
                    const next =
                      view.width === 1000 && view.height === 1000
                        ? frameAction(scenario)
                        : fullRadar;
                    setView(next);
                    setCursor({
                      x: next.x + next.width / 2,
                      y: next.y + next.height / 2,
                    });
                  }}
                >
                  <Maximize size={13} />
                  {view.width === 1000 && view.height === 1000
                    ? "Focus action"
                    : "Full map"}
                </button>
                <div className="sim-marker-size">
                  <span>Icons</span>
                  <button
                    aria-label="Smaller player icons"
                    disabled={iconScale <= 0.7}
                    onClick={() =>
                      setIconScale((value) => Math.max(0.7, round(value - 0.1)))
                    }
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    aria-label="Larger player icons"
                    disabled={iconScale >= 1.6}
                    onClick={() =>
                      setIconScale((value) => Math.min(1.6, round(value + 0.1)))
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div
              className={`sim-map-stage ${tool !== "select" ? "sim-placing" : ""}`}
            >
              <svg
                ref={radar}
                className="sim-radar"
                viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
                tabIndex={0}
                role="group"
                aria-label="Round simulation radar"
                aria-describedby="sim-map-hint"
                onKeyDown={keyOnRadar}
                onClick={(event) => {
                  const matrix = event.currentTarget.getScreenCTM();
                  if (!matrix || tool === "select") return;
                  const p = new DOMPoint(
                    event.clientX,
                    event.clientY,
                  ).matrixTransform(matrix.inverse());
                  if (p.x < 0 || p.x > 1000 || p.y < 0 || p.y > 1000) return;
                  setKeyboardCursor(false);
                  place(p);
                }}
              >
                {image && (
                  <image
                    href={image}
                    width={1000}
                    height={1000}
                    preserveAspectRatio="xMidYMid meet"
                    data-raster={image.endsWith(".png")}
                    pointerEvents="none"
                  />
                )}
                {scenario.actors.map((actor) => {
                  const active =
                    selected?.id === actor.id && inspector === "players";
                  const path = [actor.start, ...actor.waypoints];
                  if (path.length < 2) return null;
                  return (
                    <g
                      key={actor.id}
                      className={`sim-route sim-${actor.team.toLowerCase()}`}
                      opacity={active ? 0.95 : 0.5}
                    >
                      <polyline
                        points={path.map((p) => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={active ? 2.5 : 1.5}
                        strokeDasharray="5 4"
                        vectorEffect="non-scaling-stroke"
                      />
                      {active &&
                        actor.waypoints.map((p, i) => (
                          <g key={i}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={radius * 0.28}
                              fill="currentColor"
                              stroke="var(--surface-raised)"
                              strokeWidth={1}
                              vectorEffect="non-scaling-stroke"
                            />
                            {Boolean(actor.holds?.[i]) && (
                              <text
                                x={p.x + radius * 0.4}
                                y={p.y - radius * 0.3}
                                fill="var(--text)"
                                stroke="var(--surface-raised)"
                                strokeWidth={2 / pixelsPerUnit}
                                paintOrder="stroke"
                                fontWeight={750}
                                fontSize={radius * 0.9}
                              >
                                {actor.holds![i]}s
                              </text>
                            )}
                          </g>
                        ))}
                    </g>
                  );
                })}
                {(scenario.walls ?? []).map((wall, i) => (
                  <g key={i}>
                    <line
                      x1={wall.a.x}
                      y1={wall.a.y}
                      x2={wall.b.x}
                      y2={wall.b.y}
                      stroke="#152338"
                      strokeWidth={4}
                      vectorEffect="non-scaling-stroke"
                    />
                    <line
                      x1={wall.a.x}
                      y1={wall.a.y}
                      x2={wall.b.x}
                      y2={wall.b.y}
                      stroke="#fff"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
                {wallStart && (
                  <circle
                    cx={wallStart.x}
                    cy={wallStart.y}
                    r={radius * 0.5}
                    fill="var(--accent)"
                  />
                )}
                {frame.flights.map((flight) => (
                  <g
                    key={flight.id}
                    className={`sim-effect sim-${flight.kind}`}
                  >
                    <line
                      x1={flight.from.x}
                      y1={flight.from.y}
                      x2={flight.to.x}
                      y2={flight.to.y}
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={flight.x}
                      cy={flight.y}
                      r={radius * 0.53}
                      fill="currentColor"
                      stroke="var(--surface-raised)"
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
                {frame.effects.map((effect, index) => (
                  <g
                    key={effect.id}
                    className={`sim-effect sim-${effect.kind}`}
                  >
                    {effect.holes?.length > 0 && (
                      <defs>
                        <mask
                          id={`sim-gap-${index}`}
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="1000"
                          height="1000"
                        >
                          <rect width="1000" height="1000" fill="white" />
                          {effect.holes.map((hole, i) => (
                            <circle
                              key={i}
                              cx={hole.x}
                              cy={hole.y}
                              r={hole.radius}
                              fill="black"
                            />
                          ))}
                        </mask>
                      </defs>
                    )}
                    <circle
                      cx={effect.x}
                      cy={effect.y}
                      r={effect.radius}
                      opacity={effect.opacity}
                      fill="currentColor"
                      fillOpacity={effect.kind === "smoke" ? 0.58 : 0.26}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                      mask={
                        effect.holes?.length
                          ? `url(#sim-gap-${index})`
                          : undefined
                      }
                    />
                  </g>
                ))}
                {scenario.grenades.map((item) => {
                  const Glyph = utilityIcons[item.kind];
                  const size = radius * 1.35;
                  const active = frame.effects.find(
                    (effect) => effect.id === item.id,
                  );
                  return (
                    <g
                      key={item.id}
                      className={`sim-map-marker sim-${item.kind}`}
                      opacity={
                        compiled.canceledThrowIds.includes(item.id) &&
                        time >= item.time
                          ? 0.25
                          : active || time <= item.time
                            ? 1
                            : 0.45
                      }
                      onClick={(event) => {
                        if (tool !== "select") return;
                        event.stopPropagation();
                        chooseInspector("utility");
                        setGrenadeId(item.id);
                      }}
                      transform={`translate(${item.at.x} ${item.at.y})`}
                    >
                      <title>
                        {utilityNames[item.kind]} at {item.time.toFixed(1)}s
                      </title>
                      <rect
                        x={-radius * 0.86}
                        y={-radius * 0.86}
                        width={radius * 1.72}
                        height={radius * 1.72}
                        rx={radius * 0.38}
                        fill="var(--surface-raised)"
                        stroke="currentColor"
                        strokeWidth={
                          inspector === "utility" && grenade?.id === item.id
                            ? 2.6
                            : 1.2
                        }
                        vectorEffect="non-scaling-stroke"
                      />
                      <Glyph
                        x={-size / 2}
                        y={-size / 2}
                        width={size}
                        height={size}
                      />
                      {active &&
                        time > 0 &&
                        (active.kind === "smoke" || isFire(active.kind)) && (
                          <text
                            x={0}
                            y={radius * 1.95}
                            textAnchor="middle"
                            fontWeight={700}
                            fontSize={radius * 0.88}
                            fill="var(--text)"
                            stroke="var(--surface-raised)"
                            strokeWidth={2.5 / pixelsPerUnit}
                            paintOrder="stroke"
                          >
                            {active.remaining.toFixed(1)}s
                          </text>
                        )}
                    </g>
                  );
                })}
                {frame.actors.map((actor) => {
                  const active =
                    inspector === "players" && selected?.id === actor.id;
                  const state = actorStatus(actor);
                  return (
                    <g
                      key={actor.id}
                      className={`sim-map-marker sim-${actor.team.toLowerCase()}`}
                      transform={`translate(${actor.x} ${actor.y})`}
                      opacity={actor.hp <= 0 ? 0.58 : 1}
                      onClick={(event) => {
                        if (tool !== "select") return;
                        event.stopPropagation();
                        chooseInspector("players");
                        setPlayerId(actor.id);
                      }}
                    >
                      <title>
                        {rosterNames.get(actor.id)} · {Math.ceil(actor.hp)} HP{" "}
                        {state}
                      </title>
                      {active && (
                        <circle
                          r={radius * 1.35}
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth={1.8}
                          vectorEffect="non-scaling-stroke"
                        />
                      )}
                      {actor.hp > 0 && (
                        <path
                          d={`M ${radius * 0.64} ${-radius * 0.63} L ${radius * 1.65} 0 L ${radius * 0.64} ${radius * 0.63} Z`}
                          transform={`rotate(${actor.facing})`}
                          fill="currentColor"
                          stroke="#253344"
                          strokeWidth={0.8}
                          vectorEffect="non-scaling-stroke"
                        />
                      )}
                      <circle
                        r={radius}
                        fill="currentColor"
                        stroke={actor.burning ? "#e34218" : "#273241"}
                        strokeWidth={actor.burning ? 3 : 1.3}
                        vectorEffect="non-scaling-stroke"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={radius * 0.86}
                        fontWeight={800}
                        fill="#152338"
                      >
                        {actor.hp > 0 ? rosterNames.get(actor.id) : "×"}
                      </text>
                      {actor.blind > 0 && actor.hp > 0 && (
                        <g
                          transform={`translate(${radius * 0.88} ${-radius * 0.95})`}
                        >
                          <circle
                            r={radius * 0.54}
                            fill="#fff3a5"
                            stroke="#493e1c"
                            vectorEffect="non-scaling-stroke"
                          />
                          <Zap
                            x={-radius * 0.42}
                            y={-radius * 0.42}
                            width={radius * 0.84}
                            height={radius * 0.84}
                            color="#493e1c"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
                {keyboardCursor && tool !== "select" && (
                  <Crosshair
                    x={cursor.x - radius}
                    y={cursor.y - radius}
                    width={radius * 2}
                    height={radius * 2}
                    color="var(--accent)"
                  />
                )}
              </svg>
            </div>
            <div className="sim-hint" id="sim-map-hint">
              <MousePointer2 size={14} />
              <span>{playing ? "Playing rehearsal" : hints[tool]}</span>
              {tool !== "select" && (
                <button onClick={resetTool}>
                  <Check size={13} />
                  Done
                </button>
              )}
            </div>
          </section>
          <aside className="sim-inspector" aria-label="Simulation setup">
            <nav className="sim-tabs" aria-label="Inspector sections">
              {(["players", "utility", "setup"] as const).map((name) => {
                const Icon =
                  name === "players"
                    ? Users
                    : name === "utility"
                      ? Bomb
                      : Settings2;
                return (
                  <button
                    key={name}
                    aria-pressed={inspector === name}
                    onClick={() => chooseInspector(name)}
                  >
                    <Icon size={15} />
                    {name}
                  </button>
                );
              })}
            </nav>
            <div className="sim-scroll">
              {inspector === "players" && (
                <>
                  <div className="sim-section-title">
                    <h3>Players</h3>
                    <span>{scenario.actors.length}</span>
                  </div>
                  <div className="sim-inline">
                    <button
                      aria-pressed={tool === "addT"}
                      disabled={scenario.actors.length >= LIMITS.actors}
                      onClick={() => arm("addT")}
                    >
                      <Plus size={14} />T player
                    </button>
                    <button
                      aria-pressed={tool === "addCT"}
                      disabled={scenario.actors.length >= LIMITS.actors}
                      onClick={() => arm("addCT")}
                    >
                      <Plus size={14} />
                      CT player
                    </button>
                  </div>
                  {scenario.actors.length === 0 && (
                    <p className="sim-empty">
                      Choose a team, then click a starting position on the
                      radar.
                    </p>
                  )}
                  <div className="sim-roster">
                    {frame.actors.map((actor) => {
                      const status = actorStatus(actor);
                      return (
                        <button
                          key={actor.id}
                          className="sim-roster-row"
                          aria-pressed={selected?.id === actor.id}
                          onClick={() => {
                            resetTool();
                            setPlayerId(actor.id);
                          }}
                        >
                          <span
                            className={`sim-team-dot sim-${actor.team.toLowerCase()}`}
                          />
                          <strong>{rosterNames.get(actor.id)}</strong>
                          {status && (
                            <small className="sim-actor-state">{status}</small>
                          )}
                          <span className="sim-health">
                            {Math.ceil(actor.hp)} HP
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selected && (
                    <div className="sim-edit-group" key={selected.id}>
                      <div className="sim-section-title">
                        <h3>{playerName} route</h3>
                        <span>{selected.waypoints.length} points</span>
                      </div>
                      <div className="sim-inline">
                        <button
                          className="sim-accent"
                          aria-pressed={tool === "waypoint"}
                          onClick={() => arm("waypoint")}
                        >
                          <Footprints size={14} />
                          Draw route
                        </button>
                        <button
                          aria-pressed={tool === "movePlayer"}
                          onClick={() => arm("movePlayer")}
                        >
                          <Crosshair size={14} />
                          Move start
                        </button>
                      </div>
                      {selected.waypoints.length > 0 && (
                        <>
                          <details className="sim-details sim-hold">
                            <summary>Hold at waypoint</summary>
                            <div className="sim-fields">
                              <label className="sim-field">
                                Waypoint
                                <select
                                  value={activeWaypoint}
                                  onChange={(e) =>
                                    setWaypointIndex(Number(e.target.value))
                                  }
                                >
                                  {selected.waypoints.map((p, index) => (
                                    <option key={index} value={index}>
                                      #{index + 1} · {Math.round(p.x)},{" "}
                                      {Math.round(p.y)}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <NumberField
                                label="Wait (s)"
                                min={0}
                                max={LIMITS.time}
                                step={0.1}
                                value={selected.holds?.[activeWaypoint] ?? 0}
                                onCommit={(wait) =>
                                  playerEdit({
                                    holds: selected.waypoints.map((_, index) =>
                                      index === activeWaypoint
                                        ? wait
                                        : (selected.holds?.[index] ?? 0),
                                    ),
                                  })
                                }
                              />
                            </div>
                          </details>
                          <button
                            className="sim-text-btn"
                            onClick={() =>
                              playerEdit({
                                waypoints: selected.waypoints.slice(0, -1),
                                holds: selected.holds?.slice(
                                  0,
                                  selected.waypoints.length - 1,
                                ),
                              })
                            }
                          >
                            <Undo2 size={13} />
                            Undo last waypoint
                          </button>
                        </>
                      )}
                      <div className="sim-fields">
                        <NumberField
                          label="Start delay (s)"
                          value={selected.delay}
                          min={0}
                          max={LIMITS.time}
                          step={0.1}
                          onCommit={(delay) => playerEdit({ delay })}
                        />
                        <NumberField
                          label="Speed (units/s)"
                          value={selected.speed}
                          min={1}
                          max={LIMITS.speed}
                          onCommit={(speed) => playerEdit({ speed })}
                        />
                      </div>
                      <label className="sim-check">
                        <input
                          type="checkbox"
                          checked={selected.faceRoute !== false}
                          onChange={(e) =>
                            playerEdit({ faceRoute: e.target.checked })
                          }
                        />
                        Face direction of travel
                      </label>
                      <NumberField
                        label={
                          selected.faceRoute !== false
                            ? "Starting facing (°)"
                            : "Fixed facing (°)"
                        }
                        value={selected.facing}
                        min={-360}
                        max={360}
                        onCommit={(facing) => playerEdit({ facing })}
                      />
                      <small className="sim-note">
                        0° faces right. 90° faces down.
                      </small>
                      {selectedFrame && actorStatus(selectedFrame) && (
                        <div className="sim-feedback">
                          <Shield size={14} />
                          {actorStatus(selectedFrame)} ·{" "}
                          {Math.ceil(selectedFrame.hp)} HP
                        </div>
                      )}
                      <button
                        className="sim-text-btn"
                        onClick={() => removePlayer(selected.id)}
                      >
                        <Trash2 size={13} />
                        Remove player
                      </button>
                    </div>
                  )}
                </>
              )}
              {inspector === "utility" && (
                <>
                  <div className="sim-section-title">
                    <h3>Utility</h3>
                    <span>{scenario.grenades.length}</span>
                  </div>
                  <div className="sim-inline">
                    <label className="sim-select">
                      <select
                        aria-label="Utility to place"
                        value={newKind}
                        onChange={(e) =>
                          setNewKind(e.target.value as GrenadeKind)
                        }
                      >
                        {Object.entries(utilityNames).map(([key, name]) => (
                          <option key={key} value={key}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} />
                    </label>
                    <button
                      aria-pressed={tool === "addGrenade"}
                      disabled={scenario.grenades.length >= LIMITS.grenades}
                      onClick={() => arm("addGrenade")}
                    >
                      <Plus size={14} />
                      Place
                    </button>
                  </div>
                  {scenario.grenades.length === 0 && (
                    <p className="sim-empty">
                      Choose a grenade and place its detonation point on the
                      radar.
                    </p>
                  )}
                  <div className="sim-roster">
                    {scenario.grenades.map((item) => {
                      const Icon = utilityIcons[item.kind],
                        active = frame.effects.find(
                          (effect) => effect.id === item.id,
                        );
                      return (
                        <button
                          className="sim-roster-row"
                          key={item.id}
                          aria-pressed={grenade?.id === item.id}
                          onClick={() => {
                            setGrenadeId(item.id);
                            resetTool();
                          }}
                        >
                          <Icon size={15} className={`sim-${item.kind}`} />
                          <strong>{utilityNames[item.kind]}</strong>
                          <span className="sim-health">
                            {compiled.canceledThrowIds.includes(item.id) &&
                            time >= item.time
                              ? "Throw canceled"
                              : active
                                ? `${active.remaining.toFixed(1)}s left`
                                : shortTime(item.time)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {grenade && (
                    <div className="sim-edit-group" key={grenade.id}>
                      <div className="sim-section-title">
                        <h3>{utilityNames[grenade.kind]} timing</h3>
                      </div>
                      <NumberField
                        label="Detonate at (s)"
                        min={0}
                        max={LIMITS.time}
                        step={0.1}
                        value={grenade.time}
                        onCommit={(time) =>
                          grenadeEdit({
                            time,
                            flightSeconds:
                              grenade.flightSeconds === undefined
                                ? undefined
                                : Math.min(time, grenade.flightSeconds),
                          })
                        }
                      />
                      <label className="sim-field">
                        Thrower
                        <select
                          value={grenade.throwerId ?? ""}
                          onChange={(e) =>
                            grenadeEdit({
                              throwerId: e.target.value || undefined,
                              flightSeconds: e.target.value
                                ? Math.min(
                                    grenade.time,
                                    grenade.flightSeconds ?? 1,
                                  )
                                : undefined,
                            })
                          }
                        >
                          <option value="">Fixed detonation</option>
                          {scenario.actors.map((actor) => (
                            <option key={actor.id} value={actor.id}>
                              {rosterNames.get(actor.id)}
                            </option>
                          ))}
                        </select>
                      </label>
                      {grenade.throwerId && (
                        <>
                          <NumberField
                            label="Flight time (s)"
                            min={0}
                            max={Math.min(10, grenade.time)}
                            step={0.1}
                            value={grenade.flightSeconds ?? 0}
                            onCommit={(flightSeconds) =>
                              grenadeEdit({ flightSeconds })
                            }
                          />
                          <small className="sim-note">
                            Release at{" "}
                            {shortTime(
                              Math.max(
                                0,
                                grenade.time - (grenade.flightSeconds ?? 0),
                              ),
                            )}
                            . Flight follows a straight radar path.
                          </small>
                        </>
                      )}
                      {(grenade.kind === "smoke" || isFire(grenade.kind)) && (
                        <NumberField
                          label="Effect duration (s)"
                          min={0.1}
                          max={LIMITS.duration}
                          step={0.1}
                          value={
                            grenade.duration ?? DEFAULTS.duration[grenade.kind]
                          }
                          onCommit={(duration) => grenadeEdit({ duration })}
                        />
                      )}
                      <button
                        aria-pressed={tool === "moveGrenade"}
                        onClick={() => arm("moveGrenade")}
                      >
                        <Crosshair size={14} />
                        Move detonation
                      </button>
                      <button
                        className="sim-text-btn"
                        onClick={() => {
                          edit({
                            ...scenario,
                            grenades: scenario.grenades.filter(
                              (item) => item.id !== grenade.id,
                            ),
                          });
                          resetTool();
                        }}
                      >
                        <Trash2 size={13} />
                        Remove utility
                      </button>
                    </div>
                  )}
                </>
              )}
              {inspector === "setup" && (
                <>
                  <div className="sim-section-title">
                    <h3>Cover</h3>
                    <span>{scenario.walls?.length ?? 0} lines</span>
                  </div>
                  <p className="sim-note">
                    Draw walls that stop movement and shield players from
                    grenades. Route waypoints around their endpoints.
                  </p>
                  <div className="sim-inline">
                    <button
                      aria-pressed={tool === "wall"}
                      disabled={(scenario.walls?.length ?? 0) >= LIMITS.walls}
                      onClick={() => arm("wall")}
                    >
                      <Plus size={14} />
                      Draw cover
                    </button>
                    <button
                      disabled={!scenario.walls?.length}
                      onClick={() => {
                        edit({
                          ...scenario,
                          walls: scenario.walls?.slice(0, -1),
                        });
                        resetTool();
                      }}
                    >
                      <Undo2 size={14} />
                      Undo line
                    </button>
                  </div>
                  <div className="sim-edit-group">
                    <h3>Radar scale</h3>
                    <NumberField
                      label="World units per radar unit"
                      min={LIMITS.minScale}
                      max={LIMITS.maxScale}
                      step={0.01}
                      value={scenario.unitsPerBoardUnit}
                      onCommit={(unitsPerBoardUnit) =>
                        edit({ ...scenario, unitsPerBoardUnit })
                      }
                    />
                    <p className="sim-note">
                      Scale controls travel times and effect radii. Custom
                      radars may need calibration. Routes follow the waypoints
                      you draw.
                    </p>
                  </div>
                  <details className="sim-details">
                    <summary>Rehearsal assumptions</summary>
                    <p>
                      One radar floor, straight route segments and circular
                      effect areas. Flash exposure depends on facing, distance
                      and marked cover. Fire damage and smoke clearing are
                      estimates.
                    </p>
                    <p>
                      For keyboard placement, focus the radar, use arrow keys to
                      move the cursor and Enter to place. Hold Shift for fine
                      adjustment.
                    </p>
                  </details>
                  {fileControls && (
                    <div className="sim-file-controls">{fileControls}</div>
                  )}
                </>
              )}
              {notice && (
                <div className="sim-note" role="status">
                  {notice}
                </div>
              )}
            </div>
          </aside>
        </div>
        <footer className="sim-transport">
          <div className="sim-transport-main">
            <button
              className="sim-play"
              disabled={!canPlay}
              onClick={togglePlay}
              aria-label={playing ? "Pause simulation" : "Play simulation"}
            >
              {playing ? (
                <Pause size={15} fill="currentColor" />
              ) : (
                <Play size={15} fill="currentColor" />
              )}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              className="sim-icon"
              aria-label="Restart simulation"
              onClick={() => seek(0)}
            >
              <RotateCcw size={16} />
            </button>
            <output className="sim-clock" aria-label="Simulation time">
              {shortTime(time)}
            </output>
            <span className="sim-time-end">
              / {shortTime(compiled.duration)}
            </span>
          </div>
          <div className="sim-track">
            <input
              type="range"
              aria-label="Simulation timeline"
              min={0}
              max={compiled.duration || 1}
              step={0.05}
              value={time}
              onChange={(e) => {
                resetTool();
                seek(Number(e.target.value));
              }}
            />
            <div className="sim-track-events" aria-hidden="true">
              {scenario.grenades.map((item) => (
                <i
                  key={item.id}
                  className={`sim-${item.kind}`}
                  style={{
                    left: `${Math.min(100, (100 * item.time) / (compiled.duration || 1))}%`,
                  }}
                />
              ))}
            </div>
          </div>
          <label className="sim-select sim-speed">
            <select
              aria-label="Playback speed"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              {[0.25, 0.5, 1, 2, 4].map((value) => (
                <option key={value} value={value}>
                  {value}×
                </option>
              ))}
            </select>
            <ChevronDown size={13} />
          </label>
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}
