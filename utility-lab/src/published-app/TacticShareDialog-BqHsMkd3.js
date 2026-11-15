import './TacticShareDialog-BAjPTBN9.css';
import { t as e } from "./copy-PZez4Jht.js";
import { t } from "./link-2-CWf7YmOj.js";
import { F as n, G as r, I as i, P as a, Q as o, Y as s, Z as c, l, v as u } from "./index-CPA0TY-O.js";
import { t as d } from "./UtilityIcon-xy48Pw4A.js";
var f = s(`loader-circle`, [[`path`, { d: `M21 12a9 9 0 1 1-6.219-8.56`, key: `13zald` }]]), p = s(`share-2`, [[`circle`, { cx: `18`, cy: `5`, r: `3`, key: `gq8acd` }], [`circle`, { cx: `6`, cy: `12`, r: `3`, key: `w7nqdw` }], [`circle`, { cx: `18`, cy: `19`, r: `3`, key: `1xt0gg` }], [`line`, { x1: `8.59`, x2: `15.42`, y1: `13.51`, y2: `17.49`, key: `47mynk` }], [`line`, { x1: `15.41`, x2: `8.59`, y1: `6.51`, y2: `10.49`, key: `1n3mei` }]]), m = o(c(), 1), h = 4000100, g = new TextEncoder;
function _(e) { let t = 4294967295; for (let n of e) {
    t ^= n;
    for (let e = 0; e < 8; e++)
        t = t >>> 1 ^ 3988292384 & -(t & 1);
} return ((t ^ 4294967295) >>> 0).toString(16).padStart(8, `0`); }
function v(e) { let t = ``; for (let n = 0; n < e.length; n += 8192)
    t += String.fromCharCode(...e.subarray(n, n + 8192)); return btoa(t).replace(/\+/g, `-`).replace(/\//g, `_`).replace(/=+$/, ``); }
function y(e) { if (!e || !/^[A-Za-z0-9_-]+$/.test(e) || e.length % 4 == 1)
    throw Error(`This share code is incomplete or contains invalid characters.`); try {
    let t = atob(e.replace(/-/g, `+`).replace(/_/g, `/`)), n = Uint8Array.from(t, e => e.charCodeAt(0));
    if (v(n) !== e)
        throw Error(`Non-canonical encoding`);
    return n;
}
catch {
    throw Error(`This share code is incomplete or contains invalid characters.`);
} }
function b(e) { let t = u(e), r = n.find(e => e.id === t.plan.mapId); if (!r || !r.levels.some(e => e.id === t.plan.levelId))
    throw Error(`This tactic uses a map or floor that this app does not support.`); return t; }
async function x(e) { let t = e.getReader(), n = [], r = 0; try {
    for (;;) {
        let { value: e, done: i } = await t.read();
        if (i)
            break;
        if (r += e.byteLength, r > 3e6)
            throw await t.cancel(), Error(`This tactic is too large. Share a JSON file smaller than 3 MB instead.`);
        n.push(e);
    }
}
finally {
    t.releaseLock();
} let i = new Uint8Array(r), a = 0; for (let e of n)
    i.set(e, a), a += e.length; return i; }
async function S(e, t = !0) { let n = b(e), r = g.encode(JSON.stringify(n)); if (r.length > 3e6)
    throw Error(`This tactic is too large. Share a JSON file smaller than 3 MB instead.`); let i = r, a = `u`; if (t && typeof CompressionStream < `u` && typeof DecompressionStream < `u`)
    try {
        let e = await x(new Blob([r]).stream().pipeThrough(new CompressionStream(`gzip`)));
        e.length < r.length && (i = e, a = `z`);
    }
    catch { } return `UL1.${a}.${_(r)}.${v(i)}`; }
function C(e) { if (e.length > 4004196)
    throw Error(`This share code is too large. Open a tactic JSON file instead.`); let t = e.trim(); if (t.includes(`#tactic=`))
    try {
        t = decodeURIComponent(t.split(`#tactic=`)[1]);
    }
    catch {
        throw Error(`This share link is incomplete. Ask for the full code again.`);
    } if (t.length > 4000100)
    throw Error(`This share code is too large. Open a tactic JSON file instead.`); return t; }
async function w(e) { let t = C(e), n = /^UL1\.([uz])\.([a-f0-9]{8})\.([A-Za-z0-9_-]+)$/.exec(t); if (!n)
    throw Error(`Paste a complete Utility Lab code beginning with UL1.`); let r = y(n[3]); if (r.length > 3e6)
    throw Error(`This tactic is too large. Open a tactic JSON file instead.`); let i = r; if (n[1] === `z`) {
    if (typeof DecompressionStream > `u`)
        throw Error(`This browser cannot open compressed codes. Ask the sender for a compatibility code or JSON file.`);
    try {
        i = await x(new Blob([r]).stream().pipeThrough(new DecompressionStream(`gzip`)));
    }
    catch (e) {
        throw e instanceof Error && e.message.includes(`too large`) ? e : Error(`This share code is damaged. Ask the sender to copy it again.`);
    }
} if (_(i) !== n[2])
    throw Error(`This share code is damaged or has changed. Ask the sender to copy it again.`); let a; try {
    a = JSON.parse(new TextDecoder(`utf-8`, { fatal: !0 }).decode(i));
}
catch {
    throw Error(`This share code does not contain a valid tactic.`);
} return b(a); }
function T(e, t) { let n = new URL(t); return n.hash = `tactic=${encodeURIComponent(e)}`, n.href; }
var E = a();
function D({ object: e, arrowId: t }) { let n = `var(--marker-${e.kind === `text` ? `text` : e.kind})`; if (e.points)
    return (0, E.jsx)(`polyline`, { points: e.points.map(e => `${e.x},${e.y}`).join(` `), fill: `none`, stroke: n, strokeWidth: 5, strokeLinecap: `round`, strokeLinejoin: `round`, strokeDasharray: e.kind === `route` ? `10 8` : void 0, markerEnd: e.kind === `route` ? `url(#${t})` : void 0 }); if (e.kind === `text`)
    return (0, E.jsx)(`text`, { x: e.x, y: e.y, fill: n, stroke: `var(--canvas)`, strokeWidth: 3, paintOrder: `stroke`, fontSize: 22, fontWeight: 650, children: e.label }); let r = [`smoke`, `flash`, `molotov`, `he`].includes(e.kind); return (0, E.jsxs)(`g`, { transform: `translate(${e.x} ${e.y})`, children: [e.kind === `ct` ? (0, E.jsx)(`rect`, { x: -19, y: -19, width: 38, height: 38, rx: 8, fill: n, stroke: `var(--canvas)`, strokeWidth: 3 }) : e.kind === `t` ? (0, E.jsx)(`circle`, { r: 21, fill: n, stroke: `var(--canvas)`, strokeWidth: 3 }) : (0, E.jsx)(`circle`, { r: 24, fill: `var(--canvas)`, stroke: n, strokeWidth: 3, strokeDasharray: e.kind === `smoke` ? `6 3` : void 0 }), r ? (0, E.jsx)(d, { type: e.kind, x: -16, y: -16, size: 32, style: { color: n } }) : (0, E.jsxs)(`text`, { textAnchor: `middle`, dominantBaseline: `central`, fill: `var(--marker-ink)`, fontSize: 17, fontWeight: 750, children: [e.kind === `ct` ? `C` : `T`, e.number || 1] }), e.label && (0, E.jsx)(`text`, { y: 48, textAnchor: `middle`, fill: `var(--text)`, stroke: `var(--canvas)`, strokeWidth: 4, paintOrder: `stroke`, fontSize: 18, children: e.label })] }); }
function O({ file: a, initialCode: o = ``, onEditCopy: s, onClose: c, onNotify: u }) { let d = (0, m.useRef)(null), g = (0, m.useRef)(null), _ = (0, m.useRef)(0), [v, y] = (0, m.useState)(o || !a ? `open` : `share`), [b, x] = (0, m.useState)(``), [C, O] = (0, m.useState)(o), [k, A] = (0, m.useState)(null), [j, M] = (0, m.useState)(!1), [N, P] = (0, m.useState)(``), [F, I] = (0, m.useState)(``), [L, R] = (0, m.useState)(!1), z = (0, m.useId)(), B = `share-route-${z.replace(/:/g, ``)}`; (0, m.useEffect)(() => (d.current?.showModal(), () => { _.current++; }), []), (0, m.useEffect)(() => { if (v !== `share` || !a)
    return; let e = ++_.current; M(!0), P(``), x(``), I(``), S(a, !L).then(t => { _.current === e && x(t); }).catch(t => { _.current === e && P(t instanceof Error ? t.message : `Could not create this share code.`); }).finally(() => { _.current === e && M(!1); }); }, [a, v, L]), (0, m.useEffect)(() => { o && V(o); }, [o]); async function V(e = C) { let t = ++_.current; M(!0), P(``), A(null); try {
    let n = await w(e);
    t === _.current && A(n);
}
catch (e) {
    t === _.current && P(e instanceof Error ? e.message : `Could not open this share code.`);
}
finally {
    t === _.current && M(!1);
} } function H(e) { _.current++, M(!1), P(``), I(``), y(e); } async function U(e, t) { try {
    if (!navigator.clipboard?.writeText)
        throw Error(`Clipboard unavailable`);
    await navigator.clipboard.writeText(e), I(t), u(`${t} copied.`);
}
catch {
    g.current?.focus(), g.current?.select(), P(`Clipboard access is unavailable. The code is selected; copy it with your device’s Copy command.`);
} } let W = n.find(e => e.id === k?.plan.mapId), G = W?.levels.find(e => e.id === k?.plan.levelId), K = G?.image || ``, q = k?.mapImage || (document.documentElement.dataset.theme === `light` && K.endsWith(`.svg`) ? K.replace(`.svg`, `-light.svg`) : K); return (0, E.jsxs)(`dialog`, { ref: d, className: `tactic-share-dialog`, onClose: c, "aria-labelledby": z, children: [(0, E.jsxs)(`header`, { className: `ts-heading`, children: [(0, E.jsxs)(`div`, { children: [(0, E.jsx)(`h2`, { id: z, children: v === `share` ? `Share this tactic` : k ? `Shared tactic preview` : `Open a share code` }), (0, E.jsx)(`p`, { children: v === `share` ? `Send a complete copy to a friend’s Utility Lab.` : `Preview safely, then choose whether to edit a copy.` })] }), (0, E.jsx)(`button`, { className: `icon-button`, "aria-label": `Close tactic sharing`, onClick: () => d.current?.close(), children: (0, E.jsx)(i, { size: 21 }) })] }), a && (0, E.jsxs)(`nav`, { className: `ts-tabs`, "aria-label": `Tactic sharing`, children: [(0, E.jsxs)(`button`, { "aria-pressed": v === `share`, onClick: () => H(`share`), children: [(0, E.jsx)(p, { size: 16 }), `Create code`] }), (0, E.jsxs)(`button`, { "aria-pressed": v === `open`, onClick: () => H(`open`), children: [(0, E.jsx)(t, { size: 16 }), `Open code`] })] }), (0, E.jsxs)(`div`, { className: `ts-content`, children: [v === `share` ? (0, E.jsxs)(E.Fragment, { children: [(0, E.jsxs)(`div`, { className: `ts-summary`, children: [(0, E.jsx)(`strong`, { children: a?.plan.name }), (0, E.jsxs)(`span`, { children: [n.find(e => e.id === a?.plan.mapId)?.name, ` · `, a?.plan.side, ` · `, a?.plan.objects.length, ` objects`, a?.mapImage ? ` · custom radar included` : ``] })] }), (0, E.jsx)(`label`, { className: `ts-label`, htmlFor: `${z}-code`, children: `Portable share code` }), (0, E.jsx)(`textarea`, { ref: g, id: `${z}-code`, className: `ts-code`, readOnly: !0, value: b, placeholder: j ? `Creating code…` : ``, spellCheck: !1 }), (0, E.jsxs)(`div`, { className: `ts-actions`, children: [(0, E.jsxs)(`button`, { className: `ts-button ts-primary`, disabled: j || !b, onClick: () => void U(b, `Share code`), children: [F === `Share code` ? (0, E.jsx)(r, { size: 16 }) : (0, E.jsx)(e, { size: 16 }), `Copy code`] }), (0, E.jsxs)(`button`, { className: `ts-button`, disabled: j || !b || b.length > 24e3, onClick: () => void U(T(b, location.href), `Share link`), children: [(0, E.jsx)(t, { size: 16 }), `Copy local link`] })] }), b.length > 24e3 && (0, E.jsx)(`p`, { className: `ts-note`, children: `This tactic is too large for a reliable link. Send the full code or export its JSON file.` }), (0, E.jsxs)(`label`, { className: `ts-check`, children: [(0, E.jsx)(`input`, { type: `checkbox`, checked: L, onChange: e => R(e.target.checked) }), `Compatibility code (larger, for older browsers)`] }), (0, E.jsx)(`p`, { className: `ts-note`, children: `Nothing is uploaded. Your friend pastes the code into their own local app. A local link works only when they run Utility Lab at the same address. This copy includes the current board and notes; later changes are separate.` })] }) : (0, E.jsxs)(E.Fragment, { children: [(0, E.jsxs)(`form`, { onSubmit: e => { e.preventDefault(), V(); }, children: [(0, E.jsx)(`label`, { className: `ts-label`, htmlFor: `${z}-input`, children: `Utility Lab code or share link` }), (0, E.jsx)(`textarea`, { autoFocus: !o, id: `${z}-input`, className: `ts-code`, value: C, onChange: e => { O(e.target.value), P(``), A(null); }, maxLength: h + 4096, placeholder: `UL1.…`, spellCheck: !1 }), (0, E.jsxs)(`button`, { className: `ts-button ts-primary`, disabled: j || !C.trim(), type: `submit`, children: [j ? (0, E.jsx)(f, { className: `ts-loading`, size: 16 }) : (0, E.jsx)(t, { size: 16 }), `Preview tactic`] })] }), k && (0, E.jsxs)(`section`, { className: `ts-preview`, "aria-label": `Read-only shared tactic preview`, children: [(0, E.jsxs)(`div`, { className: `ts-preview-title`, children: [(0, E.jsxs)(`div`, { children: [(0, E.jsx)(`h3`, { children: k.plan.name }), (0, E.jsxs)(`p`, { children: [W?.name, ` · `, G?.name, ` · `, k.plan.side, ` side · `, k.plan.objects.length, ` objects`] })] }), (0, E.jsx)(`span`, { children: `Read only` })] }), (0, E.jsxs)(`svg`, { className: `ts-preview-map`, viewBox: `0 0 1000 1000`, role: `img`, "aria-label": `${W?.name} ${G?.name} shared tactic, ${k.plan.objects.length} objects`, children: [(0, E.jsx)(`defs`, { children: (0, E.jsx)(`marker`, { id: B, markerWidth: `10`, markerHeight: `10`, refX: `8`, refY: `5`, orient: `auto`, markerUnits: `userSpaceOnUse`, children: (0, E.jsx)(`path`, { d: `M0 0 L10 5 L0 10 Z`, fill: `var(--marker-route)` }) }) }), (0, E.jsx)(`rect`, { width: 1e3, height: 1e3, fill: `var(--canvas)` }), (0, E.jsx)(`image`, { href: q, width: 1e3, height: 1e3, preserveAspectRatio: `xMidYMid meet` }), k.plan.objects.map(e => (0, E.jsx)(D, { object: e, arrowId: B }, e.id))] }), W?.credit && (0, E.jsx)(`p`, { className: `ts-map-credit`, children: W.credit.includes(`setpos.gg`) ? (0, E.jsx)(`a`, { href: `https://setpos.gg`, target: `_blank`, rel: `noreferrer`, children: `Minimaps by setpos.gg` }) : W.credit }), k.plan.illustrative && (0, E.jsx)(`p`, { className: `ts-note`, children: `This tactic includes illustrative example placements.` }), k.plan.notes && (0, E.jsxs)(`div`, { className: `ts-preview-notes`, children: [(0, E.jsx)(`h4`, { children: `Round notes` }), (0, E.jsx)(`p`, { children: k.plan.notes })] }), (0, E.jsxs)(`details`, { children: [(0, E.jsxs)(`summary`, { children: [`Objects (`, k.plan.objects.length, `)`] }), (0, E.jsx)(`ul`, { children: k.plan.objects.map(e => (0, E.jsx)(`li`, { children: l(e) }, e.id)) })] }), (0, E.jsx)(`p`, { className: `ts-note`, children: `Your existing board stays untouched while you preview. Edit a copy opens this map and floor; Undo restores its previous board.` }), (0, E.jsx)(`button`, { className: `ts-button ts-primary`, onClick: () => { s(k), d.current?.close(); }, children: `Edit a copy` })] })] }), N && (0, E.jsx)(`p`, { className: `ts-error`, role: `alert`, children: N }), j && v === `share` && (0, E.jsx)(`p`, { className: `ts-note`, role: `status`, children: `Creating a portable code…` })] })] }); }
export { O as default, f as n, p as t };
