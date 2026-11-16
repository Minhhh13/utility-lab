# Independent publisher pin review

Checked **10 November 2026** against the current CS2Tricks registrations, original publisher endpoint evidence and the actual app SVG/PNG artwork. This review reads project assets and public-source evidence only. It does not access CS2 or Steam.

All **1,287 CS2Tricks-backed rows** in the generated catalogue matched their original destination UUID and logical x/y, then matched the runtime affine projection rounded to two decimals. There were **zero destination/origin substitutions and zero stored-coordinate discrepancies**. The publisher's 2000-pixel images use a separately established 1000-unit logical coordinate frame; the code applies the frame transform once, without another image-size multiplier.

The ten source/app overlay proofs and a new, independently labelled point comparison were reviewed visually. No transform correction was identified.

| Map / floor | Rows checked | Representative landmarks reviewed |
| --- | ---: | --- |
| Dust II | 198 | Long Car, A/B sites, Mid Doors, CT Spawn, Short cross/stairs/boost |
| Mirage | 234 | Window, Market Window, Stairs, Jungle, both Connector ends, Top Mid, B Stairs |
| Inferno | 206 | Coffin, CT, Moto, Top Banana, Logs, Arch, Pit and Mini Pit |
| Ancient | 165 | Top Mid, B Alley, Back Alley, B Site, A Donut and Cave |
| Anubis | 282 | Heaven, A Main, B Site, Mid Window, Mid and Top Mid |
| Cache | 80 | Heaven, A Main, Highway, B Main and Vents |
| Nuke upper | 83 | A Site, Heaven, Ramp, Outside and Secret/garage approaches |
| Nuke lower | 1 | B site / New End on the lower reactor drawing |
| Vertigo upper | 37 | Mid, Top Mid, CT Spawn, A Site Left and T Mid |
| Vertigo lower | 1 | Deep Ramp on the lower-floor ramp/transition drawing |

Nuke lower and Vertigo lower use their separate original source images and separate app floor artwork. Their shared full-map frame does not justify placing a lower target on the upper floor. The Nuke New End record uses its source lower destination, and Deep Ramp is checked against the lower Vertigo drawing.

Anubis has a visible artwork-revision difference around the northern spawn outline. The reviewed site, Heaven and central-junction endpoints still align with corresponding landmarks. This pass does not certify that different northern spawn outlines are equivalent. Some original publisher callout endpoints intentionally sit at doors, walls or site edges; preserving those endpoints does not establish a measured grenade impact or effect radius.

The runtime projector checks registration ID, map, floor and original provider/canonical map path, and rejects nonfinite or out-of-range results. User-authored positions remain outside this bundled-source registration.

Research receipts are `outputs/expanded-dma/projection-review/audit.json` plus the ten labelled PNG comparisons in that directory. Each comparison places the original logical destination on the source drawing and the runtime result on the app drawing. The reviewed transform and representative-source summary is retained in [the durable review evidence](data/publisher-registration-independent-review.json).

## Separate CSNADES frame review

The six CSNADES registrations were independently reviewed against their **original nonsquare radar images**. The publisher's DOM establishes independent normalized x/y axes from 0 to 1000 over each displayed image rectangle; bitmap width/height are not the endpoint coordinate frame. All six source-image hashes and all six app-artwork hashes match the registration records.

| Map / floor | Original bitmap dimensions | Reviewed source rows |
| --- | --- | ---: |
| Nuke upper | 1558 × 848 | 67 |
| Nuke lower | 1558 × 848 | 4 |
| Vertigo upper | 1135 × 1219 | 68 |
| Vertigo lower | 1135 × 1219 | 4 |
| Cache main | 2048 × 1596 | 36 |
| Dust II main | 1516 × 1619 | 4 |

All **183** source records join their exact original canonical guide and video asset ID. Every record also supplies actual Position and Aim photos credited to that same original guide. Their destination endpoints are distinct from the separately published throw origins. The regenerated catalogue was then rechecked: **183 stored destination IDs, x/y endpoints, selected floors, registration IDs and final projected x/y pairs pass, with zero discrepancies**. All runtime projections are finite and inside the app's coordinate frame. The six original source/app overlays and independently labelled comparisons show no affine-registration correction is needed.

Cache's Left Mid and Right Mid remain separate original endpoints, as do B Newbox and Backsite. Dust II's four T HE pins preserve the original Mid Doors, Short, Short Stairs Corner and far B Back Plat destinations. Vertigo's Generator Left/Right, Heaven and Ramp Lurk endpoints match their respective structures. Lower Bottom Ramp and Bottom B Main remain on the separately drawn lower ramp/stair areas. Nuke's lower Dark, Decon Cross and Double Doors endpoints align with the separate lower reactor drawing.

Three Vertigo source rows were corrected from their earlier upper-floor metadata: two A Ramp demonstrations and Bottom B Main explicitly publish destination floor `[2]`, and their points match the lower artwork. This is independent of the `[1,2]` endpoints, which support either published floor and retain their reviewed selected floor. Four Nuke endpoints publish `[null]` rather than a floor: Silo molotov, Trophy HE, T Red HE and Squeaky Door HE. Their exact original landing frames were independently inspected: open-sky fire on Silo's roof, the outside red container/blue bin, the tiled Trophy room with display cabinet/chairs, and the upper A entrance/rafters confirm all four as upper/outside. [The physical-floor overrides](data/physical-floor-overrides.json) retain original null values, exact source clip/time, unmodified proof images and hashes. These are explicit media-based decisions; null is not relabelled as publisher floor 1, and no destination x/y is changed.

The CSNADES review receipts are in `outputs/expanded-dma/csnades-projection-review/`. Stored generated-catalogue binding checks are recorded separately from proposed endpoint projections; the final pass covers all 183 stored records after regeneration. Both provider summaries are retained in the durable review evidence linked above.

## Final merged catalogue check

The final generated catalogue contains **1,500 expanded rows with 1,500 visible registered pins**. Merging the complete original photo library adds four distinct GO NADE guides, producing **1,504 primary rows with 1,504 registered pins**. These are library rows; they are not a count of unique filmed demonstrations.

The additional **27 Nuke community rows from 26 original guides** were independently checked after generation. Every stored row joins its exact canonical source and side, original destination ID/x/y, explicitly published upper floor `[1]`, calibrated CSNADES Nuke registration and final app coordinate pair. All 27 preserve their exact original video ID and same-guide Position/Aim photo credits. There are **zero stored join, ID, floor or projection failures**. The one explicitly any-team demonstration supplies two side rows.

The four legacy GO NADE records were checked against the separately reviewed original callout polygons and Result photos: Mustang, upper Secret entrance, Anubis T Stairs and the exact-source Mid Doors/Window guide all resolve to their reviewed anchor IDs and app points. The composite binding rejects an unrelated source and a missing source; it does not introduce a general composite-target alias. All four stored registrations pass.

Final receipts are `outputs/expanded-dma/final-stored-pin-review/audit.json` and the `finalStoredPinAudit` section of the durable review JSON. The four original polygon/photo proposals remain in [their source evidence](data/legacy-complete-guide-pin-review.json). This pass changes review evidence only; it does not edit the catalogue, application code, build output or any game files.
