/** Offline generation from the separately audited public-source data exports. */
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {MAPS} from '../src/maps.ts';
import {GUIDE_LIBRARY} from '../src/guide-library.ts';
import {normalizeExpandedGuides} from '../src/expanded-guide-model.ts';
import {isBundledPhoto,utilityPhotos} from '../src/utility-data.ts';
import {cs2tricksStagePhotos} from '../src/data/cs2tricks-stage-photos.ts';
import {otherStagePhotos} from '../src/data/other-stage-photos.ts';
import {withPublisherAimCloseup} from './publisher-aim-closeup.mjs';
import {reviewedSpawnMap} from '../src/data/all-map-spawn-sheets.ts';
import {NIC_AIM_LANDMARKS} from '../src/data/numbered-aim-landmarks-nic.ts';
import {OTHER_AIM_LANDMARKS} from '../src/data/numbered-aim-landmarks-rest.ts';

// Only embed each map's cues in its own catalogue. Browsers opening the map
// never need to fetch a separate landmark table.
const aimLandmarks = {...NIC_AIM_LANDMARKS, ...OTHER_AIM_LANDMARKS};
function withNumberedAimLandmarks(record) {
  const cue = aimLandmarks[record.id];
  if (!cue) return record;
  if (!reviewedSpawnMap(record)) throw Error(`Unmatched numbered aim guide: ${record.id}`);
  const caption = (photo) => {
    if (photo.kind !== 'aim' || photo.source !== record.source) return photo;
    const nativeDetail = /^(Aim detail\b|Close view\b)/i.test(photo.caption);
    return {...photo, caption: nativeDetail ? `Aim detail · ${cue.detail}` : cue.detail};
  };
  const steps = [...record.steps];
  steps[1] = cue.wide;
  return {...record, steps, photos: record.photos?.map(caption), remotePhotos: record.remotePhotos?.map(caption)};
}
const sources=[
 ['../src/data/essential-csnades-four-maps.ts','ESSENTIAL_CSNADES_FOUR_MAPS'],
 ['../src/data/essential-nvca.ts','ESSENTIAL_NVCA'],
 ['../src/data/instant-spawn-smokes.ts','INSTANT_SPAWN_SMOKES'],
 ['../src/data/instant-vertigo.ts','INSTANT_VERTIGO'],
 ['../src/data/precise-mirage-ancient.ts','PRECISE_MIRAGE_ANCIENT'],
 ['../src/data/precise-other-maps.ts','PRECISE_OTHER_MAPS'],
 ['../src/data/precise-anubis.ts','PRECISE_ANUBIS'],
 ['../src/data/expanded-dust2-mirage-ancient.ts','EXPANDED_DUST2_MIRAGE_ANCIENT'],
 ['../src/data/expanded-inferno-anubis-cache.ts','EXPANDED_INFERNO_ANUBIS_CACHE'],
 ['../src/data/expanded-nuke-vertigo.ts','EXPANDED_NUKE_VERTIGO'],
 ['../src/data/expanded-nuke-csnades.ts','EXPANDED_NUKE_CSNADES'],
 ['../src/data/expanded-nuke-completions.ts','EXPANDED_NUKE_COMPLETIONS'],
 ['../src/data/expanded-nuke-community.ts','EXPANDED_NUKE_COMMUNITY'],
 ['../src/data/expanded-cache-csnades.ts','EXPANDED_CACHE_CSNADES'],
 ['../src/data/expanded-cache-completions.ts','EXPANDED_CACHE_COMPLETIONS'],
];
const rows=[];
const preciseEvidence=(await Promise.all(['docs/data/precise-other-maps-evidence.json','docs/data/precise-anubis-evidence.json','docs/data/essential-csnades-four-maps-evidence.json','docs/data/essential-nvca-evidence.json','docs/data/instant-spawn-smokes-evidence.json']
 .map(async file=>{const data=JSON.parse(await readFile(file,'utf8'));return Array.isArray(data)?data:data.records;}))).flat();
