import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  CloudOff,
  FlaskConical,
  Info,
  Layers2,
  Map,
  Monitor,
  Moon,
  Palette,
  Search,
  ShieldCheck,
  Sun,
  Waypoints,
  X,
} from "lucide-react";
import { MAPS } from "./maps";
import TacticBoard from "./TacticBoard";
import Utilities from "./Utilities";
import LaunchScreen from "./LaunchScreen";
import WorkspaceLibrary from "./WorkspaceLibrary";
import { uid, type SavedTactic } from "./board-model";

type ThemeMode = "light" | "dark" | "system";
type ColorPalette = "cobalt" | "ember" | "mint" | "rose";
type View = "home" | "board" | "utilities" | "playbooks" | "stats";
const navigation = [
  { id: "board", name: "Tactic board", Icon: Layers2 },
  { id: "utilities", name: "Lineups", Icon: FlaskConical },
  { id: "playbooks", name: "Playbooks", Icon: BookOpen },
  { id: "stats", name: "Stats", Icon: BarChart3 },
] as const;
function readView(): View {
  const value = location.hash.slice(1);
  return ["board", "utilities", "playbooks", "stats"].includes(value)
    ? (value as View)
    : "home";
}
function readAppearance(): { mode: ThemeMode; palette: ColorPalette } {
  try {
    const value = JSON.parse(localStorage.getItem("ul:appearance") || "null");
    return {
      mode: ["light", "dark", "system"].includes(value?.mode)
        ? value.mode
        : "light",
      palette: ["cobalt", "ember", "mint", "rose"].includes(value?.palette)
        ? value.palette
        : "cobalt",
    };
  } catch {
    return { mode: "light", palette: "cobalt" };
  }
}

