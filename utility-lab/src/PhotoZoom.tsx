import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Crosshair, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import MediaImage from "./MediaImage";
import { photoAimPosition } from "./aim-placement";
import CrosshairControls, { PhotoCrosshair } from "./PhotoCrosshair";
import { CROSSHAIR_KEY, readCrosshairSettings, saveCrosshairSettings } from "./crosshair-settings";
import "./aim-placement.css";
import "./photo-zoom.css";
import type { UtilityPhoto } from "./utility-data";

type Point = { x: number; y: number };

function touchPair(points: Map<number, Point>) {
  const [a, b] = points.values();
  return {
    span: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
    center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
  };
}

export default function PhotoZoom({
  photo,
  title,
  onSwipe,
  formats,
  onReady,
}: {
  photo: UtilityPhoto;
  title: string;
  onSwipe?: (direction: number) => void;
  formats?: ReactNode;
  onReady?:()=>void;
}) {
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [showAim, setShowAim] = useState(true);
  const [crosshair, setCrosshair] = useState(readCrosshairSettings);
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === CROSSHAIR_KEY || event.key === null) setCrosshair(readCrosshairSettings());
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  const [loaded, setLoaded] = useState({ image: "", width: 0, height: 0 });
  const frame = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const fingers = useRef(new Map<number, Point>());
  const pinch = useRef<{ span: number; scale: number; source: Point } | null>(null);
  const displayedScale = useRef(1);
  const pendingZoom = useRef<{ scale: number; left: number; top: number } | null>(null);
  const zoomAt = useRef<(next: number, point?: { x: number; y: number }) => void>(() => {});
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = (width: number, height: number) => {
      // A just-mounted/hot-reloaded frame can briefly compute to `auto` before
      // its stylesheet arrives. Let ResizeObserver supply its first real size.
      if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0) return;
      setSize(current => current.width === width && current.height === height ? current : { width, height });
    };
    const style = getComputedStyle(element);
    measure(Number.parseFloat(style.width), Number.parseFloat(style.height));
    // Observe the grid frame, never the scrolling element: its client size
    // changes when scrollbars appear and must not feed back into canvas size.
    const observer = new ResizeObserver(([entry]) => {
      if (entry) measure(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const region = photo.region;
  const panelScale = region
    ? Math.min(size.width / region.width, size.height / region.height) * scale
    : 1;
  const aim = loaded.image === photo.image && showAim
    ? photoAimPosition(photo, { width: size.width * scale, height: size.height * scale }, loaded)
    : null;
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  useEffect(() => {
    setScale(1);
    displayedScale.current = 1;
    pendingZoom.current = null;
    setShowAim(true);
    gesture.current = null;
    swipe.current = null;
    fingers.current.clear();
    pinch.current = null;
    setDragging(false);
    viewport.current?.scrollTo(0, 0);
  }, [photo.image]);
  useLayoutEffect(() => {
    displayedScale.current = scale;
    const pending = pendingZoom.current;
    if (!pending || pending.scale !== scale) return;
    // Apply the camera after the new canvas size, before the browser paints.
    // A newer wheel event replaces this intent instead of leaving stale RAFs.
    viewport.current?.scrollTo({ left: pending.left, top: pending.top, behavior: "instant" });
    pendingZoom.current = null;
  });
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if (!event.deltaY || !Number.isFinite(event.deltaY)) return;
      event.preventDefault();
      event.stopPropagation();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      const current = pendingZoom.current?.scale ?? displayedScale.current;
      const rect = element.getBoundingClientRect();
      zoomAt.current(current * Math.exp(-Math.max(-500, Math.min(500, pixels)) * 0.0025), {
        x: Math.max(0, Math.min(element.clientWidth, event.clientX - rect.left)),
        y: Math.max(0, Math.min(element.clientHeight, event.clientY - rect.top)),
      });
    };
    // These gestures already move the photo. A native fling can otherwise
    // consume the next tap on Fit or Next immediately after a drag.
    const touchStart = (event: TouchEvent) => {
      if ((event.touches.length > 1 || displayedScale.current > 1) &&
          !(event.target instanceof Element && event.target.closest("button, a"))) event.preventDefault();
    };
    // React's root wheel listener can be passive. Keep the image gesture local
    // and prevent the dialog, page or browser from also zooming/scrolling.
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("touchstart", touchStart, { passive: false });
    return () => {
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("touchstart", touchStart);
    };
  }, []);
  function zoom(next: number, point?: Point, source?: Point) {
    const target = Math.min(4, Math.max(1, Math.round(next * 10000) / 10000));
    const element = viewport.current;
    if (!element) return;
    const previous = pendingZoom.current;
    const current = previous?.scale ?? displayedScale.current;
    if (target === current && !source) return;
    const x = point?.x ?? element.clientWidth / 2;
    const y = point?.y ?? element.clientHeight / 2;
    const sourceX = source?.x ?? ((previous?.left ?? element.scrollLeft) + x) / current;
    const sourceY = source?.y ?? ((previous?.top ?? element.scrollTop) + y) / current;
    const intent = {
      scale: target,
      left: target === 1 ? 0 : Math.max(0, Math.min(size.width * target - element.clientWidth, sourceX * target - x)),
      top: target === 1 ? 0 : Math.max(0, Math.min(size.height * target - element.clientHeight, sourceY * target - y)),
    };
    pendingZoom.current = intent;
    const dragId = gesture.current?.id;
    gesture.current = null;
    swipe.current = null;
    setDragging(false);
    if (dragId !== undefined && element.hasPointerCapture(dragId)) element.releasePointerCapture(dragId);
    setScale(target);
    // A rapid opposite gesture may return to the already-rendered scale and
    // React can skip that render; its scroll intent still needs to apply.
    if (target === displayedScale.current) {
      element.scrollTo({ left: intent.left, top: intent.top, behavior: "instant" });
      pendingZoom.current = null;
    }
  }
  zoomAt.current = zoom;

  function localPoint(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  // Rebase when a finger joins or leaves. The original photo detail under the
  // midpoint stays beneath both fingers as their distance and position change.
  function startTouchGesture(element: HTMLDivElement) {
    const points = fingers.current;
    const camera = pendingZoom.current;
    const activeScale = camera?.scale ?? displayedScale.current;
    const left = camera?.left ?? element.scrollLeft;
    const top = camera?.top ?? element.scrollTop;
    pinch.current = null;
    gesture.current = null;
    swipe.current = null;
    if (points.size >= 2) {
      const { span, center } = touchPair(points);
      pinch.current = { span, scale: activeScale, source: {
        x: (left + center.x) / activeScale, y: (top + center.y) / activeScale,
      } };
    } else if (points.size === 1 && activeScale > 1) {
      const [[id, point]] = points;
      gesture.current = { id, ...point, left, top };
    }
    setDragging(!!gesture.current);
  }

  function releasePointer(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    if (event.pointerType === "touch" && fingers.current.delete(event.pointerId)) {
      const slide = swipe.current;
      startTouchGesture(event.currentTarget);
      if (!cancelled && slide?.id === event.pointerId) {
        const dx = event.clientX - slide.x, dy = event.clientY - slide.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) onSwipe?.(dx < 0 ? 1 : -1);
      }
    } else if (gesture.current?.id === event.pointerId) {
      gesture.current = null;
      setDragging(false);
    }
  }

  return (
    <>
      <div className="ul-photo-frame" ref={frame}>
      <div
        ref={viewport}
        className={`ul-photo-viewport${scale > 1 ? " is-zoomed" : ""}${dragging ? " is-dragging" : ""}`}
        tabIndex={0}
        role="region"
        aria-label="Photo detail. Pinch, scroll, or use + and − to zoom. Double-click for detail or press 0 to fit. Drag or use arrow keys to pan."
        style={{ touchAction: "none" }}
        onDoubleClick={event => {
          if ((event.target as Element).closest("button, a")) return;
          const rect = event.currentTarget.getBoundingClientRect();
          zoom((pendingZoom.current?.scale ?? displayedScale.current) > 1 ? 1 : 2,
            { x: event.clientX - rect.left, y: event.clientY - rect.top });
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
          if (["+", "=", "-", "0"].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            const current = pendingZoom.current?.scale ?? displayedScale.current;
            zoom(event.key === "0" ? 1 : current + (event.key === "-" ? -0.5 : 0.5));
            return;
          }
          if (
            scale <= 1 ||
            !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
              event.key,
            )
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.scrollBy(
            event.key === "ArrowLeft"
              ? -80
              : event.key === "ArrowRight"
                ? 80
                : 0,
            event.key === "ArrowUp" ? -80 : event.key === "ArrowDown" ? 80 : 0,
          );
        }}
        onPointerDown={(event) => {
          if ((event.target as Element).closest("button, a")) return;
          if (event.pointerType === "touch") {
            fingers.current.set(event.pointerId, localPoint(event));
            startTouchGesture(event.currentTarget);
            if (fingers.current.size === 1 && event.isPrimary && displayedScale.current === 1 && onSwipe)
              swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
            return;
          }
          if (scale <= 1 || event.pointerType !== "mouse" || event.button !== 0)
            return;
          event.preventDefault();
          gesture.current = {
            id: event.pointerId,
            ...localPoint(event),
            left: event.currentTarget.scrollLeft,
            top: event.currentTarget.scrollTop,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (!gesture.current && !fingers.current.has(event.pointerId)) return;
          const point = localPoint(event);
          if (fingers.current.has(event.pointerId)) {
            fingers.current.set(event.pointerId, point);
            const start = pinch.current;
            if (start) {
              const { span, center } = touchPair(fingers.current);
              zoom(start.scale * span / start.span, center, start.source);
              return;
            }
          }
          const drag = gesture.current;
          if (!drag || drag.id !== event.pointerId) return;
          event.currentTarget.scrollTo(
            drag.left - point.x + drag.x,
            drag.top - point.y + drag.y,
          );
        }}
        onPointerUp={event => releasePointer(event)}
        onLostPointerCapture={event => releasePointer(event, true)}
        onPointerCancel={event => releasePointer(event, true)}
      >
        <div
          className="ul-photo-canvas"
          style={{
            width: scale === 1 ? "100%" : size.width * scale,
            height: scale === 1 ? "100%" : size.height * scale,
          }}
        >
          <div
            className={region ? "ul-photo-region" : "ul-photo-image"}
            data-photo-region={region ? "true" : undefined}
            style={region ? {
              width: region.width * panelScale,
              height: region.height * panelScale,
              left: (size.width * scale - region.width * panelScale) / 2,
              top: (size.height * scale - region.height * panelScale) / 2,
            } : undefined}
          >
          <MediaImage
            src={photo.image}
            alt={photo.caption || title}
            draggable={false}
            onLoad={event => {
              const image = event.currentTarget;
              setLoaded(current => current.image === photo.image &&
                current.width === image.naturalWidth && current.height === image.naturalHeight
                ? current : { image: photo.image, width: image.naturalWidth, height: image.naturalHeight });
              onReady?.();
            }}
            onError={() => setLoaded({ image: "", width: 0, height: 0 })}
            style={region ? {
              width: region.sourceWidth * panelScale,
              height: region.sourceHeight * panelScale,
              left: -region.x * panelScale,
              top: -region.y * panelScale,
              maxWidth: "none",
              objectFit: "fill",
            } : undefined}
          />
          </div>
          {aim && <PhotoCrosshair settings={crosshair} point={aim}/>}
        </div>
      </div>
      </div>
      <div className="ul-photo-toolbar ul-photo-toolbar-compact">
      {formats}
      <div className="ul-photo-zoom ul-photo-zoom-compact" role="group" aria-label="Photo zoom">
        {photo.kind === "aim" && photo.aimPoint && (
          <><button className="ul-aim-toggle" aria-label={showAim ? "Hide aim point" : "Show aim point"}
            aria-pressed={showAim} title={showAim ? "Hide aim point" : "Show aim point"}
            onClick={() => setShowAim(value => !value)}>
            <Crosshair size={17} />
          </button><CrosshairControls settings={crosshair} onChange={next => {
            setCrosshair(next);
            return saveCrosshairSettings(next);
          }}/></>
        )}
        <div className="ul-photo-zoom-pair">
        <button
          aria-label="Zoom out photo"
          disabled={scale <= 1}
          title="Zoom out photo"
          onClick={() => zoom((pendingZoom.current?.scale ?? displayedScale.current) - 0.5)}
        >
          <ZoomOut size={17} />
        </button>
        <button
          aria-label="Zoom in photo"
          disabled={scale >= 4}
          title="Zoom in photo"
          onClick={() => zoom((pendingZoom.current?.scale ?? displayedScale.current) + 0.5)}
        >
          <ZoomIn size={17} />
        </button>
        </div>
        <button
          className="ul-photo-fit"
          aria-label="Fit photo"
          onClick={() => zoom(1)}
          title="Fit photo"
        >
          <Maximize size={15} />
          <span>{Math.round(scale * 100)}%</span>
        </button>
      </div>
      </div>
    </>
  );
}
