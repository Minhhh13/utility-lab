import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PUBLISHER_MAP_REGISTRATIONS} from '../src/publisher-map-registrations.ts';
import {projectPublisherOrigin, originSourceKey} from '../src/lineup-origins.ts';
import {PHOTO_GUIDE_LIBRARY} from '../src/guide-library.ts';
import {mergePhotoGuides, normalizeExpandedGuides} from '../src/expanded-guide-model.ts';
import {UTILITY_MAP_REGISTRATIONS} from '../src/data/map-utility-anchor-evidence.ts';

const json = async path => JSON.parse(await readFile(path, 'utf8'));
const maps = ['mirage','dust2','inferno','nuke','ancient','anubis','cache','vertigo'];
const expanded = (await Promise.all(maps.map(async map => normalizeExpandedGuides(await json(`src/data/expanded/${map}.json`), map)))).flat();
const catalogue = mergePhotoGuides(PHOTO_GUIDE_LIBRARY, expanded);
const floorReviews = new Map((await json('docs/data/lineup-origin-floor-evidence.json')).map(row => [originSourceKey(row.source), row]));
const namedOrigins = [...await json('docs/data/lineup-origin-area-evidence.json'),...await json('docs/data/precise-anubis-named-origins.json')];
const lookups = Object.fromEntries(maps.map(map => [map, {}]));
const proof = [];
const reject = [];
const worldEvidence = await json('docs/data/reviewed-world-origins.json');
const worldRows = new Map(worldEvidence.records.map(row => [row.source, row]));
for (const radar of Object.values(worldEvidence.radars)) {
  const bytes = await readFile('public' + radar.artwork);
  if (createHash('sha256').update(bytes).digest('hex') !== radar.artworkSha256) {
    throw Error('Recheck world coordinates against the changed artwork: ' + radar.artwork);
  }
}
function inside(point, polygon) {
  let yes = false;
  for (let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const a=polygon[i], b=polygon[j];
    if ((a[1]>point[1]) !== (b[1]>point[1]) && point[0] < (b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0]) yes=!yes;
  }
  return yes;
}

function publisher(provider, source, mapId, label, rawPoint, rawLevels, sourceId, isRecordedStart = false) {
  if (!rawPoint) {reject.push({source, reason:'Missing publisher origin'}); return;}
  const review = floorReviews.get(originSourceKey(source));
  const oneFloor = !['nuke','vertigo'].includes(mapId);
  let levelIds = oneFloor ? ['main'] : rawLevels?.filter(level => level === 1 || level === 2).map(level => level === 1 ? 'upper' : 'lower');
  if (!levelIds?.length) {
    if (!review || (review.sourceId && review.sourceId !== sourceId)) {reject.push({source, reason:'No independent origin-floor proof'}); return;}
    levelIds = review.levelIds;
  }
  levelIds = [...new Set(levelIds)];
  const points = levelIds.map(levelId => {
    const registration = PUBLISHER_MAP_REGISTRATIONS.find(item => (item.provider || 'cs2tricks') === provider && item.mapId === mapId && item.levelId === levelId);
    return registration && projectPublisherOrigin(rawPoint, registration);
  });
  if (points.some(point => !point)) {reject.push({source, reason:'Invalid or missing source-floor registration'}); return;}
  const world = worldRows.get(source);
  if (world) {
    const radar = worldEvidence.radars[mapId];
    if (!radar || world.mapId !== mapId || world.originId !== sourceId || points.length !== 1 || points[0].levelId !== radar.levelId) {
      throw Error('Mismatched world-origin reference: ' + source);
    }
    const span = radar.scale * radar.radarSize;
    const x = Math.round((world.world.x - radar.posX) / span * 100000) / 100;
    const y = Math.round((radar.posY - world.world.y) / span * 100000) / 100;
    if (![x,y].every(value => Number.isFinite(value) && value >= 0 && value <= 1000)) throw Error('Invalid world start: ' + source);
    points[0] = {x, y, levelId:radar.levelId, registrationId:'world-' + mapId + '-' + radar.levelId};
  }
  const [primary, ...alternateLevels] = points;
  lookups[mapId][originSourceKey(source)] = {...primary, label, basis:'publisher-origin', ...((world || isRecordedStart) ? {precision:'world'} : {}), ...(sourceId ? {sourceId} : {}), ...(alternateLevels.length ? {alternateLevels} : {})};
  proof.push({source, mapId, provider, label, sourceId, rawOrigin:{x:rawPoint.x,y:rawPoint.y}, ...(world ? {worldOrigin:world.world, coordinateBasis:world.sourceMethod}:{}), originLevels:levelIds, rawSourceLevels:rawLevels || null, floorBasis:oneFloor ? 'single-floor-map' : rawLevels?.some(level => level === 1 || level === 2) ? 'publisher-throwFrom-levels' : 'reviewed-source-position', reviewSource:review?.referenceSource, projected:points});
}

