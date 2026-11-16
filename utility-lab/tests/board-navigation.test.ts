import test from "node:test";
import assert from "node:assert/strict";
import { FIT_VIEW, boundView, fitView, focusView, MAX_ZOOM, panView, zoomView, viewBox, type BoardView, type MapFrame } from "../src/board-navigation.ts";
import type { XY } from "../src/board-model.ts";

test("cursor zoom retains the same map point and pan cannot lose the map", () => {
  const next = zoomView(FIT_VIEW, 2, { x: 650, y: 450 });
  assert.deepEqual(next, { x: 575, y: 475, zoom: 2 });
  assert.equal((650 - next.x) * next.zoom, (650 - FIT_VIEW.x) * FIT_VIEW.zoom);
  assert.deepEqual(panView(next, 99999, -99999), { x: 850, y: 150, zoom: 2 });
  assert.deepEqual(boundView({ x: Infinity, y: NaN, zoom: Infinity }), FIT_VIEW);
  assert.deepEqual(zoomView(next, 0.1), { x: 575, y: 475, zoom: 0.75 });
  assert.equal(viewBox(FIT_VIEW), "0 0 1000 1000");
});

test("rectangular map artwork keeps its fit frame and cursor anchor during navigation", () => {
  const frame = { x: 80, y: 130, width: 860, height: 746 };
  const fit = fitView(frame);
  assert.deepEqual(fit, { x: 510, y: 503, zoom: 1 });
  assert.equal(viewBox(fit, frame), "80 130 860 746");
  const zoom = zoomView(fit, 2, { x: 600, y: 450 }, frame);
  assert.deepEqual(zoom, { x: 555, y: 476.5, zoom: 2 });
  assert.deepEqual(panView(zoom, -9999, 9999, frame), { x: 209, y: 764.1, zoom: 2 });
});

test("Fit can pan while bounds keep most of the artwork visible and reset restores it", () => {
  const panned = panView(FIT_VIEW, 100000, 100000);
  assert.deepEqual(panned, { x: 700, y: 700, zoom: 1 });
  const visibleWidth = 1000 - (panned.x - 500);
  const visibleHeight = 1000 - (panned.y - 500);
  assert.ok(visibleWidth * visibleHeight >= 1000 * 1000 * .64);
  assert.notEqual(viewBox(panned), viewBox(FIT_VIEW));
  assert.equal(viewBox(FIT_VIEW), "0 0 1000 1000");
});

function screenPoint(point: XY, view: BoardView, frame: MapFrame, viewport: {width: number; height: number}) {
  const unit = Math.max(frame.width / viewport.width, frame.height / viewport.height);
  return {x: viewport.width / 2 + (point.x - view.x) * view.zoom / unit,
    y: viewport.height / 2 + (point.y - view.y) * view.zoom / unit};
}
function withinPadding(points: XY[], view: BoardView, frame: MapFrame, viewport: {width: number; height: number}, padding = 48) {
  for (const point of points) {
    const screen = screenPoint(point, view, frame, viewport);
    assert.ok(screen.x >= padding - 1e-6 && screen.x <= viewport.width - padding + 1e-6);
    assert.ok(screen.y >= padding - 1e-6 && screen.y <= viewport.height - padding + 1e-6);
  }
}

test("focus frames a landing set with real CSS-pixel padding and preserves the map aspect ratio", () => {
  const frame = {x: 0, y: 0, width: 1000, height: 1000};
  const viewport = {width: 800, height: 600};
  const points = [{x: 300, y: 350}, {x: 700, y: 650}];
  const before = JSON.stringify(points);
  const focused = focusView(points, frame, viewport, 60);
  assert.equal(focused.x, 500); assert.equal(focused.y, 500);
  assert.ok(Math.abs(focused.zoom - 8 / 3) < 1e-10);
  withinPadding(points, focused, frame, viewport, 60);
  const [, , width, height] = viewBox(focused, frame).split(" ").map(Number);
  assert.equal(width / height, frame.width / frame.height);
  assert.equal(JSON.stringify(points), before);
});

