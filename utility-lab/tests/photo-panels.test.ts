import test from 'node:test';
import assert from 'node:assert/strict';
import {GUIDE_LIBRARY,PHOTO_GUIDE_LIBRARY} from '../src/guide-library.ts';
import {utilityPhotos,validateUtility} from '../src/utility-data.ts';
test('the published lineup list is photo-backed while legacy video links remain resolvable',()=>{
 assert.equal(PHOTO_GUIDE_LIBRARY.length,265);
 for(const guide of PHOTO_GUIDE_LIBRARY)assert.ok(utilityPhotos(guide).some(photo=>photo.kind!=='context'),guide.id);
 assert.ok(GUIDE_LIBRARY.some(guide=>guide.id==='creator-mirage-t-jungle'&&guide.videoUrl));
 assert.ok(!PHOTO_GUIDE_LIBRARY.some(guide=>guide.id==='creator-mirage-t-jungle'));
});
test('source panel bounds and attribution survive portable validation',()=>{
 const guide=PHOTO_GUIDE_LIBRARY.find(guide=>guide.id==='compendium-mirage-palace-jungle')!;
 assert.equal(utilityPhotos(guide)[0].kind,'position');
 assert.equal(utilityPhotos(guide)[1].kind,'aim');
 assert.equal(utilityPhotos(guide)[2].kind,'landing');
 assert.ok(!utilityPhotos(guide)[3].region,'The whole original must remain available.');
 const validated=validateUtility(JSON.parse(JSON.stringify({...guide,userCreated:true})));
 assert.ok(validated);assert.deepEqual(validated.photos,guide.photos);
 for(const region of [
  {...guide.photos![0].region!,x:-1},
  {...guide.photos![0].region!,width:Infinity},
  {...guide.photos![0].region!,x:1279,width:10},
  {...guide.photos![0].region!,sourceHeight:0},
  {...guide.photos![0].region!,sourceWidth:20001},
 ])assert.equal(validateUtility({...guide,photos:[{...guide.photos![0],region}]}),null);
});
