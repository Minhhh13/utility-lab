import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  FlaskConical,
  Image as LandscapeIcon,
  Layers2,
} from "lucide-react";
import "./launch.css";

type Destination = "board" | "utilities" | "playbooks" | "stats";
type Props = {
  onNavigate: (destination: Destination) => void;
  theme: "light" | "dark";
  palette: string;
  landscapeHost?: HTMLElement | null;
};
export const LAUNCH_SCENES = [
  {
    id: "dust-cs1999",
    name: "Dust · CS 1999",
    src: "/art/launch-dust-cs1999.webp",
    alt: "Pixel-art recreation of original Counter-Strike Dust: the 1999 bombsite, green crates and two-window sandstone tower.",
  },
  {
    id: "dust-source",
    name: "Dust · Source",
    src: "/art/launch-dust-source.webp",
    alt: "Pixel-art recreation of Counter-Strike Source Dust: wooden crates, stacked blocks, overhead wires and the bombsite arch.",
  },
  {
    id: "dust-csgo",
    name: "Dust · CS:GO",
    src: "/art/launch-dust-csgo.webp",
    alt: "Pixel-art recreation of early Counter-Strike Global Offensive Dust: the underpass stairs, blue domes and raised stone platform.",
  },
] as const;
type SceneId = (typeof LAUNCH_SCENES)[number]["id"];
const SCENE_KEY = "ul:launch-scene";
function savedScene(): SceneId {
  try {
    const value = localStorage.getItem(SCENE_KEY);
    return (
      LAUNCH_SCENES.find((scene) => scene.id === value)?.id || "dust-cs1999"
    );
  } catch {
    return "dust-cs1999";
  }
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
    description: "Coming soon",
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
}: Props) {
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
    if (selectedSceneId === visibleSceneId && artState === "loaded") return;
    let active = true;
    const next =
      LAUNCH_SCENES.find((item) => item.id === selectedSceneId) ||
      LAUNCH_SCENES[0];
    const image = new Image();
    setIsSelecting(true);
    setSceneMessage("");
    image.onload = async () => {
      await image.decode().catch(() => {});
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
            urls: [next.src, "/art/pixel-smoke.png"],
          }),
        );
      }
    };
    image.onerror = () => {
      if (!active) return;
      setIsSelecting(false);
      setSceneMessage("Landscape unavailable. Choose another.");
      if (artState === "loaded") setSelectedSceneId(visibleSceneId);
      else if (next.id !== "dust-cs1999") setSelectedSceneId("dust-cs1999");
      else setArtState("failed");
    };
    image.src = next.src;
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
    // The previous decoded scene stays visible while a new selection loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSceneId]);

  useEffect(() => {
    if (!previousSceneId) return;
    const timeout = window.setTimeout(() => setPreviousSceneId(null), 220);
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
    >
      <h1 className="sr-only">Utility Lab</h1>
      <div
        className={
          "launch-scene" + (artState === "failed" ? " art-failed" : "")
        }
      >
        <div className="launch-art-frame">
          {previousScene && (
            <img
              className="launch-art launch-art-previous is-loaded"
              src={previousScene.src}
              data-scene={previousScene.id}
              alt=""
              aria-hidden="true"
              width="1672"
              height="941"
            />
          )}
          <img
            key={scene.id}
            className={"launch-art" + (artState === "loaded" ? " is-loaded" : "")}
            src={scene.src}
            data-scene={scene.id}
            alt={scene.alt}
            width="1672"
            height="941"
            fetchPriority="high"
            decoding="async"
            hidden={artState === "failed"}
          />
        </div>
        <div className="launch-smoke-layers" aria-hidden="true">
          <img
            className="launch-smoke smoke-near"
            src="/art/pixel-smoke.png"
            alt=""
            width="1122"
            height="1402"
          />
          <img
            className="launch-smoke smoke-far"
            src="/art/pixel-smoke.png"
            alt=""
            width="1122"
            height="1402"
          />
        </div>
        <div className="launch-environment" aria-hidden="true">
          <div className="launch-wisps">
            {[0, 1, 2].map((index) => (
              <span className={`launch-wisp wisp-${index + 1}`} key={index}>
                <img src="/art/pixel-smoke.png" alt="" width="1122" height="1402" />
              </span>
            ))}
          </div>
          <div className="launch-ground-wind">
            {[0, 1].map((index) => (
              <span className={`launch-sand-gust gust-${index + 1}`} key={index}>
                <img src="/art/pixel-smoke.png" alt="" width="1122" height="1402" />
              </span>
            ))}
          </div>
        </div>
        <div className="launch-light" aria-hidden="true" />
        <div className="launch-particles" aria-hidden="true">
          {Array.from({ length: 14 }, (_, index) => (
            <i
              key={index}
              style={{
                left: `${8 + ((index * 19) % 84)}%`,
                top: `${28 + ((index * 17) % 56)}%`,
                animationDelay: `-${index * 0.83}s`,
                animationDuration: `${8 + (index % 5)}s`,
              }}
            />
          ))}
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
              onChange={(event) =>
                setSelectedSceneId(event.target.value as SceneId)
              }
            >
              {LAUNCH_SCENES.map((option) => (
                <option value={option.id} key={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>,
          landscapeHost,
        )}
      <span className="sr-only" role="status" aria-live="polite">
        {isSelecting
          ? "Loading landscape"
          : sceneMessage || `${scene.name} landscape`}
      </span>
      {sceneMessage && <p className="launch-scene-error">{sceneMessage}</p>}
      <nav className="launch-destinations" aria-label="Choose your workspace">
        {destinations.map(({ id, title, description, icon: Icon }) => (
          <button
            type="button"
            disabled={id === "playbooks"}
            title={id === "playbooks" ? "Coming soon" : undefined}
            key={id}
            className="launch-destination"
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
            {id !== "playbooks" && <ArrowUpRight
              className="launch-destination-arrow"
              size={19}
              strokeWidth={1.7}
              aria-hidden="true"
            />}
          </button>
        ))}
      </nav>
    </section>
  );
}
