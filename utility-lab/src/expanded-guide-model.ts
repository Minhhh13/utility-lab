import { MAPS } from './maps.ts';
import { withAimPlacement } from './aim-placement.ts';
import { applyRegisteredUtilityAnchor } from './map-utility-anchors.ts';
import { parseUtilityVideo, utilityPhotos, validateUtility, type UtilityReference } from './utility-data.ts';

/** Complete references qualify for primary browsing; old IDs remain in the archive. */
export function hasCompleteGuideMedia(guide: UtilityReference): boolean {
  const photos=utilityPhotos(guide);
  try {
    return photos.some(photo=>photo.kind==='position') && photos.some(photo=>photo.kind==='aim') &&
      !!parseUtilityVideo(guide.videoUrl||'',guide.videoStart) &&
      !!guide.throwType.trim() && !/not recorded|see guide|shown in video/i.test(guide.throwType) && guide.steps.length>=3;
  } catch { return false; }
}

export function normalizeExpandedGuides(value: unknown, mapId: string): UtilityReference[] {
  if(!Array.isArray(value))throw Error('The map lineup catalogue is invalid.');
  const map=MAPS.find(map=>map.id===mapId);
  if(!map)throw Error('That map is outside this library.');
  const ids=new Set<string>();
  return value.map(raw=>{
    const record=validateUtility(raw);
    if(!record || record.mapId!==mapId || !map.levels.some(level=>level.id===record.levelId) ||
       !hasCompleteGuideMedia(record) || ids.has(record.id))throw Error('A map lineup is missing verified media or has invalid data.');
    ids.add(record.id);
    return withAimPlacement(applyRegisteredUtilityAnchor({...record,userCreated:false}));
  });
}

export function mergePhotoGuides(base: UtilityReference[], expanded: UtilityReference[]): UtilityReference[] {
  const records=new Map<string,UtilityReference>();
  const key=(guide:UtilityReference)=>`${guide.source||guide.id}|${guide.side}`;
  for(const guide of base) if(hasCompleteGuideMedia(guide))records.set(key(guide),guide);
  for(const guide of expanded){const previous=records.get(key(guide));records.set(key(guide),previous?{...previous,...guide,id:previous.id}:guide);}
  return [...records.values()];
}
