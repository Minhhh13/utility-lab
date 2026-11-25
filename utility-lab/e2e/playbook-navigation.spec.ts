import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block", reducedMotion: "reduce" });

test("Home opens a saved legacy round without rewriting it", async ({ page }) => {
  const stored = JSON.stringify([{ id: "retained-book", name: "Keep this round", notes: "Wait for the call.", tacticIds: [], lineupIds: [], steps: [] }]);
  await page.addInitScript(value => localStorage.setItem("utility-lab:playbooks:v1", value), stored);
  await page.goto("/#home");
  await page.getByRole("button", { name: "Playbooks", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Keep this round", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("utility-lab:playbooks:v1"))).toBe(stored);
});

test("keyboard navigation includes Playbooks and returns to it from Stats", async ({ page }) => {
  await page.goto("/#utilities");
  const tab = (name: string) => page.getByRole("tab", { name, exact: true });
  await tab("Lineups").press("ArrowRight");
  await expect(tab("Playbooks")).toBeFocused();
  await expect(tab("Playbooks")).toHaveAttribute("aria-selected", "true");
  await tab("Playbooks").press("ArrowRight");
  await expect(tab("Stats")).toBeFocused();
  await tab("Stats").press("ArrowLeft");
  await expect(tab("Playbooks")).toBeFocused();
  await tab("Playbooks").press("Home");
  await expect(tab("Tactic board")).toBeFocused();
});

for (const mode of ["light", "dark"]) {
  test(`Playbooks fits a 320px phone in ${mode} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.addInitScript(mode => localStorage.setItem("ul:appearance", JSON.stringify({ mode, palette: "cobalt" })), mode);
    await page.goto("/#home");
    await page.getByRole("button", { name: "Playbooks", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Playbooks", exact: true })).toBeInViewport();
    await page.getByRole("button", { name: "New playbook", exact: true }).click();
    await expect(page.getByLabel("Playbook name", { exact: true })).toBeVisible();
    expect(await page.locator("#workspace").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  });
}
