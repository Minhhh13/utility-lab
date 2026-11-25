import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
const photo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const tactic = { id: "local-plan", updatedAt: "2026-11-09T00:00:00Z", plan: { version: 1, mapId: "mirage", levelId: "main", name: "Mirage local plan", side: "T", notes: "Trade.", illustrative: false, objects: [{ id: "smoke", kind: "smoke", x: 500, y: 500 }] } };
const lineup = { id: "local-lineup", mapId: "nuke", levelId: "lower", side: "CT", type: "Smoke", title: "Nuke lower personal smoke", from: "Ramp", target: "Decon", purpose: "Practice retake", throwType: "Both buttons (LMB + RMB)", steps: ["Use my uploaded standing reference."], x: 500, y: 500, userCreated: true, photos: [{ image: photo, caption: "Standing position" }] };
test.beforeEach(async ({ page }) => {
  page.on("dialog", (dialog) => void dialog.accept());
  await page.addInitScript(({ tactic, lineup }) => {
    if (localStorage.getItem("test-playbook-seeded")) return;
    localStorage.setItem("test-playbook-seeded", "true");
    localStorage.setItem("utility-lab:tactics:v1", JSON.stringify([tactic]));
    localStorage.setItem("utility-lab:utilities:v1", JSON.stringify([lineup]));
  }, { tactic, lineup });
});

