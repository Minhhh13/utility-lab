# Native galleries from additional online sources

Checked **10 November 2026**. These references replace the complete embedded source websites for eight photo guides. The app's own image viewer uses the unchanged image URLs directly, with the standing photo first, then aim, release and landing photographs where supplied. The source link and creator attribution remain with each photo.

`src/data/other-photo-galleries.ts` exports `OTHER_PHOTO_GALLERIES`, keyed by the existing library IDs. It contains **24 photo references across eight guides**:

| Source                           | Guides | Photos | Native sequence                                        |
| -------------------------------- | -----: | -----: | ------------------------------------------------------ |
| CSNADES.gg                       |      2 |      2 | One combined position/aim reference per throw          |
| CS2Tricks / NadeKing / community |      5 |     15 | Position → Aim → Landing result                        |
| scully / Lineups.pro             |      1 |      7 | Find Spot → Exact Spot → Aim → Release → three Results |

## Exact original assets

The [Nuke Double Doors](https://csnades.gg/nuke/smokes/double-doors-from-b-ramp) and [Decon Cross](https://csnades.gg/nuke/smokes/decon-cross-from-back-vents) references use the original `assets.csnades.gg/nades/.../lineup.webp` assets. Each is a genuine combined viewpoint/crosshair image; the app does not duplicate it to manufacture separate standing and aim photos.

The CS2Tricks photographs use the source's public CloudFront UUID paths. Three Nuke HE guides—[New End](https://www.cs2tricks.com/nades/nuke/grenades/new-end-from-ramp-9e71), [Hut](https://www.cs2tricks.com/nades/nuke/grenades/hut-from-t-roof-70d8) and [A Site](https://www.cs2tricks.com/nades/nuke/grenades/a-site-from-t-roof-c400)—and two Mirage HE guides—[Catwalk](https://www.cs2tricks.com/nades/mirage/grenades/catwalk-from-back-alley-9376) and [Bench](https://www.cs2tricks.com/nades/mirage/grenades/bench-from-b-apartments-a7b9)—have separate original Position, Lineup and Result images. The optional duplicate/zoom overlays were omitted; the app supplies its own image zoom.

[Highway Nade from Firetruck](https://lineups.pro/cache/5erxnx), by scully, uses seven public `lineups.pro/api/images/lineups/<uuid>.jpg` image URLs advertised by the original public page. They contain no authentication token, signed expiry or per-session query string. The source's public metadata distinguishes the first standing overview, exact position, aim, release keyframe and three results. Its separately drawn green aim arrows are not baked into the original aim image; this gallery references the original image and crosshair without inventing a new aiming marker.

## Checks and limits

The direct-image audit uses a simple localhost HTML document with ordinary `<img>` requests and the browser's normal referrer policy. It does not embed source websites, spoof a source referrer, proxy an image, alter the picture or read any game installation. Every included image is checked for successful decoding and full photograph dimensions. Receipts and representative native-image screenshots are in `outputs/native-other-photos/`.

The image bytes stay on the original source servers. They are not rehosted, downloaded into the app bundle or added to its offline pack. Publication of a public image URL is not described as an asset republication license; source ownership remains with the respective publisher and author. Direct online references require internet and can become unavailable if a source changes. Source publication dates are not represented as screenshot capture dates or current-game retesting.

## Same-guide video choices

`src/data/other-guide-videos.ts` exports seven original online video references for the same photo guides. Their published source URLs were read from the original guide HTML; no filename or video ID was guessed.

The two CSNADES Nuke smoke pages advertise HQ MP4 and WebM sources. Both selected MP4s returned `video/mp4` and loaded actual browser metadata from localhost: **15.483 seconds** for Double Doors and **22.8 seconds** for Decon Cross, both at **2562×1440**. The player was kept paused; media was not saved into the app bundle.

All five CS2Tricks pages publish one exact YouTube video each. The official oEmbed endpoint returned HTTP 200 for all five, identifying CS2Tricks or NadeKing 2 as publisher. These checks establish source publication and metadata availability, not guaranteed future playback in every region or browser. Their video IDs are `Tz1AMkEWlnw`, `nVJz-CWKFPk`, `lX02rh_0F3k`, `sxUnww4n1as` and `b-5ndRQW6k8`.

The scully Cache gallery advertises no actual video. It remains photo-only instead of linking a guessed or unrelated clip. Receipts: `outputs/native-other-photos/video-source-audit.json` and `video-validation.json`.
