import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {originRecipeOptions,groupOriginOptions,type OriginOption} from "../src/origin-options.ts";
import {findLineupOrigin,parseOriginLookup,projectPublisherOrigin,type OriginPoint} from "../src/lineup-origins.ts";
import {PUBLISHER_MAP_REGISTRATIONS} from "../src/publisher-map-registrations.ts";
import {PRECISE_MIRAGE_ANCIENT} from "../src/data/precise-mirage-ancient.ts";
import {PRECISE_OTHER_MAPS} from "../src/data/precise-other-maps.ts";
import type {UtilityReference} from "../src/utility-data.ts";

const json=(path:string)=>JSON.parse(readFileSync(new URL(`../${path}`,import.meta.url),"utf8"));
const dust:UtilityReference[]=json("src/data/expanded/dust2.json");
const dustLookup=parseOriginLookup(json("src/data/lineup-origins/origins-dust2.json"));
const evidence=json("docs/data/precise-mirage-ancient-evidence.json").records;
const ids=(records:readonly UtilityReference[])=>records.map(record=>record.id).sort();
function actualOptions(records:UtilityReference[],mapId:string):OriginOption[]{
  const lookup=parseOriginLookup(json(`src/data/lineup-origins/origins-${mapId}.json`));
  return originRecipeOptions(records).map(record=>{
    let point=findLineupOrigin(record,lookup);
    if(!point){
      // The new explicit source may precede regenerated lookup JSON. Its raw
      // publisher evidence uses the same audited projection as that generator.
      const source=evidence.find((row:{source:string})=>row.source===record.source);
      const registration=PUBLISHER_MAP_REGISTRATIONS.find(row=>row.id===record.markerSource?.registrationId);
      const projected=source&&registration&&projectPublisherOrigin(source.publisherOrigin,registration);
      if(projected)point={...projected,label:record.from,basis:"publisher-origin",sourceId:source.publisherOrigin.id};
    }
    assert.ok(point,`Missing source-backed origin: ${record.id}`);
    return {record,point};
  });
}
function verifyGroups(options:OriginOption[],mapUnit:number){
  const groups=groupOriginOptions(options,mapUnit);
  assert.deepEqual(ids(groups.flatMap(group=>group.options.map(option=>option.record))),ids(options.map(option=>option.record)));
  for(const group of groups){
    assert.ok(group.options.some(option=>option.point.x===group.point.x&&option.point.y===group.point.y&&option.point.levelId===group.point.levelId),"A group anchor must be an actual source point, not an average or displaced point");
    for(const other of groups){
      if(group===other||group.point.levelId!==other.point.levelId)continue;
      assert.ok(Math.hypot(group.point.x-other.point.x,group.point.y-other.point.y)/mapUnit>=46-1e-8,"Independent map pin hit circles remain at least46px apart");
    }
  }
  return groups;
}

test("all sixteen original Dust II Mid Doors recipes and the new spawn approaches survive side-specific grouping",()=>{
  const records=dust.filter(record=>record.target==="Mid Doors"&&record.type==="Smoke");
  const additions=PRECISE_OTHER_MAPS.filter(record=>record.mapId==='dust2'&&record.target==='Mid Doors'&&record.type==='Smoke');
  assert.equal(additions.length,4);
  assert.equal(records.length,16+additions.length);
  assert.equal(records.filter(record=>record.side==="T").length,14+additions.length);
  assert.deepEqual(records.filter(record=>!record.id.startsWith('precise-')).map(record=>record.side).sort(),[...Array(2).fill('CT'),...Array(14).fill('T')]);
  const before=JSON.stringify(records);
  const result=(["T","CT"] as const).flatMap(side=>{
    const options=originRecipeOptions(records.filter(record=>record.side===side));
    const points=options.map(record=>({record,point:findLineupOrigin(record,dustLookup)!}));
    assert.ok(points.every(option=>option.point));
    return verifyGroups(points,2.5).flatMap(group=>group.options.map(option=>option.record));
  });
  assert.deepEqual(ids(result),ids(records));
  assert.equal(JSON.stringify(records),before,"Grouping must not mutate catalogue media or coordinates");
});

for(const mapId of ["mirage","ancient"]){
  test(`${mapId}'s five explicitly numbered instant spawn recipes remain available at Fit and zoom`,()=>{
    const records=PRECISE_MIRAGE_ANCIENT.filter(record=>record.mapId===mapId&&record.spawn);
    assert.equal(records.length,5);
    assert.deepEqual(records.map(record=>record.spawn!.slot).sort(),[1,2,3,4,5]);
    assert.ok(records.every(record=>record.spawn!.total===5));
    const options=actualOptions(records,mapId);
    const original=options.map(option=>({...option.point}));
    for(const unit of [.5,1.5,3.5])verifyGroups(options,unit);
    assert.deepEqual(options.map(option=>option.point),original,"Zoom changes grouping, not original standing coordinates");
  });
}

test("recipe ordering is deterministic, deduplicates only identical IDs and never applies the old four-recipe cap",()=>{
  const records=PRECISE_MIRAGE_ANCIENT.filter(record=>record.mapId==="mirage");
  const ordered=originRecipeOptions([...records,...records]);
  assert.equal(ordered.length,5);
  assert.deepEqual(ordered.map(record=>record.spawn?.slot),[1,2,3,4,5]);
  assert.deepEqual(ordered.map(record=>record.id),originRecipeOptions([...records].reverse()).map(record=>record.id));
});

test("collocated recipes remain individually accessible and source floors never collapse into one map pin",()=>{
  const base=PRECISE_MIRAGE_ANCIENT[0];
  const point:OriginPoint={x:100,y:200,levelId:"upper",registrationId:"test-upper",label:"Test standing point",basis:"publisher-origin"};
  // Isolated model fixtures exercise a large popup; no fictional standing
  // coordinates or guides are added to the published catalogue.
  const options=Array.from({length:25},(_,index)=>({record:{...base,id:`fixture-${index}`},point}));
  const groups=verifyGroups(options,2);
  assert.equal(groups.length,1);assert.equal(groups[0].options.length,25);
  const lower={...point,levelId:"lower",registrationId:"test-lower"};
  const separated=groupOriginOptions([...options,{record:{...base,id:"lower-fixture"},point:lower}],2);
  assert.equal(separated.length,2);
  assert.equal(separated[1].point.levelId,"lower");
});
