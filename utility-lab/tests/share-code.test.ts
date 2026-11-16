import test from "node:test";
import assert from "node:assert/strict";
import { emptyPlan, type TacticFile } from "../src/board-model.ts";
import { decodeTacticShareCode, encodeTacticShareCode, MAX_SHARE_CODE_LENGTH, MAX_SHARE_BYTES, tacticShareUrl } from "../src/share-code.ts";

const fixture = (): TacticFile => ({ format: "utility-lab-tactic", version: 1,
  plan: { ...emptyPlan("nuke", "lower"), name: "B split — équipe", notes: "Wait for flash. ".repeat(100),
    objects: [{ id: "t1", kind: "t", x: 250, y: 600, number: 1 },
      { id: "r1", kind: "route", x: 0, y: 0, points: [{ x: 250, y: 600 }, { x: 450, y: 400 }] }] },
  mapImage: "data:image/png;base64,aGVsbG8=",
});

test("portable compressed and compatibility codes retain floor, Unicode, paths and custom raster", async () => {
  const file = fixture();
  for (const compress of [true, false]) {
    const code = await encodeTacticShareCode(file, compress);
    assert.match(code, /^UL1\.[uz]\./);
    assert.deepEqual(await decodeTacticShareCode(code), file);
    assert.deepEqual(await decodeTacticShareCode(tacticShareUrl(code, "http://127.0.0.1:5180/#board")), file);
  }
  assert.match(await encodeTacticShareCode(file), /^UL1\.z\./);
});

test("tampering, unsupported versions, missing bytes and oversized codes are rejected", async () => {
  const code = await encodeTacticShareCode(fixture(), false);
  await assert.rejects(decodeTacticShareCode(code.replace(/\.([a-f0-9]{8})\./, ".00000000.")), /damaged/);
  await assert.rejects(decodeTacticShareCode(code.slice(0, -5)), /damaged|incomplete/);
  await assert.rejects(decodeTacticShareCode(code.replace("UL1", "UL2")), /complete Utility Lab/);
  await assert.rejects(decodeTacticShareCode("X".repeat(MAX_SHARE_CODE_LENGTH + 5000)), /too large/);
});

test("schema rejects invalid coordinates, unsupported floors and remote images before encoding", async () => {
  const file = fixture();
  file.plan.objects[0].x = -1;
  await assert.rejects(encodeTacticShareCode(file), /coordinates/);
  file.plan.objects[0].x = 1;
  file.plan.levelId = "invented";
  await assert.rejects(encodeTacticShareCode(file), /floor/);
  file.plan.levelId = "lower";
  file.mapImage = "https://invalid.example/map.svg";
  await assert.rejects(encodeTacticShareCode(file), /PNG/);
});

test("gzip expansion is bounded before parsing", async () => {
  const blob = new Blob([" ".repeat(MAX_SHARE_BYTES + 1)]);
  const bytes = new Uint8Array(await new Response(blob.stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
  const code = `UL1.z.00000000.${Buffer.from(bytes).toString("base64url")}`;
  await assert.rejects(decodeTacticShareCode(code), /too large/);
});

test("untrusted data with a valid checksum still passes map and coordinate validation", async () => {
  function forged(value: unknown) {
    const bytes = Buffer.from(JSON.stringify(value));
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return `UL1.u.${((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0")}.${bytes.toString("base64url")}`;
  }
  const file = fixture();
  file.plan.objects[0].x = 1001;
  await assert.rejects(decodeTacticShareCode(forged(file)), /coordinates/);
  file.plan.objects[0].x = 1;
  file.plan.levelId = "unknown";
  await assert.rejects(decodeTacticShareCode(forged(file)), /floor/);
});
