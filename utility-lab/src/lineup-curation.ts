import { resolveUtilityAnchor } from './map-utility-anchors.ts';
import { projectPublisherDestination } from './publisher-map-registrations.ts';
import type { UtilityReference } from './utility-data.ts';

const normalize = (value: string) => value.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Numbered spawn slots are one origin family, not four different approaches. */
export function normalizeOriginLabel(label: string): string {
  return normalize(label).replace(/\b(ct|t)spawn\s*\d*\b/g, '$1 spawn')
    .replace(/\bspawn\s*(?:position\s*|slot\s*)?\d+\b/g, 'spawn').replace(/\s+/g, ' ').trim();
}

/** Conservative: explicit registered callout first, publisher ID, then exact named point. */
export function targetSpotKey(record: UtilityReference): string {
  const scope = `${record.mapId}|${record.levelId}|${record.side}|${record.type}|`;
  const anchor = resolveUtilityAnchor(record);
  if (anchor) return `${scope}callout:${anchor.id}`;
  if (record.markerSource && projectPublisherDestination(record)) return `${scope}publisher:${record.markerSource.registrationId}:${record.markerSource.destinationId}`;
  // Do not average neighbouring targets or collapse named close/far/left/right spots.
  return `${scope}point:${normalize(record.target)}:${record.x.toFixed(2)}:${record.y.toFixed(2)}`;
}

function throwComplexity(record: UtilityReference): number {
  // The explicit throw label describes input; prose can also mention the landing player.
  const text = normalize(record.throwType || '');
  return (text.includes('run') ? 12 : 0) + (text.includes('walk') ? 7 : 0) +
    (text.includes('jump') ? 4 : 0) + (text.includes('crouch') ? 2 : 0) +
    (/middle|both|left and right/.test(text) ? 1 : 0);
}

function compareGuides(a: UtilityReference, b: UtilityReference): number {
  return throwComplexity(a) - throwComplexity(b) ||
    normalizeOriginLabel(a.from).localeCompare(normalizeOriginLabel(b.from), 'en') ||
    a.id.localeCompare(b.id, 'en');
}

/** A display selection. The input catalogue is unchanged for saves, links and favorites. */
export function curateLineups<T extends UtilityReference>(records: T[], maxPerSpot = 4): T[] {
  const limit = Math.max(1, Math.floor(Number.isFinite(maxPerSpot) ? maxPerSpot : 4));
  const groups = new Map<string, T[]>();
  const keys = new Map<T,string>();
  const selected = new Set<T>();
  for (const record of records) {
    const key = targetSpotKey(record);
    keys.set(record,key);
    // A person's own guide is never silently removed from their map.
    if (record.userCreated) {selected.add(record); continue;}
    const group = groups.get(key) || [];
    group.push(record); groups.set(key, group);
  }
  for (const group of groups.values()) {
    const ordered = [...group].sort(compareGuides);
    const families = new Set<string>();
    let count = 0;
    for (const record of ordered) {
      const family = normalizeOriginLabel(record.from);
      if (families.has(family)) continue;
      selected.add(record); families.add(family);
      if (++count === limit) break;
    }
    for (const record of ordered) {
      if (count >= limit) break;
      if (!selected.has(record)) {selected.add(record); count++;}
    }
  }
  // Stable across provider/file order, without mutating the caller's array.
  return records.filter(record => selected.has(record)).sort((a,b) => keys.get(a)!.localeCompare(keys.get(b)!, 'en') || compareGuides(a,b));
}
