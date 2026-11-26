import {expect,test} from "@playwright/test";

test("the workspace dialog hides its scrollbar while its last section stays reachable", async ({page}) => {
  await page.setViewportSize({width:960,height:540});
  await page.goto("/#utilities");
  await page.getByRole("button",{name:"Workspace settings",exact:true}).click();
  const dialog=page.getByRole("dialog",{name:"Your workspace"});
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("scrollbar-width","none");
  await expect(page.locator("html")).toHaveCSS("scrollbar-width","none");
  expect(await dialog.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
  expect(await dialog.evaluate(el=>el.offsetWidth-el.clientWidth)).toBe(0);
  await dialog.hover();
  await page.mouse.wheel(0,900);
  await expect.poll(()=>dialog.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await expect(dialog.getByRole("heading",{name:"On this device"})).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("map chooser blends scroll edges into its surface and retains wheel and keyboard scrolling", async ({page}) => {
  await page.setViewportSize({width:1024,height:560});
  await page.goto("/#utilities");
  await page.getByRole("button",{name:"Change map",exact:true}).click();
  const grid=page.getByRole("navigation",{name:"Choose map"});
  await expect(grid).toHaveAttribute("data-scroll-after","");
  await expect(grid).not.toHaveAttribute("data-scroll-before","");
  await expect(grid).toHaveCSS("scrollbar-width","none");
  await grid.hover();
  await page.mouse.wheel(0,140);
  await expect(grid).toHaveAttribute("data-scroll-before","");
  await grid.focus();
  await grid.press("End");
  await expect(grid).not.toHaveAttribute("data-scroll-after","");
  await grid.press("Home");
  await expect(grid).not.toHaveAttribute("data-scroll-before","");
  await page.getByRole("textbox",{name:"Search maps"}).fill("Mirage");
  await expect(grid.getByRole("button")).toHaveCount(1);
  await expect(grid).not.toHaveAttribute("data-scroll-after","");
  await page.getByRole("textbox",{name:"Search maps"}).fill("");
  await expect(grid).toHaveAttribute("data-scroll-after","");
  await page.emulateMedia({forcedColors:"active"});
  await expect(grid).toHaveCSS("scrollbar-width","none");
  await expect(grid).toHaveCSS("mask-image","none");
});

test.describe("touch map picker",()=>{
  test.use({viewport:{width:320,height:640},isMobile:true,hasTouch:true});
  test("swiping the map grid reveals the last selectable map",async({page,browserName})=>{
    test.skip(browserName!=="chromium","Native touch drag uses Chromium's touchscreen protocol.");
    await page.goto("/#utilities");
    await page.getByRole("button",{name:"Change map",exact:true}).tap();
    const grid=page.getByRole("navigation",{name:"Choose map"});
    const client=await page.context().newCDPSession(page);
    const box=(await grid.boundingBox())!;
    const point={x:box.x+box.width/2,y:box.y+box.height*.82};
    await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[point]});
    for(let step=1;step<=8;step++){
      await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{...point,y:point.y-step*box.height*.08}]});
    }
    await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    await expect(grid).toHaveAttribute("data-scroll-before","");
    await grid.getByRole("button",{name:"Vertigo FACEIT"}).tap();
    await expect(page.getByRole("button",{name:"Change map",exact:true})).toContainText("Vertigo");
  });
});
