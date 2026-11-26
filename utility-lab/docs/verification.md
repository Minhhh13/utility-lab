# Release verification

## Current production release — 27 November 2026

[Utility Lab](https://utilitylab.au) serves application commit [b11ebefe](https://github.com/Minhhh13/utility-lab/commit/b11ebefe23cb109402013760221172c7c18e18e9) from [Cloudflare deployment 05f60fbc](https://05f60fbc.utility-lab-8b0.pages.dev).

| Check | Result |
| --- | --- |
| Build and browser suites | TypeScript and the production build passed. All 199 model tests, 252 Edge tests and 110 WebKit tests passed. Three touch tests use Chromium's native input protocol and ran in Edge. |
| Catalogue | The eight maps contain 1,639 published side-specific guides. This release adds 81 ways to reach existing destinations, including 54 numbered spawn smokes, 15 mollies and 12 HE guides. [Catalogue](expanded-catalogue.md) · [Spawn sources](round-start-smokes-2026-11-26.md) |
| Map walkthrough | Opened every guide through map selection at both 1440×1080 and 320×844. Each walkthrough covered 20 side/floor contexts and made 6,672 slide visits, including alternate-floor paths. Third-party image requests used a fixture for this exhaustive navigation check. |
| Labels and connections | Each viewport covered 800 throw-location views. Across 3,911 visible captions, none overlapped a caption, origin disc, destination disc or count badge. Checked 561 desktop and 914 phone connections from the recipe badge to its source point. |
| Navigation, dialogs and photos | The underline matched the visible icon and text in 72 tab, size and theme combinations. The five workspaces passed 40 screen-size and theme checks for overflow and popover bounds. On the public domain we checked Saved alignment, circular marker focus, hidden scrollbar tracks and wheel, keyboard and touch scrolling. Thirteen published stills decoded across all eight maps and returned to their selected throw origins. |
| Tactic Board and Stats on the custom domain | Checked all ten map floors with mouse and touch. In all 20 Board contexts, all 12 tools worked, the PNG exported, the JSON reimported, and shared drawings matched the editor. Stats filters, resets and saved-tactic reopening worked on desktop Edge and phone WebKit. |
| Live lineup media and origins | All 51 priority recipes passed setup, aim and landing checks using 130 distinct published photos. The sample included five Mirage T Window spawns, five Ancient CT Elbow spawns, nine Dust II Mid Doors spawns, 23 Anubis T spawns, both Anubis A Camera variants and both Window mollies. Eighteen essential HE and molly guides passed on desktop and phone with 108 photo decodes. The eight public origin tables matched the release, including 173 sources with world coordinates. |
| Zoom detail | All 67 higher-resolution files matched their source dimensions and SHA-256. Twenty-eight browser checks across the eight maps confirmed the higher-resolution image loaded on zoom, matched the frame and returned to Fit. |
| Live round-start guides and Home | All 68 sampled instant-guide paths passed. The 49 native source clips decoded and played at their recorded aim, release and landing times. The five Vertigo guide chapters played from their chapter starts on desktop and phone. One mobile YouTube start required a retry. Ten public Home-picker and navigation scenarios passed across phone, short landscape, tablet and 4:3 desktop. |
| Cache and delivery | The clean Home and Dust II map loaded zero walkthrough images. The previously missing Ancient A Donut still returned HTTP 200 and decoded to 960×540. All 2,322 local release file hashes and 120 sampled public file hashes matched. [Deployment records](cloudflare-deployment.md) |

Lineup precision is based on publisher recordings, photographs and map coordinates. Independent reproduction in the current CS2 client is still outstanding.

## Previous production release — 25 November 2026

The custom domain serves application commit `ca220422faf352c0c0300b6a9e8d67d64d702d1a`. Cloudflare confirmed production deployment `2737877e-7863-4221-a4f7-7504158ccf53`. [Open Utility Lab](https://utilitylab.au) · [Immutable deployment](https://2737877e.utility-lab-8b0.pages.dev)

| Check | Result |
| --- | --- |
| Release suite | TypeScript and production build passed. 173 model tests, 192 Edge tests and 45 WebKit tests passed. The two Playbooks editor tests remain skipped while that editor is marked Coming soon. |
| Full Lineups walkthrough on the release build | All 1,558 published guides opened through the map on a 1440×1080 desktop and a 320×844 touch viewport. The walkthrough visited all 20 side/floor contexts at each size, including the empty Vertigo lower T-side view. It made 5,125 slide visits per viewport, including repeat visits through alternate floors. External photo requests used a local image fixture in this walkthrough. |
| Live Nuke and Cache | All 58 landing actions checked across five Edge and WebKit scenarios had reachable hit targets and distinct labels. The selected throw locations and camera matched after selection and Back, including on a 568×320 screen. |
| Live spawns and media | Matched all five Ancient Top Mid buttons to their recorded coordinates on desktop and phone. The priority sample decoded 43 distinct creator photos. The restored Ancient #2 clip played at 1920×1080. Also checked all five Mirage Window and Ancient CT Elbow spawns, Dust II Mid Doors, the Anubis T instant guides and both Window mollies. The native Ancient clip and the Anubis Camera YouTube chapter both played. [Spawn evidence](lineup-origins.md) |
| Live Tactic Board | All eight maps and ten floor views passed with mouse and touch. Exercised all 12 tools in each of 20 contexts, saved and updated tactics, reimported 20 JSON exports, produced 20 PNGs, and compared every shared drawing with its editor counterpart. |
| Live home and caching | Desktop Edge and phone-sized WebKit decoded all six backgrounds and checked navigation, keyboard focus and reduced motion. WebKit reopened a viewed creator photo offline and recovered from a corrupted cache entry on Retry. |
| Live delivery | 103 public file hashes matched the prepared release, including every application bundle, map catalogue, map and home artwork. Confirmed the canonical redirect and static 404. [Deployment details](cloudflare-deployment.md) |

These checks exercise the website and public creator recordings. Independent gameplay verification in the current CS2 build remains untested. Browser reports for this release are in the local `outputs/polish-audit/` and `outputs/spawn-review/` directories.

## Earlier release — 25 November 2026

**Published and verified, 25 November 2026 (Australia/Sydney):** [utilitylab.au](https://utilitylab.au) now serves deployment `1f17cc40-5a46-480d-ac32-e94955057c88` from application commit `5bf41586ef922cbdc5003a50aabbaf60c9775044`, pushed to `main`. The release adds precise throw origins, complete visual recipe choices, desktop side controls, subtle pointer feedback and bounded photo caching. **172 model, 183 Edge and 31 WebKit tests pass**, plus all 575 packaged HTTP asset hashes, eight public functional groups and three real-photo WebKit cache checks. The live initial JS/CSS, Anubis radar and service worker match the checked artifact. Both native video and the exact Camera chapter actually played. [Current release evidence and limits](release-2026-11-25.md).

That release contained **1,557 primary guides / 1,477 sources**, with all 1,557 origins resolved. It added 53 recipes and 16 precision improvements and removed the earlier four-origin availability cap. [Coverage at that release](catalogue-coverage-2026-11-24.md) and [current interface contract](compact-overview.md).

## Archived release — 16 November 2026

**Published and verified, 16 November 2026:** the larger photo dialog, full-edge map canvas and smaller Back to targets text are live on [utilitylab.au](https://utilitylab.au), deployment `c39dd969-a0fd-4e29-8cae-2866af0f8da2`, from application commit `d93a9e966054973976bae98980857947d3f212d0` pushed to `main`. Ten live-verification groups pass on the custom domain. All four canvas edges match the SVG viewport with the header shown/hidden at desktop and phone sizes; actual top-edge wheel/pan works and selection preserves the camera. Back text is 12px with a reachable 44px hit target. The landscape fixture paints at 799px high in a 1920×1080 window, fully contained with keys and controls visible. Combined filters, photo zoom, aim, Video and canonical redirection also pass. No application JavaScript errors were observed. [Release details](cloudflare-deployment.md).

The production build/TypeScript check, **147 model tests, 158 Edge browser tests and five WebKit tests** pass; two existing browser cases are skipped. Twenty-two additional WebKit cases pass across the viewer/canvas and photo-wheel checks. The all-map short-window hit test exposed floating dock coverage; the final Fit framing and compact bottom utility dock keep all eight maps' pins reachable. The full release log is `outputs/full-canvas/release-checks.log`, the machine gate is `outputs/checks/latest.json`, and production captures/report are in `outputs/full-canvas/`. See [layout and validation details](compact-lineups-layout.md).

The preceding compact-controls release also passed its complete workflow and five live groups. Its historical logs and captures remain in `outputs/compact-lineups/`.

**Current primary domain: [utilitylab.au](https://utilitylab.au).** On 11 November 2026, the same application deployment passed 33 custom-domain functional checks and three final cache, redirect and privacy checks. HTTPS and both domain validations are active. [Domain evidence and workspace transfer](custom-domain.md). The earlier application-release evidence below remains unchanged.

Updated 10 November 2026. The authorized Cloudflare website is **[utility-lab-8b0.pages.dev](https://utility-lab-8b0.pages.dev)**. Local production remains at http://127.0.0.1:5180. The filtered static release was uploaded directly; no Git push or browser workspace upload was performed. This release uses project files and public online reference media only, without accessing CS2, Steam, game processes or installation files.

## Archived 10 November checks

| Check | Result |
| --- | --- |
| Catalogue/origin generation, TypeScript and production build | Passed |
| Models, catalogue, media, storage and geometry | 147 passed |
| Microsoft Edge production browser suite | 136 passed |
| WebKit phone flows and map focus | 5 passed |
| Independent packaged runtime | 490 HTTP assets; 517 asset hashes matched; four routes and 320px controls passed |
| Staged Playbooks editor | 2 explicitly skipped while Coming soon |
| Live Cloudflare HTTPS/browser/media checks | 33 passed |
| Existing public-session normal refresh | Passed; saved guide, service worker and exact cached Anubis map retained; new shell reopened offline |
| Capacitor iOS sync | Passed; no native compilation/signing |

**288 local checks passed, zero failures**, plus the separate live-host checks. The full run is outputs/checks/cloudflare-display-final.log; its machine report is outputs/checks/latest.json. Live evidence is outputs/cloudflare/live-smoke.json and screenshots in outputs/cloudflare/. Deployment ID: b09073e7-be76-41eb-94b5-c2d4cbe4f9fd. [Immutable tested deployment](https://b09073e7.utility-lab-8b0.pages.dev).

The public artifact has 517 files / 98,963,140 bytes. All 517 packaged assets SHA-256 match the checked production build. Initial JavaScript: 246,031 bytes / 78,381 gzip. Catalogues, origin tables and remote media stay lazy. These are build/browser measurements, not a Steam-overlay performance benchmark.

The [local release folder](../outputs/releases/utility-lab-local-1.0.0-20261110T074620/) and [Windows ZIP](../outputs/releases/utility-lab-local-1.0.0-20261110T074620.zip) contain the same filtered web build plus a read-only Node server and launcher. ZIP size: 94,535,362 bytes.

## Archived 10 November interface

Display settings offers persistent **Auto, 16:9 and 4:3** desktop workspace fitting plus the compact In-game view. Fixed ratios fit inside the available browser area and do not stretch map geometry. Narrow phones use screen-fitting Auto. Home artwork stays full-screen; saved ratios apply to the working tabs. Hide top bar frees the header space; a floating Show top bar button restores it. Neither action remounts the editor or resets its SVG viewBox. Actual Steam and game display modes are not changed.

Lineups browsing is map-only. Group markers show grenade glyphs. Multiple available utilities open a radial with unrelated overview markers hidden. One available utility skips that picker; one exact destination skips the redundant landing confirmation and shows real standing pins directly. Multiple destinations remain selectable on the map. Choosing a standing pin opens Position-first photos; even one origin is not auto-opened. At most four source recipes are offered after selecting an exact destination.

Group, utility, landing and standing selection, photos and Back preserve same-floor zoom/pan. Only manual pan/zoom/Fit or changing map/floor context changes that view. Pointer clicks and panning show no whole-map focus border; keyboard navigation retains a themed focus indicator on both maps. Tests cover all 20 map/floor/side contexts and all 64 map/side/utility combinations, including unique-destination shortcuts, hidden-background keyboard recovery, cancellation, Mid Doors, source provenance, 320px layouts and manual-camera preservation.

Photos use the independent, stable fitting frame with source-confirmed aim overlays, swipe/zoom and explicit keys. Matching videos load only from the compact Video tab. The restored unboxed route symbol, classic Dust animated Home scenes, pen colours/arrows/inline board text and portable tactic sharing remain. Playbooks is greyed out as Coming soon while records and backup models are preserved.

## Archived 10 November inventory and limits

The inventory remains **1,504 photo-first entries / 1,424 source pages**, 751 typed destinations, eight approved maps and ten floors. There are 1,497 publisher standing references and seven registered named areas, including 24 cross-floor guides. The collection references 4,597 unique images; 420 bundled images total 90,424,612 bytes. Other original photos and videos require internet.

Live checks decoded Position/Aim images for 16 sampled guides across every map, checked native video playback and YouTube embed delivery, and exercised phone, Saved and cached offline board behavior. YouTube embed delivery is not proof of every clip's playback or regional availability. Navigation can cancel media/telemetry requests; uncached map thumbnails can fail while intentionally offline. Download all maps explicitly for broad offline map coverage.

Source evidence and approximate navigation pins do not establish current-game throw accuracy. Physical iPhone, native signing/App Store distribution and the actual Steam browser remain untested. Browser origin separates saved data; use workspace export/import to transfer localhost saves to the public address. There is no account sync or live shared editing. See [Cloudflare delivery](cloudflare-deployment.md).
