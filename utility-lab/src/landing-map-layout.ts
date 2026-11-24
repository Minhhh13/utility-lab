import type { MarkerLayoutBounds, UtilityMarkerGroup } from "./utility-markers.ts";

type Point = { x: number; y: number };
export type LandingLabel = { group: UtilityMarkerGroup; name: string; ordinal?: number };
export type LandingCallout = LandingLabel & { point: Point; center: Point };
export type LayoutObstacle = MarkerLayoutBounds;
const touchHeight = 44;
const gap = 6;

/** Duplicate publisher callouts still denote different landing points. Number
 * those points in radar reading order, independent of the current camera. */
export function nameLandingSpots(groups: readonly UtilityMarkerGroup[]): LandingLabel[] {
  const duplicates = new Map<string, UtilityMarkerGroup[]>();
  for (const group of groups) {
    const key = group.label.trim().toLowerCase();
    const family = duplicates.get(key) || [];
    family.push(group);
    duplicates.set(key, family);
  }
  const ordinals = new Map<string, number>();
  for (const family of duplicates.values()) {
    if (family.length > 1) family.sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id))
      .forEach((group, index) => ordinals.set(group.id, index + 1));
  }
  return groups.map(group => ({ group, name: group.label, ordinal: ordinals.get(group.id) }));
}

// Anchor the lattice to the landing area so the chips pan with its dots.
function gridAxis(anchor: number, extent: number, size: number, spacing = gap) {
  const first = size / 2 + 3, last = extent - first, step = size + spacing;
  if (last < first) return [extent / 2];
  const axis: number[] = [];
  const start = anchor + Math.ceil((first - anchor) / step) * step;
  for (let value = start; value <= last; value += step) axis.push(value);
  if (!axis.length) return [Math.max(first, Math.min(last, anchor))];
  return axis;
}

function overlapsCell(center: Point, width: number, rect: LayoutObstacle) {
  return center.x + width / 2 > rect.x - 3 && center.x - width / 2 < rect.x + rect.width + 3 &&
    center.y + touchHeight / 2 > rect.y - 3 && center.y - touchHeight / 2 < rect.y + rect.height + 3;
}

function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }

/** All layout calculations use CSS pixels in the SVG viewport. Registered map
 * coordinates stay on the guide. Only the named controls move apart. */
export function layoutLandingSpots(
  labels: readonly LandingLabel[], bounds: MarkerLayoutBounds, unit: number,
  requestedWidth: number, obstacles: readonly LayoutObstacle[], requestedPage = 0,
) {
  const width = bounds.width / unit, height = bounds.height / unit;
  const chipWidth = Math.min(requestedWidth, Math.max(48, (width - 12) / 2));
  const empty = { callouts: [] as LandingCallout[], chipWidth, pager: null as Point | null, page: 0, pages: 1 };
  if (!(unit > 0 && Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0)) return empty;
  const visible = labels.map(label => ({ ...label, point: {
    x: (label.group.x - bounds.x) / unit, y: (label.group.y - bounds.y) / unit,
  } })).filter(({ point }) => point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height);
  if (!visible.length) return empty;
  const center = {
    x: (Math.min(...visible.map(item => item.point.x)) + Math.max(...visible.map(item => item.point.x))) / 2,
    y: (Math.min(...visible.map(item => item.point.y)) + Math.max(...visible.map(item => item.point.y))) / 2,
  };
  const spread = Math.max(...visible.map(item => item.point.x)) - Math.min(...visible.map(item => item.point.x));
  const corridor = Math.max(gap, Math.min(90, spread + 24, width - 2 * chipWidth - 12));
  const makeGrid = (x: number, y: number, spacing: number) => {
    const cols = gridAxis(x, width, chipWidth, spacing), rows = gridAxis(y, height, touchHeight);
    return rows.flatMap(y => cols.map(x => ({ x, y }))).filter(cell => !obstacles.some(rect => overlapsCell(cell, chipWidth, rect)));
  };
  let cells = makeGrid(center.x + (chipWidth + corridor) / 2, center.y, corridor);
  // An edge rail or phone toolbar can consume a whole column in an unlucky
  // phase. Use the viewport-centred lattice when it exposes more choices.
  if (cells.length < visible.length) {
    const alternate = makeGrid(chipWidth / 2 + 3, touchHeight / 2 + 3, gap);
    if (alternate.length > cells.length) cells = alternate;
  }
  if (cells.length < 2) {
    // Tightly inset and short landscape viewports can have usable space
    // between grid rows. Repack from the edge so one centred cell cannot
    // block two buttons that would fit side by side.
    const packed: Point[] = [];
    for (let y = 22; y <= height - 22; y += 8) for (let x = chipWidth / 2; x <= width - chipWidth / 2; x += 8) {
      const cell = { x, y };
      if (!obstacles.some(rect => overlapsCell(cell, chipWidth, rect)) &&
          !packed.some(old => Math.abs(old.x - x) < chipWidth + gap && Math.abs(old.y - y) < touchHeight + gap))
        packed.push(cell);
    }
    if (packed.length > cells.length) cells = packed;
  }
  if (!cells.length) return empty;
  const limit = width < 601 ? 6 : 10;
  const needsPages = visible.length > Math.min(limit, cells.length);
  const capacity = Math.max(1, Math.min(limit, cells.length - Number(needsPages)));
  const pages = Math.ceil(visible.length / capacity), page = Math.max(0, Math.min(requestedPage, pages - 1));
  const choices = visible.slice(page * capacity, (page + 1) * capacity);
  let pager: Point | null = null;
  if (pages > 1) {
    // Keep the page controls at the same place on every page.
    const preferred = { x: center.x, y: center.y + (Math.ceil(capacity / 2) + 1) * (touchHeight + gap) / 2 };
    if (cells.length > 1) {
      cells.sort((a, b) => distance(a, preferred) - distance(b, preferred));
      pager = cells.shift()!;
    } else pager = { x: cells[0].x, y: Math.max(22, Math.min(height - 22, cells[0].y + touchHeight + gap)) };
  }
  // Prefer positions that expose all exact dots. When space is tight, let
  // controls use the remaining cells so every point still has a usable action.
  const coversDot = (cell: Point) => visible.some(({ point }) =>
    Math.abs(cell.x - point.x) <= chipWidth / 2 + 6 && Math.abs(cell.y - point.y) <= 19);
  const openCells = cells.filter(cell => !coversDot(cell));
  const available = openCells.length >= choices.length ? [...openCells] : [...cells];
  const callouts = choices.map(choice => {
    let best = 0;
    for (let index = 1; index < available.length; index++) {
      if (distance(available[index], choice.point) < distance(available[best], choice.point)) best = index;
    }
    return { ...choice, center: available.splice(best, 1)[0] };
  });
  // Uncross leaders: two crossing straight segments always shorten when
  // their ends are exchanged. Locations and focus order stay unchanged.
  for (let pass = 0; pass < callouts.length; pass++) {
    let swapped = false;
    for (let i = 0; i < callouts.length; i++) for (let j = i + 1; j < callouts.length; j++) {
      const a = callouts[i], b = callouts[j];
      if (distance(a.point, b.center) + distance(b.point, a.center) + .1 <
          distance(a.point, a.center) + distance(b.point, b.center)) {
        [a.center, b.center] = [b.center, a.center];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return { callouts, chipWidth, pager, page, pages };
}
