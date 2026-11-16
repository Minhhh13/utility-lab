import { validateTacticFile, type TacticFile } from "./board-model.ts";
import { MAPS } from "./maps.ts";

export const MAX_SHARE_BYTES = 3_000_000;
export const MAX_SHARE_CODE_LENGTH = 4_000_100;
const encoder = new TextEncoder();

// An error-detection checksum, not a signature or a claim about the sender.
function checksum(bytes: Uint8Array): string {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unbase64url(value: string): Uint8Array<ArrayBuffer> {
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1)
    throw new Error("This share code is incomplete or contains invalid characters.");
  try {
    const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
    if (base64url(bytes) !== value) throw new Error("Non-canonical encoding");
    return bytes;
  } catch {
    throw new Error("This share code is incomplete or contains invalid characters.");
  }
}

function validated(value: unknown): TacticFile {
  const file = validateTacticFile(value);
  const map = MAPS.find((item) => item.id === file.plan.mapId);
  if (!map || !map.levels.some((item) => item.id === file.plan.levelId))
    throw new Error("This tactic uses a map or floor that this app does not support.");
  return file;
}

async function streamBytes(stream: ReadableStream<Uint8Array>): Promise<Uint8Array<ArrayBuffer>> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_SHARE_BYTES) {
        await reader.cancel();
        throw new Error("This tactic is too large. Share a JSON file smaller than 3 MB instead.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

export async function encodeTacticShareCode(value: TacticFile, compress = true): Promise<string> {
  const file = validated(value);
  const bytes = encoder.encode(JSON.stringify(file));
  if (bytes.length > MAX_SHARE_BYTES)
    throw new Error("This tactic is too large. Share a JSON file smaller than 3 MB instead.");
  let payload = bytes;
  let mode = "u";
  if (compress && typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined") {
    try {
      const compressed = await streamBytes(new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip")));
      if (compressed.length < bytes.length) { payload = compressed; mode = "z"; }
    } catch { /* Compression is optional; a complete compatibility code still works. */ }
  }
  return `UL1.${mode}.${checksum(bytes)}.${base64url(payload)}`;
}

export function extractTacticShareCode(input: string): string {
  if (input.length > MAX_SHARE_CODE_LENGTH + 4096)
    throw new Error("This share code is too large. Open a tactic JSON file instead.");
  let code = input.trim();
  if (code.includes("#tactic=")) {
    try { code = decodeURIComponent(code.split("#tactic=")[1]); }
    catch { throw new Error("This share link is incomplete. Ask for the full code again."); }
  }
  if (code.length > MAX_SHARE_CODE_LENGTH)
    throw new Error("This share code is too large. Open a tactic JSON file instead.");
  return code;
}

export async function decodeTacticShareCode(input: string): Promise<TacticFile> {
  const code = extractTacticShareCode(input);
  const match = /^UL1\.([uz])\.([a-f0-9]{8})\.([A-Za-z0-9_-]+)$/.exec(code);
  if (!match) throw new Error("Paste a complete Utility Lab code beginning with UL1.");
  const payload = unbase64url(match[3]);
  if (payload.length > MAX_SHARE_BYTES)
    throw new Error("This tactic is too large. Open a tactic JSON file instead.");
  let bytes = payload;
  if (match[1] === "z") {
    if (typeof DecompressionStream === "undefined")
      throw new Error("This browser cannot open compressed codes. Ask the sender for a compatibility code or JSON file.");
    try {
      bytes = await streamBytes(new Blob([payload]).stream().pipeThrough(new DecompressionStream("gzip")));
    } catch (error) {
      if (error instanceof Error && error.message.includes("too large")) throw error;
      throw new Error("This share code is damaged. Ask the sender to copy it again.");
    }
  }
  if (checksum(bytes) !== match[2])
    throw new Error("This share code is damaged or has changed. Ask the sender to copy it again.");
  let value: unknown;
  try { value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new Error("This share code does not contain a valid tactic."); }
  return validated(value);
}

export function tacticShareUrl(code: string, base: string): string {
  const url = new URL(base);
  url.hash = `tactic=${encodeURIComponent(code)}`;
  return url.href;
}
