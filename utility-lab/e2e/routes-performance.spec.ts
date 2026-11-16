import { test, expect } from "@playwright/test";

// Offline installation intentionally precaches chunks in the background.
// These checks isolate modules requested by the visible page itself.
test.use({ serviceWorkers: "block" });

for (const view of ["home", "board"] as const) {
  test(`${view} opens without loading the guide catalogue or lineup media`, async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto(`/#${view}`);
    await expect(
      page.locator(view === "home" ? ".launch-screen" : "svg.tb-map"),
    ).toBeVisible();
    expect(
      requests.filter((url) => /\/assets\/guide-library-[^/]+\.js/.test(url)),
    ).toEqual([]);
    expect(
      requests.filter((url) =>
        /\/lineup-media\/|youtube(?:-nocookie)?\.com|\.mp4(?:[?#]|$)/.test(url),
      ),
    ).toEqual([]);
    expect(
      await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .some((entry) =>
            /\/assets\/guide-library-[^/]+\.js/.test(entry.name),
          ),
      ),
    ).toBe(false);
  });
}

test("fresh photo and creator links resolve their actual map, side, floor and media", async ({
  page,
}) => {
  await page.goto(
    "/#utilities?map=mirage&level=main&side=T&lineup=compendium-mirage-palace-jungle",
  );
  const photo = page.getByRole("dialog", {
    name: "Jungle smoke · Palace Alley",
    exact: true,
  });
  await expect(photo).toBeVisible();
  await expect(photo.locator(".ul-photo-canvas img")).toBeVisible();
  await page.goto(
    "/#utilities?map=nuke&level=upper&side=T&lineup=creator-nuke-lower-ct-site-smoke",
  );
  const creator = page.getByRole("dialog", {
    name: "Lower site smoke from Decon",
    exact: true,
  });
  await expect(creator).toBeVisible();
  await expect(
    creator.getByRole("button", { name: "Load video", exact: true }),
  ).toBeVisible();
  await expect(creator.locator("iframe, video")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Close lineup media", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "CT side", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Lower", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("svg.ul-map-svg image")).toHaveAttribute(
    "href",
    /nuke_lower/,
  );
});

test("a catalogue resolving after navigation cannot reopen a stale guide", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested!: (url: string) => void;
  const pending = new Promise<string>((resolve) => {
    requested = resolve;
  });
  await page.route("**/assets/guide-library-*.js", async (route) => {
    requested(route.request().url());
    await gate;
    await route.continue();
  });
  await page.goto(
    "/#utilities?map=mirage&level=main&side=T&lineup=compendium-mirage-palace-jungle",
    { waitUntil: "domcontentloaded" },
  );
  const catalogueUrl = await pending;
  await page.getByRole("tab", { name: "Tactic board", exact: true }).click();
  await expect(page.locator("svg.tb-map")).toBeVisible();
  release();
  await page.evaluate(async (url) => {
    await import(/* @vite-ignore */ url);
  }, catalogueUrl);
  await expect(page).toHaveURL(/#board$/);
  await expect(page.locator("svg.tb-map")).toBeVisible();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(page.locator(".utility-library")).toHaveCount(0);
});
