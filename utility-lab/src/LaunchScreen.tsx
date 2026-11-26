import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  FlaskConical,
  Image as LandscapeIcon,
  Layers2,
} from "lucide-react";
import "./launch.css";
import { DEFAULT_SCENE, LAUNCH_SCENES, resolveScene, sceneAssets, type Scene, type SceneId } from "./launch-scenes";

type Destination = "board" | "utilities" | "playbooks" | "stats";
type Props = {
  onNavigate: (destination: Destination) => void;
  theme: "light" | "dark";
  palette: string;
  landscapeHost?: HTMLElement | null;
  returning?: { from: Destination; keyboard: boolean };
};
const SCENE_KEY = "ul:launch-scene";
function savedScene(): SceneId {
  try {
    return resolveScene(localStorage.getItem(SCENE_KEY));
  } catch {
    return DEFAULT_SCENE;
  }
}
type Frame = { width: number; height: number; dpr: number };

function ScenePicture({ scene, frame, loaded, previous = false }: {
  scene: Scene; frame: Frame | null; loaded: boolean; previous?: boolean;
}) {
  let style: CSSProperties | undefined;
  if (frame) {
    // Align every source pixel and both cropped edges to physical display pixels.
    const { width, height, dpr } = frame;
    const scale = Math.max(1, Math.ceil(Math.max(width / scene.width, height / scene.height) * dpr));
    const pixel = scale / dpr;
    style = {
      "--source-pixel": `${pixel}px`, width: scene.width * pixel, height: scene.height * pixel,
      left: Math.round((width * dpr - scene.width * scale) * scene.focus) / dpr,
      top: Math.round((height * dpr - scene.height * scale) / 2) / dpr,
    } as CSSProperties;
  }
  return <div className={"launch-picture" + (loaded ? " is-loaded" : "") + (previous ? " is-previous" : "")}
    style={style} aria-hidden={previous || undefined}>
    <img className={"launch-art" + (previous ? " launch-art-previous" : "") + (loaded ? " is-loaded" : "")}
      src={scene.src} data-scene={scene.id} alt={previous ? "" : scene.alt} width={scene.width}
      height={scene.height} fetchPriority="high" decoding="async" />
    {"foreground" in scene && <img className="launch-foreground" src={scene.foreground} alt=""
      width={scene.width + 6} height={scene.height} decoding="async" />}
  </div>;
}

const destinations = [
  {
    id: "board",
    title: "Tactic board",
    description: "Players, utility and routes",
    icon: Layers2,
  },
  {
    id: "utilities",
    title: "Lineups",
    description: "Videos and photo guides",
    icon: FlaskConical,
  },
  {
    id: "playbooks",
    title: "Playbooks",
    description: "Five-player round plans",
    icon: BookOpen,
  },
  {
    id: "stats",
    title: "Stats",
    description: "Your saved workspace",
    icon: BarChart3,
  },
] as const;

