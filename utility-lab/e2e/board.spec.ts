import { test, expect } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";

test("edit, recover, save, switch map floors, and transfer a tactic", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#board");
  const canvas = page.locator("svg.tb-map");
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue(
    "A site execute",
  );
  await expect(canvas).toHaveAttribute("aria-label", /12 objects/);
  await page.getByRole("button", { name: "T player (T)", exact: true }).click();
  await canvas.press("Enter");
  await expect(canvas).toHaveAttribute("aria-label", /13 objects/);
  await page
    .getByRole("button", { name: "Open round plan", exact: true })
    .click();
  await expect(
    page.getByLabel("Selected object X position", { exact: true }),
  ).toHaveValue("500");
  await canvas.press("ArrowRight");
  await expect(
    page.getByLabel("Selected object X position", { exact: true }),
  ).toHaveValue("505");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Selected object X position", { exact: true }),
  ).toHaveValue("500");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(
    page.getByLabel("Selected object X position", { exact: true }),
  ).toHaveValue("505");
  await page.getByRole("button", { name: "Clear board", exact: true }).click();
  await expect(canvas).toHaveAttribute("aria-label", /0 objects/);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(canvas).toHaveAttribute("aria-label", /13 objects/);
  await page
    .getByRole("button", { name: "Route arrow (R)", exact: true })
    .click();
  const points = await canvas.evaluate((element: SVGSVGElement) => {
    const matrix = element.getScreenCTM()!;
    return [
      new DOMPoint(300, 700).matrixTransform(matrix),
      new DOMPoint(450, 550).matrixTransform(matrix),
    ].map((p) => ({ x: p.x, y: p.y }));
  });
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  await page.mouse.move(points[1].x, points[1].y, { steps: 8 });
  await page.mouse.up();
  await expect(canvas).toHaveAttribute("aria-label", /14 objects/);
  await page.getByLabel("Route end X position", { exact: true }).fill("600");
  await expect(
    page.getByLabel("Route end X position", { exact: true }),
  ).toHaveValue("600");
  await page
    .getByLabel("Strategy name", { exact: true })
    .fill("Browser checked split");
  await page.getByRole("button", { name: "Save tactic", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Tactic saved");
  await page.reload();
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue(
    "Browser checked split",
  );
  await expect(canvas).toHaveAttribute("aria-label", /14 objects/);
  await page.getByRole("button", { name: "Change map", exact: true }).click();
  await page
    .getByRole("button", { name: "Nuke Active Duty", exact: true })
    .click();
  await page.getByRole("button", { name: "Lower", exact: true }).click();
  await expect(canvas.locator("image")).toHaveAttribute("href", /nuke_lower/);
  await page.getByRole("button", { name: "Change map", exact: true }).click();
  await page
    .getByRole("button", { name: "Mirage Active Duty", exact: true })
    .click();
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue(
    "Browser checked split",
  );
  await page.locator(".tb-export summary").click();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export tactic JSON", exact: true })
    .click();
  const tactic = JSON.parse(
    readFileSync((await (await downloaded).path())!, "utf8"),
  );
  expect(tactic.plan.objects).toHaveLength(14);
  await page.getByRole("button", { name: "Clear board", exact: true }).click();
  await page
    .getByLabel("Import tactic JSON file", { exact: true })
    .setInputFiles({
      name: "checked.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(tactic)),
    });
  await expect(canvas).toHaveAttribute("aria-label", /14 objects/);
  await page.locator(".tb-export summary").click();
  const pngDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export board PNG", exact: true })
    .click();
  expect(
    readFileSync((await (await pngDownload).path())!)
      .subarray(0, 8)
      .toString("hex"),
  ).toBe("89504e470d0a1a0a");
  expect(errors).toEqual([]);
});

test("phone controls, map drawer and loaded actions fit at 390px and 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#board");
  await page.getByRole("button", { name: "Change map", exact: true }).click();
  await expect(page.getByLabel("Search maps", { exact: true })).toBeFocused();
  await page.getByLabel("Search maps", { exact: true }).fill("Nuke");
  await page
    .getByRole("button", { name: "Nuke Active Duty", exact: true })
    .click();
  await expect(page.locator(".map-dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: "Open round plan", exact: true })
    .click();
  await page.getByRole("button", { name: "Smoke (S)", exact: true }).click();
  await page
    .getByRole("button", { name: "Place smoke at center", exact: true })
    .click();
  await expect(page.locator("svg.tb-map")).toHaveAttribute(
    "aria-label",
    /1 objects/,
  );
  expect(
    await page
      .getByLabel("Tactic notes", { exact: true })
      .evaluate((el) => getComputedStyle(el).fontSize),
  ).toBe("16px");
  await page
    .getByLabel("Strategy name", { exact: true })
    .fill("A longer phone strategy name");
  await page.getByRole("button", { name: "Save tactic", exact: true }).click();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  const actionBounds = await page.locator(".tb-title-actions").boundingBox();
  expect(actionBounds!.x + actionBounds!.width).toBeLessThanOrEqual(320);
  const tools = await page.locator(".tb-tool").evaluateAll((items) =>
    items.map((el) => ({
      w: el.getBoundingClientRect().width,
      h: el.getBoundingClientRect().height,
    })),
  );
  expect(tools.every((item) => item.w >= 44 && item.h >= 44)).toBeTruthy();
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Close round plan", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Dismiss message", exact: true })
    .click();
  await expect(page.locator(".tb-draft-status")).toHaveText(
    "Saved on this device",
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  mkdirSync("outputs", { recursive: true });
  await page.screenshot({ path: "outputs/phone.png", fullPage: true });
});

test("production shell and default map reopen offline after initial installation", async ({
  page,
  context,
}) => {
  await page.goto("/#board");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue(
    "A site execute",
  );
  expect(
    await page.evaluate(async () =>
      Boolean(await caches.match("/maps/mirage-light.svg")),
    ),
  ).toBeTruthy();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".tactic-board")).toBeVisible();
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue(
    "A site execute",
  );
  await context.setOffline(false);
});

test("desktop draft has no overflow and no broken local artwork", async ({
  page,
}) => {
  await page.goto("/#board");
  await page.getByRole("button", { name: "Change map", exact: true }).waitFor();
  await page.locator(".tb-map image").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".tb-draft-status")).toHaveText(
    "Saved on this device",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    1280,
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeLessThanOrEqual(721);
  expect(await page.locator(".tb-map").boundingBox()).toMatchObject({
    height: expect.any(Number),
  });
  expect(
    await page.evaluate(() =>
      [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.src),
    ),
  ).toEqual([]);
  mkdirSync("outputs", { recursive: true });
  await page.screenshot({ path: "outputs/desktop.png" });
});
