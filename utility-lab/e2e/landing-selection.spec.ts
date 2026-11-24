import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {PUBLISHED_LINEUPS} from './catalogue-fixtures';
import {utilityMarkerArea} from '../src/utility-markers';
import {FAVORITE_UTILITIES_KEY,utilityPhotos} from '../src/utility-data';
import {landingChoices,landingChoicesForArea,openUtilityGroupForArea,mainMarkerGroupsForArea,waitForUtilityChoice,expectReferenceCount,openOriginPhoto,expectOriginRecipes} from './lineup-helpers';

test.use({serviceWorkers:'block'});
const radial=(page:Page)=>page.getByRole('dialog',{name:'Choose utility',exact:true});
const sourcePins=(page:Page)=>page.getByRole('group',{name:'Throw-from locations',exact:true}).getByRole('button');

async function isolateMedia(page:Page){
 const image=await readFile('public/icons/icon-192.png');
 await page.route(/^https:\/\//,route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/png',body:image}):route.abort());
}
async function openMidLandings(page:Page,keyboard=false){
 await page.goto('/#utilities?map=cache&level=main&side=T');
 await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 await openUtilityGroupForArea(page,'cache:main:mid',{keyboard});
 const smoke=radial(page).getByRole('button',{name:'Smoke',exact:true});
 if(keyboard){await smoke.focus();await smoke.press('Enter');}else await smoke.click();
 await expect(radial(page)).toHaveCount(0);
 await expect(landingChoices(page).first()).toBeVisible();
 expect(await landingChoices(page).count()).toBeGreaterThan(1);
 await expect(sourcePins(page)).toHaveCount(0);
 await expect(page.locator('.ul-media-dialog')).not.toBeVisible();
}

test('Cache Mid smoke shows every exact landing before sources and opens only the chosen Left or Right Mid',async({page},info)=>{
 await isolateMedia(page);await openMidLandings(page);
 const expected=PUBLISHED_LINEUPS.filter(record=>record.mapId==='cache'&&record.levelId==='main'&&record.side==='T'&&record.type==='Smoke'&&utilityMarkerArea(record).id==='cache:main:mid');
 const actual=await landingChoicesForArea(page,'cache:main:mid').evaluateAll(nodes=>nodes.map(node=>({x:Number(node.getAttribute('data-landing-x')),y:Number(node.getAttribute('data-landing-y')),levelId:node.getAttribute('data-landing-level')})));
 const keys=(points:{x:number;y:number;levelId:string|null}[])=>[...new Set(points.map(point=>`${point.levelId}:${point.x}:${point.y}`))].sort();
 expect(keys(actual)).toEqual(keys(expected));
 for(const point of actual)expect(expected.some(record=>record.x===point.x&&record.y===point.y&&record.levelId===point.levelId)).toBe(true);
 await page.screenshot({path:info.outputPath('cache-mid-smoke-landings.png')});
 const chosen=landingChoicesForArea(page,'cache:main:mid').last();
 const point={x:Number(await chosen.getAttribute('data-landing-x')),y:Number(await chosen.getAttribute('data-landing-y')),levelId:await chosen.getAttribute('data-landing-level')};
 await chosen.click();
 await expect(landingChoices(page)).toHaveCount(0);
 await expect(sourcePins(page).first()).toBeVisible();await expectOriginRecipes(page,expected.filter(record=>record.x===point.x&&record.y===point.y&&record.levelId===point.levelId).map(record=>record.id));
 await expect(page.locator('.ul-media-dialog')).not.toBeVisible();
 await openOriginPhoto(page);
 const viewer=page.locator('.ul-media-dialog');await expect(viewer).toBeVisible();
 const id=await page.evaluate(()=>new URLSearchParams(location.hash.split('?')[1]).get('lineup'));
 const record=PUBLISHED_LINEUPS.find(record=>record.id===id)!;
 expect(record).toMatchObject({...point,type:'Smoke',mapId:'cache',side:'T'});
 expect(utilityMarkerArea(record).id).toBe('cache:main:mid');
 await expect(viewer.getByRole('button',{name:/^Photos/})).toHaveAttribute('aria-pressed','true');
 await expect(viewer.locator('.ul-photo-canvas img')).toHaveAttribute('src',utilityPhotos(record)[0].image);
 await expect(viewer.getByRole('button',{name:'Video',exact:true})).toBeEnabled();
 await viewer.getByRole('button',{name:'Close lineup media',exact:true}).click();
 await page.getByRole('button',{name:'Back to targets',exact:true}).click();
 await expect(landingChoices(page)).toHaveCount(0);await expect(sourcePins(page)).toHaveCount(0);
 await expect(mainMarkerGroupsForArea(page,'cache:main:mid').first()).toBeVisible();
});

test('keyboard group, utility, landing and source selection keeps focus and skips entry animation',async({page})=>{
 await isolateMedia(page);await openMidLandings(page,true);
 const landing=landingChoices(page).first();await expect(landing).toBeFocused();
 expect(await landing.evaluate(element=>element.getAnimations({subtree:true}).filter(animation=>animation.playState==='running').length)).toBe(0);
 await landing.press('Enter');
 const source=sourcePins(page).first();await expect(source).toBeVisible();await expect(source).toBeFocused();
 await expect(page.locator('.ul-origin-glyph.can-animate')).toHaveCount(0);
 await openOriginPhoto(page,{keyboard:true});await expect(page.locator('.ul-media-dialog')).toBeVisible();
});

test('a singleton saved guide opens standing positions directly and still waits before photos',async({page})=>{
 const record=PUBLISHED_LINEUPS.find(record=>record.id==='expanded-cs2tricks-cache-a-main-from-quad-b906-ct')!;
 expect(record).toBeTruthy();await isolateMedia(page);
 await page.addInitScript(({key,id})=>localStorage.setItem(key,JSON.stringify([id])),{key:FAVORITE_UTILITIES_KEY,id:record.id});
 await page.goto('/#utilities?map=cache&level=main&side=CT');
 await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 await page.getByRole('button',{name:/^Saved /}).click();
 await expectReferenceCount(page,1);
 await page.locator('.ul-map-marker').first().locator('.ul-marker-hit').click();
 await waitForUtilityChoice(page);
 await expect(radial(page)).toHaveCount(0);await expect(landingChoices(page)).toHaveCount(0);
 await expect(page.getByRole('group',{name:'Throw-from locations',exact:true})).toHaveAttribute('data-target-x',String(record.x));
 await expect(page.getByRole('group',{name:'Throw-from locations',exact:true})).toHaveAttribute('data-target-y',String(record.y));
 await expect(sourcePins(page).first()).toBeVisible();
 await expect(landingChoices(page)).toHaveCount(0);await expect(sourcePins(page)).toHaveCount(1);await expectOriginRecipes(page,[record.id]);
 await expect(page.locator('.ul-media-dialog')).not.toBeVisible();
 await openOriginPhoto(page,{recordId:record.id});await expect(page.locator('.ul-media-dialog')).toBeVisible();
 await expect(page.locator('.ul-media-dialog .ul-photo-canvas img')).toHaveAttribute('src',utilityPhotos(record)[0].image);
});

test('320px phone can select a landing spot before a source without overflow',async({page},info)=>{
 await page.setViewportSize({width:320,height:844});await isolateMedia(page);await openMidLandings(page);
 for(const choice of await landingChoices(page).all())await expect(choice).toBeInViewport();
 await landingChoices(page).last().click();
 await expect(sourcePins(page).first()).toBeVisible();await openOriginPhoto(page);
 await expect(page.locator('.ul-media-dialog')).toBeVisible();
 await expect(page.getByRole('button',{name:'Close lineup media',exact:true})).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
 await page.screenshot({path:info.outputPath('landing-phone-viewer-320.png')});
});
