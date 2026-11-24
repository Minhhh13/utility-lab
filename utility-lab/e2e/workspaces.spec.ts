import { startPersonalLineup } from "./lineup-helpers";
import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

test("full-screen pixel launch offers four destinations with continuous motion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveClass(/is-loaded/);
  await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveAttribute(
    "src",
    "/art/launch-dust-cs1999.webp",
  );
  const box = await page.locator(".launch-screen").boundingBox();
  expect(box?.x).toBe(0);
  expect(box?.y).toBe(0);
  expect(box?.height).toBe(720);
  for (const name of ["Tactic board", "Lineups", "Playbooks", "Stats"])
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Pause scene|Play scene/ }),
  ).toHaveCount(0);
  await expect(page.locator(".smoke-near")).toHaveCSS(
    "animation-play-state",
    "running",
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

test.describe("landscape network recovery", () => {
  // Route abortion must reach the request rather than a service-worker response.
  test.use({ serviceWorkers: "block" });
  test("landscapes load on selection, persist, and recover from a failed choice", async ({
    page,
  }) => {
    const requestedArt = new Set<string>();
    page.on("request", (request) => {
      const path = new URL(request.url()).pathname;
      if (path.startsWith("/art/launch-")) requestedArt.add(path);
    });
    await page.goto("/");
    await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveClass(/is-loaded/);
    expect([...requestedArt]).toEqual(["/art/launch-dust-cs1999.webp"]);
    const landscape = page.getByLabel("Landscape", { exact: true });
    await expect(landscape.locator("option")).toHaveCount(6);
    for (const choice of ["dust-csgo"]) {
      await landscape.selectOption(choice);
      await expect(page.locator(".launch-screen")).toHaveAttribute(
        "data-scene",
        choice,
      );
      await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveAttribute(
        "src",
        `/art/launch-${choice}.webp`,
      );
    }
    await page.reload();
    await expect(page.locator(".launch-art:not(.launch-art-previous)")).toHaveClass(/is-loaded/);
    await expect(landscape).toHaveValue("dust-csgo");
    await expect(page.locator(".launch-screen")).toHaveAttribute(
      "data-scene",
      "dust-csgo",
    );
    await page.route("**/art/launch-dust-source.webp", (route) =>
      route.abort(),
    );
    await landscape.selectOption("dust-source");
    await expect(page.locator(".launch-scene-error")).toContainText(
      "Landscape unavailable",
    );
    await expect(landscape).toHaveValue("dust-csgo");
    await expect(page.locator(".launch-screen")).toHaveAttribute(
      "data-scene",
      "dust-csgo",
    );
    await expect(
      page.getByRole("button", { name: "Lineups", exact: true }),
    ).toBeVisible();
  });
});

test("photo-first lineups offer a compact video choice and retain map and side navigation", async ({page})=>{
 await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html',body:'<p>Test player</p>'}));
 await page.route('https://d1ntlvfrxziqo6.cloudfront.net/**',route=>route.fulfill({contentType:'image/png',path:'public/icons/icon-192.png'}));
 await page.goto('/#utilities?map=mirage&side=T&lineup=cs2tricks-mirage-t-catwalk-he');
 const viewer=page.getByRole('dialog',{name:'Catwalk HE · Back Alley',exact:true});
 await expect(viewer).toBeVisible();
 await expect(viewer.getByRole('button',{name:/^Photos/})).toHaveAttribute('aria-pressed','true');
 await expect(viewer.locator('iframe')).toHaveCount(0);
 await viewer.getByRole('button',{name:'Video',exact:true}).click();
 await viewer.getByRole('button',{name:'Load video',exact:true}).click();
 await expect(viewer.locator('iframe')).toHaveAttribute('src',/youtube-nocookie\.com\/embed\/sxUnww4n1as/);
 await viewer.getByRole('button',{name:'Close lineup media',exact:true}).click();
 await expect(page.locator('iframe')).toHaveCount(0);
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:844});
  await page.getByRole('group',{name:'Utility side',exact:true}).getByRole('button',{name:'CT side',exact:true}).click();
  await expect(page.locator('.ul-map-marker').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
 }
 await page.getByRole('button',{name:'Change map',exact:true}).click();
 await page.getByRole('button',{name:'Nuke Active Duty',exact:true}).click();
 await page.getByRole('group',{name:'Utility map level',exact:true}).getByRole('button',{name:'Lower',exact:true}).click();
 await page.reload();
 await expect(page.getByRole('group',{name:'Utility map level',exact:true}).getByRole('button',{name:'Lower',exact:true})).toHaveAttribute('aria-pressed','true');
});

test("personal photo slides retain captions and both-button throw instructions", async ({
  page,
}) => {
  await page.goto("/#utilities");
  await startPersonalLineup(page);
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
  await expect(page.locator(".app-notice")).toContainText("saved on this device");
  await expect(page.getByRole('dialog',{name:'My photo smoke',exact:true})).toBeVisible();
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
  await page.reload();
  await expect(page.getByRole('dialog',{name:'My photo smoke',exact:true})).toBeVisible();
  await expect(page.getByAltText('Standing position',{exact:true})).toBeVisible();
});

test("Coming soon Playbooks preserves saved records and stats count them", async ({ page }) => {
  await page.goto("/#board");
  await page.getByRole("button", { name: "Save tactic", exact: true }).click();
  await page.evaluate(() => {
    const tactic=JSON.parse(localStorage.getItem("utility-lab:tactics:v1"))[0];
    localStorage.setItem("utility-lab:playbooks:v1",JSON.stringify([{id:"staged-book",name:"Mirage match plan",notes:"Take space together.",tacticIds:[tactic.id],lineupIds:[],steps:[]}]))
  });
  await page.goto("/#playbooks");
  await expect(page.locator(".playbooks-coming-soon")).toContainText("Coming soon");
  await expect(page.getByRole("tab",{name:"Playbooks",exact:true})).toBeDisabled();
  await expect(page.getByRole("button",{name:"New playbook",exact:true})).toHaveCount(0);
  await page.getByRole("tab", { name: "Stats", exact: true }).click();
  await expect(page.locator(".stats-summary>div").filter({hasText:"Saved tactics"}).locator("strong")).toHaveText("1");
  await expect(page.locator(".stats-summary>div").filter({hasText:"Playbooks"}).locator("strong")).toHaveText("1");
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("utility-lab:playbooks:v1"))[0].name)).toBe("Mirage match plan");
});
