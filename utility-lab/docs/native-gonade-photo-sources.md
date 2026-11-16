# GO NADE photos in Utility Lab's viewer

Checked **10 November 2026** using public online sources only. The new gallery data provides **642 original image references for 209 guides**. Photos appear directly in Utility Lab's own slide viewer; the gallery does not require a provider website, iframe, login or provider JavaScript.

| Map | Guides | Original photo references |
| --- | ---: | ---: |
| Mirage | 12 | 38 |
| Dust II | 5 | 15 |
| Inferno | 45 | 140 |
| Nuke | 45 | 132 |
| Ancient | 5 | 15 |
| Anubis | 50 | 159 |
| Cache | 6 | 18 |
| Vertigo | 41 | 125 |
| Total | 209 | 642 |

These are the existing accepted GO NADE source guides, rather than newly inferred throws. `src/data/gonade-photo-gallery.ts` exports `GONADE_PHOTO_GALLERIES`, keyed by the current guide IDs. Every image retains its original canonical guide link and `GO NADE` credit. The image bytes remain on the original online service: they are not downloaded into the app bundle, rehosted, rewritten or proactively installed in an offline photo pack. This reference display does not claim an image republication license or current-game validation.

## Position, aim and release order

The original source descriptions determine each image's role. Ordinary sequences show position references before the final aim view. Running sequences sometimes end with a photographed release position; that image is marked **Release**, rather than relabelled as an aim photograph. Result photographs come last.

Where the source supplies one combined position/aim reference, the caption explicitly says **Position & aim**. No extra standing photograph is invented. In the current user's Mirage example, `gonade-mirage-6029`, the first photo is the combined Apartments position/aim reference, the second is the running release point and the third shows the landing. Keys and timing remain the guide's existing source-derived instructions.

## Original optimized images

Every canonical source page was read normally to collect its advertised `<picture><source type="image/webp">` URLs. The gallery uses those full-resolution original WebPs rather than PNG fallbacks or related-guide thumbnails. It does not guess image conversion URLs. Query-string media versions remain intact.

For example, [the A Heaven flash source](https://gonade.app/nade/nuke-a-site-from-a-heaven-flash) advertises an original WebP for its position image: its ordinary HEAD response is 158,898 bytes, compared with the same source's 1,556,136-byte PNG fallback. This is a source-asset size comparison, not an app/Steam performance benchmark.

`outputs/native-gonade-photos/optimized-source-map.json` records the canonical pages, advertised fallback/WebP pairs and source-document SHA-256 values. The parser excludes `/thumbs/` images and keeps each guide's images in its own numeric image directory, preventing related cards from becoming fake guide steps.

## Browser checks

All **642/642 current exported image URLs** decoded successfully in headless Microsoft Edge from an independently authored localhost page. Each request used the browser's normal `strict-origin-when-cross-origin` referrer policy and ordinary localhost origin referrer. There was no source iframe, referrer spoofing, access-control bypass or image proxy. Requests were limited to two concurrent image loads.

The check also captured and visually inspected a direct-image contact sheet spanning all eight maps, including the user's Mirage running-flash example. The local verification server and audit browser were closed afterward. No CS2 installation, Steam client, game process or game files were accessed.

Evidence:

- `outputs/native-gonade-photos/summary.json`
- `outputs/native-gonade-photos/direct-image-audit.json`
- `outputs/native-gonade-photos/eight-map-direct-preview.png`
- `outputs/native-gonade-photos/evidence.json`
- `tests/native-gonade-gallery.test.ts` (two focused tests passed)

The build helper is `outputs/build-gonade-native-gallery.mjs`; the standalone direct-image audit is `outputs/audit-gonade-native-gallery.mjs`. Research outputs are local evidence, not copied source-photo assets.
