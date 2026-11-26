import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {PUBLISHED_LINEUPS} from './catalogue-fixtures';

for(const size of [{width:1440,height:1080},{width:1280,height:960},{width:1120,height:620},{width:1024,height:600},{width:1920,height:1080},{width:320,height:844},{width:390,height:844}]){
 test.describe(`${size.width}x${size.height} edge controls`,()=>{
  test.use({viewport:size,isMobile:size.width<600,hasTouch:size.width<600,serviceWorkers:'block'});
  test('keeps desktop controls left/right and phone controls top/bottom, with a clear map center',async({page})=>{
   await page.route(/^https:\/\//,route=>route.abort());
   await page.goto('/#utilities?map=dust2&level=main&side=T');
   await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
   if(size.width>=600&&size.width<1500){
    await page.getByLabel('Display settings',{exact:true}).click();
    await page.getByRole('radio',{name:'4:3',exact:true}).check();
    await page.getByLabel('Display settings',{exact:true}).press('Escape');
   }
   const canvas=(await page.locator('.utility-workspace').boundingBox())!;
   const filters=(await page.locator('.ul-filterbar').boundingBox())!;
   const zoom=(await page.locator('.ul-zoom').boundingBox())!;
   const teams = page.getByRole('group', {name:'Utility side', exact:true});
   const sideBox = (await teams.boundingBox())!;
   if(size.width>=600){
    expect(filters.x+filters.width).toBeLessThan(canvas.x+canvas.width*.35);
    expect(zoom.x).toBeGreaterThan(canvas.x+canvas.width*.65);
    expect(filters.height).toBeGreaterThan(filters.width);
    expect(zoom.height).toBeGreaterThan(zoom.width);
    if (size.width >= 1101 && await page.locator("#workspace").getAttribute("data-aspect-ratio") === "4:3") {
      expect(sideBox.x).toBeCloseTo(filters.x, 0);
      expect(sideBox.x + sideBox.width).toBeLessThanOrEqual(filters.x + filters.width);
      expect(sideBox.y).toBeGreaterThanOrEqual(filters.y + filters.height);
    } else {
      expect(sideBox.x).toBeGreaterThanOrEqual(filters.x + filters.width);
      expect(sideBox.x + sideBox.width).toBeLessThan(canvas.x + canvas.width*.35);
      expect(sideBox.y).toBeGreaterThanOrEqual(filters.y);
      expect(sideBox.y + sideBox.height).toBeLessThanOrEqual(filters.y + filters.height);
    }
   }else{
    expect(filters.y+filters.height).toBeLessThan(canvas.y+canvas.height*.3);
    expect(zoom.y).toBeGreaterThan(canvas.y+canvas.height*.7);
    expect(filters.width).toBeGreaterThan(filters.height);
    expect(zoom.width).toBeGreaterThan(zoom.height);
    expect(sideBox.x).toBeLessThan(canvas.x + canvas.width*.1);
    expect(sideBox.y + sideBox.height).toBeLessThanOrEqual(filters.y);
   }
   const centerClear=await page.evaluate(({x,y})=>Boolean(document.elementFromPoint(x,y)?.closest('.ul-map-svg')),{x:canvas.x+canvas.width/2,y:canvas.y+canvas.height/2});
   expect(centerClear).toBe(true);
   const blocked=await page.locator('.ul-map-controls button,.ul-zoom button,.ul-levels button,.ul-map-credit a').evaluateAll(buttons=>buttons.flatMap(button=>{
    const r=button.getBoundingClientRect();if(!r.width||!r.height)return[];
    const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    const bounds=button.closest('.utility-workspace')!.getBoundingClientRect();
    const fits=r.x>=bounds.left-1&&r.y>=bounds.top-1&&r.right<=bounds.right+1&&r.bottom<=bounds.bottom+1;
    return fits&&hit?.closest('button,a')===button?[]:[button.getAttribute('aria-label')||button.textContent];
   }));expect(blocked).toEqual([]);
   await page.getByRole('button',{name:'Zoom utility map in',exact:true}).click();
   const svg = page.locator('.ul-map-svg');
   const manualView = await svg.getAttribute('viewBox');
   const ct = teams.getByRole('button', {name:'CT side', exact:true});
   await ct.click();
   await expect(ct).toHaveAttribute('aria-pressed','true');
   await expect(svg).toHaveAttribute('viewBox', manualView!);
   const t = teams.getByRole('button', {name:'T side', exact:true});
   await t.focus();
   await t.press('Space');
   await expect(t).toHaveAttribute('aria-pressed','true');
   await expect(svg).toHaveAttribute('viewBox', manualView!);
  });
 });
}

test("both Cache CT Spawn markers for Garage are directly clickable in the 4:3 frame", async ({page}) => {
  await page.setViewportSize({width:1440,height:1080});
  await page.route(/^https:\/\//,route=>route.abort());
  await page.addInitScript(() => localStorage.setItem("ul:display", JSON.stringify({aspect:"4:3"})));
  const id="expanded-cs2tricks-cache-garage-from-ct-spawn-44f7-ct";
  await page.goto(`/#utilities?map=cache&side=CT&level=main&lineup=${id}`);
  const map = page.locator(".ul-map-svg");
  const initialCamera = await map.getAttribute("viewBox");
  await page.getByRole("button",{name:"Show throw locations on map",exact:true}).click();
  const spawns = page.getByRole("button",{name:"Throw from CT Spawn",exact:true});
  await expect(spawns).toHaveCount(2);
  for (const spawn of await spawns.all()) {
    const [guideId] = JSON.parse((await spawn.getAttribute("data-origin-recipes"))!);
    const hit = spawn.locator("circle").first();
    const box = (await hit.boundingBox())!;
    const center = {x:box.x + box.width/2, y:box.y + box.height/2};
    expect(await spawn.evaluate((node, {x,y}) => node.contains(document.elementFromPoint(x,y)), center)).toBe(true);
    await page.mouse.click(center.x,center.y);
    const close = page.getByRole("button",{name:"Close lineup media",exact:true});
    await expect(close).toBeVisible();
    expect(new URLSearchParams(new URL(page.url()).hash.split("?")[1]).get("lineup")).toBe(guideId);
    await close.click();
    await expect(map).toHaveAttribute("viewBox",initialCamera!);
  }
});

for(const [width,height] of [[740,360],[568,320]])test(`landscape phone puts all map tools within reach on both edges at ${width}px`, async ({page}) => {
 await page.setViewportSize({width,height});
 await page.goto('/#utilities?map=nuke&level=upper&side=T');
 await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 const buttons=page.locator('.ul-filter-dock button,.ul-map-bottom button,.ul-map-top button');
 const blocked=await buttons.evaluateAll(nodes => nodes.filter(button => {
   const r=button.getBoundingClientRect();
   return r.width<44 || r.height<44 || !button.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
 }).map(button=>button.getAttribute('aria-label')||button.textContent));
 expect(blocked).toEqual([]);
 await page.getByRole('button',{name:'CT side',exact:true}).click();
 await page.getByRole('button',{name:'Lower',exact:true}).click();
 await expect(page.locator('.ul-map-svg')).toHaveAttribute('aria-label','Nuke Lower utility map');
});

for(const width of [1440,320])test(`source-numbered spawn controls switch all five lineups with visible keys at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:width===320?844:1080});
 const image=await readFile('public/icons/icon-192.png');
 await page.route(/^https:\/\//,route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/png',body:image}):route.abort());
 const family=PUBLISHED_LINEUPS.filter(record=>record.spawn?.family==='ancient-ct-elbow-cs2tricks').sort((a,b)=>a.spawn!.slot-b.spawn!.slot);
 expect(family.length).toBe(5);
 await page.goto(`/#utilities?map=ancient&side=CT&level=main&lineup=${family[0].id}`);
 const viewer=page.locator('.ul-media-dialog');
 await expect(viewer).toBeVisible();
 for(const [index,record] of family.entries()){
  await expect(viewer.locator('#lineup-media-title')).toHaveText(record.title);
  await expect(viewer.locator('.ul-spawn-switch')).toContainText(record.spawn!.label);
  await expect(viewer.locator('.ul-viewer-keys')).toContainText('Shift');
  await expect(viewer.locator('.ul-viewer-keys')).toContainText('W');
  const clipped=await viewer.locator('.ul-media-heading-actions button').evaluateAll(buttons=>buttons.flatMap(button=>{
   const r=button.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
   return r.x<0||r.right>innerWidth+1||hit?.closest('button')!==button?[button.getAttribute('aria-label')]:[];
  }));expect(clipped).toEqual([]);
  if(index<family.length-1)await viewer.getByRole('button',{name:'Next spawn lineup',exact:true}).click();
 }
 await expect(viewer.getByRole('button',{name:'Next spawn lineup',exact:true})).toBeDisabled();
 await viewer.getByRole('button',{name:'Previous spawn lineup',exact:true}).click();
 await expect(viewer.locator('#lineup-media-title')).toHaveText(family[3].title);
});
