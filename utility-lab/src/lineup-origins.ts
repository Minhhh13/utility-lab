import { PUBLISHER_MAP_REGISTRATIONS } from './publisher-map-registrations.ts';
import type { PublisherMapRegistration } from './publisher-map-registrations.ts';

export interface OriginFloorPoint {
  x: number;
  y: number;
  levelId: string;
  registrationId: string;
}

/** A published standing point, or an explicitly named standing area. Never a target. */
export interface OriginPoint extends OriginFloorPoint {
  label: string;
  basis: 'publisher-origin' | 'callout-area';
  sourceId?: string;
  /** Only source-supported floor views; each uses that view's own registration. */
  alternateLevels?: OriginFloorPoint[];
}
export type LineupOrigin = OriginPoint;
export type OriginLookup = Record<string, OriginPoint>;
export type OriginRecord = {source?: string; mapId: string; from: string; origin?: OriginPoint};

export function originSourceKey(source: string): string {
  try {
    const url = new URL(source);
    url.hash = '';
    // Query parameters can identify the guide (YouTube v/t, NadesDB nade).
    return url.href.replace(/\/$/, '');
  } catch { return source; }
}

export function projectPublisherOrigin(
  point: {x: number; y: number}, registration: PublisherMapRegistration,
): OriginFloorPoint | undefined {
  if (![point.x, point.y].every(value => Number.isFinite(value) && value >= 0 && value <= 1000)) return undefined;
  const {scaleX, scaleY, translateX, translateY} = registration.transform;
  const x = Math.round((point.x * scaleX + translateX) * 100) / 100;
  const y = Math.round((point.y * scaleY + translateY) * 100) / 100;
  if (![x, y].every(value => Number.isFinite(value) && value >= 0 && value <= 1000)) return undefined;
  return {x, y, levelId: registration.levelId, registrationId: registration.id};
}

export function isOriginPoint(value: unknown): value is OriginPoint {
  if (!value || typeof value !== 'object') return false;
  const point = value as OriginPoint;
  const validFloor = (floor: OriginFloorPoint) => !!floor &&
    [floor.x, floor.y].every(number => Number.isFinite(number) && number >= 0 && number <= 1000) &&
    typeof floor.levelId === 'string' && !!floor.levelId &&
    typeof floor.registrationId === 'string' && !!floor.registrationId;
  return validFloor(point) && typeof point.label === 'string' && !!point.label &&
    ['publisher-origin', 'callout-area'].includes(point.basis) &&
    (point.alternateLevels === undefined || (Array.isArray(point.alternateLevels) && point.alternateLevels.every(validFloor)));
}

export function parseOriginLookup(value: unknown): OriginLookup {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid standing-location catalogue.');
  const lookup: OriginLookup = {};
  for (const [source, point] of Object.entries(value)) {
    if (!isOriginPoint(point)) throw Error(`Invalid standing location: ${source}`);
    lookup[originSourceKey(source)] = point;
  }
  return lookup;
}

const cached = new Map<string, OriginLookup>();
const pending = new Map<string, Promise<OriginLookup>>();

/** The selected map alone downloads its compact source→standing-location table. */
export function loadMapOrigins(mapId: string): Promise<OriginLookup> {
  const old = pending.get(mapId);
  if (old) return old;
  const files = import.meta.glob<string>('./data/lineup-origins/origins-*.json', {query: '?url', import: 'default', eager: true});
  const url = files[`./data/lineup-origins/origins-${mapId}.json`];
  if (!url) return Promise.reject(Error('Standing locations could not load.'));
  const request = fetch(url).then(async response => {
    if (!response.ok) throw Error('Standing locations could not load.');
    const lookup = parseOriginLookup(await response.json());
    cached.set(mapId, lookup);
    return lookup;
  }).catch(error => {pending.delete(mapId); throw error;});
  pending.set(mapId, request);
  return request;
}

export function findLineupOrigin(record: OriginRecord, lookup?: OriginLookup, preferredLevel?: string): OriginPoint | undefined {
  const point = record.origin || (record.source ? (lookup || cached.get(record.mapId))?.[originSourceKey(record.source)] : undefined);
  if (!point || !isOriginPoint(point)) return undefined;
  if (!preferredLevel || point.levelId === preferredLevel) return point;
  const alternate = point.alternateLevels?.find(item => item.levelId === preferredLevel);
  return alternate ? {...point, ...alternate, alternateLevels: [point, ...(point.alternateLevels || [])].filter(item => item.levelId !== preferredLevel).map(({x,y,levelId,registrationId}) => ({x,y,levelId,registrationId}))} : point;
}

export function attachLineupOrigins<T extends OriginRecord>(records: T[], lookup: OriginLookup): (T & {origin?: OriginPoint})[] {
  return records.map(record => {
    const origin = findLineupOrigin(record, lookup);
    return origin ? {...record, origin} : record;
  });
}

/** Verify a published point's floor rather than borrowing a destination's floor. */
export function publisherOriginRegistration(provider: 'cs2tricks' | 'csnades', mapId: string, levelId: string): PublisherMapRegistration | undefined {
  return PUBLISHER_MAP_REGISTRATIONS.find(item => (item.provider || 'cs2tricks') === provider && item.mapId === mapId && item.levelId === levelId);
}
