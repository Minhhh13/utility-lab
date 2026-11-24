import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {startPersonalLineup,makePersonalCopy,mainMarkers,mainMarkerGroupsForArea} from './lineup-helpers';
import {PUBLISHED_LINEUPS} from './catalogue-fixtures';
import {USER_UTILITIES_KEY,type UtilityReference} from '../src/utility-data';
import {findLineupOrigin,parseOriginLookup} from '../src/lineup-origins';

test.use({serviceWorkers:'block'});
const view=(page:Page)=>page.locator('.ul-media-dialog');
const area='dust2:main:named:personal practice';
const publicGuide=PUBLISHED_LINEUPS.find(row=>row.mapId==='dust2'&&row.side==='T'&&row.from==='Lower Tunnels'&&row.type==='Smoke')!;

async function isolate(page:Page){
 const image=await readFile('public/icons/icon-192.png');
 await page.route(/^https:\/\//,route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/png',body:image}):route.abort());
}
async function ready(page:Page){
 await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 await expect(mainMarkers(page).first()).toBeVisible();
}
async function saveNormally(page:Page,title:string,photo=false){
 await page.goto(`/#utilities?map=dust2&level=main&side=T&lineup=${publicGuide.id}`);
 await page.reload();
 await expect(view(page).getByRole('heading',{name:publicGuide.title,exact:true})).toBeVisible();
 await startPersonalLineup(page);
 await page.locator('[name="lineup-title"]').fill(title);
 await page.locator('[name="lineup-target"]').fill('Personal practice');
 await page.locator('[name="lineup-from"]').fill('My corner beside the wall');
 await page.locator('[name="lineup-type"]').selectOption('Smoke');
 await page.locator('[name="lineup-steps"]').fill('Use my corner.\nAim at my chosen mark.\nRelease left click.');
 await page.locator('[name="lineup-x"]').fill('500');
 await page.locator('[name="lineup-y"]').fill('850');
 if(photo){
  await page.getByLabel('Lineup screenshot file',{exact:true}).setInputFiles('public/icons/icon-192.png');
  await page.getByLabel('Photo 1 type',{exact:true}).selectOption('position');
 }
 await page.getByRole('button',{name:'Save lineup',exact:true}).click();
 await expect(view(page).getByRole('heading',{name:title,exact:true})).toBeVisible();
 const record=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'[]')[0],USER_UTILITIES_KEY) as UtilityReference;
 expect(record).toMatchObject({userCreated:true,x:500,y:850});
 expect(record.source).toBeUndefined();expect(record).not.toHaveProperty('origin');
 await view(page).getByRole('button',{name:`Save ${title}`,exact:true}).click();
 await view(page).getByRole('button',{name:'Close lineup media',exact:true}).click();
 return record;
}
async function openTarget(page:Page){
 await mainMarkerGroupsForArea(page,area).first().locator('.ul-marker-hit').click();
 const utility=page.getByRole('dialog',{name:'Choose utility',exact:true});
 await expect.poll(async()=>await utility.isVisible()||await view(page).isVisible()||
  await page.locator('.ul-landing-pin').count()>0||await page.locator('.ul-personal-guide-pin').count()>0).toBe(true);
 if(await utility.isVisible())await utility.getByRole('button',{name:'Smoke',exact:true}).click();
 const landing=page.locator(`.ul-landing-pin[data-target-area="${area}"]`);
 if(await landing.count())await landing.first().click();
}