export default function LaunchScreen({
  onNavigate,
  theme,
  palette,
  landscapeHost,
  returning,
}: Props) {
  const artFrame = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  useLayoutEffect(() => {
    const element = artFrame.current;
    if (!element) return;
    function measure() {
      const { width, height } = element!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      setFrame(previous => previous?.width === width && previous.height === height && previous.dpr === dpr
        ? previous : { width, height, dpr });
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  const returnButton = useRef<HTMLButtonElement>(null);
  const returnTo = returning?.from;
  useLayoutEffect(() => {
    if (returning?.keyboard) returnButton.current?.focus({ preventScroll: true });
  }, [returning]);
  const [selectedSceneId, setSelectedSceneId] = useState<SceneId>(savedScene);
  const [visibleSceneId, setVisibleSceneId] =
    useState<SceneId>(selectedSceneId);
  const [previousSceneId, setPreviousSceneId] = useState<SceneId | null>(null);
  const [artState, setArtState] = useState<"loading" | "loaded" | "failed">(
    "loading",
  );
  const [isSelecting, setIsSelecting] = useState(true);
  const [sceneMessage, setSceneMessage] = useState("");
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [pageHidden, setPageHidden] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );
  const scene =
    LAUNCH_SCENES.find((item) => item.id === visibleSceneId) ||
    LAUNCH_SCENES[0];
  const previousScene = LAUNCH_SCENES.find((item) => item.id === previousSceneId);

  useEffect(() => {
    if (selectedSceneId === visibleSceneId && artState === "loaded") {
      setIsSelecting(false);
      return;
    }
    let active = true;
    const next =
      LAUNCH_SCENES.find((item) => item.id === selectedSceneId) ||
      LAUNCH_SCENES[0];
    setIsSelecting(true);
    setSceneMessage("");
    const assets = sceneAssets(next);
    Promise.all(assets.map(url => {
      const image = new Image();
      image.src = url;
      return image.decode();
    })).then(() => {
      if (!active) return;
      if (next.id !== visibleSceneId) setPreviousSceneId(visibleSceneId);
      setVisibleSceneId(next.id);
      setArtState("loaded");
      setIsSelecting(false);
      try {
        localStorage.setItem(SCENE_KEY, next.id);
      } catch {
        /* Appearance remains usable for this visit. */
      }
      if (import.meta.env.PROD && "serviceWorker" in navigator) {
        void navigator.serviceWorker.ready.then((registration) =>
          registration.active?.postMessage({
            type: "CACHE_ART",
            urls: assets,
          }),
        );
      }
    }).catch(() => {
      if (!active) return;
      setIsSelecting(false);
      setSceneMessage("Landscape unavailable. Choose another.");
      if (artState === "loaded") setSelectedSceneId(visibleSceneId);
      else if (next.id !== DEFAULT_SCENE) setSelectedSceneId(DEFAULT_SCENE);
      else setArtState("failed");
    });
    return () => { active = false; };
    // The previous decoded scene stays visible while a new selection loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSceneId]);

  useEffect(() => {
    if (!previousSceneId) return;
    const timeout = window.setTimeout(() => setPreviousSceneId(null), 340);
    return () => window.clearTimeout(timeout);
  }, [visibleSceneId, previousSceneId]);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReducedMotion(media.matches);
    const visibility = () => setPageHidden(document.hidden);
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return (
    <section
      className={
        "launch-screen" + (reducedMotion || pageHidden ? " scene-paused" : "")
      }
      aria-label="Utility Lab launch screen"
      data-launch-theme={theme}
      data-launch-palette={palette}
      data-scene={visibleSceneId}
      data-return={returning ? returning.keyboard ? "keyboard" : "pointer" : undefined}
    >
      <h1 className="sr-only">Utility Lab</h1>
      <div
        className={
          "launch-scene" + (artState === "failed" ? " art-failed" : "")
        }
      >
        <div className="launch-art-frame" ref={artFrame}>
          {previousScene && <ScenePicture key={previousScene.id} scene={previousScene} frame={frame} loaded previous />}
          {artState !== "failed" && <ScenePicture key={scene.id} scene={scene} frame={frame} loaded={artState === "loaded"} />}
        </div>
        <div className="launch-scene-shade" aria-hidden="true" />
      </div>
      {landscapeHost &&
        createPortal(
          <div
            className="launch-header-choice"
            title={`Landscape: ${scene.name}`}
          >
            <label htmlFor="launch-landscape">
              <LandscapeIcon size={17} aria-hidden="true" />
              <span className="sr-only">Landscape</span>
            </label>
            <select
              id="launch-landscape"
              value={selectedSceneId}
              aria-busy={isSelecting}
              onChange={(event) => {
                setSceneMessage("");
                setSelectedSceneId(event.target.value as SceneId);
              }}
            >
              {(["City", "Industrial", "Outdoors"] as const).map(group => (
                <optgroup key={group} label={group}>
                  {LAUNCH_SCENES.filter(option => option.group === group).map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown size={14} className="landscape-chevron" aria-hidden="true" />
          </div>,
          landscapeHost,
        )}
      <span className="sr-only" role="status" aria-live="polite">
        {isSelecting
          ? "Loading landscape"
          : sceneMessage || `${scene.name} landscape`}
      </span>
      {sceneMessage && <p className="launch-scene-error">{sceneMessage}</p>}
      {artState === "loaded" && <div className="launch-art-credit">
        <a href={scene.source} target="_blank" rel="noopener noreferrer"
          aria-label={`Art by Luis Zuno. View the original artwork for ${scene.name}`}>
          Art by Luis Zuno <ArrowUpRight size={12} aria-hidden="true" />
        </a>
        <a href="/art/credits.txt" target="_blank" rel="noopener noreferrer"
          aria-label="Open artwork credits and licenses">Credits</a>
      </div>}
      <nav className="launch-destinations" aria-label="Choose your workspace">
        {destinations.map(({ id, title, description, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className="launch-destination"
            ref={id === returnTo ? returnButton : undefined}
            data-returned={id === returnTo || undefined}
            onClick={() => onNavigate(id)}
            aria-label={title}
          >
            <span className="launch-destination-title">
              <Icon size={22} strokeWidth={1.75} />
              <strong>{title}</strong>
            </span>
            <span className="launch-destination-description">
              {description}
            </span>
            <ArrowUpRight
              className="launch-destination-arrow"
              size={19}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </button>
        ))}
      </nav>
    </section>
  );
}
