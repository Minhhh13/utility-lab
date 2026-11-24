# Anubis precision review · 24 November 2026

This review uses public original publishers and their footage. It does not use a local game, game installation, configuration, demo playback or independent in-game throw testing. The accompanying machine-readable record is [precise-anubis-evidence.json](data/precise-anubis-evidence.json).

## Included references

`src/data/precise-anubis.ts` contains 27 complete source records: 23 current T-spawn smokes from setpos.gg, two Window mollies from CSNADES, one improved existing Camera/A Connector source from Upper ledge, and one new running Camera reference from Upper steps. The evidence retains a 28th metadata/navigation review of the existing GO NADE Camera record. That source video's original URL is currently unavailable, so the GO NADE Camera override is withheld from the exported records.

| Original destination | Recipes | Publisher's numbered T spawns |
| --- | ---: | --- |
| Conn | 10 | 1, 2, 3, 4, 5, 6, 7, 9, 10, 11 |
| Outside Conn | 6 | 1, 2, 5, 6, 8, 11 |
| Mid | 7 | 2, 4, 5, 6, 7, 8, 11 |

The combined recipes cover all 11 actual source-numbered T spawn positions. They do not claim that every target has a recipe for every spawn. Numbers belong to setpos.gg's sheet and must not be mixed with CSNADES or a different creator's numbering. The published source records were added in September and October 2026; the source radar is v22 dated 19 November 2026.

Each setpos record preserves its exact original movement timeline, input events, world origin/destination/impact, console position and angles, pro-match provenance and source addition date in the evidence file. W-jump throws show **Tap W + Jump + LMB**. Walking variants preserve Shift+W; crouched variants preserve crouch. Generic stationary badges must not replace those instructions.

The setpos standing reference is an unchanged frame at 0.2 seconds from that recipe's original HD clip. Its caption explicitly calls it the starting view. Some starting views already face the sky; these are not presented as separate third-person foot-placement photos. Matching original aim/checkpoint and landing photos remain linked to the same recipe. Primary small-tab videos use the publisher's SD clip, with the same recipe's HD clip as fallback.

The original setpos aim image has no baked reticle. Its image metadata explicitly requests `overlay_style: crosshair`, and the original Instructions UI renders the reticle at the center of its 1081×608 SVG. The app's explicit `(0.5,0.5)` aim overlay reproduces that source placement; it is not an estimated aim point. Research DOM proof is `outputs/research/precise-anubis/crosshair-proof.json` and `source-crosshair.png`.

## Window molly

