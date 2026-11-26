import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PHOTO_GUIDE_LIBRARY} from '../src/guide-library.ts';
import {mergePhotoGuides,normalizeExpandedGuides} from '../src/expanded-guide-model.ts';
import {curateLineups,normalizeOriginLabel,targetSpotKey} from '../src/lineup-curation.ts';
import type {UtilityReference} from '../src/utility-data.ts';
const json = (path:string) => JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const maps = ['mirage','dust2','inferno','nuke','ancient','anubis','cache','vertigo'];
const all = mergePhotoGuides(PHOTO_GUIDE_LIBRARY,maps.flatMap(map => normalizeExpandedGuides(json(`src/data/expanded/${map}.json`),map)));
const base = all.find(record => record.mapId === 'mirage' && record.target.toLowerCase() === 'jungle')!;
const make = (id:string,from:string,throwType='LMB'):UtilityReference => ({...base,id,from,throwType});

test('default curation caps every target, side and utility at four without changing the full library', () => {
  const original = all.map(row => row.id);
  const selected = curateLineups(all);
  const counts = new Map<string,number>();
  for (const row of selected) counts.set(targetSpotKey(row),(counts.get(targetSpotKey(row)) || 0)+1);
  assert.ok([...counts.values()].every(count => count <= 4));
  assert.ok(selected.length < all.length);
  assert.deepEqual(all.map(row => row.id),original);
  assert.equal(all.length,1639);
  assert.deepEqual(curateLineups([...all].reverse()).map(row => row.id),selected.map(row => row.id));
});

test('simpler throws and different standing locations outrank almost identical numbered spawn variants', () => {
  const records = [make('spawn-1','Top Mid Spawn #1'),make('spawn-2','Top Mid Spawn #2'),make('spawn-3','Top Mid Spawn #3'),make('spawn-4','Top Mid Spawn #4'),make('palace-hard','Palace','Running jump + LMB'),make('palace-simple','Palace'),make('ramp','Ramp'),make('connector','Connector')];
  const ids = new Set(curateLineups(records).map(row => row.id));
  assert.equal(ids.size,4);
  assert.equal([...ids].filter(id => id.startsWith('spawn-')).length,1);
  assert.ok(ids.has('palace-simple')); assert.ok(ids.has('ramp')); assert.ok(ids.has('connector'));
  assert.ok(!ids.has('palace-hard'));
  assert.equal(normalizeOriginLabel('T-Spawn #3'),'t spawn');
  assert.equal(normalizeOriginLabel('Tspawn1'),normalizeOriginLabel('T Spawn #4'));
  assert.equal(normalizeOriginLabel('Tspawn2'),normalizeOriginLabel('T Spawn'));
});

test('separate target sides, types, floors, explicit close/far spots and custom guides stay separate', () => {
  const common = make('base','Ramp');
  const smoke = common;
  const flash = {...common,id:'flash',type:'Flash' as const};
  const ct = {...common,id:'ct',side:'CT' as const};
  assert.notEqual(targetSpotKey(smoke),targetSpotKey(flash));
  assert.notEqual(targetSpotKey(smoke),targetSpotKey(ct));
  const close = {...common,id:'close',target:'Secret Close',mapId:'nuke',levelId:'upper',x:600,y:700};
  const far = {...close,id:'far',target:'Secret Far',x:610};
  assert.notEqual(targetSpotKey(close),targetSpotKey(far));
  assert.notEqual(targetSpotKey(close),targetSpotKey({...close,levelId:'lower'}));
  const custom = {...common,id:'custom',userCreated:true};
  const chosen = curateLineups([common,make('extra','CT'),custom],1);
  assert.ok(chosen.some(row => row.id === 'custom'));
  assert.equal(chosen.filter(row => !row.userCreated).length,1);
});
