import type { UtilityReference } from "./utility-data.ts";
import { resolveUtilityAnchor, UTILITY_MAP_ANCHORS } from "./map-utility-anchors.ts";

export type UtilityMarkerGroup = {
  id: string;
  /** Semantic destination; unrelated callouts never disappear into one pie. */
  areaId: string;
  label: string;
  detailTargets: string[];
  variant?: string;
  /** A real member's registered destination, never an averaged/display point. */
  x: number;
  y: number;
  records: UtilityReference[];
};
export type MarkerLayoutBounds = { x: number; y: number; width: number; height: number };
export type LaidOutUtilityMarker = UtilityMarkerGroup & {
  /** Badge-only position. Draw its leader back to unchanged x/y when offset. */
  displayX: number;
  displayY: number;
  inView: boolean;
};
export type UtilityAreaCluster = UtilityMarkerGroup & {
  /** Every named area stays available behind this fixed-position badge. */
  areas: UtilityMarkerGroup[];
};

const normalize = (value: string) => value.toLowerCase().replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, " ").trim().replace(/\bx ?box\b/g, "x box");
const scope = (record: Pick<UtilityReference, "mapId" | "levelId">) => `${record.mapId}|${record.levelId}|`;
const aliases = new Map<string, (typeof UTILITY_MAP_ANCHORS)[number]>();
for (const anchor of UTILITY_MAP_ANCHORS) for (const alias of anchor.aliases) {
  const key = scope(anchor) + normalize(alias);
  if (!aliases.has(key)) aliases.set(key, anchor);
}
const qualifier = "(?:close|near|deep|far|front|back|top|bottom|left|right)";
const leadingQualifier = new RegExp(`^(?:${qualifier} )+`);
const trailingQualifier = new RegExp(`(?: ${qualifier})+$`);

/** Overview families affect navigation only, not coordinates/provenance.
 * Only exact aliases and positional qualifiers of reviewed named callouts join.
 * Composite destinations and distinct nearby places remain independent. */
export function utilityMarkerArea(record: UtilityReference): { id: string; label: string } {
  const target = normalize(record.target);
  const reviewed=!record.userCreated&&record.destinationArea ? UTILITY_MAP_ANCHORS.find(anchor=>
    anchor.id===record.destinationArea&&anchor.mapId===record.mapId&&anchor.levelId===record.levelId) : undefined;
  let anchor = reviewed || resolveUtilityAnchor(record) || aliases.get(scope(record) + target);
  if (!anchor && !/[\/&+]/.test(record.target)) {
    const unqualified = target.replace(leadingQualifier, "").replace(trailingQualifier, "");
    if (unqualified !== target && !["a", "b", "default"].includes(unqualified))
      anchor = aliases.get(scope(record) + unqualified);
  }
  return anchor
    ? { id: anchor.id, label: anchor.label }
    : { id: `${record.mapId}:${record.levelId}:named:${target || record.id}`, label: record.target.trim() };
}

/** Fit overview keeps one parent per main area, carrying every destination.
 * Otherwise only nearby variants of the SAME area combine, so zoom refines the
 * real points without ever swallowing a different named location. */
export function groupUtilityMarkers(records: UtilityReference[], mapUnit: number, overview = false): UtilityMarkerGroup[] {
  const groups: UtilityMarkerGroup[] = [];
  const unit = Number.isFinite(mapUnit) ? Math.max(0.001, mapUnit) : 1;
  const distance = unit * 46;
  for (const record of records) {
    if (record.showMarker === false || !Number.isFinite(record.x) || !Number.isFinite(record.y)) continue;
    const area = utilityMarkerArea(record);
    const group = groups.find(item => item.areaId === area.id &&
      item.records[0].side === record.side && item.records[0].levelId === record.levelId &&
      (overview || Math.hypot(item.x - record.x, item.y - record.y) < distance));
    if (!group) {
      groups.push({ id: record.id, areaId: area.id, label: area.label,
        detailTargets: [record.target.trim()], x: record.x, y: record.y, records: [record] });
    } else {
      group.records.push(record);
      if (!group.detailTargets.includes(record.target.trim())) group.detailTargets.push(record.target.trim());
    }
  }
  for (const group of groups) {
    if (!overview && group.detailTargets.length === 1 &&
        normalize(group.detailTargets[0]) !== normalize(group.label) &&
        (leadingQualifier.test(normalize(group.detailTargets[0])) || trailingQualifier.test(normalize(group.detailTargets[0]))))
      group.label = group.detailTargets[0];
  }
  return groups;
}

