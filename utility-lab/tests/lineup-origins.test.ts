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
  assert.equal(all.length,1557);
  assert.equal(new Set(all.map(row => row.source)).size,1477);
  let publisher = 0, area = 0;
  for (const record of all) {
    const point = findLineupOrigin(record,lookups[record.mapId]);
    assert.ok(point,record.id);
    assert.ok(isOriginPoint(point));
    assert.ok(point.label);
    if (point.basis === 'publisher-origin') publisher++; else area++;
  }
  assert.equal(publisher,1549); assert.equal(area,8);
});

test('standing pins use publisher origin coordinates and the origin floor registration, not target coordinates', () => {
  const evidence = json('docs/data/publisher-destination-evidence.json');
  let distinct = 0;
  for (const raw of evidence) {
    const point = lookups[raw.map][originSourceKey(raw.source)];
    if (!point) continue; // one research-only incomplete source is not primary browsing
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
  for (const file of ['csnades-publisher','csnades-cache','csnades-dust2','csnades-nuke-community']) {
    for (const raw of json(`docs/data/${file}-destination-evidence.json`)) {
      const record = all.find(row => row.source === raw.source);
      if (!record) continue;
      const point = findLineupOrigin(record,lookups[raw.mapId])!;
      for (const floor of [point,...(point.alternateLevels || [])]) {
        const reg = PUBLISHER_MAP_REGISTRATIONS.find(item => item.id === floor.registrationId)!;
        assert.deepEqual({x:floor.x,y:floor.y,levelId:floor.levelId,registrationId:floor.registrationId},projectPublisherOrigin(raw.throwFrom,reg),raw.source);
        assert.equal(reg.logicalWidth,1000); assert.equal(reg.logicalHeight,1000);
      }
      checked++;
    }
  }
  assert.equal(checked,209); // two earlier Dust II research-only sources are not primary records
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
