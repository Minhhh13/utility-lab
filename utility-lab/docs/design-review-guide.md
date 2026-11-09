# Utility Lab implementation and review contract

Scope: the current local CS2 launch, tactic board, Lineups, Playbooks and Stats flows. Stack: React, TypeScript and Vite. Follow the root `PRODUCT.md` and `DESIGN.md`; the [reference pack](design-references/README.md) and [additional sources](new-design-sources.md) inform execution. This is a review contract, not a claim that every check has passed.

## Current surface requirements

- The approved Utility Lab name/logo lead into a fullscreen pixel-art entry with four working destinations. Readiness feedback must reflect actual resources, never an artificial timer. The launch animation needs pause, reduced-motion and hidden-page behavior.
- Keep the board map dominant with its inspector initially closed. The picker contains only the configured Active Duty/FACEIT union: eight maps and ten levels. Old bundled artwork must not imply extra picker entries or current matchmaking availability.
- Light, Dark and System mode plus Cobalt, Ember, Mint and Rose must affect the whole workspace through semantic tokens, including canvas, radar, inspector, controls and markers. User-uploaded reference photos preserve their original appearance.
- Shared smoke, flash, molly and HE silhouettes remain recognizable at their displayed size. Small map pins use larger hit areas without pretending to show measured grenade coverage.

## Lineup media and local libraries

- Source-linked creator videos and the 68 illustrative practice records have distinct, honest status. The 16 creator examples link to eight original guides; they are not a complete or independently tested lineup database.
- Selecting a media lineup opens its viewer. A YouTube iframe loads only after an explicit player request, uses an allowlisted video ID and the privacy-enhanced embed host, and does not autoplay. Keep an original-source link available when playback fails or is unavailable.
- Photo slides use real uploads or attributed source images, with captions, previous/next controls, direct selection and keyboard navigation. Never generate or invent standing-position/aim screenshots. Validate photo counts, types and total stored size.
- Throw methods distinguish LMB, RMB, **Both buttons (LMB + RMB)**, jump and movement variants. A combined-button input must not be silently interpreted as a mouse-wheel action. Do not infer precise throw inputs from a video title or chapter name.
- Personal lineups, favorites, tactics and playbooks stay local unless exported. Save status reflects successful writes; failures retain a recovery/export path. Stats count stored workspace records and must not imply Steam/FACEIT match data, connected accounts or a backend.

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

Run the project build and meaningful state/catalogue tests. In the browser, cover launch navigation, map selection → place/move/draw → undo/redo → save → reload → export/import, both lineup sides, search/filter/favorite state, video gating, photo slides, personal-lineup saving, playbook creation and derived stats. Repeat essential editing with touch and keyboard paths, inspect themes/palettes and narrow layouts, and record observed results in [verification.md](verification.md).

Better Interface review domains: accessibility, layout, writing, typography, colors and UI polish. Record the evidence and coverage for each. A source-only check cannot establish rendered behavior; a screenshot alone cannot establish keyboard or persistence behavior. Mark physical iPhone, Steam overlay and screen-reader checks “Not verified” until run in those environments.

Rank findings HIGH/MEDIUM/LOW by user impact with file:line, current implementation, concrete fix and reason. Any remaining HIGH blocks the reviewed flow. Approval covers only inspected domains and states; this guide itself is not a claim that the app passed review.
