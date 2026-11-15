export type MapBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MapView = { zoom: number; x: number; y: number };
export type MapSize = { width: number; height: number };
export const MIN_MAP_ZOOM = 1;
export const MAX_MAP_ZOOM = 4;
export const FULL_MAP_BOUNDS: MapBounds = {
  x: 0,
  y: 0,
  width: 1000,
  height: 1000,
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function fitMapView(bounds: MapBounds): MapView {
  return {
    zoom: MIN_MAP_ZOOM,
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

// Match the SVG viewport's aspect ratio so pointer coordinates also work in
// the space beside a fitted, non-square radar. Map coordinates stay unchanged.
export function mapViewBox(
  bounds: MapBounds,
  size: MapSize,
  view: MapView,
): MapBounds {
  const aspect =
    size.width > 0 && size.height > 0
      ? size.width / size.height
      : bounds.width / bounds.height;
  const width = Math.max(bounds.width, bounds.height * aspect) / view.zoom;
  const height = Math.max(bounds.height, bounds.width / aspect) / view.zoom;
  return { x: view.x - width / 2, y: view.y - height / 2, width, height };
}

export function boundMapView(
  bounds: MapBounds,
  size: MapSize,
  view: MapView,
): MapView {
  const zoom = clamp(view.zoom, MIN_MAP_ZOOM, MAX_MAP_ZOOM);
  const box = mapViewBox(bounds, size, { ...view, zoom });
  const fit = fitMapView(bounds);
  return {
    zoom,
    x:
      box.width >= bounds.width
        ? fit.x
        : clamp(
            view.x,
            bounds.x + box.width / 2,
            bounds.x + bounds.width - box.width / 2,
          ),
    y:
      box.height >= bounds.height
        ? fit.y
        : clamp(
            view.y,
            bounds.y + box.height / 2,
            bounds.y + bounds.height - box.height / 2,
          ),
  };
}

export function zoomMapView(
  bounds: MapBounds,
  size: MapSize,
  view: MapView,
  zoom: number,
  anchor = { x: 0.5, y: 0.5 },
): MapView {
  const nextZoom = clamp(zoom, MIN_MAP_ZOOM, MAX_MAP_ZOOM);
  const box = mapViewBox(bounds, size, view);
  const ratio = view.zoom / nextZoom;
  return boundMapView(bounds, size, {
    zoom: nextZoom,
    x: view.x + (anchor.x - 0.5) * box.width * (1 - ratio),
    y: view.y + (anchor.y - 0.5) * box.height * (1 - ratio),
  });
}

export function panMapView(
  bounds: MapBounds,
  size: MapSize,
  view: MapView,
  delta: { x: number; y: number },
): MapView {
  const box = mapViewBox(bounds, size, view);
  return boundMapView(bounds, size, {
    ...view,
    x: view.x - (delta.x * box.width) / Math.max(1, size.width),
    y: view.y - (delta.y * box.height) / Math.max(1, size.height),
  });
}
