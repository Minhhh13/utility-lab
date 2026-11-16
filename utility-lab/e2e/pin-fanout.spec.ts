import { chooseLandingSpot, waitForUtilityChoice } from "./lineup-helpers";
import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.use({ serviceWorkers: 'block' });
const picker = (page: Page) => page.getByRole('dialog', { name: 'Choose utility', exact: true });
const choices = (page: Page) => picker(page).getByRole('group', { name: 'Utility types at this target', exact: true }).getByRole('button');

async function setup(page: Page) {
  const pixel = await readFile('public/icons/icon-192.png');
  await page.route(/^https:\/\//, route => route.request().resourceType() === 'image'
    ? route.fulfill({ contentType: 'image/png', body: pixel }) : route.abort());
  await page.addInitScript(() => {
    const calls: { duration: number; from: unknown; to: unknown }[] = [];
    (window as typeof window & { fanAnimations: typeof calls }).fanAnimations = calls;
    const original = Element.prototype.animate;
    Element.prototype.animate = function (frames, settings) {
      if (this.classList.contains('ul-marker-choice-leaf') && Array.isArray(frames))
        calls.push({ duration: typeof settings === 'object' ? Number(settings?.duration) : Number(settings), from: frames[0]?.transform, to: frames.at(-1)?.transform });
      return original.call(this, frames, settings);
    };
  });
  await page.goto('/#utilities?map=nuke&level=upper&side=T');
  await expect(page.locator('.ul-map-marker').first()).toBeVisible();
}

async function openMixed(page: Page) {
  const pins = page.locator('.ul-map-marker');
  const index=await pins.evaluateAll(nodes=>nodes.findIndex(node=>node.querySelectorAll('.ul-target-marker [data-utility]').length>1));
  expect(index,'Nuke exposes a genuinely mixed-kind group').toBeGreaterThanOrEqual(0);
  const pin=pins.nth(index);await pin.locator('.ul-marker-hit').click();await waitForUtilityChoice(page);
  await expect(picker(page)).toBeVisible();expect(await choices(page).count()).toBeGreaterThan(1);return pin;
}

test('target group opens utility choices, then actual throw locations, then photos', async ({ page }, info) => {
  await setup(page);
  const map = page.locator('.ul-map-svg');
  const before = await map.boundingBox();
  await openMixed(page);
  const count = await choices(page).count();
  expect(count).toBeGreaterThan(1);
  expect(count).toBeLessThanOrEqual(4);
  await expect(picker(page).locator('.ul-marker-choice-hub')).toHaveCount(1);
  await expect(picker(page).locator('.ul-marker-choice-connections line')).toHaveCount(count);
  await expect(page.locator('.ul-cluster-count')).toHaveCount(0);
  await expect(picker(page).locator('.ul-marker-choice-from, .ul-marker-choice-count')).toHaveCount(0);
  for (const button of await choices(page).all()) {
    await expect(button.locator('.ul-marker-choice-disc')).toBeVisible();
    expect(await button.getAttribute('aria-label')).toMatch(/^(Smoke|Flash|Molly|HE)$/);
  }
  const motion = await page.evaluate(() => (window as typeof window & { fanAnimations: { duration: number; from: string; to: string }[] }).fanAnimations);
  expect(motion.length).toBeGreaterThan(0);
  expect(motion.every(row => row.duration >= 180 && row.duration <= 220 && row.from.startsWith('translate(') && row.to === 'translate(0px, 0px)')).toBe(true);
  expect(await map.boundingBox()).toEqual(before);
  await expect(page.locator('.ul-media-dialog')).not.toBeVisible();
  await expect(page.locator('iframe, video')).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('utility-fanout-desktop.png') });
  await choices(page).first().click();
  await expect(picker(page)).toHaveCount(0);
  await chooseLandingSpot(page);
  const origins = page.getByRole('group', { name: 'Throw-from locations', exact: true }).getByRole('button', { name: /^Throw from / });
  await expect(origins.first()).toBeVisible();
  expect(await origins.count()).toBeLessThanOrEqual(4);
  await expect(page.locator('.ul-media-dialog')).not.toBeVisible();
  await origins.first().click();
  const viewer = page.locator('.ul-media-dialog');
  await expect(viewer).toBeVisible();
  await expect(viewer.getByRole('button', { name: /^Photos/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(viewer.locator('iframe, video')).toHaveCount(0);
});

test('keyboard and reduced-motion choices are immediate and restore focus on dismissal', async ({ page }) => {
  await setup(page);
  const pin = page.locator('.ul-map-marker').first();
  await pin.focus(); await pin.press('Enter');
  await waitForUtilityChoice(page);
  await expect(picker(page)).toBeVisible();
  await expect(choices(page).first()).toBeFocused();
  expect(await page.evaluate(() => (window as typeof window & { fanAnimations: unknown[] }).fanAnimations.length)).toBe(0);
  await page.keyboard.press('End'); await expect(choices(page).last()).toBeFocused();
  await page.keyboard.press('Home'); await expect(choices(page).first()).toBeFocused();
  await page.keyboard.press('ArrowRight');
  if (await choices(page).count() > 1) await expect(choices(page).nth(1)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(picker(page)).toHaveCount(0); await expect(pin).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await pin.click(); await waitForUtilityChoice(page); await expect(picker(page)).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { fanAnimations: unknown[] }).fanAnimations.length)).toBe(0);
  // The map-only layout keeps the heading accessible without a visible header.
  // Clicking clear canvas outside the chooser must still dismiss it and return focus.
  await page.locator('.ul-map-stage').click({position:{x:8,y:8}});
  await expect(picker(page)).toHaveCount(0); await expect(pin).toBeFocused();
});

for (const width of [390, 320]) test(`utility fanout fits ${width}px with clear, large touch choices`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 780 });
  await setup(page); await openMixed(page);
  const bounds = (await picker(page).boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(11);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 11);
  expect(bounds.y).toBeGreaterThanOrEqual(11);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(769);
  for (const button of await choices(page).all()) {
    const target = (await button.boundingBox())!;
    expect(target.width).toBeGreaterThanOrEqual(44); expect(target.height).toBeGreaterThanOrEqual(44);
    await expect(button).toBeInViewport();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  expect(await picker(page).evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  await page.screenshot({ path: info.outputPath(`utility-fanout-${width}.png`) });
  await picker(page).getByRole('button', { name: 'Close utility choices', exact: true }).click();
  await expect(picker(page)).toHaveCount(0);
});
