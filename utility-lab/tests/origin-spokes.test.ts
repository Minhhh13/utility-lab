import test from "node:test";
import assert from "node:assert/strict";
import { layoutOriginSpokes } from "../src/origin-options.ts";

type Point = { x: number; y: number };
const p = (x: number, y: number): Point => ({ x, y });
const ring = [p(164, 44), p(284, 44), p(284, 164), p(284, 284), p(164, 284), p(44, 284), p(44, 164), p(44, 44)];
const cardinal = ring.filter((_, i) => i % 2 === 0);

function verifyRouting(sources: Point[], destinations: Point[], candidates: Point[]) {
  assert.equal(destinations.length, sources.length);
  assert.equal(new Set(destinations).size, sources.length);
  assert.ok(destinations.every(dest => candidates.includes(dest)), "Only actual badge slots are usable");
  // Test segment parameters independently from the orientation test in the layout.
  const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x;
  const sub = (a: Point, b: Point) => p(a.x - b.x, a.y - b.y);
  const epsilon = 1e-9;
  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      const a = sources[i], b = destinations[i], c = sources[j], d = destinations[j];
      const r = sub(b, a), s = sub(d, c), offset = sub(c, a);
      const denominator = cross(r, s);
      const shared = a.x === c.x && a.y === c.y;
      if (Math.abs(denominator) > epsilon) {
        const t = cross(offset, s) / denominator, u = cross(offset, r) / denominator;
        if (shared) assert.ok(Math.abs(t) < epsilon && Math.abs(u) < epsilon);
        else assert.ok(t < -epsilon || t > 1 + epsilon || u < -epsilon || u > 1 + epsilon, "Leaders cannot cross or cover a different source");
      } else if (Math.abs(cross(r, offset)) < epsilon) {
        const axis = Math.abs(r.x) > Math.abs(r.y) ? "x" : "y";
        const overlap = Math.min(Math.max(a[axis], b[axis]), Math.max(c[axis], d[axis])) -
          Math.max(Math.min(a[axis], b[axis]), Math.min(c[axis], d[axis]));
        assert.ok(shared ? overlap <= epsilon : overlap < -epsilon, "Collinear leaders can only meet at a shared origin");
      }
    }
  }
}

test("four choices listed in reverse spatial order connect to their own nearest perimeter badges", () => {
  const sources = [p(145, 164), p(164, 182), p(183, 164), p(164, 145)];
  const before = structuredClone(sources);
  const destinations = layoutOriginSpokes(sources, cardinal, 328);
  assert.deepEqual(destinations, [cardinal[3], cardinal[2], cardinal[1], cardinal[0]]);
  verifyRouting(sources, destinations, cardinal);
  assert.deepEqual(sources, before);
});

test("all eight coincident options fan from one exact point without sharing a length of leader", () => {
  const sources = Array.from({ length: 8 }, () => p(181.25, 152.5));
  const destinations = layoutOriginSpokes(sources, ring, 328);
  assert.deepEqual(destinations, ring, "Equal-position ties follow the original recipe order");
  verifyRouting(sources, destinations, ring);
});

test("collinear, near-collinear and mixed collocated anchors on the same page have no crossings or T-junctions", () => {
  const values = [12, 0, -12, 24, -24, 0, 24, -36];
  for (const transform of [
    (v: number) => p(164 + v, 164),
    (v: number) => p(164, 164 - v),
    (v: number) => p(164 - v, 164 + v),
    (v: number) => p(164 + v, 164 + v / 100000),
  ]) {
    const sources = values.map(transform);
    const destinations = layoutOriginSpokes(sources, ring, 328);
    verifyRouting(sources, destinations, ring);
    assert.deepEqual(destinations, layoutOriginSpokes(sources, ring, 328));
  }
});

test("each page selects distinct visible slots, including partial pages and singleton remainders", () => {
  let state = 31;
  const sample = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return 115 + state % 100;
  };
  for (let count = 1; count <= 8; count++) {
    for (let trial = 0; trial < 20; trial++) {
      const sources = Array.from({ length: count }, () => p(sample(), sample()));
      verifyRouting(sources, layoutOriginSpokes(sources, ring, 328), ring);
    }
  }
  assert.deepEqual(layoutOriginSpokes([], []), []);
});
