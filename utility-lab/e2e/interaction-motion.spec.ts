import {test,expect,type Page,type Locator} from "@playwright/test";

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

async function expectTabUnderline(nav:Locator,phone=false) {
  const tab=nav.getByRole("tab",{selected:true});
  const button=(await tab.boundingBox())!;
  const icon=(await tab.locator("svg").boundingBox())!;
  const last=phone?icon:(await tab.locator(".nav-tab-content > span").boundingBox())!;
  const underline=(await nav.locator(".nav-active-indicator").boundingBox())!;
  expect(Math.abs(underline.x-icon.x)).toBeLessThan(.6);
  expect(Math.abs((underline.x+underline.width)-(last.x+last.width))).toBeLessThan(.6);
  expect(button.width).toBeGreaterThanOrEqual(44);
  expect(button.height).toBeGreaterThanOrEqual(44);
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
  await expectTabUnderline(nav);
  await nav.getByRole("tab",{name:"Tactic board",exact:true}).click();
  await expect(page.locator("svg.tb-map")).toBeVisible();
  await settle(page);
  expect(await geometry(page)).toEqual(before);
  expect(await page.locator("svg.tb-map").evaluate(element=>element.getAnimations().length)).toBe(0);
});

test("keyboard navigation cancels pointer motion and opens Playbooks instantly",async({page})=>{
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
  await expect(nav.getByRole("tab",{name:"Playbooks",exact:true})).toBeFocused();
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
  await expectTabUnderline(nav,true);
  expect(await nav.boundingBox()).toEqual(before);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
});

for(const mode of ["light","dark"] as const) test(`all four tab underlines fit their content in ${mode} mode across header layouts`,async({page})=>{
  test.slow(); // Three viewports, each with four complete workspace routes.
  await page.addInitScript(mode=>{
    localStorage.setItem("ul:appearance",JSON.stringify({mode,palette:"cobalt"}));
    localStorage.setItem("ul:display",JSON.stringify({aspect:"4:3"}));
  },mode);
  await page.emulateMedia({reducedMotion:"reduce"});
  for(const [width,height] of [[320,568],[721,900],[1440,1080]]){
    await page.setViewportSize({width,height});
    await page.goto("/#board");
    await expect(page.locator("html")).toHaveAttribute("data-theme",mode);
    await page.evaluate(()=>document.fonts.ready);
    const phone=width<721;
    const nav=page.getByRole("tablist",{name:phone?"Workspace tabs":"Main navigation",exact:true});
    for(const name of ["Tactic board","Lineups","Playbooks","Stats"]){
      const tab=nav.getByRole("tab",{name,exact:true});
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected","true");
      await expectTabUnderline(nav,phone);
    }
    const header=page.locator(".studio-header");
    expect(await header.evaluate(el=>el.scrollWidth)).toBeLessThanOrEqual(width);
    if(!phone){
      const brand=(await header.getByRole("link",{name:"Utility Lab home"}).boundingBox())!;
      const firstIcon=(await nav.getByRole("tab").first().locator("svg").boundingBox())!;
      const brandGap=firstIcon.x-(brand.x+brand.width);
      expect(brandGap).toBeGreaterThanOrEqual(8);
      expect(brandGap).toBeLessThanOrEqual(32);
    }
  }
});
