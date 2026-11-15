import { useEffect, type RefObject } from "react";

/** Add wheel input to the existing viewer without replacing its camera or slides. */
export function usePhotoWheelZoom(
  viewport: RefObject<HTMLElement | null>,
  zoom: number,
  setZoom: (value: number) => void,
) {
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;

    const wheel = (event: WheelEvent) => {
      // Leave browser zoom / trackpad pinch and horizontal scrolling available.
      if (event.ctrlKey || event.metaKey || event.deltaY === 0) return;
      const pixels = event.deltaY * (
        event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? element.clientHeight : 1
      );
      event.preventDefault();
      setZoom(Math.min(4, Math.max(1, zoom * Math.exp(-pixels * 0.0015))));
    };

    // React's passive root wheel listener cannot prevent the page from scrolling.
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [viewport, zoom, setZoom]);
}
