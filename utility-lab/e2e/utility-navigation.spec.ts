import { startPersonalLineup, chooseLandingSpot, waitForUtilityChoice,openOriginPhoto } from "./lineup-helpers";
import { test, expect } from "@playwright/test";

test.use({ hasTouch: true });

test("utility map wheel anchors aim, pan keeps placement coordinates correct, and reset fits", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#utilities?map=mirage&level=main&side=T&lineup=compendium-mirage-palace-jungle");
  await expect(page.locator('.ul-media-dialog')).toBeVisible();
  await startPersonalLineup(page);
  const canvas = page.locator("svg.ul-map-svg");
  const fit = await canvas.getAttribute("viewBox");
  const box = (await canvas.boundingBox())!;
  const cursor = { x: Math.round(box.x + box.width * .54), y: Math.round(box.y + box.height * .48) };
  const point = () => canvas.evaluate((svg: SVGSVGElement, position) => {
    const p = new DOMPoint(position.x, position.y).matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: p.x, y: p.y };
  }, cursor);
  const before = await point();
  await page.mouse.move(cursor.x, cursor.y);
  await page.mouse.wheel(0, -400);
  await expect(canvas).not.toHaveAttribute("viewBox", fit!);
  const after = await point();
  expect(after.x).toBeCloseTo(before.x, 3);
  expect(after.y).toBeCloseTo(before.y, 3);
  await page.getByRole("button", { name: "Pan utility map", exact: true }).click();
  const prior = await canvas.getAttribute("viewBox");
  await page.mouse.move(cursor.x, cursor.y);
  await page.mouse.down();
  await page.mouse.move(cursor.x + 35, cursor.y + 25, { steps: 4 });
  await page.mouse.up();
  expect(await canvas.getAttribute("viewBox")).not.toBe(prior);
  await page.getByRole("button", { name: "Choose target on map", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pan utility map", exact: true })).toHaveAttribute("aria-pressed", "false");
  await canvas.focus();
  await page.keyboard.down("Space");
  await page.mouse.move(cursor.x, cursor.y);
  await page.mouse.down();
  await page.mouse.move(cursor.x + 15, cursor.y + 5);
  await page.mouse.up();
  await page.keyboard.up("Space");
  await expect(page.getByRole("button", { name: "Cancel map placement", exact: true })).toBeVisible();
  const expected = await point();
  await page.mouse.click(cursor.x, cursor.y);
  expect(Number(await page.locator('[name="lineup-x"]').inputValue())).toBeCloseTo(expected.x, 0);
  expect(Number(await page.locator('[name="lineup-y"]').inputValue())).toBeCloseTo(expected.y, 0);
  await page.getByRole("button", { name: "Reset utility map zoom", exact: true }).click();
  await expect(canvas).toHaveAttribute("viewBox", fit!);
  await canvas.press("+");
  await canvas.press("ArrowRight");
  await canvas.press("0");
  await expect(canvas).toHaveAttribute("viewBox", fit!);
  expect(errors).toEqual([]);
});

test("phone marker taps still select while two fingers navigate and controls fit", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#utilities");
  await expect(page.getByRole("checkbox", { name: "Practice targets", exact: true })).toHaveCount(0);
  const canvas = page.locator("svg.ul-map-svg");
  await canvas.scrollIntoViewIfNeeded();
  const markers = page.locator(".ul-map-marker");
  const marker = await markers.evaluateAll(elements => elements.map((element, index) => {
    const rect = element.getBoundingClientRect();
    return { index, label: element.getAttribute("aria-label")!, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, selected: element.getAttribute("aria-pressed") === "true" };
  }).find(item => !item.selected && item.x > 40 && item.x < 350 && item.y > 100 && item.y < innerHeight - 40));
  expect(marker).toBeTruthy();
  await page.touchscreen.tap(marker!.x, marker!.y);
  await waitForUtilityChoice(page);
  const choices=page.getByRole('dialog',{name:'Choose utility',exact:true});
  if(await choices.count())await choices.getByRole('group',{name:'Utility types at this target',exact:true}).getByRole('button').first().click();
  await chooseLandingSpot(page,{touch:true});
  await expect(page.locator('.ul-origin-pin').first()).toBeVisible();
  await openOriginPhoto(page,{touch:true});
  await expect(page.locator('.ul-media-dialog')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await canvas.scrollIntoViewIfNeeded();
  const fit = await canvas.getAttribute("viewBox");
  const box = (await canvas.boundingBox())!;
  const session = await page.context().newCDPSession(page);
  const left = { x: box.x + box.width * .35, y: box.y + box.height * .5 };
  const right = { x: box.x + box.width * .65, y: box.y + box.height * .5 };
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [left, right] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: left.x - 25, y: left.y }, { x: right.x + 25, y: right.y }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(canvas).not.toHaveAttribute("viewBox", fit!);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await page.getByRole("button", { name: "Pan utility map", exact: true }).evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: "outputs/utility-navigation-phone.png", fullPage: true });
});
