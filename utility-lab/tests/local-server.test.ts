import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { createLocalServer } from "../scripts/serve-local.mjs";

test("the local production server serves compressed app files, caches safely and rejects file traversal and writes", async () => {
  const base = resolve(tmpdir()),
    root = await mkdtemp(join(base, "utility-lab-server-"));
  assert.ok(
    root.startsWith(base + sep) && root.includes("utility-lab-server-"),
  );
  await mkdir(join(root, "assets"));
  await writeFile(
    join(root, "index.html"),
    "<!doctype html><h1>Utility Lab</h1>",
  );
  await writeFile(
    join(root, "assets", "app-test.js"),
    "/* app asset */".repeat(300),
  );
  const server = createLocalServer(root);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}`;
  try {
    const index = await fetch(url);
    assert.equal(index.status, 200);
    assert.match(await index.text(), /Utility Lab/);
    assert.equal(index.headers.get("cache-control"), "no-cache");
    assert.match(
      index.headers.get("content-security-policy") || "",
      /frame-ancestors 'none'/,
    );
    const asset = await fetch(`${url}/assets/app-test.js`, {
      headers: { "Accept-Encoding": "gzip" },
    });
    assert.equal(asset.headers.get("content-encoding"), "gzip");
    assert.match(asset.headers.get("cache-control") || "", /immutable/);
    assert.equal((await asset.text()).length, 4500);
    const cached = await fetch(`${url}/assets/app-test.js`, {
      headers: { "If-None-Match": asset.headers.get("etag")! },
    });
    assert.equal(cached.status, 304);
    const head = await fetch(url, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
    for (const path of [
      "/missing.js",
      "/.env",
      "/..%2f..%2fsecret.txt",
      "/%5c..%5csecret.txt",
    ])
      assert.equal((await fetch(url + path)).status, 404, path);
    assert.equal(
      (await fetch(url, { method: "POST", body: "write" })).status,
      405,
    );
    assert.equal((await fetch(url + "/board")).status, 200);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    const checked = resolve(root);
    if (
      checked.startsWith(base + sep) &&
      checked.includes("utility-lab-server-")
    )
      await rm(checked, { recursive: true, force: true });
  }
});
