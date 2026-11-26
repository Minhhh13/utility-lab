import { expect, test } from "@playwright/test";
import { PUBLISHED_LINEUPS } from "./catalogue-fixtures";
import { FAVORITE_UTILITIES_KEY } from "../src/utility-data";

const lineups = PUBLISHED_LINEUPS.filter(guide => guide.mapId === "dust2" && guide.side === "T" && guide.levelId === "main");
const tenth = lineups[9];

for (const width of [1440, 320]) {
  const phone = width === 320;
  test.describe(`Saved filter at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 }, isMobile: phone, hasTouch: phone, serviceWorkers: "block" });
    for (const mode of ["light", "dark"] as const) {
      test(`keeps icons, labels and counts aligned in ${mode} mode`, async ({ page }) => {
        await page.addInitScript(({ key, ids, mode }) => {
          localStorage.setItem(key, JSON.stringify(ids));
          localStorage.setItem("ul:appearance", JSON.stringify({ mode, palette: "cobalt" }));
        }, { key: FAVORITE_UTILITIES_KEY, ids: lineups.slice(0, 9).map(g => g.id), mode });
        await page.route(/^https:\/\//, route => route.abort());
        await page.goto("/#utilities?map=dust2&side=T&level=main");
        await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
        const bar = page.locator(".ul-filterbar");
        const saved = bar.getByRole("button", { name: /^Saved \d+$/ });

        async function checkDock(count: number) {
          await expect(saved).toHaveAccessibleName(`Saved ${count}`);
          await expect(saved.locator("small")).toHaveText(String(count));
          const rows = await bar.getByRole("button").evaluateAll((buttons, compact) => buttons.map(button => {
            const [icon, label, badge] = Array.from(button.children, child => child.getBoundingClientRect());
            const bounds = button.getBoundingClientRect();
            const glyph = icon.width ? icon : label; // Compact All uses its name as its glyph.
            const labelElement = button.children[1];
            const { fontSize, fontWeight } = getComputedStyle(labelElement);
            let baseline = 0;
            if (!compact) {
              // A zero-height inline box sits on the actual text baseline.
              const probe = document.createElement("span");
              probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
              labelElement.append(probe);
              baseline = probe.getBoundingClientRect().top - bounds.top;
              probe.remove();
            }
            return {
              left: bounds.left, right: bounds.right, width: bounds.width, height: bounds.height,
              centerY: bounds.top + bounds.height / 2, iconX: glyph.left + glyph.width / 2,
              iconY: glyph.top + glyph.height / 2, labelX: label.left,
              badgeRight: badge.right, badgeWidth: badge.width, fontSize, fontWeight, baseline,
            };
          }), phone);
          expect(rows).toHaveLength(6);
          for (const row of rows) {
            expect(row.height).toBeGreaterThanOrEqual(44);
            expect(Math.abs(row.iconY - row.centerY)).toBeLessThan(1);
            if (phone) {
              expect(row.width).toBeGreaterThanOrEqual(44);
              expect(Math.abs(row.iconX - (row.left + row.width / 2))).toBeLessThan(1);
              expect(row.badgeWidth).toBe(0);
              expect(Math.abs(row.centerY - rows[0].centerY)).toBeLessThan(1);
              expect(row.right).toBeLessThanOrEqual(width);
            } else {
              expect(row.badgeWidth).toBeGreaterThan(0);
              expect(row.fontSize).toBe(rows[0].fontSize);
              expect(row.fontWeight).toBe(rows[0].fontWeight);
              for (const column of ["left", "right", "iconX", "labelX", "badgeRight", "baseline"] as const)
                expect(Math.abs(row[column] - rows[0][column]), column).toBeLessThan(1);
            }
          }
        }

        await checkDock(9);
        await page.evaluate(id => { location.hash = `utilities?map=dust2&side=T&level=main&lineup=${id}`; }, tenth.id);
        const viewer = page.getByRole("dialog", { name: tenth.title, exact: true });
        await viewer.getByRole("button", { name: `Save ${tenth.title}`, exact: true }).click();
        await viewer.getByRole("button", { name: "Close lineup media" }).click();
        await saved.click();
        await expect(saved).toHaveAttribute("aria-pressed", "true");
        await checkDock(10);
        await page.getByRole("button", { name: "CT side", exact: true }).click();
        await checkDock(0);
      });
    }
  });
}
