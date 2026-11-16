# Logo and route arrow verification — 10 November 2026

Independent source-build QA used isolated Vite on `127.0.0.1:5198`, without touching the production preview, deployment, Steam or CS2.

The existing UL monogram is complete and unboxed in the Home header and workspace header at 1440px and 320px, in light and dark modes. Rendered checks confirm a transparent background, zero border/radius, visible overflow, no clipping ancestor, and the full glyph inside the header and screen. Screenshots cover all eight combinations after the real landscape or board has loaded. The authored monogram path and installed app icons were not changed for this review.

The route arrow was drawn through the actual board UI from `(300, 500)` to `(700, 300)`, with an exact final tip. Both its inline head and rounded shaft retained Red, then Purple. A pointer ten map units away from the thin visible shaft selected and dragged the arrow through its larger transparent hit area. Recolouring and moving each undo in one step. Exporting the selected arrow produced a 1600 × 1600 PNG with matching Purple pixels sampled independently in the shaft and arrowhead, and no exported selection outline. The actual board and PNG were visually inspected.

Checks: `e2e/brand-route-polish.spec.ts` (eight logo cases and one real drawing/export case), `e2e/board-ink.spec.ts` (four cases), and `e2e/board-regressions.spec.ts` (two cases): **15/15 passed**. The nine new cases were also rerun after waiting for the actual lazy-loaded board before screenshots. No source change was needed.

Local screenshots and exported PNG: `outputs/aim-placement-20261110/brand-route-results/`. Isolated runner configuration: `outputs/aim-placement-20261110/playwright.polish.config.ts`. Root still owns final production build and full-suite validation.
