import {expect, test} from "@playwright/test";
import {PUBLISHED_LINEUPS} from "./catalogue-fixtures";
import {splitUtilityDestinations, utilityMarkerArea} from "../src/utility-markers";
import {landingChoices, mainMarkerGroupsForArea} from "./lineup-helpers";

for (const [width, height] of [[1440, 1080], [320, 710], [568, 320]]) {
  test(`Nuke Outside labels and exact dots are distinct, clickable and attached at ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height});
    await page.goto("/#utilities?map=nuke&level=upper&side=T");
    await expect(page.locator(".utility-workspace")).toHaveAttribute("aria-busy", "false");
    await page.locator('.ul-types [data-utility="Smoke"]').click();
    const cluster = mainMarkerGroupsForArea(page, "nuke:upper:named:outside garage").first();
    const areas: string[] = JSON.parse((await cluster.getAttribute("data-group-area-ids"))!);
    const expected = splitUtilityDestinations(PUBLISHED_LINEUPS.filter(record =>
      record.mapId === "nuke" && record.levelId === "upper" && record.side === "T" && record.type === "Smoke" &&
      areas.includes(utilityMarkerArea(record).id)));
    const camera = await page.locator(".ul-map-svg").getAttribute("viewBox");
    await cluster.locator(".ul-marker-hit").click();
    const layer = page.locator(".ul-landing-layer");
    await expect(layer).toBeVisible();
    const seen: string[] = [], pages = Number(await layer.getAttribute("data-pages"));
    if (width < 601) expect(pages).toBeGreaterThan(1);
    else expect(expected).toHaveLength(6);
    for (let index = 0; index < pages; index++) {
      await expect(layer).toHaveAttribute("data-page", String(index + 1));
      const marks = await landingChoices(page).evaluateAll(nodes => nodes.map(node => {
        const hit = node.querySelector(".ul-marker-hit")!.getBoundingClientRect();
        const text = node.querySelector(".ul-landing-name")!.getBoundingClientRect();
        const id = node.getAttribute("data-landing-id")!;
        const svg = node.closest("svg")!;
        const source = new DOMPoint(Number(node.getAttribute("data-landing-x")), Number(node.getAttribute("data-landing-y")))
          .matrixTransform(svg.getScreenCTM()!);
        const dot = svg.querySelector(`.ul-landing-dot[data-spot="${CSS.escape(id)}"]`)!.getBoundingClientRect();
        return { id, x: hit.x, y: hit.y, right: hit.right, bottom: hit.bottom, height: hit.height,
          clear: document.elementFromPoint(hit.x + hit.width / 2, hit.y + hit.height / 2)?.closest(".ul-landing-pin") === node,
          textFits: text.left >= hit.left && text.right <= hit.right,
          error: Math.hypot(dot.x + dot.width / 2 - source.x, dot.y + dot.height / 2 - source.y) };
      }));
      for (const [i, mark] of marks.entries()) {
        seen.push(mark.id);
        expect(mark.clear && mark.textFits).toBe(true);
        expect(mark.height).toBeGreaterThan(43.9);
        expect(mark.error).toBeLessThan(.15);
        for (const other of marks.slice(i + 1))
          expect(mark.right <= other.x || other.right <= mark.x || mark.bottom <= other.y || other.bottom <= mark.y).toBe(true);
      }
      if (index < pages - 1) await page.getByRole("button", {name:"Next landing spots"}).click();
    }
    expect(seen.sort()).toEqual(expected.map(item => item.id).sort());
    const chip = landingChoices(page).last();
    const x = await chip.getAttribute("data-landing-x"), y = await chip.getAttribute("data-landing-y");
    await chip.focus(); await chip.press("Enter");
    const origins = page.getByRole("group", {name: "Throw-from locations", exact: true});
    await expect(origins).toHaveAttribute("data-target-x", x!);
    await expect(origins).toHaveAttribute("data-target-y", y!);
    await expect(page.locator(".ul-map-svg")).toHaveAttribute("viewBox", camera!);
  });
}
