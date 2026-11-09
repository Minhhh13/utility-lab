# Tactic-board implementation and review contract

Scope: the first local CS2 tactic-board flow, from selecting a map through editing, saving, reopening and exporting a strategy. Stack: React, TypeScript and Vite. Follow the root `PRODUCT.md` and `DESIGN.md`; the sources in [design-references](design-references/README.md) inform execution. Utility lineups and a full playbook are later surfaces.

## Interaction

- Begin with the map, selected level, tool and strategy name visible. Clearly distinguish available map artwork from missing artwork and historical maps. Never substitute invented geometry.
- Track pointer movement directly with `setPointerCapture`; preserve the grab offset. Do not apply CSS transitions to dragged coordinates. Avoid debounces, timers and decorative entrances on editing paths.
- Provide Select/Move, route, drawing, players and utility placement. Active tools need a static selected cue plus a readable name. T/CT and utility types need text or distinct symbols as well as colors.
- Every drag task needs a single-pointer alternative under WCAG 2.5.7; keyboard access alone does not meet that specific requirement. Useful alternatives include selecting an object, editing coordinates and nudging with buttons. Also support keyboard selection, movement and deletion.
- Keep editing shortcuts scoped away from text inputs. Support Ctrl/Cmd+Z and redo. Escape cancels the pending operation or closes a temporary panel, preserving completed work.
- Treat a continuous drag or stroke as one undo step. Clearing a board must be undoable or confirmed. Switching maps, levels or strategies must not silently discard a draft.
- Report storage failures with a persistent recovery action, such as exporting the strategy. A saved indicator must reflect an actual successful write.

## Access and layout

- Use native buttons, inputs, labels, selects and dialogs. Icon-only controls need action names. Associate field errors with the input; announce nonurgent save/import status through an existing `role="status"` region.
- Keep a visible keyboard focus indicator. Verify at least 3:1 contrast against adjacent colors for the custom focus ring and meaningful control outlines.
- Target 44×44 CSS pixels on phones, with no overlapping hit regions; WCAG 2.5.8's AA baseline is 24×24 or a documented exception. Keep touch-only affordances independent of hover.
- Test 320px, an iPhone-like width around 390px, a tablet width, desktop and 200% zoom. Controls and ordinary text must remain reachable without horizontal page scrolling. A spatial map may pan, but that does not excuse clipped editing controls.
- Use `minmax(0,1fr)` and `min-width:0` for shrinking work areas. Let long strategy names wrap or expose the complete name. Use `100dvh` with a fallback and account for safe areas.
- Make dialogs close with Escape, keep focus within them while modal and restore focus to the trigger. Keep destructive actions away from routine editing actions.

## Type, color and motion

- Use a small semantic type scale with unitless line heights. Use weight 400 or heavier below 18px; use at least 1.4 line height for text that can wrap to three lines.
- Keep phone inputs at 16px or greater to prevent Safari focus zoom. Respect browser text sizing and zoom; never disable zoom in the viewport meta.
- Measure the rendered text/background pair, including alpha composition. Body/control text needs 4.5:1; large text (24px or 18.67px bold) needs 3:1. Meaningful graphics/control states need 3:1. Inactive controls are exempt from those contrast thresholds.
- Reuse semantic color tokens. Use one primary filled action per view when fill signals emphasis; categorical board colors may coexist because they encode different objects.
- Use one SVG icon family with consistent stroke weight. No emoji or unrelated glyphs as editing icons.
- Keep routine feedback instant or at most 150ms. Use explicit transition properties. Restrict any movement/scale to `prefers-reduced-motion:no-preference`; provide a static cue either way.
- Preserve selectable useful text. Apply `user-select:none` and `touch-action:none` only to the manipulation surface, not the whole application.

## Copy and state coverage

- Use one vocabulary: map, level, strategy, player, route and utility. Use sentence-case action labels such as “Save strategy” and “Export strategy”.
- Empty map searches name the query and provide a clear-filter action. An empty board explains one next editing step. Missing artwork offers a truthful import path.
- Invalid imports explain the accepted file format and how to recover. Never show “saved”, “copied” or “exported” before the operation has actually succeeded.
- Cover hover, focus, pressed, selected, disabled, empty, loading and error states that exist. No action or error should disappear on a timer before it can be read.

## Verification record

Run the project build and meaningful board-state tests. In the browser, complete map selection → place/move/draw → undo/redo → save → reload → export/import. Repeat essential editing with touch and keyboard paths. Inspect narrow layouts and computed sizes/contrast, then document observed results.

Better Interface review domains: accessibility, layout, writing, typography, colors and UI polish. Record the evidence and coverage for each. A source-only check cannot establish rendered behavior; a screenshot alone cannot establish keyboard or persistence behavior. Mark physical iPhone, Steam overlay and screen-reader checks “Not verified” until run in those environments.

Rank findings HIGH/MEDIUM/LOW by user impact with file:line, current implementation, concrete fix and reason. Any remaining HIGH blocks the reviewed flow. Approval covers only inspected domains and states; this guide itself is not a claim that the app passed review.