The original sources are [Window from Alley](https://csnades.gg/anubis/molotovs/window-from-alley) and [Window from Ruins](https://csnades.gg/anubis/molotovs/window-from-ruins). Both were published 19 April 2026 and updated 12 July 2026. They provide separate corner-position, aim and release references. The source originals are running jump throws: **Run + Jump + LMB**, not a one-tap W throw. Ruins releases at the second stair, as specified in the original video captions.

The CSNADES Ruins world start `(-1151.926,-1143.984)` agrees within 0.04 units with the existing GO NADE Mid Doors/Window molly's original start `(-1151.943,-1144.012)`; both original publishers specify Run. This supports the existing **Mid Doors/Window** target family. It must remain distinct from the setpos **Mid** smoke destination, which matches the existing Mid-Window smoke point further north.

## Camera smoke

Two source-complete Camera-family references are included under the existing **A Connector** target:

- Existing ID `expanded-cs2tricks-anubis-a-connector-from-upper-7667-t` retains its [original CS2Tricks source](https://www.cs2tricks.com/nades/anubis/smokes/a-connector-from-upper-7667), exact publisher origin, original photos and [matching 14-second video](https://www.youtube.com/watch?v=puzAZR3NyGk). The page and actual video were published 16 February 2026. Copy identifies the narrow ledge and stone corner beside the carved doors, with a normal stationary LMB release. The original result photo confirms the Camera hall doorway.
- New `precise-noctrl-anubis-camera-running-upper-t` uses the original [no_ctrl CS2 guide's Running Camera chapter at05:13](https://www.youtube.com/watch?v=YiiypSiuFkE&t=313), published24January2026. Unchanged1920×1080 Position, Aim, pre-release checkpoint and Landing frames are at323,325,326.633333 and335.8seconds. The original reticle is visibly centered. The narrator describes priming while running through Carpets, aligning and releasing while continuing with the A rush. Inputs are **Run + LMB**. This is not a jump throw. The moving checkpoint and original chapter supply the release timing; a new exact world origin or console angle is not invented.

The running origin is explicitly an area: [precise-anubis-named-origins.json](data/precise-anubis-named-origins.json) retains Total CS Upper/T Side Upper region983's polygon, a checked interior point `(590,556)` in its logical800 frame, the existing `anubis-main-totalcs` transform and representative app point `(737.5,695)`. Position/Release photos identify the moving setup. The map dot is not asserted to be exact feet. Review image: `outputs/research/precise-anubis/camera-running-origin-proof.png`.

The running guide has **no publisher `markerSource`**. Its destination uses one explicit entry in `src/data/reviewed-destination-links.json`, scoped to its exact guide ID, original chapter source URL, map, floor, side, utility type and target. `projectReviewedDestination` verifies that scope, rejects personal records, then projects the original Upper7667 reference through the unchanged strict CS2Tricks URL/floor registration. This reuses the reviewed **Camera/A Connector navigation area**, without claiming an original YouTube radar coordinate or equal smoke-center impact. SHA256 `0a0494acf4b880d061970c2e2a1f2dbfedd04da83d0f2cda7e1b2465b2fd2a1a` binds the source-specific original endpoint-evidence record. The [standalone result comparison](map-registration-precision/anubis-reviewed-camera-destination.svg) embeds both unchanged source frames.

The January guide's creator states that the included older-map lineups remain viable after the update. That is source corroboration, not independent game testing. Other checked A Main/Stairs/Upper YouTube clips actually date8June2025 despite page updates in2026, so they were not called current post-rework footage or spliced into a different recipe.

The original Camera/A Connector result comparison is `outputs/research/precise-anubis/camera-family-results.png`: original GO NADE1017, CS2Tricks7667 and the running chapter show the same hall doorway, columns and hieroglyph trim. The common named target is retained without claiming identical smoke-center coordinates.

The [original GO NADE Camera source](https://gonade.app/nade/anubis-camera-from-outside-a-main-smoke) is retained under existing ID `gonade-anubis-camera-from-outside-a-main-smoke`. Its actual position photo shows the wall-and-crate corner, and its original red aim crosshair points at decorative trim above the left balcony window. The original input is a stationary left-click throw.

All three original photos decode at 1920×1080. However, on 24 November the source's `/videos/1017.mp4` redirects to the homepage, including when requested by the publisher's own page. The evidence records `videoDecoded: false`, HTTP302 and `Location: /`. Do not substitute a different throw's video or label this reference as verified playable. A matching original alternative is still being researched.

## Existing landing targets

These additions increase origin choices around existing destinations. `targetMatch` records preserve the source's distinct impact coordinates and explain the match:

- setpos Mid projects to `(508.78,463.55)`, within 3.4 logical units of existing registered Mid-Window `(508.46,466.94)`.
- Conn and Outside Conn are original publisher aliases for the Connector/E-Box choke family. The actual original landing photos show different coverage: Conn fills the inner grey doorway/stairs, Outside Conn fills the outer orange approach, and the existing CS2Tricks162f landing straddles the orange exterior doorway. Evidence assigns **Inside** and **Outside** qualifiers within the existing unqualified B Connector overview family (`anubis:main:named:b connector`), retaining distinct impact coordinates. It does not create a second E Box overview area or merge either qualifier with the old generic landing. Review image: `outputs/research/precise-anubis/conn-target-comparison.png`.
- Window mollies match the existing Mid Doors/Window family through the nearly identical original Ruins start and source captions.
- Camera improves the identical existing guide ID and source, without adding a duplicate copy.

## Radar registration

Coordinates in `records[].origin` and `destination` are **raw publisher logical1000 points**, not already transformed app coordinates. The registration is applied once by the central catalogue. Console/world coordinates remain precision evidence and are not navigation pixels.

| Provider | Native radar | Scale X | Scale Y | Translate X | Translate Y |
| --- | --- | ---: | ---: | ---: | ---: |
| setpos | 1024×1024 SVG | 1 | 1 | 0 | 0 |
| GO NADE | 1024×1024 WebP | 1 | 1 | 0 | 0 |
| CSNADES | 2048×2048 WebP | 0.9692168644693478 | 0.9665770101697745 | 18.990077114310395 | 12.09787080948064 |

Transforms operate in normalized1000 units. Source image URLs, hashes, dimensions, app artwork hash, landmark measurements and review-image paths are retained in `registrations[]`.

setpos's public world calibration is `posX=-2796`, `posY=3328`, `scale=5.22`, `radarSize=1024`. World projection is `x=(worldX-posX)/(scale*radarSize)*1000` and `y=(posY-worldY)/(scale*radarSize)*1000`. Three widely separated outer landmarks match the existing app grid within 1.15 native pixels. The current setpos drawing changes interior detail, but uses the same global coordinate grid.

The original current SVGs are [dark v22](https://setpos.gg/radars/anubis/radar.svg?v=43192fdef65d) and [light v22](https://setpos.gg/radars/anubis/radar.light.svg?v=e8cddaba0b50). They were downloaded unchanged only into ignored research files; the parent agent owns any app-artwork update.

CSNADES is not an identity registration. Three noncollinear circular controls spanning A and B establish the affine fit, with maximum residual 1.01 existing-app pixels. Whole-map overlays were visually reviewed against both the existing and current v22 artwork, including distant CT and T boundaries. Projected molly points are Alley `(721.67,717.70)`, Ruins `(308.79,841.42)` and Window `(573.38,523.42)`.

GO NADE's source radar matches the app coordinate grid. A column and two B pillars show 0.65, 1.04 and 3.02 native-pixel differences between independently drawn artwork. The full-map source/app overlay confirms grid alignment. A small publisher navigation-marker offset is not treated as the precise world throw position.

## Validation and unfilled gaps

All 27 exported records pass `validateUtility` and `hasCompleteGuideMedia`. Actual browser checks decoded and began playback for 23 setpos primary SD videos, both CSNADES HD videos and both original Camera-family YouTube videos. Both YouTube originals also report `playableInEmbed: true`, and both were independently decoded inside actual `youtube-nocookie.com` iframes on a local HTTP page: `readyState4`, player state1; the running guide started at313seconds. All 53 initially checked remote images decoded successfully, including the three photographs of the withheld Camera reference; the four additional Upper7667 originals also decoded. Local starting/release frames retain source timestamps, dimensions and SHA256. GO NADE Camera1017's original video fails as described above; structural completeness alone is insufficient proof of playback.

The old CSNADES Top Mid instant family was updated in February 2025 and has conflicting stationary/W-jump metadata. It was not relabeled as a current Window family. A January2026 original creator's new Drop sheet has 11 numbered positions, but a matching playable original video was not established, so it was not padded with unrelated footage. Missing current spawn-to-target combinations remain explicit gaps rather than invented recipes. No authentication or source access controls were bypassed.

`tests/reviewed-destination-links.test.ts` checks the positive exact-source binding, unchanged publisher source gates, every altered scope/custom-record rejection, original reference endpoint/hash provenance, all four retained photos/video identity, and one B Connector overview with separate Inside10/Outside6 and generic old landing choices. Four focused tests pass.