/** The next navigation step after choosing an area and utility: expose EVERY
 * distinct registered destination, independent of zoom and origin-count caps.
 * A source-confirmed spawn family shares its explicitly named destination with
 * the other recipes for that same name. Small recorded impact variations must
 * not become new landing choices. Qualified names (close/far/left/right) remain
 * separate. Other guides retain their published two-decimal point identity.
 * Keep a real first member's anchor; never average or rewrite source points. */
export function splitUtilityDestinations(records: readonly UtilityReference[]): UtilityMarkerGroup[] {
  const destinations = new Map<string, UtilityMarkerGroup>();
  const namedKey=(record:UtilityReference,areaId:string)=>`${record.mapId}:${record.levelId}:${record.side}:${record.type}:${encodeURIComponent(areaId)}:${encodeURIComponent(normalize(record.target))}:${encodeURIComponent(normalize(record.landingVariant||''))}`;
  const spawnDestinations=new Set(records.filter(record=>record.spawn&&!record.userCreated)
    .map(record=>namedKey(record,utilityMarkerArea(record).id)));
  for (const record of records) {
    if (record.showMarker === false || !Number.isFinite(record.x) || !Number.isFinite(record.y)) continue;
    const area = utilityMarkerArea(record);
    const pointX = Number(record.x.toFixed(2)).toFixed(2);
    const pointY = Number(record.y.toFixed(2)).toFixed(2);
    const named=namedKey(record,area.id);
    const id = spawnDestinations.has(named)&&!record.userCreated ? `destination:spawn:${named}` :
      `destination:${record.mapId}:${record.levelId}:${record.side}:${record.type}:${encodeURIComponent(area.id)}:${pointX}:${pointY}`;
    const originalTarget = `${record.target.trim()}${record.landingVariant?` · ${record.landingVariant}`:''}`;
    const previous = destinations.get(id);
    if (!previous) {
      destinations.set(id, { id, areaId: area.id, label: originalTarget || area.label,
        detailTargets: [originalTarget], x: record.x, y: record.y, records: [record],...(record.landingVariant?{variant:record.landingVariant}:{}) });
    } else {
      previous.records.push(record);
      if (!previous.detailTargets.includes(originalTarget)) previous.detailTargets.push(originalTarget);
      if (previous.detailTargets.length > 1) previous.label = area.label;
    }
  }
  return [...destinations.values()];
}

/** Compact overview clusters keep their FIRST real representative fixed.
 * Nearby places are choices inside the cluster, never discarded or displaced.
 * Only the same map/floor/side can cluster; source records and named areas are
 * unioned without mutating the original semantic/refined groups. */
export function clusterUtilityAreas(
  groups: readonly UtilityMarkerGroup[], mapUnit: number, distancePx = 46,
): UtilityAreaCluster[] {
  const unit = Number.isFinite(mapUnit) ? Math.max(.001, mapUnit) : 1;
  const distance = (Number.isFinite(distancePx) && distancePx > 0 ? distancePx : 46) * unit;
  const context = (group: UtilityMarkerGroup) => {
    const first = group.records[0];
    return first ? `${first.mapId}|${first.levelId}|${first.side}` : group.areaId;
  };
  const working: {x: number; y: number; context: string; members: UtilityMarkerGroup[]}[] = [];
  for (const group of groups) {
    if (!Number.isFinite(group.x) || !Number.isFinite(group.y)) continue;
    const key = context(group);
    const cluster = working.find(item => item.context === key && Math.hypot(item.x - group.x, item.y - group.y) < distance);
    if (cluster) cluster.members.push(group);
    else working.push({x: group.x, y: group.y, context: key, members: [group]});
  }
  const uniqueRecords = (records: UtilityReference[]) => {
    const seen = new Set<string>();
    return records.filter(record => {
      if (seen.has(record.id)) return false;
      seen.add(record.id); return true;
    });
  };
  return working.map(cluster => {
    const byArea = new Map<string, UtilityMarkerGroup>();
    for (const member of cluster.members) {
      const previous = byArea.get(member.areaId);
      const details = [...member.detailTargets, ...member.records.map(record => record.target.trim())];
      if (!previous) {
        byArea.set(member.areaId, {...member, records: uniqueRecords(member.records), detailTargets: [...new Set(details)]});
      } else {
        previous.records = uniqueRecords([...previous.records, ...member.records]);
        previous.detailTargets = [...new Set([...previous.detailTargets, ...details])];
        if (previous.records[0]) previous.label = utilityMarkerArea(previous.records[0]).label;
      }
    }
    const areas = [...byArea.values()];
    const membership = [...new Set(cluster.members.map(member => `${member.areaId}@${member.x.toFixed(2)},${member.y.toFixed(2)}`))].sort().join("|");
    const id = `area-cluster:${encodeURIComponent(cluster.context)}:${encodeURIComponent(membership)}`;
    return {
      id,
      areaId: areas.length === 1 ? areas[0].areaId : `nearby:${encodeURIComponent(cluster.context)}:${areas.map(area => encodeURIComponent(area.areaId)).sort().join("|")}`,
      label: areas.length === 1 ? areas[0].label : "Nearby locations",
      detailTargets: [...new Set(areas.flatMap(area => area.detailTargets))],
      x: cluster.x, y: cluster.y,
      records: uniqueRecords(areas.flatMap(area => area.records)),
      areas,
    };
  });
}

