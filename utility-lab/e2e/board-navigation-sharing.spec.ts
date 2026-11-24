import { test, expect } from "@playwright/test";
import { encodeTacticShareCode } from "../src/share-code";
import { emptyPlan } from "../src/board-model";

test("wheel anchors the cursor, hand/empty/middle drags pan, and editing still uses map coordinates", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#board");
  const canvas = page.locator("svg.tb-map");
  await expect(canvas).toHaveAttribute("viewBox", "0 0 1000 1000");
  const box = (await canvas.boundingBox())!;
  const mouse = { x: Math.round(box.x + box.width * .56), y: Math.round(box.y + box.height * .45) };
  const point = () => canvas.evaluate((element: SVGSVGElement, cursor) => {
    const p = new DOMPoint(cursor.x, cursor.y).matrixTransform(element.getScreenCTM()!.inverse());
    return { x: p.x, y: p.y };
  }, mouse);
  const before = await point();
  await page.mouse.move(mouse.x, mouse.y);
  await page.mouse.wheel(0, -450);
  await expect(canvas).not.toHaveAttribute("viewBox", "0 0 1000 1000");
  const after = await point();
  expect(after.x).toBeCloseTo(before.x, 3);
  expect(after.y).toBeCloseTo(before.y, 3);
  const objects = await canvas.locator("[data-object-id]").count();
  await page.getByRole("button", { name: "Pan map (G)", exact: true }).click();
  let view = await canvas.getAttribute("viewBox");
  await page.mouse.move(mouse.x, mouse.y);
  await page.mouse.down();
  await page.mouse.move(mouse.x + 55, mouse.y + 25, { steps: 4 });
  await page.mouse.up();
  expect(await canvas.getAttribute("viewBox")).not.toBe(view);
  expect(await canvas.locator("[data-object-id]").count()).toBe(objects);
  view = await canvas.getAttribute("viewBox");
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(mouse.x + 95, mouse.y + 25, { steps: 4 });
  await page.mouse.up({ button: "middle" });
  expect(await canvas.getAttribute("viewBox")).not.toBe(view);
  await page.getByRole("button", { name: "Select / move (V)", exact: true }).click();
  view = await canvas.getAttribute("viewBox");
  await page.mouse.move(box.x + 12, box.y + box.height * .4);
  await page.mouse.down();
  await page.mouse.move(box.x + 42, box.y + box.height * .4, { steps: 4 });
  await page.mouse.up();
  expect(await canvas.getAttribute("viewBox")).not.toBe(view);
  await canvas.press("ArrowRight");
  await page.getByRole("button", { name: "Smoke (S)", exact: true }).click();
  const expected = await point();
  await page.mouse.click(mouse.x, mouse.y);
  await page.getByRole("button", { name: "Open round plan", exact: true }).click();
  expect(Number(await page.getByLabel("Selected object X position", { exact: true }).inputValue())).toBeCloseTo(expected.x, 0);
  expect(Number(await page.getByLabel("Selected object Y position", { exact: true }).inputValue())).toBeCloseTo(expected.y, 0);
  await page.getByRole("complementary", { name: "Round plan" }).getByRole("button", { name: "Close round plan", exact: true }).click();
  await page.getByRole("button", { name: "Reset map view", exact: true }).click();
  await expect(canvas).toHaveAttribute("viewBox", "0 0 1000 1000");
  await canvas.press("+");
  await canvas.press("0");
  await expect(canvas).toHaveAttribute("viewBox", "0 0 1000 1000");
  expect(errors).toEqual([]);
});

