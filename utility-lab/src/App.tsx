import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  CloudOff,
  Crosshair,
  FlaskConical,
  Info,
  Layers2,
  Map,
  Menu,
  Monitor,
  Search,
  ShieldCheck,
  Waypoints,
  X,
} from "lucide-react";
import { MAPS } from "./maps";
import TacticBoard from "./TacticBoard";

type Notice = { message: string; id: number };
export default function App() {
  const [mapId, setMapId] = useState(() => {
    try {
      return localStorage.getItem("ul:last-map") || "mirage";
    } catch {
      return "mirage";
    }
  });
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("All modes");
  const [compact, setCompact] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [narrow, setNarrow] = useState(
    () => window.matchMedia("(max-width: 800px)").matches,
  );
  const [notice, setNotice] = useState<Notice | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [helpTab, setHelpTab] = useState<"help" | "roadmap">("help");
  const dialog = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const selectedMap = MAPS.find((m) => m.id === mapId) || MAPS[0];
  const mapModes = ["All modes", ...new Set(MAPS.map((m) => m.mode))];
  const visibleMaps = MAPS.filter(
    (m) =>
      (!query ||
        `${m.name} ${m.mode}`.toLowerCase().includes(query.toLowerCase())) &&
      (mode === "All modes" || m.mode === mode),
  );

  function selectMap(id: string) {
    setMapId(id);
    setSidebarOpen(false);
    try {
      localStorage.setItem("ul:last-map", id);
    } catch {
      /* Board saves report errors separately. */
    }
  }
  function notify(message: string) {
    setNotice({ message, id: Date.now() });
  }
  function openHelp(tab: "help" | "roadmap" = "help") {
    setHelpTab(tab);
    dialog.current?.showModal();
  }
  useEffect(() => {
    const media = window.matchMedia("(max-width: 800px)");
    const update = () => setNarrow(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!narrow || !sidebarOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setSidebarOpen(false);
      }
      if (e.key === "Tab") {
        const items = Array.from(
          sidebarRef.current?.querySelectorAll<HTMLElement>(
            "a,button:not(:disabled),input,select",
          ) || [],
        );
        if (!items.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handle);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [narrow, sidebarOpen]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then((registration) =>
        registration.active?.postMessage({
          type: "CACHE_MAP",
          url: selectedMap.levels[0].image,
        }),
      );
    }
  }, [selectedMap]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.matches("input,textarea,select,[contenteditable=true]") ||
        dialog.current?.open
      )
        return;
      if (e.key === "?") {
        e.preventDefault();
        openHelp();
      }
      if (e.key === "/" && !compact) {
        e.preventDefault();
        setSidebarOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [compact]);

  return (
    <div
      className={`app-shell${compact ? " is-compact" : ""}${sidebarOpen ? " sidebar-open" : ""}`}
    >
      <a className="skip-link" href="#workspace">
        Skip to tactic board
      </a>
      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close map navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        className="app-sidebar"
        aria-label="Workspace navigation"
        inert={narrow && !sidebarOpen}
        role={narrow ? "dialog" : undefined}
        aria-modal={narrow && sidebarOpen ? true : undefined}
      >
        <button
          className="icon-button sidebar-close"
          aria-label="Close map navigation"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={19} />
        </button>
        <a
          className="brand"
          href="#workspace"
          onClick={() => setSidebarOpen(false)}
          aria-label="Utility Lab home"
        >
          <span className="brand-mark">
            <Waypoints size={23} strokeWidth={2.1} />
          </span>
          <span>
            utility<span className="brand-light">lab</span>
            <span className="brand-dot">.</span>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main">
          <a
            href="#workspace"
            className="nav-item is-active"
            aria-current="page"
          >
            <Layers2 size={18} />
            <span>Tactic board</span>
            <span className="nav-active-dot" />
          </a>
          <button
            className="nav-item next-feature"
            onClick={() => openHelp("roadmap")}
          >
            <FlaskConical size={18} />
            <span>Utility library</span>
            <span className="soon-label">Next</span>
          </button>
          <button
            className="nav-item next-feature"
            onClick={() => openHelp("roadmap")}
          >
            <BookOpen size={18} />
            <span>Playbook</span>
            <span className="soon-label">Later</span>
          </button>
        </nav>
        <div className="map-section-heading">
          <h2>Maps</h2>
          <span>{MAPS.length}</span>
        </div>
        <div className="map-search">
          <Search size={15} />
          <input
            ref={searchRef}
            aria-label="Search maps"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a map…"
          />
          <kbd>/</kbd>
        </div>
        <div className="mode-filter">
          <select
            aria-label="Filter maps by game mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {mapModes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <ChevronDown size={12} />
        </div>
        <nav className="map-list" aria-label="Choose map">
          {visibleMaps.map((m) => (
            <button
              className={`map-item${selectedMap.id === m.id ? " is-selected" : ""}`}
              key={m.id}
              onClick={() => selectMap(m.id)}
              aria-pressed={selectedMap.id === m.id}
            >
              <span className="map-thumb">
                {m.levels[0]?.image ? (
                  <img
                    loading="lazy"
                    src={(m.levels[0].radarImage || m.levels[0].image).replace(
                      "/maps/",
                      "/map-thumbnails/",
                    )}
                    alt=""
                  />
                ) : (
                  <Map size={21} />
                )}
              </span>
              <span className="map-item-text">
                <span>{m.name}</span>
                <small>{m.mode}</small>
              </span>
              {selectedMap.id === m.id && (
                <span className="map-selected-mark">
                  <Check size={13} />
                </span>
              )}
            </button>
          ))}
          {!visibleMaps.length && (
            <div className="map-empty">
              <Search size={24} />
              <p>No matching maps</p>
              <button
                onClick={() => {
                  setQuery("");
                  setMode("All modes");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="local-status">
            <ShieldCheck size={17} />
            <div>
              <strong>Your local workspace</strong>
              <span>No account. Just your game plan.</span>
            </div>
          </div>
          <button className="help-button" onClick={() => openHelp()}>
            <CircleHelp size={16} />
            <span>Help & shortcuts</span>
            <kbd>?</kbd>
          </button>
        </div>
      </aside>

      <main
        className="app-main"
        id="workspace"
        tabIndex={-1}
        inert={narrow && sidebarOpen}
      >
        <header className="app-header">
          <div className="page-identity">
            <button
              className="icon-button mobile-menu"
              aria-label="Open map navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>
            <h1>Tactic board</h1>
            <span className="draft-tag">Local draft</span>
          </div>
          <div className="header-actions">
            {!online && (
              <span className="connection-state">
                <CloudOff size={14} />
                Offline
              </span>
            )}
            <button
              className={`overlay-button${compact ? " pressed" : ""}`}
              onClick={() => setCompact(!compact)}
              aria-pressed={compact}
            >
              <Monitor size={16} />
              <span>{compact ? "Exit in-game view" : "In-game view"}</span>
            </button>
            <button
              className="icon-button"
              aria-label="Help and keyboard shortcuts"
              onClick={() => openHelp()}
            >
              <CircleHelp size={19} />
            </button>
          </div>
        </header>
        <div className="map-context">
          <div className="map-context-name">
            <Crosshair size={18} />
            {compact ? (
              <select
                aria-label="Choose map"
                value={selectedMap.id}
                onChange={(e) => selectMap(e.target.value)}
              >
                {MAPS.map((m) => (
                  <option value={m.id} key={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            ) : (
              <h2>{selectedMap.name}</h2>
            )}
            <span className="context-divider" />
            <span>{selectedMap.mode}</span>
          </div>
          <span className="context-description">
            Think it through. Draw it out.
          </span>
          <button
            className="mobile-map-select"
            onClick={() => setSidebarOpen(true)}
            aria-label="Change map"
          >
            Change map <ChevronDown size={13} />
          </button>
        </div>
        <TacticBoard key={selectedMap.id} map={selectedMap} onNotify={notify} />
      </main>

      {notice && (
        <div className="app-notice" role="status">
          <Info size={17} />
          <span>{notice.message}</span>
          <button aria-label="Dismiss message" onClick={() => setNotice(null)}>
            <X size={16} />
          </button>
        </div>
      )}
      <dialog
        className="help-dialog"
        ref={dialog}
        aria-labelledby="help-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="dialog-top">
          <span className="brand-mark small">
            <Waypoints size={20} />
          </span>
          <button
            className="icon-button"
            onClick={() => dialog.current?.close()}
            aria-label="Close help"
          >
            <X size={20} />
          </button>
        </div>
        {helpTab === "roadmap" ? (
          <>
            <h2 id="help-title">Build the plan first.</h2>
            <p>
              This local draft focuses on the tactic board. The utility library
              and playbook are the next stages.
            </p>
            <ol className="roadmap">
              <li>
                <span className="roadmap-check">
                  <Check size={17} />
                </span>
                <div>
                  <strong>Tactic board</strong>
                  <p>
                    All game modes, drawing tools, local saves, and portable
                    tactic files. Available in this draft.
                  </p>
                </div>
              </li>
              <li>
                <FlaskConical size={19} />
                <div>
                  <strong>Utility library</strong>
                  <p>
                    Map-based smoke, flash, molotov, and grenade lineups with
                    screenshots and throw instructions.
                  </p>
                </div>
              </li>
              <li>
                <BookOpen size={19} />
                <div>
                  <strong>Playbook</strong>
                  <p>
                    Organize utility and tactics into a reusable team game plan.
                  </p>
                </div>
              </li>
            </ol>
          </>
        ) : (
          <>
            <h2 id="help-title">A little prep. A better round.</h2>
            <p>
              Choose a map, place your team, and draw the execute. Your drafts
              stay in this browser. Export a tactic file for a portable backup.
            </p>
            <div className="shortcut-list">
              <span>Choose a map</span>
              <kbd>/</kbd>
              <span>Show this guide</span>
              <kbd>?</kbd>
              <span>Undo a board edit</span>
              <kbd>Ctrl / ⌘ Z</kbd>
              <span>Move selected object</span>
              <kbd>Arrow keys</kbd>
              <span>Delete selected object</span>
              <kbd>Delete</kbd>
            </div>
            <p className="help-note">
              Board controls also support keyboard placement and position
              fields. A map's level selector switches floors or arenas. In-game
              view gives the board more room in the Steam overlay.
            </p>
            <div className="privacy-note">
              <ShieldCheck size={18} />
              <span>
                Drafts and imported radar images stay on this device. Clearing
                browser storage removes them, so export anything you want to
                keep.
              </span>
            </div>
          </>
        )}
        <div className="dialog-bottom">
          <button
            className="primary-button"
            onClick={() => dialog.current?.close()}
          >
            Back to the board <ArrowUpRight size={16} />
          </button>
        </div>
      </dialog>
    </div>
  );
}
