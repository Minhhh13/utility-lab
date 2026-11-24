import {test,expect,type Page,type Locator} from "@playwright/test";
import {readFile} from "node:fs/promises";
import {PUBLISHED_LINEUPS} from "./catalogue-fixtures";
import {FAVORITE_UTILITIES_KEY,USER_UTILITIES_KEY,utilityPhotos,type UtilityReference} from "../src/utility-data";
import {findLineupOrigin,parseOriginLookup} from "../src/lineup-origins";
import {mainMarkerGroupsForArea,mainMarkers,chooseUtilityType,chooseLandingSpot,waitForUtilityChoice} from "./lineup-helpers";

test.use({serviceWorkers:"block"});
const popup=(page:Page)=>page.locator(".ul-origin-choices");
const pins=(page:Page)=>page.locator(".ul-origin-pin");
const viewer=(page:Page)=>page.locator(".ul-media-dialog");
const dustRows=PUBLISHED_LINEUPS.filter(row=>row.mapId==="dust2"&&row.side==="T"&&row.type==="Smoke"&&row.target==="Mid Doors");

async function isolate(page:Page){
  const image=await readFile("public/icons/icon-192.png");
  await page.route(/^https:\/\//,route=>route.request().resourceType()==="image"?route.fulfill({contentType:"image/png",body:image}):route.abort());
}
async function ready(page:Page,map="dust2",side="T"){
  await page.goto(`/#utilities?map=${map}&level=main&side=${side}`);
  await expect(page.locator(".utility-workspace")).toHaveAttribute("aria-busy","false");
  await expect(mainMarkers(page).first()).toBeVisible();
}
async function openMidDoors(page:Page){
  await mainMarkerGroupsForArea(page,"dust2:main:mid-doors").first().locator(".ul-marker-hit").click();
  await waitForUtilityChoice(page);
  await chooseUtilityType(page,"Smoke");
  await chooseLandingSpot(page,{areaId:"dust2:main:mid-doors"});
  await expect(pins(page).first()).toBeVisible();
}
async function verifyPhoto(page:Page,record:UtilityReference,camera:string){
  await expect(viewer(page)).toBeVisible();
  await expect(viewer(page).getByRole("button",{name:/^Photos/})).toHaveAttribute("aria-pressed","true");
  await expect(viewer(page).locator(".ul-photo-canvas img")).toHaveAttribute("src",utilityPhotos(record)[0].image);
  await expect(viewer(page).locator(".ul-photo-kind")).toHaveText("Position");
  expect(await page.evaluate(()=>new URLSearchParams(location.hash.split("?")[1]).get("lineup"))).toBe(record.id);
  await expect(page.locator(".ul-map-svg")).toHaveAttribute("viewBox",camera);
}
async function choicesOnEveryPage(panel:Locator,personal=false){
  const ids:string[]=[];
  for(;;){
    const options=panel.locator(".ul-origin-choice-option");
    const actual=await options.evaluateAll(buttons=>buttons.map(button=>{
      const rect=button.getBoundingClientRect();
      return{id:button.getAttribute("data-lineup-id")!,height:rect.height,width:rect.width,hit:document.elementFromPoint(rect.x+rect.width/2,rect.y+Math.min(22,rect.height/2))?.closest("button")===button};
    }));
    expect(actual.length).toBeGreaterThan(0);expect(actual.length).toBeLessThanOrEqual(8);
    for(const option of actual){expect(option.height).toBeGreaterThanOrEqual(44);expect(option.width).toBeGreaterThanOrEqual(44);expect(option.hit,option.id).toBe(true);ids.push(option.id);}
    const more=panel.getByRole("button",{name:personal?"More lineups":"More throws",exact:true});
    if(!(await more.count())||!(await more.isEnabled()))break;
    await more.click();
  }
  return ids;
}

test('Ancient Top Mid buttons sit over their actual creator-numbered spawn positions on desktop and phone',async({page})=>{
  await isolate(page);
  const guides=PUBLISHED_LINEUPS.filter(row=>row.spawn?.family==='ancient-t-top-mid-flockwglock');
  const lookup=parseOriginLookup(JSON.parse(await readFile('src/data/lineup-origins/origins-ancient.json','utf8')));
  for(const size of [{width:1440,height:1080},{width:320,height:720}]){
    await page.goto('about:blank');
    await page.setViewportSize(size);
    await ready(page,'ancient','T');
    const camera=await page.locator('.ul-map-svg').getAttribute('viewBox');
    await mainMarkerGroupsForArea(page,'ancient:main:mid').first().locator('.ul-marker-hit').click();
    await chooseUtilityType(page,'Smoke');
    if(await page.locator('.ul-landing-pin').count()){
      const landing=page.locator('.ul-landing-pin').filter({hasText:/Top Mid/i}).first();
      const more=page.getByRole('button',{name:'Next landing spots'});
      while(!await landing.count()&&await more.count()&&await more.isEnabled())await more.click();
      await landing.click();
    }
    const represented=await pins(page).evaluateAll(nodes=>nodes.flatMap(node=>JSON.parse(node.getAttribute('data-origin-recipes')||'[]')));
    for(const guide of guides)expect(represented).toContain(guide.id);
    const selected=guides.find(row=>row.spawn!.slot===2)!;
    await page.locator(`.ul-origin-pin[data-origin-recipes*="${selected.id}"]`).click();
    await expect(popup(page)).toHaveAttribute('data-inset','positions');
    const positions=await popup(page).evaluate(panel=>{
      const crop=panel.querySelector<SVGSVGElement>('.ul-origin-choice-preview')!;
      const transform=crop.getScreenCTM()!.inverse();
      return [...panel.querySelectorAll<HTMLElement>('button[data-spawn-slot]')].map(node=>{
        const box=node.getBoundingClientRect();
        const x=box.x+box.width/2,y=box.y+box.height/2;
        const radar=new DOMPoint(x,y).matrixTransform(transform);
        return {id:node.dataset.lineupId,x:radar.x,y:radar.y,hit:document.elementFromPoint(x,y)?.closest('button')===node};
      });
    });
    expect(positions.length).toBeGreaterThan(1);
    for(const marker of positions){
      const point=findLineupOrigin(guides.find(row=>row.id===marker.id)!,lookup)!;
      expect(marker.hit).toBe(true);
      expect(marker.x).toBeCloseTo(point.x,0);
      expect(marker.y).toBeCloseTo(point.y,0);
    }
    await popup(page).locator('[data-spawn-slot="2"]').click();
    await verifyPhoto(page,selected,camera!);
    await page.keyboard.press('Escape');
  }
});

test("Dust II Mid Doors exposes every existing T recipe on source-backed non-overlapping pins, and a grouped choice opens its exact Position photo",async({page})=>{
  await isolate(page);await ready(page);
  const camera=(await page.locator(".ul-map-svg").getAttribute("viewBox"))!;
  await openMidDoors(page);
  const represented=await pins(page).evaluateAll(nodes=>nodes.flatMap(node=>JSON.parse(node.getAttribute("data-origin-recipes")||"[]")));
  expect(represented.sort()).toEqual(dustRows.map(row=>row.id).sort());
  expect(represented.length).toBeGreaterThan(4);
  const lookup=parseOriginLookup(JSON.parse(await readFile("src/data/lineup-origins/origins-dust2.json","utf8")));
  const groups=await pins(page).evaluateAll(nodes=>nodes.map(node=>{
    const circle=node.querySelector("circle")!.getBoundingClientRect();
    return{x:Number(node.getAttribute("data-origin-x")),y:Number(node.getAttribute("data-origin-y")),level:node.getAttribute("data-origin-level"),ids:JSON.parse(node.getAttribute("data-origin-recipes")||"[]") as string[],screen:{x:circle.x+circle.width/2,y:circle.y+circle.height/2}};
  }));
  for(const group of groups){
    expect(group.ids.some(id=>{
      const point=findLineupOrigin(dustRows.find(row=>row.id===id)!,lookup);
      return point?.x===group.x&&point.y===group.y&&point.levelId===group.level;
    })).toBe(true);
    for(const other of groups)if(group!==other)expect(Math.hypot(group.screen.x-other.screen.x,group.screen.y-other.screen.y)).toBeGreaterThanOrEqual(45.5);
  }
  const index=groups.findIndex(group=>group.ids.length>1);expect(index).toBeGreaterThanOrEqual(0);
  await pins(page).nth(index).click();await expect(popup(page)).toBeVisible();
  expect(await choicesOnEveryPage(popup(page))).toEqual(groups[index].ids);
  const id=(await popup(page).locator(".ul-origin-choice-option").last().getAttribute("data-lineup-id"))!;
  await popup(page).locator(".ul-origin-choice-option").last().click();
  await verifyPhoto(page,dustRows.find(row=>row.id===id)!,camera);
});

test("five source-numbered Mirage and Ancient instant spawn recipes are reachable after choosing their existing landing",async({page})=>{
  await isolate(page);
  for(const context of [{map:"mirage",side:"T",area:"mirage:main:mid-window"},{map:"ancient",side:"CT",area:"ancient:main:elbow"}]){
    const spawnRows=PUBLISHED_LINEUPS.filter(row=>row.mapId===context.map&&row.side===context.side&&row.type==="Smoke"&&row.spawn?.total===5);
    expect(spawnRows).toHaveLength(5);
    await ready(page,context.map,context.side);
    const marker=mainMarkerGroupsForArea(page,context.area).first();
    await marker.locator(".ul-marker-hit").click();await waitForUtilityChoice(page);
    await chooseUtilityType(page,"Smoke");
    if(await page.locator(".ul-landing-pin").count()){
      // Ancient Elbow and Lower Mid share a callout area, but remain distinct
      // exact landings. Choose this family's published point, not the first pin.
      const target=page.locator(`.ul-landing-pin[data-landing-x="${spawnRows[0].x}"][data-landing-y="${spawnRows[0].y}"]`).first();
      await expect(target).toBeVisible();await target.click();
    }
    await expect(pins(page).first()).toBeVisible();
    const represented=await pins(page).evaluateAll(nodes=>nodes.flatMap(node=>JSON.parse(node.getAttribute("data-origin-recipes")||"[]")));
    expect(spawnRows.map(row=>row.spawn!.slot).sort()).toEqual([1,2,3,4,5]);
    for(const record of spawnRows)expect(represented).toContain(record.id);
  }
});

test("a singleton standing recipe opens photos in one click without an extra origin picker",async({page})=>{
  await isolate(page);
  const record=dustRows.find(row=>row.from==="Lower Tunnels")!;
  await page.addInitScript(({key,id})=>localStorage.setItem(key,JSON.stringify([id])),{key:FAVORITE_UTILITIES_KEY,id:record.id});
  await ready(page);
  await page.getByRole("button",{name:/^Saved /}).click();
  await mainMarkers(page).first().locator(".ul-marker-hit").click();
  await expect(pins(page)).toHaveCount(1);
  const camera=(await page.locator(".ul-map-svg").getAttribute("viewBox"))!;
  await pins(page).first().click();
  await expect(popup(page)).toHaveCount(0);
  await verifyPhoto(page,record,camera);
});

test.describe("320px origin recipe popup",()=>{
  test.use({viewport:{width:320,height:640},hasTouch:true,isMobile:true});
  test("all eight-per-page choices are reachable, keyboard/Escape returns focus, and selecting a later page preserves the map",async({page})=>{
    await isolate(page);
    const base=dustRows.find(row=>row.from==="Lower Tunnels")!;
    // Owner target coordinates are personal actions, never publisher standing
    // points. These source-free copies exercise all17 choices without adding
    // fictional standing locations or spawn families to production.
    const records=Array.from({length:17},(_,index):UtilityReference=>({...base,id:`test-origin-page-${index+1}`,title:`Personal test recipe ${index+1}`,from:`My notes ${index+1}`,userCreated:true,source:undefined,markerSource:undefined,spawn:undefined}));
    await page.addInitScript(({records,userKey,savedKey})=>{
      localStorage.setItem(userKey,JSON.stringify(records));localStorage.setItem(savedKey,JSON.stringify(records.map(row=>row.id)));
    },{records,userKey:USER_UTILITIES_KEY,savedKey:FAVORITE_UTILITIES_KEY});
    await ready(page);await page.getByRole("button",{name:/^Saved /}).click();
    await mainMarkers(page).first().locator(".ul-marker-hit").tap();await expect(pins(page)).toHaveCount(0);
    const personal=page.locator('.ul-personal-guide-pin');await expect(personal).toHaveCount(1);
    await expect(personal).toHaveAttribute('aria-label','Your lineups, 17 saved lineups');
    await expect(personal).toHaveAttribute('data-personal-target-x',String(base.x));
    await expect(personal).toHaveAttribute('data-personal-target-y',String(base.y));
    const pin=personal.first();const camera=(await page.locator(".ul-map-svg").getAttribute("viewBox"))!;
    await pin.focus();await pin.press("Enter");await expect(popup(page)).toBeVisible();
    await expect(popup(page)).toHaveAttribute('data-choice-kind','personal');
    await expect(popup(page)).toHaveAttribute('aria-label','Choose your lineup');
    const geometry=await popup(page).evaluate(element=>{
      const rect=element.getBoundingClientRect();return{x:rect.x,y:rect.y,right:rect.right,bottom:rect.bottom,scrollWidth:element.scrollWidth,width:element.clientWidth};
    });
    expect(geometry.x).toBeGreaterThanOrEqual(11.5);expect(geometry.y).toBeGreaterThanOrEqual(11.5);
    expect(geometry.right).toBeLessThanOrEqual(308.5);expect(geometry.bottom).toBeLessThanOrEqual(628.5);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width+1);
    const options=popup(page).locator(".ul-origin-choice-option");
    await expect(options.first()).toBeFocused();await page.keyboard.press("End");await expect(options.last()).toBeFocused();
    await page.keyboard.press("Home");await expect(options.first()).toBeFocused();await page.keyboard.press("ArrowRight");await expect(options.nth(1)).toBeFocused();
    await page.keyboard.press("Escape");await expect(popup(page)).toHaveCount(0);await expect(pin).toBeFocused();
    await pin.press("Enter");
    expect((await choicesOnEveryPage(popup(page),true)).sort()).toEqual(records.map(row=>row.id).sort());
    await expect(page.locator(".ul-map-svg")).toHaveAttribute("viewBox",camera);
    const chosenId=await popup(page).locator('[data-lineup-id]').last().getAttribute('data-lineup-id');
    const chosen=records.find(record=>record.id===chosenId)!;
    await popup(page).locator(`[data-lineup-id="${chosen.id}"]`).click();
    await verifyPhoto(page,chosen,camera);
  });
});
