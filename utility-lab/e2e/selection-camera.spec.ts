import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {MAPS} from '../src/maps';
import {PUBLISHED_LINEUPS} from './catalogue-fixtures';
import {utilityMarkerArea} from '../src/utility-markers';
import {utilityPhotos} from '../src/utility-data';
import {mainMarkerGroupsForArea,landingChoicesForArea,waitForUtilityChoice,chooseUtilityType,chooseLandingSpot} from './lineup-helpers';

test.use({serviceWorkers:'block'});
const area='dust2:main:mid-doors';
const canvas=(page:Page)=>page.locator('.ul-map-svg');
const origins=(page:Page)=>page.locator('.ul-origin-pin');
const viewer=(page:Page)=>page.locator('.ul-media-dialog');
type Input='mouse'|'keyboard'|'touch';

async function isolateMedia(page:Page){
 const image=await readFile('public/icons/icon-192.png');
 await page.route(/^https:\/\//,route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/png',body:image}):route.abort());
}
async function activate(element:ReturnType<Page['locator']>,input:Input){
 if(input==='keyboard'){await element.focus();await element.press('Enter');}
 else if(input==='touch')await element.tap();
 else await element.click();
}
async function ready(page:Page,url='/#utilities?map=dust2&level=main&side=T'){
 await page.goto(url);await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('.ul-map-marker').first()).toBeVisible();
}
async function watchCamera(page:Page){
 const value=await canvas(page).getAttribute('viewBox');expect(value).toBeTruthy();
 await canvas(page).evaluate(element=>{
  const state=window as typeof window&{selectionCameraObserver?:MutationObserver;selectionCameraChanges?:string[]};
  state.selectionCameraObserver?.disconnect();state.selectionCameraChanges=[];
  state.selectionCameraObserver=new MutationObserver(()=>state.selectionCameraChanges!.push(element.getAttribute('viewBox')||''));
  state.selectionCameraObserver.observe(element,{attributes:true,attributeFilter:['viewBox']});
 });
 return value!;
}
async function expectCamera(page:Page,value:string){
 await expect(canvas(page)).toHaveAttribute('viewBox',value);
 expect(await page.evaluate(()=>(window as typeof window&{selectionCameraChanges?:string[]}).selectionCameraChanges)).toEqual([]);
}
async function manuallyPosition(page:Page,mode:'wheel'|'keyboard'){
 const svg=canvas(page),fit=await svg.getAttribute('viewBox');
 if(mode==='wheel'){
  const point=await svg.evaluate((element:SVGSVGElement)=>{const point=new DOMPoint(454.53,361.96).matrixTransform(element.getScreenCTM()!);return{x:point.x,y:point.y};});
  await page.mouse.move(point.x,point.y);await page.mouse.wheel(0,-250);
  await expect(svg).not.toHaveAttribute('viewBox',fit!);
  await page.getByRole('button',{name:'Pan utility map',exact:true}).click();
  const before=await svg.getAttribute('viewBox');
  await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+24,point.y+16,{steps:4});await page.mouse.up();
  await expect(svg).not.toHaveAttribute('viewBox',before!);
  await page.getByRole('button',{name:'Pan utility map',exact:true}).click();
 }else{
  await svg.focus();await svg.press('+');await expect(svg).not.toHaveAttribute('viewBox',fit!);
  const zoomed=await svg.getAttribute('viewBox');await svg.press('ArrowRight');await svg.press('ArrowDown');await expect(svg).not.toHaveAttribute('viewBox',zoomed!);
 }
 return fit!;
}
async function throughSameFloorSelection(page:Page,input:Input,camera:string){
 const group=mainMarkerGroupsForArea(page,area).first();
 await activate(input==='keyboard'?group:group.locator('.ul-marker-hit'),input);await waitForUtilityChoice(page);
 await expectCamera(page,camera);
 await chooseUtilityType(page,'Smoke',{keyboard:input==='keyboard',touch:input==='touch'});
 await expectCamera(page,camera);
 await chooseLandingSpot(page,{areaId:area,keyboard:input==='keyboard',touch:input==='touch'});
 await expect(origins(page).first()).toBeVisible();await expectCamera(page,camera);
 const lower=origins(page).filter({has:page.locator('title',{hasText:/^Lower Tunnels? —/})});
 const source=await lower.count()?lower.first():origins(page).first();
 await activate(source,input);await expect(viewer(page)).toBeVisible();await expectCamera(page,camera);
 const id=await page.evaluate(()=>new URLSearchParams(location.hash.split('?')[1]).get('lineup'));
 const row=PUBLISHED_LINEUPS.find(row=>row.id===id)!;expect(row).toBeTruthy();expect(row).toMatchObject({mapId:'dust2',levelId:'main',side:'T',type:'Smoke'});expect(utilityMarkerArea(row).id).toBe(area);
 await expect(viewer(page).locator('.ul-photo-canvas img')).toHaveAttribute('src',utilityPhotos(row)[0].image);
 await expect(viewer(page).getByRole('button',{name:/^Photos/})).toHaveAttribute('aria-pressed','true');
 await activate(viewer(page).getByRole('button',{name:'Close lineup media',exact:true}),input);await expect(viewer(page)).not.toBeVisible();await expectCamera(page,camera);
 await activate(page.getByRole('button',{name:'Back to targets',exact:true}),input);
 await expect(origins(page)).toHaveCount(0);await expect(mainMarkerGroupsForArea(page,area).first()).toBeVisible();await expectCamera(page,camera);
}

