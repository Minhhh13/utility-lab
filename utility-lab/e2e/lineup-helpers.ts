import {expect,type Page} from '@playwright/test';
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
  await page.locator('.ul-origin-pin').first().click();
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

export const landingChoices = (page:Page) => page.getByRole('group',{name:'Landing locations',exact:true}).getByRole('button');
export const mainMarkers = (page:Page) => page.locator('.ul-map-marker:not(.ul-landing-pin)');
export const mainMarkerGroupsForArea = (page:Page,areaId:string) => page.locator(`.ul-map-marker:not(.ul-landing-pin)[data-group-area-ids*=${JSON.stringify('"'+areaId+'"')}]`);
export const landingChoicesForArea = (page:Page,areaId:string) => page.locator(`.ul-landing-pin[data-target-area=${JSON.stringify(areaId)}]`);
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
 const first=(options.areaId ? landingChoicesForArea(page,options.areaId) : choices).first();
 await expect(first).toBeVisible();
 const selected={id:await first.getAttribute('data-landing-id'),x:Number(await first.getAttribute('data-landing-x')),y:Number(await first.getAttribute('data-landing-y')),levelId:await first.getAttribute('data-landing-level'),label:await first.getAttribute('data-target-label')};
  if(options.keyboard){await expect(choices.first()).toBeFocused();if(options.areaId)await first.focus();await first.press('Enter');}
  else if(options.touch)await first.tap();
  else await first.click();
  await expect(choices).toHaveCount(0);
 await expect(page.locator('.ul-origin-pin').first()).toBeVisible();
 return selected;
}
