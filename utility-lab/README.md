# Utility Lab

A local-first CS2 tactic board and utility library.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

These commands do not deploy the website.

## Preserved published baseline

The owner's Cloudflare build was newer than GitHub `main` at `a26b2c8`.
This branch preserves that published application and its **1,500 lineup records**,
eight map catalogues, standing-position anchors, **418 local photos**, external
creator media and original target → utility → throw-position flow. Photos retain
Position/Aim/Landing steps, aim annotations, captions, attribution and video links.
Mirage T contains 165 references: 107 Smoke, 24 Flash, 25 Molly and 9 HE.

The matching authored source was unavailable. The active entry therefore uses a
reproducible snapshot in `src/published-app/`, adapted to the repo's installed
React/React DOM/Lucide packages. The old authored components remain for reference.
See [snapshot provenance and regeneration](tools/published-snapshot/README.md).
Replace the snapshot with the matching authored source when it becomes available.

```sh
node tools/published-snapshot/restore.mjs --check
```

The earlier Lineups edits are limited to a larger desktop map, adjacent
minus/plus buttons in the existing map and photo toolbars, and wheel input for the
existing photo camera. Map wheel zoom/pan already belongs to the published build.
The photo hook keeps its original 100–400% range and slide-reset behavior.

The original Tactic board, Stats, Display, Workspace backup tools, appearance and
local storage formats are retained. Playbooks remains the published Coming soon
entry. This branch does not enable a different Playbooks implementation.

## Tactic board rehearsal

Choose **Tactic board → Simulate** to rehearse both sides on the current map and
floor, or try the built-in flash drill. Players, utility markers and nearby
route arrows seed an editable rehearsal. Assign waypoints, movement speed, start
time and facing; set when grenades take effect and scrub the same round forward
or backward. Icon size is for readability; effect areas and timing use map units.
See the [Vietnamese setup and calibration guide](docs/tactic-simulation.vi.md).

Rehearsals save separately on this device. They belong to the layout used to
open them; changing player/utility/route geometry starts a different draft.
Use **Export rehearsal** to carry a run across layout changes or send it to a
teammate; **Import rehearsal** requires the same map and floor. Tactic JSON and
workspace backups do not include rehearsals. The example drill does not replace
your draft. The simulator uses timed 2D paths and manually drawn cover; compare
actual throws, sightlines and timing with a practice server.

## Verification and follow-up

See [current browser and data verification](docs/lineups-map-ux-verification.md)
and [Vietnamese UI/UX priorities](docs/lineups-ux-review.vi.md).
Unit tests pin the exact catalogue and media bytes against the published snapshot.
The separate historical Playwright suite targets the older authored UI and was
not run against this recovered baseline; current UI evidence is recorded directly.

Browser-local personal records are not copied from the website. Existing local
storage keys and media storage remain unchanged. Records do not sync across
origins or devices; export important data before clearing browser storage.
External creator videos/photos still require their original hosts. Physical
iPhone/Safari and Steam-overlay testing remain separate from desktop responsive
checks. No lineup was verified by throwing it in CS2.

The existing [Capacitor iOS project](ios/README.md) is retained. It has not been
compiled or signed in this session.
