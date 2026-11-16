# Target callout registration

Current release: **1,504 primary entries, all with registered target-area pins**. Direct publisher endpoints use 16 source-art registrations across eight maps/ten floors. The named-area registry now contains 126 anchors. [Independent stored-coordinate review](map-registration-publisher-independent-review.md) covers both publisher frames and the four completed legacy GO NADE guides.

CSNADES radars are nonsquare bitmaps with independently normalized logical X/Y axes; the actual image aspect ratio is included in registration. Neither origin points nor an identity bitmap scale is substituted for destinations. Four null-floor Nuke records have original landing evidence; three Vertigo targets were corrected to lower.

The original 9–10 November callout-registry audit follows as historical evidence.

Original source registration: **9 November 2026**. All eight displayed maps and both Nuke/Vertigo floors were rechecked against this repository's artwork on **10 November 2026**. The app has **122 named-area anchors across eight maps**, with ten artwork/source registrations. These replace the earlier hand-picked catalogue coordinates.

Pins identify the **target callout area**. They do not represent a measured grenade landing, smoke radius, trajectory, effect volume or player standing position. Videos and photo guides remain the evidence for the demonstrated throw; none is claimed to have been tested on the installed current game build.

An unknown name, ambiguous multi-destination name or unregistered floor returns `null`. The guide remains usable in the list, but has `showMarker: false`. There is no fallback to an old guessed position or to the other floor.

## Integration

- `src/map-utility-anchors.ts` contains the small runtime lookup, explicit target aliases and `resolveUtilityAnchor`. No substring guessing or origin-based placement is used.
- `applyRegisteredUtilityAnchor` handles bundled content. It leaves `userCreated` records and their coordinates untouched.
- Creator exports pass through registration. `src/guide-library.ts` registers the merged creator/photo library and exports `REGISTERED_PRACTICE_REFERENCES` for the optional practice catalogue.
- Resolved records carry `markerBasis: "callout-area"`. The app's group markers use a real member's anchor, never an average location between destinations.
- Audit polygons, measured landmark correspondences, source IDs and artwork SHA-256 values are in `src/data/map-utility-anchor-evidence.ts`. This file is used by tests and review; the application does not import it into its runtime bundle.
- A later point adjustment within the same source region carries its native-pixel `artworkPoint`, audit date and reason in `src/map-utility-anchors.ts`. Tests also invert the original registration to ensure that adjustment remains inside the attributed source polygon.

## 10 November artwork recheck

The reported Ancient screenshot was checked against the actual SVG, the original callout regions and fresh labelled renders. The map image and pin overlay share the same 1000-coordinate space and fitted viewBox; no global scale, crop or origin correction was warranted.

The **Ancient B Long** centre was moved from app `(828,340)` to `(819.82,340)`. The old point lay only about seven native pixels from the narrow corridor's east wall. The reviewed native point `(839.5,348.16)` centres it between the SVG's west/east walls at `x823.5` and `x855.5`, leaving about sixteen native pixels on each side. It remains inside the original published Long region and separate from B Short and B Site. A large icon can still overlap the edges of a narrow passage; its centre, rather than its drawn radius, identifies the area.

Fresh labelled renders covered all **122 anchors across ten map/floor views**, including the empty unregistered Vertigo lower floor. Every anchor centre landed on rendered artwork. The other near-edge points were inspected as named portal/landmark areas: Mirage Market Window, Inferno Banana Sandbags, Nuke lower Double Doors, Cache Vents and Vertigo B Stairs. They were retained at their source-matched entrances/landmarks. These checks did not establish a reason to move those areas or place a missing target on a different floor.

The SVGs use several paint/height masks. Testing only the first clip path falsely rejects valid parts of Dust II and Inferno; the recheck therefore compared rendered pixels, the full visible geometry and the original named region. Opaque artwork alone does not establish walkability or a measured grenade impact. Raster floor registration and named door/stair landmarks were also reviewed visually. Receipts and fresh renders are in `outputs/all-lineup-pairing/anchor-artwork-audit.json` and `anchors-<map>-<floor>.png`.