const preciseEndpoints=new Map(preciseEvidence.map(row=>[row.source,row]));
const endpointEvidence=JSON.parse(await readFile('docs/data/publisher-destination-evidence.json','utf8'));
const endpoints=new Map(endpointEvidence.map(row=>[row.source,row]));
const csnadesEvidence=(await Promise.all([
 'docs/data/csnades-publisher-destination-evidence.json',
 'docs/data/csnades-cache-destination-evidence.json',
 'docs/data/csnades-dust2-destination-evidence.json',
 'docs/data/csnades-nuke-community-destination-evidence.json',
].map(async file=>JSON.parse(await readFile(file,'utf8'))))).flat();
const csnadesEndpoints=new Map(csnadesEvidence.map(row=>[row.source,row]));
const floorOverrides=JSON.parse(await readFile('docs/data/physical-floor-overrides.json','utf8'));
for(const [file,name] of sources){
 const module=await import(new URL(file,import.meta.url));
 if(!Array.isArray(module[name]))throw Error(`Missing audited source export: ${name}`);
 rows.push(...module[name]);
}
const ids={},maps={},bundledPhotos=new Set(),sourcesSeen=new Set(),generated=[];
function collectStagePhotos(record) {
  for (const photo of Object.values({...cs2tricksStagePhotos(record), ...otherStagePhotos(record)})) {
    if (photo && isBundledPhoto(photo.image)) bundledPhotos.add(photo.image);
  }
}
GUIDE_LIBRARY.forEach(collectStagePhotos);
await mkdir('src/data/expanded',{recursive:true});
for(const map of MAPS){
 const values=[];
 for(const row of rows.filter(row=>row.mapId===map.id)){
  const key=`${row.source}|${row.side}`;
  if(sourcesSeen.has(key))continue;sourcesSeen.add(key);
  const existing=GUIDE_LIBRARY.find(old=>old.source===row.source&&old.side===row.side);
  let record=existing?{...row,id:existing.id}:row;
  const precise=preciseEndpoints.get(record.source);
  if(precise?.mapId===record.mapId && precise.destination && precise.registrationId){
   const destination=precise.destination;
   record={...record,markerSource:{registrationId:precise.registrationId,
    destinationId:destination.id||`${precise.provider}:${precise.sourceId||precise.publisherId}:target`,x:destination.x,y:destination.y}};
   const match=precise.targetMatch;
   if(match?.existingGuideId){
    const original=GUIDE_LIBRARY.find(guide=>guide.id===match.existingGuideId)||rows.find(guide=>guide.id===match.existingGuideId);
    if(!original||original.mapId!==record.mapId||original.levelId!==record.levelId||original.type!==record.type)
     throw Error(`Invalid existing destination match: ${record.id}`);
    record={...record,target:match.target,...(match.areaId?{destinationArea:match.areaId}:{}),...(match.distinctVariant?{landingVariant:match.distinctVariant}:{})};
   }
  }
  const evidence=endpoints.get(record.source);
  if(evidence?.map===record.mapId && evidence.destination){
   record={...record,markerSource:{
    registrationId:`cs2tricks-${record.mapId}-${record.levelId}-20261109`,
    destinationId:evidence.destination.id,x:evidence.destination.x,y:evidence.destination.y,
   }};
  }
  const csnades=csnadesEndpoints.get(record.source);
  if(csnades?.mapId===record.mapId && csnades.throwTo){
   const floor=record.levelId==='lower'?2:1;
   if(!csnades.throwTo.levels.includes(floor) &&
      !floorOverrides.some(override=>override.source===record.source&&override.levelId===record.levelId))
     throw Error(`Unreviewed destination floor: ${record.id}`);
   record={...record,markerSource:{
    registrationId:`csnades-${record.mapId}-${record.levelId}-20261109`,
    destinationId:`${csnades.sourceId}:target`,x:csnades.throwTo.x,y:csnades.throwTo.y,
   }};
  }
  values.push(withNumberedAimLandmarks(withPublisherAimCloseup(record)));
 }
 const records=normalizeExpandedGuides(values,map.id);
 records.forEach(collectStagePhotos);
 for(const record of records){if(ids[record.id])throw Error(`Duplicate guide ID: ${record.id}`);ids[record.id]=map.id;for(const photo of utilityPhotos(record))if(isBundledPhoto(photo.image))bundledPhotos.add(photo.image);}
 generated.push([`src/data/expanded/${map.id}.json`,JSON.stringify(records)+'\n']);
 maps[map.id]={records:records.length,T:{},CT:{},pinned:records.filter(record=>record.showMarker).length};
 for(const side of ['T','CT'])for(const type of ['Smoke','Flash','Molotov','HE'])maps[map.id][side][type]=records.filter(record=>record.side===side&&record.type===type).length;
}
// Validate the complete source set before replacing any generated map file.
for(const [path,content] of generated)await writeFile(path,content);
await writeFile('src/data/expanded/bundled-photos.json',JSON.stringify([...bundledPhotos])+'\n');
await writeFile('src/data/expanded/index.json',JSON.stringify({ids,maps},null,2)+'\n');
console.log(JSON.stringify({records:Object.keys(ids).length,maps,bundledPhotos:bundledPhotos.size},null,2));
