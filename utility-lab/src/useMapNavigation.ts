import { useCallback, useEffect, useRef, useState, type RefObject, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { boundView, fitView, focusView, panView, viewBox, zoomView, MAX_ZOOM, type BoardView, type MapFrame } from "./board-navigation";
import type { XY } from "./board-model";

/** Navigation stays inside this SVG; it never captures document wheel events. */
export default function useMapNavigation(svg: RefObject<SVGSVGElement | null>, frame: MapFrame, contextKey: string, placing: boolean) {
  const [view, setView] = useState(() => fitView(frame));
  const [hand, setHand] = useState(false);
  const [panning, setPanning] = useState(false);
  const [space, setSpace] = useState(false);
  const current = useRef({ view, frame });
  current.current = { view, frame };
  const spaceHeld = useRef(false);
  const ignoredClick = useRef(false);
  const touches = useRef(new Map<number, XY>());
  const pan = useRef<{ id: number; start: XY; view: BoardView; scale: number } | null>(null);
  const pinch = useRef<{ distance: number; middle: XY; anchor: XY; view: BoardView; scale: number } | null>(null);
  const reset = useCallback(() => { setView(fitView(current.current.frame)); }, []);
  const cancel = useCallback(() => {
    pan.current = null; pinch.current = null; touches.current.clear();
    spaceHeld.current = false; setSpace(false); setPanning(false);
  }, []);
  const focusOn = useCallback((points: readonly XY[], paddingPx = 48, maxZoom = MAX_ZOOM) => {
    const valid = points.filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
    if (!valid.length) return;
    cancel();
    ignoredClick.current = false;
    setHand(false);
    const bounds = svg.current?.getBoundingClientRect();
    const viewport = bounds && bounds.width > 0 && bounds.height > 0 ? bounds : current.current.frame;
    setView(focusView(valid, current.current.frame, viewport, paddingPx, maxZoom));
  }, [svg, cancel]);
  useEffect(() => { reset(); cancel(); }, [contextKey, frame.x, frame.y, frame.width, frame.height, reset, cancel]);
  useEffect(() => { if (placing) setHand(false); }, [placing]);
  useEffect(() => {
    const canvas = svg.current;
    if (!canvas) return;
    const wheel = (event: WheelEvent) => {
      if (pan.current || pinch.current) return;
      event.preventDefault();
      const matrix = canvas.getScreenCTM();
      if (!matrix) return;
      const anchor = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1);
      setView(v => zoomView(v, Math.max(1, v.zoom * Math.exp(-Math.max(-300, Math.min(300, delta)) * .0015)), anchor, current.current.frame));
    };
    const releaseSpace = (event: KeyboardEvent) => { if (event.key === " ") { spaceHeld.current = false; setSpace(false); } };
    canvas.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("blur", cancel);
    window.addEventListener("keyup", releaseSpace);
    return () => { canvas.removeEventListener("wheel", wheel); window.removeEventListener("blur", cancel); window.removeEventListener("keyup", releaseSpace); };
  }, [svg, cancel]);

  function pointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (!touches.current.size) ignoredClick.current = false;
    const marker = (event.target as Element).closest(".ul-map-marker, .ul-origin-pin");
    const explicitPan = hand || spaceHeld.current || event.button === 1;
    if (event.pointerType === "touch") {
      touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (!marker || explicitPan || placing) event.currentTarget.setPointerCapture(event.pointerId);
      if (touches.current.size === 2) {
        const points = [...touches.current.values()];
        const middle = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        const matrix = event.currentTarget.getScreenCTM();
        if (!matrix) return;
        for (const id of touches.current.keys()) event.currentTarget.setPointerCapture(id);
        pan.current = null; ignoredClick.current = true;
        pinch.current = { distance: Math.max(1, Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)), middle,
          anchor: new DOMPoint(middle.x, middle.y).matrixTransform(matrix.inverse()), view: current.current.view, scale: matrix.a };
        setPanning(true); event.preventDefault(); return;
      }
      if (pinch.current || touches.current.size > 2) return;
    }
    if ((event.button !== 0 && event.button !== 1) || (!explicitPan && (placing || marker))) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    ignoredClick.current = explicitPan;
    pan.current = { id: event.pointerId, start: { x: event.clientX, y: event.clientY }, view: current.current.view, scale: event.currentTarget.getScreenCTM()?.a || 1 };
    event.currentTarget.setPointerCapture(event.pointerId); setPanning(true);
  }
  function pointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (touches.current.has(event.pointerId)) touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const activePinch = pinch.current;
    if (activePinch) {
      if (touches.current.size >= 2) {
        const points = [...touches.current.values()].slice(0, 2);
        const middle = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        const zoomed = zoomView(activePinch.view, Math.max(1, activePinch.view.zoom * distance / activePinch.distance), activePinch.anchor, current.current.frame);
        const scale = activePinch.scale * zoomed.zoom / activePinch.view.zoom;
        setView(boundView({ ...zoomed, x: zoomed.x - (middle.x - activePinch.middle.x) / scale, y: zoomed.y - (middle.y - activePinch.middle.y) / scale }, current.current.frame));
      }
      return;
    }
    const active = pan.current;
    if (!active || active.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - active.start.x, event.clientY - active.start.y) > 3) ignoredClick.current = true;
    setView(panView(active.view, -(event.clientX - active.start.x) / active.scale, -(event.clientY - active.start.y) / active.scale, current.current.frame));
  }
  function pointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    touches.current.delete(event.pointerId);
    if (pinch.current) {
      if (!touches.current.size) { pinch.current = null; setPanning(false); }
    } else if (pan.current?.id === event.pointerId) { pan.current = null; setPanning(false); }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyDown(event: ReactKeyboardEvent<SVGSVGElement>) {
    if (event.target !== event.currentTarget || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === " ") { event.preventDefault(); spaceHeld.current = true; setSpace(true); return; }
    if (event.key === "Escape") { cancel(); setHand(false); return; }
    if (event.key.toLowerCase() === "g") { event.preventDefault(); setHand(value => !value); return; }
    if (["+", "=", "-", "_", "0"].includes(event.key)) {
      event.preventDefault();
      setView(v => event.key === "0" ? fitView(current.current.frame) : zoomView(v, Math.max(1, v.zoom * (["-", "_"].includes(event.key) ? 1 / 1.25 : 1.25)), v, current.current.frame));
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault(); const amount = (event.shiftKey ? 120 : 40) / view.zoom;
      setView(v => panView(v, event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0, event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0, current.current.frame));
    }
  }
  return {
    zoom: view.zoom, viewBox: viewBox(view, frame), hand, panning, space,
    reset, focusOn, toggleHand: () => setHand(value => !value), shouldIgnoreClick: () => ignoredClick.current || hand || spaceHeld.current,
    zoomBy: (factor: number) => setView(v => zoomView(v, Math.max(1, Math.min(MAX_ZOOM, v.zoom * factor)), v, current.current.frame)),
    handlers: { onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: pointerUp,
      onPointerCancel: cancel, onLostPointerCapture: (event: ReactPointerEvent<SVGSVGElement>) => { if (pan.current?.id === event.pointerId) cancel(); },
      onKeyDown: keyDown, onBlur: () => { spaceHeld.current = false; setSpace(false); } },
  };
}
