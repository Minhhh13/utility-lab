import { a as e, t } from "./file-transfer-dSeALYop.js";
import { c as n, f as r, i, p as a, t as o } from "./playbook-model-cxzWD_5e.js";
import { F as s, I as c, L as l, M as u, P as d, Q as f, S as p, Y as m, Z as h, _ as g, m as _, v, y } from "./index-CPA0TY-O.js";
import { i as b, r as x } from "./media-store-Djx79cZ2.js";
import { BUNDLED_GUIDE_PHOTOS as S } from "./guide-library-CZIXv6Ps.js";
var C = m(`hard-drive`, [[`path`, { d: `M10 16h.01`, key: `1bzywj` }], [`path`, { d: `M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z`, key: `18tbho` }], [`path`, { d: `M21.946 12.013H2.054`, key: `zqlbp7` }], [`path`, { d: `M6 16h.01`, key: `1pmjb7` }]]), w = m(`wifi-off`, [[`path`, { d: `M12 20h.01`, key: `zekei9` }], [`path`, { d: `M8.5 16.429a5 5 0 0 1 7 0`, key: `1bycff` }], [`path`, { d: `M5 12.859a10 10 0 0 1 5.17-2.69`, key: `1dl1wf` }], [`path`, { d: `M19 12.859a10 10 0 0 0-2.007-1.523`, key: `4k23kn` }], [`path`, { d: `M2 8.82a15 15 0 0 1 4.177-2.643`, key: `1grhjp` }], [`path`, { d: `M22 8.82a15 15 0 0 0-11.288-3.764`, key: `z3jwby` }], [`path`, { d: `m2 2 20 20`, key: `1ooewy` }]]), T = f(h(), 1), E = e => !!e && typeof e == `object` && !Array.isArray(e), D = (e, t, n) => { try {
    return JSON.parse(e.getItem(t) || `null`) ?? n;
}
catch {
    return n;
} };
function O(e) { let t = D(e, p, []), n = []; for (let t of s)
    for (let r of t.levels) {
        let i = D(e, `utility-lab:draft:v1:${t.id}:${r.id}`, null);
        if (i)
            try {
                n.push(v({ format: `utility-lab-tactic`, version: 1, plan: i, mapImage: e.getItem(`utility-lab:radar:v1:${t.id}:${r.id}`) || void 0 }));
            }
            catch { }
    } let a = D(e, `ul:appearance`, null); return { format: `utility-lab-workspace`, version: 1, createdAt: new Date().toISOString(), tactics: g(D(e, i, [])), lineups: (Array.isArray(t) ? t : []).flatMap(e => { let t = u(e); return t ? [t] : []; }), books: r(D(e, o, [])), favorites: Array.isArray(D(e, `utility-lab:utility-favorites:v1`, [])) ? D(e, y, []).filter(e => typeof e == `string` && e.length <= 160).slice(0, 500) : [], drafts: n, appearance: E(a) && [`light`, `dark`, `system`].includes(String(a.mode)) && [`cobalt`, `ember`, `mint`, `rose`].includes(String(a.palette)) ? a : { mode: `light`, palette: `cobalt` } }; }
function k(e) { if (!E(e) || e.format !== `utility-lab-workspace` || e.version !== 1)
    throw Error(`Choose a Utility Lab workspace backup (version 1).`); if (![e.tactics, e.lineups, e.books, e.favorites, e.drafts].every(Array.isArray))
    throw Error(`The workspace backup is missing its record lists.`); let t = e; if (t.tactics.length > 100 || t.lineups.length > 80 || t.books.length > 100 || t.favorites.length > 500 || t.drafts.length > 10)
    throw Error(`This backup exceeds the supported workspace limits.`); let n = g(t.tactics), i = r(t.books), a = t.lineups.map(u); if (n.length !== t.tactics.length || i.length !== t.books.length || a.some(e => !e) || new Set(a.map(e => e.id)).size !== a.length)
    throw Error(`This backup contains invalid or duplicate records. Your workspace has not changed.`); if (a.some(e => [e.image, ...(e.photos || []).map(e => e.image)].some(e => e?.startsWith(`ul-media:`))))
    throw Error(`This file is missing its photo bytes. Export a complete backup from the original device.`); if (!t.favorites.every(e => typeof e == `string` && e.length > 0 && e.length <= 160))
    throw Error(`This backup contains invalid saved references.`); let o = t.drafts.map(v), c = o.map(e => `${e.plan.mapId}:${e.plan.levelId}`); if (new Set(c).size !== c.length || o.some(e => !s.some(t => t.id === e.plan.mapId && t.levels.some(t => t.id === e.plan.levelId))))
    throw Error(`This backup contains duplicate or unsupported map drafts.`); let l = E(t.appearance) && [`light`, `dark`, `system`].includes(String(t.appearance.mode)) && [`cobalt`, `ember`, `mint`, `rose`].includes(String(t.appearance.palette)) ? t.appearance : { mode: `light`, palette: `cobalt` }; return { format: `utility-lab-workspace`, version: 1, createdAt: typeof t.createdAt == `string` ? t.createdAt.slice(0, 40) : ``, tactics: n, books: i, lineups: a, favorites: [...new Set(t.favorites)], drafts: o, appearance: l }; }
