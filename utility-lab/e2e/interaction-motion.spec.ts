import {test,expect,type Page} from "@playwright/test";

test.use({serviceWorkers:"block"});

async function observeMotion(page:Page) {
  await page.evaluate(()=>{
    const events:{property:string;input:string|undefined}[]=[];
    Object.assign(window,{tabMotionEvents:events});
    document.addEventListener("transitionrun",event=>{
      if(event.target instanceof Element&&event.target.matches(".nav-active-indicator"))
        events.push({property:event.propertyName,input:document.documentElement.dataset.navigationInput});
    });
  });
}
async function settle(page:Page) {
  await page.locator(".nav-active-indicator").evaluateAll(elements=>Promise.allSettled(
    elements.flatMap(element=>element.getAnimations().map(animation=>animation.finished))));
}
async function geometry(page:Page) {
  return page.locator("svg.tb-map").evaluate((svg:SVGSVGElement)=>{
    const matrix=svg.getScreenCTM()!;
    return {viewBox:svg.getAttribute("viewBox"),matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f]};
  });
}

test("pointer tab switching moves one underline without changing the map frame",async({page})=>{
  await page.goto("/#board");
  await expect(page.locator("svg.tb-map")).toBeVisible();
  const before=await geometry(page);
  await observeMotion(page);
  const nav=page.getByRole("tablist",{name:"Main navigation",exact:true});
  await nav.getByRole("tab",{name:"Stats",exact:true}).click();
  await expect(nav.getByRole("tab",{name:"Stats",exact:true})).toHaveAttribute("aria-selected","true");
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {tabMotionEvents:{property:string}[]}).tabMotionEvents.some(event=>event.property==="transform"))).toBe(true);
  await settle(page);
  const active=(await nav.getByRole("tab",{name:"Stats",exact:true}).boundingBox())!;
  const indicator=(await nav.locator(".nav-active-indicator").boundingBox())!;
  expect(Math.abs(active.x-indicator.x)).toBeLessThan(.5);
  expect(Math.abs(active.width-indicator.width)).toBeLessThan(.5);
  await nav.getByRole("tab",{name:"Tactic board",exact:true}).click();
  await expect(page.locator("svg.tb-map")).toBeVisible();
  await settle(page);
  expect(await geometry(page)).toEqual(before);
  expect(await page.locator("svg.tb-map").evaluate(element=>element.getAnimations().length)).toBe(0);
});

test("keyboard navigation cancels pointer motion and skips the disabled tab instantly",async({page})=>{
  await page.goto("/#board");
  const nav=page.getByRole("tablist",{name:"Main navigation",exact:true});
  await nav.getByRole("tab",{name:"Stats",exact:true}).click();
  await settle(page);
  await observeMotion(page);
  await nav.getByRole("tab",{name:"Stats",exact:true}).press("Home");
  await expect(nav.getByRole("tab",{name:"Tactic board",exact:true})).toBeFocused();
  await nav.getByRole("tab",{name:"Tactic board",exact:true}).press("ArrowRight");
  await expect(nav.getByRole("tab",{name:"Lineups",exact:true})).toHaveAttribute("aria-selected","true");
  await nav.getByRole("tab",{name:"Lineups",exact:true}).press("ArrowRight");
  await expect(nav.getByRole("tab",{name:"Stats",exact:true})).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-navigation-input","keyboard");
  expect(await page.evaluate(()=>(window as unknown as {tabMotionEvents:unknown[]}).tabMotionEvents)).toEqual([]);
  expect(await nav.locator(".nav-active-indicator").evaluate(element=>element.getAnimations().length)).toBe(0);
});

test("reduced motion changes tabs without an animated indicator",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/#board");
  await observeMotion(page);
  const nav=page.getByRole("tablist",{name:"Main navigation",exact:true});
  await nav.getByRole("tab",{name:"Stats",exact:true}).click();
  await expect(nav.getByRole("tab",{name:"Stats",exact:true})).toHaveAttribute("aria-selected","true");
  expect(await nav.locator(".nav-active-indicator").evaluate(element=>element.getAnimations().length)).toBe(0);
  expect(await page.evaluate(()=>(window as unknown as {tabMotionEvents:unknown[]}).tabMotionEvents)).toEqual([]);
});

test("phone tab feedback fits the selected tab without layout movement",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/#board");
  await observeMotion(page);
  const nav=page.getByRole("tablist",{name:"Workspace tabs",exact:true}),before=await nav.boundingBox();
  await nav.getByRole("tab",{name:"Stats",exact:true}).click();
  await expect(nav.getByRole("tab",{name:"Stats",exact:true})).toHaveAttribute("aria-selected","true");
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {tabMotionEvents:{property:string}[]}).tabMotionEvents.some(event=>event.property==="transform"))).toBe(true);
  await settle(page);
  const active=(await nav.getByRole("tab",{name:"Stats",exact:true}).boundingBox())!,indicator=(await nav.locator(".nav-active-indicator").boundingBox())!;
  expect(Math.abs(indicator.x-active.x-12)).toBeLessThan(.5);
  expect(Math.abs(indicator.width-active.width+24)).toBeLessThan(.5);
  expect(await nav.boundingBox()).toEqual(before);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
});
