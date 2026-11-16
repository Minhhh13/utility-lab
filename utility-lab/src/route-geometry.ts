import type { XY } from "./board-model.ts";

export type RouteGeometry = {
  points: XY[];
  hitPath: string;
  shaftPath: string;
  headPath: string;
  tip: XY | null;
  direction: XY | null;
  headBase: XY | null;
  headLength: number;
  headHalfWidth: number;
  strokeWidth: number;
  length: number;
  bounds: { x: number; y: number; width: number; height: number };
};

const number = (value: number) => String(Object.is(value, -0) ? 0 : value);
const pair = (point: XY) => `${number(point.x)} ${number(point.y)}`;
const distance = (a: XY, b: XY) => Math.hypot(b.x - a.x, b.y - a.y);
const along = (a: XY, b: XY, amount: number): XY => ({
  x: a.x + (b.x - a.x) * amount,
  y: a.y + (b.y - a.y) * amount,
});

/** Quadratic corner fillets remain inside the original segment triangle. */
function roundedPath(points: readonly XY[], radius = 11): string {
  if (!points.length) return "";
  if (points.length === 1) return `M ${pair(points[0])} L ${pair(points[0])}`;
  let path = `M ${pair(points[0])}`;
  for (let index = 1; index < points.length - 1; index++) {
    const before = points[index - 1], corner = points[index], after = points[index + 1];
    const incoming = distance(before, corner), outgoing = distance(corner, after);
    const cross = (corner.x - before.x) * (after.y - corner.y) -
      (corner.y - before.y) * (after.x - corner.x);
    if (!incoming || !outgoing || Math.abs(cross) < incoming * outgoing * 1e-8) {
      path += ` L ${pair(corner)}`;
      continue;
    }
    const inset = Math.min(radius, incoming / 2, outgoing / 2);
    const entry = along(corner, before, inset / incoming);
    const exit = along(corner, after, inset / outgoing);
    path += ` L ${pair(entry)} Q ${pair(corner)} ${pair(exit)}`;
  }
  return `${path} L ${pair(points[points.length - 1])}`;
}

/**
 * SVG-only route geometry: exact endpoints, an inline head, and no marker IDs.
 * Model coordinates are normally 0–1000. Reject non-renderable/corrupt samples
 * rather than emitting NaN, infinity, or an unbounded SVG path.
 */
export function routeGeometry(samples: readonly XY[] = []): RouteGeometry {
  const points: XY[] = [];
  for (const point of samples) {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) ||
      Math.abs(point.x) > 1_000_000 || Math.abs(point.y) > 1_000_000) continue;
    const last = points[points.length - 1];
    if (!last || point.x !== last.x || point.y !== last.y) points.push({ x: point.x, y: point.y });
  }
  const empty: RouteGeometry = {
    points, hitPath: roundedPath(points), shaftPath: "", headPath: "",
    tip: points.at(-1) || null, direction: null, headBase: null,
    headLength: 0, headHalfWidth: 0, strokeWidth: 0, length: 0,
    bounds: { x: points[0]?.x || 0, y: points[0]?.y || 0, width: 0, height: 0 },
  };
  if (points.length < 2) return empty;

  const tip = points[points.length - 1], previous = points[points.length - 2];
  const terminalLength = distance(previous, tip);
  const length = points.slice(1).reduce((total, point, index) => total + distance(points[index], point), 0);
  if (!terminalLength || !length) return empty;
  const direction = { x: (tip.x - previous.x) / terminalLength, y: (tip.y - previous.y) / terminalLength };
  // Ordinary routes have a 4.5-unit shaft and a 16×14-unit head. A short
  // route/terminal segment scales as a whole so a round cap cannot pass its tip.
  const scale = Math.min(1, length / 26, terminalLength / 18);
  const strokeWidth = 4.5 * scale, headLength = 16 * scale, headHalfWidth = 7 * scale;
  const headBase = { x: tip.x - direction.x * headLength, y: tip.y - direction.y * headLength };
  const left = { x: headBase.x - direction.y * headHalfWidth, y: headBase.y + direction.x * headHalfWidth };
  const right = { x: headBase.x + direction.y * headHalfWidth, y: headBase.y - direction.x * headHalfWidth };
  const overlap = strokeWidth * 0.55;
  const shaftEnd = { x: headBase.x + direction.x * overlap, y: headBase.y + direction.y * overlap };
  const shaftPoints = [...points.slice(0, -1), shaftEnd];
  const halfStroke = strokeWidth / 2;
  const minX = Math.min(...points.map(point => point.x - halfStroke), left.x, right.x);
  const minY = Math.min(...points.map(point => point.y - halfStroke), left.y, right.y);
  const maxX = Math.max(...points.map(point => point.x + halfStroke), left.x, right.x);
  const maxY = Math.max(...points.map(point => point.y + halfStroke), left.y, right.y);
  return {
    points, hitPath: roundedPath(points), shaftPath: roundedPath(shaftPoints),
    headPath: `M ${pair(tip)} L ${pair(left)} L ${pair(right)} Z`,
    tip, direction, headBase, headLength, headHalfWidth, strokeWidth, length,
    bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
  };
}
