import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';
import {MAPS} from '../src/maps.ts';import {GUIDE_LIBRARY} from '../src/guide-library.ts';import {hasCompleteGuideMedia,normalizeExpandedGuides,mergePhotoGuides} from '../src/expanded-guide-model.ts';import {utilityPhotos,validateUtility,parseUtilityVideo,isBundledPhoto} from '../src/utility-data.ts';import {PUBLISHER_MAP_REGISTRATIONS,projectPublisherDestination} from '../src/publisher-map-registrations.ts';import {applyRegisteredUtilityAnchor} from '../src/map-utility-anchors.ts';
const read=(file:string)=>JSON.parse(readFileSync(new URL(file,import.meta.url),'utf8'));
const index=read('../src/data/expanded/index.json');
const perMap=Object.fromEntries(MAPS.map(map=>[map.id,normalizeExpandedGuides(read(`../src/data/expanded/${map.id}.json`),map.id)]));
const records=Object.values(perMap).flat();
const sharedSpawns=read('../docs/data/shared-spawn-photo-evidence.json');

test('every published map/side/utility has source-matched standing/aim photos, explicit inputs and video',()=>{
 assert.ok(records.length>=1200,'Expansion must retain its audited source breadth');
 assert.equal(new Set(records.map(row=>row.id)).size,records.length);
 assert.equal(new Set(records.map(row=>`${row.source}|${row.side}`)).size,records.length);
 for(const map of MAPS){
  const published=mergePhotoGuides(GUIDE_LIBRARY.filter(row=>row.mapId===map.id),perMap[map.id]);
  for(const side of ['T','CT'])for(const type of ['Smoke','Flash','Molotov','HE'])assert.ok(published.some(row=>row.side===side&&row.type===type),`${map.id}/${side}/${type}`);
  for(const row of perMap[map.id]){
   const photos=utilityPhotos(row);assert.equal(photos[0].kind,'position',row.id);assert.ok(photos.some(photo=>photo.kind==='aim'),row.id);
   assert.ok(hasCompleteGuideMedia(row),row.id);assert.match(row.throwType,/LMB|RMB|left|right|both/i,row.id);
   assert.ok(row.creator&&row.source,row.id);assert.ok(row.steps.every(step=>step.trim()),row.id);
   assert.ok(parseUtilityVideo(row.videoUrl!,row.videoStart),row.id);
   for(const photo of photos){
    if(photo.source!==row.source)assert.ok(photo.kind==='position'&&sharedSpawns.some(proof=>proof.guideSource===row.source&&proof.photoSource===photo.source&&proof.photoImage===photo.image&&proof.photoCreator===photo.creator),`Unproven standing-photo substitution: ${row.id}`);
    assert.ok(photo.creator,row.id);if(isBundledPhoto(photo.image))assert.ok(existsSync(new URL(`../public${photo.image}`,import.meta.url)),photo.image);
   }
   assert.equal(index.ids[row.id],map.id,row.id);
  }
 }
});

