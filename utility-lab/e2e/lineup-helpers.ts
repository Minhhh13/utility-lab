import {expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {PUBLISHED_LINEUPS} from './catalogue-fixtures';
import {MAPS} from '../src/maps';
import {findLineupOrigin,parseOriginLookup,type OriginLookup} from '../src/lineup-origins';
import {FAVORITE_UTILITIES_KEY} from '../src/utility-data';
import {utilityMarkerArea} from '../src/utility-markers';
/** Personal editing is reached from a library guide; main browsing has no Add form. */
export async function startPersonalLineup(page:Page){
 // Wait for the requested map catalogue rather than clicking a provisional
 // bundled marker that can be replaced when the full catalogue arrives.
 await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 if(!await page.locator('.ul-media-dialog').isVisible()){
  await mainMarkers(page).first().locator('.ul-marker-hit').click();
  const utility=await waitForUtilityChoice(page,{allowUtilitySkip:true});
  if(await utility.count())await utility.getByRole('group',{name:'Utility types at this target',exact:true}).getByRole('button').first().click();
  await chooseLandingSpot(page);
  await openOriginPhoto(page);
 }
 await makePersonalCopy(page);
 const removeSource=page.getByRole('button',{name:'Remove source photos',exact:true});
 if(await removeSource.count())await removeSource.click();
 const removePhoto=page.getByRole('button',{name:/^Remove photo \d+$/});
 while(await removePhoto.count())await removePhoto.first().click();
 await page.locator('[name="lineup-video"]').fill('');
 await page.locator('[name="lineup-video-start"]').fill('0');
 await page.locator('[name="lineup-creator"]').fill('');
 await page.locator('[name="lineup-source"]').fill('');
 await expect(page.getByLabel('Lineup screenshot file',{exact:true})).toBeAttached();
}

export const landingChoices = (page:Page) => page.locator('.ul-landing-pin[role=button]');
export const mainMarkers = (page:Page) => page.locator('.ul-map-marker:not(.ul-landing-pin)');
export const mainMarkerGroupsForArea = (page:Page,areaId:string) => page.locator(`.ul-map-marker:not(.ul-landing-pin)[data-group-area-ids*=${JSON.stringify('"'+areaId+'"')}]`);
export const landingChoicesForArea = (page:Page,areaId:string) => page.locator(`.ul-landing-pin[data-target-area=${JSON.stringify(areaId)}]`);
export async function showLandingForArea(page:Page,areaId:string) {
 const pin=landingChoicesForArea(page,areaId).first();
 const next=page.getByRole('button',{name:'Next landing spots',exact:true});
 while(!await pin.count()&&await next.count()&&await next.isEnabled())await next.click();
 await expect(pin).toBeVisible();
 return pin;
}
export async function expectReferenceCount(page:Page,count:number){
 await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('.utility-workspace')).toHaveAttribute('data-reference-count',String(count));
}
export async function makePersonalCopy(page:Page){
 await page.getByRole('button',{name:'Lineup actions',exact:true}).click();
 await page.getByRole('menuitem',{name:'Make my own',exact:true}).click();
}
export async function downloadViewedLineup(page:Page){
 await page.getByRole('button',{name:'Lineup actions',exact:true}).click();
 await page.getByRole('menuitem',{name:'Download lineup',exact:true}).click();
}

export async function mainGroupAreaLabel(marker:ReturnType<typeof mainMarkers>,areaId:string){
 const ids:string[]=JSON.parse(await marker.getAttribute('data-group-area-ids') || '[]');
 const labels:string[]=JSON.parse(await marker.getAttribute('data-group-area-labels') || '[]');
 expect(ids).toContain(areaId);
 return labels[ids.indexOf(areaId)];
}

/** Only meaningful choices are shown: mixed kinds open a radial, singleton
 * kinds skip it, and a singleton destination skips the landing step too. */