test("playbook round sequence recovers on reload, edits, duplicates and opens the correct lineup", async ({ page }) => {
  await page.goto("/#playbooks");
  await page.getByRole("button", { name: "New playbook", exact: true }).click();
  await page.getByLabel("Playbook name", { exact: true }).fill("Team round calls");
  await page.getByLabel("Team notes", { exact: true }).fill("Wait for the support call.");
  await page.getByLabel("Player 4 name", { exact: true }).fill("Sam");
  await page.getByLabel("Player 4 role", { exact: true }).fill("Support");
  await page.getByRole("button", { name: "Add cue", exact: true }).click();
  await page.getByLabel("Cue 1 call", { exact: true }).fill("Throw the retake smoke");
  await page.getByLabel("Cue 1 player", { exact: true }).selectOption("p4");
  await page.getByLabel("Cue 1 elapsed seconds", { exact: true }).fill("12");
  await page.getByLabel("Cue 1 trigger", { exact: true }).fill("On the call");
  await page.getByLabel("Cue 1 lineup", { exact: true }).selectOption(lineup.id);
  await page.getByRole("button", { name: "Add cue", exact: true }).click();
  await page.getByLabel("Cue 2 call", { exact: true }).fill("Take space together");
  await page.getByLabel("Cue 2 elapsed seconds", { exact: true }).fill("4");
  await page.getByLabel("Cue 2 tactic", { exact: true }).selectOption(tactic.id);
  await page.getByRole("button", { name: "Move cue 2 up", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Cue 1 call", { exact: true })).toHaveValue("Take space together");
  await page.getByRole("button", { name: /Edit cue 2/ }).click();
  await expect(page.getByLabel("Cue 2 lineup", { exact: true })).toHaveValue(lineup.id);
  await expect(page.getByLabel("Cue 2 elapsed seconds", { exact: true })).toHaveValue("12");
  await expect(page.getByLabel("Cue 2 player", { exact: true })).toHaveValue("p4");
  await page.getByRole("button", { name: "Save playbook", exact: true }).click();
  await expect(page.getByRole("link", { name: "Open Sam’s cue sheet" })).toBeVisible();
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Team round calls (copy)", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit playbook", exact: true }).click();
  await page.getByLabel("Playbook name", { exact: true }).fill("Retake practice");
  await page.getByRole("button", { name: "Save playbook", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("utility-lab:playbooks:v1")!).length)).toBe(2);
  await page.getByRole("complementary", { name: "Your playbooks" }).getByRole("button", { name: /Team round calls/ }).click();
  await page.getByRole("link", { name: "Open Sam’s cue sheet" }).click();
  const sheet = page.getByRole("region", { name: "Player cue sheet" });
  await expect(sheet.getByText("On the call", { exact: true })).toBeVisible();
  await sheet.getByRole("link", { name: "Playbooks", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Team round calls", exact: true })).toBeVisible();
  await page.getByRole("region", { name: "Attached resources" }).getByRole("button", { name: /Nuke lower personal smoke/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("heading", { name: lineup.title, exact: true })).toBeVisible();
  await expect(page.getByRole("dialog").getByAltText("Standing position", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: "Stats", exact: true }).click();
  await page.getByLabel("Statistics map", { exact: true }).selectOption("nuke");
  await page.getByLabel("Statistics side", { exact: true }).selectOption("CT");
  await page.getByLabel("Statistics utility", { exact: true }).selectOption("Smoke");
  await expect(page.locator(".stats-summary > div").filter({ hasText: "Personal lineups" }).locator("strong")).toHaveText("1");
  await expect(page.locator(".stats-summary > div").filter({ hasText: "Saved tactics" }).locator("strong")).toHaveText("0");
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(page.locator(".stats-summary > div").filter({ hasText: "Saved tactics" }).locator("strong")).toHaveText("1");
  await expect(page.locator(".utility-stats > div").filter({ hasText: "Smoke" }).locator("strong")).toHaveText("1");
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.screenshot({ path: "outputs/overhaul/stats-complete-320.png", fullPage: true });
});

test("portable import remaps conflicts, exports real photos, and shows missing links", async ({ page }) => {
  await page.goto("/#playbooks");
  const payload = { format: "utility-lab-playbook", version: 1, book: { id: "import-book", name: "Imported execute", notes: "From another device", tacticIds: [tactic.id], lineupIds: [lineup.id], steps: [{ id: "step", title: "Throw", role: "Support", timing: "1:30", notes: "", lineupId: lineup.id }] }, tactics: [{ ...tactic, plan: { ...tactic.plan, name: "Imported tactic" } }], lineups: [{ ...lineup, title: "Imported photo lineup" }] };
  await page.getByLabel("Import playbook JSON", { exact: true }).setInputFiles({ name: "playbook.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(payload)) });
  await expect(page.getByRole("heading", { name: "Imported execute", exact: true })).toBeVisible();
  const saved = await page.evaluate(() => ({ tactics: JSON.parse(localStorage.getItem("utility-lab:tactics:v1")!), lineups: JSON.parse(localStorage.getItem("utility-lab:utilities:v1")!), books: JSON.parse(localStorage.getItem("utility-lab:playbooks:v1")!) }));
  expect(saved.tactics).toHaveLength(2);
  expect(saved.tactics.find((item: {id:string}) => item.id === tactic.id).plan.name).toBe(tactic.plan.name);
  expect(saved.lineups).toHaveLength(2);
  const importedLineup = saved.lineups.find((item: {title:string}) => item.title === "Imported photo lineup");
  expect(importedLineup.id).not.toBe(lineup.id);
  expect(importedLineup.photos[0].image).toMatch(/^ul-media:/);
  expect(saved.books[0].steps[0].lineupId).toBe(importedLineup.id);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export playbook", exact: true }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported.lineups[0].photos[0].image).toMatch(/^data:image\/png;base64,/);
  expect(exported.lineups[0].photos[0].caption).toBe("Standing position");
  await page.getByLabel("Import playbook JSON", { exact: true }).setInputFiles({ name: "missing.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ ...payload, book: { ...payload.book, id: "missing-book", name: "Missing resources" }, tactics: [], lineups: [] })) });
  await expect(page.getByRole("heading", { name: "Missing resources", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Attached resources" }).locator(".library-missing")).toHaveCount(2);
  await page.getByLabel("Import playbook JSON", { exact: true }).setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ ...payload, lineups: [{ ...lineup, photos: [{ image: "ul-media:other-device", caption: "Missing" }] }] })) });
  await expect(page.getByRole("alert")).toContainText("device-only image references");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("utility-lab:playbooks:v1")!).length)).toBe(2);
  await page.getByLabel("Import playbook JSON", { exact: true }).setInputFiles({
    name: "roundtrip.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exported)),
  });
  await expect(page.getByRole("heading", { name: "Imported execute", exact: true })).toBeVisible();
  const afterReimport = await page.evaluate(() => ({
    books: JSON.parse(localStorage.getItem("utility-lab:playbooks:v1")!),
    lineups: JSON.parse(localStorage.getItem("utility-lab:utilities:v1")!),
  }));
  expect(afterReimport.books).toHaveLength(3);
  expect(afterReimport.lineups).toHaveLength(2);
  expect(afterReimport.books[0].steps[0].lineupId).toBe(importedLineup.id);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: "outputs/overhaul/playbook-import-complete-390.png", fullPage: true });
});