function A(e, t, n = _) { let r = structuredClone(e), i = new Map, a = new Map, o = e => { let t = n(); for (let r = 0; e.has(t) && r < 100; r++)
    t = n(); if (e.has(t))
    throw Error(`Could not assign a unique imported record ID.`); return e.add(t), t; }, s = new Set(r.tactics.map(e => e.id)), c = new Set(r.lineups.map(e => e.id)); for (let e of t.tactics) {
    let t = r.tactics.find(t => t.id === e.id);
    if (t && JSON.stringify(t.plan) === JSON.stringify(e.plan)) {
        i.set(e.id, t.id);
        continue;
    }
    let n = s.has(e.id) ? o(s) : e.id;
    s.add(n), i.set(e.id, n), r.tactics.push({ ...e, id: n });
} for (let e of t.lineups) {
    let t = r.lineups.find(t => t.id === e.id);
    if (t && JSON.stringify(t) === JSON.stringify(e)) {
        a.set(e.id, t.id);
        continue;
    }
    let n = c.has(e.id) ? o(c) : e.id;
    c.add(n), a.set(e.id, n), r.lineups.push({ ...e, id: n });
} let l = e => (i.has(e) || i.set(e, s.has(e) ? o(s) : e), i.get(e)), u = e => (a.has(e) || a.set(e, c.has(e) ? o(c) : e), a.get(e)), d = new Set(r.books.map(e => e.id)); for (let e of t.books) {
    let t = { ...e, tacticIds: e.tacticIds.map(l), lineupIds: e.lineupIds.map(u), steps: e.steps.map(e => ({ ...e, ...e.tacticId ? { tacticId: l(e.tacticId) } : {}, ...e.lineupId ? { lineupId: u(e.lineupId) } : {} })) };
    if (r.books.some(e => JSON.stringify(e) === JSON.stringify(t)))
        continue;
    let n = d.has(t.id) ? o(d) : t.id;
    d.add(n), r.books.push({ ...t, id: n });
} r.favorites = [...new Set([...r.favorites, ...t.favorites.map(e => a.get(e) || e)])]; for (let e of t.drafts)
    r.drafts.some(t => t.plan.mapId === e.plan.mapId && t.plan.levelId === e.plan.levelId) || r.drafts.push(e); if (r.tactics.length > 100 || r.lineups.length > 80 || r.books.length > 100 || r.favorites.length > 500)
    throw Error(`The combined workspace exceeds local record limits. Export and remove records before importing this backup.`); return r; }
function j(e, t, r = !1) { let a = { [i]: JSON.stringify(t.tactics), [p]: JSON.stringify(t.lineups), [o]: JSON.stringify(t.books), [y]: JSON.stringify(t.favorites) }; for (let { plan: e, mapImage: n } of t.drafts)
    a[`utility-lab:draft:v1:${e.mapId}:${e.levelId}`] = JSON.stringify(e), n && (a[`utility-lab:radar:v1:${e.mapId}:${e.levelId}`] = n); r && (a[`ul:appearance`] = JSON.stringify(t.appearance)), n(e, a); }
