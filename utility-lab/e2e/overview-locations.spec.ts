import {chooseLandingSpot,landingChoices,landingChoicesForArea,mainMarkers,mainMarkerGroupsForArea,waitForUtilityChoice,openUtilityGroupForArea,expectReferenceCount,chooseUtilityType,openOriginPhoto,expectOriginRecipes} from './lineup-helpers';
import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {MAPS,type GameMap,type MapLevel} from '../src/maps';
import {PUBLISHED_LINEUPS} from './catalogue-fixtures';
import {utilityMarkerArea} from '../src/utility-markers';
import {utilityPhotos} from '../src/utility-data';

test.use({serviceWorkers:'block'});
const picker=(page:Page)=>page.getByRole('dialog',{name:'Choose utility',exact:true});
const areaUnion=(page:Page)=>mainMarkers(page).evaluateAll(nodes=>[...new Set(nodes.flatMap(node=>JSON.parse(node.getAttribute('data-group-area-ids') || '[]') as string[]))].sort());
async function isolateMedia(page:Page){
 const image=await readFile('public/icons/icon-192.png');
 await page.route(/^https:\/\//,route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/png',body:image}):route.abort());
}
async function openContext(page:Page,map:GameMap,level:MapLevel,side:'T'|'CT'){
 await page.goto(`/#utilities?map=${map.id}&level=${level.id}&side=${side}`);
 const records=PUBLISHED_LINEUPS.filter(record=>record.mapId===map.id&&record.levelId===level.id&&record.side===side);
 await expectReferenceCount(page,records.length);
 await expect(page.getByRole('button',{name:'Reset utility map zoom',exact:true})).toHaveText('100%');
 const expected=[...new Set(records.filter(record=>record.showMarker!==false).map(record=>utilityMarkerArea(record).id))].sort();
 await expect.poll(()=>areaUnion(page),{message:`${map.id}/${level.id}/${side}: groups retain every named utility area`}).toEqual(expected);
 expect(await mainMarkers(page).count()).toBeLessThanOrEqual(expected.length);
 await expect(page.locator('.ul-sidebar, .ul-reference-open')).toHaveCount(0);
 return records;
}
async function expectAnchoredIconGroups(page:Page,records:typeof PUBLISHED_LINEUPS){
 const groups=await mainMarkers(page).evaluateAll(nodes=>nodes.map(node=>{
  const hit=node.querySelector('.ul-marker-hit')!.getBoundingClientRect();
  const plate=node.querySelector('.ul-target-marker-backplate')!.getBoundingClientRect();
  return {ids:JSON.parse(node.getAttribute('data-group-area-ids') || '[]') as string[],labels:JSON.parse(node.getAttribute('data-group-area-labels') || '[]') as string[],size:Number(node.getAttribute('data-group-size')),x:Number(node.getAttribute('data-target-x')),y:Number(node.getAttribute('data-target-y')),transform:node.getAttribute('transform'),hit:{x:hit.x+hit.width/2,y:hit.y+hit.height/2,width:hit.width},glyphWidth:plate.width,icons:node.querySelectorAll('.ul-target-marker [data-utility] svg').length};
 }));
 for(const group of groups){
  expect(group.size).toBe(group.ids.length);expect(group.labels).toHaveLength(group.ids.length);
  expect(group.ids.length).toBeGreaterThan(0);
  expect(group.transform).toBe(`translate(${group.x} ${group.y})`);
  expect(records.some(record=>group.ids.includes(utilityMarkerArea(record).id)&&record.x===group.x&&record.y===group.y),'Every overview group stays on an actual published destination').toBe(true);
  expect(group.glyphWidth).toBeGreaterThanOrEqual(35);expect(group.glyphWidth).toBeLessThanOrEqual(37);
  expect(group.hit.width).toBeGreaterThanOrEqual(45.5);expect(group.icons).toBeGreaterThanOrEqual(1);expect(group.icons).toBeLessThanOrEqual(4);
 }
 for(let a=0;a<groups.length;a++)for(let b=a+1;b<groups.length;b++)expect(Math.hypot(groups[a].hit.x-groups[b].hit.x,groups[a].hit.y-groups[b].hit.y),'Nearby places share a group rather than overlapping hit targets').toBeGreaterThanOrEqual(45.5);
 await expect(page.locator('.ul-target-leaders line')).toHaveCount(0);
 return groups;
}

test('full-map overview retains every utility area with clear grenade icons across maps, floors and sides',async({page})=>{
 test.setTimeout(120000);await isolateMedia(page);await page.setViewportSize({width:1440,height:1000});
 let nonempty=0,empty=0,multi=false;
 for(const map of MAPS)for(const level of map.levels)for(const side of ['T','CT'] as const){
  const records=await openContext(page,map,level,side);if(!records.length){empty++;continue;}nonempty++;
  const groups=await expectAnchoredIconGroups(page,PUBLISHED_LINEUPS.filter(record=>record.mapId===map.id&&record.levelId===level.id&&record.side===side));multi ||=groups.some(group=>group.size>1);
  if(map.id==='dust2'&&side==='T')await page.screenshot({path:'outputs/overview-locations/dust2-full-map-1440.png'});
 }
 expect(nonempty).toBe(19);expect(empty).toBe(1);expect(multi).toBe(true);
});

test('Mid Doors is selected on the map after choosing Smoke without mixing Lower Tunnels or X Box sources',async({page})=>{
 await isolateMedia(page);const map=MAPS.find(map=>map.id==='dust2')!;await openContext(page,map,map.levels[0],'T');
 const group=mainMarkerGroupsForArea(page,'dust2:main:mid-doors').first();expect(Number(await group.getAttribute('data-group-size'))).toBeGreaterThan(1);
 await openUtilityGroupForArea(page,'dust2:main:mid-doors');
 await expect(page.getByRole('dialog',{name:'Choose utility location',exact:true})).toHaveCount(0);
 await picker(page).getByRole('button',{name:'Smoke',exact:true}).click();
 await expect(landingChoicesForArea(page,'dust2:main:mid-doors').first()).toBeVisible();
 await expect(page.locator('.ul-origin-pin')).toHaveCount(0);
 const landing=await chooseLandingSpot(page,{areaId:'dust2:main:mid-doors'});
 await expectOriginRecipes(page);
 await expect(page.locator('.ul-origin-target .ul-origin-label')).toHaveText(landing.label!);
 await openOriginPhoto(page);const viewer=page.locator('.ul-media-dialog');await expect(viewer).toBeVisible();
 const id=await page.evaluate(()=>new URLSearchParams(location.hash.split('?')[1]).get('lineup'));const record=PUBLISHED_LINEUPS.find(record=>record.id===id)!;
 expect(record.type).toBe('Smoke');expect(utilityMarkerArea(record).id).toBe('dust2:main:mid-doors');expect(record).toMatchObject({x:landing.x,y:landing.y,levelId:landing.levelId});
 await expect(viewer.locator('.ul-photo-canvas img')).toHaveAttribute('src',utilityPhotos(record)[0].image);
 await expect(viewer.getByRole('button',{name:/^Photos/})).toHaveAttribute('aria-pressed','true');
});

test('zoom separates nearby groups into more precise Mid Doors locations without changing source anchors',async({page})=>{
 await isolateMedia(page);const map=MAPS.find(map=>map.id==='dust2')!;await openContext(page,map,map.levels[0],'T');
 const doors=mainMarkerGroupsForArea(page,'dust2:main:mid-doors');const overview=await doors.count();
 const record=PUBLISHED_LINEUPS.find(record=>record.mapId==='dust2'&&record.side==='T'&&record.type==='Smoke'&&utilityMarkerArea(record).id==='dust2:main:mid-doors')!;
 const svg=page.locator('.ul-map-svg');const point=await svg.evaluate((svg:SVGSVGElement,record)=>{const p=new DOMPoint(record.x,record.y).matrixTransform(svg.getScreenCTM()!);return{x:p.x,y:p.y};},record);
 await page.mouse.move(point.x,point.y);for(let i=0;i<4;i++)await page.mouse.wheel(0,-500);
 await expect.poll(()=>doors.count()).toBeGreaterThan(overview);
 await expectAnchoredIconGroups(page,PUBLISHED_LINEUPS.filter(record=>record.mapId==='dust2'&&record.side==='T'));
 await page.screenshot({path:'outputs/overview-locations/dust2-full-map-detail.png'});
 await page.getByRole('button',{name:'Reset utility map zoom',exact:true}).click();await expect.poll(()=>doors.count()).toBe(overview);
});

test('group keyboard activation opens utility choices directly and focuses landing pins after utility selection',async({page})=>{
 await isolateMedia(page);const map=MAPS.find(map=>map.id==='dust2')!;await openContext(page,map,map.levels[0],'T');
 const marker=mainMarkerGroupsForArea(page,'dust2:main:mid-doors').first();
 await marker.focus();await marker.press('Enter');await waitForUtilityChoice(page);
 const smoke=picker(page).getByRole('button',{name:'Smoke',exact:true});await expect(smoke).toBeFocused();
 await page.keyboard.press('End');await expect(picker(page).getByRole('group',{name:'Utility types at this target',exact:true}).getByRole('button').last()).toBeFocused();
 await page.keyboard.press('Escape');await expect(picker(page)).toHaveCount(0);await expect(marker).toBeFocused();
 await marker.press('Enter');await smoke.press('Enter');
 await expect(landingChoices(page).first()).toBeFocused();await expect(page.locator('.ul-origin-pin')).toHaveCount(0);
 expect(await landingChoices(page).first().evaluate(element=>element.getAnimations({subtree:true}).filter(animation=>animation.playState==='running').length)).toBe(0);
 await chooseLandingSpot(page,{keyboard:true});await expect(page.locator('.ul-origin-pin').first()).toBeFocused();
});

test('main badges stay anchored and move with the map during pan without leader or grid reflow',async({page})=>{
 await isolateMedia(page);const map=MAPS.find(map=>map.id==='dust2')!;await openContext(page,map,map.levels[0],'T');
 await page.getByRole('button',{name:'Zoom utility map in',exact:true}).click();await page.getByRole('button',{name:'Zoom utility map in',exact:true}).click();
 const marker=mainMarkerGroupsForArea(page,'dust2:main:mid-doors').first();await expect(marker).toBeVisible();
 const before={x:await marker.getAttribute('data-target-x'),y:await marker.getAttribute('data-target-y'),ids:await marker.getAttribute('data-group-area-ids'),transform:await marker.getAttribute('transform'),box:(await marker.locator('.ul-marker-hit').boundingBox())!};
 const svg=page.locator('.ul-map-svg'),view=await svg.getAttribute('viewBox'),box=(await svg.boundingBox())!;
 await page.getByRole('button',{name:'Pan utility map',exact:true}).click();
 await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.5+28,box.y+box.height*.5+18,{steps:4});await page.mouse.up();
 await expect(svg).not.toHaveAttribute('viewBox',view!);
 const after=mainMarkerGroupsForArea(page,'dust2:main:mid-doors').first();await expect(after).toHaveAttribute('data-target-x',before.x!);await expect(after).toHaveAttribute('data-target-y',before.y!);await expect(after).toHaveAttribute('data-group-area-ids',before.ids!);await expect(after).toHaveAttribute('transform',before.transform!);
 const moved=(await after.locator('.ul-marker-hit').boundingBox())!;expect(moved.x-before.box.x).toBeCloseTo(28,0);expect(moved.y-before.box.y).toBeCloseTo(18,0);await expect(page.locator('.ul-target-leaders line')).toHaveCount(0);
});

