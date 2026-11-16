# Throw-from map locations

The 10 November 2026 origin catalogue resolves all **1,504 complete guides / 1,424 original source pages**. Of these entries, **1,497** use the original publisher's distinct start/throwFrom coordinate, and **7** use an explicitly named, registered origin area. The Position photo remains the exact standing reference; a map pin is a navigation aid, not a claim of centimetre-level foot placement.

Only existing public online evidence and project files were used. No CS2/Steam process, installation, configuration or game file was accessed. Existing photos, videos, targets and catalogue IDs are unchanged by this work.

## Evidence and projection

- `docs/data/publisher-destination-evidence.json`: CS2Tricks `origin.id/x/y` comes from the published category's `start_positions`, separate from `destination`.
- The four `docs/data/csnades-*-destination-evidence.json` files: CSNADES `throwFrom.x/y/levels`, separate from `throwTo` and trajectory bounces.
- `src/publisher-map-registrations.ts`: the same reviewed publisher radar→displayed artwork registration used for targets. Start coordinates are transformed independently through the **source floor's** registration. CSNADES normalized axes remain independent of the non-square source bitmap's pixel dimensions.
- `docs/data/lineup-origin-floor-evidence.json`: 122 CS2Tricks Nuke/Vertigo sources plus four CSNADES null-source-floor cases. Each binds the source ID, original standing photo and named source callout to a source floor. The existing destination-floor evidence is not reused as origin-floor evidence.
- `docs/data/lineup-origin-area-evidence.json`: seven exact-guide fallbacks retain the original guide's named standing area, Position photo, author callout polygon/interior point and calibrated registration. Cache Electro, White Box/spool, Nuke T Roof, Outside, Decon, Anubis A Plat/Plateau and Ruins are kept as **areas**, rather than invented precise feet.
- `docs/data/lineup-origin-projection-proof.json`: raw start point, floor basis and independently transformed result for each researched publisher source.
- `docs/data/lineup-origin-summary.json`: counts, cross-floor records, per-map bytes and hashes.

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

The generator refuses missing origins, missing independent floor proof, invalid coordinates, missing floor registration, or any incomplete 1,504-guide origin join before writing runtime files. The eight runtime tables contain primary catalogue sources only.

## Default curation

`src/lineup-curation.ts` exports `curateLineups(records, maxPerSpot = 4)`. This is a display selection; the source array stays complete for saved guides, favorites and links.

Grouping includes map, target floor, team side and utility type. An exact registered target callout is canonical; otherwise a valid publisher destination ID is used; otherwise the exact target name and point are kept. Neighbouring named close/far/left/right targets are not averaged together. Distinct input target positions remain intact.

Within one target/side/type group, standing LMB/RMB throws rank before crouch, jump, walking and running variants. Distinct named origins are selected first. Numbered spawn variants such as Top Mid Spawn #1–#4 count as one origin family, so they cannot crowd out other approaches. Remaining spaces may be filled from the same family up to four total. Ordering is deterministic across file/provider input order. A user's custom guides are retained separately from the publisher limit.

Current defaults select **1,258 of 1,504** complete entries; all 1,504 remain available in the original catalogue.

## Focused validation

```sh
node --experimental-strip-types --test tests/lineup-origins.test.ts tests/lineup-curation.test.ts
```

Ten tests pass. They check all-guide coverage, every CS2Tricks and CSNADES source-point reprojection rather than copied targets, cross-floor cases and supported alternates, independent null-floor proof, seven area registrations, query-identified source keys, nonmutation, invalid coordinate rejection, four-per-spot defaults, simple/distinct-origin preference and retention of custom records.
