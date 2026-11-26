import { useEffect, useState, type ReactNode } from "react";
import { findLineupOrigin, loadMapOrigins, type OriginLookup } from "./lineup-origins";
import { MAPS } from "./maps";
import type { UtilityReference } from "./utility-data";
import "./lineup-standing-map.css";

type Props = { record: UtilityReference; fallback: ReactNode; children?: ReactNode };
const CROP_SIZE = 330;

export default function LineupStandingMap({ record, fallback, children }: Props) {
  const [catalogue, setCatalogue] = useState<{ mapId: string; lookup: OriginLookup }>();
  const [artwork, setArtwork] = useState<{ url: string; loaded: boolean }>();
  useEffect(() => {
    if (record.userCreated) return;
    let active = true;
    void loadMapOrigins(record.mapId).then(lookup => {
      if (active) setCatalogue({ mapId: record.mapId, lookup });
    }).catch(() => { /* The supplied setup view stays available offline. */ });
    return () => { active = false; };
  }, [record.mapId, record.userCreated]);

  // The destination can be on another floor. Use the floor belonging to the
  // source's recorded world position, never a map target or a copied URL.
  const origin = record.userCreated ? undefined
    : findLineupOrigin(record, catalogue?.mapId === record.mapId ? catalogue.lookup : undefined);
  const map = MAPS.find(item => item.id === record.mapId);
  const floor = map?.levels.find(level => level.id === origin?.levelId);
  const url = origin?.basis === "publisher-origin" && origin.precision === "world" ? floor?.image : undefined;
  useEffect(() => {
    if (!url) return;
    const image = new Image();
    image.onload = () => setArtwork({ url, loaded: true });
    image.onerror = () => setArtwork({ url, loaded: false });
    image.src = url;
    return () => { image.onload = null; image.onerror = null; };
  }, [url]);
  if (!origin || !map || !floor || !url || artwork?.url !== url || !artwork.loaded) return fallback;
  const left = Math.max(0, Math.min(1000 - CROP_SIZE, origin.x - CROP_SIZE / 2));
  const top = Math.max(0, Math.min(1000 - CROP_SIZE, origin.y - CROP_SIZE / 2));
  const location = [map.name, ...(map.levels.length > 1 ? [floor.name] : []), origin.label].join(" · ");
  return <>{children}<div className="ul-photo-frame ul-standing-map" data-origin-registration={origin.registrationId}
    data-origin-level={floor.id} data-lineup-id={record.id}>
    <svg role="img" aria-label={`Recorded standing position: ${location}`} viewBox={`${left} ${top} ${CROP_SIZE} ${CROP_SIZE}`}>
      <image href={url} x="0" y="0" width="1000" height="1000" onError={() => setArtwork({ url, loaded: false })} />
      <g className="ul-standing-map-pin" transform={`translate(${origin.x} ${origin.y})`}>
        <circle r="10" className="ul-standing-map-halo" vectorEffect="non-scaling-stroke" />
        <circle r="3.5" fill="currentColor" stroke="white" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
    <div className="ul-standing-map-location">
      <strong>{location}</strong>
      <div className="ul-standing-map-credits">
        {url.endsWith(".svg")
          ? <a href="https://setpos.gg" target="_blank" rel="noreferrer">Minimap by setpos.gg</a>
          : <span>Radar © Valve and the map creators</span>}
        {record.source && <a href={record.source} target="_blank" rel="noreferrer">Standing position source</a>}
      </div>
    </div>
  </div></>;
}
