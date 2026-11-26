import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { flushSync } from "react-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  FlaskConical,
  Layers2,
  Map,
  Monitor,
  Moon,
  Palette,
  PanelTopClose,
  PanelTopOpen,
  Search,
  ShieldCheck,
  Sun,
  X,
  Settings2,
} from "lucide-react";
import { MAPS } from "./maps";
const TacticBoard = lazy(() => import("./TacticBoard"));
const Utilities = lazy(() => import("./Utilities"));
const LaunchScreen = lazy(() => import("./LaunchScreen"));
const WorkspaceLibrary = lazy(() => import("./WorkspaceLibrary"));
const SharedCueSheet = lazy(() => import("./PlaybookPlayback").then(({ SharedCueSheet }) => ({ default: SharedCueSheet })));
const WorkspaceSettings = lazy(() => import("./WorkspaceSettings"));
const TacticShareDialog = lazy(() => import("./TacticShareDialog"));
import WorkspaceBoundary from "./WorkspaceBoundary";
import BrandMark from "./BrandMark";
import AppNotice from "./AppNotice";
import NavigationIndicator from "./NavigationIndicator";
import "./interaction-motion.css";
import { parseRoute, lineupLink, type View } from "./routes";
import {
  readUserUtilities,
  UTILITY_REFERENCES,
  type UtilityReference,
} from "./utility-data";
import { uid, type SavedTactic, type TacticFile } from "./board-model";

