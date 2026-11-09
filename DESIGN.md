# Utility Lab design

The user requested a full replacement of the original dark dashboard. The approved name and logo remain; the current visual system is a planning studio with a distinct pixel-art entry.

## Surface roles

The fullscreen launch is an **Experience** surface: an illustrated pixel-art courtyard, layered smoke/embers, resource-driven readiness feedback and four direct destinations—Tactic board, Lineups, Playbooks and Stats. Animation can be paused and respects reduced motion and page visibility.

The workspaces are **Operate** surfaces. The map and the current task lead. Do not introduce marketing heroes, decorative metrics, nested cards or tiny pseudo-technical labels into the editor.

## System

- Use self-hosted **Manrope** with clear weight/size steps and readable controls. Phone text inputs remain at least 16px.
- `src/theme.css` owns semantic surface, canvas, text, border, accent and marker tokens. Light/Dark/System and Cobalt/Ember/Mint/Rose choices must update the complete workspace, including the radar treatment and inspector—not just the header.
- Light mode uses warm off-white chrome and a cool map field; dark mode uses graphite surfaces. Accent color indicates selection and primary actions. Utility and team colors carry meaning alongside labels and recognizable shapes.
- Keep one consistent SVG icon family for ordinary controls. Smoke, flash, molly and HE use the shared, recognizable grenade silhouettes in `UtilityIcon.tsx` across tools, markers, lists and statistics.

## Composition and behavior

The board opens with the inspector closed and the map filling the working area. Floating grouped tools and map/level controls stay legible without taking over the canvas. Open the Plan/Objects inspector for notes, saved tactics and exact positions. Preserve direct pointer tracking, keyboard placement/nudging, non-drag controls and undoable editing.

Lineups keep a large map beside a compact reference list on desktop. Small visible landing markers have larger invisible hit regions; they are not grenade-volume overlays. Selecting a media lineup opens a readable native viewer. Videos load on demand without autoplay. Personal screenshots form captioned slides with previous/next, direct selection and keyboard navigation. Show original creator/source links and honest validation status.

Phone layouts reorganize tools and panels rather than compressing the desktop layout. Touch controls target 44px, safe areas are respected, useful text stays selectable, and focus remains visible. Sheets, dialogs and scroll regions keep their own focus/scroll behavior. Editor motion stays restrained; the launch carries the authored visual animation.

Real map geometry and genuine lineup media are content, not decoration. Preserve linked **[Minimaps by setpos.gg](https://setpos.gg)** credit for its vector artwork. Keep creator attribution and personal-media provenance separate from application branding.

Design inputs are recorded in `utility-lab/docs/design-references/` and `utility-lab/docs/new-design-sources.md`. They inform one coherent system; unrelated brand palettes, proprietary fonts and marketing layouts are not imported wholesale.
