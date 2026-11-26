# Throw-from map locations

The origin catalogue checked on 26 November 2026 covers **1,558 complete guides from 1,478 original source pages**. Of these guide entries, **1,550** use a publisher start and **8** use a registered callout area. Across the catalogue, **99 distinct source pages** have starts verified in world coordinates. The Position photo gives the player a visual reference for the setup.

Only public online evidence and project files were used. No CS2/Steam process, installation, configuration or game file was accessed. The 24 November update added 53 recipes and refined 16 existing IDs. The 25 November review restored Ancient Top Mid spawn #2 from the creator’s clip and original photos, and corrected 20 guide starting positions. Media playback reviews do not establish independent throw accuracy on the current game build.

## Anubis and Dust II starts reviewed on 26 November 2026

Twenty-two Anubis guides now use the original creator’s published standing pose, including both Window mollies and the stationary Camera smoke. They use the calibration published with the displayed v22 radar. The public radar and bundled SVG have the same SHA-256. The running Camera guide continues to show its moving setup on the Upper steps. [Window from Alley](https://csnades.gg/anubis/molotovs/window-from-alley) · [Window from Ruins](https://csnades.gg/anubis/molotovs/window-from-ruins) · [Stationary Camera from Upper](https://www.cs2tricks.com/nades/anubis/smokes/a-connector-from-upper-7667)

On Dust II, three Mid Doors guides from Outside Long, T Spawn and Xbox now use their published standing poses. Four more use StellaraQwQღ’s numbered spawn recordings. Each of the four videos shows the player aligning to a marked square. We matched a first-person frame at that square to an independent recorded spawn using the image comparison described below. The winning matches covered 35–59% of the frame with 157–409 inliers. The best different physical spawn had 17–22 inliers. [Creator guide for #2](https://www.cs2tricks.com/nades/dust2/smokes/mid-doors-from-t-spawn-2-d460) · [Replay spawn coordinates](https://setpos.gg/dust2/spawns) · [Frames, coordinates and match scores](data/reviewed-world-origins.json)

| Creator’s square | Replay spawn | Throw input |
| --- | --- | --- |
| #2 | T12 | Tap W and jump, release LMB |
| #3 | T13 | Crouch, jump and release LMB |
| #4 | T14 | Jump from standing and release LMB |
| #5 | T15 | Tap W and jump, release LMB |

StellaraQwQღ describes squares #2 and #5 as “W + jumpthrow”. Utility Lab displays this input as Tap W. The clips show when to release. [Square #2](https://www.cs2tricks.com/nades/dust2/smokes/mid-doors-from-t-spawn-2-d460) · [Square #5](https://www.cs2tricks.com/nades/dust2/smokes/mid-doors-from-t-spawn-5-d314)

## Spawn coordinates reviewed on 25 November 2026

Ancient Top Mid now has all five T Spawn recipes recorded by FlockwGlock. The T Spawn pillar is a separate setup that requires moving to the pillar. On the enlarged inset, tap a number at its actual radar position. When the available space cannot accommodate independent 44 px targets, the connected choices remain available. The guide’s Position slide shows its own first-person starting frame. A dashed ring denotes an approximate setup area.

| Creator’s spawn | Matching setpos.gg spawn | World X, Y | Radar X, Y (0–1000) |
| --- | --- | --- | --- |
| #1 | T5 | −328, −2288 | 512.70, 869.53 |
| #2 | T3 | −456, −2288 | 487.70, 869.53 |
| #3 | T1 | −584, −2288 | 462.70, 869.53 |
| #4 | T4 | −392, −2224 | 500.20, 857.03 |
| #5 | T2 | −520, −2224 | 475.20, 857.03 |

Source names, assigned slots, first-frame time and SHA-256, independently matched replay URL and image, calibration, projection evidence and alternate-spawn results are captured per guide. Direct poses were also available for Mirage Window and individual Ancient and Dust II guides. The generator binds each correction to the canonical guide URL, source origin ID, map, floor and displayed artwork hash. It preserves the original category pin alongside the corrected world position in the projection report. [Review data](data/reviewed-world-origins.json) · [Creator’s Top Mid #3](https://www.cs2tricks.com/nades/ancient/smokes/top-mid-from-t-spawn-3-2799) · [Independent Ancient radar and replays](https://setpos.gg/ancient)

To reproduce the Ancient image comparison, decode the creator’s native clip at the recorded timestamp, and compare against the original Aim images of every available same-side start. Use OpenCV SIFT with up to 5,000 features on grayscale 960×540 frames. Mask the bottom 24 px and the lower-right first-person weapon area (x≥460 and y≥355). Apply a 0.72 nearest-neighbour distance ratio. Convert pixel coordinates to normalized unit bearings with center (479.5,269.5) and focal length 360. Fit 450 three-pair rotation hypotheses using SVD and seed 20261125, retain rotations with positive determinant, then refit with all inliers. Inliers have unit-bearing residual below 0.006. Compare inlier counts, convex-hull coverage and median angular error with the strongest different physical spawn. This test preserves the camera center and allows looking in another direction. Top Mid’s five correct matches have 184–1,051 inliers and median angular errors below 0.064°. The five CT Elbow clips were checked against separate recordings in the same way. All 85 Ancient and 187 Mirage distinct SVG path geometries match the reference artwork exactly. Dust II uses its previously reviewed registration. [Source frames and match statistics](data/reviewed-world-origins.json)

World coordinates convert to radar coordinates as `x=(worldX−posX)×1000/(scale×radarSize)` and `y=(posY−worldY)×1000/(scale×radarSize)`. Published replay starts and individually reviewed poses carry `precision: "world"`. Other publisher category markers and named areas show an approximate starting area, with the Position photo providing the standing reference.

## Evidence and projection

- `docs/data/publisher-destination-evidence.json`: CS2Tricks `origin.id/x/y` comes from the published category's `start_positions`, separate from `destination`.
- The four `docs/data/csnades-*-destination-evidence.json` files: CSNADES `throwFrom.x/y/levels`, separate from `throwTo` and trajectory bounces.
- `docs/data/precise-other-maps-evidence.json` and `docs/data/precise-anubis-evidence.json`: reviewed setpos.gg, GO NADE and additional CSNADES raw start points, source IDs, original media and recorded inputs. The generator projects these origins independently from their destinations. See [other-map evidence](precise-other-maps.md), [Anubis evidence](precise-anubis.md) and [Mirage/Ancient precision evidence](precise-mirage-ancient.md).
- `src/publisher-map-registrations.ts`: the same reviewed publisher radar→displayed artwork registration used for targets. Start coordinates are transformed independently through the **source floor's** registration. CSNADES normalized axes remain independent of the non-square source bitmap's pixel dimensions.
- `docs/data/lineup-origin-floor-evidence.json`: 122 CS2Tricks Nuke/Vertigo sources plus four CSNADES null-source-floor cases. Each binds the source ID, original standing photo and named source callout to a source floor. The existing destination-floor evidence is not reused as origin-floor evidence.
- `docs/data/lineup-origin-area-evidence.json`: seven original exact-guide fallbacks retain the original guide's named standing area, Position photo, author callout polygon/interior point and calibrated registration. `docs/data/precise-anubis-named-origins.json` adds the running Camera guide's reviewed Upper steps area. Cache Electro, White Box/spool, Nuke T Roof, Outside, Decon, Anubis A Plat/Plateau, Ruins and Upper steps remain **areas**, rather than invented precise feet. The running Camera guide's Position/Release frames show its moving throw.
- `docs/data/lineup-origin-projection-proof.json`: raw start point, floor basis and independently transformed result for each researched publisher source.
- `docs/data/lineup-origin-summary.json`: counts, cross-floor records, per-map bytes and hashes.

Anubis uses the reviewed setpos.gg v22 radar dated 19 November 2026. Provider-specific registrations align each source's radar with that displayed artwork; original raw points and the projection proof stay separate.

For multilevel maps the floor is resolved from the source, not the landing. All CS2Tricks Nuke origins in this batch are upper/outdoor/Ramp-room sources; the Nuke New End HE still starts upper and lands lower. Vertigo T Spawn, the lower B-stair approach and Under Stairs are lower sources; CT/Mid/site, upper ladder landing and upper-facing A ramp are upper sources. Standing references and named areas determine that classification. Source-published height, when available, is supporting evidence only; no world-Z threshold is guessed or executed in the game.

CSNADES level `1` means upper and `2` lower. Its published `[1,2]` source points retain both supported overview views with a separate transform for each. `[null]` stays invalid without a reviewed source-floor record. Canonical ordering is the publisher order, independent of the destination. `findLineupOrigin(record, lookup, preferredLevel)` uses a preferred floor only if it is actually supported by that source. It does not relocate an unsupported lower origin onto the upper target floor.

There are **24 guides** whose source's supported floor differs from the destination floor. UI integration must switch to the origin's source floor when showing the throw-from options. Source records with two publisher-supported views may use the current supported view. No connecting path is treated as a simulated grenade trajectory.

## Runtime and regeneration

`src/lineup-origins.ts` exports:

- `OriginPoint` / `OriginLookup` and `isOriginPoint` / `parseOriginLookup`.
- `loadMapOrigins(mapId)`: fetches only the selected map's `origins-{map}.json` asset, with shared cache and retry after failure.
- `findLineupOrigin(record, lookup?, preferredLevel?)` and nonmutating `attachLineupOrigins(records, lookup)`.
- `projectPublisherOrigin` for source-scoped normalized affine projection.

Source keys preserve query parameters because YouTube `v/t` and NadesDB `nade` can identify different guides. Fragments are omitted. Lookup data does not go into the initial JavaScript bundle or include full source research payloads.

After generating the expanded catalogue, run:

```sh
node --experimental-strip-types scripts/build-origin-catalogue.mjs
```

The generator refuses missing origins, missing independent floor proof, invalid coordinates, missing floor registration, or any incomplete 1,558-guide origin join before writing runtime files. The eight runtime tables contain primary catalogue sources only. Reading or regenerating the documentation report does not rebuild those tables.

## Overview preferences and complete origin choices

`src/lineup-curation.ts` exports `curateLineups(records, maxPerSpot = 4)`. Its **1,283-record preference subset** controls ordering in the quiet overview. The UI appends every other matching record before grouping map destinations. It therefore exposes all **1,558 published records** in normal browsing; the preference subset is not a landing, origin or numbered-spawn availability limit.

Preference grouping includes map, target floor, team side and utility type. A registered target callout is canonical; otherwise a valid publisher destination ID is used; otherwise the exact target name and point are kept. Simpler throws and distinct named approaches rank first, and numbered variants count as one family only for that preference calculation. No source array or saved ID is removed.

Destination choices use the complete filtered catalogue. Public scopes containing a source-confirmed spawn family share a landing choice only when map, floor, side, utility, semantic area, exact normalized target name and coverage qualifier match. Provider impact variation then stays within that one named destination. Other point-specific destinations, neighbouring names, close/far/inside/outside variants and personal guides remain separate. Raw target coordinates are retained, with a real member as the representative anchor.

Every standing recipe remains accessible. Near-overlapping source hit areas share a genuine source point and open a visual map chooser in pages of eight; a singleton opens its Position-first viewer directly. Standing points are not displaced to create spacing. The chooser's inset map links each option to its original start point, and source-confirmed spawn slots show their publisher's numbering. Mirage Window and Ancient Elbow each retain five explicit slots. Dust II Mid Doors exposes 18 T and two CT recipes. Anubis's new T-spawn families collectively cover 11 source slots without claiming that every destination supports every slot. See [the complete coverage review](catalogue-coverage-2026-11-24.md).

Personal guides follow their own saved target. A lone personal guide opens directly from that target; several saved guides use a visual **Your lineups** target action. This is a guide-opening action, not a claimed standing coordinate. Copying a publisher URL does not give a personal record that publisher's standing location. An action badge may move slightly with a leader for tap clearance, while the owner's target and published source points remain unchanged; offscreen actions remain hidden during panning.

Desktop utility filters sit on the left and zoom/pan controls on the right. Phones use compact top filters and bottom zoom controls. These controls and same-floor selections preserve the current camera. Map/origin JSON loads only for the selected map; photos load after guide selection. A separate browser-only cache can reuse 12 successfully viewed publisher photos for seven days, without a database or bulk gallery download. See [image caching](image-caching.md).

## Focused validation

```sh
node --experimental-strip-types --test tests/lineup-origins.test.ts tests/lineup-curation.test.ts tests/origin-options.test.ts
```

The focused models check all-guide coverage, independent source-point reprojection rather than copied targets, cross-floor cases and supported alternates, null-floor proof, named-area registration, query-identified source keys, nonmutation, invalid-coordinate rejection, preference ordering and complete origin-family retention. Browser suites additionally cover exact source photos, source-floor/camera preservation, pagination, keyboard focus and phone containment. Current release-gate results belong in [verification](verification.md); source media reviews and model coverage are not in-game execution.
