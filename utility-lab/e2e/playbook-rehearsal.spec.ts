import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { PlaybookFile } from "../src/playbook-model";

test.use({ reducedMotion: "reduce", serviceWorkers: "block" });

async function rehearseMirage(page: Page) {
  const rehearsal = page.getByRole("region", { name: "Round rehearsal" });
  const timeline = rehearsal.getByRole("slider", { name: "Round timeline" });
  const radar = rehearsal.getByRole("img", { name: /Mirage.*radar/ });
  await expect(timeline).toHaveValue("0");
  await expect(rehearsal.getByText("Check the starting board", { exact: true }).first()).toBeVisible();
  await expect(radar.locator("[data-object-id^='sample-t-']")).toHaveCount(5);
  const openingBoard = await radar.getAttribute("data-tactic-id");
  const firstPlayer = radar.locator('[data-object-id="sample-t-1"]');
  const startPosition = await firstPlayer.getAttribute("transform");

  // Seek to one second before both players' calls, then let the clock cross them.
  await rehearsal.getByRole("button", { name: /Next.*Set up in Palace/ }).click();
  await expect(timeline).toHaveValue("8");
  await rehearsal.getByRole("button", { name: /Next.*Play the Sandwich lineup/ }).click();
  await expect(rehearsal.getByRole("link", { name: /Sandwich/i })).toBeVisible();
  await rehearsal.getByRole("button", { name: /Next.*Take A ramp/ }).click();
  await timeline.press("ArrowLeft");
  await expect(timeline).toHaveValue("19");
  await rehearsal.getByRole("button", { name: "Play round" }).click();
  await expect(rehearsal.locator(".pb-live-cue strong")).toHaveText(["Take A ramp", "Follow the entry"]);
  await rehearsal.getByRole("button", { name: "Pause round" }).click();
  await rehearsal.locator("summary").filter({ hasText: "Round cues" }).click();
  await rehearsal.getByRole("list", { name: "Jump to a round cue" }).getByRole("button", { name: /Call the plant/ }).click();
  await expect(timeline).toHaveValue("34");
  await expect(rehearsal.locator("figcaption")).toHaveText("A site post-plant");
  await expect(radar).not.toHaveAttribute("data-tactic-id", openingBoard!);
  await expect(firstPlayer).not.toHaveAttribute("transform", startPosition!);
  await timeline.press("End");
  await expect(timeline).toHaveValue("115");
  await expect(rehearsal.locator(".pb-live-cue strong")).toHaveText("Review the round");
  await timeline.press("Home");
  await expect(timeline).toHaveValue("0");
  await expect(radar).toHaveAttribute("data-tactic-id", openingBoard!);
  await expect(firstPlayer).toHaveAttribute("transform", startPosition!);
}

test("a five-player Mirage round exports on desktop, imports on a fresh phone, and rehearses on both", async ({ page, browser }, info) => {
  test.setTimeout(75_000);
  await page.goto("/#playbooks");
  await page.getByRole("button", { name: "Add Mirage example", exact: true }).click();
  await rehearseMirage(page);
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export playbook", exact: true }).click();
  const path = info.outputPath("Mirage-A-split.json");
  await (await downloadEvent).saveAs(path);
  const file: PlaybookFile = JSON.parse(await readFile(path, "utf8"));
  expect(file.book.round?.players.map(p => p.role)).toEqual(["Entry", "Trade", "Palace", "Support", "Caller"]);
  expect(new Set(file.book.steps.map(cue => cue.playerId).filter(Boolean)).size).toBe(5);
  expect(file.tactics.map(entry => entry.plan.name).sort()).toEqual(["A site execute", "A site post-plant"]);

  const origin = new URL(page.url()).origin;
  const phoneOptions = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce", serviceWorkers: "block" } as const;
  const phone = await browser.newContext(phoneOptions);
  const teammate = await browser.newContext(phoneOptions);
  try {
    const receiver = await phone.newPage();
    await receiver.goto(origin + "/#playbooks");
    await receiver.getByLabel("Import playbook JSON").setInputFiles(path);
    await expect(receiver.getByRole("heading", { name: file.book.name, exact: true })).toBeVisible();
    await receiver.reload();
    const books = await receiver.evaluate(() => JSON.parse(localStorage.getItem("utility-lab:playbooks:v1")!));
    expect(books).toHaveLength(1);
    expect(books[0]).toMatchObject({ round: file.book.round, steps: file.book.steps, tacticIds: file.book.tacticIds, lineupIds: file.book.lineupIds });
    await rehearseMirage(receiver);
    expect(await receiver.locator("#workspace").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);

    const sheetPage = await teammate.newPage();
    for (const player of file.book.round!.players) {
      const sheetLink = receiver.getByRole("link", { name: `Open ${player.name}’s cue sheet` });
      const href = await sheetLink.getAttribute("href");
      await sheetPage.goto(new URL(href!, receiver.url()).href);
      const sheet = sheetPage.getByRole("region", { name: "Player cue sheet" });
      await expect(sheet.getByRole("heading", { name: player.name, exact: true })).toBeVisible();
      const calls = file.book.steps.filter(cue => !cue.playerId || cue.playerId === player.id).map(cue => cue.title);
      await expect(sheet.locator("li h4")).toHaveText(calls);
      if (player.role === "Support") {
        await sheet.getByRole("link", { name: /Sandwich/i }).click();
        await expect(sheetPage.getByRole("dialog", { name: /Sandwich/i })).toBeVisible();
        await sheetPage.goBack();
        await expect(sheet).toBeVisible();
      }
      expect(await sheetPage.locator("#workspace").evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
    expect(await sheetPage.evaluate(() => localStorage.getItem("utility-lab:playbooks:v1"))).toBeNull();
  } finally {
    await teammate.close();
    await phone.close();
  }
});

test("an incomplete cue-sheet link offers a way back into Playbooks", async ({ page }) => {
  await page.goto("/#playbooks?sheet=invalid");
  await expect(page.getByRole("heading", { name: /couldn.t open this cue sheet/i })).toBeVisible();
  await page.getByRole("link", { name: "Open Playbooks" }).click();
  await expect(page.getByRole("button", { name: "New playbook", exact: true })).toBeEnabled();
});

test("a failed lineup catalogue leaves the player's timed calls available", async ({ page }) => {
  await page.route(/\/assets\/mirage-[^/]+\.json/, route => route.abort());
  await page.goto("/#playbooks");
  await page.getByRole("button", { name: "Add Mirage example", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(/load your linked lineups/);
  await page.getByRole("link", { name: "Open Player 4’s cue sheet" }).click();
  const sheet = page.getByRole("region", { name: "Player cue sheet" });
  await expect(sheet.getByRole("heading", { name: "Play the Sandwich lineup" })).toBeVisible();
  await expect(sheet.getByText("Unavailable lineup", { exact: true })).toBeVisible();
});
