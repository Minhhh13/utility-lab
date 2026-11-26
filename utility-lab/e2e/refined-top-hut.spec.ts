import { test, expect } from "@playwright/test";

test("a shared Top Hut guide uses its reviewed gallery on the direct link and on the map", async ({ page }) => {
  const id = "gonade-nuke-top-hut-from-t-spawnroof-molotov";
  await page.goto("/#utilities?map=nuke&level=upper&side=T&lineup=" + id);
  const viewer = page.getByRole("dialog", { name: "Top Hut molly · T Spawn/Roof", exact: true });
  for (const entry of ["direct", "map"]) {
    await viewer.getByRole("button", { name: "Step 3: First-person aim", exact: true }).click();
    await expect(viewer.locator(".ul-photo-caption")).toContainText("third and fourth ladder rungs");
    await expect(viewer.getByRole("img", { name: "Aim here", exact: true })).toBeVisible();
    await expect(viewer.locator(".ul-step-views button")).toHaveCount(2);
    if (entry === "direct") {
      await viewer.getByRole("button", { name: "Show throw locations on map", exact: true }).click();
      const pin = page.locator('.ul-origin-pin[aria-current="location"]');
      await expect(pin).toHaveAttribute("data-origin-recipes", new RegExp(id));
      await pin.click();
      const choices = page.locator(".ul-origin-choices");
      if (await choices.isVisible()) await choices.locator('[data-lineup-id="' + id + '"]').click();
    }
  }
});
