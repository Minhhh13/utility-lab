import {useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent} from "react";
import {Download, Ellipsis, Link2, Pencil, Star, Trash2} from "lucide-react";
import type {UtilityReference} from "./utility-data";
import "./guide-actions.css";

export type GuideActionsProps = {
  record: UtilityReference;
  saved: boolean;
  onToggleSaved: () => void;
  onCopyLink: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete?: () => void;
};

/** Viewer actions stay in the native dialog's top layer. Callbacks own export,
 * clipboard, editing and their success/error notifications. */
export default function GuideActions({record, saved, onToggleSaved, onCopyLink, onDownload, onEdit, onDelete}: GuideActionsProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({left: 0, top: 0, width: 224, maxHeight: 240, ready: false});
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const initialFocus = useRef(0);
  const menuId = useId();

  function close(restore = false) {
    setOpen(false);
    if(restore) trigger.current?.focus({preventScroll: true});
  }

  useEffect(() => {setOpen(false);}, [record.id]);

  useLayoutEffect(() => {
    if(!open) return;
    function place() {
      const element = menu.current, holder = container.current, button = trigger.current;
      if(!element || !holder || !button) return;
      const dialog = holder.closest("dialog")?.getBoundingClientRect();
      const margin = 8;
      const leftEdge = Math.max(12, (dialog?.left || 0) + margin);
      const rightEdge = Math.min(innerWidth - 12, (dialog?.right || innerWidth) - margin);
      const topEdge = Math.max(12, (dialog?.top || 0) + margin);
      const bottomEdge = Math.min(innerHeight - 12, (dialog?.bottom || innerHeight) - margin);
      const width = Math.min(224, rightEdge - leftEdge);
      const maxHeight = bottomEdge - topEdge;
      element.style.width = `${width}px`;
      element.style.maxHeight = `${maxHeight}px`;
      const height = element.getBoundingClientRect().height;
      const buttonBox = button.getBoundingClientRect(), parentBox = holder.getBoundingClientRect();
      const x = Math.max(leftEdge, Math.min(buttonBox.right - width, rightEdge - width));
      const below = buttonBox.bottom + 6;
      const y = Math.max(topEdge, Math.min(below + height <= bottomEdge ? below : buttonBox.top - height - 6, bottomEdge - height));
      const left = x - parentBox.left, top = y - parentBox.top;
      setPosition(current => current.left === left && current.top === top && current.width === width && current.maxHeight === maxHeight && current.ready
        ? current : {left, top, width, maxHeight, ready: true});
    }
    place();
    const observer = new ResizeObserver(place);
    if(menu.current) observer.observe(menu.current);
    window.addEventListener("resize", place);
    return () => {observer.disconnect(); window.removeEventListener("resize", place);};
  }, [open]);

  useEffect(() => {
    if(!open) return;
    const frame = requestAnimationFrame(() => {
      const items = menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
      items?.[initialFocus.current < 0 ? items.length - 1 : 0]?.focus({preventScroll: true});
    });
    function pointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if(container.current?.contains(target)) return;
      const control = target instanceof Element && target.closest('button, a[href], input, textarea, select, [tabindex]:not([tabindex^="-"])');
      close(!control);
    }
    function keyDown(event: globalThis.KeyboardEvent) {
      if(event.key !== "Escape") return;
      event.preventDefault(); event.stopPropagation(); close(true);
    }
    document.addEventListener("pointerdown", pointerDown, true);
    document.addEventListener("keydown", keyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", pointerDown, true);
      document.removeEventListener("keydown", keyDown, true);
    };
  }, [open]);

  function menuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') || []);
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    if(event.key === "Tab") {
      event.preventDefault();
      const scope = container.current?.closest("dialog") || document.body;
      const tabbable = Array.from(scope.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]'))
        .filter(element => element.tabIndex >= 0 && !element.hasAttribute("disabled") && element.getClientRects().length > 0);
      const start = tabbable.indexOf(trigger.current!);
      const next = tabbable[(start + (event.shiftKey ? -1 : 1) + tabbable.length) % tabbable.length];
      close(); next?.focus({preventScroll: true});
      return;
    }
    if(!items.length || !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const index = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
    items[index].focus();
  }

  function choose(action: () => void) {close(true); action();}

  return <div className="ul-guide-actions" ref={container} role="group" aria-label="Guide actions">
    <button type="button" className={`ul-guide-action-button ul-guide-save${saved ? " is-saved" : ""}`}
      aria-label={`${saved ? "Unsave" : "Save"} ${record.title}`} aria-pressed={saved}
      title={saved ? "Remove saved lineup" : "Save lineup"} onClick={() => {close(); onToggleSaved();}}>
      <Star size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true"/>
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
    <button type="button" ref={trigger} className="ul-guide-action-button"
      aria-label="Lineup actions" title="More lineup actions" aria-haspopup="menu"
      aria-expanded={open} aria-controls={open ? menuId : undefined}
      onClick={() => {initialFocus.current = 0; setPosition(current => ({...current, ready: false})); setOpen(value => !value);}}
      onKeyDown={event => {
        if(event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault(); initialFocus.current = event.key === "ArrowUp" ? -1 : 0; setOpen(true);
        }
      }}><Ellipsis size={20} aria-hidden="true"/></button>
    {open && <div ref={menu} className="ul-guide-action-menu" role="menu" aria-label="Lineup actions" id={menuId}
      style={{left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight, visibility: position.ready ? "visible" : "hidden"}}
      onKeyDown={menuKeyDown}>
      <button type="button" role="menuitem" tabIndex={-1} onClick={() => choose(onCopyLink)}><Link2 size={17} aria-hidden="true"/><span>Copy lineup link</span></button>
      <button type="button" role="menuitem" tabIndex={-1} onClick={() => choose(onDownload)}><Download size={17} aria-hidden="true"/><span>Download lineup</span></button>
      <button type="button" role="menuitem" tabIndex={-1} onClick={() => choose(onEdit)}><Pencil size={17} aria-hidden="true"/><span>{record.userCreated ? "Edit personal lineup" : "Make my own"}</span></button>
      {onDelete && <button type="button" role="menuitem" tabIndex={-1} onClick={() => choose(onDelete)}><Trash2 size={17} aria-hidden="true"/><span>Delete your lineup</span></button>}
    </div>}
  </div>;
}
