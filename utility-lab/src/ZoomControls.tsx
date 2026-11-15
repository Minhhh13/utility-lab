import { ZoomIn, ZoomOut } from "lucide-react";
import { MAX_MAP_ZOOM, MIN_MAP_ZOOM } from "./lineup-map-view";

type ZoomControlsProps = {
  subject: "utility map" | "lineup photo";
  zoom: number;
  onZoom: (zoom: number) => void;
  onReset: () => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
};

export default function ZoomControls({
  subject,
  zoom,
  onZoom,
  onReset,
  onKeyDown,
}: ZoomControlsProps) {
  return (
    <div
      className="ul-zoom"
      role="group"
      aria-label={`${subject} zoom`}
      onKeyDown={onKeyDown}
    >
      <button
        aria-label={`Zoom ${subject} out`}
        title="Zoom out (−)"
        disabled={zoom <= MIN_MAP_ZOOM}
        onClick={() => onZoom(zoom - 0.25)}
      >
        <ZoomOut size={16} />
      </button>
      <button
        aria-label={`Zoom ${subject} in`}
        title="Zoom in (+)"
        disabled={zoom >= MAX_MAP_ZOOM}
        onClick={() => onZoom(zoom + 0.25)}
      >
        <ZoomIn size={16} />
      </button>
      <button
        className="ul-zoom-fit"
        aria-label={`Reset ${subject} zoom`}
        title="Fit (0)"
        onClick={onReset}
      >
        {Math.round(zoom * 100)}%
      </button>
    </div>
  );
}
import type { KeyboardEventHandler } from "react";
