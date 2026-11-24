import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { layoutLandingSpots, nameLandingSpots, type LayoutObstacle } from "./landing-map-layout";
import type { MarkerLayoutBounds, UtilityMarkerGroup } from "./utility-markers";
import UtilityIcon, { type UtilityKind } from "./UtilityIcon";
import { utilityColor, type UtilityType } from "./utility-data";
import "./landing-map-pins.css";

type Props = {
  groups: UtilityMarkerGroup[]; bounds: MarkerLayoutBounds; unit: number;
  levelId: string; type: UtilityType; animate: boolean; busy: boolean;
  shouldIgnoreClick: () => boolean;
  onChoose: (group: UtilityMarkerGroup, keyboard: boolean) => void;
};

const dockSelector = ".ul-header, .ul-filterbar, .ul-zoom, .ul-levels, .ul-origin-back, .ul-map-credit, .ul-side-toggle";
const font = "600 12px system-ui";
function measureLabels(names: ReturnType<typeof nameLandingSpots>) {
  const context = document.createElement("canvas").getContext("2d");
  if (context) context.font = font;
  const measure = (text: string) => context?.measureText(text).width ?? text.length * 7;
  return names.map(label => ({ ...label, textWidth: measure(label.name), measure }));
}

/** The buttons and their exact anchors share the SVG camera, including during
 * a drag. Every button contains its own name and reserves its full hit area. */
