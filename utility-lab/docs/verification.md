# Local draft verification

Checked 9 November 2026. Scope: the local tactic board, from choosing a map through editing, saving and transferring a plan. Utility lineups and the full playbook are later work.

- Production build and TypeScript check passed. Application JavaScript is approximately 79 KB gzip; CSS approximately 8 KB gzip. The self-hosted Latin variable font is 48 KB. Full-size radar assets load for the selected map/level; the map picker uses small thumbnails.
- Eight model/catalogue tests passed: undo/redo branching, bounded route translation, independent route endpoints, malformed import rejection, bounded raster data, corrupt saved-record isolation, local artwork resolution, and multi-level/game-mode coverage.
- Four isolated Microsoft Edge browser tests passed: complete edit/save/reload/map-floor/export/import flow; 390px and 320px layout and touch targets; production offline reload after installation; desktop layout and local artwork.
- Browser flow exercised keyboard placement/nudging, pointer route drawing, clear/undo, named saving, map-switch draft recovery, Nuke lower radar, JSON download/import and PNG download.
- Desktop at 1280×720 had no page overflow. Phone at 320px had no horizontal page overflow with a loaded tactic and four title actions. Phone toolbar targets measured 44×44px and notes text measured 16px. The map drawer manages focus, Escape, and inert background content.
- The offline test found a same-origin static-cache mismatch caused by a preview server's `Vary: Origin` header. Matching cached static assets with `ignoreVary` fixed the failure; offline reload subsequently passed.

The source review used the six Better Interface domains and the requested Apple/Superfuture guidance. Its actionable findings were addressed: offscreen focus, non-drag position editing, session recovery on storage failure, persistent notifications, linked map credit, phone typography, touch controls, and wrapping actions. The Impeccable detector reported a font familiarity warning for Inter. The neutral app font is retained deliberately for legibility and compact local delivery; this is a style warning, not a failed accessibility check.

Text token contrast was calculated in the source review and passed. Live desktop/phone renders were inspected. Physical iPhone gestures, Safari/WebKit, the real Steam overlay, screen-reader use, storage exhaustion in a real browser, and native iOS compilation are **not verified**. No specific in-game FPS or device performance claim is made.

Screenshots: [desktop](preview-desktop.png), [phone](preview-phone.png).
