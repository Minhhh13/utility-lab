import { T as e } from "./index-CPA0TY-O.js";
var t = `ul-media:`, n = `utility-lab-media`, r = e => /^ul-media:[a-zA-Z0-9-]{1,100}$/.test(e);
function i() { return new Promise((e, t) => { if (!(`indexedDB` in globalThis))
    return t(Error(`Local image storage is unavailable in this browser.`)); let r = indexedDB.open(n, 1); r.onupgradeneeded = () => r.result.createObjectStore(`images`), r.onsuccess = () => e(r.result), r.onerror = () => t(Error(`Local image storage could not be opened. Your draft is still available.`)), r.onblocked = () => t(Error(`Close another Utility Lab window and try saving again.`)); }); }
async function a(e) { let t = await i(); try {
    return await new Promise((n, r) => { let i = t.transaction(`images`).objectStore(`images`).get(e.slice(9)); i.onsuccess = () => { let e = i.result; if (e instanceof Blob)
        return n(e); if (e?.data instanceof ArrayBuffer && [`image/png`, `image/jpeg`, `image/webp`].includes(e.type) && e.data.byteLength <= 1048576)
        return n(new Blob([e.data], { type: e.type })); r(Error(`A saved photo is missing on this device. Restore a workspace backup containing that photo.`)); }, i.onerror = () => r(Error(`A saved photo could not be read. Try again before clearing browser data.`)); });
}
finally {
    t.close();
} }
function o(e) { return new Promise((t, n) => { let r = new FileReader; r.onload = () => t(String(r.result)), r.onerror = () => n(Error(`A photo could not be prepared for export.`)), r.readAsDataURL(e); }); }
async function s(n) { let r = new Map, a = new Map; async function o(n) { if (!n.startsWith(`data:image/`) && !e(n))
    return n; if (a.has(n))
    return a.get(n); let i = await fetch(n); if (!i.ok)
    throw Error(`A guide photo could not be copied. Keep the local server running and try saving again.`); let o = await i.blob(); if (![`image/png`, `image/jpeg`, `image/webp`].includes(o.type) || o.size > 1048576)
    throw Error(`Use PNG, JPEG or WebP photos smaller than 1 MB after preparation.`); let s = await o.arrayBuffer(), c = globalThis.crypto?.subtle ? await crypto.subtle.digest(`SHA-256`, s) : null, l = c ? Array.from(new Uint8Array(c), e => e.toString(16).padStart(2, `0`)).join(``) : globalThis.crypto?.randomUUID?.() || `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`; r.set(l, { type: o.type, data: s }); let u = t + l; return a.set(n, u), u; } let s = await Promise.all(n.map(async (e) => ({ ...e, ...e.image ? { image: await o(e.image) } : {}, ...e.photos ? { photos: await Promise.all(e.photos.map(async (e) => ({ ...e, image: await o(e.image) }))) } : {} }))); if (!r.size)
    return s; let c = await i(); try {
    await new Promise((e, t) => { let n = c.transaction(`images`, `readwrite`); n.oncomplete = () => e(), n.onabort = n.onerror = () => t(Error(`Photos could not be saved. Storage may be full; export your draft before closing it.`)); for (let [e, t] of r)
        n.objectStore(`images`).put(t, e); });
}
finally {
    c.close();
} return s; }
async function c(t) { let n = new Map; function i(t) { return e(t) ? (n.has(t) || n.set(t, (async () => { let e = await fetch(t); if (!e.ok)
    throw Error(`A guide photo is unavailable. Keep the local app server running and try exporting again.`); let n = await e.blob(); if (![`image/png`, `image/jpeg`, `image/webp`].includes(n.type) || n.size > 1048576)
    throw Error(`This guide photo cannot be included in the portable export.`); return o(n); })()), n.get(t)) : r(t) ? (n.has(t) || n.set(t, a(t).then(o)), n.get(t)) : Promise.resolve(t); } return Promise.all(t.map(async (e) => ({ ...e, ...e.image ? { image: await i(e.image) } : {}, ...e.photos ? { photos: await Promise.all(e.photos.map(async (e) => ({ ...e, image: await i(e.image) }))) } : {} }))); }
async function l(e) { if (!r(e))
    return { url: e, release: () => { } }; let t = URL.createObjectURL(await a(e)); return { url: t, release: () => URL.revokeObjectURL(t) }; }
export { s as i, l as n, c as r, r as t };
