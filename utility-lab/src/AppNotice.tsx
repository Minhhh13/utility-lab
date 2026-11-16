import {useLayoutEffect, useState, type CSSProperties} from "react";
import {createPortal} from "react-dom";
import {Info, X} from "lucide-react";

function modalDialogs(): HTMLDialogElement[] {
  return Array.from(document.querySelectorAll<HTMLDialogElement>("dialog[open]")).filter(dialog => {
    try {return dialog.matches(":modal");}
    catch {return dialog.open;} // Older overlay browsers still support dialog.
  });
}

function focusedModal(dialogs: HTMLDialogElement[]): HTMLDialogElement | undefined {
  const focused = document.activeElement?.closest("dialog[open]");
  return dialogs.find(dialog => dialog === focused);
}

const modalActionStrips = "footer, .ul-media-footer, .ul-photo-dots";

/** A body-level notice is inert behind showModal(). Keep the same notice in
 * the active dialog's top layer, then return it when that dialog closes. */
export default function AppNotice({message, onDismiss}: {message: string; onDismiss: () => void}) {
  const [host, setHost] = useState<HTMLDialogElement | null>(() => {
    const dialogs = modalDialogs();
    return focusedModal(dialogs) || dialogs.at(-1) || null;
  });
  const [placement, setPlacement] = useState<{left: number; bottom: number; maxWidth: number}>();

  useLayoutEffect(() => {
    const opened = new Map<HTMLDialogElement, number>();
    let sequence = 0;
    for(const dialog of modalDialogs()) opened.set(dialog, ++sequence);
    function update(records: MutationRecord[] = []) {
      for(const record of records) if(record.type === "attributes" && record.target instanceof HTMLDialogElement) {
        if(record.target.open) opened.set(record.target, ++sequence);
        else opened.delete(record.target);
      }
      const dialogs = modalDialogs();
      for(const dialog of opened.keys()) if(!dialogs.includes(dialog)) opened.delete(dialog);
      for(const dialog of dialogs) if(!opened.has(dialog)) opened.set(dialog, ++sequence);
      const latest = [...dialogs].sort((a,b) => (opened.get(a) || 0) - (opened.get(b) || 0)).at(-1);
      const next = focusedModal(dialogs) || latest || null;
      setHost(current => current === next ? current : next);
    }
    const observer = new MutationObserver(update);
    observer.observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ["open"]});
    const focus = () => update();
    document.addEventListener("focusin", focus);
    document.addEventListener("close", focus, true);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", focus);
      document.removeEventListener("close", focus, true);
    };
  }, []);

  useLayoutEffect(() => {
    if(!host) {setPlacement(undefined); return;}
    function measure() {
      if(!host?.isConnected || !host.open) return;
      const bounds = host.getBoundingClientRect();
      const left = bounds.left + bounds.width / 2;
      // Keep the dismiss hit target clear of modal actions. The notice body
      // passes clicks through, but its button must not cover an export button.
      const footerTops = [...host.querySelectorAll(modalActionStrips)]
        .map(footer => footer.getBoundingClientRect())
        .filter(footer => footer.height > 0 && footer.bottom > bounds.top && footer.top < bounds.bottom)
        .map(footer => footer.top);
      const bottom = Math.max(12, innerHeight - Math.min(bounds.bottom, ...footerTops) + 12);
      const maxWidth = Math.min(550, innerWidth - 32, bounds.width - 24);
      setPlacement(current => current?.left === left && current.bottom === bottom && current.maxWidth === maxWidth
        ? current : {left, bottom, maxWidth});
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    host.querySelectorAll(modalActionStrips).forEach(footer => observer.observe(footer));
    const contentObserver = new MutationObserver(measure);
    contentObserver.observe(host, {childList: true, subtree: true});
    host.addEventListener("scroll", measure, {passive: true});
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect(); contentObserver.disconnect();
      host.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [host]);

  const style: CSSProperties | undefined = host && placement ? {
    left: placement.left,
    bottom: `max(calc(22px + var(--safe-bottom, 0px)), ${placement.bottom}px)`,
    maxWidth: placement.maxWidth,
  } : undefined;
  const notice = <div className="app-notice" role="status" data-notice-layer={host ? "dialog" : "workspace"} style={style}>
    <span className="notice-icon"><Info size={18}/></span>
    <span>{message}</span>
    <button type="button" className="icon-button" aria-label="Dismiss message" onClick={onDismiss}><X size={17}/></button>
  </div>;
  return host ? createPortal(notice, host) : notice;
}
