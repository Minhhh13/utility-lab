import { M as e, Y as t, _ as n, m as r } from "./index-CPA0TY-O.js";
var i = t(`upload`, [[`path`, { d: `M12 3v12`, key: `1x0j5s` }], [`path`, { d: `m17 8-5-5-5 5`, key: `7q97r8` }], [`path`, { d: `M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`, key: `ih7n3h` }]]), a = `utility-lab:playbooks:v1`, o = `utility-lab:playbook-draft:v1`, s = `utility-lab:tactics:v1`, c = 25e7, l = e => !!e && typeof e == `object` && !Array.isArray(e), u = (e, t) => typeof e == `string` && e.length <= t;
function d(e) { return !Array.isArray(e) || e.length > 100 || !e.every(e => u(e, 160) && !!e.trim()) ? null : [...new Set(e)]; }
function f(e) { if (!l(e) || !u(e.id, 100) || !e.id.trim() || !u(e.name, 100) || !e.name.trim() || !u(e.notes ?? ``, 2e3))
    return null; let t = d(e.tacticIds ?? []), n = d(e.lineupIds ?? []); if (!t || !n || e.steps !== void 0 && (!Array.isArray(e.steps) || e.steps.length > 40))
    return null; let r = [], i = new Set; for (let a of e.steps ?? []) {
    if (!l(a) || !u(a.id, 100) || !a.id.trim() || i.has(a.id) || !u(a.title, 120) || !a.title.trim() || !u(a.role ?? ``, 100) || !u(a.timing ?? ``, 80) || !u(a.notes ?? ``, 1e3) || a.tacticId !== void 0 && (!u(a.tacticId, 160) || !a.tacticId.trim()) || a.lineupId !== void 0 && (!u(a.lineupId, 160) || !a.lineupId.trim()))
        return null;
    i.add(a.id), r.push({ id: a.id, title: a.title.trim(), role: a.role ?? ``, timing: a.timing ?? ``, notes: a.notes ?? ``, ...a.tacticId ? { tacticId: a.tacticId } : {}, ...a.lineupId ? { lineupId: a.lineupId } : {} }), a.tacticId && !t.includes(a.tacticId) && t.push(a.tacticId), a.lineupId && !n.includes(a.lineupId) && n.push(a.lineupId);
} return t.length > 100 || n.length > 100 ? null : { id: e.id, name: e.name.trim(), notes: e.notes ?? ``, tacticIds: t, lineupIds: n, steps: r }; }
function p(e) { if (!Array.isArray(e))
    return []; let t = new Set; return e.slice(0, 100).flatMap(e => { let n = f(e); return !n || t.has(n.id) ? [] : (t.add(n.id), [n]); }); }