test('a single Smoke filter goes from the overview directly to landing locations',async({page})=>{
 await isolateMedia(page);const map=MAPS.find(map=>map.id==='dust2')!;await openContext(page,map,map.levels[0],'T');
 const filters=page.getByRole('group',{name:'Utility type',exact:true});await filters.getByRole('button',{name:/^Smoke /}).click();
 await expect(filters.getByRole('button',{name:/^Smoke /})).toHaveAttribute('aria-pressed','true');
 await openUtilityGroupForArea(page,'dust2:main:mid-doors',{allowUtilitySkip:true});await expect(picker(page)).toHaveCount(0);await expect(page.locator('.ul-origin-pin')).toHaveCount(0);
 const landing=await chooseLandingSpot(page,{areaId:'dust2:main:mid-doors'});await expect(page.locator('.ul-origin-target .ul-origin-label')).toHaveText(landing.label!);
 await openOriginPhoto(page);await expect(page.locator('.ul-media-dialog')).toBeVisible();
 const id=await page.evaluate(()=>new URLSearchParams(location.hash.split('?')[1]).get('lineup'));const selected=PUBLISHED_LINEUPS.find(record=>record.id===id)!;expect(selected.type).toBe('Smoke');expect(utilityMarkerArea(selected).id).toBe('dust2:main:mid-doors');
});

