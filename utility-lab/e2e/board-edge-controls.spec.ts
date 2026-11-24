import {test,expect,type Page} from "@playwright/test";

test.use({serviceWorkers:"block"});

async function start(page:Page) {
  await page.goto("/#board");
  await expect(page.locator("svg.tb-map image")).toHaveAttribute("href",/mirage/);
}

for(const viewport of [{width:1440,height:1080},{width:1280,height:960}]) {
  test(`board tools and zoom leave the 4:3 map clear at ${viewport.width}×${viewport.height}`,async({page},info)=>{
    await page.setViewportSize(viewport);
    await start(page);
    const stage=page.locator(".tb-map-stage"),tools=page.getByRole("group",{name:"Drawing tools",exact:true});
    const zoom=page.getByRole("group",{name:"Map zoom",exact:true});
    const area=(await page.locator(".tb-canvas-area").boundingBox())!;
    const mapBox=(await stage.boundingBox())!,toolBox=(await tools.boundingBox())!,zoomBox=(await zoom.boundingBox())!;
    expect(toolBox.height).toBeGreaterThan(toolBox.width*2);
    expect(toolBox.x+toolBox.width).toBeLessThan(mapBox.x);
    expect(zoomBox.x).toBeGreaterThan(mapBox.x+mapBox.width);
    expect(mapBox.height).toBeGreaterThan(area.height-80);
    expect(toolBox.y).toBeGreaterThanOrEqual(area.y);
    expect(toolBox.y+toolBox.height).toBeLessThanOrEqual(area.y+area.height);
    for(const button of [...await tools.getByRole("button").all(),...await zoom.getByRole("button").all()]) {
      const box=(await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest("svg.tb-map"),
      {x:mapBox.x+mapBox.width/2,y:mapBox.y+mapBox.height-16})).toBe(true);
    await page.getByRole("button",{name:"Clear board",exact:true}).click();
    const canvas=page.locator("svg.tb-map"),view=await canvas.getAttribute("viewBox");
    await page.getByRole("button",{name:"Smoke (S)",exact:true}).click();
    await canvas.press("Enter");
    await expect(canvas.locator('[data-object-id]')).toHaveCount(1);
    await expect(canvas).toHaveAttribute("viewBox",view!);
    await page.getByRole("button",{name:"Undo",exact:true}).click();
    await expect(canvas.locator('[data-object-id]')).toHaveCount(0);
    await zoom.getByRole("button",{name:"Zoom in",exact:true}).click();
    await expect(canvas).not.toHaveAttribute("viewBox",view!);
    await zoom.getByRole("button",{name:"Fit map",exact:true}).click();
    await expect(canvas).toHaveAttribute("viewBox",view!);
    await page.getByRole("button",{name:"Draw (P)",exact:true}).click();
    await page.getByRole("button",{name:"Drawing colour",exact:true}).click();
    const ink=page.getByRole("dialog",{name:"Drawing colour choices"});
    await expect(ink).toBeVisible();
    const inkBox=(await ink.boundingBox())!;
    expect(inkBox.x).toBeGreaterThan(toolBox.x);
    expect(inkBox.x+inkBox.width).toBeLessThanOrEqual(viewport.width);
    expect(inkBox.y+inkBox.height).toBeLessThanOrEqual(viewport.height);
    await ink.getByRole("button",{name:"Red",exact:true}).click();
    await page.screenshot({path:info.outputPath(`board-edges-${viewport.width}.png`)});
    await page.getByRole("button",{name:"Open round plan",exact:true}).click();
    await expect(page.locator(".tb-inspector")).toBeVisible();
    expect((await tools.boundingBox())!.x+(await tools.boundingBox())!.width).toBeLessThan((await stage.boundingBox())!.x);
    await page.screenshot({path:info.outputPath(`board-edges-${viewport.width}-panel.png`)});
  });
}

for(const width of [320,390]) {
  test(`phone board keeps touch tools outside the map at ${width}px`,async({page},info)=>{
    await page.setViewportSize({width,height:844});
    await start(page);
    const tools=page.getByRole("group",{name:"Drawing tools",exact:true});
    const stage=(await page.locator(".tb-map-stage").boundingBox())!,toolBox=(await tools.boundingBox())!;
    expect(toolBox.y).toBeGreaterThanOrEqual(stage.y+stage.height);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for(const button of await tools.getByRole("button").all()) {
      const box=(await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x+box.width).toBeLessThanOrEqual(width);
    }
    await page.getByRole("button",{name:"Draw (P)",exact:true}).click();
    await page.getByRole("button",{name:"Drawing colour",exact:true}).click();
    const ink=page.getByRole("dialog",{name:"Drawing colour choices"});
    await expect(ink).toBeVisible();
    const box=(await ink.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x+box.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button",{name:"Drawing colour",exact:true})).toBeFocused();
    await page.screenshot({path:info.outputPath(`board-edges-phone-${width}.png`),fullPage:true});
  });
}
