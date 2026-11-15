# Lineups map and photo navigation verification

Verified on 15 November 2026 against the branch based on `a26b2c8`. This change is limited to Lineups navigation, its map layout, fitted radar bounds and supporting documentation.

## Result

TypeScript, the production build and all **27 unit tests passed**. Browser checks used the Codex in-app Chromium browser, including a clean production preview. The production preview loaded `index-BnSgcQsf.js` and `index-EhJwLgfj.css`; no console errors were recorded during its smoke checks.

![Lineups after the update](lineups-map-ux.png)

The capture shows the clean production preview at a 1282 × 1011 CSS-pixel viewport. It contains the existing bundled references, without the temporary personal lineup used for media tests.

## Browser checks

| Flow | Observed result |
| --- | --- |
| Wheel over the radar | Zoom changed from 100% to 127%; the fit button restored 100%. |
| Drag after zooming | The viewBox moved; no lineup dialog opened from the drag. |
| Map keyboard controls | `0` restored fit after zoom/pan. Camera bounds are also covered by the unit checks below. |
| Switching maps | Mirage, Dust II, Inferno, Nuke, Ancient, Anubis, Cache and Vertigo loaded their existing assets; changing map restored fit. |
| Switching floors | Both Nuke floors and both Vertigo floors loaded; changing floor restored 100%. |
| Radar fit | Added bounds for Nuke lower and both Vertigo floors remove outer artwork margins. All bundled target coordinates remain within their floor's fit bounds. |
| Target placement after zooming | Clicking the radar center at 200% recorded X = 510 and Y = 503, matching the current viewBox center. |
| Photo controls | Adjacent minus/plus controls worked; zoom was bounded at 400% and the plus button became disabled. |
| Photo keyboard behavior | Arrow keys panned a zoomed photo without changing its caption/slide. At fit, right arrow changed to the next slide while keeping focus in the photo viewport. |
| Changing photos | Previous/next reset the newly displayed photo to 100%, including transitions between square and wide images. |
| Independent cameras | Zooming a photo to 127% and closing it left the underlying map at its previous 200%. |
| Mixed photo/video lineup | No iframe existed before Load video. Loading created the original privacy-enhanced YouTube embed at `start=280`, without autoplay. Switching to Photos removed the iframe and opened the photo at fit. |
| Existing filters | Switching to Mirage CT and Flash displayed the existing A retake flash reference; map zoom controls remained functional. |
| Narrow viewport | At 320 × 800 CSS px, the photo toolbar and its buttons remained inside the dialog, with no horizontal overflow. Zoom buttons retain the nominal 44px touch target. |
| Page scrolling | Scrolling outside the radar moved the narrow-screen workspace without changing its 100% zoom. |
| Appearance | The new controls and helper text were inspected in Light Cobalt and Dark Mint. Existing semantic colors were retained. |

The square radar and landscape launch artwork used for personal-photo testing were explicitly labeled QA data. They are test fixtures, not standing-position or aim evidence, and are not added to the lineup catalogue.

## Layout measurements

In the 1067 × 600 CSS-pixel development comparison, the radar viewport height increased from approximately **285px to 348px**, about **22%**, with the existing reference sidebar retained. In the clean production preview, the map remained responsive and its original geometry was not stretched.

Additional inspected CSS viewports included 960 × 540 in-game mode, 1280 × 720, 390 × 843 and 320 × 800. Width and height measurements use CSS pixels; the Windows browser's device-pixel ratio means capture dimensions can differ from viewport overrides.

## Unit coverage added

- Full-map fitting in wide, short and portrait viewports.
- Preserving the pointer's map point when zooming, where bounds permit.
- Zoom limits and recovering fit after panning.
- Converting drag distance from CSS pixels without changing saved coordinates.
- Bounding pan and retaining the map after a resize.
- Independent fitting of different floors.
- Keeping every bundled lineup target within the fitted bounds for its own floor.

The existing model, import-validation, map-asset and media-validation tests continue to pass. The repository's separate automated Playwright suite was not rerun in this session; the browser results above are direct UI checks.

## Remaining limits

Physical touch gestures, Safari/WebKit and the actual Steam overlay need device testing. At fit, touch leaves page scrolling available; when zoomed, the pointer handler supports canvas pan while CSS retains browser pinch zoom. The responsive checks do not establish hardware behavior.

Video embed creation and chapter links were checked; actual playback and third-party availability were not established. No lineup was validated by throwing it in CS2.

The Cloudflare website contains features absent from this Git baseline. Reconcile that newer source before deploying these changes over the hosted build. This branch does not change hosting, accounts, storage formats, lineup content or the Tactic board.
