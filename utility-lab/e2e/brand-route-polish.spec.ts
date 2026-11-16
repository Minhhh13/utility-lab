import { readFile } from "node:fs/promises";
import { test, expect, type Locator, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });
for (const mode of ["light", "dark"] as const) {
  for (const width of [1440, 320]) {
    for (const view of ["home", "board"]) {
      test(`restored route symbol is unboxed and whole: ${view}, ${mode}, ${width}px`, async ({ page }, info) => {
        await page.setViewportSize({ width, height: width === 320 ? 844 : 1000 });
        await page.addInitScript(mode => localStorage.setItem("ul:appearance", JSON.stringify({ mode, palette: "cobalt" })), mode);
        await page.goto(`/#${view}`);
        await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
        if (view === "board") await expect(page.locator("svg.tb-map")).toBeVisible();
        const brand = page.getByRole("link", { name: "Utility Lab home", exact: true });
        await expect(brand).toBeVisible();
        await expect(brand.locator('[data-brand-symbol="route"] circle')).toHaveCount(3);
        await expect(brand.locator('svg > rect')).toHaveCount(0);
        const bounds = await brand.evaluate(brand => {
          const mark = brand.querySelector<HTMLElement>(".ul-brand-mark")!;
          const svg = mark.querySelector("svg")!;
          const path = svg.querySelector("[data-brand-symbol]")!;
          const style = getComputedStyle(mark), glyph = path.getBoundingClientRect();
          const header = brand.closest("header")!.getBoundingClientRect();
          const clips = [];
          for (let parent: Element | null = path; parent; parent = parent.parentElement) {
            const computed = getComputedStyle(parent);
            if ([computed.overflowX, computed.overflowY].some(value => ["clip", "hidden", "auto", "scroll"].includes(value))) {
              const box = parent.getBoundingClientRect();
              if (glyph.x < box.x - .1 || glyph.y < box.y - .1 || glyph.right > box.right + .1 || glyph.bottom > box.bottom + .1)
                clips.push(parent.className.toString());
            }
          }
          return { background: style.backgroundColor, border: style.borderWidth, radius: style.borderRadius,
            overflow: style.overflow, opacity: getComputedStyle(path).opacity, stroke: getComputedStyle(path).stroke,
            x: glyph.x, y: glyph.y, width: glyph.width, height: glyph.height, right: glyph.right, bottom: glyph.bottom,
            headerTop: header.top, headerBottom: header.bottom, clips, screenWidth: innerWidth, documentWidth: document.documentElement.scrollWidth };
        });
        expect(bounds.background).toBe("rgba(0, 0, 0, 0)");
        expect(bounds.border).toBe("0px");
        expect(bounds.radius).toBe("0px");
        expect(bounds.overflow).toBe("visible");
        expect(bounds.clips).toEqual([]);
        expect(bounds.opacity).toBe("1");
        expect(bounds.stroke).not.toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
        expect(bounds.width).toBeGreaterThan(15);
        expect(bounds.height).toBeGreaterThan(10);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.right).toBeLessThanOrEqual(width);
        expect(bounds.y).toBeGreaterThanOrEqual(bounds.headerTop);
        expect(bounds.bottom).toBeLessThanOrEqual(bounds.headerBottom);
        expect(bounds.documentWidth).toBe(bounds.screenWidth);
        if (view === "home") await expect(page.locator(".launch-art.is-loaded")).toBeVisible();
        await page.screenshot({ path: info.outputPath(`${view}-${mode}-${width}.png`) });
      });
    }
  }
}

async function points(canvas: Locator, values: { x: number; y: number }[]) {
  return canvas.evaluate((element: SVGSVGElement, values) => values.map(point => {
    const transformed = new DOMPoint(point.x, point.y).matrixTransform(element.getScreenCTM()!);
    return { x: transformed.x, y: transformed.y };
  }), values);
}
async function colour(page: Page, name: string) {
  await page.getByRole("button", { name: "Drawing colour", exact: true }).click();
  await page.getByRole("dialog", { name: "Drawing colour choices", exact: true }).getByRole("button", { name, exact: true }).click();
}

test("drawn arrow has a precise coloured head/shaft, generous hit target, one-step edits and faithful PNG", async ({ page }, info) => {
  await page.goto("/#board");
  await page.getByRole("button", { name: "Clear board", exact: true }).click();
  await page.getByRole("button", { name: "Route arrow (R)", exact: true }).click();
  await colour(page, "Red");
  const canvas = page.locator("svg.tb-map");
  const [start, end, hit, movedHit] = await points(canvas, [{ x: 300, y: 500 }, { x: 700, y: 300 }, { x: 504.47, y: 408.94 }, { x: 554.47, y: 458.94 }]);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 14 });
  await page.mouse.up();
  const route = canvas.locator('[data-object-kind="route"]');
  await expect(route).toHaveCount(1);
  const shaft = route.locator("[data-route-shaft]"), head = route.locator("[data-route-head]");
  await expect(shaft).toHaveAttribute("stroke", "#f16b75");
  await expect(head).toHaveAttribute("fill", "#f16b75");
  const headPoints = (await head.getAttribute("d"))!.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  expect(headPoints[0]).toBeCloseTo(700, 1);
  expect(headPoints[1]).toBeCloseTo(300, 1);
  await page.getByRole("button", { name: "Select / move (V)", exact: true }).click();
  // Ten map units away from the thin visible line, within the actual hit area.
  await page.mouse.click(hit.x, hit.y);
  await expect(canvas.locator("[data-selection]")).toHaveCount(1);
  await colour(page, "Purple");
  await expect(shaft).toHaveAttribute("stroke", "#b79afa");
  await expect(head).toHaveAttribute("fill", "#b79afa");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(head).toHaveAttribute("fill", "#f16b75");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(head).toHaveAttribute("fill", "#b79afa");
  const beforeMove = await head.getAttribute("d");
  await page.mouse.move(hit.x, hit.y); await page.mouse.down();
  await page.mouse.move(movedHit.x, movedHit.y, { steps: 8 }); await page.mouse.up();
  expect(await head.getAttribute("d")).not.toBe(beforeMove);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(head).toHaveAttribute("d", beforeMove!);
  await page.screenshot({ path: info.outputPath("arrow-selected.png") });
  await page.locator(".tb-export summary").click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export board PNG", exact: true }).click();
  const file = await pending;
  await file.saveAs(info.outputPath("coloured-arrow.png"));
  const png = await readFile((await file.path())!);
  const colourCounts = await page.evaluate(async ({ base64, headPoints }) => {
    const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0);
    const samples = [
      { x: 500, y: 400 },
      { x: (headPoints[0] + headPoints[2] + headPoints[4]) / 3, y: (headPoints[1] + headPoints[3] + headPoints[5]) / 3 },
    ];
    return samples.map(point => {
      const data = ctx.getImageData(Math.round(point.x * 1.6) - 4, Math.round(point.y * 1.6) - 4, 9, 9).data;
      let purple = 0;
      for (let index = 0; index < data.length; index += 4)
        if (Math.abs(data[index] - 183) < 3 && Math.abs(data[index + 1] - 154) < 3 && Math.abs(data[index + 2] - 250) < 3 && data[index + 3] === 255) purple++;
      return purple;
    });
  }, { base64: png.toString("base64"), headPoints });
  expect(colourCounts[0], "PNG shaft retains chosen purple").toBeGreaterThan(20);
  expect(colourCounts[1], "PNG inline head retains chosen purple").toBeGreaterThan(20);
});
