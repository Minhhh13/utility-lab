import test from "node:test";
import assert from "node:assert/strict";
import { routeGeometry } from "../src/route-geometry.ts";

const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} ≠ ${expected}`);

test("cardinal and diagonal arrowheads keep their exact tip and face the final segment", () => {
  for (const [x, y] of [[100, 0], [-100, 0], [0, 100], [0, -100], [100, 100], [-100, 100], [100, -100], [-100, -100]]) {
    const start = { x: 400, y: 400 }, tip = { x: 400 + x, y: 400 + y };
    const route = routeGeometry([start, tip]);
    assert.deepEqual(route.tip, tip);
    close(route.direction!.x, x / Math.hypot(x, y));
    close(route.direction!.y, y / Math.hypot(x, y));
    close(Math.hypot(tip.x - route.headBase!.x, tip.y - route.headBase!.y), route.headLength);
    assert.match(route.headPath, new RegExp(`^M ${tip.x} ${tip.y} L `));
    assert.equal(route.strokeWidth, 4.5);
    assert.doesNotMatch(route.shaftPath, /NaN|Infinity/);
  }
});

test("a bent route rounds inside its recorded corner and aims along its last leg", () => {
  const points = [{ x: 10, y: 10 }, { x: 100, y: 10 }, { x: 100, y: 100 }];
  const route = routeGeometry(points);
  assert.match(route.shaftPath, /L 89 10 Q 100 10 100 21/);
  assert.deepEqual(route.direction, { x: 0, y: 1 });
  assert.deepEqual(route.tip, points[2]);
  assert.equal(route.headBase!.x, 100);
  assert.ok(route.headBase!.y < 100);
  assert.doesNotMatch(route.shaftPath, /C /);
  assert.equal(route.hitPath, "M 10 10 L 89 10 Q 100 10 100 21 L 100 100");
});

test("very short arrows shrink proportionately, with the shaft cap inside the fixed head", () => {
  const ordinary = routeGeometry([{ x: 0, y: 0 }, { x: 100, y: 0 }]);
  for (const length of [0.00001, 0.1, 1, 4, 12]) {
    const route = routeGeometry([{ x: 0, y: 0 }, { x: length, y: 0 }]);
    assert.deepEqual(route.tip, { x: length, y: 0 });
    assert.ok(route.headLength > 0 && route.headLength < length);
    assert.ok(route.headHalfWidth < ordinary.headHalfWidth);
    assert.ok(route.strokeWidth < ordinary.strokeWidth);
    const capEnd = route.headBase!.x + route.strokeWidth * 0.55 + route.strokeWidth / 2;
    assert.ok(capEnd < length, "rounded shaft cannot extend past the arrow tip");
    assert.ok(Object.values(route.bounds).every(Number.isFinite));
  }
});

test("duplicate points retain the final distinct direction without mutating user data", () => {
  const points = [{ x: 20, y: 30 }, { x: 20, y: 30 }, { x: 80, y: 30 }, { x: 80, y: 90 }, { x: 80, y: 90 }];
  const before = JSON.stringify(points), route = routeGeometry(points);
  assert.equal(route.points.length, 3);
  assert.deepEqual(route.tip, { x: 80, y: 90 });
  assert.deepEqual(route.direction, { x: 0, y: 1 });
  assert.equal(JSON.stringify(points), before);
  assert.deepEqual(routeGeometry(route.points), route);
});

test("empty, coincident, nonfinite, and corrupt extreme routes remain finite and have no invented head", () => {
  for (const points of [[], [{ x: 50, y: 50 }], [{ x: 50, y: 50 }, { x: 50, y: 50 }], [{ x: NaN, y: 0 }, { x: 20, y: Infinity }], [{ x: 1e308, y: 0 }, { x: -1e308, y: 0 }]]) {
    const route = routeGeometry(points);
    assert.equal(route.headPath, "");
    assert.equal(route.shaftPath, "");
    assert.ok(Object.values(route.bounds).every(Number.isFinite));
    assert.doesNotMatch(route.hitPath, /NaN|Infinity/);
  }
});

test("a short final leg or exact reversal stays bounded and gives the tip its last recorded direction", () => {
  for (const points of [
    [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 0.05 }],
    [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 20, y: 0 }],
  ]) {
    const route = routeGeometry(points);
    assert.deepEqual(route.tip, points.at(-1));
    assert.ok(route.headLength > 0);
    assert.ok(Object.values(route.bounds).every(Number.isFinite));
    assert.doesNotMatch(route.shaftPath + route.headPath, /NaN|Infinity/);
    const penultimate = points.at(-2)!, last = points.at(-1)!;
    close(route.direction!.x, (last.x - penultimate.x) / Math.hypot(last.x - penultimate.x, last.y - penultimate.y));
    close(route.direction!.y, (last.y - penultimate.y) / Math.hypot(last.x - penultimate.x, last.y - penultimate.y));
  }
});