/** Deterministic badge layout, never altered grenade positions. Effective
 * bounds include SVG letterboxing. Offscreen anchors remain offscreen. */
export function layoutUtilityMarkers(groups: UtilityMarkerGroup[], mapUnit: number, bounds: MarkerLayoutBounds): LaidOutUtilityMarker[] {
  const results = groups.map(group => ({ ...group, displayX: group.x, displayY: group.y, inView: false }));
  if (![bounds.x, bounds.y, bounds.width, bounds.height, mapUnit].every(Number.isFinite) ||
      bounds.width <= 0 || bounds.height <= 0 || mapUnit <= 0) return results;
  const spacing = 46 * mapUnit, radius = spacing / 2;
  const minX = bounds.x + Math.min(radius, bounds.width / 2), maxX = bounds.x + bounds.width - Math.min(radius, bounds.width / 2);
  const minY = bounds.y + Math.min(radius, bounds.height / 2), maxY = bounds.y + bounds.height - Math.min(radius, bounds.height / 2);
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const visible = results.filter(group => group.x >= bounds.x && group.x <= bounds.x + bounds.width &&
    group.y >= bounds.y && group.y <= bounds.y + bounds.height).sort((a, b) =>
      a.areaId.localeCompare(b.areaId, "en") || a.x - b.x || a.y - b.y || a.id.localeCompare(b.id, "en"));
  const cells: {x: number; y: number}[] = [];
  for (let y = minY; y <= maxY + .001; y += spacing)
    for (let x = minX; x <= maxX + .001; x += spacing) cells.push({ x, y });
  const placed: {x: number; y: number}[] = [];
  const clear = (point: {x: number; y: number}) => placed.every(old =>
    (point.x - old.x) ** 2 + (point.y - old.y) ** 2 >= spacing ** 2 - .001);
  let needsGrid = false;
  for (const group of visible) {
    const desired = { x: clamp(group.x, minX, maxX), y: clamp(group.y, minY, maxY) };
    const ranked = clear(desired) ? [desired] : [...cells].sort((a, b) =>
      ((a.x - group.x) ** 2 + (a.y - group.y) ** 2) - ((b.x - group.x) ** 2 + (b.y - group.y) ** 2) || a.y - b.y || a.x - b.x);
    const point = ranked.find(clear);
    if (!point) { needsGrid = true; break; }
    group.displayX = point.x; group.displayY = point.y; group.inView = true; placed.push(point);
  }
  // Exact positions can block a grid despite sufficient space. Assign all
  // visible badges to nearest free cells only in that dense fallback case.
  if (needsGrid && cells.length >= visible.length) {
    const free = [...cells];
    for (const group of visible) {
      let best = 0, distance = Infinity;
      for (let i = 0; i < free.length; i++) {
        const next = (free[i].x - group.x) ** 2 + (free[i].y - group.y) ** 2;
        if (next < distance) { best = i; distance = next; }
      }
      const [point] = free.splice(best, 1);
      group.displayX = point.x; group.displayY = point.y; group.inView = true;
    }
  } else if (needsGrid) {
    // Impossible caller bounds must not silently discard locations.
    for (const group of visible) group.inView = true;
  }
  return results;
}
