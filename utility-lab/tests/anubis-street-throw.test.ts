import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EXPANDED_INFERNO_ANUBIS_CACHE} from '../src/data/expanded-inferno-anubis-cache.ts';

const source = 'https://www.cs2tricks.com/nades/anubis/smokes/street-from-upper-cb18';

test('Anubis Upper to Street keeps the clarified brief W jump throw through catalogue generation', () => {
  const owningRows = EXPANDED_INFERNO_ANUBIS_CACHE.filter(row => row.source === source);
  const generated = JSON.parse(fs.readFileSync(new URL('../src/data/expanded/anubis.json',import.meta.url),'utf8'));
  assert.equal(owningRows.length,1);
  for(const row of owningRows){
    const built = generated.find((candidate: {id:string}) => candidate.id === row.id);
    assert.ok(built);
    for(const record of [row,built]){
      assert.equal(record.throwType,'Tap W + Jump + LMB');
      assert.equal(record.steps.at(-1),'Tap W once as you jump, then release LMB.');
      assert.equal(record.videoUrl,'https://www.youtube.com/watch?v=lVB0h1Fno5E');
      assert.equal(record.remotePhotos?.[0].kind,'position');
      assert.equal(record.remotePhotos?.[1].kind,'aim');
    }
  }
  // A correction to this source must not turn every run-up into a W tap.
  const actualRun = EXPANDED_INFERNO_ANUBIS_CACHE.find(row => row.source === 'https://www.cs2tricks.com/nades/anubis/smokes/bridge-window-from-ct-351d');
  assert.ok(actualRun);
  assert.match(actualRun.throwType,/Run/);
  assert.doesNotMatch(actualRun.throwType,/Tap W/);
});