test("code preview is read only, opens the correct shared floor as a copy, and undo restores that draft", async ({ page }) => {
  const previousRadar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  await page.addInitScript(({ plan, image }) => {
    localStorage.setItem("utility-lab:draft:v1:nuke:lower", JSON.stringify(plan));
    localStorage.setItem("utility-lab:radar:v1:nuke:lower", image);
  }, { plan: { ...emptyPlan("nuke", "lower"), name: "Existing lower draft" }, image: previousRadar });
  await page.goto("/#board");
  await page.getByLabel("Strategy name", { exact: true }).fill("Local workspace retained");
  await expect(page.locator(".tb-draft-status")).toHaveText("Saved on this device");
  await page.getByRole("button", { name: "Share", exact: true }).click();
  const code = page.locator(".ts-code");
  await expect(code).toHaveValue(/^UL1\./);
  await page.getByRole("button", { name: "Close tactic sharing" }).click();
  const shared = await encodeTacticShareCode({ format: "utility-lab-tactic", version: 1,
    plan: { ...emptyPlan("nuke", "lower"), name: "Shared lower split", notes: "Flash before the drop.", objects: [
      { id: "s", kind: "smoke", x: 400, y: 300 },
      { id: "red-pen", kind: "pen", x: 200, y: 200, color: "#f16b75", points: [{x:200,y:200},{x:220,y:260},{x:280,y:215}] },
      { id: "blue-route", kind: "route", x: 350, y: 350, color: "#72a7f5", points: [{x:350,y:350},{x:650,y:470}] },
    ] } });
  const prior = await page.evaluate(() => localStorage.getItem("utility-lab:draft:v1:mirage:main"));
  await page.locator(".tb-export summary").click();
  await page.getByRole("button", { name: "Open share code", exact: true }).click();
  await page.getByLabel("Utility Lab code or share link").fill("UL1.invalid");
  await page.getByRole("button", { name: "Preview tactic", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("complete Utility Lab");
  await page.getByLabel("Utility Lab code or share link").fill(shared);
  await page.getByRole("button", { name: "Preview tactic", exact: true }).click();
  await expect(page.getByLabel("Read-only shared tactic preview")).toBeVisible();
  await expect(page.locator(".ts-preview-map image")).toHaveAttribute("href", /nuke_lower/);
  const preview = page.locator(".ts-preview-map");
  await expect(preview.locator('[data-object-kind="pen"] path').last()).toHaveAttribute("stroke", "#f16b75");
  await expect(preview.locator("[data-route-head]")).toHaveAttribute("fill", "#72a7f5");
  const previewStroke = await preview.locator('[data-object-kind="pen"] path').last().getAttribute("d");
  const previewArrow = await preview.locator("[data-route-head]").getAttribute("d");
  await expect(page.getByRole("heading", { name: "Shared lower split" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("utility-lab:draft:v1:mirage:main"))).toBe(prior);
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue("Local workspace retained");
  await page.getByRole("button", { name: "Edit a copy", exact: true }).click();
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue(/Shared lower split/);
  await expect(page.locator("svg.tb-map image")).toHaveAttribute("href", /nuke_lower/);
  await expect(page.locator('svg.tb-map [data-object-kind="pen"] path').last()).toHaveAttribute("d", previewStroke!);
  await expect(page.locator("svg.tb-map [data-route-head]")).toHaveAttribute("d", previewArrow!);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue("Existing lower draft");
  await expect(page.locator("svg.tb-map image")).toHaveAttribute("href", previousRadar);
});

test("phone share dialog fits and two-finger navigation does not add an object", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#board");
  await page.getByRole("button", { name: "Text label (X)", exact: true }).click();
  const canvas = page.locator("svg.tb-map");
  const count = await canvas.locator("[data-object-id]").count();
  const box = (await canvas.boundingBox())!;
  const session = await page.context().newCDPSession(page);
  const left = { x: box.x + box.width * .35, y: box.y + box.height * .5 };
  const right = { x: box.x + box.width * .65, y: box.y + box.height * .5 };
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [left, right] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: left.x - 25, y: left.y }, { x: right.x + 25, y: right.y }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(canvas).not.toHaveAttribute("viewBox", "0 0 1000 1000");
  expect(await canvas.locator("[data-object-id]").count()).toBe(count);
  await expect(page.getByRole("button", { name: "Open round plan", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.locator(".ts-code")).toHaveValue(/^UL1\./);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const dimensions = await page.locator(".tactic-share-dialog").evaluate(element => ({ left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right, scroll: element.scrollWidth, client: element.clientWidth }));
    expect(dimensions.left).toBeGreaterThanOrEqual(0);
    expect(dimensions.right).toBeLessThanOrEqual(width);
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
  }
  await page.screenshot({ path: "outputs/board-sharing-phone.png" });
});

test("a portable URL fragment opens a read-only preview without replacing a device draft", async ({ page }) => {
  const plan = { ...emptyPlan("vertigo", "lower"), name: "Lower shared URL", notes: "Keep the draft until Edit a copy." };
  const code = await encodeTacticShareCode({ format: "utility-lab-tactic", version: 1, plan });
  await page.goto(`/#tactic=${code}`);
  await expect(page.getByLabel("Read-only shared tactic preview")).toBeVisible();
  await expect(page.getByRole("heading", { name: plan.name })).toBeVisible();
  await expect(page.locator(".ts-preview-map image")).toHaveAttribute("href", /vertigo_lower/);
  expect(await page.evaluate(() => localStorage.getItem("utility-lab:draft:v1:vertigo:lower"))).toBeNull();
  await page.getByRole("button", { name: "Close tactic sharing" }).click();
  expect(await page.evaluate(() => localStorage.getItem("utility-lab:draft:v1:vertigo:lower"))).toBeNull();
});