test('Fit camera stays fixed through utility, landing, source, photos and Back',async({page})=>{
 await isolateMedia(page);await ready(page);const camera=await watchCamera(page);
 await throughSameFloorSelection(page,'mouse',camera);
});

test('manual wheel zoom and hand pan survive selection and Back; explicit Fit still works',async({page})=>{
 await isolateMedia(page);await ready(page);const fit=await manuallyPosition(page,'wheel');const camera=await watchCamera(page);expect(camera).not.toBe(fit);
 await throughSameFloorSelection(page,'mouse',camera);
 await page.getByRole('button',{name:'Reset utility map zoom',exact:true}).click();await expect(canvas(page)).toHaveAttribute('viewBox',fit);
});

test('keyboard selection preserves a manually zoomed and panned camera and remains immediate',async({page})=>{
 await isolateMedia(page);await ready(page);const fit=await manuallyPosition(page,'keyboard');const camera=await watchCamera(page);expect(camera).not.toBe(fit);
 await throughSameFloorSelection(page,'keyboard',camera);
 expect(await page.locator('.ul-origin-glyph.can-animate').count()).toBe(0);
 await canvas(page).press('0');await expect(canvas(page)).toHaveAttribute('viewBox',fit);
});

test.describe('phone camera stays under the player’s control',()=>{
 test.use({viewport:{width:320,height:844},hasTouch:true,isMobile:true});
 for(const positioned of [false,true])test(`${positioned?'manual keyboard zoom/pan':'Fit'} survives touch selection and Back`,async({page})=>{
  await isolateMedia(page);await ready(page);const fit=positioned?await manuallyPosition(page,'keyboard'):await canvas(page).getAttribute('viewBox');const camera=await watchCamera(page);
  if(positioned)expect(camera).not.toBe(fit);
  await throughSameFloorSelection(page,'touch',camera);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
 });
});

for(const scenario of [{mapId:'nuke',type:'HE'},{mapId:'vertigo',type:'Smoke'}])test(`${scenario.mapId} changes camera only for an actual floor change`,async({page})=>{
 await isolateMedia(page);await ready(page,`/#utilities?map=${scenario.mapId}&level=lower&side=CT`);
 const map=MAPS.find(map=>map.id===scenario.mapId)!;
 const upper=map.levels.find(level=>level.id==='upper')!,frame=upper.contentBounds||{x:0,y:0,width:1000,height:1000};
 const expectedUpper=[frame.x,frame.y,frame.width,frame.height].join(' ');
 await page.getByRole('group',{name:'Utility type',exact:true}).getByRole('button',{name:new RegExp(`^${scenario.type} `)}).click();
 const lowerCamera=await watchCamera(page);
 await page.locator('.ul-map-marker:not(.ul-landing-pin)').first().locator('.ul-marker-hit').click();await waitForUtilityChoice(page,{allowUtilitySkip:true});
 if(await page.locator('.ul-landing-pin').count()){
  await expectCamera(page,lowerCamera);await page.locator('.ul-landing-pin').first().click();
 }
 await expect(origins(page).first()).toHaveAttribute('data-origin-level','upper');await expect(canvas(page)).toHaveAttribute('viewBox',expectedUpper);
 const upperCamera=await watchCamera(page);
 await origins(page).first().click();await expect(viewer(page)).toBeVisible();await expectCamera(page,upperCamera);
 await viewer(page).getByRole('button',{name:'Close lineup media',exact:true}).click();await expectCamera(page,upperCamera);
 await page.getByRole('button',{name:'Back to targets',exact:true}).click();
 await expect(page.getByRole('group',{name:'Utility map level',exact:true}).getByRole('button',{name:'Lower',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(canvas(page)).toHaveAttribute('viewBox',lowerCamera);
});
