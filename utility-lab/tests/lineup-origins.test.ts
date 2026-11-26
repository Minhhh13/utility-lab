import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PHOTO_GUIDE_LIBRARY} from '../src/guide-library.ts';
import {mergePhotoGuides, normalizeExpandedGuides} from '../src/expanded-guide-model.ts';
import {PUBLISHER_MAP_REGISTRATIONS} from '../src/publisher-map-registrations.ts';
import {UTILITY_MAP_REGISTRATIONS} from '../src/data/map-utility-anchor-evidence.ts';
import {attachLineupOrigins, findLineupOrigin, isOriginPoint, originSourceKey, parseOriginLookup, projectPublisherOrigin} from '../src/lineup-origins.ts';
const json = (path: string) => JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const maps = ['mirage','dust2','inferno','nuke','ancient','anubis','cache','vertigo'];
const all = mergePhotoGuides(PHOTO_GUIDE_LIBRARY,maps.flatMap(map => normalizeExpandedGuides(json(`src/data/expanded/${map}.json`),map)));
const lookups = Object.fromEntries(maps.map(map => [map,parseOriginLookup(json(`src/data/lineup-origins/origins-${map}.json`))]));

test('every complete guide has an independently recorded standing location', () => {
  assert.equal(all.length,1639);
  assert.equal(new Set(all.map(row => row.source)).size,1559);
  let publisher = 0, area = 0;
  for (const record of all) {
    const point = findLineupOrigin(record,lookups[record.mapId]);
    assert.ok(point,record.id);
    assert.ok(isOriginPoint(point));
    assert.ok(point.label);
    if (point.basis === 'publisher-origin') publisher++; else area++;
  }
  assert.equal(publisher,1631); assert.equal(area,8);
});

test('standing pins use publisher origin coordinates and the origin floor registration, not target coordinates', () => {
  const evidence = json('docs/data/publisher-destination-evidence.json');
  const world = json('docs/data/reviewed-world-origins.json');
  let distinct = 0;
  for (const raw of evidence) {
    const point = lookups[raw.map][originSourceKey(raw.source)];
    if (!point) continue; // one research-only incomplete source is not primary browsing
    const reviewed = world.records.find((record: {source:string}) => record.source === raw.source);
    if (reviewed) {
      const radar = world.radars[raw.map];
      const units = radar.scale * radar.radarSize;
      assert.equal(point.precision,'world');
      assert.equal(point.registrationId,`world-${raw.map}-${radar.levelId}`);
      assert.equal(point.sourceId,raw.origin.id);
      assert.ok(Math.abs(point.x-(reviewed.world.x-radar.posX)*1000/units)<=.00501,raw.source);
      assert.ok(Math.abs(point.y-(radar.posY-reviewed.world.y)*1000/units)<=.00501,raw.source);
      continue;
    }
    const reg = PUBLISHER_MAP_REGISTRATIONS.find(item => item.id === point.registrationId)!;
    assert.ok(reg,raw.source);
    assert.deepEqual({x:point.x,y:point.y,levelId:point.levelId,registrationId:point.registrationId},projectPublisherOrigin(raw.origin,reg));
    assert.equal(point.sourceId,raw.origin.id);
    if (raw.origin.x !== raw.destination.x || raw.origin.y !== raw.destination.y) {
      distinct++;
      const target = projectPublisherOrigin(raw.destination,reg)!;
      assert.notDeepEqual([point.x,point.y],[target.x,target.y],raw.source);
    }
  }
  assert.ok(distinct > 1100);
  const mirage = evidence.find((row: {map:string}) => row.map === 'mirage');
  const point = lookups.mirage[mirage.source];
  assert.notDeepEqual([point.x,point.y],[mirage.origin.x,mirage.origin.y],'raw radar pixels cannot be used as app points');
});

