import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const manifest = JSON.parse(readFileSync(new URL("../tools/published-snapshot/manifest.json", import.meta.url), "utf8"));
const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const readAsset = (path: string) => readFileSync(new URL(`../public${path}`, import.meta.url));

test("all 1,500 published lineups retain their exact IDs, instructions, coordinates and media metadata", () => {
  const pinned = [
    ["ancient-DeofONFg.json", 165, "1b7c5c0d7316a73b6a94b7429fc04931f0bfe7c4f4512d53de45c942846d4aab"],
    ["anubis-kJDNgTvH.json", 282, "ad194293911b8d05166643c58791e7aa82d291d0cbc42fd2040f4fd652b4e0ad"],
    ["cache-BgoM9Cnh.json", 118, "bb515c5aa13084e1f922c47bf39794fca68ebe7d58d6ffaa17d0ff9e66dfe773"],
    ["dust2-D7QjMF3j.json", 202, "3ca70cd1bbd84aa53dcb4f0174b83714f0a8954ae99adf3d7d6e73908dc8fe6c"],
    ["inferno-D_lX2-Yr.json", 206, "9d72f6dba1afd884ed47db059fd96be58b743a387e9b284b143cd5e0f0ed41fb"],
    ["mirage-BIZ0lEds.json", 234, "522070590e48c0f46b8033da39c550dbb4a062de781948949b7a0588dca4623b"],
    ["nuke-CDXZYydV.json", 183, "e0d98b9ecd3443e660f55eb90379b871b318b65b06c3f8c7b83e4fd93efd2ef6"],
    ["vertigo-DBlKiWFS.json", 110, "0e5627d39b959206a6c683ea0b10c859888d44a8edf9c7986480c6b4a1f73d3c"],
  ] as const;
  let total = 0;
  for (const [name, count, hash] of pinned) {
    const bytes = readAsset(`/assets/${name}`);
    assert.equal(sha256(bytes), hash, `${name} changed from the friend's published library`);
    const records = JSON.parse(bytes.toString("utf8"));
    assert.equal(records.length, count);
    total += records.length;
    if (name.startsWith("mirage-")) {
      const tSide = records.filter((record: { side: string }) => record.side === "T");
      assert.equal(tSide.length, 165);
      for (const [type, expected] of [["Smoke", 107], ["Flash", 24], ["Molotov", 25], ["HE", 9]])
        assert.equal(tSide.filter((record: { type: string }) => record.type === type).length, expected);
    }
  }
  assert.equal(total, 1500);
});

test("published photos, map anchors, artwork and offline assets retain their original bytes", () => {
  assert.equal(manifest.assets.length, 475);
  assert.equal(manifest.assets.filter((item: { path: string }) => item.path.startsWith("/lineup-media/")).length, 418);
  assert.equal(manifest.assets.filter((item: { path: string }) => item.path.startsWith("/assets/origins-")).length, 8);
  for (const asset of manifest.assets) {
    assert.match(asset.path, /^\/[a-zA-Z0-9_./-]+$/);
    assert.ok(!asset.path.includes(".."));
    const bytes = readAsset(asset.path);
    assert.equal(bytes.length, asset.bytes, asset.path);
    assert.equal(sha256(bytes), asset.sha256, asset.path);
  }
});