test.describe('phone full-map overview',()=>{
 test.use({hasTouch:true});
 test('320px groups retain every area and show map landing choices after a utility tap',async({page})=>{
  test.setTimeout(120000);await isolateMedia(page);await page.setViewportSize({width:320,height:844});
  for(const map of MAPS)for(const level of map.levels)for(const side of ['T','CT'] as const){
   const records=await openContext(page,map,level,side);if(!records.length)continue;
   await expectAnchoredIconGroups(page,PUBLISHED_LINEUPS.filter(record=>record.mapId===map.id&&record.levelId===level.id&&record.side===side));expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
   await mainMarkers(page).first().locator('.ul-marker-hit').tap();await waitForUtilityChoice(page);
   if(await picker(page).count())await picker(page).getByRole('group',{name:'Utility types at this target',exact:true}).getByRole('button').first().tap();
   await expect(landingChoices(page).first().or(page.locator('.ul-origin-pin').first()).first()).toBeVisible();await expect(page.locator('.ul-media-dialog')).not.toBeVisible();
   for(const pin of await landingChoices(page).all())await expect(pin).toBeInViewport();
   await page.getByRole('button',{name:'Back to targets',exact:true}).tap();
   if(map.id==='dust2'&&side==='T'){
    await openUtilityGroupForArea(page,'dust2:main:mid-doors',{touch:true});await chooseUtilityType(page,'Smoke',{touch:true});
    await chooseLandingSpot(page,{touch:true,areaId:'dust2:main:mid-doors'});await expect(page.locator('.ul-origin-pin').first()).toBeVisible();await page.getByRole('button',{name:'Back to targets',exact:true}).tap();
    await page.screenshot({path:'outputs/overview-locations/dust2-full-map-320.png',fullPage:true});
   }
  }
 });
});
