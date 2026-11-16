# Cache publisher destination audit

Checked **10 November 2026 (Sydney)** using ordinary public CSNADES pages and their original clips, with no CS2, Steam or game-file access.

All **36 CSNADES Cache guides** now have exact publisher `throwTo` and separate `throwFrom` points in [the durable source evidence](data/csnades-cache-destination-evidence.json). Categories supplied 26 smokes, eight molotovs, one flash and one HE. Records are matched by canonical URL, utility type and exact video asset ID, not by a potentially repeated slug or the throwing position.

The original [Cache radar](https://assets.csnades.gg/cache_game_radar_78bfffc917.webp) is **2048 × 1596**, not square. The publisher uses x and y independently normalized to **0–1000**, rendered as percentages over that rectangle. For example, CT `(261,805)` renders at `left:26.1%;top:80.5%`. Actual browser bounding-box centers agree within 0.03 logical units, confirming these are marker centers. Original raster coordinates are therefore x × 2.048 and y × 1.596. The different CS2Tricks radar transform must not be reused.

Source-frame proof is in `outputs/expanded-cache-completions/csnades-destinations/map-frame-evidence.json`, `pin-center-evidence.json` and `cache-publisher-frame.png`. The four ordinary category payloads and source art URLs are retained in that directory. Every Cache destination declares level 1.

## Previously hidden targets

All fifteen previously unresolved guides have same-source landing frames reviewed. The table preserves the publisher's actual normalized destination; it does not substitute an origin, bounce, generic CT Spawn or a guessed callout center.

| Target / source position | Publisher destination | Reviewed landing time |
| --- | --- | ---: |
| Newbox molly / Sun Room | 386, 871 | 16.650s |
| Backsite molly / Sun Room | 363, 933 | 16.383s |
| CT smoke / Sun Room | 261, 805 | 20.133s |
| Right Mid smoke / Garage | 415, 500 | 17.783s |
| Left Mid smoke / Garage | 415, 553 | 13.450s |
| Back A Site smoke / Outside Squeaky | 297, 220 | 25.050s |
| Connector smoke / T Spawn | 299, 593 | 19.133s |
| CT smoke / B Main | 261, 805 | 17.967s |
| Back A Site smoke / Outside Garage | 297, 220 | 20.417s |
| NBK smoke / Outside A Main | 368, 122 | 23.883s |
| Heaven smoke / B Main | 283, 757 | 22.817s |
| Backsite HE / Sun Room | 372, 929 | 14.767s |
| Heaven smoke / Garbage | 283, 757 | 25.817s |
| Garbage smoke / Connector | 540, 690 | 18.017s |
| Front B Site smoke / Sun Room | 365, 850 | 17.750s |

The landing views distinguish the B lower CT/Hell entrance from the upper Heaven opening, White Box-side Right Mid from Sand Bags-side Left Mid, and the front B platform from the rear Backsite/Spray corner. [Total CS's named callout regions](https://totalcsgo.com/callouts/cache) provide an independent semantic reference, but their centers are not used to replace the publisher points.

Each reviewed row records its exact original clip URL, actual frame timestamp, local research image, SHA-256 and landmark description. Type-qualified frame directories prevent the Backsite molotov and HE from sharing the wrong capture. No manual coordinate-override registry is needed once the actual publisher radar is registered to Utility Lab's artwork. Registration remains separate from source discovery, and these target pins do not assert a measured effect radius or independent current-game throw verification.