test('Ancient Top Mid keeps the creator’s numbers on the five matched physical starts and the pillar as its own setup', () => {
  const guides=all.filter(row=>row.spawn?.family==='ancient-t-top-mid-flockwglock').sort((a,b)=>a.spawn!.slot-b.spawn!.slot);
  assert.equal(guides.length,5);
  // Values use the independently published Ancient radar grid (-2953,2164; 5120 world units).
  const expected=[[512.70,869.53],[487.70,869.53],[462.70,869.53],[500.20,857.03],[475.20,857.03]];
  const evidence=json('docs/data/reviewed-world-origins.json').records;
  for (const [index,row] of guides.entries()) {
    const point=findLineupOrigin(row,lookups.ancient)!;
    assert.equal(row.spawn!.slot,index+1);
    assert.deepEqual([point.x,point.y],expected[index]);
    assert.equal(point.precision,'world');
    assert.ok(row.photos?.every(photo=>photo.source===row.source),'Own starting frame, aim and landing');
    const proof=evidence.find((r:{source:string})=>r.source===row.source);
    assert.equal(proof.referenceSlot,[5,3,1,4,2][index]);
    assert.ok(proof.viewMatch.rotationInliers>=150 && proof.viewMatch.medianBearingErrorDegrees<.08);
  }
  const pillar=all.find(row=>row.id.endsWith('ancient-top-mid-from-t-spawn-5bc0-t'))!;
  assert.equal(pillar.from,'T Spawn pillar');
  assert.equal(pillar.spawn,undefined);
  assert.equal(findLineupOrigin(pillar,lookups.ancient)?.precision,undefined);
});

test('Dust II Mid Doors keeps the creator’s four spawn recipes distinct from the replay numbering and uses each recorded input', () => {
  const guides = all.filter(row => row.spawn?.family === 'dust2-t-mid-doors-stellaraqwq')
    .sort((left,right) => left.spawn!.slot - right.spawn!.slot);
  const expected = [
    {slot:2, replay:12, x:440.12, y:898.22, keys:'Tap W + Jump + LMB'},
    {slot:3, replay:13, x:454.55, y:905.98, keys:'Crouch + Jump + left click'},
    {slot:4, replay:14, x:468.08, y:898.22, keys:'Stand still + Jump + left click'},
    {slot:5, replay:15, x:475.85, y:886.23, keys:'Tap W + Jump + LMB'},
  ];
  assert.deepEqual(guides.map(guide=>guide.spawn!.slot),expected.map(entry=>entry.slot));
  const evidence = json('docs/data/reviewed-world-origins.json').records;
  for (const [index, guide] of guides.entries()) {
    const match = expected[index], point = findLineupOrigin(guide,lookups.dust2)!;
    assert.deepEqual([point.precision,point.x,point.y],['world',match.x,match.y]);
    assert.equal(guide.throwType,match.keys);
    assert.ok(guide.steps[0].includes('T'+match.replay+' on setpos.gg'));
    const source = evidence.find((record:{source:string}) => record.source === guide.source);
    assert.equal(source.creatorSlot,match.slot);
    assert.equal(source.referenceSlot,match.replay);
    assert.ok(source.viewMatch.rotationInliers >= 150);
    assert.ok(source.viewMatch.rotationInliers > 5 * source.viewMatch.highestOtherSpawnInliers);
  }
});

test('Anubis Window and Camera use original standing poses on v22, and the running Camera checkpoint stays an area', () => {
  const urlsAndPoints = [
    ['https://csnades.gg/anubis/molotovs/window-from-alley',722.12,719.82],
    ['https://csnades.gg/anubis/molotovs/window-from-ruins',307.57,836.62],
    ['https://www.cs2tricks.com/nades/anubis/smokes/a-connector-from-upper-7667',762.53,515.60],
  ] as const;
  for (const [url,x,y] of urlsAndPoints) {
    const point = lookups.anubis[originSourceKey(url)];
    assert.deepEqual([point.x,point.y,point.precision,point.registrationId],[x,y,'world','world-anubis-main']);
  }
  const radar = json('docs/data/reviewed-world-origins.json').radars.anubis;
  assert.equal(radar.artwork,'/maps/anubis-v22.svg');
  assert.equal(radar.artworkSha256,radar.sourceRadarSha256);
  const running = all.find(row=>row.id==='precise-noctrl-anubis-camera-running-upper-t')!;
  assert.equal(findLineupOrigin(running,lookups.anubis)?.basis,'callout-area');
  assert.equal(findLineupOrigin(running,lookups.anubis)?.precision,undefined);
});

