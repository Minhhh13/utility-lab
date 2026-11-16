import {test, expect, type Locator, type Page} from "@playwright/test";
import {readFileSync} from "node:fs";
import {GUIDE_LIBRARY} from "../src/guide-library";
import type {UtilityReference} from "../src/utility-data";

test.use({serviceWorkers:"block"});

const guide=GUIDE_LIBRARY.find(record=>record.id==="compendium-mirage-palace-jungle")!;
if(!guide)throw new Error("Missing bundled photo-wheel fixture");
const aimGuide=(JSON.parse(readFileSync(new URL("../src/data/expanded/nuke.json",import.meta.url),"utf8")) as UtilityReference[])
  .find(record=>record.id==="expanded-cs2nades-nuke-b-retake-flash-ambxvjoxmg8")!;
if(!aimGuide)throw new Error("Missing bundled cropped aim fixture");

async function openPhotos(page:Page,record:UtilityReference=guide){
  await page.route(/^https:\/\//,route=>route.abort());
  await page.goto(`/#utilities?${new URLSearchParams({map:record.mapId,level:record.levelId,side:record.side,lineup:record.id})}`);
  const viewer=page.getByRole("dialog",{name:record.title,exact:true});
  await expect(viewer).toBeVisible();
  const image=viewer.locator(".ul-photo-canvas img");
  await image.evaluate(async(element:HTMLImageElement)=>element.decode());
  await expect(image).toHaveCSS("opacity","1");
  await expect(viewer.getByRole("button",{name:"Fit photo",exact:true})).toContainText("100%");
  return viewer;
}

async function geometry(viewport:Locator,point?:{x:number;y:number}){
  return viewport.evaluate((element:HTMLElement,cursor)=>{
    const frame=element.parentElement!.getBoundingClientRect();
    const canvas=element.querySelector(".ul-photo-canvas")!.getBoundingClientRect();
    const box=element.getBoundingClientRect();
    const x=cursor?cursor.x-box.x:box.width/2;
    const y=cursor?cursor.y-box.y:box.height/2;
    return {
      frame:{width:frame.width,height:frame.height},
      canvas:{width:canvas.width,height:canvas.height},
      sourceX:(element.scrollLeft+x)/(canvas.width/frame.width),
      sourceY:(element.scrollTop+y)/(canvas.height/frame.height),
      left:element.scrollLeft,top:element.scrollTop,
      scrollWidth:element.scrollWidth,scrollHeight:element.scrollHeight,
      clientWidth:element.clientWidth,clientHeight:element.clientHeight,
      pageLeft:window.scrollX,pageTop:window.scrollY,
    };
  },point);
}

test("wheel zoom keeps the pointed photo detail in place and the adjacent buttons remain usable",async({page})=>{
  const viewer=await openPhotos(page);
  const viewport=viewer.locator(".ul-photo-viewport");
  const fit=viewer.getByRole("button",{name:"Fit photo",exact:true});
  const out=await viewer.getByRole("button",{name:"Zoom out photo",exact:true}).boundingBox();
  const inside=await viewer.getByRole("button",{name:"Zoom in photo",exact:true}).boundingBox();
  expect(out).not.toBeNull();expect(inside).not.toBeNull();
  expect(inside!.x-(out!.x+out!.width)).toBeLessThanOrEqual(2);
  expect(out!.width).toBeGreaterThanOrEqual(44);expect(inside!.width).toBeGreaterThanOrEqual(44);
  const box=(await viewport.boundingBox())!;
  const point={x:box.x+box.width*.6,y:box.y+box.height*.4};
  const before=await geometry(viewport,point);
  await page.mouse.move(point.x,point.y);
  await page.mouse.wheel(0,-160);
  await expect.poll(async()=>parseInt(await fit.innerText(),10)).toBeGreaterThan(140);
  const after=await geometry(viewport,point);
  expect(Math.abs(after.sourceX-before.sourceX)).toBeLessThan(3);
  expect(Math.abs(after.sourceY-before.sourceY)).toBeLessThan(3);
  expect(after.frame).toEqual(before.frame);
  expect(after.pageTop).toBe(before.pageTop);expect(after.pageLeft).toBe(before.pageLeft);
  await viewport.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(async()=>(await geometry(viewport)).left).toBeGreaterThan(after.left);
  await fit.click();
  await expect(fit).toContainText("100%");
  const reset=await geometry(viewport);
  expect(reset.left).toBe(0);expect(reset.top).toBe(0);
  expect(reset.scrollWidth).toBeLessThanOrEqual(reset.clientWidth+1);
  expect(reset.scrollHeight).toBeLessThanOrEqual(reset.clientHeight+1);
});

test("rapid wheel bursts, line/page deltas and photo changes stay bounded without photo-fit feedback",async({page})=>{
  const viewer=await openPhotos(page);
  const viewport=viewer.locator(".ul-photo-viewport");
  const fit=viewer.getByRole("button",{name:"Fit photo",exact:true});
  const before=await geometry(viewport);
  const box=(await viewport.boundingBox())!;
  const point={clientX:box.x+box.width/2,clientY:box.y+box.height/2};
  await viewport.dispatchEvent("wheel",{...point,deltaY:-3,deltaMode:1,bubbles:true,cancelable:true});
  await expect(fit).toContainText("113%");
  await fit.click();
  await viewport.dispatchEvent("wheel",{...point,deltaY:-1,deltaMode:2,bubbles:true,cancelable:true});
  await expect.poll(async()=>parseInt(await fit.innerText(),10)).toBeGreaterThan(100);
  await viewport.evaluate(element=>{
    const box=element.getBoundingClientRect();
    for(let i=0;i<20;i++)element.dispatchEvent(new WheelEvent("wheel",{deltaY:-120,clientX:box.x+box.width/2,clientY:box.y+box.height/2,bubbles:true,cancelable:true}));
  });
  await expect(fit).toContainText("400%");
  await expect(viewer.getByRole("button",{name:"Zoom in photo",exact:true})).toBeDisabled();
  const zoomed=await geometry(viewport);
  expect(zoomed.frame).toEqual(before.frame);
  const samples=await viewport.evaluate(async element=>{
    const result=[];
    for(let i=0;i<8;i++){
      await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
      const box=element.querySelector(".ul-photo-canvas")!.getBoundingClientRect();
      result.push({width:box.width,height:box.height,left:element.scrollLeft,top:element.scrollTop});
    }
    return result;
  });
  expect(samples.every(sample=>sample.width===samples[0].width&&sample.height===samples[0].height&&sample.left===samples[0].left&&sample.top===samples[0].top)).toBe(true);
  await viewport.evaluate(element=>{
    const box=element.getBoundingClientRect();
    for(let i=0;i<20;i++)element.dispatchEvent(new WheelEvent("wheel",{deltaY:120,clientX:box.x+box.width/2,clientY:box.y+box.height/2,bubbles:true,cancelable:true}));
  });
  await expect(fit).toContainText("100%");
  await expect(viewer.getByRole("button",{name:"Zoom out photo",exact:true})).toBeDisabled();
  await viewer.getByRole("button",{name:"Zoom in photo",exact:true}).click();
  await expect(fit).toContainText("150%");
  await viewer.locator(".ul-photo-caption").hover();
  await page.mouse.wheel(0,-120);
  await expect(fit).toContainText("150%");
  await viewer.getByRole("button",{name:"Next photo",exact:true}).click();
  await expect(fit).toContainText("100%");
  await expect(viewer.locator(".ul-photo-kind")).toContainText("Aim");
});

test("photo zoom controls stay grouped and fit a narrow phone",async({page})=>{
  await page.setViewportSize({width:320,height:640});
  const viewer=await openPhotos(page,aimGuide);
  await viewer.getByRole("button",{name:"Next photo",exact:true}).click();
  await expect(viewer.getByRole("img",{name:"Aim here",exact:true})).toBeVisible();
  const toolbar=viewer.locator(".ul-photo-toolbar");
  await expect(toolbar.getByRole("button",{name:/^Photos/})).toBeVisible();
  await expect(toolbar.getByRole("button",{name:"Video",exact:true})).toBeVisible();
  const buttons=await toolbar.getByRole("button").all();
  expect(buttons).toHaveLength(6);
  for(const button of buttons){
    await expect(button).toBeInViewport();
    const geometry=await button.evaluate(element=>{
      const button=element.getBoundingClientRect();
      const toolbar=element.closest(".ul-photo-toolbar")!.getBoundingClientRect();
      const hit=document.elementFromPoint(button.x+button.width/2,button.y+button.height/2);
      return {
        width:button.width,height:button.height,
        contained:button.left>=toolbar.left&&button.right<=toolbar.right&&button.top>=toolbar.top&&button.bottom<=toolbar.bottom,
        receivesCenterHit:hit?.closest("button")===element,
      };
    });
    expect(geometry.width).toBeGreaterThanOrEqual(44);expect(geometry.height).toBeGreaterThanOrEqual(44);
    expect(geometry.contained).toBe(true);expect(geometry.receivesCenterHit).toBe(true);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
  const bounds=await viewer.locator(".ul-photo-viewport").boundingBox();
  expect(bounds!.width).toBeGreaterThan(100);expect(bounds!.height).toBeGreaterThan(90);
  await toolbar.getByRole("button",{name:"Video",exact:true}).click();
  await expect(viewer.getByRole("button",{name:"Load video",exact:true})).toBeVisible();
  await viewer.getByRole("button",{name:/^Photos/}).click();
  await expect(viewer.getByRole("img",{name:"Aim here",exact:true})).toBeVisible();
});
