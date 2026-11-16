import { clamp, type XY } from "./board-model.ts";

export type BoardView = { x: number; y: number; zoom: number };
export type MapFrame = { x: number; y: number; width: number; height: number };
const BOARD_FRAME: MapFrame = { x: 0, y: 0, width: 1000, height: 1000 };
export const FIT_VIEW: BoardView = { x: 500, y: 500, zoom: 1 };
export const MIN_ZOOM = 0.75;
export const MAX_ZOOM = 4;

export function fitView(frame: MapFrame): BoardView {
  return { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2, zoom: 1 };
}

export function boundView(view: BoardView, frame = BOARD_FRAME): BoardView {
  const zoom = clamp(Number.isFinite(view.zoom) ? view.zoom : 1, MIN_ZOOM, MAX_ZOOM);
  const center = fitView(frame);
  // A little canvas beyond the artwork makes panning useful even at Fit.
  // At Fit, even the corner limit retains 64% of the artwork area.
  const limitX = Math.max(0, frame.width / 2 - frame.width / (2 * zoom)) + frame.width / zoom * .2;
  const limitY = Math.max(0, frame.height / 2 - frame.height / (2 * zoom)) + frame.height / zoom * .2;
  return {
    zoom,
    x: clamp(Number.isFinite(view.x) ? view.x : center.x, center.x - limitX, center.x + limitX),
    y: clamp(Number.isFinite(view.y) ? view.y : center.y, center.y - limitY, center.y + limitY),
  };
}

/** Anchor is a map-space point under the cursor, before the zoom changes. */
export function zoomView(view: BoardView, zoom: number, anchor: XY = view, frame = BOARD_FRAME): BoardView {
  const nextZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  const ratio = view.zoom / nextZoom;
  return boundView({
    zoom: nextZoom,
    x: anchor.x + (view.x - anchor.x) * ratio,
    y: anchor.y + (view.y - anchor.y) * ratio,
  }, frame);
}

export function panView(view: BoardView, dx: number, dy: number, frame = BOARD_FRAME): BoardView {
  return boundView({ ...view, x: view.x + dx, y: view.y + dy }, frame);
}

/** Frame real map points in the SVG's actual visible viewport, including its
 * letterboxed space. Padding is in CSS pixels; geometry is never stretched.
 * Fit remains the minimum utility zoom, and map bounds/maxZoom take priority
 * when an extreme point set cannot retain the full requested padding. */
export function focusView(
  points: readonly XY[], frame = BOARD_FRAME,
  viewport: Pick<MapFrame, "width" | "height"> = frame, paddingPx = 48, maxZoom = MAX_ZOOM,
): BoardView {
  if (![frame.x, frame.y, frame.width, frame.height].every(Number.isFinite) || frame.width <= 0 || frame.height <= 0)
    frame = BOARD_FRAME;
  const valid = points.filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (!valid.length) return fitView(frame);
  const hasViewport = [viewport.width, viewport.height].every(value => Number.isFinite(value) && value > 0);
  const width = hasViewport ? viewport.width : frame.width;
  const height = hasViewport ? viewport.height : frame.height;
  const padding = Math.min(Math.max(0, Number.isFinite(paddingPx) ? paddingPx : 48), width * .4, height * .4);
  const zoomLimit = clamp(Number.isFinite(maxZoom) ? maxZoom : MAX_ZOOM, 1, MAX_ZOOM);
  const unitsPerPixel = Math.max(frame.width / width, frame.height / height);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const point of valid) {
    minX = Math.min(minX, point.x); maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y); maxY = Math.max(maxY, point.y);
  }
  const spanX = maxX - minX, spanY = maxY - minY;
  const zoomX = spanX > 0 ? (width - padding * 2) * unitsPerPixel / spanX : Infinity;
  const zoomY = spanY > 0 ? (height - padding * 2) * unitsPerPixel / spanY : Infinity;
  return boundView({
    x: minX / 2 + maxX / 2,
    y: minY / 2 + maxY / 2,
    zoom: Math.max(1, Math.min(zoomLimit, zoomX, zoomY)),
  }, frame);
}

export function viewBox(view: BoardView, frame = BOARD_FRAME): string {
  const width = frame.width / view.zoom, height = frame.height / view.zoom;
  return `${view.x - width / 2} ${view.y - height / 2} ${width} ${height}`;
}
