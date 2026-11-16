import { isBundledPhoto, type UtilityReference } from "./utility-data";

const PREFIX = "ul-media:";
const DB_NAME = "utility-lab-media";
export const isStoredMedia = (value: string): boolean =>
  /^ul-media:[a-zA-Z0-9-]{1,100}$/.test(value);

function openMedia(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in globalThis))
      return reject(
        new Error("Local image storage is unavailable in this browser."),
      );
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("images");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error(
          "Local image storage could not be opened. Your draft is still available.",
        ),
      );
    request.onblocked = () =>
      reject(
        new Error("Close another Utility Lab window and try saving again."),
      );
  });
}

async function mediaBlob(reference: string): Promise<Blob> {
  const db = await openMedia();
  try {
    return await new Promise<Blob>((resolve, reject) => {
      const request = db
        .transaction("images")
        .objectStore("images")
        .get(reference.slice(PREFIX.length));
      request.onsuccess = () => {
        const value = request.result;
        if (value instanceof Blob) return resolve(value);
        if (
          value?.data instanceof ArrayBuffer &&
          ["image/png", "image/jpeg", "image/webp"].includes(value.type) &&
          value.data.byteLength <= 1_048_576
        )
          return resolve(new Blob([value.data], { type: value.type }));
        reject(
          new Error(
            "A saved photo is missing on this device. Restore a workspace backup containing that photo.",
          ),
        );
      };
      request.onerror = () =>
        reject(
          new Error(
            "A saved photo could not be read. Try again before clearing browser data.",
          ),
        );
    });
  } finally {
    db.close();
  }
}

function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("A photo could not be prepared for export."));
    reader.readAsDataURL(blob);
  });
}

/** Metadata stays small; image bytes live in transactional IndexedDB storage. */
export async function storeLineupMedia(
  records: UtilityReference[],
): Promise<UtilityReference[]> {
  const pending = new Map<string, { type: string; data: ArrayBuffer }>();
  const memo = new Map<string, string>();
  async function store(image: string): Promise<string> {
    if (!image.startsWith("data:image/") && !isBundledPhoto(image))
      return image;
    if (memo.has(image)) return memo.get(image)!;
    const response = await fetch(image);
    if (!response.ok)
      throw new Error(
        "A guide photo could not be copied. Keep the local server running and try saving again.",
      );
    const blob = await response.blob();
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(blob.type) ||
      blob.size > 1_048_576
    )
      throw new Error(
        "Use PNG, JPEG or WebP photos smaller than 1 MB after preparation.",
      );
    const data = await blob.arrayBuffer();
    const digest = globalThis.crypto?.subtle
      ? await crypto.subtle.digest("SHA-256", data)
      : null;
    const id = digest
      ? Array.from(new Uint8Array(digest), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("")
      : globalThis.crypto?.randomUUID?.() ||
        `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    pending.set(id, { type: blob.type, data });
    const reference = PREFIX + id;
    memo.set(image, reference);
    return reference;
  }
  const next = await Promise.all(
    records.map(async (record) => ({
      ...record,
      ...(record.image ? { image: await store(record.image) } : {}),
      ...(record.photos
        ? {
            photos: await Promise.all(
              record.photos.map(async (photo) => ({
                ...photo,
                image: await store(photo.image),
              })),
            ),
          }
        : {}),
    })),
  );
  if (!pending.size) return next;
  const db = await openMedia();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("images", "readwrite");
      transaction.oncomplete = () => resolve();
      transaction.onabort = transaction.onerror = () =>
        reject(
          new Error(
            "Photos could not be saved. Storage may be full; export your draft before closing it.",
          ),
        );
      for (const [id, blob] of pending)
        transaction.objectStore("images").put(blob, id);
    });
  } finally {
    db.close();
  }
  return next;
}

/** Exports include actual image bytes, so files work on another device. */
export async function portableLineups(
  records: UtilityReference[],
): Promise<UtilityReference[]> {
  const memo = new Map<string, Promise<string>>();
  function expand(image: string): Promise<string> {
    if (isBundledPhoto(image)) {
      if (!memo.has(image))
        memo.set(
          image,
          (async () => {
            const response = await fetch(image);
            if (!response.ok)
              throw new Error(
                "A guide photo is unavailable. Keep the local app server running and try exporting again.",
              );
            const blob = await response.blob();
            if (
              !["image/png", "image/jpeg", "image/webp"].includes(blob.type) ||
              blob.size > 1_048_576
            )
              throw new Error(
                "This guide photo cannot be included in the portable export.",
              );
            return dataUrl(blob);
          })(),
        );
      return memo.get(image)!;
    }
    if (!isStoredMedia(image)) return Promise.resolve(image);
    if (!memo.has(image)) memo.set(image, mediaBlob(image).then(dataUrl));
    return memo.get(image)!;
  }
  return Promise.all(
    records.map(async (record) => ({
      ...record,
      ...(record.image ? { image: await expand(record.image) } : {}),
      ...(record.photos
        ? {
            photos: await Promise.all(
              record.photos.map(async (photo) => ({
                ...photo,
                image: await expand(photo.image),
              })),
            ),
          }
        : {}),
    })),
  );
}

export async function localPhotoSource(
  source: string,
): Promise<{ url: string; release: () => void }> {
  if (!isStoredMedia(source)) return { url: source, release: () => {} };
  const url = URL.createObjectURL(await mediaBlob(source));
  return { url, release: () => URL.revokeObjectURL(url) };
}
