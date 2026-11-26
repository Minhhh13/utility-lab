type Point = { x: number; y: number };
type Segment = { start: Point; end: Point };

const EPSILON = 1e-8;
const samePoint = (first: Point, second: Point) => first.x === second.x && first.y === second.y;
const turn = (a: Point, b: Point, c: Point) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
const orientation = (a: Point, b: Point, c: Point) => {
  const determinant = turn(a, b, c);
  return Math.abs(determinant) < EPSILON ? 0 : Math.sign(determinant);
};
const inBounds = (a: Point, b: Point, p: Point) =>
  p.x >= Math.min(a.x, b.x) - EPSILON && p.x <= Math.max(a.x, b.x) + EPSILON &&
  p.y >= Math.min(a.y, b.y) - EPSILON && p.y <= Math.max(a.y, b.y) + EPSILON;

function conflictingLeaders(first: Segment, second: Segment) {
  const { start: a, end: b } = first;
  const { start: c, end: d } = second;
  const abc = orientation(a, b, c), abd = orientation(a, b, d);
  if (samePoint(a, c)) {
    // Recipes may meet at their real shared dot, but cannot travel along the same ray.
    return abd === 0 && (b.x - a.x) * (d.x - a.x) + (b.y - a.y) * (d.y - a.y) > 0;
  }
  const cda = orientation(c, d, a), cdb = orientation(c, d, b);
  return (abc * abd < 0 && cda * cdb < 0) ||
    (abc === 0 && inBounds(a, b, c)) || (abd === 0 && inBounds(a, b, d)) ||
    (cda === 0 && inBounds(c, d, a)) || (cdb === 0 && inBounds(c, d, b));
}

function obscuresDot({ start, end }: Segment, dot: Point) {
  if (samePoint(start, dot)) return false;
  const dx = end.x - start.x, dy = end.y - start.y;
  const t = Math.max(0, Math.min(1,
    ((dot.x - start.x) * dx + (dot.y - start.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(start.x + t * dx - dot.x, start.y + t * dy - dot.y) < 4.5;
}

// A segment and an axis-aligned rectangle are separated by an x/y edge
// or by the segment's own normal. Include the entire button's hit area.
function touchesBox({ start, end }: Segment, x: number, y: number, halfW: number, halfH: number) {
  if (Math.max(start.x, end.x) < x - halfW || Math.min(start.x, end.x) > x + halfW ||
    Math.max(start.y, end.y) < y - halfH || Math.min(start.y, end.y) > y + halfH) return false;
  const dx = end.x - start.x, dy = end.y - start.y;
  return Math.abs(dx * (y - start.y) - dy * (x - start.x)) <= Math.abs(dx) * halfH + Math.abs(dy) * halfW;
}

function obscuresBadge(edge: Segment, slot: Point, width: number) {
  if (touchesBox(edge, slot.x, slot.y, 28, 22)) return true;
  const above = slot.y < width * 0.4;
  const side = !above && slot.y < width * 0.6;
  const shift = side && slot.x < width * 0.4 ? -13 : side && slot.x > width * 0.6 ? 13 : 0;
  return touchesBox(edge, slot.x + shift, slot.y + (above ? -42.5 : 42.5), shift ? 30 : 40, 16.5);
}

/**
 * Match the page's actual anchors to distinct perimeter buttons in screen space.
 * With anchors inside the square and buttons on its boundary a noncrossing matching
 * exists: swapping the ends of crossing straight segments shortens their total length.
 * Explicit intersection checks also exclude collinear overlaps and T-junctions.
 * Among clear matches prefer unobscured dots/controls, then the shortest total length.
 */
export function layoutOriginSpokes(
  sources: readonly Point[], slots: readonly Point[],
  width = Math.min(...slots.map(slot => slot.x)) + Math.max(...slots.map(slot => slot.x)),
): Point[] {
  if (!sources.length) return [];
  if (sources.length > slots.length || slots.length > 8) throw new RangeError("A chooser page needs one to eight unique badge slots.");
  const dots = sources.filter((dot, i) => !sources.slice(0, i).some(other => samePoint(dot, other)));
  const edges = sources.map(start => slots.map(end => {
    const segment = { start, end };
    return {
      ...segment, length: Math.hypot(start.x - end.x, start.y - end.y),
      coveredDots: dots.filter(dot => obscuresDot(segment, dot)).length,
      coveredSlots: slots.map(slot => Number(obscuresBadge(segment, slot, width))),
    };
  }));
  const earlierDuplicate = sources.map((source, i) => {
    for (let j = i - 1; j >= 0; j--) if (samePoint(source, sources[j])) return j;
    return -1;
  });
  let bestConflicts = Infinity, bestObstructions = Infinity, bestLength = Infinity;
  let best: number[] = [];
  const chosen: number[] = [];
  function search(used: number, conflicts: number, obstructions: number, length: number) {
    if (conflicts > bestConflicts || (conflicts === bestConflicts &&
      (obstructions > bestObstructions || (obstructions === bestObstructions && length >= bestLength - EPSILON)))) return;
    const i = chosen.length;
    if (i === sources.length) {
      best = chosen.slice();
      bestConflicts = conflicts;
      bestObstructions = obstructions;
      bestLength = length;
      return;
    }
    for (let slot = 0; slot < slots.length; slot++) {
      // Identical source positions are interchangeable. Preserve option order for this tie.
      if ((used & (1 << slot)) || (earlierDuplicate[i] >= 0 && slot < chosen[earlierDuplicate[i]])) continue;
      const edge = edges[i][slot];
      let nextConflicts = conflicts, nextObstructions = obstructions + edge.coveredDots;
      for (let j = 0; j < i; j++) {
        const previous = edges[j][chosen[j]];
        if (conflictingLeaders(edge, previous)) nextConflicts++;
        nextObstructions += edge.coveredSlots[chosen[j]] + previous.coveredSlots[slot];
      }
      chosen.push(slot);
      search(used | (1 << slot), nextConflicts, nextObstructions, length + edge.length);
      chosen.pop();
    }
  }
  search(0, 0, 0, 0);
  return best.map(slot => slots[slot]);
}
