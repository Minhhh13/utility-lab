import { test, expect, type Locator } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.use({ serviceWorkers: "block" });
async function screenPoints(canvas: Locator, points: { x: number; y: number }[]) {
  return canvas.evaluate((element: SVGSVGElement, values) => values.map((point) => {
    const p = new DOMPoint(point.x, point.y).matrixTransform(element.getScreenCTM()!);
    return { x: p.x, y: p.y };
  }), points);
}

test("pencil keeps coalesced samples, finishes at the pointer and uses one undo per complete stroke", async ({ page }) => {
  await page.goto("/#board");
  const canvas = page.locator("svg.tb-map");
  await page.getByRole("button", { name: "Clear board", exact: true }).click();
  await page.getByRole("button", { name: "Draw (P)", exact: true }).click();
  const points = await screenPoints(canvas, [{ x: 250, y: 300 }, { x: 300, y: 250 }, { x: 350, y: 350 }, { x: 400, y: 260 }, { x: 450, y: 320 }]);
  await canvas.evaluate((element) => element.addEventListener("pointerdown", (event) => { (element as SVGSVGElement).dataset.testPointer = String((event as PointerEvent).pointerId); }, { once: true }));
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  await canvas.evaluate((element, samples) => {
    const pointerId = Number((element as SVGSVGElement).dataset.testPointer);
    const last = samples[samples.length - 1];
    const event = new PointerEvent("pointermove", { bubbles: true, pointerId, buttons: 1, clientX: last.x, clientY: last.y });
    Object.defineProperty(event, "getCoalescedEvents", { value: () => samples.map((point) => new PointerEvent("pointermove", { pointerId, clientX: point.x, clientY: point.y })) });
    element.dispatchEvent(event);
  }, points.slice(1));
  await page.mouse.move(points[4].x, points[4].y);
  await page.mouse.up();
  const strokes = canvas.locator('[data-object-kind="pen"]');
  await expect(strokes).toHaveCount(1);
  await expect(strokes.locator("path").last()).toHaveAttribute("d", / C .*300 250 C .*350 350 C .*400 260 C .*450 320$/);
  await expect(canvas.locator("[data-selection]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Draw (P)", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(strokes).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(strokes).toHaveCount(1);
  const original = await strokes.locator("path").last().getAttribute("d");
  await page.mouse.move(points[0].x, points[0].y + 100);
  await page.mouse.down();
  await page.mouse.move(points[4].x, points[4].y + 100, { steps: 10 });
  await expect(strokes).toHaveCount(2);
  await canvas.dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  await expect(strokes).toHaveCount(1);
  await expect(strokes.locator("path").last()).toHaveAttribute("d", original!);
  await page.locator(".tb-export summary").click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export tactic JSON", exact: true }).click();
  const file = await (await pending).path();
  const tactic = JSON.parse(await readFile(file!, "utf8"));
  expect(tactic.plan.objects).toHaveLength(1);
  expect(tactic.plan.objects[0].points.at(-1).x).toBeCloseTo(450, 1);
  expect(tactic.plan.objects[0].points.at(-1).y).toBeCloseTo(320, 1);
  await page.getByRole("button", { name: "Select / move (V)", exact: true }).click();
  await strokes.click({ position: { x: 15, y: 15 }, force: true });
  await expect(canvas.locator("[data-selection]")).toHaveCount(1);
});

test("map text is edited in place, commits once, cancels cleanly and reopens without the inspector", async ({ page }) => {
  await page.goto("/#board");
  const canvas = page.locator("svg.tb-map");
  await page.getByRole("button", { name: "Clear board", exact: true }).click();
  const before = (await canvas.boundingBox())!.width;
  await page.getByRole("button", { name: "Text label (X)", exact: true }).click();
  const [point] = await screenPoints(canvas, [{ x: 500, y: 500 }]);
  await page.mouse.click(point.x, point.y);
  const input = page.getByRole("textbox", { name: "Map text label", exact: true });
  await expect(input).toBeFocused();
  await input.fill("Split after the flash");
  await expect(canvas.locator("[data-object-id]")).toHaveCount(0);
  await expect(page.locator(".tactic-board")).not.toHaveClass(/has-inspector/);
  expect((await canvas.boundingBox())!.width).toBe(before);
  await input.press("Enter");
  await expect(input).toHaveCount(0);
  await expect(canvas.locator("text")).toHaveText("Split after the flash");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(canvas.locator("[data-object-id]")).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(canvas.locator("text")).toHaveText("Split after the flash");
  await page.getByRole("button", { name: "Select / move (V)", exact: true }).click();
  await canvas.locator("text").dblclick();
  await expect(input).toHaveValue("Split after the flash");
  await input.fill("Discard this change");
  await input.press("Escape");
  await expect(canvas.locator("text")).toHaveText("Split after the flash");
  await canvas.locator("text").click();
  await canvas.press("Enter");
  await expect(input).toBeFocused();
  await input.fill("Hold this angle");
  await page.getByRole("button", { name: "Select / move (V)", exact: true }).click();
  await expect(canvas.locator("text")).toHaveText("Hold this angle");
  await expect(page.locator(".tactic-board")).not.toHaveClass(/has-inspector/);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(canvas.locator("text")).toHaveText("Split after the flash");
  await page.getByRole("button", { name: "Text label (X)", exact: true }).click();
  await canvas.press("Enter");
  await input.fill("Never saved");
  await input.press("Escape");
  await expect(canvas.locator("[data-object-id]")).toHaveCount(1);
});

test("phone text entry stays on the map with accessible save and cancel controls", async ({ page }, testInfo) => {
  await page.goto("/#board");
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole("button", { name: "Text label (X)", exact: true }).click();
    await page.locator("svg.tb-map").press("Enter");
    const editor = page.getByRole("group", { name: "Edit map label", exact: true });
    const input = editor.getByRole("textbox");
    await input.fill(`Phone label ${width}`);
    await expect(editor).toBeInViewport();
    const box = (await editor.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    for (const label of ["Save map label", "Cancel map label"]) {
      const button = editor.getByRole("button", { name: label, exact: true });
      const control = (await button.boundingBox())!;
      expect(control.width).toBeGreaterThanOrEqual(44);
      expect(control.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.locator(".tactic-board")).not.toHaveClass(/has-inspector/);
    await page.screenshot({ path: testInfo.outputPath(`map-text-${width}.png`) });
    await editor.getByRole("button", { name: "Save map label", exact: true }).click();
    await expect(editor).toHaveCount(0);
    await expect(page.locator("svg.tb-map text").filter({ hasText: `Phone label ${width}` })).toHaveCount(1);
  }
});
