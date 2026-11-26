import test from "node:test";
import assert from "node:assert/strict";
import { CROSSHAIR_KEY, DEFAULT_CROSSHAIR, readCrosshairSettings, saveCrosshairSettings } from "../src/crosshair-settings.ts";

test("crosshair settings preserve the default and safely recover individual invalid fields", () => {
  const get = (value: string | null) => readCrosshairSettings({ getItem: () => value });
  assert.deepEqual(get(null), DEFAULT_CROSSHAIR);
  assert.deepEqual(get(null), { shape: "cross", color: "#4dffd1", size: 34 });
  assert.deepEqual(get('{"shape":"reticle","color":"#4dffd1","size":34}'), { shape: "reticle", color: "#4dffd1", size: 34 });
  assert.deepEqual(get("invalid JSON"), DEFAULT_CROSSHAIR);
  assert.deepEqual(get('{"shape":"dot","color":"#ABCDEF","size":10000}'), { shape: "dot", color: "#abcdef", size: 34 });
  assert.deepEqual(get('{"shape":"invalid","color":"url(https://example.org)","size":14}'), { ...DEFAULT_CROSSHAIR, size: 14 });
});

test("crosshair settings round-trip locally and report unavailable storage", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const settings = { shape: "cross" as const, size: 56, color: "#ff0099" };
  assert.equal(saveCrosshairSettings(settings, storage), true);
  assert.deepEqual([...values.keys()], [CROSSHAIR_KEY]);
  assert.deepEqual(readCrosshairSettings(storage), settings);
  assert.equal(saveCrosshairSettings(settings, { setItem: () => { throw Error("Unavailable"); } }), false);
  assert.deepEqual(readCrosshairSettings({ getItem: () => { throw Error("Unavailable"); } }), DEFAULT_CROSSHAIR);
});
