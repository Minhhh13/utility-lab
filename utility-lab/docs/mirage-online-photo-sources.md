# Mirage online photo coverage

> **10 November 2026 update:** Photos now appear directly in Utility Lab's own swipeable viewer, not inside source websites. The active photo catalogue has 48 bundled guides (102 images) and 217 native online galleries (642 GO NADE plus 24 other image references). See the [native GO NADE audit](native-gonade-photo-sources.md) and [other native-photo audit](native-other-photo-sources.md). Full-page/iframe descriptions below document the previous implementation and its research evidence.

Checked **9 November 2026**, using public web pages only. No CS2/Steam launch, game file, game process, configuration or local game installation was accessed.

The 9 November addition, `MIRAGE_ONLINE_PHOTO_LINEUPS` in `src/photos.mirage-online.ts`, supplied **14 photo-guide records**. They filled the seven T/CT and utility combinations missing from the existing eight Palace Alley / Window smoke photo records, with two choices for each missing combination.

| Side | Utility | Original photographed setups |
| --- | --- | --- |
| T | Flash | Ladder from Bottom Mid; B Site from Apartments |
| T | Molotov | Sandwich from T Roof; Ladder from Bottom Mid |
| T | HE | Catwalk from Back Alley; Bench from B Apartments |
| CT | Smoke | Ramp from A Triple; Deep Apartments from B Site |
| CT | Flash | Ramp from A Triple; Apartments from Market Window |
| CT | Incendiary | A Default from CT Spawn; A Default from Top Connector |
| CT | HE | Deep Apartments from B Site; A Default from Top Connector |

Each guide retains three short manual instructions and its original source link. The previous wrapper displayed the complete source page; the native viewer now displays direct original image references with source credit. Photographs remain on the source provider's servers; no photo/video files are bundled or rehosted, and no media redistribution or current-game testing claim is made.

## GO NADE: twelve sequences

The [public Mirage map](https://gonade.app/map/mirage) advertises 49 guides through the ordinary anonymous index used by its own frontend. Twelve useful multi-photo guides were selected to cover the six non-T-HE combinations in the table. All twelve original pages have two or three actual position/aim images plus a result image. Every selected page and all expected images were loaded and decoded in a sandboxed headless Edge frame; **12 of 12 passed**.

Throw and click labels come from each original page. These twelve all specify **Left click**. Walking, standing, running and jump throws remain distinct. For running examples whose final photo describes the release position, instructions identify that role instead of mislabelling it as the aim reference. Incendiaries use the app's Molotov category while retaining their source type in the title.

The exact original IDs are **6004, 6010, 6023, 6025, 6026, 6027, 6029, 6042, 6043, 6045, 6046 and 6050**. All generated URLs are derived from each audited canonical path and are schema-validated. The source's public [robots file](https://gonade.app/robots.txt) allows reference/search access, excludes training crawlers and sets `ai-train=no`, `use=reference`; no media mirror or training collection is created.

All twelve corresponding original `/videos/<id>.mp4` HEAD requests returned HTML, rather than `video/mp4`. No video option is manufactured from those placeholder elements.

## CS2Tricks: two T-side HE sequences

At the 9 November audit, GO NADE's Mirage index and public sitemap contained **no T-side HE guide**. CT grenades were not reassigned to fill the gap. These original CS2Tricks sources provided actual T or Any Team evidence:

| Guide | Source side | Source technique | Published |
| --- | --- | --- | --- |
| [Catwalk Grenade from Back Alley](https://www.cs2tricks.com/nades/mirage/grenades/catwalk-from-back-alley-9376) | Terrorist | Stationary jump throw, left mouse | 20 April 2026 |
| [Bench Grenade from B Apartments](https://www.cs2tricks.com/nades/mirage/grenades/bench-from-b-apartments-a7b9) | Any Team | Run two steps, left mouse | 15 January 2025 |

Each source page contains **three unique 1400×788 images**: Position, Lineup image (aim) and Result. Responsive desktop/phone DOM copies are not counted as additional photographs. Both complete original pages rendered in sandboxed Edge frames, and all three images decoded. At the tested phone frame width, the source viewport and document were both **374px** wide, without horizontal overflow.

The Catwalk creator is credited as **★ igraman4ik ★** on the original page. The Bench source labels itself **Any Team**; its T-side app record describes an attack from B Apartments and preserves that published side evidence. No CT-only throw is relabelled T-side. The old search-index Catwalk URL using a full UUID returned a not-found page; the current canonical URL was confirmed in the provider's public sitemap and rendered successfully.

The sources link the exact YouTube videos `sxUnww4n1as` and `b-5ndRQW6k8`. An attempted ordinary video-page retrieval was throttled, so no new playback verification or `videoUrl` is asserted. Existing creator-video entries remain available separately.

The previous implementation displayed complete **source-hosted pages**. During that audit, the [public CS2Tricks robots file](https://www.cs2tricks.com/robots.txt) allowed normal public nades pages while excluding account/edit routes; none of those excluded paths was accessed. The public guide pages were not blocked from framing. These frame checks are historical discovery evidence; the current native viewer uses direct original photos with source links and credit, as documented above.

## Exclusions and evidence

- CS2Util had working T-side HE videos but no actual position/aim photo sequence on the inspected dedicated guide pages. Related-guide thumbnails were not counted as lineup photos.
- CS2Pulse had a photographed T-side Bench example, but its terms restrict content databases/reproduction. It was not added to the app or its hosted viewers; the two CS2Tricks guides made it unnecessary.
- A photo sequence proves what a source published, not that the throw currently succeeds. Exact map version/capture build is not asserted.

Research evidence is in ignored `outputs/mirage-online-photo-research/`: `provider-index.json`, `selected-index.json`, `guide-audit.json`, `all-frames-result.json`, `video-head-audit.json` and `the-frame-results.json`, plus original-page screenshots. `tests/mirage-photo-guides.test.ts` checks the completed side/type matrix, canonical URLs, source-side evidence and valid app records without external network calls.
