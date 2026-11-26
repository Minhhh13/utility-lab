import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { CROSSHAIR_MAX_SIZE, CROSSHAIR_MIN_SIZE, DEFAULT_CROSSHAIR, type CrosshairSettings } from "./crosshair-settings";

export function PhotoCrosshair({ settings, point }: { settings: CrosshairSettings; point?: { x: number; y: number } }) {
  const shape = settings.shape === "reticle"
    ? <><path d="M-15 0H-8M8 0H15M0-15V-8M0 8V15"/><circle r="5"/></>
    : settings.shape === "cross" ? <path d="M-15 0H-3M3 0H15M0-15V-3M0 3V15"/>
    : <circle r="3.5" fill="currentColor"/>;
  return <svg className={point ? "ul-aim-point" : "ul-crosshair-sample"} viewBox="-17 -17 34 34"
    data-crosshair-shape={settings.shape} role={point ? "img" : undefined} aria-label={point ? "Aim here" : undefined}
    aria-hidden={point ? undefined : true} style={{
      width: settings.size, height: settings.size, "--ul-crosshair-color": settings.color,
      ...(point && { left: point.x, top: point.y }),
    } as CSSProperties}>
    <g className="ul-aim-point-outline">{shape}</g><g className="ul-aim-point-color">{shape}</g>
  </svg>;
}

export default function CrosshairControls({ settings, onChange }: {
  settings: CrosshairSettings;
  onChange: (settings: CrosshairSettings) => boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const heading = useId();
  const [saved, setSaved] = useState(true);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);
  function update(change: Partial<CrosshairSettings>) {
    setSaved(onChange({ ...settings, ...change }));
  }
  function close() {
    dialog.current?.close();
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  return <>
    <button type="button" ref={trigger} className="ul-crosshair-trigger" aria-label="Crosshair settings"
      title="Crosshair settings" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <SlidersHorizontal size={17}/><span>Crosshair</span>
    </button>
    {open && createPortal(<dialog ref={dialog} className="ul-crosshair-dialog" aria-labelledby={heading}
      onKeyDown={event => event.stopPropagation()}
      onCancel={event => { event.preventDefault(); event.stopPropagation(); close(); }}
      onClose={event => event.stopPropagation()}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
      }}>
      <div className="ul-crosshair-heading"><h3 id={heading}>Crosshair settings</h3>
        <button type="button" aria-label="Close crosshair settings" title="Close crosshair settings" onClick={close}><X size={18}/></button>
      </div>
      <div className="ul-crosshair-preview" aria-hidden="true"><PhotoCrosshair settings={settings}/></div>
      <div className="ul-crosshair-fields">
        <label>Style<select value={settings.shape} onChange={event => update({ shape: event.target.value as CrosshairSettings["shape"] })}>
          <option value="reticle">Reticle</option><option value="cross">Cross</option><option value="dot">Dot</option>
        </select></label>
        <label>Colour<input type="color" value={settings.color} onChange={event => update({ color: event.target.value })}/></label>
        <label className="ul-crosshair-size">Size <span>{settings.size} px</span>
          <input type="range" aria-label="Crosshair size" aria-valuetext={`${settings.size} pixels`}
            min={CROSSHAIR_MIN_SIZE} max={CROSSHAIR_MAX_SIZE} value={settings.size}
            onChange={event => update({ size: Number(event.target.value) })}/>
        </label>
      </div>
      {!saved && <p role="status">This browser could not save your crosshair settings.</p>}
      <div className="ul-crosshair-actions">
        <button type="button" onClick={() => update(DEFAULT_CROSSHAIR)}>Reset to default</button>
        <button type="button" onClick={close}>Done</button>
      </div>
    </dialog>, trigger.current?.closest("dialog") ?? document.body)}
  </>;
}
