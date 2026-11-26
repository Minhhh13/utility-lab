import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  FlaskConical,
  Layers2,
} from "lucide-react";
import "./launch.css";
import HomeScenePicker from "./HomeScenePicker";
import { DEFAULT_SCENE, LAUNCH_SCENES, resolveScene, type Scene, type SceneId } from "./launch-scenes";

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
type Frame = { width: number; height: number; dpr: number; dockSpace: number };

type PixelSize = { width: number; height: number };

// Anchor weather to the painting's native pixels so it follows the same crop on phones.
const ambient: Partial<Record<SceneId, [number, number][]>> = {
  "dust-1999": [[339,347], [389,323], [353,340]],
  aztec: [[312,357], [423,330], [484,285]],
  office: [[80,100], [253,85], [418,112], [680,127], [174,190], [558,199]],
};
const portraitLandmarks: Partial<Record<SceneId, { focus: number; y: number }>> = {
  "dust-source": { focus: .80, y: 285 }, // Parked car below the domed hall.
  inferno: { focus: .52, y: 301 }, // Fountain in front of the chapel.
};

function ScenePicture({ scene, frame, size, loaded, previous = false }: {
  scene: Scene; frame: Frame | null; size?: PixelSize; loaded: boolean; previous?: boolean;
}) {
  let style: CSSProperties | undefined;
  if (frame && size) {
    // Align every source pixel and both cropped edges to physical display pixels.
    const { width, height, dpr, dockSpace } = frame;
    const landmark = width < height ? portraitLandmarks[scene.id] : undefined;
    // Reserve enough foreground below the landmark to fill the area behind the controls.
    const foregroundScale = landmark ? (dockSpace + 24) / (size.height - landmark.y) : 0;
    const scale = Math.max(1, Math.ceil(Math.max(width / size.width, height / size.height, foregroundScale) * dpr));
    const pixel = scale / dpr;
    const left = Math.round((width * dpr - size.width * scale) * (landmark?.focus ?? scene.focus));
    // The skylines begin near the top of the drawing. On wide displays crop the
    // foreground first to retain the distant architecture and skyline.
    const verticalOverflow = size.height * scale - height * dpr;
    const skylineCrop = Math.min(verticalOverflow * .25, size.height * scale * .05);
    const foregroundCrop = landmark ? landmark.y * scale - (height - dockSpace - 24) * dpr : 0;
    const top = -Math.round(Math.min(verticalOverflow, Math.max(skylineCrop, foregroundCrop)));
    // Only travel into available overscan. Native-size 16:9 holds perfectly still.
    const travel = (edge: number) => edge <= -3 * scale ? 3 * pixel : 0;
    style = {
      width: size.width * pixel, height: size.height * pixel,
      left: left / dpr, top: top / dpr,
      "--art-pixel": `${pixel}px`,
      "--entry-x": `${travel(left)}px`, "--entry-y": `${travel(left) ? 0 : travel(top)}px`,
    } as CSSProperties;
  }
  return <div className={"launch-picture" + (loaded ? " is-loaded" : "") + (previous ? " is-previous" : "")}
    style={style} aria-hidden={previous || undefined}>
    <img className={"launch-art" + (previous ? " launch-art-previous" : "") + (loaded ? " is-loaded" : "")}
      src={scene.src} data-scene={scene.id} alt={previous ? "" : scene.alt} width={size?.width}
      height={size?.height} fetchPriority="high" decoding="async" />
    {!previous && loaded && size && ambient[scene.id] &&
      <span className="launch-ambient" data-weather={scene.id} aria-hidden="true">
        {ambient[scene.id]!.map(([x,y], i) => <i key={x} style={{
          left: `${100*x/size.width}%`, top: `${100*y/size.height}%`, animationDelay: `${-1.67*i}s`,
        }} />)}
      </span>}
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
  const dimensions = useRef(new Map<SceneId, PixelSize>());
  const artFrame = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLElement>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  useLayoutEffect(() => {
    const element = artFrame.current;
    if (!element) return;
    function measure() {
      const { width, height } = element!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const dockSpace = dock.current ? height - dock.current.offsetTop : 0;
      setFrame(previous => previous?.width === width && previous.height === height && previous.dpr === dpr && previous.dockSpace === dockSpace
        ? previous : { width, height, dpr, dockSpace });
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (dock.current) observer.observe(dock.current);
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
    const image = new Image();
    image.src = next.src;
    image.decode().then(() => {
      if (!active) return;
      dimensions.current.set(next.id, { width: image.naturalWidth, height: image.naturalHeight });
      if (next.id !== visibleSceneId && artState === "loaded") setPreviousSceneId(visibleSceneId);
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
            urls: [next.src],
          }),
        );
      }
    }).catch(() => {
      if (!active) return;
      setIsSelecting(false);
      setSceneMessage("Map background unavailable. Choose another.");
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
          {previousScene && <ScenePicture key={previousScene.id} scene={previousScene} size={dimensions.current.get(previousScene.id)} frame={frame} loaded previous />}
          {artState !== "failed" && <ScenePicture key={scene.id} scene={scene} size={dimensions.current.get(scene.id)} frame={frame} loaded={artState === "loaded"} />}
        </div>
        <div className="launch-scene-shade" aria-hidden="true" />
      </div>
      {landscapeHost &&
        createPortal(
          <HomeScenePicker scenes={LAUNCH_SCENES} value={selectedSceneId} busy={isSelecting}
            onChange={id => { setSceneMessage(""); setSelectedSceneId(id); }} />,
          landscapeHost,
        )}
      <span className="sr-only" role="status" aria-live="polite">
        {isSelecting
          ? "Loading map background"
          : sceneMessage || `${scene.name} background`}
      </span>
      {sceneMessage && <p className="launch-scene-error">{sceneMessage}</p>}
      <nav ref={dock} className="launch-destinations" aria-label="Choose your workspace">
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