## Source registration

Public authored callout maps were compared directly with rendered versions of the displayed SVG/PNG artwork. Only named areas that could be matched were accepted. Reference images were used for local research; they are not republished as app assets.

| Displayed map/layer | Primary authored reference | Registration |
| --- | --- | --- |
| Mirage main | [Total CS Mirage](https://totalcsgo.com/callouts/mirage) | Logical 800 reference to app 1000: multiply both axes by 1.25. A/B zones and both spawn outlines match the displayed SVG orientation. |
| Dust II main | [Total CS Dust II](https://totalcsgo.com/callouts/dust2) | Same overview frame, multiply by 1.25. A upper-right, B upper-left, T bottom; site, tunnel and mid-door geometry compared. |
| Inferno main | [Total CS Inferno](https://totalcsgo.com/callouts/inferno) | Same overview frame, multiply by 1.25. Both sites, Banana bend, Arch and CT-spawn side compared. Only matched unchanged areas are used. |
| Nuke upper | [Total CS Nuke](https://totalcsgo.com/callouts/nuke) | Main drawing only, multiply by 1.25. Left T spawn, right CT arc, central A building and Outside silo matched. |
| Nuke lower | [Total CS Nuke](https://totalcsgo.com/callouts/nuke) | Separate lower-floor inset. `x = sourceX × 1.25 + 379`, `y = sourceY × 1.25 + 275`; independently checked using the reactor and two door landmarks below. |
| Ancient main | [Total CS Ancient](https://totalcsgo.com/callouts/ancient), [CS2 Atlas Ancient](https://cs2.jzr.uz/maps/ancient) | Total CS 800 frame scales by 1.25. The Atlas author's September 2026 polygons already use a 1000 frame and align directly. Atlas provides named Red, Donut, Cave and separate B Short/Long regions. |
| Anubis main | [Total CS Anubis](https://totalcsgo.com/callouts/anubis) | Same overview frame, multiply by 1.25. Both sites, CT spawn, Bridge, Palace corridor and Main compared. Separate B-facing and Mid-facing Temple endpoints are retained. |
| Cache main | [Total CS Cache](https://totalcsgo.com/callouts/cache) | Same overview frame, multiply by 1.25. A/B plant rectangles, CT/T spawns, highway and mid structure match the displayed SVG. Only individually matched areas are accepted; this does not validate legacy throws on 2026 geometry. |
| Vertigo upper | [Total CS Vertigo](https://totalcsgo.com/callouts/vertigo) | The reference is a composite with older geometry. **No global transform is asserted.** Only six independently identifiable, unchanged areas are measured directly on the displayed upper PNG: A, B, Mid, B Stairs, A Ramp and Sandbags. |
| Vertigo lower | [Total CS Vertigo](https://totalcsgo.com/callouts/vertigo) | No current lower-floor target registration. All bundled lower-floor pins remain hidden. |

The displayed SVGs use a 1024 viewBox, rendered into the app's unchanged 1000 coordinate space. The source interactive Total CS regions use an 800 logical coordinate frame even when their downloaded image has 1024 native pixels. Image size alone must not be used as the polygon coordinate frame.

Nuke lower's independent landmark check uses these original-reference logical coordinates and displayed PNG native pixels. Reading tolerance is approximately four native pixels; this is an area registration, not a physics calibration.

| Lower-floor landmark | Source 800 coordinates | Displayed 1024 coordinates |
| --- | --- | --- |
| B reactor centre | 153, 234 | 584, 581 |
| Bottom-ramp horizontal door bar | 153, 108 | 584, 420 |
| B double-door doorway | 198, 201 | 642, 539 |

## Corrections that prevent common mistakes

- Mirage B is top-left; A is near the lower centre of the displayed map. Conventional positions copied from a differently framed minimap were removed.
- Mirage `Window` means Mid Window/Sniper's Nest. `Market window` resolves to a separate B-side window, not the source reference's ambiguous bare `Window` label.
- Mirage Palace uses the A-facing entrance end, Underpass uses the passage beside Mid, and B Apartments uses its long corridor. A generic polygon centre could otherwise land deep inside a different end of the named area.
- Ancient Donut's central column is a void in the artwork, so its anchor is on the surrounding room floor. Red uses the actual upper room, rather than the long adjoining ramp included in the author's broad Red polygon.
- Ancient B Short and Long stay on their respective CT entry paths. Their anchors are kept separate from B's plant region and the central site pillar.
- Cache Vents uses its Mid-side mouth, rather than the empty centre of the shaft in the overview. The original broad A Site region is narrowed to the displayed A plant area for its area pin.
- Nuke upper and lower have independent layer keys. A lower B target cannot resolve on upper simply because both floors occupy overlapping overview coordinates.
- A multi-target entry such as `Library / Arch`, `B window / doors` or `Radio / Trophy` has no invented midpoint. It remains in the list without a map pin.

## Current creator-marker coverage

The original registration audit covered **223 creator-video references**: **180** had a registered target pin and **43** had hidden pins pending stronger location evidence. The table below preserves that audit's counts. Photo-first catalogue visibility is a separate media decision; these counts describe map placement, not photo availability or successful in-game throw testing.

| Map | Named anchors | Creator pins shown | Creator pins hidden |
| --- | ---: | ---: | ---: |
| Mirage | 23 | 28 | 0 |
| Dust II | 16 | 23 | 3 |
| Inferno | 12 | 20 | 7 |
| Nuke | 16 | 23 | 1 |
| Ancient | 13 | 22 | 4 |
| Anubis | 15 | 20 | 9 |
| Cache | 21 | 29 | 7 |
| Vertigo | 6 | 15 | 12 |

Unresolved creator destinations are explicit:

| Map | Targets kept off the map |
| --- | --- |
| Dust II | Mid crossing; B window / doors; B boost |
| Inferno | Banana halfwall; Bracket; Moto; Library / Arch; Oranges |
| Nuke | Upper Radio / Trophy |
| Ancient | B site / Cave; Speedway; B ninja; Mid cubby |
| Anubis | A camera; Mid window; T stairs / Water; B site left; B site right |
| Cache | A main box; A cross; NBK / Quad; B single; A back site; Quad / New box |
| Vertigo | Ivy; A CT / Back site; Headshot; A short; A heaven; B main; B right generator; A yellow; B pillar; B white / double; A ivy; A scaffolding |

Several names are region-dependent aliases or source-defined combinations. They are deliberately not collapsed into a nearby area. A creator chapter title establishes which demonstration to play; it does not by itself establish a precise point on the displayed map.

## Verification and maintenance

Eight persistent tests in `tests/map-utility-anchors.test.ts` check that every anchor has a valid map/layer, lies inside its attributed source polygon, follows its registered transform or direct artwork point, and retains a source/evidence entry. Separate assertions check each displayed bombsite's region, corrected Mirage execution areas, the actual Ancient B Long corridor's wall clearance, ambiguous target rejection, every Nuke/Vertigo alias's floor isolation, all bundled record routing, rejected out-of-artwork legacy fallback coordinates across all eight maps, and preservation of saved coordinates.

Artwork hashes make a changed SVG/PNG fail the registration test until it is reviewed again. A replacement or rotated map must be re-registered; do not merely update its hash to silence a failure.

Local headless Playwright renders produced nine map/floor contact sheets in ignored `outputs/map-audit/anchors-*.png`, with all 122 anchors labelled. Source-reference renders and pixel spot checks were also used to catch void/obstacle-centre errors. These checks establish map-area alignment only. No game installation was read, no game was launched, and no PC/game control was performed for this audit.

To add a new alias or target, first identify its destination on a public authored source, match that region to the displayed artwork on the correct floor, record the original polygon/point and registration evidence, and inspect the rendered result. If the evidence is insufficient, keep the marker hidden.
