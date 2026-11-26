import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {MAPS} from '../src/maps';
import {PUBLISHED_LINEUPS} from './catalogue-fixtures';
import {utilityPhotos} from '../src/utility-data';
import {withAimPlacement} from '../src/aim-placement';
import {lineupWalkthrough} from '../src/lineup-walkthrough';
import {findLineupOrigin,parseOriginLookup} from '../src/lineup-origins';
import {expectReferenceCount,waitForUtilityChoice,chooseLandingSpot,openOriginPhoto} from './lineup-helpers';

test.use({serviceWorkers:'block'});
test('each supported map exposes photo-first map flows for both sides and every utility',async({page})=>{
 test.setTimeout(240000);
 const image=await readFile('public/icons/icon-192.png');
 await page.route(/^https:\/\//,route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/png',body:image}):route.abort());
 let checked=0;
 for(const map of MAPS){
  const level=map.levels[0];
  const origins=parseOriginLookup(JSON.parse(await readFile(`src/data/lineup-origins/origins-${map.id}.json`,'utf8')));
  await page.goto(`/#utilities?map=${map.id}&level=${level.id}&side=T`);
  await expect(page.getByRole('button',{name:'Change map',exact:true})).toHaveText(map.name);
  for(const side of ['T','CT'] as const){
   await page.getByRole('group',{name:'Utility side',exact:true}).getByRole('button',{name:`${side} side`,exact:true}).click();
   const filters=page.getByRole('group',{name:'Utility type',exact:true});
   await filters.getByRole('button',{name:/^All /}).click();
   for(const type of ['Smoke','Flash','Molotov','HE'] as const){
    await test.step(`${map.name} ${side} ${type}`,async()=>{
     const records=PUBLISHED_LINEUPS.filter(record=>record.mapId===map.id&&record.levelId===level.id&&record.side===side&&record.type===type);
     expect(records.length).toBeGreaterThan(0);
     await filters.getByRole('button',{name:new RegExp(`^${type==='Molotov'?'Molly':type} `)}).click();
     await expectReferenceCount(page,records.length);
     await page.locator('.ul-map-marker').first().click();await waitForUtilityChoice(page,{allowUtilitySkip:true});
     await expect(page.getByRole('dialog',{name:'Choose utility',exact:true})).toHaveCount(0);
     await chooseLandingSpot(page);await openOriginPhoto(page);
     const viewer=page.locator('.ul-media-dialog');await expect(viewer).toBeVisible();
     const id=await page.evaluate(()=>new URLSearchParams(location.hash.split('?')[1]).get('lineup'));
     const selected=records.find(record=>record.id===id);
     if(!selected)throw new Error(`Selected guide ${id} was absent from ${map.name} ${side} ${type}`);
     await expect(viewer.getByRole('button',{name:/^Photos/})).toHaveAttribute('aria-pressed','true');
     const [standing,setup]=lineupWalkthrough(selected,utilityPhotos(withAimPlacement(selected)));
     const start=standing.views[0],origin=findLineupOrigin(selected,origins);
     await expect(viewer.getByRole('button',{name:`Step 1: ${standing.name}`,exact:true})).toHaveAttribute('aria-pressed','true');
     if(start.standingMap&&origin?.precision==='world'&&origin.basis==='publisher-origin'){
      const inset=viewer.locator('.ul-standing-map');
      await expect(inset.getByRole('img',{name:/^Recorded standing position:/})).toBeVisible();
      await expect(inset).toHaveAttribute('data-lineup-id',selected.id);
      await expect(inset).toHaveAttribute('data-origin-level',origin.levelId);
      await expect(inset.locator('.ul-standing-map-pin')).toHaveAttribute('transform',`translate(${origin.x} ${origin.y})`);
      await viewer.getByRole('button',{name:`Step 2: ${setup.name}`,exact:true}).click();
      await expect(viewer.locator('.ul-photo-canvas img')).toHaveAttribute('src',setup.views[0].photo!.image);
     }else{
      await expect(viewer.locator('.ul-photo-canvas img')).toHaveAttribute('src',start.photo!.image);
     }
     await expect(viewer.locator('iframe,video')).toHaveCount(0);
     await expect(viewer.getByRole('button',{name:'Video',exact:true})).toBeEnabled();
     await viewer.getByRole('button',{name:'Close lineup media',exact:true}).click();
     await page.getByRole('button',{name:'Back to targets',exact:true}).click();
     await filters.getByRole('button',{name:/^All /}).click();checked++;
    });
   }
  }
 }
 expect(checked).toBe(64);await expect(page.getByRole('checkbox',{name:'Practice targets',exact:true})).toHaveCount(0);
});
