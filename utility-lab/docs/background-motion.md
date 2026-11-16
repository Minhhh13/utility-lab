# Classic landscape moving parts — 10 November 2026

Home now has three small lane-smoke wisps and two windblown ground-sand gusts, in addition to the existing slow camera/light drift and pixel dust. These reuse the unchanged local `pixel-smoke.png`; no new artwork or third-party requests are added. Placement follows each of the three selected classic Dust landscapes. Only the selected scene is downloaded.

Lane wisps rise, expand slightly and fade over staggered 16/21/24-second loops. Ground gusts travel sideways over 14/21 seconds; small dust particles also drift farther horizontally. Predetermined CSS animations use transform and opacity, with no React updates per frame. The scenery is decorative, and its layers cannot intercept clicks. The tactic board and lineup map stay steady.

All environmental animation pauses when the page is hidden. Reduced-motion mode leaves faint static lane haze and removes ground wind/dust movement. There are no extra switches, scenes or instruction text.

Verification: `e2e/background-motion.spec.ts` passed both focused Edge checks. All three scenes, a320px phone layout, hidden-page pause, reduced motion, noninteractive overlays, selected-scene-only artwork requests and removal on navigation to the tactic board are covered. TypeScript passed. Visual screenshots are in `outputs/background-motion/`; an actual normal-speed six-second recording and frames0/3/6 are in `outputs/background-motion/normal-speed/`. The first lane wisp moves about35px upward and15px sideways during that six-second sample, with visible rising/fading smoke in the scene.

No Steam, CS2, game process, installation or game file was accessed. Root owns final production build/package verification.
