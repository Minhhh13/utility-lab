import { useEffect, useState } from "react";
import { MAPS, themedRadarImage } from "./maps";
import { findLineupOrigin, loadMapOrigins, type OriginLookup } from "./lineup-origins";
import type { UtilityReference } from "./utility-data";
import "./guide-map-preview.css";

type Pin = { x: number; y: number; levelId: string; kind: "Stand" | "Land"; name: string; approximate?: boolean };

export default function GuideMapPreview({ record, theme, onOpen }: { record: UtilityReference; theme: "light" | "dark"; onOpen?: () => void }) {
  const [origins, setOrigins] = useState<{ map: string; rows: OriginLookup }>();
  useEffect(() => {
    if (record.userCreated || findLineupOrigin(record)) return;
    let active = true;
    loadMapOrigins(record.mapId).then(rows => {
      if (active) setOrigins({ map: record.mapId, rows });
    }).catch(() => { /* Keep the known landing visible offline. */ });
    return () => { active = false; };
  }, [record]);
  const map = MAPS.find(item => item.id === record.mapId);
  if (!map) return null;
  const origin = record.userCreated ? undefined : findLineupOrigin(record, origins?.map === map.id ? origins.rows : undefined);
  const pins: Pin[] = [];
  if (origin) pins.push({ ...origin, kind: "Stand", name: origin.label, approximate: origin.precision !== "world" });
  if (record.showMarker !== false && Number.isFinite(record.x) && Number.isFinite(record.y)) {
    pins.push({ x: record.x, y: record.y, levelId: record.levelId, kind: "Land", name: record.target });
  }
  const floors = map.levels.filter(level => pins.some(pin => pin.levelId === level.id));
  if (!floors.length) return null;
  const description = pins.map(pin => `${pin.kind}: ${pin.name}${pin.approximate ? " (approximate)" : ""}${map.levels.length > 1 ? " · " + map.levels.find(floor => floor.id === pin.levelId)?.name : ""}`).join(". ");
  const content = <><span className="ul-guide-radars">
    {floors.map(floor => {
      const markers = pins.filter(pin => pin.levelId === floor.id);
      const xs = markers.map(pin => pin.x), ys = markers.map(pin => pin.y);
      const size = Math.min(1000, Math.max(350, Math.max(...xs) - Math.min(...xs) + 130, Math.max(...ys) - Math.min(...ys) + 130));
      const start = (values: number[]) => Math.max(0, Math.min(1000 - size, (Math.min(...values) + Math.max(...values) - size) / 2));
      return <svg key={floor.id} data-floor={floor.id} viewBox={`${start(xs)} ${start(ys)} ${size} ${size}`} aria-hidden="true">
        <image href={themedRadarImage(floor.image, theme)} width="1000" height="1000" />
        {markers.map(pin => <g key={pin.kind} data-pin={pin.kind} transform={`translate(${pin.x} ${pin.y})`}>
          {pin.kind === "Stand" ? <circle r={size*.059} fill="#157d8a" stroke="white" strokeWidth={size*.016} /> :
            <path d={`M0 ${-size*.077} l${size*.077} ${size*.077} -${size*.077} ${size*.077} -${size*.077} -${size*.077}Z`} fill="#9b401b" stroke="white" strokeWidth={size*.016} />}
        </g>)}
      </svg>;
    })}
  </span><span className="ul-guide-radar-legend">{pins.map(pin => <span key={pin.kind} data-kind={pin.kind}>{pin.kind}</span>)}</span></>;
  return onOpen
    ? <button type="button" className="ul-guide-map-link ul-guide-preview" aria-label="Show throw locations on map" aria-description={description} title={description} onClick={onOpen}>{content}</button>
    : <div className="ul-guide-preview" role="img" aria-label={description} title={description}>{content}</div>;
}
