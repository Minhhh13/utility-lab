import {test,expect} from "@playwright/test";

test.use({serviceWorkers:"block",reducedMotion:"reduce"});

test("Playbooks is visibly staged on Home and direct links keep saved data",async({page},info)=>{
  const stored=JSON.stringify([{id:"retained-book",name:"Keep this round",notes:"Wait for the call.",tacticIds:[],lineupIds:[],steps:[]}]);
  await page.addInitScript(stored=>localStorage.setItem("utility-lab:playbooks:v1",stored),stored);
  await page.goto("/#home");
  const destination=page.getByRole("button",{name:"Playbooks",exact:true});
  await expect(destination).toBeDisabled();
  await expect(destination).toContainText("Coming soon");
  const before=page.url();
  await destination.evaluate((button:HTMLButtonElement)=>button.click());
  expect(page.url()).toBe(before);
  await page.goto("/#playbooks");
  await expect(page.getByRole("region",{name:"Playbooks",exact:true})).toContainText("Coming soon");
  await expect(page.getByRole("button",{name:"New playbook",exact:true})).toHaveCount(0);
  await expect(page.getByRole("tab",{name:"Playbooks",exact:true})).toBeDisabled();
  expect(await page.evaluate(()=>localStorage.getItem("utility-lab:playbooks:v1"))).toBe(stored);
  await expect(page.getByRole("button",{name:"Workspace settings",exact:true})).toBeEnabled();
  await page.screenshot({path:info.outputPath("playbooks-coming-soon-desktop.png")});
});

test("keyboard workspace navigation skips the disabled Playbooks tab",async({page})=>{
  await page.goto("/#board");
  const board=page.getByRole("tab",{name:"Tactic board",exact:true});
  const utilities=page.getByRole("tab",{name:"Lineups",exact:true});
  const stats=page.getByRole("tab",{name:"Stats",exact:true});
  await board.focus();await board.press("ArrowRight");
  await expect(utilities).toBeFocused();
  await utilities.press("ArrowRight");await expect(stats).toBeFocused();
  await stats.press("ArrowLeft");await expect(utilities).toBeFocused();
  await utilities.press("End");await expect(stats).toBeFocused();
  await stats.press("Home");await expect(board).toBeFocused();
  await expect(page.getByRole("tab",{name:"Playbooks",exact:true})).toHaveAttribute("tabindex","-1");
});

test("Coming soon labels and placeholder fit narrow phones in both themes",async({page},info)=>{
  await page.setViewportSize({width:320,height:640});
  for(const mode of ["light","dark"]){
    await page.addInitScript(mode=>localStorage.setItem("ul:appearance",JSON.stringify({mode,palette:"cobalt"})),mode);
    await page.goto("/#home");
    await expect(page.getByRole("button",{name:"Playbooks",exact:true})).toContainText("Coming soon");
    await expect(page.getByRole("button",{name:"Playbooks",exact:true})).toBeInViewport();
    await page.goto("/#playbooks");
    const tab=page.getByRole("tab",{name:"Playbooks",exact:true});
    await expect(tab).toBeDisabled();await expect(tab).toContainText("Coming soon");
    const disabledColour=await tab.evaluate(element=>getComputedStyle(element).color);
    expect(await tab.locator("svg").evaluate(element=>getComputedStyle(element).color)).toBe(disabledColour);
    expect(disabledColour).toBe(await page.locator(".playbooks-coming-soon p").evaluate(element=>getComputedStyle(element).color));
    await expect(tab).toBeInViewport();
    await expect(page.getByRole("region",{name:"Playbooks",exact:true})).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
    await page.screenshot({path:info.outputPath(`playbooks-coming-soon-${mode}-320.png`)});
  }
});
