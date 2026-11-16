# Vertigo online photo guides

> **10 November 2026 update:** Photos now appear directly in Utility Lab's own swipeable viewer, not inside source websites. The active photo catalogue has 48 bundled guides (102 images) and 217 native online galleries (642 GO NADE plus 24 other image references). See the [native GO NADE audit](native-gonade-photo-sources.md) and [other native-photo audit](native-other-photo-sources.md). Full-page/iframe descriptions below document the previous implementation and its research evidence.

Checked **9 November 2026**, using public online pages only. No CS2, Steam, game installation, game process, configuration or local game data was accessed.

## Original source records

[GO NADE's Vertigo library](https://gonade.app/map/vertigo) advertises 49 individual original guide pages through the same anonymous index used by its public map interface. Forty-one of those pages contain two or three real lineup images, plus a separate result image. These become `VERTIGO_PHOTO_LINEUPS` in `src/photos.vertigo.ts`.

Every record keeps the original guide URL, source title facts, origin, target, utility, side and published throw/click label. Three short instructions describe how to follow that guide's image order. A running/crouching guide whose last photo is the release position is distinguished from a guide whose last photo is the aim reference. No console commands are copied into the instructions.

The previous app wrapper loaded the **complete original page on demand**, with its branding, controls and attribution. The native viewer now displays the original photos directly, with source credit. Images remain on GO NADE's servers; they are not bundled for offline use, and no media-redistribution license is claimed.

### Coverage

The 41 photo sequences comprise **15 smokes, 11 flashes, 11 Molotov/incendiaries and four HEs**; **22 T and 19 CT** records. They cover both sides for each utility type, including A-ramp/execute/retake utility, B-stairs/site utility and mid control. Forty records use the upper view and one uses the lower view. Incendiaries use the app's Molotov category while retaining “incendiary” in the guide title.

Eight source records have only one aim image: IDs **4005, 4010, 4012, 4014, 4015, 4017, 4023 and 4040**. They are not imported as complete position/aim sequences. Their public source pages still exist, but the mere presence of an image or a `<video>` element is not evidence of a complete working guide.

Four accepted pages label the mouse input “Middle click” without establishing whether that means both buttons or a physical middle-button binding. Their labels remain **Middle click (source label)**; no LMB+RMB claim is invented. The original source presentation is available for inspection. These are IDs **4009, 4029, 4043 and 4050**.

### Floors and map pins

The source index's `is_lower` flag cannot automatically be treated as a grenade landing-floor field. It may describe the throwing origin. Guide **4021** starts inside lower T Corridor, while its result photo shows the open B-stairs entrance region; it stays in the upper guide view with the original “Stairs” target text. No exact app-map pin is inferred from that source name.

Guide **4029**, [Ramp flash from Bottom Ramp](https://gonade.app/nade/vertigo-ramp-from-bottom-ramp-flash), has separate direct destination evidence: its result photo shows the flash inside the roofed bottom-ramp hall, beneath the ceiling/conduit, with the rising ramp on the left and B-corridor doorway on the right. It uses the lower view. Its pin remains hidden because Utility Lab has no registered lower-floor target anchor. The source's origin flag is corroborating evidence, rather than the sole reason for that floor assignment.

The source audit established one lower-floor flash photo sequence. It did **not** establish lower-floor smoke, Molotov or HE photo coverage, and no guide was independently tested on the current game build. Capture dates/build numbers were not published by the inspected guide pages.

## Browser and access checks

All 49 ordinary guide requests returned HTTP 200 without `X-Frame-Options` or a Content Security Policy that forbids framing. All 41 accepted guides were then opened in actual headless Microsoft Edge frames with `sandbox="allow-scripts allow-same-origin allow-presentation"`. Every expected lineup and result image decoded successfully. Most are 1920×1080 or 2560×1440; the Wood Molotov result is a genuine 960×540 source photo, alongside its 2560×1440 position/aim images.

The public [robots file](https://gonade.app/robots.txt) allows ordinary reference/search access, sets `ai-train=no` and `use=reference`, and excludes named training crawlers. It has no `/api` exclusion. Its public frontend itself advertises the anonymous map-index endpoint used to discover these original page links. Reference-only links are retained; this is not a bulk media mirror or a training collection.

The public footer linked [Help](https://gonade.app/help) and [Privacy](https://gonade.app/privacy). No separate affirmative media-reuse or general framing license was found. Absence of restrictive frame headers was a browser-capability observation, not a copyright grant. The previous wrapper preserved the full source page; the native viewer now keeps source credits and links beside the actual images.

### Complete same-guide video check

All **41 accepted source guides** were checked for the corresponding original `/videos/<sourceId>.mp4` endpoint using ordinary HEAD requests, without downloading video bodies. **All 41 returned HTTP 200 with `text/html`; none returned `video/mp4`.** No endpoint qualified for acceptance as a source video. Exact results, content types and URLs are in `outputs/vertigo-photo-research/video-head-audit.json`.

The [Right A Tall smoke from Ramp](https://gonade.app/nade/vertigo-right-a-tall-from-ramp-smoke) endpoint `/videos/4036.mp4` was additionally checked in an actual browser: loading its video metadata failed. No `videoUrl` is added from source markup alone, and an iframe containing a video element is not described as verified playback. The photo sequences themselves remain available and passed the browser image checks. This is an observed source-media availability finding on the checked date, rather than a claim that the provider will never publish working videos.

## Research evidence and tests

Ignored research evidence is in `outputs/vertigo-photo-research/`:

- `provider-index.json`, `guide-audit.json`: factual source fields and actual image counts.
- `all-frames-result.json`: **41 of 41** source-hosted frames passed, with decoded image dimensions.
- `hosted-original-1100.png`, `wood-small-photo.png`, `lower-stairs-origin.png`, `lower-stairs-result.png`, `lower-ramp-result.png`: inspected original page screenshots; these are research evidence, not app photo assets.
- `video-4036.json`: source video endpoint did not provide playable media.
- `video-head-audit.json`: all 41 accepted guide video endpoints returned HTML, rather than MP4 media; zero playable candidates were added.
- `record-validation.json`: all 41 generated record URLs, origins, targets and sides matched their actual audited source page.

`tests/vertigo-photo-guides.test.ts` checks map/type/side coverage, original-source URL validation, image-sequence evidence, preserved input ambiguity and floor distinctions. It makes no external network requests.