export default function App() {
  const [mapId, setMapId] = useState(() => {
    try {
      return localStorage.getItem("ul:last-map") || "mirage";
    } catch {
      return "mirage";
    }
  });
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("All maps");
  const [activeTab, setActiveTab] = useState<View>(readView);
  const [openedTactic, setOpenedTactic] = useState<{
    record: SavedTactic;
    token: string;
  } | null>(null);
  const [side, setSide] = useState<"T" | "CT">("T");
  const [appearance, setAppearance] = useState(readAppearance);
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [compact, setCompact] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const mapsDialog = useRef<HTMLDialogElement>(null);
  const helpDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const appearanceMenu = useRef<HTMLDetailsElement>(null);
  const theme =
    appearance.mode === "system"
      ? systemDark
        ? "dark"
        : "light"
      : appearance.mode;
  const selectedMap = MAPS.find((map) => map.id === mapId) || MAPS[0];
  const modes = ["All maps", "Active Duty", "FACEIT"];
  const visibleMaps = MAPS.filter(
    (map) =>
      (!query ||
        `${map.name} ${map.mode}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (mode === "All maps" ||
        (mode === "Active Duty" ? map.activeDuty : map.faceit)),
  );

  function openMaps() {
    setQuery("");
    mapsDialog.current?.showModal();
    requestAnimationFrame(() => searchInput.current?.focus());
  }
  function chooseMap(id: string) {
    mapsDialog.current?.close();
    setMapId(id);
    setOpenedTactic(null);
    try {
      localStorage.setItem("ul:last-map", id);
    } catch {
      /* Board saves provide their own recovery status. */
    }
    requestAnimationFrame(() =>
      document.querySelector<SVGSVGElement>(".tb-map")?.focus(),
    );
  }
  function openHelp() {
    helpDialog.current?.showModal();
  }
  function navigate(view: View) {
    setOpenedTactic(null);
    setActiveTab(view);
    setNotice(null);
    appearanceMenu.current?.removeAttribute("open");
    if (location.hash !== `#${view}`) location.hash = view;
    window.scrollTo(0, 0);
  }
  function openSavedTactic(record: SavedTactic) {
    if (!MAPS.some((map) => map.id === record.plan.mapId)) {
      setNotice("That map is outside the Active Duty and FACEIT pool.");
      return;
    }
    navigate("board");
    setMapId(record.plan.mapId);
    setOpenedTactic({ record, token: uid() });
  }
  useEffect(() => {
    const update = () => setActiveTab(readView());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.palette = appearance.palette;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#171b20" : "#f5f5f2");
    try {
      localStorage.setItem("ul:appearance", JSON.stringify(appearance));
    } catch {
      /* Session appearance still works. */
    }
  }, [theme, appearance]);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!appearanceMenu.current?.contains(event.target as Node))
        appearanceMenu.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

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
    const handle = (event: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      const target = event.target as HTMLElement;
      if (
        target.matches("input,textarea,select,[contenteditable=true]") ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      if (event.key === "/") {
        event.preventDefault();
        openMaps();
      }
      if (event.key === "?") {
        event.preventDefault();
        openHelp();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  return (
    <div
      className={`app-shell${compact ? " is-compact" : ""}${activeTab === "home" ? " is-home" : ""}`}
    >
      <a
        className="skip-link"
        href="#workspace"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("workspace")?.focus();
        }}
      >
        Skip to workspace
      </a>
      <header className="studio-header">
        <a
          href="#home"
          onClick={() => navigate("home")}
          className="brand"
          aria-label="Utility Lab home"
        >
          <span className="brand-mark">
            <Waypoints size={22} strokeWidth={2} />
          </span>
          <span>
            utility<span className="brand-light">lab</span>
            <span className="brand-dot">.</span>
          </span>
        </a>
        <nav className="global-nav" aria-label="Main navigation" role="tablist">
          {navigation.map(({ id, name, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              className={`global-nav-item${activeTab === id ? " is-active" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={17} />
              <span>{name}</span>
            </button>
          ))}
        </nav>
        <div className="global-actions">
          <span className="workspace-status">
            {online ? <span className="status-dot" /> : <CloudOff size={14} />}
            <span>{online ? "Local workspace" : "Offline"}</span>
          </span>
          <span className="header-divider" />
          <details
            className="appearance-menu"
            ref={appearanceMenu}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                appearanceMenu.current?.removeAttribute("open");
                appearanceMenu.current?.querySelector("summary")?.focus();
              }
            }}
          >
            <summary
              className="icon-button"
              aria-label="Appearance"
              title="Theme and palette"
            >
              <Palette size={19} />
            </summary>
            <div className="appearance-panel">
              <div
                className="theme-choices"
                role="group"
                aria-label="Color mode"
              >
                {(
                  [
                    { id: "light", label: "Light", Icon: Sun },
                    { id: "dark", label: "Dark", Icon: Moon },
                    { id: "system", label: "System", Icon: Monitor },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    aria-label={`${label} mode`}
                    aria-pressed={appearance.mode === id}
                    className={appearance.mode === id ? "is-selected" : ""}
                    onClick={() =>
                      setAppearance((value) => ({ ...value, mode: id }))
                    }
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                ))}
              </div>
              <span className="appearance-label">Color palette</span>
              <div
                className="palette-choices"
                role="group"
                aria-label="Color palette"
              >
                {(
                  [
                    { id: "cobalt", color: "#365fe4", name: "Cobalt" },
                    { id: "ember", color: "#b64f23", name: "Ember" },
                    { id: "mint", color: "#16785f", name: "Mint" },
                    { id: "rose", color: "#b44670", name: "Rose" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    aria-label={`${item.name} palette`}
                    aria-pressed={appearance.palette === item.id}
                    className={
                      appearance.palette === item.id ? "is-selected" : ""
                    }
                    onClick={() =>
                      setAppearance((value) => ({ ...value, palette: item.id }))
                    }
                  >
                    <span style={{ background: item.color }}>
                      {appearance.palette === item.id && <Check size={13} />}
                    </span>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </details>
          <button
            className={`compact-toggle${compact ? " is-active" : ""}`}
            onClick={() => setCompact(!compact)}
            aria-label={compact ? "Exit in-game view" : "In-game view"}
            aria-pressed={compact}
            title={compact ? "Exit in-game view" : "In-game view"}
          >
            <Monitor size={17} />
            <span>{compact ? "Exit in-game view" : "In-game view"}</span>
          </button>
          <button
            className="icon-button help-trigger"
            onClick={() => openHelp()}
            aria-label="Help and keyboard shortcuts"
          >
            <CircleHelp size={19} />
          </button>
        </div>
      </header>
      {activeTab !== "home" && (
        <div className="phone-tabs" role="tablist" aria-label="Workspace tabs">
          {navigation.map(({ id, name, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => navigate(id)}
              className={activeTab === id ? "is-active" : ""}
            >
              <Icon size={16} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      )}
      <main
        className="app-main"
        id="workspace"
        tabIndex={-1}
        aria-label="Workspace"
      >
        {activeTab !== "home" && (
          <h1 className="sr-only">
            {navigation.find((item) => item.id === activeTab)?.name}
          </h1>
        )}
        {activeTab === "home" ? (
          <LaunchScreen
            onNavigate={navigate}
            theme={theme}
            palette={appearance.palette}
          />
        ) : activeTab === "board" ? (
          <TacticBoard
            key={selectedMap.id + (openedTactic?.token || "")}
            map={selectedMap}
            onNotify={setNotice}
            onOpenMaps={openMaps}
            compact={compact}
            theme={theme}
            openedTactic={openedTactic?.record}
          />
        ) : activeTab === "utilities" ? (
          <Utilities
            key={selectedMap.id}
            map={selectedMap}
            side={side}
            onSideChange={setSide}
            onNotify={setNotice}
            onOpenMaps={openMaps}
            compact={compact}
            theme={theme}
          />
        ) : (
          <WorkspaceLibrary
            key={activeTab}
            view={activeTab}
            onNavigate={navigate}
            onOpenTactic={openSavedTactic}
            onNotify={setNotice}
          />
        )}
      </main>

      {notice && (
        <div className="app-notice" role="status">
          <span className="notice-icon">
            <Info size={18} />
          </span>
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss message"
            onClick={() => setNotice(null)}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <dialog
        className="map-dialog"
        ref={mapsDialog}
        aria-labelledby="map-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) mapsDialog.current?.close();
        }}
      >
        <div className="dialog-heading">
          <div>
            <h2 id="map-dialog-title">Choose your map</h2>
            <p>Active Duty and FACEIT. Ready to plan.</p>
          </div>
          <button
            className="icon-button"
            aria-label="Close map chooser"
            onClick={() => mapsDialog.current?.close()}
          >
            <X size={21} />
          </button>
        </div>
        <div className="map-filters">
          <label className="map-search">
            <Search size={18} />
            <input
              ref={searchInput}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search maps"
              placeholder="Search maps…"
            />
            <kbd>/</kbd>
          </label>
          <div className="mode-filter">
            <select
              aria-label="Filter maps by game mode"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {modes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>
        </div>
        <div className="map-library-meta">
          <span>
            {visibleMaps.length} {visibleMaps.length === 1 ? "map" : "maps"}
          </span>
          <span>
            CS2 <span className="meta-dot" /> Competitive pool
          </span>
        </div>
        <nav className="map-grid" aria-label="Choose map">
          {visibleMaps.map((map) => (
            <button
              className={`map-tile${selectedMap.id === map.id ? " is-selected" : ""}`}
              key={map.id}
              aria-label={`${map.name} ${map.mode}`}
              aria-pressed={selectedMap.id === map.id}
              onClick={() => chooseMap(map.id)}
            >
              <span className="map-tile-art">
                <img
                  loading="lazy"
                  width="128"
                  height="96"
                  src={(
                    map.levels[0].radarImage || map.levels[0].image
                  ).replace("/maps/", "/map-thumbnails/")}
                  alt=""
                />
                {selectedMap.id === map.id && (
                  <span className="map-tile-check">
                    <Check size={15} />
                  </span>
                )}
              </span>
              <span className="map-tile-name">{map.name}</span>
              <span className="map-tile-mode">{map.mode}</span>
            </button>
          ))}
          {!visibleMaps.length && (
            <div className="map-empty">
              <Map size={30} />
              <h3>No maps match “{query}”</h3>
              <p>Try another name or clear the filters.</p>
              <button
                className="secondary-button"
                onClick={() => {
                  setQuery("");
                  setMode("All maps");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </nav>
        <div className="map-dialog-footer">
          <ShieldCheck size={15} />
          <span>Map artwork is stored with the app.</span>
          <button onClick={() => mapsDialog.current?.close()}>
            Back to board <ArrowRight size={14} />
          </button>
        </div>
      </dialog>

      <dialog
        className="help-dialog"
        ref={helpDialog}
        aria-labelledby="help-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) helpDialog.current?.close();
        }}
      >
        <div className="dialog-heading">
          <span className="brand-mark">
            <Waypoints size={22} />
          </span>
          <button
            className="icon-button"
            aria-label="Close help"
            onClick={() => helpDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="help-title">Your next round starts here.</h2>
        <p>
          Choose a map, place your team, and draw the execute. Open Lineups to
          choose your side and utility. Save tactics and lineups together in
          Playbooks.
        </p>
        <div className="shortcut-list">
          <span>Choose a map</span>
          <kbd>/</kbd>
          <span>Show this guide</span>
          <kbd>?</kbd>
          <span>Undo an edit</span>
          <kbd>Ctrl / ⌘ Z</kbd>
          <span>Move selected object</span>
          <kbd>Arrow keys</kbd>
          <span>Delete selected object</span>
          <kbd>Delete</kbd>
        </div>
        <div className="privacy-note">
          <ShieldCheck size={20} />
          <p>
            Your plans stay in this browser. Export a tactic file to back it up
            or move it to another device. Stats reflect the local workspace.
            Clearing browser storage removes local saves.
          </p>
        </div>
        <div className="dialog-bottom">
          <button
            className="primary-button"
            onClick={() => helpDialog.current?.close()}
          >
            Back to the board <ArrowRight size={16} />
          </button>
        </div>
      </dialog>
    </div>
  );
}