test('a normally saved source-free personal guide opens and edits from its target and Saved without a standing lookup',async({page})=>{
 await isolate(page);
 const record=await saveNormally(page,'My source-free smoke');
 await page.route(/\/origins-dust2(?:-[A-Za-z0-9_-]+)?\.json(?:[?#]|$)/,route=>route.request().resourceType()==='fetch'?route.abort():route.continue());
 await page.goto('/#utilities?map=dust2&level=main&side=T');await page.reload();await ready(page);
 const camera=await page.locator('.ul-map-svg').getAttribute('viewBox');
 await openTarget(page);
 await expect(view(page).getByRole('heading',{name:record.title,exact:true})).toBeVisible();
 await expect(view(page).locator('.ul-text-guide')).toContainText('Use my corner.');
 await expect(page.locator('.ul-origin-pin')).toHaveCount(0);
 await expect(page.locator('.ul-map-svg')).toHaveAttribute('viewBox',camera!);
 await view(page).getByRole('button',{name:'Close lineup media',exact:true}).click();
 await page.getByRole('button',{name:/^Saved /}).click();
 await mainMarkers(page).first().locator('.ul-marker-hit').click();
 await expect(view(page).getByRole('heading',{name:record.title,exact:true})).toBeVisible();
 await view(page).getByRole('button',{name:'Lineup actions',exact:true}).click();
 await page.getByRole('menuitem',{name:'Edit personal lineup',exact:true}).click();
 await expect(page.locator('[name="lineup-title"]')).toHaveValue(record.title);
 await page.locator('[name="lineup-title"]').fill('My revised smoke');
 await page.getByRole('button',{name:'Update lineup',exact:true}).click();
 await expect(view(page).getByRole('heading',{name:'My revised smoke',exact:true})).toBeVisible();
});

test('two normally saved source-free guides share a personal target action and both remain selectable',async({page})=>{
 await isolate(page);
 const records=[await saveNormally(page,'My first guide',true),await saveNormally(page,'My second guide',true)];
 await page.goto('/#utilities?map=dust2&level=main&side=T');await page.reload();await ready(page);
 await page.getByRole('button',{name:/^Saved /}).click();
 await mainMarkers(page).first().locator('.ul-marker-hit').click();
 const action=page.locator('.ul-personal-guide-pin');await expect(action).toHaveCount(1);
 await expect(action).toHaveAttribute('data-personal-target-x','500');
 await expect(action).toHaveAttribute('data-personal-target-y','850');
 await expect(page.locator('.ul-origin-pin')).toHaveCount(0);
 await action.click();
 const choices=page.getByRole('dialog',{name:'Choose your lineup',exact:true});
 await expect(choices).toBeVisible();
 expect(await choices.locator('[data-lineup-id]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-lineup-id')).sort())).toEqual(records.map(row=>row.id).sort());
 for(const record of records){
  if(!await choices.isVisible())await action.click();
  await choices.locator(`[data-lineup-id="${record.id}"]`).click();
  await expect(view(page).getByRole('heading',{name:record.title,exact:true})).toBeVisible();
  await expect(view(page).locator('.ul-photo-kind')).toHaveText('Position');
  await view(page).getByRole('button',{name:'Close lineup media',exact:true}).click();
 }
});

test('a personal copy near a published standing point keeps both actions clickable without changing either source coordinate',async({page})=>{
 await isolate(page);
 const original=PUBLISHED_LINEUPS.find(record=>record.id==='expanded-cs2tricks-anubis-a-pillar-from-a-pillar-2876-ct')!;
 const lookup=parseOriginLookup(JSON.parse(await readFile('src/data/lineup-origins/origins-anubis.json','utf8')));
 const point=findLineupOrigin(original,lookup)!;
 await page.goto(`/#utilities?map=anubis&level=main&side=CT&lineup=${original.id}`);
 await expect(view(page).getByRole('heading',{name:original.title,exact:true})).toBeVisible();
 await view(page).getByRole('button',{name:`Save ${original.title}`,exact:true}).click();
 await makePersonalCopy(page);
 await page.locator('[name="lineup-title"]').fill('My A Pillar copy');
 await page.getByRole('button',{name:'Save lineup',exact:true}).click();
 await expect(view(page).getByRole('heading',{name:'My A Pillar copy',exact:true})).toBeVisible();
 const personal=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'[]')[0],USER_UTILITIES_KEY) as UtilityReference;
 expect(personal.source).toBe(original.source);
 expect({x:personal.x,y:personal.y}).toEqual({x:original.x,y:original.y});
 await view(page).getByRole('button',{name:'Save My A Pillar copy',exact:true}).click();
 await view(page).getByRole('button',{name:'Close lineup media',exact:true}).click();
 await page.getByRole('button',{name:/^Saved /}).click();
 await mainMarkers(page).first().locator('.ul-marker-hit').click();
 const standing=page.locator('.ul-origin-pin'),action=page.locator('.ul-personal-guide-pin');
 await expect(standing).toHaveCount(1);await expect(action).toHaveCount(1);
 await expect(standing).toHaveAttribute('data-origin-x',String(point.x));
 await expect(standing).toHaveAttribute('data-origin-y',String(point.y));
 await expect(action).toHaveAttribute('data-personal-target-x',String(personal.x));
 await expect(action).toHaveAttribute('data-personal-target-y',String(personal.y));
 const circles=await Promise.all([standing.locator('circle').first().boundingBox(),action.locator('circle').first().boundingBox()]);
 const [a,b]=circles;expect(a&&b).toBeTruthy();
 expect(Math.hypot(a!.x+a!.width/2-b!.x-b!.width/2,a!.y+a!.height/2-b!.y-b!.height/2)).toBeGreaterThanOrEqual(45.5);
 for(const [pin,record]of [[action,personal],[standing,original]] as const){
  await pin.click();
  await expect(view(page).getByRole('heading',{name:record.title,exact:true})).toBeVisible();
  await view(page).getByRole('button',{name:'Close lineup media',exact:true}).click();
 }
 await expect(standing).toHaveAttribute('data-origin-x',String(point.x));
 await expect(standing).toHaveAttribute('data-origin-y',String(point.y));
});
