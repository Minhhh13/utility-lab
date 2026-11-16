import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("undoing a loaded tactic restores the saved record identity, and tab arrows do not move objects", async ({ page }) => {
  const base = { version: 1, mapId: "mirage", levelId: "main", side: "T", notes: "", illustrative: false, objects: [{ id: "player", kind: "t", number: 1, x: 400, y: 500 }] };
  await page.addInitScript(({ base }) => localStorage.setItem("utility-lab:tactics:v1", JSON.stringify([
    { id: "saved-a", updatedAt: "2026-11-09T00:00:00Z", plan: { ...base, name: "Plan A" } },
    { id: "saved-b", updatedAt: "2026-11-09T00:00:00Z", plan: { ...base, name: "Plan B", objects: [{ ...base.objects[0], x: 700 }] } },
  ])), { base });
  await page.goto("/#board");
  await page.getByRole("button", { name: "Open round plan", exact: true }).click();
  await page.locator(".tb-saved-section summary").click();
  await page.getByLabel("Choose a saved tactic", { exact: true }).selectOption("saved-a");
  await page.getByRole("button", { name: "Load selected saved tactic", exact: true }).click();
  await page.getByLabel("Choose a saved tactic", { exact: true }).selectOption("saved-b");
  await page.getByRole("button", { name: "Load selected saved tactic", exact: true }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue("Plan A");
  await page.getByLabel("Tactic notes", { exact: true }).fill("Updated A after undoing the load.");
  await page.getByRole("button", { name: "Update tactic", exact: true }).click();
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem("utility-lab:tactics:v1")!));
  expect(records.find((item: { id: string }) => item.id === "saved-a").plan.notes).toBe("Updated A after undoing the load.");
  expect(records.find((item: { id: string }) => item.id === "saved-b").plan.name).toBe("Plan B");
  expect(records.find((item: { id: string }) => item.id === "saved-b").plan.notes).toBe("");
  const canvas = page.locator("svg.tb-map");
  const point = await canvas.evaluate((element: SVGSVGElement) => { const point = new DOMPoint(400, 500).matrixTransform(element.getScreenCTM()!); return { x: point.x, y: point.y }; });
  await page.mouse.click(point.x, point.y);
  await expect(page.getByLabel("Selected object X position", { exact: true })).toHaveValue("400");
  await page.getByRole("tab", { name: "Plan", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /^Objects/ })).toBeFocused();
  await page.getByRole("tab", { name: "Plan", exact: true }).click();
  await expect(page.getByLabel("Selected object X position", { exact: true })).toHaveValue("400");
  await page.getByRole("button", { name: "Workspace settings", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  // Exercise the board handler directly while another dialog is open as well as
  // normal focus-isolated keyboard input inside the dialog.
  await canvas.dispatchEvent("keydown", { key: "Delete", bubbles: true });
  await page.keyboard.press("Control+z");
  await page.getByRole("button", { name: "Close workspace settings", exact: true }).click();
  await expect(canvas).toHaveAttribute("aria-label", /1 objects/);
  await expect(page.getByLabel("Selected object X position", { exact: true })).toHaveValue("400");
});

test("an interrupted drag rolls back cleanly and exported grenade icons retain the chosen palette", async ({ page }) => {
  await page.goto("/#board");
  await page.getByRole("button", { name: "Clear board", exact: true }).click();
  await page.getByRole("button", { name: "Smoke (S)", exact: true }).click();
  const canvas = page.locator("svg.tb-map");
  await canvas.press("Enter");
  await page.getByRole("button", { name: "Select / move (V)", exact: true }).click();
  const points = await canvas.evaluate((element: SVGSVGElement) => [new DOMPoint(500, 500), new DOMPoint(650, 500)].map((point) => { const transformed = point.matrixTransform(element.getScreenCTM()!); return { x: transformed.x, y: transformed.y }; }));
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  await page.mouse.move(points[1].x, points[1].y);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.mouse.up();
  await expect(canvas.locator('[data-object-id]').first()).toHaveAttribute("transform", "translate(500 500)");
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  await page.mouse.move(points[1].x, points[1].y);
  await page.mouse.up();
  await expect.poll(async () => Number((await canvas.locator('[data-object-id]').first().getAttribute("transform"))!.match(/[\d.]+/)![0])).toBeCloseTo(650, 2);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.locator(".tb-export summary").click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export board PNG", exact: true }).click();
  const png = await readFile((await (await downloadPromise).path())!);
  const pixelCounts = await page.evaluate(async (base64) => {
    const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(780, 780, 40, 40).data;
    let accent = 0, black = 0;
    for (let i = 0; i < data.length; i += 4) { if (data[i + 2] > 170 && data[i] < 110 && data[i + 1] < 150) accent++; if (data[i] < 10 && data[i + 1] < 10 && data[i + 2] < 10) black++; }
    return { accent, black };
  }, png.toString("base64"));
  expect(pixelCounts.accent).toBeGreaterThan(60);
  expect(pixelCounts.black).toBe(0);
});
