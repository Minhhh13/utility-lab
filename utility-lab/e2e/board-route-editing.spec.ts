import { expect, test, type Page } from "@playwright/test";
import { emptyPlan, type XY } from "../src/board-model";

const draftKey = "utility-lab:draft:v1:mirage:main";

async function openRoute(page: Page, points: XY[]) {
  const plan = emptyPlan("mirage", "main");
  plan.objects.push({ id: "route-to-edit", kind: "route", x: 0, y: 0, points, color: "#f16b75", label: "Entry path" });
  await page.addInitScript(({ draftKey, plan }) => {
    if (!localStorage.getItem(draftKey)) localStorage.setItem(draftKey, JSON.stringify(plan));
  }, { draftKey, plan });
  await page.goto("/#board");
  await expect(page.locator("[data-object-id='route-to-edit']")).toBeVisible();
}

async function screen(page: Page, point: XY) {
  return page.locator("svg.tb-map").evaluate((svg: SVGSVGElement, p) => {
    const location = new DOMPoint(p.x, p.y).matrixTransform(svg.getScreenCTM()!);
    return { x: location.x, y: location.y };
  }, point);
}

async function savedPoints(page: Page) {
  // The saved draft is also the representation used by JSON and portable shares.
  await expect(page.locator(".tb-draft-status")).toHaveText("Saved on this device");
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!).objects[0].points as XY[], draftKey);
}

test("dragging, nudging and undoing an endpoint preserve route bends and camera", async ({page}) => {
  await page.setViewportSize({width:1440,height:1080});
  const original = [{x:270,y:430},{x:510,y:430},{x:660,y:610}];
  await openRoute(page, original);
  const canvas = page.locator("svg.tb-map");
  await page.getByRole("button", {name:"Zoom in",exact:true}).click();
  const camera = await canvas.getAttribute("viewBox");
  const shaft = await screen(page, {x:390,y:430});
  await page.mouse.click(shaft.x, shaft.y);
  const end = page.getByRole("group", {name:"Route end handle",exact:true});
  await expect(end).toBeVisible();
  expect((await end.boundingBox())!.width).toBeCloseTo(44, 1);
  const initial = await screen(page, original[2]);
  const final = await screen(page, {x:730,y:540});
  // Grab within the hit ring, away from the visible dot.
  await page.mouse.move(initial.x + 9, initial.y);
  await page.mouse.down();
  await page.mouse.move(final.x + 9, final.y, {steps:8});
  await page.mouse.up();
  await expect.poll(async () => (await savedPoints(page))[2].x).toBeCloseTo(730,0);
  const edited = await savedPoints(page);
  expect(edited.slice(0,2)).toEqual(original.slice(0,2));
  expect(edited[2].x).toBeCloseTo(730,0); expect(edited[2].y).toBeCloseTo(540,0);
  await expect(end).toBeFocused();
  await end.press("ArrowLeft");
  await end.press("Shift+ArrowUp");
  await expect.poll(async () => (await savedPoints(page))[2]).toEqual({x:edited[2].x-1,y:edited[2].y-20});
  await end.press("Control+z"); await end.press("Control+z");
  await end.press("Control+z");
  await expect.poll(() => savedPoints(page)).toEqual(original);
  await end.press("Control+Shift+z");
  await expect.poll(() => savedPoints(page)).toEqual(edited);
  await expect(canvas).toHaveAttribute("viewBox",camera!);
  await page.reload();
  expect(await savedPoints(page)).toEqual(edited);
  await expect(page.locator("[data-route-shaft]")).toHaveAttribute("stroke","#f16b75");
});

test.describe("short route editing on touch", () => {
  test.use({viewport:{width:320,height:844},hasTouch:true});
  test("each tip and the shaft remain independently draggable", async ({page,browserName}) => {
    test.skip(browserName !== "chromium","Uses Chromium's native touch-drag input");
    const original = [{x:450,y:500},{x:550,y:500}];
    await openRoute(page,original);
    const center = await screen(page, {x:500,y:500});
    await page.touchscreen.tap(center.x,center.y);
    const start = page.getByRole("group",{name:"Route start handle",exact:true});
    await expect(start).toBeVisible();
    const client = await page.context().newCDPSession(page);
    async function drag(from:XY,to:XY) {
      await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[from]});
      await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[to]});
      await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    }
    const tail = await screen(page,original[0]), tip = await screen(page,original[1]);
    expect(tip.x-tail.x).toBeLessThan(44);
    await drag(tail,await screen(page,{x:370,y:450}));
    await expect.poll(async () => (await savedPoints(page))[0].x).toBeCloseTo(370,0);
    let points = await savedPoints(page);
    expect(points[0].x).toBeCloseTo(370,0); expect(points[1]).toEqual(original[1]);
    await page.getByRole("button",{name:"Undo",exact:true}).tap();
    await expect.poll(() => savedPoints(page)).toEqual(original);
    await drag(tip,await screen(page,{x:620,y:540}));
    await expect.poll(async () => (await savedPoints(page))[1].y).toBeCloseTo(540,0);
    points = await savedPoints(page);
    expect(points[0]).toEqual(original[0]); expect(points[1].y).toBeCloseTo(540,0);
    await page.getByRole("button",{name:"Undo",exact:true}).tap();
    await expect.poll(() => savedPoints(page)).toEqual(original);
    await drag(center,await screen(page,{x:480,y:560}));
    await expect.poll(async () => (await savedPoints(page))[0].y).toBeCloseTo(560,0);
    points = await savedPoints(page);
    expect(points[0].x).toBeCloseTo(430,0); expect(points[0].y).toBeCloseTo(560,0);
    expect(points[1].x-points[0].x).toBeCloseTo(100,6); expect(points[1].y).toEqual(points[0].y);
    await client.detach();
  });
});
