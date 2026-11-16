# Compact Lineups canvas

Implemented locally on 16 November 2026 from the user's shared conversation: move Lineups controls onto the map, reduce unused vertical space, keep the existing content and selection flow, place photo zoom buttons together and support the scroll wheel.

The global navigation, Display settings and other workspaces retain their existing layout. `src/lineups-canvas.css` scopes the floating treatment to normal map browsing; personal-guide editing retains its existing form layout. The canvas fills the workspace, with map/side/Suggest at top left, floor/context at the opposite edge, utility filters and Saved in a floating dock, and zoom/instructions/attribution along the bottom. Responsive arrangements keep controls reachable down to 320px and in a 960×540 window. A hidden accessible heading and navigation instructions remain available to assistive technology.

`src/PhotoZoom.tsx` now uses local, non-passive wheel events and a pre-paint camera commit. Pixel, line and page wheel deltas share the same 100–400% range. The pointer's image location anchors zoom; rapid direction changes replace pending camera intentions instead of queuing stale animation frames. Zoom buttons are adjacent; Fit/percentage is separate. Photo order, source media, crosshair coordinates, video loading, captions, keys, swiping and keyboard pan are preserved.

## Verification

- Production build and TypeScript pass; all 147 content/model checks pass.
- Final browser runs pass: **51 Edge checks and 16 WebKit checks**, with zero failures. Logs: `final-edge.log`, `final-webkit.log` and `final-build.log` under `outputs/compact-lineups/`.
- All eight maps' default Fit pins are checked for actual pointer hit-testing under the floating controls. Separate cases cover Inferno/Nuke at 1440×810, 1280×960, 768×1024, 320×844 and 960×540, plus multi-select and camera preservation through photos and Back.
- Existing Edge browser coverage includes display/aspect/header behavior, all map/floor/side catalogues, guide actions, photo Fit, repeated photo stability, swipe/drag, pointer/keyboard focus and selection camera preservation.
- The new layout and photo-wheel cases also run in WebKit alongside existing phone checks. This is browser emulation, not physical iPhone or Steam-overlay testing.
- Captures, geometry, browser logs and the Impeccable detector report are under ignored `outputs/compact-lineups/`. The detector reported no findings. All shipped visual content is the existing source media or original map artwork; the screenshots are renders of the local app.

The first Edge run identified 40px tablet zoom hit widths and an incorrect new test assumption that compact desktop navigation should disappear. The hit widths were corrected to 44px and the test now verifies the existing visible navigation. Visual review also corrected selected floor/Saved colors on soft accent surfaces. Final narrow-photo review checks real control hit-testing and containment, rather than accepting partially visible controls.

The user subsequently requested removal of the Local workspace badge/green dot and authorized both a Git push and publication to utilitylab.au. The complete production-check workflow gates the filtered release. No CS2 launch, game-file access or gameplay integration is involved.