export async function waitForUtilityChoice(page:Page,options:{allowUtilitySkip?:boolean}={}){
 const utility=page.getByRole('dialog',{name:'Choose utility',exact:true});
 const mapChoice=page.locator('.ul-landing-pin').first();
 const stages=utility.or(mapChoice).or(page.locator('.ul-origin-pin').first());
 await expect(stages.first()).toBeVisible();
 await expect(page.getByRole('dialog',{name:'Choose utility location',exact:true})).toHaveCount(0);
 return utility;
}

export async function chooseUtilityType(page:Page,type:string,options:{keyboard?:boolean;touch?:boolean}={}){
 const utility=await waitForUtilityChoice(page,{allowUtilitySkip:true});
 if(await utility.count()){
  const button=utility.getByRole('button',{name:type==='Molotov'?'Molly':type==='HE grenade'?'HE':type,exact:true});
  if(options.keyboard){await button.focus();await button.press('Enter');}
  else if(options.touch)await button.tap();else await button.click();
 }
 await expect(page.locator('.ul-landing-pin').first().or(page.locator('.ul-origin-pin').first()).first()).toBeVisible();
 if(await page.locator('.ul-origin-pin').count()){
  await expect(page.getByRole('group',{name:'Throw-from locations',exact:true})).toHaveAttribute('data-target-utility',type==='Molly'?'Molotov':type==='HE grenade'?'HE':type);
 }else{
  const kinds=await page.locator('.ul-landing-pin [data-utility]').evaluateAll(nodes=>[...new Set(nodes.map(node=>node.getAttribute('data-utility')))]);
  expect(kinds).toEqual([type==='Molly'?'Molotov':type==='HE grenade'?'HE':type]);
 }
}

export async function openUtilityGroupForArea(page:Page,areaId:string,options:{keyboard?:boolean;touch?:boolean;allowUtilitySkip?:boolean}={}){
 const marker=mainMarkerGroupsForArea(page,areaId).first();await expect(marker).toBeVisible();
 const areaLabel=await mainGroupAreaLabel(marker,areaId);
 if(options.keyboard){await marker.focus();await marker.press('Enter');}
 else if(options.touch)await marker.locator('.ul-marker-hit').tap();
 else await marker.locator('.ul-marker-hit').click();
 await waitForUtilityChoice(page,{allowUtilitySkip:options.allowUtilitySkip});
 return {marker,areaLabel};
}

/** Multiple exact destinations have landing pins; a singleton already shows
 * real standing pins. Read the actual chosen destination in both paths. */
export async function chooseLandingSpot(page:Page, options:{keyboard?:boolean;touch?:boolean;areaId?:string}={}){
 await expect(page.locator('.ul-landing-pin').first().or(page.locator('.ul-origin-pin').first()).first()).toBeVisible();
 if(await page.locator('.ul-origin-pin').count()){
  const metadata=await page.getByRole('group',{name:'Throw-from locations',exact:true}).evaluate(node=>({x:node.getAttribute('data-target-x'),y:node.getAttribute('data-target-y'),levelId:node.getAttribute('data-target-level'),label:node.getAttribute('data-target-label')}));
  expect(metadata.x).not.toBeNull();expect(metadata.y).not.toBeNull();expect(metadata.levelId).not.toBeNull();expect(metadata.label).not.toBeNull();
  return {id:'direct-destination',x:Number(metadata.x),y:Number(metadata.y),levelId:metadata.levelId,label:metadata.label};
 }
 const choices=landingChoices(page);
 expect(await choices.count()).toBeGreaterThanOrEqual(1);
 const first=options.areaId ? await showLandingForArea(page,options.areaId) : choices.first();
 await expect(first).toBeVisible();
 const selected={id:await first.getAttribute('data-landing-id'),x:Number(await first.getAttribute('data-landing-x')),y:Number(await first.getAttribute('data-landing-y')),levelId:await first.getAttribute('data-landing-level'),label:await first.getAttribute('data-target-label')};
  if(options.keyboard){await expect(choices.first()).toBeFocused();if(options.areaId)await first.focus();await first.press('Enter');}
  else if(options.touch)await first.tap();
  else await first.click();
  await expect(choices).toHaveCount(0);
 await expect(page.locator('.ul-origin-pin').first()).toBeVisible();
 return selected;
}

