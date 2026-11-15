import { useState, type ReactNode } from "react";
import type { UtilityPhoto } from "./utility-data";
import usePanZoom from "./usePanZoom";
import ZoomControls from "./ZoomControls";

export default function LineupPhoto({
  photo,
  title,
  children,
}: {
  photo: UtilityPhoto;
  title: string;
  children?: ReactNode;
}) {
  const [bounds, setBounds] = useState({
    x: 0,
    y: 0,
    width: 1600,
    height: 900,
  });
  const {
    viewportRef,
    zoom,
    panning,
    contentTransform,
    changeZoom,
    resetView,
    onZoomKeyDown,
    navigationProps,
  } = usePanZoom<HTMLDivElement>(bounds, title);

  return (
    <>
      <div className="ul-photo-toolbar">
        <p id="lineup-photo-navigation-help">
          Scroll to zoom · Drag to pan
          <span className="sr-only">
            . Focus the photo and use + or − to zoom, arrow keys to pan when
            zoomed, and 0 to fit. At 100%, left and right arrows change slides.
          </span>
        </p>
        <ZoomControls
          subject="lineup photo"
          zoom={zoom}
          onZoom={changeZoom}
          onReset={resetView}
          onKeyDown={onZoomKeyDown}
        />
      </div>
      <div className="ul-photo-stage">
        <div
          ref={viewportRef}
          className={`ul-photo-viewport${zoom > 1 ? " is-zoomed" : ""}${panning ? " is-panning" : ""}`}
          role="group"
          aria-label="Lineup photo"
          aria-describedby="lineup-photo-navigation-help"
          {...navigationProps}
          onKeyDown={(event) => {
            if (zoom <= 1 && ["ArrowLeft", "ArrowRight"].includes(event.key))
              return;
            navigationProps.onKeyDown(event);
            if (event.defaultPrevented) event.stopPropagation();
          }}
        >
          <img
            src={photo.image}
            alt={photo.caption || title}
            width="1600"
            height="900"
            draggable={false}
            style={{ transform: contentTransform }}
            onLoad={(event) => {
              const image = event.currentTarget;
              if (image.naturalWidth && image.naturalHeight)
                setBounds({
                  x: 0,
                  y: 0,
                  width: image.naturalWidth,
                  height: image.naturalHeight,
                });
            }}
          />
        </div>
        {children}
      </div>
    </>
  );
}