for (const row of await json('docs/data/publisher-destination-evidence.json')) {
  publisher('cs2tricks', row.source, row.map, row.from, row.origin, undefined, row.origin?.id);
}
for (const file of ['csnades-publisher','csnades-cache','csnades-dust2','csnades-nuke-community']) {
  for (const row of await json(`docs/data/${file}-destination-evidence.json`)) {
    publisher('csnades', row.source, row.mapId, row.titleFrom, row.throwFrom, row.throwFrom?.levels, row.sourceId);
  }
}
for(const file of ['precise-other-maps-evidence','precise-anubis-evidence']){
 const evidence=await json(`docs/data/${file}.json`);
 for(const row of evidence.records||evidence){
  if(!['setpos','gonade','csnades'].includes(row.provider)||!row.origin)continue;
  publisher(row.provider,row.source,row.mapId,row.label||row.from||row.titleFrom||row.origin.label,
   row.origin,row.origin.levels||row.throwFrom?.levels,row.sourceId||row.publisherId,
   row.provider==='setpos' && Boolean(row.sourceOriginWorld || row.worldOrigin));
 }
}
for (const row of namedOrigins) {
  const record = catalogue.find(item => item.id === row.guideId && item.source === row.source && item.mapId === row.mapId);
  const registration = UTILITY_MAP_REGISTRATIONS.find(item => item.id === row.registrationId && item.mapId === row.mapId && item.levelId === row.levelId);
  if (!record || !registration?.transform || !row.positionPhoto || !row.referenceSource || !inside(row.referencePoint,row.referencePolygon)) throw Error(`Invalid named standing-area proof: ${row.source}`);
  const t=registration.transform;
  const x=Math.round((row.referencePoint[0]*t.scaleX+t.translateX)*100)/100;
  const y=Math.round((row.referencePoint[1]*t.scaleY+t.translateY)*100)/100;
  if (Math.abs(x-row.x)>0.01 || Math.abs(y-row.y)>0.01) throw Error(`Named standing-area registration changed: ${row.source}`);
  const point = {x,y,levelId:row.levelId,registrationId:row.registrationId,label:row.label,basis:'callout-area',sourceId:row.sourceRegionId};
  lookups[row.mapId][originSourceKey(row.source)] = point;
  proof.push({source:row.source,mapId:row.mapId,label:row.label,floorBasis:'reviewed-named-origin-area',basis:'callout-area',projected:[point],referenceSource:row.referenceSource});
}

const missing = catalogue.filter(row => !lookups[row.mapId][originSourceKey(row.source || '')]);
for (const row of worldRows.values()) {
  if (lookups[row.mapId][row.source]?.precision !== 'world' || !catalogue.some(item => item.mapId === row.mapId && item.source === row.source))
    throw Error('World-origin correction has no matching guide: ' + row.source);
}
// Reject all bad source points, including source entries currently hidden by browsing.
if (reject.length || missing.length) throw Error(JSON.stringify({reject,missing:missing.map(row => ({id:row.id,source:row.source}))},null,2));
await mkdir('src/data/lineup-origins', {recursive:true});
const perMap = {};
for (const mapId of maps) {
  // Source tables contain the primary catalogue only, not unused research rows.
  const sources = new Set(catalogue.filter(row => row.mapId === mapId).map(row => originSourceKey(row.source || '')));
  const data = Object.fromEntries(Object.entries(lookups[mapId]).filter(([key]) => sources.has(key)).sort(([a],[b]) => a.localeCompare(b,'en')));
  const text = JSON.stringify(data);
  await writeFile(`src/data/lineup-origins/origins-${mapId}.json`,text+'\n');
  perMap[mapId] = {entries:catalogue.filter(row => row.mapId === mapId).length, uniqueSources:Object.keys(data).length, bytes:Buffer.byteLength(text+'\n'), sha256:createHash('sha256').update(text+'\n').digest('hex')};
}
const summary = {checkedAt:worldEvidence.reviewDate,completeGuides:catalogue.length,withOrigins:catalogue.length-missing.length,uniqueSources:new Set(catalogue.map(row => row.source)).size,publisherOrigins:catalogue.filter(row => lookups[row.mapId][originSourceKey(row.source || '')].basis === 'publisher-origin').length,namedOriginAreas:catalogue.filter(row => lookups[row.mapId][originSourceKey(row.source || '')].basis === 'callout-area').length,crossFloorGuides:catalogue.filter(row => ![lookups[row.mapId][originSourceKey(row.source || '')].levelId,...(lookups[row.mapId][originSourceKey(row.source || '')].alternateLevels || []).map(point => point.levelId)].includes(row.levelId)).map(row => row.id),perMap};
await writeFile('docs/data/lineup-origin-projection-proof.json',JSON.stringify(proof,null,2)+'\n');
await writeFile('docs/data/lineup-origin-summary.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