var M = d();
function N({ onClose: n, onRestored: r }) { let i = (0, T.useRef)(null), o = (0, T.useRef)(null), [u, d] = (0, T.useState)(!1), [f, p] = (0, T.useState)(``), [m, h] = (0, T.useState)(``), [g, _] = (0, T.useState)(null), [v, y] = (0, T.useState)(!1), [E, D] = (0, T.useState)(null), [N, P] = (0, T.useState)(!1), [F, I] = (0, T.useState)(``); (0, T.useEffect)(() => { i.current?.showModal(), navigator.storage?.estimate().then(e => D(e.usage || 0)), navigator.storage?.persisted?.().then(P); }, []); async function L() { d(!0), h(``); try {
    let e = O(localStorage);
    e.lineups = await x(e.lineups);
    let n = new Blob([JSON.stringify(e)], { type: `application/json` });
    if (n.size > 256e6)
        throw Error(`This backup is too large. Export individual playbooks or lineups instead.`);
    k(e), await t(n, `utility-lab-workspace-${new Date().toISOString().slice(0, 10)}.json`);
    try {
        localStorage.setItem(`ul:last-backup`, new Date().toISOString());
    }
    catch { }
    p(`Workspace backup prepared, including your uploaded photos.`);
}
catch (e) {
    h(e instanceof Error ? e.message : `The backup could not be exported.`);
}
finally {
    d(!1);
} } async function R(e) { if (e) {
    d(!0), h(``), _(null);
    try {
        if (e.size > 256e6)
            throw Error(`Choose a workspace backup smaller than 256 MB.`);
        _(k(JSON.parse(await e.text()))), p(``);
    }
    catch (e) {
        h(e instanceof Error ? e.message : `This is not a readable workspace backup.`);
    }
    finally {
        d(!1), o.current && (o.current.value = ``);
    }
} } async function z() { if (g) {
    d(!0), h(``);
    try {
        let e = O(localStorage);
        e.lineups = await x(e.lineups);
        let t = A(e, g);
        t.lineups = await b(t.lineups), v && (t.appearance = g.appearance), j(localStorage, t, v), window.dispatchEvent(new Event(`utility-lab:workspace-changed`)), _(null), p(`Backup merged. Existing records and map drafts were kept; conflicting records were imported as copies.`), r();
    }
    catch (e) {
        h(e instanceof Error ? e.message : `The backup could not be restored. Your existing workspace was kept.`);
    }
    finally {
        d(!1);
    }
} } async function B(e = !1) { d(!0), h(``); try {
    let t = await navigator.serviceWorker?.getRegistration();
    if (!t?.active)
        throw Error(`Offline installation needs the production app on localhost or HTTPS. Open the URL printed by npm start and try again. Plain HTTP phone connections can browse while the local server is running.`);
    let n = e ? S : [...new Set(s.flatMap(e => e.levels.flatMap(e => [e.image, ...e.image.endsWith(`.svg`) ? [e.image.replace(`.svg`, `-light.svg`)] : [], (e.radarImage || e.image).replace(`/maps/`, `/map-thumbnails/`)]))), `/art/launch-dust-cs1999.webp`, `/art/launch-dust-source.webp`, `/art/launch-dust-csgo.webp`, `/art/pixel-smoke.png`];
    await new Promise((e, r) => { let i = new MessageChannel, a = setTimeout(() => { i.port1.close(), r(Error(`The offline install did not finish. Check the local server and try again.`)); }, 6e4); i.port1.onmessage = t => { t.data?.done ? (clearTimeout(a), i.port1.close(), t.data.error ? r(Error(t.data.error)) : e()) : I(`${t.data.completed} of ${t.data.total} assets`); }, t.active.postMessage({ type: `CACHE_OFFLINE`, urls: n }, [i.port2]); }), I(e ? `All bundled photo guides are ready offline.` : `All supported maps and launch artwork are ready offline.`), p(`Creator videos and hosted photo posts need internet. Uploaded photos stay available locally.`);
}
catch (e) {
    h(e instanceof Error ? e.message : `Offline assets could not be saved.`);
}
finally {
    d(!1);
} } async function V() { try {
    let e = await navigator.storage?.persist?.();
    P(!!e), p(e ? `The browser granted persistent storage for this workspace.` : `The browser did not grant persistent storage. Keep an exported workspace backup.`);
}
catch {
    h(`Persistent storage is not available here. You can still export backups.`);
} } return (0, M.jsxs)(`dialog`, { className: `workspace-settings`, ref: i, onClose: n, "aria-labelledby": `workspace-settings-title`, onCancel: e => { u && e.preventDefault(); }, children: [(0, M.jsxs)(`div`, { className: `dialog-heading`, children: [(0, M.jsxs)(`div`, { children: [(0, M.jsx)(`h2`, { id: `workspace-settings-title`, children: `Your workspace` }), (0, M.jsx)(`p`, { children: `Backups, offline maps and local storage.` })] }), (0, M.jsx)(`button`, { className: `icon-button`, disabled: u, onClick: () => i.current?.close(), "aria-label": `Close workspace settings`, children: (0, M.jsx)(c, { size: 21 }) })] }), (0, M.jsxs)(`section`, { children: [(0, M.jsxs)(`h3`, { children: [(0, M.jsx)(e, { size: 19 }), `Back up everything`] }), (0, M.jsx)(`p`, { children: `Save tactics, personal lineups with photos, playbooks, starred references, map drafts and appearance in one portable file.` }), (0, M.jsxs)(`div`, { className: `settings-actions`, children: [(0, M.jsxs)(`button`, { className: `primary-button`, disabled: u, onClick: () => void L(), children: [(0, M.jsx)(e, { size: 16 }), `Export workspace`] }), (0, M.jsxs)(`button`, { className: `secondary-button`, disabled: u, onClick: () => o.current?.click(), children: [(0, M.jsx)(a, { size: 16 }), `Import backup`] })] }), (0, M.jsx)(`input`, { ref: o, type: `file`, accept: `.json,application/json`, hidden: !0, "aria-label": `Workspace backup file`, onChange: e => void R(e.target.files?.[0]) }), g && (0, M.jsxs)(`div`, { className: `backup-preview`, children: [(0, M.jsx)(`h4`, { children: `Import preview` }), (0, M.jsxs)(`p`, { children: [g.tactics.length, ` tactics · `, g.lineups.length, ` `, `personal lineups · `, g.books.length, ` playbooks ·`, ` `, g.drafts.length, ` map drafts`] }), (0, M.jsx)(`p`, { children: `Matching records are reused. Conflicts become copies. Existing map drafts stay in place.` }), (0, M.jsxs)(`label`, { children: [(0, M.jsx)(`input`, { type: `checkbox`, checked: v, onChange: e => y(e.target.checked) }), `Use the backup’s theme and palette`] }), (0, M.jsxs)(`div`, { className: `settings-actions`, children: [(0, M.jsx)(`button`, { className: `primary-button`, disabled: u, onClick: () => void z(), children: `Merge backup` }), (0, M.jsx)(`button`, { className: `secondary-button`, disabled: u, onClick: () => _(null), children: `Cancel import` })] })] })] }), (0, M.jsxs)(`section`, { children: [(0, M.jsxs)(`h3`, { children: [(0, M.jsx)(w, { size: 19 }), `Keep maps offline`] }), (0, M.jsx)(`p`, { children: `Download both map styles, every supported floor and the opening artwork. The board and your personal photo guides work without internet after installation.` }), (0, M.jsx)(`button`, { className: `secondary-button`, disabled: u, onClick: () => void B(), children: `Download all maps` }), F && (0, M.jsx)(`p`, { role: `status`, children: F }), (0, M.jsx)(`p`, { children: `Save the bundled standing and aim photos for offline viewing. Source-hosted galleries and videos need internet.` }), (0, M.jsx)(`button`, { className: `secondary-button`, disabled: u, onClick: () => void B(!0), children: `Download photo guides` })] }), (0, M.jsxs)(`section`, { children: [(0, M.jsxs)(`h3`, { children: [(0, M.jsx)(C, { size: 19 }), `On this device`] }), (0, M.jsxs)(`p`, { children: [E === null ? `Storage usage is reported when the browser supports it.` : `${(E / 1024 / 1024).toFixed(1)} MB used by this local app.`, ` `, N ? `Persistent storage is enabled.` : `Browser data can be removed by the browser or device settings.`] }), (0, M.jsxs)(`button`, { className: `secondary-button`, disabled: u || N, onClick: () => void V(), children: [(0, M.jsx)(l, { size: 16 }), N ? `Storage protected` : `Request persistent storage`] }), (0, M.jsx)(`p`, { children: `Your data stays in this browser. Import a backup on another device to move your workspace.` })] }), u && (0, M.jsx)(`p`, { className: `settings-status`, role: `status`, children: `Working locally…` }), f && (0, M.jsx)(`p`, { className: `settings-status`, role: `status`, children: f }), m && (0, M.jsx)(`p`, { className: `settings-error`, role: `alert`, children: m })] }); }
export { N as default };