test('all numbered Cache starts follow the published spawn table and the Garage guide’s own numbering', () => {
  // World XY from the independent setpos.gg/cache/spawns table, in its slot order.
  const spawns = {
    T: [[2995.89,-168],[3094.27,-152.58],[3171.64,-100.83],[2949.02,-47],[3041.77,-21.08],
      [3162.14,-5],[2916.77,69.42],[3037.89,66.67],[3077.77,135.92],[2922.52,165.67]],
    CT: [[-1400.28,706.82],[-1488.28,706.82],[-1524.28,794.82],[-1400.28,874.82],[-1488.28,874.82]],
  };
  const garageSlots = [2,1,5,4];
  const guides = all.filter(guide => guide.mapId === 'cache' && guide.spawn);
  const garage = guides.filter(guide => guide.spawn!.family === 'csnades-cache-ct-garage');
  assert.deepEqual(garage.map(guide => guide.spawn!.slot).sort(), [1,2,3,4]);
  assert.deepEqual([...new Set(guides.filter(guide => guide.side === 'T').map(guide => guide.spawn!.slot))].sort((a,b)=>a-b), [1,2,3,4,5,6,7,8,9,10]);
  for (const guide of guides) {
    const {family,slot} = guide.spawn!;
    const isGarage = family === 'csnades-cache-ct-garage';
    const [x,y] = spawns[guide.side === 'CT' ? 'CT' : 'T'][(isGarage ? garageSlots[slot-1] : slot)-1];
    const point = findLineupOrigin(guide,lookups.cache)!;
    assert.equal(point.levelId,'main',guide.id);
    if (isGarage) assert.equal(point.registrationId,'world-cache-main',guide.id);
    assert.equal(point.precision,'world',guide.id);
    assert.ok(Math.abs(point.x - (x+2000)*1000/5632)<.007,guide.id);
    assert.ok(Math.abs(point.y - (3250-y)*1000/5632)<.007,guide.id);
    if (isGarage) {
      assert.equal(guide.target,'Garage');
      assert.ok(guide.source?.endsWith('/garage-from-ct-spawn-'+slot));
    }
  }
});

test('cross-floor origins remain on their own floor and only explicit source levels offer an alternate view', () => {
  const spawn = all.find(row => row.source === 'https://www.cs2tricks.com/nades/vertigo/smokes/a-site-left-from-t-spawn-b650')!;
  assert.equal(spawn.levelId,'upper');
  assert.equal(findLineupOrigin(spawn,lookups.vertigo,'upper')?.levelId,'lower');
  const ramp = all.find(row => row.id === 'cs2tricks-nuke-new-end-he-from-ramp')!;
  assert.equal(ramp.levelId,'lower');
  assert.equal(findLineupOrigin(ramp,lookups.nuke,'lower')?.levelId,'upper');
  const lower = all.find(row => row.source === 'https://csnades.gg/vertigo/smokes/b-cross-from-t-spawn')!;
  assert.equal(findLineupOrigin(lower,lookups.vertigo,'upper')?.levelId,'lower');
  const dual = all.find(row => row.source === 'https://csnades.gg/vertigo/smokes/ebox-from-b-stairs')!;
  const first = findLineupOrigin(dual,lookups.vertigo)!;
  const second = findLineupOrigin(dual,lookups.vertigo,'lower')!;
  assert.equal(first.levelId,'upper'); assert.equal(second.levelId,'lower');
  assert.notEqual(first.registrationId,second.registrationId);
  assert.ok(second.alternateLevels?.some(point => point.levelId === 'upper'));
});

test('every CSNADES standing point reprojects throwFrom on each source-supported floor, without bitmap-aspect assumptions', () => {
  let checked = 0;
  const exact = json('docs/data/essential-csnades-four-maps-evidence.json');
  const world = json('docs/data/reviewed-world-origins.json');
  const reviewedBySource = new Map<string, {world:{x:number;y:number}}>(
    [...exact.records, ...world.records].map(record => [record.source, record]),
  );
  const radars = {...exact.radars, ...world.radars};
  for (const file of ['csnades-publisher','csnades-cache','csnades-dust2','csnades-nuke-community']) {
    for (const raw of json(`docs/data/${file}-destination-evidence.json`)) {
      const record = all.find(row => row.source === raw.source);
      if (!record) continue;
      const point = findLineupOrigin(record,lookups[raw.mapId])!;
      if (point.precision === 'world') {
        const reviewed = reviewedBySource.get(raw.source);
        assert.ok(reviewed,raw.source);
        const radar = radars[raw.mapId], span = radar.radarSize * radar.scale;
        assert.equal(point.x, Math.round((reviewed.world.x-radar.posX)/span*100000)/100);
        assert.equal(point.y, Math.round((radar.posY-reviewed.world.y)/span*100000)/100);
        assert.equal(point.levelId,radar.levelId);
        checked++;
        continue;
      }
      for (const floor of [point,...(point.alternateLevels || [])]) {
        const reg = PUBLISHER_MAP_REGISTRATIONS.find(item => item.id === floor.registrationId)!;
        assert.deepEqual({x:floor.x,y:floor.y,levelId:floor.levelId,registrationId:floor.registrationId},projectPublisherOrigin(raw.throwFrom,reg),raw.source);
        assert.equal(reg.logicalWidth,1000); assert.equal(reg.logicalHeight,1000);
      }
      checked++;
    }
  }
  assert.equal(checked,211);
});

