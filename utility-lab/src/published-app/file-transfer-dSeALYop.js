const __vite__mapDeps = (i, m = __vite__mapDeps, d = (m.f || (m.f = ["assets/esm-Crldx1GW.js", "assets/index-CPA0TY-O.js", "assets/index-C08tv5ZB.css", "assets/esm-DEokVX8d.js"]))) => i.map(i => d[i]);
import { Y as e, t } from "./index-CPA0TY-O.js";
var n = e(`download`, [[`path`, { d: `M12 15V3`, key: `m9g1x1` }], [`path`, { d: `M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`, key: `ih7n3h` }], [`path`, { d: `m7 10 5 5 5-5`, key: `brsn70` }]]), r;
(function (e) { e.Unimplemented = `UNIMPLEMENTED`, e.Unavailable = `UNAVAILABLE`; })(r || (r = {}));
var i = class extends Error {
    constructor(e, t, n) { super(e), this.message = e, this.code = t, this.data = n; }
}, a = e => e?.androidBridge ? `android` : e?.webkit?.messageHandlers?.bridge ? `ios` : `web`, o = e => { let t = e.CapacitorCustomPlatform || null, n = e.Capacitor || {}, o = n.Plugins = n.Plugins || {}, s = () => t === null ? a(e) : t.name, c = () => s() !== `web`, l = e => !!(f.get(e)?.platforms.has(s()) || u(e)), u = e => n.PluginHeaders?.find(t => t.name === e), d = t => e.console.error(t), f = new Map; return n.convertFileSrc || (n.convertFileSrc = e => e), n.getPlatform = s, n.handleError = d, n.isNativePlatform = c, n.isPluginAvailable = l, n.registerPlugin = (e, a = {}) => { let c = f.get(e); if (c)
    return console.warn(`Capacitor plugin "${e}" already registered. Cannot register plugins twice.`), c.proxy; let l = s(), d = u(e), p, m = async () => (!p && l in a ? p = p = typeof a[l] == `function` ? await a[l]() : a[l] : t !== null && !p && `web` in a && (p = p = typeof a.web == `function` ? await a.web() : a.web), p), h = (t, a) => { if (d) {
    let r = d?.methods.find(e => a === e.name);
    if (r)
        return r.rtype === `promise` ? t => n.nativePromise(e, a.toString(), t) : (t, r) => n.nativeCallback(e, a.toString(), t, r);
    if (t)
        return t[a]?.bind(t);
}
else if (t)
    return t[a]?.bind(t);
else
    throw new i(`"${e}" plugin is not implemented on ${l}`, r.Unimplemented); }, g = t => { let n, a = (...a) => { let o = m().then(o => { let s = h(o, t); if (s) {
    let e = s(...a);
    return n = e?.remove, e;
}
else
    throw new i(`"${e}.${t}()" is not implemented on ${l}`, r.Unimplemented); }); return t === `addListener` && (o.remove = async () => n()), o; }; return a.toString = () => `${t.toString()}() { [capacitor code] }`, Object.defineProperty(a, `name`, { value: t, writable: !1, configurable: !1 }), a; }, _ = g(`addListener`), v = g(`removeListener`), y = (e, t) => { let n = _({ eventName: e }, t), r = async () => { v({ eventName: e, callbackId: await n }, t); }, i = new Promise(e => n.then(() => e({ remove: r }))); return i.remove = async () => { console.warn(`Using addListener() without 'await' is deprecated.`), await r(); }, i; }, b = new Proxy({}, { get(e, t) { switch (t) {
        case `$$typeof`: return;
        case `toJSON`: return () => ({});
        case `addListener`: return d ? y : _;
        case `removeListener`: return v;
        default: return g(t);
    } } }); return o[e] = b, f.set(e, { name: e, proxy: b, platforms: new Set([...Object.keys(a), ...d ? [l] : []]) }), b; }, n.Exception = i, n.DEBUG = !!n.DEBUG, n.isLoggingEnabled = !!n.isLoggingEnabled, n; }, s = (e => e.Capacitor = o(e))(typeof globalThis < `u` ? globalThis : typeof self < `u` ? self : typeof window < `u` ? window : typeof global < `u` ? global : {}), c = s.registerPlugin, l = class {
    constructor() { this.listeners = {}, this.retainedEventArguments = {}, this.windowListeners = {}; }
    addListener(e, t) { let n = !1; this.listeners[e] || (this.listeners[e] = [], n = !0), this.listeners[e].push(t); let r = this.windowListeners[e]; return r && !r.registered && this.addWindowListener(r), n && this.sendRetainedArgumentsForEvent(e), Promise.resolve({ remove: async () => this.removeListener(e, t) }); }
    async removeAllListeners() { this.listeners = {}; for (let e in this.windowListeners)
        this.removeWindowListener(this.windowListeners[e]); this.windowListeners = {}; }
    notifyListeners(e, t, n) { let r = this.listeners[e]; if (!r) {
        if (n) {
            let n = this.retainedEventArguments[e];
            n || (n = []), n.push(t), this.retainedEventArguments[e] = n;
        }
        return;
    } r.forEach(e => e(t)); }
    hasListeners(e) { return !!this.listeners[e]?.length; }
    registerWindowListener(e, t) { this.windowListeners[t] = { registered: !1, windowEventName: e, pluginEventName: t, handler: e => { this.notifyListeners(t, e); } }; }
    unimplemented(e = `not implemented`) { return new s.Exception(e, r.Unimplemented); }
    unavailable(e = `not available`) { return new s.Exception(e, r.Unavailable); }
    async removeListener(e, t) { let n = this.listeners[e]; if (!n)
        return; let r = n.indexOf(t); r !== -1 && this.listeners[e].splice(r, 1), this.listeners[e].length || this.removeWindowListener(this.windowListeners[e]); }
    addWindowListener(e) { window.addEventListener(e.windowEventName, e.handler), e.registered = !0; }
    removeWindowListener(e) { e && (window.removeEventListener(e.windowEventName, e.handler), e.registered = !1); }
    sendRetainedArgumentsForEvent(e) { let t = this.retainedEventArguments[e]; t && (delete this.retainedEventArguments[e], t.forEach(t => { this.notifyListeners(e, t); })); }
}, u = e => encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape), d = e => e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent), f = class extends l {
    async getCookies() { let e = document.cookie, t = {}; return e.split(`;`).forEach(e => { if (e.length <= 0)
        return; let [n, r] = e.replace(/=/, `CAP_COOKIE`).split(`CAP_COOKIE`); n = d(n).trim(), r = d(r).trim(), t[n] = r; }), t; }
    async setCookie(e) { try {
        let t = u(e.key), n = u(e.value), r = e.expires ? `; expires=${e.expires.replace(`expires=`, ``)}` : ``, i = (e.path || `/`).replace(`path=`, ``), a = e.url != null && e.url.length > 0 ? `domain=${e.url}` : ``;
        document.cookie = `${t}=${n || ``}${r}; path=${i}; ${a};`;
    }
    catch (e) {
        return Promise.reject(e);
    } }
    async deleteCookie(e) { try {
        document.cookie = `${e.key}=; Max-Age=0`;
    }
    catch (e) {
        return Promise.reject(e);
    } }
    async clearCookies() { try {
        let e = document.cookie.split(`;`) || [];
        for (let t of e)
            document.cookie = t.replace(/^ +/, ``).replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    }
    catch (e) {
        return Promise.reject(e);
    } }
    async clearAllCookies() { try {
        await this.clearCookies();
    }
    catch (e) {
        return Promise.reject(e);
    } }
};
c(`CapacitorCookies`, { web: () => new f });
var p = async (e) => new Promise((t, n) => { let r = new FileReader; r.onload = () => { let e = r.result; t(e.indexOf(`,`) >= 0 ? e.split(`,`)[1] : e); }, r.onerror = e => n(e), r.readAsDataURL(e); }), m = (e = {}) => { let t = Object.keys(e); return Object.keys(e).map(e => e.toLocaleLowerCase()).reduce((n, r, i) => (n[r] = e[t[i]], n), {}); }, h = (e, t = !0) => e ? Object.entries(e).reduce((e, n) => { let [r, i] = n, a, o; return Array.isArray(i) ? (o = ``, i.forEach(e => { a = t ? encodeURIComponent(e) : e, o += `${r}=${a}&`; }), o.slice(0, -1)) : (a = t ? encodeURIComponent(i) : i, o = `${r}=${a}`), `${e}&${o}`; }, ``).substr(1) : null, g = (e, t = {}) => { let n = Object.assign({ method: e.method || `GET`, headers: e.headers }, t), r = m(e.headers)[`content-type`] || ``; if (typeof e.data == `string`)
    n.body = e.data;
else if (r.includes(`application/x-www-form-urlencoded`)) {
    let t = new URLSearchParams;
    for (let [n, r] of Object.entries(e.data || {}))
        t.set(n, r);
    n.body = t.toString();
}
else if (r.includes(`multipart/form-data`) || e.data instanceof FormData) {
    let t = new FormData;
    if (e.data instanceof FormData)
        e.data.forEach((e, n) => { t.append(n, e); });
    else
        for (let n of Object.keys(e.data))
            t.append(n, e.data[n]);
    n.body = t;
    let r = new Headers(n.headers);
    r.delete(`content-type`), n.headers = r;
}
else
    (r.includes(`application/json`) || typeof e.data == `object`) && (n.body = JSON.stringify(e.data)); return n; }, _ = class extends l {
    async request(e) { let t = g(e, e.webFetchExtra), n = h(e.params, e.shouldEncodeUrlParams), r = n ? `${e.url}?${n}` : e.url, i = await fetch(r, t), a = i.headers.get(`content-type`) || ``, { responseType: o = `text` } = i.ok ? e : {}; a.includes(`application/json`) && (o = `json`); let s, c; switch (o) {
        case `arraybuffer`:
        case `blob`:
            c = await i.blob(), s = await p(c);
            break;
        case `json`:
            s = await i.json();
            break;
        default: s = await i.text();
    } let l = {}; return i.headers.forEach((e, t) => { l[t] = e; }), { data: s, headers: l, status: i.status, url: i.url }; }
    async get(e) { return this.request(Object.assign(Object.assign({}, e), { method: `GET` })); }
    async post(e) { return this.request(Object.assign(Object.assign({}, e), { method: `POST` })); }
    async put(e) { return this.request(Object.assign(Object.assign({}, e), { method: `PUT` })); }
    async patch(e) { return this.request(Object.assign(Object.assign({}, e), { method: `PATCH` })); }
    async delete(e) { return this.request(Object.assign(Object.assign({}, e), { method: `DELETE` })); }
};
c(`CapacitorHttp`, { web: () => new _ });
var v;
(function (e) { e.Dark = `DARK`, e.Light = `LIGHT`, e.Default = `DEFAULT`; })(v || (v = {}));
var y;
(function (e) { e.StatusBar = `StatusBar`, e.NavigationBar = `NavigationBar`; })(y || (y = {}));
var b = class extends l {
    async setStyle() { this.unavailable(`not available for web`); }
    async setAnimation() { this.unavailable(`not available for web`); }
    async show() { this.unavailable(`not available for web`); }
    async hide() { this.unavailable(`not available for web`); }
};
c(`SystemBars`, { web: () => new b });
function x(e) { return e.replace(/[\\/:*?"<>|\u0000-\u001f]/g, `_`).replace(/^\.+/, ``).trim().slice(0, 180) || `utility-lab-export`; }
function S(e) { return new Promise((t, n) => { let r = new FileReader; r.onload = () => { let e = String(r.result), i = e.indexOf(`,`); i < 0 ? n(Error(`The export could not be prepared.`)) : t(e.slice(i + 1)); }, r.onerror = () => n(Error(`The export could not be read. Your saved records are unchanged.`)), r.readAsDataURL(e); }); }
async function C(e, n) { let r = x(n); if (!s.isNativePlatform()) {
    let t = URL.createObjectURL(e), n = document.createElement(`a`);
    n.href = t, n.download = r, document.body.append(n);
    try {
        n.click();
    }
    finally {
        n.remove(), setTimeout(() => URL.revokeObjectURL(t), 1e3);
    }
    return;
} let [{ Filesystem: i, Directory: a, Encoding: o }, { Share: c }] = await Promise.all([t(() => import(`./esm-Crldx1GW.js`), __vite__mapDeps([0, 1, 2])), t(() => import(`./esm-DEokVX8d.js`), __vite__mapDeps([3, 1, 2]))]); if (!(await c.canShare()).value)
    throw Error(`This device cannot open a share sheet. Your saved records are unchanged.`); let l = `utility-lab-exports/${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`, u = `${l}/${r}`, d = !1; try {
    let t = e.type.includes(`json`) || e.type.startsWith(`text/`), n = await i.writeFile({ path: u, directory: a.Cache, recursive: !0, data: t ? await e.text() : await S(e), ...t ? { encoding: o.UTF8 } : {} });
    d = !0, await c.share({ title: r, files: [n.uri], dialogTitle: `Export from Utility Lab` });
}
catch (e) {
    let t = e instanceof Error ? e.message : String(e);
    throw /cancel(?:led|ed)?|dismiss/i.test(t) ? new DOMException(`Export cancelled. Your saved records are unchanged.`, `AbortError`) : Error(d ? `The export could not be shared. Try Export again; your saved records are unchanged.` : `The export could not be written to this device. Check available storage and try again.`);
}
finally {
    try {
        await i.rmdir({ path: l, directory: a.Cache, recursive: !0 });
    }
    catch { }
} }
export { n as a, c as i, l as n, g as r, C as t };