export async function originRecipeIds(page:Page):Promise<string[]>{
 return page.locator('.ul-origin-pin').evaluateAll(nodes=>nodes.flatMap(node=>JSON.parse(node.getAttribute('data-origin-recipes')||'[]')));
}

const originLookups=new Map<string,OriginLookup>();
/** Check retained recipes and genuine, nonoverlapping group anchors. Grouping
 * is a display choice; the old four-pin/four-recipe cap is not a requirement. */
export async function expectOriginRecipes(page:Page,expectedIds?:string[]){
 const source=page.getByRole('group',{name:'Throw-from locations',exact:true});
 await expect(page.locator('.ul-origin-pin').first()).toBeVisible();
 const target=await source.evaluate(node=>({x:Number(node.getAttribute('data-target-x')),y:Number(node.getAttribute('data-target-y')),level:node.getAttribute('data-target-level'),type:node.getAttribute('data-target-utility'),name:node.getAttribute('data-target-name')||node.getAttribute('data-target-label'),variant:node.getAttribute('data-target-variant')||''}));
 const mapName=(await page.getByRole('button',{name:'Change map',exact:true}).textContent())?.trim();
 const map=MAPS.find(map=>map.name.trim()===mapName);
 expect(map).toBeTruthy();
 const side=(await page.getByRole('group',{name:'Utility side',exact:true}).getByRole('button',{pressed:true}).textContent())?.trim().split(' ')[0];
 if(!originLookups.has(map!.id))originLookups.set(map!.id,parseOriginLookup(JSON.parse(await readFile(`src/data/lineup-origins/origins-${map!.id}.json`,'utf8'))));
 const lookup=originLookups.get(map!.id)!;
 const saved=await page.locator('.ul-favorites-filter').getAttribute('aria-pressed')==='true';
 const favorites=saved?await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'[]') as string[],FAVORITE_UTILITIES_KEY):[];
 const groups=await page.locator('.ul-origin-pin').evaluateAll(nodes=>nodes.map(node=>{
  const hit=node.querySelector('circle')!.getBoundingClientRect();
  return {x:Number(node.getAttribute('data-origin-x')),y:Number(node.getAttribute('data-origin-y')),level:node.getAttribute('data-origin-level')!,ids:JSON.parse(node.getAttribute('data-origin-recipes')||'[]') as string[],hit:{x:hit.x+hit.width/2,y:hit.y+hit.height/2,width:hit.width}};
 }));
 const ids=groups.flatMap(group=>group.ids);
 expect(new Set(ids).size,'A source recipe is represented by exactly one pin').toBe(ids.length);
 const floor=groups[0].level;
 const context=PUBLISHED_LINEUPS.filter(record=>record.mapId===map!.id&&record.levelId===target.level&&record.side===side&&record.type===target.type&&(!saved||favorites.includes(record.id)));
 const normalize=(label:string)=>label.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\bx ?box\b/g,'x box');
 const pointMatches=(record:typeof PUBLISHED_LINEUPS[number])=>record.x.toFixed(2)===target.x.toFixed(2)&&record.y.toFixed(2)===target.y.toFixed(2);
 const anchorRecord=context.find(record=>pointMatches(record)&&normalize(record.target)===normalize(target.name||'')&&normalize(record.landingVariant||'')===normalize(target.variant));
 expect(anchorRecord,'The chosen landing anchor remains an actual record for its exact target and qualifier').toBeTruthy();
 const area=utilityMarkerArea(anchorRecord!).id;
 const named=context.filter(record=>!record.userCreated&&utilityMarkerArea(record).id===area&&normalize(record.target)===normalize(target.name||'')&&normalize(record.landingVariant||'')===normalize(target.variant));
 // Only explicitly source-confirmed spawn scopes share a named destination
 // across provider impact variation. Other targets retain their exact point,
 // and Close/Far/Inside/Outside qualifiers never bleed into one another.
 const selected=named.some(record=>record.spawn)?named:context.filter(record=>utilityMarkerArea(record).id===area&&pointMatches(record));
 const records=selected.filter(record=>findLineupOrigin(record,lookup,floor)?.levelId===floor);
 expect(ids.slice().sort(),'Every source recipe for the selected landing remains accessible').toEqual((expectedIds||records.map(record=>record.id)).slice().sort());
 for(const group of groups){
  expect(group.ids.length).toBeGreaterThan(0);
  expect(group.ids.some(id=>{
   const record=PUBLISHED_LINEUPS.find(record=>record.id===id);if(!record)return false;
   const point=findLineupOrigin(record,lookup,group.level);
   return point?.x===group.x&&point.y===group.y&&point.levelId===group.level;
  }),'A grouped pin anchors one of its real published standing points').toBe(true);
  for(const other of groups)if(group!==other)expect(Math.hypot(group.hit.x-other.hit.x,group.hit.y-other.hit.y),'Standing hit areas remain independently clickable').toBeGreaterThanOrEqual(Math.min(group.hit.width,other.hit.width)-.5);
 }
 return {ids,groups,records};
}

