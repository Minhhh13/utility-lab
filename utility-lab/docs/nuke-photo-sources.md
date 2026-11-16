# Nuke online photo guides

> **10 November 2026 update:** Photos now appear directly in Utility Lab's own swipeable viewer, not inside source websites. The active photo catalogue has 48 bundled guides (102 images) and 217 native online galleries (642 GO NADE plus 24 other image references). See the [native GO NADE audit](native-gonade-photo-sources.md) and [other native-photo audit](native-other-photo-sources.md). Full-page/iframe descriptions below document the previous implementation and its research evidence.

Checked **9 November 2026**, using public websites only. No game installation, local game files, Steam session, game process or live gameplay was accessed.

## Source records and previous presentation

The 9 November source catalogue contained **50 photo guides**: 19 smokes, 14 flashes, 13 fire grenades and 4 HE grenades; 30 T-side and 20 CT-side records. Both sides had each of the four utility types. Five destinations were on the lower floor. The source-page audit decoded **146 image assets**, including three zoomed aim details; excluding those crops, there were 143 reference/result views. These are historical source-audit counts, not a claim that every possible Nuke throw has a guide.

### GO NADE: 45 guides

[GO NADE's public sitemap](https://gonade.app/sitemap.xml) listed **45 Nuke guide pages** at the original review. Each page supplied reference photos, throw type, side and mouse-button labels. The previous Utility Lab wrapper loaded those complete pages on demand, including their branding and controls; it did not reference individual images. The native viewer now uses the credited original image URLs described in the update above. Photo files are not bundled or rehosted.

| Source records       | Count |
| -------------------- | ----: |
| Smoke                |    17 |
| Flash                |    14 |
| Molotov / Incendiary |    13 |
| HE                   |     1 |
| T side               |    27 |
| CT side              |    18 |
| Upper target layer   |    43 |
| Lower target layer   |     2 |

The pages contain **132 actual source photographs**: 87 lineup references and 45 result views. Forty guides have at least two lineup references plus a result. Five guides use one combined view plus a result; these are not described as separately photographed position/aim/release sequences.

The two destination-confirmed lower-floor GO NADE records are [B Dark incendiary from Ramp](https://gonade.app/nade/nuke-b-dark-from-ramp-incendiary), CT side, and [Double Stairs molotov from Secret](https://gonade.app/nade/nuke-double-stairs-from-secret-molotov), T side. A throw originating near Secret does not automatically become a lower-floor destination.

### CSNADES.gg: two lower smokes

- [Double Doors from B Ramp](https://csnades.gg/nuke/smokes/double-doors-from-b-ramp): CT, running, left click. The source's Lineup tab supplies one combined viewpoint/aim image at 2560×1440; its original Video tab shows the running release.
- [Decon Cross from Back Vents](https://csnades.gg/nuke/smokes/decon-cross-from-back-vents): T, running, left click. One combined viewpoint/aim image at 2560×1440, plus the source's original video. Both guide pages show a January 2024 update date.

These are not three separately photographed stages. The previous wrapper retained the full source page and told the user to choose its **Lineup** tab. It used no undocumented tab parameter or source-page mutation. The native viewer now displays the combined reference directly. The [public robots file](https://csnades.gg/robots.txt), [privacy page](https://csnades.gg/privacy), footer and response headers were checked during that research; no applicable framing ban was found. Those checks were not an image-redistribution license.

### CS2Tricks x NadeKing: three HE guides

- [New End grenade from Ramp](https://www.cs2tricks.com/nades/nuke/grenades/new-end-from-ramp-9e71): CT, stationary, left click; added 30 August 2026. The position and result photos show the lower Ramp doorway and B site. Utility Lab uses the broad target **B site (New End)**, preserving the publisher's unusual destination label rather than claiming an exact impact callout.
- [Hut grenade from T Roof](https://www.cs2tricks.com/nades/nuke/grenades/hut-from-t-roof-70d8): T, running jump with left click; added 21 July 2025. Break the roof glass, stand at the ventilation shaft's right exit, aim at the lower long-window frame, then run and jump throw.
- [A Site grenade from T Roof](https://www.cs2tricks.com/nades/nuke/grenades/a-site-from-t-roof-c400): T, stationary jump with left click; added 21 July 2025. Break the roof glass, stand at the far-left vents and match the lower back-stairs aim point before the jump throw.

Each original page supplied a position photo, an aim photo, a zoomed aim detail and a result photo for that throw. The public [privacy policy](https://www.cs2tricks.com/privacypolicy), footer, robots and response headers were inspected; no reachable separate terms/framing ban was found. The earlier wrapper preserved the complete CS2Tricks/NadeKing page and did not store individual photo URLs. The native viewer now references the original images directly with source credit; image files are not copied into offline assets.

All five additional source pages passed a real sandboxed iframe audit on desktop and at 390 CSS pixels. Source images decoded, and each phone frame had a 374-pixel viewport and 374-pixel document width without horizontal overflow. `outputs/nuke-online-research/lower-frame-results.json` preserves canonical URLs, photo dimensions, source text and phone widths. Three CS2Tricks zoom details are counted as additional image assets, not additional photographed positions.

`src/photos.nuke.ts` exports `NUKE_PHOTO_LINEUPS` and source-reference counts. Root catalogue integration separately registers known callout targets; unknown names keep their pins hidden. Side, movement and required window/door preparation come from each individual guide. Source photographs are not claimed to have been retested on a current CS2 build.

## Source display and checks

- Ordinary public GETs to all 45 canonical guide pages returned HTTP 200, with no `X-Frame-Options` or `frame-ancestors` restriction. No private/user API was queried to collect the records.
- [GO NADE's robots file](https://gonade.app/robots.txt) permits reference use and normal public paths; its content signal excludes training. This work is a user-requested reference catalogue, not model training. The [published privacy page](https://gonade.app/privacy) was checked, and no separate framing/competitive-collection ban was found in the reachable public footer. This is a source-hosted reference integration, not an affirmative image-redistribution license or legal guarantee.
- A local, independently authored iframe page loaded every original guide in headless Edge with the capabilities used by the previous wrapper. Each audit waited for the exact canonical document and its expected images. **45/45 pages and 132/132 source photos decoded**, with no page JavaScript errors. Remote video requests were blocked during this historical photo-only audit.
- The previous frames kept original source branding and scrollable photos, with a source link. No authentication, challenge bypass, proxy or provider-content rewrite was used. They have been replaced by the native image viewer.
- `outputs/nuke-online-research/all-frame-results.json` records photo dimensions and canonical guide identities. Four actual frame screenshots cover smoke, flash/HE and lower-floor examples. These are ignored research artifacts, not new guide-photo assets.

Five guides also reference the provider's original online MP4: A Site flash from T Spawn, Vent Drop smoke, Top Hut molotov from T Spawn/Roof, Mustang molotov, and Secret molotov from T Outside. Each returned `video/mp4` and loaded real browser metadata, with a positive duration and 1920×1080 dimensions. No video was copied into project assets or the offline pack. The other 40 advertised MP4 paths return status 200 with an HTML fallback; they are deliberately not added as playable videos. Evidence is in `outputs/nuke-online-research/video-metadata-results.json`.

## Input details retained

The source labels two throws as **Middle click**: Lobby Push flash from A Site, and Main smoke from T Roof. GO NADE's reachable guide text does not define that label. The app retains `Middle click (source label)` and does not silently turn it into either a wheel press or LMB + RMB. Their source photos remain available.

Required glass/door preparation, the T-spawn-roof ladder/running release cue, the Top Main railing offset, and the quick walking release for Secret are retained in the short app instructions. No console command, game configuration, or automatic throwing action is produced by this dataset.

## Excluded leads and remaining limits

- **NadeKit:** all 66 public Nuke pages were inspected. Every page says its aim picture is not taken yet; none had a real lineup image. Homepage wording about screenshots was not treated as evidence of completed guides. No NadeKit placeholder was imported.
- **Offstage:** the September 2026 instant-smoke article has real photos, but its response explicitly sets `frame-ancestors 'none'` and `X-Frame-Options: DENY`. It was not embedded or copied.
- **nades.ai:** its [terms](https://nades.ai/terms) prohibit scraping/bulk downloading and copying its content. Its photo library was not collected.
- **CS2 Pulse:** its [terms](https://cs2pulse.com/terms-conditions/) prohibit database collection/reproduction without permission. Its lower-floor photo sequences were not copied or embedded as a catalogue.
- **GameRiv:** its [terms](https://gameriv.com/term-condition/) prohibit framing and crawling despite a separate limited noncommercial-reproduction clause. No guide images or source frame were imported.
- Newly checked MIT repositories either supply placeholders or expect users to upload their own photos; an open code license was not treated as evidence of real Nuke photography.

GO NADE alone provides no T-side HE or lower-floor smoke/flash/HE photo record in this checked Nuke set. The additional sources above supply lower smokes, a lower HE and genuine T-side HE photos. A dedicated lower-floor flash photo guide remains a source gap; an upper flash is not relabelled to conceal it. Original videos in the main library cover additional throws. None of these source images has been independently tested in the installed/current game.
