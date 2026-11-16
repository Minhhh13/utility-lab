# Photo-first lineup media audit

Checked **10 November 2026 (Australia/Sydney)** using public online sources and project metadata only. No CS2, Steam, game installation, game process or local game files were accessed. No source video, extracted video frame or new source screenshot was saved. Research outputs are in `outputs/all-lineup-pairing/`.

## Baseline and photo-first scope

The audited `GUIDE_LIBRARY` contained **488 records** before photo-first presentation filtering: **265 with actual photo references**, **223 video-only**, and **17 of the photo records with a same-guide video choice**. The 223 video-only records referenced 57 distinct creator videos. These counts describe the audit baseline; a video-only record is not evidence of a photographed position/aim sequence.

| Map | Photo records | Video-only records | Existing photo/video pairs |
| --- | ---: | ---: | ---: |
| Mirage | 22 | 28 | 2 |
| Dust II | 18 | 26 | 0 |
| Inferno | 45 | 27 | 1 |
| Nuke | 50 | 24 | 10 |
| Ancient | 18 | 26 | 1 |
| Anubis | 50 | 29 | 3 |
| Cache | 21 | 36 | 0 |
| Vertigo | 41 | 27 | 0 |
| **Total** | **265** | **223** | **17** |

The existing photos already fill the supported eight-map, T/CT and four-utility availability matrix. This establishes useful photographed choices for every supported combination; it does not establish every possible throw. A clean photo-first catalogue can use these 265 records while preserving older creator-video links separately. Video-only records should enter that catalogue only after their own exact demonstration has real position/aim photos.

Of the 265 photo records, **210 begin with a separate position photograph**. The other **55 begin with a combined Position & aim reference or composite** and do not supply a separately photographed standing view. Keep that combined label and the original source order rather than duplicating one image into two fictional steps. `photo-role-inventory.json` and `photo-role-summary.json` identify every case, including running throws whose next image is the release position.

## Exact pairing rule and creator-video sampling

A same-guide pair requires a source page explicitly publishing both media for that guide, or other direct evidence that the photo sequence documents that exact video demonstration. Matching only the map, target, origin callout or utility is insufficient: one destination often has multiple standing spots, aim references and releases.

The ten largest creator-video groups were checked through their ordinary public YouTube watch-page metadata. Together they account for **125 of the 223 video-only records**. All ten returned readable original titles/descriptions, but **none linked an exact photo gallery or position/aim image**. No additional photo/video binding was accepted from that sample. The remaining 47 creator sources were not exhaustively audited; this is a bounded finding, not a claim that no photograph exists anywhere online. Receipts: `creator-description-links.json`.

Ordinary direct access to the [MetaStack homepage](https://metastack.gg/) returned **HTTP 403** with its public access check; its [robots file](https://metastack.gg/robots.txt) remained public. No challenge bypass, sign-in, excluded application route or guessed private endpoint was used. MetaStack supplies no newly accepted exact pair in this audit. Receipts: `source-front-doors.json`.

## Existing high-confidence video choices

These ten GO NADE photo guides already have same-guide source MP4 choices. The filenames below come from each original guide's advertised video element, not a guessed target-name pairing.

| Photo guide | Original advertised clip |
| --- | --- |
| [Nuke A Site flash from T Spawn](https://gonade.app/nade/nuke-a-site-from-t-spawn-flash) | `https://gonade.app/videos/3002.mp4` |
| [Nuke Vent Drop smoke from T Spawn](https://gonade.app/nade/nuke-vent-drop-from-t-spawn-smoke) | `https://gonade.app/videos/3028.mp4` |
| [Nuke Top Hut molotov from T Spawn/Roof](https://gonade.app/nade/nuke-top-hut-from-t-spawnroof-molotov) | `https://gonade.app/videos/3037.mp4` |
| [Nuke Mustang molotov from T Roof](https://gonade.app/nade/nuke-mustang-from-t-roof-molotov) | `https://gonade.app/videos/3038.mp4` |
| [Nuke Secret molotov from T Outside](https://gonade.app/nade/nuke-secret-from-t-outside-molotov) | `https://gonade.app/videos/3039.mp4` |
| [Anubis T Stairs HE from A Plat](https://gonade.app/nade/anubis-t-stairs-from-a-plat-he) | `https://gonade.app/videos/1008.mp4` |
| [Anubis Mid Doors/Window molotov from Ruins](https://gonade.app/nade/anubis-mid-doorswindow-from-ruins-molotov) | `https://gonade.app/videos/1014.mp4` |
| [Anubis Mid Doors/Window smoke from T Spawn](https://gonade.app/nade/anubis-mid-doorswindow-from-t-spawn-smoke) | `https://gonade.app/videos/1041.mp4` |
| [Inferno Top Mid smoke from T Spawn](https://gonade.app/nade/inferno-top-mid-from-t-spawn-smoke) | `https://gonade.app/videos/7048.mp4` |
| [Ancient Lane HE from B Short](https://gonade.app/nade/ancient-lane-from-b-short-he) | `https://gonade.app/videos/2046.mp4` |

The other seven existing pairs are two CSNADES Nuke smoke guides and five CS2Tricks/NadeKing HE guides. Their original-page bindings and playback/metadata checks are documented in [the additional-source audit](native-other-photo-sources.md). The scully/Lineups.pro Cache gallery has seven original photographs but advertises no actual video; it should remain photo-only. A source `<video>` tag returning an HTML fallback must not create a Video choice.

## Current GO NADE source and metadata check

The bounded audit re-read all **209** current GO NADE photo guides' canonical public pages; all returned HTTP 200. It followed only their actually advertised video URLs. **199 returned HTML fallback pages; ten returned actual MP4s. All ten MP4s loaded positive finite browser duration and nonzero dimensions**, confirming the ten existing pairs above with no new additions. These checks used paused native video elements from localhost with the browser's normal referrer, without autoplay or saved clips. Final counts and per-guide receipts are in `gonade-current-summary.json`, `gonade-current-source-heads.json` and `gonade-current-video-metadata.json`.

## Standing markers and source coordinates

All **209** inspected GO NADE pages published their own start-position/view-angle metadata. Exact source strings, canonical URLs and HTML hashes are retained in `gonade-source-position-evidence.json` strictly as evidence; no command is executed. They must not be treated as coordinates for a marker drawn over the first photograph. Throw view angles do not establish that position photograph's camera pose, projection, feet location or floor plane.

A source-accurate floor marker therefore needs an actual source annotation on that exact position image, or independently verified image-coordinate evidence. The existing photographs/composites can be shown unchanged, with the position view first and image zoom for close alignment. No screen-centre marker, inferred floor point, cross-provider coordinate match or generic callout pin substitutes for that evidence. The separate 334 public-world annotation records remain separate evidence rather than being attached to photos by target name.

## Research boundary

This audit adds no media to the app, changes no guide bindings and runs no build. It identifies which existing guides have genuine photos and exact video choices, preserves the combined-image cases, and records source metadata for later reviewed registration. New content can come from additional genuinely photographed source guides or creator-supplied photo sequences; unrelated videos, thumbnails, synthesized gameplay images and guessed standing markers do not fill those gaps.