test('all multi-floor public source origins have independent source-floor evidence; null levels never borrow the target floor', () => {
  const floorReviews = json('docs/data/lineup-origin-floor-evidence.json');
  const proof = json('docs/data/lineup-origin-projection-proof.json');
  for (const row of proof.filter((row: {mapId:string}) => ['nuke','vertigo'].includes(row.mapId))) {
    if (row.floorBasis === 'publisher-throwFrom-levels') {
      assert.ok(row.rawSourceLevels.some((level: unknown) => level === 1 || level === 2));
      assert.deepEqual(row.originLevels,row.rawSourceLevels.filter((level: unknown) => level === 1 || level === 2).map((level:number) => level === 1 ? 'upper' : 'lower'));
    } else if (row.floorBasis === 'reviewed-source-position') {
      const review = floorReviews.find((item: {source:string}) => item.source === row.source);
      assert.ok(review?.positionPhoto || review?.originalPositionPhoto,row.source);
      assert.equal(review.sourceId,row.sourceId);
      assert.deepEqual(review.levelIds,row.originLevels);
    } else if (row.floorBasis === 'recorded-world-position') {
      assert.equal(row.mapId,'vertigo');
      assert.ok(Number.isFinite(row.worldOrigin.z));
      assert.deepEqual(row.originLevels,['upper']);
      const source = all.find(guide => guide.source === row.source);
      assert.equal(source?.levelId,'lower');
    } else assert.equal(row.basis,'callout-area');
  }
});

test('seven named-area fallbacks preserve source polygons, registrations and explicitly qualified accuracy', () => {
  const areas = json('docs/data/lineup-origin-area-evidence.json');
  assert.equal(areas.length,7);
  for (const area of areas) {
    const record = all.find(row => row.id === area.guideId)!;
    const point = findLineupOrigin(record,lookups[area.mapId])!;
    assert.equal(point.basis,'callout-area');
    assert.equal(point.label,record.from);
    const reg = UTILITY_MAP_REGISTRATIONS.find(item => item.id === area.registrationId)!;
    assert.equal(reg.levelId,area.levelId);
    const t = reg.transform!;
    assert.ok(Math.abs(point.x-(area.referencePoint[0]*t.scaleX+t.translateX)) < 0.011);
    assert.ok(Math.abs(point.y-(area.referencePoint[1]*t.scaleY+t.translateY)) < 0.011);
    assert.match(area.review,/not claimed exact feet/);
    assert.ok(area.positionPhoto && area.referenceSource && area.referencePolygon.length > 2);
  }
});

test('origin lookup preserves query-identified videos and guide links and attaches without mutating catalogue', () => {
  assert.notEqual(originSourceKey('https://www.youtube.com/watch?v=abc'),originSourceKey('https://www.youtube.com/watch?v=def'));
  assert.notEqual(originSourceKey('https://app.nadesdb.com/maps/cache?nade=abc'),originSourceKey('https://app.nadesdb.com/maps/cache?nade=def'));
  const sample = all[0]; const result = attachLineupOrigins([sample],lookups[sample.mapId]);
  assert.notEqual(result[0],sample); assert.ok(result[0].origin);
  assert.equal(sample.origin,undefined);
  assert.throws(() => parseOriginLookup({bad:{x:NaN,y:0}}));
  const reg = PUBLISHER_MAP_REGISTRATIONS[0];
  assert.equal(projectPublisherOrigin({x:1001,y:50},reg),undefined);
});
