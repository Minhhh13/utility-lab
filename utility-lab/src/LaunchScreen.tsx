import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Check,
  FlaskConical,
  Layers2,
  Pause,
  Play,
} from "lucide-react";
import "./launch.css";

type Destination = "board" | "utilities" | "playbooks" | "stats";
type Props = {
  onNavigate: (destination: Destination) => void;
  theme: "light" | "dark";
  palette: string;
};

const destinations = [
  {
    id: "board",
    title: "Tactic board",
    description: "Draw the routes. Call the execute.",
    icon: Layers2,
  },
  {
    id: "utilities",
    title: "Lineups",
    description: "Find the utility for your map.",
    icon: FlaskConical,
  },
  {
    id: "playbooks",
    title: "Playbooks",
    description: "Keep your team's plans together.",
    icon: BookOpen,
  },
  {
    id: "stats",
    title: "Stats",
    description: "Review your local activity.",
    icon: BarChart3,
  },
] as const;

export default function LaunchScreen({ onNavigate, theme, palette }: Props) {
  const [artState, setArtState] = useState<"loading" | "loaded" | "failed">(
    "loading",
  );
  const [fontsReady, setFontsReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [pageHidden, setPageHidden] = useState(document.hidden);
  const art = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(
      () => active && setFontsReady(true),
      () => active && setFontsReady(true),
    );
    // A cached image can finish before React attaches its load listener.
    if (art.current?.complete) {
      setArtState(art.current.naturalWidth ? "loaded" : "failed");
    }
    return () => {
      active = false;
    };
  }, []);
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
  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then((registration) =>
        registration.active?.postMessage({
          type: "CACHE_ART",
          urls: ["/art/launch-pixel.png", "/art/pixel-smoke.png"],
        }),
      );
    }
  }, []);

  const loadedResources = Number(fontsReady) + Number(artState !== "loading");
  const ready = loadedResources === 2;

  return (
    <section
      className={
        "launch-screen" +
        (ready ? " is-ready" : "") +
        (paused || reducedMotion || pageHidden ? " scene-paused" : "")
      }
      aria-label="Utility Lab launch screen"
      data-launch-theme={theme}
      data-launch-palette={palette}
    >
      <div
        className={
          "launch-scene" + (artState === "failed" ? " art-failed" : "")
        }
        aria-busy={!ready}
      >
        <img
          ref={art}
          className={"launch-art" + (artState === "loaded" ? " is-loaded" : "")}
          src="/art/launch-pixel.png"
          alt="Pixel-art sandstone courtyard at sunset, with blue rooftops and lantern-lit archways."
          width="1672"
          height="941"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setArtState("loaded")}
          onError={() => setArtState("failed")}
          hidden={artState === "failed"}
        />
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
        <button
          className="scene-motion-toggle"
          aria-label={
            reducedMotion
              ? "Scene motion disabled by reduced motion"
              : paused
                ? "Play scene"
                : "Pause scene"
          }
          disabled={reducedMotion}
          onClick={() => setPaused(!paused)}
        >
          {paused || reducedMotion ? <Play size={14} /> : <Pause size={14} />}
          <span>
            {reducedMotion
              ? "Motion off"
              : paused
                ? "Play scene"
                : "Pause scene"}
          </span>
        </button>
        <div className="launch-heading">
          <h1>
            Prepare your
            <br />
            next round.
          </h1>
          <div className="launch-load-state" role="status" aria-live="polite">
            {ready ? (
              <span className="launch-ready">
                <Check size={15} />
                Ready to plan.
              </span>
            ) : (
              <>
                <span>Loading your workspace</span>
                <progress
                  value={loadedResources}
                  max={2}
                  aria-label="Loading workspace artwork and typography"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <nav className="launch-destinations" aria-label="Choose your workspace">
        {destinations.map(({ id, title, description, icon: Icon }) => (
          <button
            type="button"
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
