import {test,expect,type Page,type Locator} from "@playwright/test";

test.use({serviceWorkers:"block"});

async function observePress(page:Page) {
  await page.evaluate(()=>{
    const activations:{label:string; properties:string[]}[]=[];
    Object.assign(window,{pressObservations:activations});
    document.addEventListener("click",event=>{
      if (!(event.target instanceof Element)) return;
      const target=event.target.closest("button,summary,a,[role=button],[role=option],label");
      if (!target) return;
      const motion=target.getAnimations().find(item=>item.id==="control-press");
      if (!(motion?.effect instanceof KeyframeEffect)) return;
      const properties=motion.effect.getKeyframes().flatMap(frame=>Object.keys(frame))
        .filter(key=>!["offset","computedOffset","composite","easing"].includes(key));
      activations.push({label:target.getAttribute("aria-label")||target.textContent?.trim()||"",properties});
    },true);
  });
}

const pressLogs=(page:Page)=>page.evaluate(()=>(window as unknown as {
  pressObservations:{label:string;properties:string[]}[];
}).pressObservations);

test("pointer presses reach each appearance choice and repeated presses without moving the map",async({page})=>{
  await page.goto("/#board");
  await expect(page.locator("svg.tb-map")).toBeVisible();
  await observePress(page);
  const before=await geometry(page);
  await page.getByLabel("Appearance",{exact:true}).click();
  for(const mode of ["Dark","System","Light"]){
    await page.getByRole("button",{name:mode+" mode",exact:true}).click();
    await expect(page.locator(".theme-choices")).toHaveAttribute("data-mode",mode.toLowerCase());
  }
  for(const palette of ["Ember","Rose","Mint","Cobalt","Cobalt"]){
    await page.getByRole("button",{name:palette+" palette",exact:true}).click();
  }
  const logs=await pressLogs(page);
  expect(logs.map(item=>item.label)).toEqual(["Appearance","Dark mode","System mode","Light mode",
    "Ember palette","Rose palette","Mint palette","Cobalt palette","Cobalt palette"]);
  expect(logs.every(item=>item.properties.includes("opacity")&&!item.properties.includes("transform"))).toBe(true);
  expect(await geometry(page)).toEqual(before);

  await page.getByLabel("Appearance",{exact:true}).press("Escape");
  await page.getByRole("button",{name:"Workspace settings",exact:true}).click();
  await page.getByRole("button",{name:"Close workspace settings",exact:true}).click();
  expect((await pressLogs(page)).slice(-2).map(item=>item.label)).toEqual(["Workspace settings","Close workspace settings"]);
});

test("keyboard and reduced-motion settings skip press and palette animations",async({page})=>{
  await page.goto("/#board");
  await expect(page.locator("svg.tb-map")).toBeVisible();
  await observePress(page);
  await page.getByLabel("Appearance",{exact:true}).press("Enter");
  const mint=page.getByRole("button",{name:"Mint palette"});
  await mint.press("Space");
  await expect(mint).toHaveAttribute("aria-pressed","true");
  expect(await mint.locator("svg").evaluate(el=>el.getAnimations().length)).toBe(0);
  await page.emulateMedia({reducedMotion:"reduce"});
  const rose=page.getByRole("button",{name:"Rose palette"});
  await rose.click();
  await expect(rose).toHaveAttribute("aria-pressed","true");
  expect(await rose.locator("svg").evaluate(el=>el.getAnimations().length)).toBe(0);
  expect(await pressLogs(page)).toEqual([]);
});

test("pointer feedback follows actual actions across all five workspaces and preserves the lineup camera",async({page})=>{
  await page.setViewportSize({width:1440,height:1080});
  await page.goto("/#home");
  const board=page.getByRole("button",{name:"Tactic board",exact:true});
  await expect(board).toBeVisible();
  await observePress(page);
  async function press(action:Locator,hit=action) {
    const before=(await pressLogs(page)).length;
    await hit.click();
    expect((await pressLogs(page)).length).toBe(before+1);
  }
  await press(board);
  await press(page.getByRole("group",{name:"Drawing tools",exact:true}).locator("button:enabled").first());
  const tabs=page.getByRole("tablist",{name:"Main navigation"});
  await press(tabs.getByRole("tab",{name:"Lineups",exact:true}));
  await expect(page.locator(".utility-workspace")).toHaveAttribute("aria-busy","false");
  const map=page.locator(".ul-map-svg"),oldView=await map.getAttribute("viewBox");
  const pin=page.locator(".ul-map-marker").first();
  await press(pin,pin.locator(".ul-marker-hit"));
  expect(await map.getAttribute("viewBox")).toBe(oldView);
  await press(tabs.getByRole("tab",{name:"Playbooks",exact:true}));
  await press(page.getByRole("button",{name:"New playbook",exact:true}));
  await press(tabs.getByRole("tab",{name:"Stats",exact:true}));
  await press(page.getByRole("button",{name:"Filter statistics to Mirage",exact:true}));
});

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