type ThemeMode = "light" | "dark" | "system";
type ColorPalette = "cobalt" | "ember" | "mint" | "rose";
type DisplayAspect = "auto" | "16:9" | "4:3";
type DisplayPreferences = {
  compact: boolean;
  aspect: DisplayAspect;
  headerHidden: boolean;
};
function readDisplayPreferences(): DisplayPreferences {
  try {
    const value = JSON.parse(localStorage.getItem("ul:display") || "null");
    return {
      compact: value?.compact === true,
      aspect: ["auto", "16:9", "4:3"].includes(value?.aspect) ? value.aspect : "auto",
      headerHidden: value?.headerHidden === true,
    };
  } catch {
    return { compact: false, aspect: "auto", headerHidden: false };
  }
}
const navigation = [
  { id: "board", name: "Tactic board", Icon: Layers2 },
  { id: "utilities", name: "Lineups", Icon: FlaskConical },
  { id: "playbooks", name: "Playbooks", Icon: BookOpen },
  { id: "stats", name: "Stats", Icon: BarChart3 },
] as const;
function readView(): View {
  return parseRoute(location.hash).view;
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
    const route = parseRoute(location.hash);
    if (route.mapId) return route.mapId;
    try {
      return localStorage.getItem("ul:last-map") || "mirage";
    } catch {
      return "mirage";
    }
  });
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("All maps");
  const [activeTab, setActiveTab] = useState<View>(readView);
  const [playbookRoute, setPlaybookRoute] = useState(() => parseRoute(location.hash));
  const [openedTactic, setOpenedTactic] = useState<{
    record: SavedTactic;
    token: string;
  } | null>(null);
  const [openedSharedTactic, setOpenedSharedTactic] = useState<{
    file: TacticFile;
    token: string;
  } | null>(null);
  const [shareRoute, setShareRoute] = useState(() =>
    location.hash.startsWith("#tactic=") ? location.href : "",
  );
  const [side, setSide] = useState<"T" | "CT">(
    () => parseRoute(location.hash).side,
  );
  const [routeLevelId, setRouteLevelId] = useState(() => parseRoute(location.hash).levelId);
  const [openedLineup, setOpenedLineup] = useState<
    UtilityReference | undefined
  >(() => {
    const route = parseRoute(location.hash);
    if (!route.lineupId || route.view !== "utilities") return undefined;
    return [...readUserUtilities(), ...UTILITY_REFERENCES].find(
      (item) => item.id === route.lineupId && item.mapId === route.mapId,
    );
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [landscapeHost, setLandscapeHost] = useState<HTMLSpanElement | null>(
    null,
  );
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const [appearance, setAppearance] = useState(readAppearance);
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [display, setDisplay] = useState(readDisplayPreferences);
  const { compact, aspect, headerHidden } = display;
  const [workspaceSize, setWorkspaceSize] = useState({ width: 0, height: 0 });
  const [notice, setNotice] = useState<string | null>(null);
  const mapsDialog = useRef<HTMLDialogElement>(null);
  const mapGrid = useRef<HTMLElement>(null);
  const helpDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const appearanceMenu = useRef<HTMLDetailsElement>(null);
  const displayMenu = useRef<HTMLDetailsElement>(null);
  const displaySummary = useRef<HTMLElement>(null);
  const restoreHeaderButton = useRef<HTMLButtonElement>(null);
  const moveHeaderFocus = useRef(false);
  const workspaceViewport = useRef<HTMLDivElement>(null);
  const lineupRouteRequest = useRef(0);
  const workspaceElement = useRef<HTMLElement>(null);
  const currentView = useRef(activeTab);
  const homeReturn = useRef<{ from: Exclude<View, "home">; keyboard: boolean } | undefined>(undefined);
  const enteredFromHome = useRef<"pointer" | "keyboard" | undefined>(undefined);
  const workspaceTransition = useRef<ViewTransition | null>(null);
  const workspaceFade = useRef<Animation | null>(null);
  const transitionRequest = useRef(0);
  const fadeNextWorkspace = useRef(false);
  const fadeFromOpacity = useRef(0.64);
  const navigationInput = useRef<"pointer" | "keyboard">("pointer");
  const theme =
    appearance.mode === "system"
      ? systemDark
        ? "dark"
        : "light"
      : appearance.mode;
  const selectedMap = MAPS.find((map) => map.id === mapId) || MAPS[0];
  const modes = ["All maps", "Active Duty", "FACEIT"];
  // Fit the workspace, never scale its contents or change the map's camera.
  // Phones use all of their available screen even when a desktop preset is saved.
  const effectiveAspect = activeTab !== "home" && workspaceSize.width > 860 ? aspect : "auto";
  const frameRatio = effectiveAspect === "16:9" ? 16 / 9 : 4 / 3;
  const frameWidth = Math.min(workspaceSize.width, workspaceSize.height * frameRatio);
  const frameStyle = effectiveAspect === "auto" ? undefined : {
    width: frameWidth,
    height: frameWidth / frameRatio,
  };
  const visibleMaps = MAPS.filter(
    (map) =>
      (!query ||
        `${map.name} ${map.mode}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (mode === "All maps" ||
        (mode === "Active Duty" ? map.activeDuty : map.faceit)),
  );

  useLayoutEffect(() => {
    const grid = mapGrid.current;
    if (!grid) return;
    const updateEdges = () => {
      grid.toggleAttribute("data-scroll-before", grid.scrollTop > 1);
      grid.toggleAttribute("data-scroll-after", grid.clientHeight > 0 && grid.scrollTop + grid.clientHeight < grid.scrollHeight - 1);
    };
    grid.scrollTop = 0;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(grid);
    grid.addEventListener("scroll", updateEdges, { passive: true });
    return () => { observer.disconnect(); grid.removeEventListener("scroll", updateEdges); };
  }, [query, mode]);

  function toggleHeader(hidden: boolean) {
    displayMenu.current?.removeAttribute("open");
    appearanceMenu.current?.removeAttribute("open");
    moveHeaderFocus.current = true;
    setDisplay((value) => ({ ...value, headerHidden: hidden }));
  }

  function openMaps() {
    setQuery("");
    mapsDialog.current?.showModal();
    if (mapGrid.current) mapGrid.current.scrollTop = 0;
    requestAnimationFrame(() => searchInput.current?.focus());
  }
  function chooseMap(id: string) {
    lineupRouteRequest.current++;
    mapsDialog.current?.close();
    setMapId(id);
    setRouteLevelId(undefined);
    setOpenedTactic(null);
    setOpenedSharedTactic(null);
    setOpenedLineup(undefined);
    if (activeTab === "utilities")
      history.replaceState(
        null,
        "",
        `#utilities?${new URLSearchParams({ map: id, side })}`,
      );
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
  function changeWorkspace(view: View, animate = true) {
    if (currentView.current === view) return;
    const from = currentView.current;
    enteredFromHome.current = from === "home" ? navigationInput.current : undefined;
    homeReturn.current = view === "home" && from !== "home"
      ? { from, keyboard: navigationInput.current === "keyboard" } : undefined;
    currentView.current = view;
    const request = ++transitionRequest.current;
    workspaceTransition.current?.skipTransition();
    fadeFromOpacity.current =
      workspaceFade.current?.playState === "running" && workspaceElement.current
        ? Number(getComputedStyle(workspaceElement.current).opacity)
        : 0.64;
    workspaceFade.current?.cancel();
    const allowMotion =
      animate &&
      navigationInput.current !== "keyboard" &&
      !document.hidden &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches;
    fadeNextWorkspace.current = false;
    if (allowMotion && typeof document.startViewTransition === "function") {
      try {
        const transition = document.startViewTransition(() => {
          if (request !== transitionRequest.current) return;
          flushSync(() => setActiveTab(view));
        });
        workspaceTransition.current = transition;
        // Cancellation rejects ready; rapid navigation is an ordinary outcome.
        void transition.ready.catch(() => {});
        void transition.finished.catch(() => {}).then(() => {
          if (workspaceTransition.current === transition)
            workspaceTransition.current = null;
        });
        return;
      } catch {
        // Older in-game browsers use the same short entry without snapshots.
      }
    }
    fadeNextWorkspace.current = allowMotion;
    setActiveTab(view);
  }
  function navigate(view: View) {
    lineupRouteRequest.current++;
    setOpenedTactic(null);
    setOpenedSharedTactic(null);
    setOpenedLineup(undefined);
    changeWorkspace(view);
    setNotice(null);
    appearanceMenu.current?.removeAttribute("open");
    if (location.hash !== `#${view}`) location.hash = view;
    window.scrollTo(0, 0);
  }
  function openLineup(record: UtilityReference) {
    if (
      !MAPS.some(
        (map) =>
          map.id === record.mapId &&
          map.levels.some((level) => level.id === record.levelId),
      )
    ) {
      setNotice(
        "That lineup uses a map or floor outside the supported pool. Its exported record is still available in your library.",
      );
      return;
    }
    navigate("utilities");
    setMapId(record.mapId);
    setSide(record.side);
    setOpenedLineup(record);
    setRouteLevelId(record.levelId);
    history.replaceState(null, "", lineupLink(record, location.href));
  }
  function changeUtilitySide(next: "T" | "CT") {
    lineupRouteRequest.current++;
    if(next !== side) setOpenedLineup(undefined);
    setSide(next);
    const route = parseRoute(location.hash);
    setRouteLevelId(route.levelId);
    history.replaceState(
      null,
      "",
      `#utilities?${new URLSearchParams({ map: selectedMap.id, side: next, ...(route.levelId ? { level: route.levelId } : {}) })}`,
    );
  }
  function navigateKey(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    navigationInput.current = "keyboard";
    document.documentElement.dataset.navigationInput = "keyboard";
    event.preventDefault();
    event.stopPropagation();
    const next = event.key === "Home"
        ? 0
        : event.key === "End"
          ? navigation.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + navigation.length) % navigation.length;
    navigate(navigation[next].id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
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
  function openSharedTactic(file: TacticFile) {
    const map = MAPS.find((item) => item.id === file.plan.mapId);
    if (!map?.levels.some((level) => level.id === file.plan.levelId)) {
      setNotice("That shared tactic uses a map or floor outside this pool.");
      return;
    }
    navigate("board");
    setShareRoute("");
    setMapId(file.plan.mapId);
    setOpenedSharedTactic({
      file: {
        ...file,
        plan: { ...file.plan, name: `${file.plan.name.slice(0, 110)} — copy` },
      },
      token: uid(),
    });
    history.replaceState(null, "", "#board");
  }
  function closeShareRoute() {
    setShareRoute("");
    if (location.hash.startsWith("#tactic=")) {
      history.replaceState(null, "", `#${activeTab}`);
    }
  }
  useEffect(() => {
    let live = true;
    const update = () => {
      const request = ++lineupRouteRequest.current;
      const hash = location.hash;
      if (location.hash.startsWith("#tactic=")) {
        setShareRoute(location.href);
        return;
      }
      setShareRoute("");
      const route = parseRoute(location.hash);
      setPlaybookRoute(route);
      setRouteLevelId(route.levelId);
      changeWorkspace(route.view);
      if (route.mapId) setMapId(route.mapId);
      setSide(route.side);
      if (route.view !== "utilities" || !route.lineupId) {
        setOpenedLineup(undefined);
        return;
      }
      const matches = (item: UtilityReference) =>
        item.id === route.lineupId && item.mapId === route.mapId;
      const apply = (record: UtilityReference | undefined) => {
        if (
          !live ||
          request !== lineupRouteRequest.current ||
          location.hash !== hash
        )
          return;
        if (record) {
          setMapId(record.mapId);
          setSide(record.side);
        }
        setOpenedLineup((current) =>
          current?.id === record?.id &&
          current?.mapId === record?.mapId &&
          current?.levelId === record?.levelId
            ? current
            : record,
        );
      };
      const local = [...readUserUtilities(), ...UTILITY_REFERENCES].find(
        matches,
      );
      if (local) {
        apply(local);
        return;
      }
      setOpenedLineup((current) =>
        current && matches(current) ? current : undefined,
      );
      // Large creator/photo catalogues belong to the library, not Home or Board.
      // Show the ordinary utility workspace while resolving a direct guide link.
      void import("./guide-library")
        .then(async ({ GUIDE_LIBRARY }) => {
          const archived = GUIDE_LIBRARY.find(matches);
          const { expandedMapForId, findExpandedGuide } = await import("./expanded-catalogue");
          const expanded = expandedMapForId(route.lineupId!)
            ? await findExpandedGuide(route.lineupId!, route.mapId)
            : undefined;
          apply(expanded || archived);
        })
        .catch(() => {
          if (
            live &&
            request === lineupRouteRequest.current &&
            location.hash === hash
          )
            setNotice(
              "The linked guide could not load. Keep the local app server running and open the link again.",
            );
        });
    };
    update();
    window.addEventListener("hashchange", update);
    return () => {
      live = false;
      lineupRouteRequest.current++;
      window.removeEventListener("hashchange", update);
    };
  }, []);

  useLayoutEffect(() => {
    if (activeTab !== "home" && enteredFromHome.current === "keyboard") {
      workspaceElement.current?.focus({ preventScroll: true });
    }
    if (
      !fadeNextWorkspace.current ||
      !workspaceElement.current ||
      typeof workspaceElement.current.animate !== "function"
    )
      return;
    fadeNextWorkspace.current = false;
    workspaceFade.current = workspaceElement.current.animate(
      [{ opacity: fadeFromOpacity.current }, { opacity: 1 }],
      { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
  }, [activeTab]);
  useEffect(
    () => () => {
      transitionRequest.current++;
      workspaceTransition.current?.skipTransition();
      workspaceFade.current?.cancel();
    },
    [],
  );

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
    try {
      localStorage.setItem("ul:display", JSON.stringify(display));
    } catch {
      /* Display controls still work for this session when storage is unavailable. */
    }
  }, [display]);
  useLayoutEffect(() => {
    const viewport = workspaceViewport.current;
    if (!viewport) return;
    const measure = () => {
      const { width, height } = viewport.getBoundingClientRect();
      setWorkspaceSize((current) => current.width === width && current.height === height
        ? current : { width, height });
    };
    measure();
    // React may resize the fitted frame. Defer observer-driven updates so
    // WebKit can finish delivering this layout's resize notifications first.
    let frame: number | undefined;
    const observer = new ResizeObserver(() => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        measure();
      });
    });
    observer.observe(viewport);
    return () => {
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);
  useLayoutEffect(() => {
    if (!moveHeaderFocus.current) return;
    moveHeaderFocus.current = false;
    (headerHidden ? restoreHeaderButton.current : displaySummary.current)?.focus({ preventScroll: true });
  }, [headerHidden]);
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
      if (!displayMenu.current?.contains(event.target as Node))
        displayMenu.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
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
      navigationInput.current = "keyboard";
      document.documentElement.dataset.navigationInput = "keyboard";
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
    const pointer = () => {
      navigationInput.current = "pointer";
      document.documentElement.dataset.navigationInput = "pointer";
    };
    window.addEventListener("keydown", handle);
    window.addEventListener("pointerdown", pointer, { passive: true });
    return () => {
      window.removeEventListener("keydown", handle);
      window.removeEventListener("pointerdown", pointer);
      delete document.documentElement.dataset.navigationInput;
    };
  }, []);

  return (
    <div
      className={`app-shell${compact ? " is-compact" : ""}${headerHidden ? " is-header-hidden" : ""}${activeTab === "home" ? " is-home" : ""}`}
      data-entered-from-home={activeTab !== "home" ? enteredFromHome.current : undefined}
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
          onClick={(event) => {
            event.preventDefault();
            navigate("home");
          }}
          className="brand"
          aria-label="Utility Lab home"
        >
          <BrandMark size={34} />
          <span>
            utility<span className="brand-light">lab</span>
            <span className="brand-dot">.</span>
          </span>
        </a>
        <nav className="global-nav has-tab-indicator" aria-label="Main navigation" role="tablist">
          {navigation.map(({ id, name, Icon }, index) => (
            <button
              key={id}
              role="tab"
              aria-label={name}
              aria-selected={activeTab === id}
              tabIndex={activeTab === id ? 0 : -1}
              onKeyDown={(event) => navigateKey(event, index)}
              aria-controls="workspace"
              className={`global-nav-item${activeTab === id ? " is-active" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={17} />
              <span>{name}</span>
            </button>
          ))}
          <NavigationIndicator activeView={activeTab} />
        </nav>
        <div className="global-actions">
          {activeTab === "home" && (
            <span className="launch-header-slot" ref={setLandscapeHost} />
          )}
          <button
            className="icon-button"
            aria-label="Workspace settings"
            title="Backups and offline maps"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 size={19} />
          </button>
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
          <details
            className="display-menu"
            ref={displayMenu}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                displayMenu.current?.removeAttribute("open");
                displaySummary.current?.focus();
              }
            }}
          >
            <summary
              ref={displaySummary}
              className={`compact-toggle display-trigger${compact ? " is-active" : ""}`}
              aria-label="Display settings"
              title="Display settings"
            >
              <Monitor size={17} />
              <span>Display</span>
              <ChevronDown size={13} className="display-chevron" />
            </summary>
            <div className="display-panel">
              <button
                className="display-compact-switch"
                role="switch"
                aria-label="In-game view"
                aria-checked={compact}
                onClick={() => setDisplay((value) => ({ ...value, compact: !value.compact }))}
              >
                <span><strong>In-game view</strong><small>Compact controls</small></span>
                <span className="display-switch-track" aria-hidden="true"><span /></span>
              </button>
              <fieldset className="display-aspect-options">
                <legend>Aspect ratio</legend>
                <div>
                  {(["auto", "16:9", "4:3"] as const).map((value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="display-aspect"
                        value={value}
                        checked={aspect === value}
                        onChange={() => setDisplay((current) => ({ ...current, aspect: value }))}
                      />
                      <span>{value === "auto" ? "Auto" : value}</span>
                    </label>
                  ))}
                </div>
                <p>Fits desktop workspaces without stretching the map. Home stays full screen.</p>
              </fieldset>
              <p className="display-phone-note">Fits your phone screen automatically.</p>
              <button className="display-hide-action" onClick={() => toggleHeader(true)}>
                <PanelTopClose size={18} /> Hide top bar
              </button>
            </div>
          </details>
          <button
            className="icon-button hide-topbar"
            onClick={() => toggleHeader(true)}
            aria-label="Hide top bar"
            title="Hide top bar"
          ><PanelTopClose size={19} /></button>
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
        <div className="phone-tabs has-tab-indicator" role="tablist" aria-label="Workspace tabs">
          {navigation.map(({ id, name, Icon }, index) => (
            <button
              key={id}
              role="tab"
              aria-label={name}
              aria-selected={activeTab === id}
              tabIndex={activeTab === id ? 0 : -1}
              onKeyDown={(event) => navigateKey(event, index)}
              aria-controls="workspace"
              onClick={() => navigate(id)}
              className={activeTab === id ? "is-active" : ""}
            >
              <Icon size={16} />
              <span>{name}</span>
            </button>
          ))}
          <NavigationIndicator activeView={activeTab} />
        </div>
      )}
      <button
        ref={restoreHeaderButton}
        className="restore-topbar"
        hidden={!headerHidden}
        onClick={() => toggleHeader(false)}
        aria-label="Show top bar"
        title="Show top bar"
      ><PanelTopOpen size={20} /></button>
      <div className="workspace-viewport" ref={workspaceViewport}>
      <main
        ref={workspaceElement}
        className="app-main"
        id="workspace"
        tabIndex={-1}
        aria-label="Workspace"
        data-aspect-ratio={effectiveAspect}
        style={frameStyle}
      >
        {activeTab !== "home" && (
          <h1 className="sr-only">
            {navigation.find((item) => item.id === activeTab)?.name}
          </h1>
        )}
        <WorkspaceBoundary key={activeTab + mapId + workspaceVersion}>
          <Suspense
            fallback={
              <div className="workspace-loading" role="status">
                Opening your workspace…
              </div>
            }
          >
            {activeTab === "home" ? (
              <LaunchScreen
                onNavigate={navigate}
                returning={homeReturn.current}
                theme={theme}
                palette={appearance.palette}
                landscapeHost={landscapeHost}
              />
            ) : activeTab === "board" ? (
              <TacticBoard
                key={
                  selectedMap.id +
                  (openedSharedTactic?.token || "") +
                  (openedTactic?.token || "") +
                  workspaceVersion
                }
                map={selectedMap}
                onNotify={setNotice}
                onOpenMaps={openMaps}
                compact={compact}
                theme={theme}
                openedTactic={openedTactic?.record}
                openedSharedTactic={openedSharedTactic?.file}
                onOpenSharedTactic={openSharedTactic}
              />
            ) : activeTab === "utilities" ? (
              <Utilities
                key={
                  selectedMap.id + (openedLineup?.id || "") + workspaceVersion
                }
                map={selectedMap}
                side={side}
                onSideChange={changeUtilitySide}
                onNotify={setNotice}
                onOpenMaps={openMaps}
                compact={compact}
                theme={theme}
                initialLineup={openedLineup}
                initialLevelId={routeLevelId}
                onOpenLineup={openLineup}
              />
            ) : activeTab === "playbooks" && playbookRoute.cueSheet !== undefined ? (
              <SharedCueSheet key={playbookRoute.cueSheet} payload={playbookRoute.cueSheet} />
            ) : (
              <WorkspaceLibrary
                key={activeTab}
                view={activeTab}
                initialBookId={playbookRoute.bookId}
                onNavigate={navigate}
                onOpenTactic={openSavedTactic}
                onNotify={setNotice}
                onOpenLineup={openLineup}
              />
            )}
          </Suspense>
        </WorkspaceBoundary>
      </main>
      </div>
      {shareRoute && (
        <Suspense fallback={null}>
          <TacticShareDialog
            initialCode={shareRoute}
            onEditCopy={openSharedTactic}
            onClose={closeShareRoute}
            onNotify={setNotice}
          />
        </Suspense>
      )}
      {settingsOpen && (
        <Suspense fallback={null}>
          <WorkspaceSettings
            onClose={() => setSettingsOpen(false)}
            onRestored={() => {
              setWorkspaceVersion((v) => v + 1);
              setAppearance(readAppearance());
            }}
          />
        </Suspense>
      )}

      {notice && <AppNotice message={notice} onDismiss={() => setNotice(null)}/>}

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
            <p>Active Duty and FACEIT maps.</p>
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
        <nav className="map-grid" ref={mapGrid} tabIndex={0} aria-label="Choose map">
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
            Back to workspace <ArrowRight size={14} />
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
          <BrandMark size={34} />
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
            Back to workspace <ArrowRight size={16} />
          </button>
        </div>
      </dialog>
    </div>
  );
}
