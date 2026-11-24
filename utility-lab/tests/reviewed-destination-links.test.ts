import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import links from '../src/data/reviewed-destination-links.json' with {type:'json'};
import {PRECISE_ANUBIS} from '../src/data/precise-anubis.ts';
import {projectPublisherDestination,projectReviewedDestination} from '../src/publisher-map-registrations.ts';
import {applyRegisteredUtilityAnchor} from '../src/map-utility-anchors.ts';
import {groupUtilityMarkers,splitUtilityDestinations,utilityMarkerArea} from '../src/utility-markers.ts';
import {utilityPhotos,type UtilityReference} from '../src/utility-data.ts';

const json=(path:string)=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const link=links[0];
const running=PRECISE_ANUBIS.find(row=>row.id===link.guideId)!;
const reference=PRECISE_ANUBIS.find(row=>row.id===link.reference.guideId)!;

test('reviewed Camera source reuses the proven named area without impersonating its publisher',()=>{
 assert.ok(running&&reference);
 assert.equal(running.markerSource,undefined);
 assert.equal(projectPublisherDestination(running),null);
 assert.equal(projectPublisherDestination({...running,markerSource:reference.markerSource}),null,
  'A borrowed CS2Tricks point must still fail the original publisher URL gate');
 const before=JSON.stringify(running);
 const expected=projectPublisherDestination(reference);
 assert.ok(expected);
 assert.deepEqual(projectReviewedDestination(running),expected);
 const pinned=applyRegisteredUtilityAnchor(running);
 assert.equal(pinned.showMarker,true);
 assert.deepEqual({x:pinned.x,y:pinned.y},expected);
 assert.deepEqual(utilityMarkerArea(pinned),utilityMarkerArea(reference));
 assert.equal(utilityMarkerArea(pinned).id,link.destinationArea);
 assert.equal(pinned.markerSource,undefined);
 assert.equal(pinned.source,running.source);
 assert.equal(pinned.videoUrl,running.videoUrl);
 assert.equal(pinned.videoStart,313);
 assert.deepEqual(utilityPhotos(pinned),utilityPhotos(running));
 assert.equal(utilityPhotos(pinned).length,4);
 assert.equal(JSON.stringify(running),before,'Projection must not mutate source metadata');
});

test('reviewed links reject every changed identity scope and personal records',()=>{
 const changes:Partial<UtilityReference>[]=[
  {id:running.id+'-other'},
  {source:'https://www.youtube.com/watch?v=YiiypSiuFkE&t=314'},
  {source:'https://www.youtube.com/watch?v=another-video&t=313'},
  {mapId:'mirage'}, {levelId:'lower'}, {side:'CT'}, {type:'Molotov'},
  {target:'Camera'}, {target:'B Connector'}, {userCreated:true},
 ];
 for(const change of changes)assert.equal(projectReviewedDestination({...running,...change}),null,JSON.stringify(change));
 const personal={...running,userCreated:true,x:123,y:456};
 assert.deepEqual(applyRegisteredUtilityAnchor(personal),personal,
  'A personal map location remains owned by the person');
 assert.equal(projectReviewedDestination(reference),null,'The reference has its own publisher projection');
});

test('reviewed reference point and source hash join the original endpoint evidence',()=>{
 const published=json('../docs/data/publisher-destination-evidence.json')
  .find((row:{source:string})=>row.source===link.reference.source);
 assert.ok(published);
 assert.equal(link.reference.source,reference.source);
 assert.equal(published.map,link.mapId);
 assert.equal(published.target,link.target);
 assert.deepEqual(link.reference.markerSource,reference.markerSource);
 assert.deepEqual({id:link.reference.markerSource.destinationId,x:link.reference.markerSource.x,y:link.reference.markerSource.y},published.destination);
 assert.equal(createHash('sha256').update(JSON.stringify(published)).digest('hex'),link.referenceSourceSha256);
 assert.equal(link.referenceSourceSha256.length,64);
 assert.ok(readFileSync(new URL('../'+link.reviewImage,import.meta.url)).length>1000);
});

test('Inside and Outside Connector choices share the existing unqualified overview area',()=>{
 const sourceEvidence=json('../docs/data/precise-anubis-evidence.json').records;
 const old=json('../src/data/expanded/anubis.json')
  .find((row:UtilityReference)=>row.id==='expanded-cs2tricks-anubis-connector-from-t-spawn-162f-t');
 assert.ok(old);
 const current=PRECISE_ANUBIS.filter(row=>row.spawn&&/conn$/.test(row.spawn.family)).map(row=>{
  const evidence=sourceEvidence.find((e:{guideId:string})=>e.guideId===row.id);
  return applyRegisteredUtilityAnchor({...row,target:evidence.targetMatch.target,
   destinationArea:evidence.targetMatch.areaId,landingVariant:evidence.targetMatch.distinctVariant,
   markerSource:{registrationId:evidence.registrationId,destinationId:evidence.destination.id,
    x:evidence.destination.x,y:evidence.destination.y}});
 });
 assert.equal(current.length,16);
 const areas=groupUtilityMarkers([old,...current],1,true);
 assert.equal(areas.length,1);
 assert.equal(areas[0].areaId,utilityMarkerArea(old).id);
 const choices=splitUtilityDestinations([old,...current]);
 assert.equal(choices.find(row=>row.variant==='Inside')?.records.length,10);
 assert.equal(choices.find(row=>row.variant==='Outside')?.records.length,6);
 assert.ok(choices.some(row=>row.records.some(record=>record.id===old.id)&&!row.variant));
 assert.notDeepEqual({x:current[0].x,y:current[0].y},{x:old.x,y:old.y},'Named-area grouping must not rewrite the source landing');
});