/** Open the exact source recipe through its map group, with no extra picker
 * for singleton pins. The source ID remains explicit across paginated choices. */
export async function openOriginPhoto(page:Page,options:{recordId?:string;from?:string;keyboard?:boolean;touch?:boolean}={}){
 const pins=page.locator('.ul-origin-pin');await expect(pins.first()).toBeVisible();
 const groups=await pins.evaluateAll(nodes=>nodes.map((node,index)=>({index,ids:JSON.parse(node.getAttribute('data-origin-recipes')||'[]') as string[]})));
 const available=groups.flatMap(group=>group.ids);
 const normalize=(label:string)=>label.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const recordId=options.recordId||(options.from?available.find(id=>{
  const record=PUBLISHED_LINEUPS.find(record=>record.id===id);return record&&normalize(record.from)===normalize(options.from!);
 }):available[0]);
 expect(recordId,`Requested source ${options.recordId||options.from||'first standing recipe'} is represented on the map`).toBeTruthy();
 const group=groups.find(group=>group.ids.includes(recordId!));expect(group).toBeTruthy();
 const pin=pins.nth(group!.index);
 if(options.keyboard){await pin.focus();await pin.press('Enter');}
 else if(options.touch)await pin.tap();else await pin.click();
 const popup=page.locator('.ul-origin-choices'),viewer=page.locator('.ul-media-dialog');
 await expect(page.locator('.ul-origin-choices:visible,.ul-media-dialog[open]').first()).toBeVisible();
 if(group!.ids.length>1){
  await expect(popup).toBeVisible();
  const choice=popup.locator(`[data-lineup-id=${JSON.stringify(recordId)}]`);
  while(!await choice.count()){
   const more=popup.getByRole('button',{name:'More throws',exact:true});
   await expect(more).toBeEnabled();await more.click();
  }
  if(options.keyboard){await choice.focus();await choice.press('Enter');}
  else if(options.touch)await choice.tap();else await choice.click();
 }else await expect(popup).toHaveCount(0);
 await expect(viewer).toBeVisible();
 await expect(viewer.getByRole('button',{name:/^Photos/})).toHaveAttribute('aria-pressed','true');
 return {recordId:recordId!,record:PUBLISHED_LINEUPS.find(record=>record.id===recordId),pin};
}
