import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  boundMapView,
  fitMapView,
  mapViewBox,
  panMapView,
  zoomMapView,
  type MapBounds,
  type MapSize,
  type MapView,
} from "./lineup-map-view";

type MapDrag = {
  id: number;
  x: number;
  y: number;
  view: MapView;
  moved: boolean;
};

export default function usePanZoom<T extends HTMLElement | SVGSVGElement>(
  bounds: MapBounds,
  context: string,
  placing = false,
) {
  const viewportRef = useRef<T>(null);
  const [size, setSize] = useState<MapSize>({ width: 0, height: 0 });
  const [view, setView] = useState(() => fitMapView(bounds));
  const [panning, setPanning] = useState(false);
  const current = useRef({ bounds, size, view });
  current.current = { bounds, size, view };
  const drag = useRef<MapDrag | null>(null);
  const spaceHeld = useRef(false);
  const suppressClick = useRef(false);

  function updateView(next: MapView) {
    current.current.view = next;
    setView(next);
  }

  function resetView() {
    updateView(fitMapView(current.current.bounds));
  }

  function changeZoom(zoom: number) {
    const now = current.current;
    updateView(zoomMapView(now.bounds, now.size, now.view, zoom));
  }

  useLayoutEffect(() => {
    resetView();
    drag.current = null;
    spaceHeld.current = false;
    suppressClick.current = false;
    setPanning(false);
  }, [context, bounds.x, bounds.y, bounds.width, bounds.height]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const rect = viewport.getBoundingClientRect();
      const nextSize = { width: rect.width, height: rect.height };
      if (!nextSize.width || !nextSize.height) return;
      const now = current.current;
      current.current.size = nextSize;
      setSize(nextSize);
      updateView(boundMapView(now.bounds, nextSize, now.view));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    const wheel = (input: Event) => {
      const event = input as WheelEvent;
      // Keep browser page zoom and horizontal trackpad scrolling available.
      if (event.ctrlKey || event.metaKey || event.shiftKey || !event.deltaY)
        return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (drag.current) return;
      const rect = viewport.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1;
      const delta = Math.max(-120, Math.min(120, event.deltaY * unit));
      const now = current.current;
      updateView(
        zoomMapView(
          now.bounds,
          now.size,
          now.view,
          now.view.zoom * Math.exp(-delta * 0.002),
          {
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
          },
        ),
      );
    };
    // React's delegated wheel listener is passive. Only this viewport needs to
    // cancel scrolling; the reference list and the rest of the page still scroll.
    viewport.addEventListener("wheel", wheel, { passive: false });
    return () => {
      observer.disconnect();
      viewport.removeEventListener("wheel", wheel);
    };
  }, []);

  function onPointerDown(event: PointerEvent<T>) {
    suppressClick.current = false;
    if (!event.isPrimary) return;
    const modified = spaceHeld.current || event.button === 1;
    if (event.button !== 0 && event.button !== 1) return;
    if (
      (placing || (event.target as Element).closest('[role="button"]')) &&
      !modified
    )
      return;
    if (current.current.view.zoom <= 1) {
      if (event.button === 1) event.preventDefault();
      return;
    }
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      view: current.current.view,
      moved: false,
    };
  }

  function onPointerMove(event: PointerEvent<T>) {
    const active = drag.current;
    if (!active || active.id !== event.pointerId) return;
    const delta = { x: event.clientX - active.x, y: event.clientY - active.y };
    if (!active.moved && Math.hypot(delta.x, delta.y) < 4) return;
    active.moved = true;
    suppressClick.current = true;
    setPanning(true);
    const now = current.current;
    updateView(panMapView(now.bounds, now.size, active.view, delta));
  }

  function stopDrag(event: PointerEvent<T>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    setPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onKeyDown(event: KeyboardEvent<T>) {
    if (
      event.target !== event.currentTarget ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return;
    const now = current.current;
    if (["+", "=", "-", "_", "0", "Home"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "0" || event.key === "Home") resetView();
      else
        changeZoom(
          now.view.zoom + (["+", "="].includes(event.key) ? 0.25 : -0.25),
        );
    } else if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      event.preventDefault();
      const step = event.shiftKey ? 120 : 48;
      updateView(
        panMapView(now.bounds, now.size, now.view, {
          x:
            event.key === "ArrowLeft"
              ? step
              : event.key === "ArrowRight"
                ? -step
                : 0,
          y:
            event.key === "ArrowUp"
              ? step
              : event.key === "ArrowDown"
                ? -step
                : 0,
        }),
      );
    } else if (event.key === " ") {
      event.preventDefault();
      spaceHeld.current = true;
    }
  }

  const box = mapViewBox(bounds, size, view);
  const mapUnit = size.width > 0 ? box.width / size.width : 2.3;
  return {
    viewportRef,
    zoom: view.zoom,
    mapUnit,
    contentTransform: `translate(${(bounds.x + bounds.width / 2 - view.x) / mapUnit}px, ${(bounds.y + bounds.height / 2 - view.y) / mapUnit}px) scale(${view.zoom})`,
    viewBox: `${box.x} ${box.y} ${box.width} ${box.height}`,
    panning,
    changeZoom,
    resetView,
    navigationProps: {
      tabIndex: 0,
      onPointerDown,
      onPointerMove,
      onPointerUp: stopDrag,
      onPointerCancel: stopDrag,
      onLostPointerCapture: stopDrag,
      onKeyDown,
      onKeyUp: (event: KeyboardEvent<T>) => {
        if (event.key === " ") spaceHeld.current = false;
      },
      onBlur: () => {
        spaceHeld.current = false;
      },
      onClickCapture: (event: MouseEvent<T>) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        event.preventDefault();
        event.stopPropagation();
      },
    },
  };
}
