import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Images } from "lucide-react";
import type { Scene, SceneId } from "./launch-scenes";
import "./home-scene-picker.css";

type Props = {
  scenes: readonly Scene[];
  value: SceneId;
  onChange: (id: SceneId) => void;
  busy: boolean;
};

export default function HomeScenePicker({ scenes, value, onChange, busy }: Props) {
  const current = scenes.find(scene => scene.id === value) ?? scenes[0];
  const root = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const initialFocus = useRef(0);
  const id = useId();
  const [openedBy, setOpenedBy] = useState<"pointer" | "keyboard" | null>(null);

  function show(by: "pointer" | "keyboard", index = scenes.indexOf(current)) {
    initialFocus.current = index;
    setOpenedBy(by);
  }

  function dismiss(restoreFocus: boolean) {
    setOpenedBy(null);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }

  function focusOption(index: number) {
    const option = optionRefs.current[index];
    const scroll = list.current;
    if (!option || !scroll) return;
    option.focus({ preventScroll: true });
    const offset = option.offsetTop;
    if (offset < scroll.scrollTop) scroll.scrollTop = offset;
    else if (offset + option.offsetHeight > scroll.scrollTop + scroll.clientHeight) {
      scroll.scrollTop = offset + option.offsetHeight - scroll.clientHeight;
    }
  }

  useLayoutEffect(() => {
    if (!openedBy || !trigger.current || !panel.current) return;
    function position() {
      const anchor = trigger.current!.getBoundingClientRect();
      const popup = panel.current!;
      const gutter = 10;
      const left = Math.max(gutter, Math.min(anchor.right - popup.offsetWidth, document.documentElement.clientWidth - gutter - popup.offsetWidth));
      const top = anchor.bottom + 7;
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
      popup.style.maxHeight = `${Math.max(0, window.innerHeight - top - gutter)}px`;
      popup.style.setProperty("--picker-origin", `${Math.max(0, Math.min(popup.offsetWidth, anchor.right - anchor.width / 2 - left))}px`);
    }
    position();
    focusOption(initialFocus.current);
    const observer = new ResizeObserver(position);
    observer.observe(trigger.current);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position);
    };
  }, [openedBy]);

  useEffect(() => {
    if (!openedBy) return;
    function outside(event: Event) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpenedBy(null);
    }
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("focusin", outside);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("focusin", outside);
    };
  }, [openedBy]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    switch (event.key) {
      case "ArrowDown": case "ArrowRight": next = Math.min(scenes.length - 1, index + 1); break;
      case "ArrowUp": case "ArrowLeft": next = Math.max(0, index - 1); break;
      case "Home": next = 0; break;
      case "End": next = scenes.length - 1; break;
      case "Escape": event.preventDefault(); dismiss(true); return;
      case "Tab":
        // Let the browser tab from the trigger to its natural neighbour.
        dismiss(true);
        return;
      default: return;
    }
    event.preventDefault();
    focusOption(next);
  }

  return <span className="home-scene-picker" ref={root}>
    <button type="button" className="home-scene-trigger" ref={trigger}
      aria-label={`Map background: ${current.name}`} title={`Map background: ${current.name}`}
      aria-haspopup="listbox" aria-expanded={!!openedBy} aria-busy={busy} aria-controls={openedBy ? id : undefined}
      data-scene={value}
      onClick={event => openedBy ? dismiss(true) : show(event.detail ? "pointer" : "keyboard")}
      onKeyDown={event => {
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          show("keyboard", event.key === "Home" ? 0 : event.key === "End" ? scenes.length - 1 : scenes.indexOf(current));
        }
      }}>
      <Images size={17} strokeWidth={1.7} aria-hidden="true" />
      <span>{current.name}</span>
      <ChevronDown className="home-scene-chevron" size={14} aria-hidden="true" />
    </button>
    {openedBy && <div className="home-scene-popup" data-opened-by={openedBy} ref={panel}>
      <div className="home-scene-heading" id={id + "-label"}>Map background</div>
      <div role="listbox" id={id} aria-labelledby={id + "-label"} className="home-scene-list" ref={list}>
        {scenes.map((scene, index) => <button key={scene.id} type="button" role="option" aria-selected={scene.id === value}
          tabIndex={-1} className="home-scene-option" ref={option => { optionRefs.current[index] = option; }}
          onKeyDown={event => navigate(event, index)} onClick={() => { onChange(scene.id); dismiss(true); }}>
          <img src={scene.thumbnail} alt="" width="64" height="36" decoding="async" />
          <span>{scene.name}</span>
          {scene.id === value && <Check className="home-scene-check" size={17} strokeWidth={2.4} aria-hidden="true" />}
        </button>)}
      </div>
    </div>}
  </span>;
}