test("rectangular maps focus correctly in both wide and tall SVG letterboxes without stretching", () => {
  const frame = {x: 44, y: 247, width: 954, height: 520};
  for (const viewport of [{width: 1200, height: 400}, {width: 320, height: 650}]) {
    for (const points of [
      [{x: 260, y: 550}, {x: 760, y: 500}],
      [{x: 500, y: 320}, {x: 500, y: 680}],
    ]) {
      const focused = focusView(points, frame, viewport);
      withinPadding(points, focused, frame, viewport);
      const [, , width, height] = viewBox(focused, frame).split(" ").map(Number);
      assert.ok(Math.abs(width / height - frame.width / frame.height) < 1e-10);
      assert.ok(focused.zoom >= 1 && focused.zoom <= MAX_ZOOM);
    }
  }
});

test("a singleton or coincident set honours the camera cap while later manual zoom remains available", () => {
  const points = [{x: 600, y: 400}, {x: 600, y: 400}];
  const frame = {x: 0, y: 0, width: 1000, height: 1000};
  const viewport = {width: 1000, height: 700};
  assert.equal(focusView(points, frame, viewport).zoom, 4);
  const destinationCamera = focusView(points, frame, viewport, 48, 2.25);
  assert.deepEqual(destinationCamera, {x: 600, y: 400, zoom: 2.25});
  withinPadding(points, destinationCamera, frame, viewport);
  assert.equal(focusView(points, frame, viewport, 48, 2).zoom, 2);
  assert.equal(zoomView(destinationCamera, MAX_ZOOM, points[0], frame).zoom, 4);
  assert.equal(focusView(points, frame, viewport, 48, 1000).zoom, 4);
  assert.equal(focusView(points, frame, viewport, 48, -1).zoom, 1);
});

test("focus stays bounded near map edges and safely handles empty or invalid point data", () => {
  const frame = {x: 0, y: 0, width: 1000, height: 1000};
  const viewport = {width: 1000, height: 1000};
  assert.deepEqual(focusView([{x: 0, y: 0}], frame, viewport), {x: 75, y: 75, zoom: 4});
  assert.deepEqual(focusView([{x: 1000, y: 1000}], frame, viewport), {x: 925, y: 925, zoom: 4});
  withinPadding([{x: 0, y: 0}], focusView([{x: 0, y: 0}], frame, viewport), frame, viewport);
  assert.deepEqual(focusView([], frame, viewport), FIT_VIEW);
  assert.deepEqual(focusView([{x: NaN, y: 200}, {x: 400, y: Infinity}], frame, viewport), FIT_VIEW);
  const valid = {x: 600, y: 400};
  assert.deepEqual(focusView([valid, {x: NaN, y: 200}], frame, viewport), focusView([valid], frame, viewport));
  assert.deepEqual(focusView([valid], frame, {width: 0, height: NaN}, NaN, NaN), focusView([valid], frame, frame));
  const hugePadding = focusView([valid], frame, {width: 320, height: 100}, 99999);
  assert.ok(Object.values(hugePadding).every(Number.isFinite));
  assert.ok(hugePadding.zoom >= 1 && hugePadding.zoom <= 4);
});

test("focused views keep subsequent cursor-anchored zoom and direct pan continuous", () => {
  const focused = focusView([{x: 450, y: 400}, {x: 600, y: 600}]);
  const anchor = {x: 600, y: 400};
  const zoomed = zoomView(focused, 2, anchor);
  assert.equal((anchor.x - focused.x) * focused.zoom, (anchor.x - zoomed.x) * zoomed.zoom);
  assert.equal((anchor.y - focused.y) * focused.zoom, (anchor.y - zoomed.y) * zoomed.zoom);
  const moved = panView(zoomed, 20, -30);
  assert.deepEqual(moved, {...zoomed, x: zoomed.x + 20, y: zoomed.y - 30});
  assert.deepEqual(fitView({x: 0, y: 0, width: 1000, height: 1000}), FIT_VIEW);
});