export default function LandingMapPins({ groups, bounds, unit, levelId, type, animate, busy, shouldIgnoreClick, onChoose }: Props) {
  const root = useRef<SVGGElement>(null);
  const [obstacles, setObstacles] = useState<LayoutObstacle[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [requestedPage, setPage] = useState(0);
  const names = useMemo(() => measureLabels(nameLandingSpots(groups)), [groups]);
  const measuredWidth = Math.max(...names.map(label => Math.ceil(label.textWidth) + 37 + (label.ordinal ? 22 : 0)));
  const requestedWidth = Math.max(118, Math.min(160, measuredWidth));
  const { callouts, chipWidth, pager, page, pages } = useMemo(() =>
    layoutLandingSpots(names, bounds, unit, requestedWidth, obstacles, requestedPage),
  [names, bounds, unit, requestedWidth, obstacles, requestedPage]);
  const text = useMemo(() => new Map(names.map(label => {
    const max = chipWidth - 37 - (label.ordinal ? 22 : 0);
    let name = label.name;
    if (label.textWidth > max) {
      while (name.length && label.measure(name + "…") > max) name = name.slice(0, -1);
      name = name.trimEnd() + "…";
    }
    return [label.group.id, { name, width: Math.max(82, Math.min(chipWidth,
      Math.ceil(label.measure(name)) + 37 + (label.ordinal ? 22 : 0))) }] as const;
  })), [names, chipWidth]);

  useLayoutEffect(() => {
    const svg = root.current?.ownerSVGElement, workspace = svg?.closest(".utility-workspace");
    if (!svg || !workspace) return;
    const docks = Array.from(workspace.querySelectorAll<HTMLElement>(dockSelector));
    const measure = () => {
      const viewport = svg.getBoundingClientRect();
      const rects = docks.map(dock => dock.getBoundingClientRect()).filter(r => r.width && r.height &&
        r.right > viewport.left && r.left < viewport.right && r.bottom > viewport.top && r.top < viewport.bottom)
        .map(r => ({ x: r.left - viewport.left, y: r.top - viewport.top, width: r.width, height: r.height }));
      setObstacles(old => old.length === rects.length && old.every((r, i) =>
        r.x === rects[i].x && r.y === rects[i].y && r.width === rects[i].width && r.height === rects[i].height) ? old : rects);
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const element of [svg, ...docks]) observer.observe(element);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  function moveFocus(event: KeyboardEvent<SVGGElement>) {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const pins = Array.from(root.current?.querySelectorAll<SVGGElement>(".ul-landing-pin") || []);
    const current = pins.indexOf(event.currentTarget);
    if (!pins.length || current < 0) return;
    event.stopPropagation(); event.preventDefault();
    const delta = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? pins.length - 1 : (current + delta + pins.length) % pins.length;
    pins[next].focus({ preventScroll: true });
  }
  function changePage(next: number, keyboard: boolean) {
    setPage(next);
    setActive(null);
    if (keyboard) requestAnimationFrame(() => root.current?.querySelector<SVGGElement>(".ul-landing-pin")?.focus({ preventScroll: true }));
  }

  return <g ref={root} className="ul-landing-layer" transform={`translate(${bounds.x} ${bounds.y}) scale(${unit})`}
    style={{ color: utilityColor(type) }} data-page={page + 1} data-pages={pages}>
    <g className="ul-landing-leaders" aria-hidden="true">
      {callouts.map(({ group, point, center }) => {
        const half = text.get(group.id)!.width / 2;
        const inwardX = Math.max(center.x - half + 3, Math.min(center.x + half - 3, point.x));
        const inwardY = Math.max(center.y - 11, Math.min(center.y + 11, point.y));
        return <line key={group.id} pointerEvents="none" className={active === group.id ? "is-active" : undefined}
          x1={point.x} y1={point.y} x2={inwardX} y2={inwardY}/>;
      })}
      {callouts.map(({ group, point }) => <circle key={group.id} className="ul-landing-dot" data-spot={group.id}
        cx={point.x} cy={point.y} r={active === group.id ? 4 : 2.75}
        onPointerEnter={() => setActive(group.id)} onPointerLeave={() => setActive(null)}
        onClick={event => { event.stopPropagation(); if (!shouldIgnoreClick()) onChoose(group, false); }}/>)}
    </g>
    {callouts.map(({ group, ordinal, center }) => {
      const chip = text.get(group.id)!;
      const fullName = group.label + (ordinal ? `, spot ${ordinal}` : "");
      const left = -chip.width / 2;
      return <g key={group.id} className={`ul-map-marker ul-landing-pin${active === group.id ? " is-highlighted" : ""}`}
        role="button" tabIndex={busy ? -1 : 0} transform={`translate(${center.x} ${center.y})`}
        data-target-area={group.areaId} data-target-label={group.label} data-target-x={group.x} data-target-y={group.y}
        data-landing-id={group.id} data-landing-x={group.x} data-landing-y={group.y} data-landing-level={levelId}
        aria-label={`${fullName}, choose throw-from location`}
        onFocus={() => setActive(group.id)} onBlur={() => setActive(null)}
        onPointerEnter={() => setActive(group.id)} onPointerLeave={() => setActive(null)}
        onClick={event => { event.stopPropagation(); if (!shouldIgnoreClick()) onChoose(group, false); }}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onChoose(group, true); }
          else moveFocus(event);
        }}>
        <title>{fullName} — choose throw-from location</title>
        <rect className="ul-marker-hit" x={left} y="-22" width={chip.width} height="44" fill="transparent"/>
        <g className={animate ? "ul-landing-chip can-animate" : "ul-landing-chip"} pointerEvents="none" aria-hidden="true">
          <rect className="ul-landing-chip-bg" x={left} y="-15" width={chip.width} height="30" rx="10"/>
          <g data-utility={type}><UtilityIcon type={type.toLowerCase() as UtilityKind} size={17} x={left + 7} y={-8.5}/></g>
          <text className="ul-landing-name" x={left + 28} y="4">{chip.name}</text>
          {ordinal !== undefined && <g className="ul-landing-ordinal">
            <rect x={chip.width / 2 - 23} y="-8.5" width="17" height="17" rx="5"/>
            <text x={chip.width / 2 - 14.5} y="3.5" textAnchor="middle">{ordinal}</text>
          </g>}
        </g>
      </g>;
    })}
    {pager && <foreignObject x={pager.x - 59} y={pager.y - 22} width="118" height="44" onPointerDown={event => event.stopPropagation()}>
      <nav className="ul-landing-pages" aria-label="Landing spot pages">
        <button aria-label="Previous landing spots" disabled={page === 0} onClick={event => changePage(page - 1, event.detail === 0)}><ChevronLeft size={15}/></button>
        <span aria-live="polite">{page + 1}/{pages}</span>
        <button aria-label="Next landing spots" disabled={page === pages - 1} onClick={event => changePage(page + 1, event.detail === 0)}><ChevronRight size={15}/></button>
      </nav>
    </foreignObject>}
  </g>;
}
