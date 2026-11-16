import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { networkInterfaces } from "node:os";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};
const csp =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' data: blob: https:; frame-src https://www.youtube-nocookie.com https://www.youtube.com; media-src 'self' blob: https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

export function createLocalServer(directory) {
  const root = resolve(directory),
    cache = new Map();
  return http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Content-Security-Policy", csp);
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      return res.end("Read-only local server");
    }
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400);
      return res.end("Invalid path");
    }
    if (
      pathname.includes("\\") ||
      pathname.includes("\0") ||
      pathname.split("/").some((part) => part.startsWith(".") && part !== "")
    ) {
      res.writeHead(404);
      return res.end("Not found");
    }
    let file = resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(404);
      return res.end("Not found");
    }
    if (file === root) file = resolve(root, "index.html");
    try {
      let info;
      try {
        info = await stat(file);
        if (!info.isFile()) throw new Error("not-file");
      } catch {
        if (extname(pathname)) {
          res.writeHead(404);
          return res.end("Not found");
        }
        file = resolve(root, "index.html");
        info = await stat(file);
      }
      let entry = cache.get(file);
      if (!entry || entry.modified !== info.mtimeMs) {
        const body = await readFile(file),
          type = mime[extname(file)] || "application/octet-stream",
          compress =
            body.length > 1024 &&
            /^(text\/|application\/(json|manifest)|image\/svg)/.test(type);
        entry = {
          body,
          gzip: compress ? gzipSync(body) : null,
          type,
          modified: info.mtimeMs,
          etag: `"${createHash("sha256").update(body).digest("hex").slice(0, 24)}"`,
        };
        cache.set(file, entry);
      }
      res.setHeader("Content-Type", entry.type);
      res.setHeader("ETag", entry.etag);
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader(
        "Cache-Control",
        file.endsWith("index.html") ||
          file.endsWith("sw.js") ||
          file.endsWith("precache-manifest.json")
          ? "no-cache"
          : file.includes(sep + "assets" + sep)
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600",
      );
      if (req.headers["if-none-match"] === entry.etag) {
        res.writeHead(304);
        return res.end();
      }
      const zipped =
        entry.gzip && /\bgzip\b/.test(req.headers["accept-encoding"] || "");
      const body = zipped ? entry.gzip : entry.body;
      if (zipped) res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Content-Length", body.length);
      res.writeHead(200);
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(503, { "Cache-Control": "no-store" });
      res.end("Build the app first with npm run build, then start it again.");
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const args = process.argv.slice(2),
    at = args.indexOf("--port"),
    port = at >= 0 ? Number(args[at + 1]) : 5180,
    lan = args.includes("--lan"),
    directory = fileURLToPath(new URL("../dist", import.meta.url));
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Choose a port from 1 to 65535.");
  const server = createLocalServer(directory);
  server.on("error", (error) => {
    console.error(
      error.code === "EADDRINUSE"
        ? `Port ${port} is already in use. Choose another with npm start -- --port 5181.`
        : error.message,
    );
    process.exitCode = 1;
  });
  server.listen(port, lan ? "0.0.0.0" : "127.0.0.1", () => {
    console.log(`Utility Lab is running locally: http://127.0.0.1:${port}`);
    if (lan)
      for (const addresses of Object.values(networkInterfaces()))
        for (const address of addresses || [])
          if (address.family === "IPv4" && !address.internal)
            console.log(
              `Same-network phone: http://${address.address}:${port}`,
            );
    console.log("Press Ctrl+C to stop. No site is deployed or uploaded.");
  });
}
