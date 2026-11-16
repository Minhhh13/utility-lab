import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {PUBLISHED_LINEUPS} from './catalogue-fixtures';
import {FAVORITE_UTILITIES_KEY,utilityPhotos} from '../src/utility-data';
import {utilityMarkerArea} from '../src/utility-markers';
import {mainMarkers,mainMarkerGroupsForArea,landingChoices,expectReferenceCount,waitForUtilityChoice} from './lineup-helpers';

test.use({serviceWorkers:'block'});
const sources=(page:Page)=>page.locator('.ul-origin-pin');
const picker=(page:Page)=>page.getByRole('dialog',{name:'Choose utility',exact:true});
const viewer=(page:Page)=>page.locator('.ul-media-dialog');
async function isolate(page:Page){
 const bytes=await readFile('public/icons/icon-192.png');
 await page.route(/^https:\/\//,route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/png',body:bytes}):route.abort());
}
async function context(page:Page,map:string,side='T'){
 await page.goto(`/#utilities?map=${map}&level=main&side=${side}`);await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');await expect(mainMarkers(page).first()).toBeVisible();
}
async function saveOnly(page:Page,rows:typeof PUBLISHED_LINEUPS){
 await page.addInitScript(({key,ids})=>localStorage.setItem(key,JSON.stringify(ids)),{key:FAVORITE_UTILITIES_KEY,ids:rows.map(row=>row.id)});
 await context(page,rows[0].mapId,rows[0].side);await page.getByRole('button',{name:/^Saved /}).click();await expectReferenceCount(page,rows.length);
}
async function verifyOpenedSource(page:Page,expected?:typeof PUBLISHED_LINEUPS[number]){
 await expect(viewer(page)).not.toBeVisible();await expect(sources(page).first()).toBeVisible();
 await sources(page).first().click();await expect(viewer(page)).toBeVisible();
 const id=await page.evaluate(()=>new URLSearchParams(location.hash.split('?')[1]).get('lineup'));
 const row=PUBLISHED_LINEUPS.find(row=>row.id===id)!;expect(row).toBeTruthy();if(expected)expect(row.id).toBe(expected.id);
 await expect(viewer(page).getByRole('button',{name:/^Photos/})).toHaveAttribute('aria-pressed','true');
 await expect(viewer(page).locator('.ul-photo-canvas img')).toHaveAttribute('src',utilityPhotos(row)[0].image);
 return row;
}

test('a natural singleton kind and landing goes straight to real standing pins, never directly to photos',async({page})=>{
 await isolate(page);await context(page,'mirage');
 const index=await mainMarkers(page).evaluateAll(nodes=>nodes.findIndex(node=>node.querySelectorAll('.ul-target-marker [data-utility]').length===1&&node.getAttribute('data-target-destinations')==='1'));
 expect(index,'Mirage has an actual singleton target in the full catalogue').toBeGreaterThanOrEqual(0);
 const marker=mainMarkers(page).nth(index),point={x:await marker.getAttribute('data-target-x'),y:await marker.getAttribute('data-target-y')};
 const camera=await page.locator('.ul-map-svg').getAttribute('viewBox');await marker.locator('.ul-marker-hit').click();await expect(sources(page).first()).toBeVisible();
 await expect(picker(page)).toHaveCount(0);await expect(landingChoices(page)).toHaveCount(0);await expect(viewer(page)).not.toBeVisible();
 const selected=page.getByRole('group',{name:'Throw-from locations',exact:true});
 await expect(selected).toHaveAttribute('data-target-x',point.x!);await expect(selected).toHaveAttribute('data-target-y',point.y!);
 await expect(page.locator('.ul-map-svg')).toHaveAttribute('viewBox',camera!);
 const row=await verifyOpenedSource(page);expect(row).toMatchObject({x:Number(point.x),y:Number(point.y)});
});

test('a single kind with two destinations skips the radial and retains both exact landing choices',async({page})=>{
 await isolate(page);
 const choices=PUBLISHED_LINEUPS.filter(row=>row.mapId==='cache'&&row.side==='T'&&row.type==='Smoke'&&utilityMarkerArea(row).id==='cache:main:mid');
 const distinct=[...new Map(choices.map(row=>[`${row.x}:${row.y}`,row])).values()].slice(0,2);expect(distinct).toHaveLength(2);
 await saveOnly(page,distinct);const marker=mainMarkerGroupsForArea(page,'cache:main:mid').first();
 expect(await marker.locator('.ul-target-marker [data-utility]').count()).toBe(1);
 await marker.locator('.ul-marker-hit').click();await expect(landingChoices(page)).toHaveCount(2);await expect(picker(page)).toHaveCount(0);await expect(sources(page)).toHaveCount(0);
 const actual=await landingChoices(page).evaluateAll(nodes=>nodes.map(node=>`${node.getAttribute('data-landing-x')}:${node.getAttribute('data-landing-y')}`).sort());expect(actual).toEqual(distinct.map(row=>`${row.x}:${row.y}`).sort());
 const last=landingChoices(page).last(),x=Number(await last.getAttribute('data-landing-x')),y=Number(await last.getAttribute('data-landing-y'));
 await last.click();await expect(sources(page)).toHaveCount(1);await expect(viewer(page)).not.toBeVisible();await expect(landingChoices(page)).toHaveCount(0);
 await verifyOpenedSource(page,distinct.find(row=>row.x===x&&row.y===y));
});

test('mixed kinds still use the radial but a singleton destination then opens standing pins directly',async({page})=>{
 await isolate(page);
 const areaRows=PUBLISHED_LINEUPS.filter(row=>row.mapId==='mirage'&&row.side==='T'&&utilityMarkerArea(row).id==='mirage:main:jungle');
 const smoke=areaRows.find(row=>row.type==='Smoke')!,flash=areaRows.find(row=>row.type==='Flash')!;expect(smoke).toBeTruthy();expect(flash).toBeTruthy();
 await saveOnly(page,[smoke,flash]);await mainMarkers(page).first().locator('.ul-marker-hit').click();await expect(picker(page)).toBeVisible();
 await expect(picker(page).getByRole('group',{name:'Utility types at this target',exact:true}).getByRole('button')).toHaveCount(2);
 await picker(page).getByRole('button',{name:'Smoke',exact:true}).click();await expect(sources(page)).toHaveCount(1);await expect(landingChoices(page)).toHaveCount(0);await expect(picker(page)).toHaveCount(0);await expect(viewer(page)).not.toBeVisible();
 await verifyOpenedSource(page,smoke);
});

test('opening a mixed radial hides every background marker and Escape restores the same keyboard target',async({page})=>{
 await isolate(page);await context(page,'dust2');const markers=mainMarkers(page),count=await markers.count();expect(count).toBeGreaterThan(1);
 const index=await markers.evaluateAll(nodes=>nodes.findIndex(node=>node.querySelectorAll('.ul-target-marker [data-utility]').length>1));expect(index).toBeGreaterThanOrEqual(0);const selected=markers.nth(index);
 await selected.focus();await selected.press('Enter');await waitForUtilityChoice(page);await expect(picker(page)).toBeVisible();
 await expect(page.locator('.ul-map-marker:visible')).toHaveCount(0);expect(await markers.count()).toBe(count);
 for(const marker of await markers.all())await expect(marker).toHaveAttribute('tabindex','-1');
 await page.keyboard.press('Escape');await expect(picker(page)).toHaveCount(0);await expect(page.locator('.ul-map-marker:visible')).toHaveCount(count);await expect(selected).toBeFocused();
 await selected.press('Enter');await expect(picker(page)).toBeVisible();await expect(page.locator('.ul-map-marker:visible')).toHaveCount(0);
});