test('shared standing references identify the exact predefined spawn, with original donor credit and pixels',()=>{
 const evidence=read('../docs/data/publisher-destination-evidence.json');
 for(const proof of sharedSpawns){
  const guide=evidence.find(item=>item.source===proof.guideSource),donor=evidence.find(item=>item.source===proof.photoSource);
  assert.match(proof.spawnLabel,/^T Spawn #[145]$/);assert.equal(guide.origin.id,proof.originID);assert.equal(donor.origin.id,proof.originID);
  assert.deepEqual([guide.origin.x,guide.origin.y],proof.originXY);assert.deepEqual([donor.origin.x,donor.origin.y],proof.originXY);
  assert.equal(createHash('sha256').update(readFileSync(new URL(`../public${proof.photoImage}`,import.meta.url))).digest('hex'),proof.photoSha256);
 }
});

test('source endpoints project through matching, unchanged radar artwork and never use the throw origin',()=>{
 const evidence=read('../docs/data/publisher-destination-evidence.json');
 const csnades=['csnades-publisher-destination-evidence','csnades-cache-destination-evidence','csnades-dust2-destination-evidence','csnades-nuke-community-destination-evidence'].flatMap(name=>read('../docs/data/'+name+'.json'));
 const precision=['precise-other-maps-evidence','precise-anubis-evidence','essential-csnades-four-maps-evidence','essential-nvca-evidence','instant-spawn-smokes-evidence'].flatMap(name=>read('../docs/data/'+name+'.json').records);
 const floorOverrides=read('../docs/data/physical-floor-overrides.json');
 for(const proof of floorOverrides){assert.equal(proof.manuallyReviewed,true);assert.equal(createHash('sha256').update(readFileSync(new URL('../public'+proof.evidence.photo,import.meta.url))).digest('hex'),proof.evidence.sha256);}
 for(const registration of PUBLISHER_MAP_REGISTRATIONS){
  const content=readFileSync(new URL(`../public${registration.artwork}`,import.meta.url));assert.equal(createHash('sha256').update(content).digest('hex'),registration.artworkSha256);
  assert.ok(registration.evidence&&registration.reviewImage);assert.ok(existsSync(new URL(`../${registration.reviewImage}`,import.meta.url)));
 }
 for(const row of records.filter(row=>row.markerSource)){
  const original=evidence.find(item=>item.source===row.source);
  const reviewed=precision.find(item=>item.source===row.source&&item.registrationId&&item.destination);
  if(reviewed){
   assert.equal(row.markerSource!.registrationId,reviewed.registrationId,row.id);
   assert.deepEqual([row.markerSource!.x,row.markerSource!.y],[reviewed.destination.x,reviewed.destination.y],row.id);
   assert.ok(reviewed.origin||original?.origin,row.id);
  }else if(row.source?.startsWith('https://csnades.gg/')){
   const published=csnades.find(item=>item.source===row.source);assert.ok(published?.throwTo,row.id);
   assert.deepEqual([row.markerSource!.destinationId,row.markerSource!.x,row.markerSource!.y],[published.sourceId+':target',published.throwTo.x,published.throwTo.y],row.id);
   const floor=row.levelId==='lower'?2:1;assert.ok(published.throwTo.levels.includes(floor)||floorOverrides.some(item=>item.source===row.source&&item.levelId===row.levelId),row.id);
  }else{
   assert.ok(original?.destination,row.id);assert.deepEqual([row.markerSource!.destinationId,row.markerSource!.x,row.markerSource!.y],[original.destination.id,original.destination.x,original.destination.y],row.id);
  }
  const point=projectPublisherDestination(row);assert.deepEqual(point,{x:row.x,y:row.y},row.id);assert.equal(row.showMarker,true);
  assert.equal(projectPublisherDestination({...row,levelId:'not-a-floor'}),null);assert.equal(projectPublisherDestination({...row,source:'https://example.com/source'}),null);
 }
 const dust=records.filter(row=>row.mapId==='dust2'&&row.type==='Molotov');assert.ok(dust.length>=24);assert.ok(dust.every(row=>row.showMarker));
 const personal={...records[0],userCreated:true,x:123,y:456};assert.deepEqual(applyRegisteredUtilityAnchor(personal),personal);
});

test('broken or duplicate source records fail before they reach browsing',()=>{
 const row=records[0];assert.ok(row);
 assert.throws(()=>normalizeExpandedGuides([{...row,videoUrl:undefined,videoFallbackUrl:undefined}],row.mapId));
 assert.throws(()=>normalizeExpandedGuides([{...row,photos:[],remotePhotos:[]}],row.mapId));
 assert.throws(()=>normalizeExpandedGuides([{...row,throwType:'Shown in video'}],row.mapId));
 assert.throws(()=>normalizeExpandedGuides([row,row],row.mapId));
 assert.throws(()=>normalizeExpandedGuides([row],'outside-pool'));
});

test('a reviewed replacement gallery removes earlier remote slides while preserving the saved guide ID',()=>{
 const reviewed=records.find(row=>row.spawn?.family==='mirage-t-window-cs2tricks')!;
 assert.ok(reviewed);
 const position=utilityPhotos(reviewed).find(photo=>photo.kind==='position')!;
 const aim=utilityPhotos(reviewed).find(photo=>photo.kind==='aim')!;
 const earlier={...reviewed,id:'saved-before-gallery-review',photos:undefined,
  remotePhotos:[{...position,title:'Earlier standing reference'},{...aim,title:'Earlier aim reference'}],
  image:position.image};
 const replacement={...reviewed,photos:[position,aim],remotePhotos:undefined,image:undefined};
 const merged=mergePhotoGuides([earlier],[replacement]);
 assert.equal(merged.length,1);
 assert.equal(merged[0].id,earlier.id,'Existing favorites and shared links retain their original ID');
 assert.deepEqual(utilityPhotos(merged[0]),[position,aim],'Old remotePhotos must not prepend duplicate or stale slides');
 assert.equal(merged[0].remotePhotos,undefined);
 assert.deepEqual(merged[0].spawn,replacement.spawn);
 assert.equal(merged[0].videoUrl,replacement.videoUrl);
});

test('same-guide video fallback and publisher provenance survive portable validation; unsafe URLs are rejected',()=>{
 const row=records.find(row=>row.videoFallbackUrl)!;assert.ok(row,'Native source clip needs its exact alternate player');
 const restored=validateUtility(JSON.parse(JSON.stringify(row)))!;assert.ok(restored);assert.equal(restored.videoFallbackUrl,row.videoFallbackUrl);assert.deepEqual(restored.markerSource,row.markerSource);
 for(const url of ['javascript:alert(1)','https://name:password@www.youtube.com/watch?v=MJ-dtTYTUS8','ftp://www.youtube.com/watch?v=MJ-dtTYTUS8'])assert.equal(validateUtility({...row,videoFallbackUrl:url}),null,url);
 for(const point of [{...row.markerSource,x:Infinity},{...row.markerSource,y:-1},[],null])assert.equal(validateUtility({...row,markerSource:point}),null);
});