function m() { try {
    return p(JSON.parse(localStorage.getItem(`utility-lab:playbooks:v1`) || `[]`));
}
catch {
    return [];
} }
function h() { try {
    let e = JSON.parse(sessionStorage.getItem(`utility-lab:playbook-draft:v1`) || `null`);
    if (!l(e) || !(e.editingId === null || u(e.editingId, 100)))
        return null;
    let t = e.editingId, n = f({ ...e, name: u(e.name, 100) && e.name.trim() ? e.name : `Untitled playbook`, steps: Array.isArray(e.steps) ? e.steps.map(e => l(e) ? { ...e, title: u(e.title, 120) && e.title.trim() ? e.title : `Untitled step` } : e) : [] });
    return n ? { ...n, name: u(e.name, 100) ? e.name : ``, steps: n.steps.map((t, n) => ({ ...t, title: l(e.steps?.[n]) && u(e.steps[n].title, 120) ? e.steps[n].title : t.title })), editingId: t } : null;
}
catch {
    return null;
} }
function g(e, t, n) { return { format: `utility-lab-playbook`, version: 1, book: e, tactics: t.filter(t => e.tacticIds.includes(t.id)), lineups: n.filter(t => e.lineupIds.includes(t.id)) }; }
function _(t) { if (!l(t) || t.format !== `utility-lab-playbook` || t.version !== 1 || !l(t.book))
    throw Error(`Choose a Utility Lab playbook JSON file (version 1).`); let i = f({ ...t.book, id: t.book.id || r() }); if (!i)
    throw Error(`This playbook contains invalid names, references or round steps.`); if (!Array.isArray(t.tactics) || t.tactics.length > 100 || !Array.isArray(t.lineups) || t.lineups.length > 100)
    throw Error(`The playbook has too many records or is missing its tactics/lineups arrays.`); let a = n(t.tactics); if (a.length !== t.tactics.length)
    throw Error(`A saved tactic is invalid or has a duplicate ID. Nothing was imported.`); let o = [], s = new Set; for (let n of t.lineups) {
    if (l(n) && (typeof n.image == `string` && n.image.startsWith(`ul-media:`) || Array.isArray(n.photos) && n.photos.some(e => l(e) && typeof e.image == `string` && e.image.startsWith(`ul-media:`))))
        throw Error(`This file contains device-only image references. Export the playbook again from its original device to include the photos.`);
    let t = e(n);
    if (!t || s.has(t.id))
        throw Error(`A lineup is invalid or has a duplicate ID. Nothing was imported.`);
    o.push(t), s.add(t.id);
} return { format: `utility-lab-playbook`, version: 1, book: i, tactics: a, lineups: o }; }
var v = (t, n) => JSON.stringify(e(t)) === JSON.stringify(e(n));
function y(e, t, n = [], i = r) { let a = [...t.books], o = [...t.tactics], s = [...t.lineups]; if (a.length >= 100)
    throw Error(`This browser has 100 playbooks. Export and remove one before importing another.`); let c = new Map, l = new Map; function u(e) { let t = i(), n = 0; for (; e.has(t) && n++ < 20;)
    t = i(); if (e.has(t))
    throw Error(`Could not allocate a new record ID. Please retry.`); return e.add(t), t; } let d = new Set(o.map(e => e.id)), f = new Set([...s, ...n].map(e => e.id)); for (let t of e.tactics) {
    let e = o.find(e => e.id === t.id);
    if (e && JSON.stringify(e.plan) === JSON.stringify(t.plan)) {
        c.set(t.id, e.id);
        continue;
    }
    let n = d.has(t.id) ? u(d) : t.id;
    d.add(n), c.set(t.id, n), o.push({ ...t, id: n });
} for (let t of e.lineups) {
    let e = [...s, ...n].find(e => e.id === t.id && v(e, t));
    if (e) {
        l.set(t.id, e.id);
        continue;
    }
    let r = f.has(t.id) ? u(f) : t.id;
    f.add(r), l.set(t.id, r), s.push({ ...t, id: r, userCreated: !0 });
} if (o.length > 100 || s.length > 80)
    throw Error(`This import exceeds this browser's limit of 100 tactics or 80 personal lineups. Export and remove records first.`); for (let t of e.book.tacticIds)
    c.has(t) || c.set(t, d.has(t) ? u(d) : t); for (let t of e.book.lineupIds)
    l.has(t) || l.set(t, n.some(e => e.id === t) ? t : f.has(t) ? u(f) : t); let p = a.some(t => t.id === e.book.id) ? u(new Set(a.map(e => e.id))) : e.book.id, m = { ...e.book, id: p, tacticIds: e.book.tacticIds.map(e => c.get(e)), lineupIds: e.book.lineupIds.map(e => l.get(e)), steps: e.book.steps.map(e => ({ ...e, ...e.tacticId ? { tacticId: c.get(e.tacticId) } : {}, ...e.lineupId ? { lineupId: l.get(e.lineupId) } : {} })) }; return a.unshift(m), { books: a, tactics: o, lineups: s, importedBook: m, missingReferences: m.tacticIds.filter(e => !o.some(t => t.id === e)).length + m.lineupIds.filter(e => ![...s, ...n].some(t => t.id === e)).length }; }
function b(e, t) { let n = Object.fromEntries(Object.keys(t).map(t => [t, e.getItem(t)])), r = []; try {
    for (let [n, i] of Object.entries(t))
        e.setItem(n, i), r.push(n);
}
catch (t) {
    for (let t of r.reverse())
        try {
            n[t] === null ? e.removeItem(t) : e.setItem(t, n[t]);
        }
        catch { }
    throw t;
} }
export { g as a, b as c, f as d, p as f, s as i, h as l, c as n, y as o, i as p, o as r, _ as s, a as t, m as u };
