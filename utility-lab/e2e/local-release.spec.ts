import { startPersonalLineup } from "./lineup-helpers";
import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { emptyPlan } from "../src/board-model";
import { LAUNCH_SCENES } from "../src/launch-scenes";
test.use({ baseURL: "http://127.0.0.1:5180" });

test("workspace backups carry actual photos into a clean browser and preserve linked round steps", async ({
  page,
  browser,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(crypto, "subtle", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(crypto, "randomUUID", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("/#utilities");
  await startPersonalLineup(page);
  await page.locator('[name="lineup-title"]').fill("Photo smoke");
  await page.locator('[name="lineup-target"]').fill("Window");
  await page.locator('[name="lineup-from"]').fill("T spawn");
  await page
    .locator('[name="lineup-steps"]')
    .fill(
      "Stand in the corner.\nAim using the reference.\nJump and release both buttons.",
    );
  await page
    .getByLabel("Throw method", { exact: true })
    .selectOption("Jump + both buttons (LMB + RMB)");
  await page
    .getByLabel("Lineup screenshot file", { exact: true })
    .setInputFiles([
      resolve("public/icons/icon-192.png"),
      resolve("public/icons/apple-touch-icon.png"),
    ]);
  await expect(
    page.getByLabel("Photo 2 caption", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Photo 1 caption", { exact: true })
    .fill("Standing position");
  await page
    .getByLabel("Photo 2 caption", { exact: true })
    .fill("Aim reference");
  await page
    .getByRole("button", { name: "Move photo 2 up", exact: true })
    .click();
  await expect(page.getByLabel("Photo 1 caption", { exact: true })).toHaveValue(
    "Aim reference",
  );
  await page.getByRole("button", { name: "Save lineup", exact: true }).click();
  await expect(page.locator(".app-notice")).toContainText("saved on this device");
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("utility-lab:utilities:v1")!)[0],
  );
  expect(saved.photos[0].image).toMatch(/^ul-media:/);
  expect(JSON.stringify(saved).length).toBeLessThan(10000);
  await page.getByRole('button',{name:'Close lineup media',exact:true}).click();
  await page.evaluate(
    ({ lineup, plan }) => {
      localStorage.setItem(
        "utility-lab:tactics:v1",
        JSON.stringify([
          { id: "saved-tactic", updatedAt: new Date().toISOString(), plan },
        ]),
      );
      localStorage.setItem(
        "utility-lab:playbooks:v1",
        JSON.stringify([
          {
            id: "book",
            name: "Round plan",
            notes: "Trade together",
            tacticIds: ["saved-tactic"],
            lineupIds: [lineup.id],
            steps: [
              {
                id: "step",
                title: "Smoke window",
                role: "Support",
                timing: "1:40",
                notes: "Wait for flash",
                lineupId: lineup.id,
              },
            ],
          },
        ]),
      );
    },
    { lineup: saved, plan: emptyPlan("mirage", "main") },
  );
  await page
    .getByRole("button", { name: "Workspace settings", exact: true })
    .click();
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export workspace", exact: true })
    .click();
  const download = await downloadEvent;
  await mkdir("outputs/release", { recursive: true });
  const path = resolve("outputs/release/roundtrip.json");
  await download.saveAs(path);
  const backup = JSON.parse(await readFile(path, "utf8"));
  expect(backup.lineups[0].photos[0].image).toMatch(/^data:image\//);
  expect(JSON.stringify(backup)).not.toContain("ul-media:");
  const context = await browser.newContext();
  const receiving = await context.newPage();
  try {
    await receiving.goto("http://127.0.0.1:5180/#playbooks");
    await receiving
      .getByRole("button", { name: "Workspace settings", exact: true })
      .click();
    await receiving
      .getByLabel("Workspace backup file", { exact: true })
      .setInputFiles(path);
    await expect(
      receiving.getByText(/1 tactics · 1 personal lineups · 1 playbooks/),
    ).toBeVisible();
    await receiving
      .getByRole("button", { name: "Merge backup", exact: true })
      .click();
    await expect(receiving.getByRole("status")).toContainText("Backup merged");
    await receiving
      .getByRole("button", { name: "Close workspace settings", exact: true })
      .click();
    await expect(receiving.getByRole("heading", { name: "Round plan", exact: true })).toBeVisible();
    const restored = await receiving.evaluate(() => ({
      books: JSON.parse(localStorage.getItem("utility-lab:playbooks:v1")!),
      lineups: JSON.parse(localStorage.getItem("utility-lab:utilities:v1")!),
    }));
    expect(restored.books[0]).toMatchObject({name:"Round plan",steps:[{role:"Support",timing:"1:40"}]});
    expect(restored.books[0].steps[0].lineupId).toBe(restored.lineups[0].id);
    const restoredLineup = restored.lineups.find(item => item.title === "Photo smoke");
    await receiving.goto(`http://127.0.0.1:5180/#utilities?${new URLSearchParams({map:restoredLineup.mapId,level:restoredLineup.levelId,side:restoredLineup.side,lineup:restoredLineup.id})}`);
    await expect(
      receiving.getByRole("dialog", { name: "Photo smoke", exact: true }),
    ).toBeVisible();
    await expect(
      receiving.getByAltText("Aim reference", { exact: true }),
    ).toBeVisible();
    await expect
      .poll(() =>
        receiving
          .getByAltText("Aim reference", { exact: true })
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await receiving.reload();
    await expect(
      receiving.getByAltText("Aim reference", { exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test("all supported map floors and Home backgrounds are available offline after explicit download", async ({
  page,
  context,
}) => {
  await page.goto("/#board");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page
    .getByRole("button", { name: "Workspace settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Download all maps", exact: true })
    .click();
  await expect(
    page.getByText("All supported maps and launch artwork are ready offline.", {
      exact: true,
    }),
  ).toBeVisible({ timeout: 30000 });
  await page
    .getByRole("button", { name: "Close workspace settings", exact: true })
    .click();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Change map", exact: true }).click();
  await page
    .getByRole("button", { name: "Nuke Active Duty", exact: true })
    .click();
  await page.getByRole("button", { name: "Lower", exact: true }).click();
  await expect(page.locator(".tb-map image")).toHaveAttribute(
    "href",
    "/maps/de_nuke_lower_radar_psd.png",
  );
  expect(
    await page.evaluate(async () => {
      const response = await fetch("/maps/de_nuke_lower_radar_psd.png");
      return response.ok && (await response.blob()).size > 1000;
    }),
  ).toBe(true);
  await page.getByRole("link", { name: "Utility Lab home" }).click();
  for (const scene of LAUNCH_SCENES) {
    await page.getByRole("button", { name: /^Map background:/ }).click();
    const option = page.getByRole("option", { name: scene.name, exact: true });
    await expect.poll(() => option.locator("img").evaluate(image => image.naturalWidth)).toBe(96);
    await option.click();
    const art = page.locator(".launch-art.is-loaded:not(.launch-art-previous)");
    await expect(art).toHaveAttribute("src", scene.src);
    await expect.poll(() => art.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(640);
  }
  const credits = await page.evaluate(async () => (await fetch("/art/credits.txt")).text());
  for (const scene of LAUNCH_SCENES) expect(credits).toContain(scene.name);
  await context.setOffline(false);
});

test("lineup drafts recover after reload and the board stays free of artwork and video requests", async ({
  page,
}) => {
  await page.goto("/#utilities");
  await startPersonalLineup(page);
  await page.locator('[name="lineup-title"]').fill("Unfinished guide");
  await page.locator('[name="lineup-target"]').fill("A site");
  page.once("dialog", (dialog) => void dialog.accept());
  await page.reload();
  await expect(page.locator('[name="lineup-title"]')).toHaveValue(
    "Unfinished guide",
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.goto("/#board");
  await expect(page.locator(".tb-map")).toBeVisible();
  const resources = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => entry.name),
  );
  expect(
    resources.some(
      (name) =>
        name.includes("/art/") || name.includes("youtube-nocookie"),
    ),
  ).toBe(false);
  await page.getByRole("tab", { name: "Tactic board", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("region", { name: "Utility library", exact: true }),
  ).toBeVisible();
});
