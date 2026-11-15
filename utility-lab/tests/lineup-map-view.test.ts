import test from "node:test";
import assert from "node:assert/strict";
import {
  boundMapView,
  fitMapView,
  mapViewBox,
  panMapView,
  zoomMapView,
  MAX_MAP_ZOOM,
  MIN_MAP_ZOOM,
  type MapBounds,
  type MapSize,
} from "../src/lineup-map-view.ts";

const mirage: MapBounds = { x: 80, y: 130, width: 860, height: 746 };
const square = { width: 700, height: 700 };
const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} ≠ ${expected}`);

test("fit keeps the complete radar visible in wide, short, and phone viewports", () => {
  for (const size of [
    { width: 960, height: 350 },
    { width: 600, height: 240 },
    { width: 320, height: 450 },
    { width: 0, height: 0 },
  ]) {
    const box = mapViewBox(mirage, size, fitMapView(mirage));
    assert.ok(box.x <= mirage.x + 0.000001);
    assert.ok(box.y <= mirage.y + 0.000001);
    assert.ok(box.x + box.width >= mirage.x + mirage.width - 0.000001);
    assert.ok(box.y + box.height >= mirage.y + mirage.height - 0.000001);
    if (size.width && size.height)
      close(box.width / box.height, size.width / size.height);
  }
});

test("cursor zoom preserves the same map point under the pointer when space permits", () => {
  const anchor = { x: 0.65, y: 0.35 };
  const initial = zoomMapView(mirage, square, fitMapView(mirage), 2);
  const before = mapViewBox(mirage, square, initial);
  const next = zoomMapView(mirage, square, initial, 3, anchor);
  const after = mapViewBox(mirage, square, next);
  close(before.x + before.width * anchor.x, after.x + after.width * anchor.x);
  close(before.y + before.height * anchor.y, after.y + after.height * anchor.y);
});

test("zoom limits and fit recover the whole map after zooming and panning", () => {
  const fit = fitMapView(mirage);
  assert.equal(zoomMapView(mirage, square, fit, 100).zoom, MAX_MAP_ZOOM);
  const moved = panMapView(
    mirage,
    square,
    zoomMapView(mirage, square, fit, 4),
    { x: 200, y: -120 },
  );
  const restored = zoomMapView(mirage, square, moved, 0.1);
  assert.equal(restored.zoom, MIN_MAP_ZOOM);
  assert.deepEqual(restored, fit);
});

test("drag distance follows CSS pixels at the current zoom without moving lineup coordinates", () => {
  const initial = zoomMapView(mirage, square, fitMapView(mirage), 2);
  const box = mapViewBox(mirage, square, initial);
  const next = panMapView(mirage, square, initial, { x: 24, y: -36 });
  close(next.x, initial.x - (24 * box.width) / square.width);
  close(next.y, initial.y + (36 * box.height) / square.height);
  assert.equal(next.zoom, initial.zoom);
  assert.deepEqual(mirage, { x: 80, y: 130, width: 860, height: 746 });
});

test("panning stops at radar edges and a resize cannot leave the radar lost off screen", () => {
  const zoomed = zoomMapView(mirage, square, fitMapView(mirage), 4);
  for (const delta of [
    { x: 100_000, y: 100_000 },
    { x: -100_000, y: -100_000 },
  ]) {
    const moved = panMapView(mirage, square, zoomed, delta);
    for (const size of [
      square,
      { width: 1200, height: 200 },
      { width: 280, height: 600 },
    ]) {
      const bounded = boundMapView(mirage, size, moved);
      const box = mapViewBox(mirage, size, bounded);
      assert.ok(box.x <= mirage.x + mirage.width);
      assert.ok(box.y <= mirage.y + mirage.height);
      assert.ok(box.x + box.width >= mirage.x);
      assert.ok(box.y + box.height >= mirage.y);
    }
  }
});

test("wide upper floors and raster lower floors fit independently", () => {
  const floors: MapBounds[] = [
    { x: 44, y: 247, width: 954, height: 520 },
    { x: 0, y: 0, width: 1000, height: 1000 },
  ];
  const size: MapSize = { width: 800, height: 400 };
  for (const floor of floors) {
    const fit = fitMapView(floor);
    const zoomed = zoomMapView(floor, size, fit, 3, { x: 0.2, y: 0.8 });
    assert.deepEqual(zoomMapView(floor, size, zoomed, 1), fit);
    assert.equal(
      mapViewBox(floor, size, fit).width / mapViewBox(floor, size, fit).height,
      2,
    );
  }
});
