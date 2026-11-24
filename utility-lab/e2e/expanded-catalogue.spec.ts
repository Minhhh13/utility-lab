import {test,expect} from '@playwright/test';import {readFile} from 'node:fs/promises';import {PUBLISHED_LINEUPS} from './catalogue-fixtures';

import {expectReferenceCount,waitForUtilityChoice,chooseLandingSpot,chooseUtilityType,openOriginPhoto} from './lineup-helpers';
test.use({serviceWorkers:'block'});
async function imagesOnly(page){const bytes=await readFile('public/icons/icon-192.png');await page.route(/^https:\/\//,route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/png',body:bytes}):route.abort());}
const find=(check)=>{const row=PUBLISHED_LINEUPS.find(check);if(!row)throw Error('Missing published source fixture');return row;};

test('DustII molly browsing has multiple registered choices and opens standing photos before video',async({page})=>{
 await imagesOnly(page);await page.goto('/#utilities?map=dust2&level=main&side=T');await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 await page.getByRole('group',{name:'Utility type',exact:true}).getByRole('button',{name:/^Molly /}).click();
 expect(Number(await page.locator('.utility-workspace').getAttribute('data-reference-count'))).toBeGreaterThan(10);expect(await page.locator('.ul-map-marker').count()).toBeGreaterThan(2);
 await page.locator('.ul-map-marker').first().click();await waitForUtilityChoice(page,{allowUtilitySkip:true});await expect(page.getByRole('dialog',{name:'Choose utility',exact:true})).toHaveCount(0);await chooseLandingSpot(page);await openOriginPhoto(page);
 const viewer=page.locator('.ul-media-dialog');await expect(viewer).toBeVisible();await expect(viewer.getByRole('button',{name:/^Photos/})).toHaveAttribute('aria-pressed','true');
 await expect(viewer.locator('.ul-photo-kind')).toHaveText('Position');await expect(viewer.locator('video,iframe')).toHaveCount(0);await expect(viewer.getByRole('button',{name:'Video',exact:true})).toBeEnabled();await expect(viewer.locator('.ul-viewer-keys')).toContainText(/LMB|left/i);
 await viewer.getByRole('button',{name:'Next photo',exact:true}).click();await expect(viewer.locator('.ul-photo-kind')).toHaveText('Aim');
});

test('a source MP4 error switches only to that same guide’s published alternate video',async({page})=>{
 const row=find(row=>row.videoFallbackUrl&&row.mapId==='mirage');await imagesOnly(page);await page.goto(`/#utilities?map=${row.mapId}&level=${row.levelId}&side=${row.side}&lineup=${row.id}`);const viewer=page.getByRole('dialog',{name:row.title,exact:true});await expect(viewer).toBeVisible();
 await viewer.getByRole('button',{name:'Video',exact:true}).click();await expect(viewer.locator('video,iframe')).toHaveCount(0);await viewer.getByRole('button',{name:'Load video',exact:true}).click();
 const id=new URL(row.videoFallbackUrl).searchParams.get('v');await expect(viewer.locator('iframe')).toHaveAttribute('src',new RegExp(`/embed/${id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\?`));await expect(viewer.locator('video')).toHaveCount(0);
 await viewer.getByRole('button',{name:/^Photos/}).click();await expect(viewer.locator('iframe')).toHaveCount(0);await expect(viewer.locator('.ul-photo-kind')).toHaveText('Position');
});

test('expanded guide links resolve the real context and survive Saved navigation while Playbooks is staged',async({page})=>{
 const row=find(row=>row.mapId==='cache'&&row.side==='CT'&&row.type==='Flash');await imagesOnly(page);
 await page.addInitScript(row=>{localStorage.setItem('utility-lab:utility-favorites:v1',JSON.stringify([row.id]));localStorage.setItem('utility-lab:playbooks:v1',JSON.stringify([{id:'expanded-book',name:'Expanded source round',notes:'',tacticIds:[],lineupIds:[row.id],steps:[]}]))},row);
 await page.goto(`/#utilities?map=mirage&level=main&side=T&lineup=${row.id}`);await expect(page.getByRole('dialog',{name:row.title,exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Change map',exact:true})).toContainText('Cache');await expect(page.getByRole('button',{name:'CT side',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Close lineup media',exact:true}).click();await expect(page.getByRole('tab',{name:'Playbooks',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:/^Saved /}).click();await expectReferenceCount(page,1);await page.locator('.ul-map-marker').first().click();await waitForUtilityChoice(page);await chooseUtilityType(page,'Flash');await chooseLandingSpot(page);await openOriginPhoto(page,{recordId:row.id});await expect(page.getByRole('dialog',{name:row.title,exact:true})).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('utility-lab:playbooks:v1'))[0].lineupIds)).toEqual([row.id]);
});

test('Lineups fetches one map catalogue and no remote media before a guide opens',async({page})=>{
 const requests=[];page.on('request',request=>requests.push(request.url()));await page.goto('/#utilities?map=dust2&level=main&side=T');await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 const mapChunks=requests.filter(url=>/\/assets\/(mirage|dust2|inferno|nuke|ancient|anubis|cache|vertigo)-[^/]+\.json/.test(url));expect(mapChunks).toHaveLength(1);expect(mapChunks[0]).toMatch(/\/dust2-/);expect(requests.filter(url=>/cloudfront|csnades|youtube|\.mp4(?:[?#]|$)|\/lineup-media\//.test(url))).toEqual([]);
});



test('a failed map data request offers a working retry without a false empty library',async({page})=>{
 await imagesOnly(page);let attempts=0;await page.route('**/assets/dust2-*.json',route=>++attempts===1?route.abort():route.continue());await page.goto('/#utilities?map=dust2&level=main&side=T');
 const error=page.getByRole('alert').filter({hasText:'Couldn’t load this map’s lineups.'});await expect(error).toBeVisible();await expect(page.getByRole('heading',{name:'No utilities match.',exact:true})).toHaveCount(0);await error.getByRole('button',{name:'Try again',exact:true}).click();await expect(error).toHaveCount(0);await expectReferenceCount(page,PUBLISHED_LINEUPS.filter(row=>row.mapId==='dust2'&&row.levelId==='main'&&row.side==='T').length);expect(attempts).toBe(2);
});

test('both-button and directional source inputs remain explicit in the photo viewer',async({page})=>{
 await imagesOnly(page);
 for(const row of [find(row=>row.id==='expanded-csnades-cache-flashbang-a-main-from-a-main'),find(row=>row.id==='expanded-csnades-cache-smoke-garage-from-ct-spawn-1')]){
  await page.goto(`/#utilities?map=${row.mapId}&level=${row.levelId}&side=${row.side}&lineup=${row.id}`);const viewer=page.getByRole('dialog',{name:row.title,exact:true});await expect(viewer).toBeVisible();await expect(viewer.locator('.ul-mouse-input')).toHaveText('LMB + RMB');
  if(row.throwType.includes('D,'))await expect(viewer.locator('.ul-key-input').filter({hasText:/^D$/})).toBeVisible();else await expect(viewer.locator('.ul-key-input').filter({hasText:'Crouch'})).toBeVisible();
 }
});
