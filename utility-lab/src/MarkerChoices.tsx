import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import GrenadeIcon, { type UtilityKind } from "./UtilityIcon";
import UtilityTargetMarker from "./UtilityTargetMarker";
import { UTILITY_TYPES, utilityColor, type UtilityReference, type UtilityType } from "./utility-data";
import "./marker-choices.css";

export type MarkerChoicesProps = {
  records: UtilityReference[];
  /** Center of the target pin, in viewport CSS pixels. */
  anchor: { x: number; y: number };
  targetLabel?: string;
  busy?: boolean;
  /** The map owns the next step: show actual throw-from locations. */
  onSelectType?: (type: UtilityType) => void;
  /** Retained for callers upgrading to utility-first selection; never auto-opens a guide. */
  onChoose?: (record: UtilityReference) => void;
  onClose: () => void;
  trigger?: HTMLElement | SVGElement;
  /** Pointer opens may fan out; keyboard opens remain immediate. */
  animate?: boolean;
};

const label = (type: UtilityType) => type === "Molotov" ? "Molly" : type;

export default function MarkerChoices({ records, anchor, targetLabel, busy, onSelectType, onClose, trigger, animate }: MarkerChoicesProps) {
  const panel = useRef<HTMLDivElement>(null);
  const options = useRef<HTMLDivElement>(null);
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  const [position, setPosition] = useState({ left: 0, top: 0, width: 328, maxHeight: 350, ready: false });
  const pointerMotion = useRef(animate ?? !trigger?.matches(":focus-visible"));
  const animatedKey = useRef("");
  const types = UTILITY_TYPES.filter(type => records.some(record => record.type === type));
  const typesKey = types.join("|");
  const targetKey = records.map(record => record.id).join("\u0000");
  const hub = { x: position.width / 2, y: 132 };
  const points = types.length === 1 ? [{ x: hub.x, y: 40 }]
    : types.length === 2 ? [{ x: 60, y: 58 }, { x: position.width - 60, y: 58 }]
    : types.length === 3 ? [{ x: hub.x, y: 35 }, { x: 60, y: 198 }, { x: position.width - 60, y: 198 }]
    : [{ x: hub.x, y: 35 }, { x: position.width - 48, y: 132 }, { x: hub.x, y: 220 }, { x: 48, y: 132 }];

  useLayoutEffect(() => {
    function place() {
      const element = panel.current;
      if (!element) return;
      const margin = 12;
      const width = Math.min(328, window.innerWidth - margin * 2);
      const maxHeight = window.innerHeight - margin * 2;
      element.style.width = `${width}px`;
      element.style.maxHeight = `${maxHeight}px`;
      const height = element.getBoundingClientRect().height;
      const left = Math.max(margin, Math.min(anchor.x - width / 2, window.innerWidth - width - margin));
      const idealTop = anchor.y - (options.current?.offsetTop || 48) - 132;
      const top = Math.max(margin, Math.min(idealTop, window.innerHeight - height - margin));
      setPosition(current => current.left === left && current.top === top && current.width === width && current.maxHeight === maxHeight && current.ready
        ? current : { left, top, width, maxHeight, ready: true });
    }
    place();
    const observer = new ResizeObserver(place);
    if (panel.current) observer.observe(panel.current);
    window.addEventListener("resize", place);
    return () => { observer.disconnect(); window.removeEventListener("resize", place); };
  }, [anchor.x, anchor.y, typesKey]);

  useLayoutEffect(() => {
    pointerMotion.current = animate ?? !trigger?.matches(":focus-visible");
  }, [trigger, animate]);

  useLayoutEffect(() => {
    if (!position.ready || animatedKey.current === targetKey) return;
    animatedKey.current = targetKey;
    if (!pointerMotion.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const easing = getComputedStyle(panel.current!).getPropertyValue("--ease-out").trim() || "cubic-bezier(0.23, 1, 0.32, 1)";
    const animations: Animation[] = [];
    const buttons = Array.from(options.current?.querySelectorAll<HTMLButtonElement>("button") || []);
    buttons.forEach((button, index) => {
      const point = points[index];
      if (!point) return;
      animations.push(button.animate([
        { opacity: 0, transform: `translate(${hub.x - point.x}px, ${hub.y - point.y}px)` },
        { opacity: 1, transform: "translate(0px, 0px)" },
      ], { duration: 200, easing }));
    });
    const lines = panel.current?.querySelector(".ul-marker-choice-connections");
    if (lines) animations.push(lines.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing }));
    return () => animations.forEach(animation => animation.cancel());
  }, [position.ready, targetKey]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => {
      if (media.matches) panel.current?.getAnimations({ subtree: true }).forEach(animation => animation.finish());
    };
    media.addEventListener("change", finish);
    return () => media.removeEventListener("change", finish);
  }, []);

  useEffect(() => {
    const element = panel.current;
    const focusReturn = trigger || (document.activeElement instanceof HTMLElement ? document.activeElement : undefined);
    const frame = requestAnimationFrame(() => options.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true }));
    function dismiss() { focusReturn?.focus({ preventScroll: true }); closeCallback.current(); }
    function pointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (element?.contains(target) || trigger?.contains(target)) return;
      dismiss();
      const control = target instanceof Element && target.closest(
        'button, input, textarea, select, a[href], [tabindex]:not([tabindex^="-"]), [contenteditable="true"]',
      );
      if (!control) requestAnimationFrame(() => {
        if (focusReturn?.isConnected && (document.activeElement === document.body || document.activeElement?.matches('[tabindex^="-"]')))
          focusReturn.focus({ preventScroll: true });
      });
    }
    function keyDown(event: globalThis.KeyboardEvent) {
      pointerMotion.current = false;
      element?.getAnimations({ subtree: true }).forEach(animation => animation.finish());
      if (event.key !== "Escape") return;
      event.preventDefault(); event.stopPropagation(); dismiss();
    }
    document.addEventListener("pointerdown", pointerDown, true);
    document.addEventListener("keydown", keyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", pointerDown, true);
      document.removeEventListener("keydown", keyDown, true);
      if (document.activeElement === document.body || element?.contains(document.activeElement)) focusReturn?.focus({ preventScroll: true });
    };
  }, [trigger]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(options.current?.querySelectorAll<HTMLButtonElement>("button") || []);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (!buttons.length || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const back = event.key === "ArrowUp" || event.key === "ArrowLeft";
    const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (back ? -1 : 1) + buttons.length) % buttons.length;
    buttons[index].focus();
  }

  if (!types.length) return null;
  return createPortal(
    <div ref={panel} className="ul-marker-choices" id="ul-map-lineup-choices" role="dialog" aria-label="Choose utility" aria-busy={busy}
      aria-describedby={busy ? "ul-marker-choice-hint" : undefined}
      style={{ left: position.left, top: position.top, maxHeight: position.maxHeight, visibility: position.ready ? "visible" : "hidden" }}>
      <div className="ul-marker-choices-heading">
        <h2>{targetLabel || "Choose utility"}</h2>
        <button type="button" aria-label="Close utility choices" onClick={() => { trigger?.focus({ preventScroll: true }); onClose(); }}><X size={18} /></button>
      </div>
      <div ref={options} className="ul-marker-choice-options" role="group" aria-label="Utility types at this target" onKeyDown={moveFocus}>
        <svg className="ul-marker-choice-connections" aria-hidden="true" viewBox={`0 0 ${position.width} 282`}>
          {points.map((point, index) => <line key={index} x1={hub.x} y1={hub.y} x2={point.x} y2={point.y} />)}
        </svg>
        <svg className="ul-marker-choice-hub" aria-hidden="true" viewBox="-27 -27 54 54" style={{ left: hub.x - 27, top: hub.y - 27 }}>
          <UtilityTargetMarker types={types} radius={25} compact />
        </svg>
        {types.map((type, index) => <button className="ul-marker-choice-leaf" key={type} type="button"
          style={{ left: points[index].x - 44, top: points[index].y - 28 }}
          aria-label={label(type)} title={`Show ${label(type).toLowerCase()} throw locations`}
          onClick={() => onSelectType?.(type)}>
          <span className="ul-marker-choice-disc" style={{ color: utilityColor(type) }}><GrenadeIcon type={type.toLowerCase() as UtilityKind} size={30} /></span>
          <span className="ul-marker-choice-label">{label(type)}</span>
        </button>)}
      </div>
      {busy && <p id="ul-marker-choice-hint" className="ul-marker-choice-hint" role="status">Loading throw-from locations…</p>}
    </div>, document.body,
  );
}
