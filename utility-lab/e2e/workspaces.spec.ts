import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

test("full-screen pixel launch offers four destinations with pausable motion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".launch-screen")).toHaveClass(/is-ready/);
  await expect(page.locator(".launch-art")).toHaveAttribute(
    "src",
    "/art/launch-pixel.png",
  );
  const box = await page.locator(".launch-screen").boundingBox();
  expect(box?.x).toBe(0);
  expect(box?.y).toBe(0);
  expect(box?.height).toBe(720);
  for (const name of ["Tactic board", "Lineups", "Playbooks", "Stats"])
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Pause scene", exact: true }).click();
  await expect(page.locator(".launch-screen")).toHaveClass(/scene-paused/);
  await expect(page.locator(".smoke-near")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  mkdirSync("outputs/overhaul", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: "outputs/overhaul/launch-1440.png" });
  for (const size of [
    { width: 390, height: 844 },
    { width: 320, height: 800 },
  ]) {
    await page.setViewportSize(size);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(size.width);
    for (const name of ["Tactic board", "Lineups", "Playbooks", "Stats"])
      await expect(
        page.getByRole("button", { name, exact: true }),
      ).toBeInViewport();
    await page.screenshot({
      path: `outputs/overhaul/launch-${size.width}.png`,
    });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".smoke-near")).toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "Lineups", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Utility library", exact: true }),
  ).toBeVisible();
});

test("lineups filter by side and open an attributed video only on demand", async ({
  page,
}) => {
  await page.goto("/#utilities");
  await page
    .getByRole("button", { name: "Open Jungle smoke", exact: true })
    .click();
  const viewer = page.getByRole("dialog", {
    name: "Jungle smoke",
    exact: true,
  });
  await expect(viewer).toBeVisible();
  await expect(
    viewer.getByRole("heading", { name: "Jungle smoke", exact: true }),
  ).toBeVisible();
  await expect(viewer.locator("iframe")).toHaveCount(0);
  await page.screenshot({ path: "outputs/overhaul/lineup-viewer-1280.png" });
  await page.getByRole("button", { name: "Load video", exact: true }).click();
  await expect(
    page.getByTitle("Jungle smoke video guide", { exact: true }),
  ).toHaveAttribute(
    "src",
    /youtube-nocookie\.com\/embed\/MJ-dtTYTUS8\?start=280/,
  );
  await expect(
    page.getByRole("link", { name: /Open original video/ }),
  ).toHaveAttribute("href", /youtube\.com\/watch/);
  await page
    .getByRole("button", { name: "Close lineup media", exact: true })
    .click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page
    .getByRole("group", { name: "Utility side", exact: true })
    .getByRole("button", { name: "CT side", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Open Palace smoke", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open Jungle smoke", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("group", { name: "Utility type", exact: true })
    .getByRole("button", { name: /^Molly/ })
    .click();
  await expect(
    page.getByRole("button", { name: "Open Palace fire", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("group", { name: "Utility type", exact: true })
    .getByRole("button", { name: /^All/ })
    .click();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "outputs/overhaul/lineups-1280.png" });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await page
      .getByRole("button", { name: "Open Palace smoke", exact: true })
      .click();
    const phoneViewer = page.getByRole("dialog", {
      name: "Palace smoke",
      exact: true,
    });
    await expect(phoneViewer).toBeVisible();
    await expect(
      phoneViewer.getByRole("button", { name: "Load video", exact: true }),
    ).toBeInViewport();
    await expect(
      phoneViewer.getByRole("button", {
        name: "Close lineup media",
        exact: true,
      }),
    ).toBeInViewport();
    await page.screenshot({
      path: `outputs/overhaul/lineup-viewer-${width}.png`,
    });
    await page.keyboard.press("Escape");
    await expect(phoneViewer).not.toBeVisible();
    await page.screenshot({
      path: `outputs/overhaul/lineups-${width}.png`,
      fullPage: true,
    });
  }
});

test("personal photo slides retain captions and both-button throw instructions", async ({
  page,
}) => {
  await page.goto("/#utilities");
  await page.getByRole("button", { name: "Add lineup", exact: true }).click();
  await page.locator('[name="lineup-title"]').fill("My photo smoke");
  await page.locator('[name="lineup-target"]').fill("Window");
  await page.locator('[name="lineup-from"]').fill("T spawn");
  await page
    .locator('[name="lineup-steps"]')
    .fill(
      "Stand in the corner.\nAim at the marked edge.\nJump and release both buttons.",
    );
  await page
    .getByLabel("Throw method", { exact: true })
    .selectOption("Both buttons (LMB + RMB)");
  await page
    .getByLabel("Lineup screenshot file", { exact: true })
    .setInputFiles([
      resolve("public/icons/icon-192.png"),
      resolve("public/icons/apple-touch-icon.png"),
    ]);
  await page
    .getByLabel("Photo 1 caption", { exact: true })
    .fill("Standing position");
  await page
    .getByLabel("Photo 2 caption", { exact: true })
    .fill("Aim reference");
  await page.getByRole("button", { name: "Save lineup", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("saved on this device");
  await page
    .getByRole("button", { name: "Open My photo smoke", exact: true })
    .click();
  await expect(
    page.getByAltText("Standing position", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(
    page.getByAltText("Aim reference", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Both buttons (LMB + RMB)", { exact: true }).last(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Close lineup media", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Open My photo smoke", exact: true }),
  ).toBeVisible();
});

test("playbooks contain saved tactics and stats count actual local records", async ({
  page,
}) => {
  await page.goto("/#board");
  await page.getByRole("button", { name: "Save tactic", exact: true }).click();
  await page.getByRole("tab", { name: "Playbooks", exact: true }).click();
  await page.getByRole("button", { name: "New playbook", exact: true }).click();
  await page
    .getByLabel("Playbook name", { exact: true })
    .fill("Mirage match plan");
  await page
    .getByLabel("Team notes", { exact: true })
    .fill("Take space together.");
  await page.getByRole("checkbox", { name: /A site execute/ }).check();
  await page.getByRole("tab", { name: "Stats", exact: true }).click();
  await page.getByRole("tab", { name: "Playbooks", exact: true }).click();
  await expect(page.getByLabel("Playbook name", { exact: true })).toHaveValue(
    "Mirage match plan",
  );
  await expect(
    page.getByRole("checkbox", { name: /A site execute/ }),
  ).toBeChecked();
  await page
    .getByRole("button", { name: "Save playbook", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Mirage match plan", exact: true }),
  ).toBeVisible();
  await page.locator(".playbook-tactic").click();
  await expect(page.getByLabel("Strategy name", { exact: true })).toHaveValue(
    "A site execute",
  );
  await expect(
    page.getByRole("button", { name: "Update tactic", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Stats", exact: true }).click();
  await expect(
    page
      .locator(".stats-summary>div")
      .filter({ hasText: "Saved tactics" })
      .locator("strong"),
  ).toHaveText("1");
  await expect(
    page
      .locator(".stats-summary>div")
      .filter({ hasText: "Playbooks" })
      .locator("strong"),
  ).toHaveText("1");
});
