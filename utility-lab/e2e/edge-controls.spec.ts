import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {PUBLISHED_LINEUPS} from './catalogue-fixtures';

for(const size of [{width:1440,height:1080},{width:1280,height:960},{width:1920,height:1080},{width:320,height:844},{width:390,height:844}]){
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
    expect(sideBox.x).toBeGreaterThan(canvas.x + canvas.width*.65);
    expect(sideBox.y + sideBox.height).toBeLessThanOrEqual(zoom.y);
   }else{
    expect(filters.y+filters.height).toBeLessThan(canvas.y+canvas.height*.3);
    expect(zoom.y).toBeGreaterThan(canvas.y+canvas.height*.7);
    expect(filters.width).toBeGreaterThan(filters.height);
    expect(zoom.width).toBeGreaterThan(zoom.height);
    expect(sideBox.y).toBeGreaterThan(canvas.y + canvas.height*.7);
    expect(sideBox.x + sideBox.width).toBeLessThanOrEqual(zoom.x);
   }
   const centerClear=await page.evaluate(({x,y})=>Boolean(document.elementFromPoint(x,y)?.closest('.ul-map-svg')),{x:canvas.x+canvas.width/2,y:canvas.y+canvas.height/2});
   expect(centerClear).toBe(true);
   const blocked=await page.locator('.ul-map-controls button,.ul-zoom button,.ul-side-toggle button').evaluateAll(buttons=>buttons.flatMap(button=>{
    const r=button.getBoundingClientRect();if(!r.width||!r.height)return[];
    const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return hit?.closest('button')===button?[]:[button.getAttribute('aria-label')||button.textContent];
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

for(const [width,height] of [[740,360],[568,320]])test(`landscape phone puts all map tools within reach on both edges at ${width}px`, async ({page}) => {
 await page.setViewportSize({width,height});
 await page.goto('/#utilities?map=nuke&level=upper&side=T');
 await expect(page.locator('.utility-workspace')).toHaveAttribute('aria-busy','false');
 const buttons=page.locator('.ul-filterbar button,.ul-map-bottom button,.ul-map-top button');
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
