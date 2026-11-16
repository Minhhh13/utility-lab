import {useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent} from "react";
import {createPortal} from "react-dom";
import {ChevronRight, X} from "lucide-react";
import UtilityIcon, {type UtilityKind} from "./UtilityIcon";
import {UTILITY_TYPES, utilityColor} from "./utility-data";
import type {UtilityMarkerGroup} from "./utility-markers";
import "./area-choices.css";

export type AreaChoicesProps = {
  areas: UtilityMarkerGroup[];
  /** Centre of the grouped map icon, in viewport pixels. */
  anchor: {x: number; y: number};
  trigger?: HTMLElement | SVGElement;
  onChoose: (area: UtilityMarkerGroup) => void;
  onClose: () => void;
  animate?: boolean;
};

/** A compact location list keeps nearby callouts discoverable without moving
 * their map positions or opening media before a location has been chosen. */
export default function AreaChoices({areas, anchor, trigger, onChoose, onClose, animate}: AreaChoicesProps) {
  const panel = useRef<HTMLDivElement>(null);
  const options = useRef<HTMLUListElement>(null);
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  const [position, setPosition] = useState({left: 0, top: 0, width: 320, maxHeight: 350, ready: false});
  const pointerMotion = useRef(animate ?? !trigger?.matches(":focus-visible"));
  const areasKey = areas.map(area => area.id).join("\u0000");

  useLayoutEffect(() => {
    function place() {
      const element = panel.current;
      if(!element) return;
      const margin = 12;
      const width = Math.min(320, window.innerWidth - margin * 2);
      const maxHeight = window.innerHeight - margin * 2;
      element.style.width = `${width}px`;
      element.style.maxHeight = `${maxHeight}px`;
      const height = element.getBoundingClientRect().height;
      const left = Math.max(margin, Math.min(anchor.x - width / 2, window.innerWidth - width - margin));
      const below = anchor.y + 18;
      const idealTop = below + height <= window.innerHeight - margin ? below : anchor.y - height - 18;
      const top = Math.max(margin, Math.min(idealTop, window.innerHeight - height - margin));
      setPosition(current => current.left === left && current.top === top && current.width === width && current.maxHeight === maxHeight && current.ready
        ? current : {left, top, width, maxHeight, ready: true});
    }
    place();
    const observer = new ResizeObserver(place);
    if(panel.current) observer.observe(panel.current);
    window.addEventListener("resize", place);
    return () => {observer.disconnect(); window.removeEventListener("resize", place);};
  }, [anchor.x, anchor.y, areasKey]);

  useLayoutEffect(() => {
    pointerMotion.current = animate ?? !trigger?.matches(":focus-visible");
  }, [trigger, animate]);

  useLayoutEffect(() => {
    const element = panel.current;
    if(!position.ready || !element || !pointerMotion.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const easing = getComputedStyle(element).getPropertyValue("--ease-out").trim() || "cubic-bezier(0.23, 1, 0.32, 1)";
    const animation = element.animate([{opacity: .45}, {opacity: 1}], {duration: 160, easing});
    return () => animation.cancel();
  }, [position.ready, areasKey]);

  useEffect(() => {
    if(!areas.length) return;
    const element = panel.current;
    const focused = document.activeElement;
    const focusReturn = trigger || (focused instanceof HTMLElement || focused instanceof SVGElement ? focused : undefined);
    const frame = requestAnimationFrame(() => options.current?.querySelector<HTMLButtonElement>("button")?.focus({preventScroll: true}));
    function dismiss() {focusReturn?.focus({preventScroll: true}); closeCallback.current();}
    function pointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if(element?.contains(target) || trigger?.contains(target)) return;
      dismiss();
      const control = target instanceof Element && target.closest('button, input, textarea, select, a[href], [tabindex]:not([tabindex^="-"]), [contenteditable="true"]');
      if(!control) requestAnimationFrame(() => {
        if(focusReturn?.isConnected && (document.activeElement === document.body || document.activeElement?.matches('[tabindex^="-"]')))
          focusReturn.focus({preventScroll: true});
      });
    }
    function keyDown(event: globalThis.KeyboardEvent) {
      pointerMotion.current = false;
      element?.getAnimations({subtree: true}).forEach(animation => animation.finish());
      if(event.key !== "Escape") return;
      event.preventDefault(); event.stopPropagation(); dismiss();
    }
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const finishMotion = () => {
      if(media.matches) element?.getAnimations({subtree: true}).forEach(animation => animation.finish());
    };
    document.addEventListener("pointerdown", pointerDown, true);
    document.addEventListener("keydown", keyDown, true);
    media.addEventListener("change", finishMotion);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", pointerDown, true);
      document.removeEventListener("keydown", keyDown, true);
      media.removeEventListener("change", finishMotion);
      if(document.activeElement === document.body || element?.contains(document.activeElement)) focusReturn?.focus({preventScroll: true});
    };
  }, [trigger, areasKey]);

  function moveFocus(event: KeyboardEvent<HTMLUListElement>) {
    if(!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(options.current?.querySelectorAll<HTMLButtonElement>("button") || []);
    if(!buttons.length) return;
    event.preventDefault(); event.stopPropagation();
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const back = event.key === "ArrowUp" || event.key === "ArrowLeft";
    const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (back ? -1 : 1) + buttons.length) % buttons.length;
    buttons[index].focus();
  }

  if(!areas.length) return null;
  return createPortal(<div ref={panel} className="ul-area-choices" id="ul-map-area-choices" role="dialog" aria-label="Choose utility location"
    style={{left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight, visibility: position.ready ? "visible" : "hidden"}}>
    <header className="ul-area-choices-heading">
      <h2>Choose location</h2>
      <button type="button" aria-label="Close location choices" onClick={() => {trigger?.focus({preventScroll: true}); onClose();}}><X size={18}/></button>
    </header>
    <ul ref={options} className="ul-area-choices-list" aria-label="Utility locations" onKeyDown={moveFocus}>
      {areas.map(area => <li key={area.id}>
        <button type="button" className="ul-area-choice" aria-label={`Choose ${area.label} location`} onClick={() => onChoose(area)}>
          <strong>{area.label}</strong>
          <span className="ul-area-utility-preview" aria-hidden="true">
            {UTILITY_TYPES.filter(type => area.records.some(record => record.type === type)).map(type =>
              <UtilityIcon key={type} type={type.toLowerCase() as UtilityKind} size={18} style={{color: utilityColor(type)}}/>)}
          </span>
          <ChevronRight className="ul-area-choice-chevron" size={14} aria-hidden="true"/>
        </button>
      </li>)}
    </ul>
  </div>, document.body);
}
