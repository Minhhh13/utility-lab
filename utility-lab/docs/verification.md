# Release verification

**Interface release candidate, 16 November 2026:** the compact Lineups canvas and pointer-centered photo wheel zoom pass the production build/TypeScript check, **147 model checks, 51 targeted Edge browser checks and 16 WebKit checks**. All targeted browser checks pass, including full hit-testing of narrow-phone photo controls and default map pins. The Local workspace badge and green status dot have also been removed. The user authorized publishing these changes to utilitylab.au and pushing the code; the complete release checks gate deployment. See [layout and validation details](compact-lineups-layout.md). Logs and captures are in `outputs/compact-lineups/`.

The complete release workflow also passes: **147 model tests, 147 Edge browser tests and 5 WebKit tests**; two existing browser cases are skipped. Catalogue/origin generation, TypeScript and the production build pass. The final machine report is `outputs/checks/latest.json`, and the complete log is `outputs/compact-lineups/release-checks-final.log`.

**Current primary domain: [utilitylab.au](https://utilitylab.au).** On 11 November 2026, the same application deployment passed 33 custom-domain functional checks and three final cache, redirect and privacy checks. HTTPS and both domain validations are active. [Domain evidence and workspace transfer](custom-domain.md). The earlier application-release evidence below remains unchanged.

Updated 10 November 2026. The authorized Cloudflare website is **[utility-lab-8b0.pages.dev](https://utility-lab-8b0.pages.dev)**. Local production remains at http://127.0.0.1:5180. The filtered static release was uploaded directly; no Git push or browser workspace upload was performed. This release uses project files and public online reference media only, without accessing CS2, Steam, game processes or installation files.

## Executed checks

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

## Current interface

Display settings offers persistent **Auto, 16:9 and 4:3** desktop workspace fitting plus the compact In-game view. Fixed ratios fit inside the available browser area and do not stretch map geometry. Narrow phones use screen-fitting Auto. Home artwork stays full-screen; saved ratios apply to the working tabs. Hide top bar frees the header space; a floating Show top bar button restores it. Neither action remounts the editor or resets its SVG viewBox. Actual Steam and game display modes are not changed.

Lineups browsing is map-only. Group markers show grenade glyphs. Multiple available utilities open a radial with unrelated overview markers hidden. One available utility skips that picker; one exact destination skips the redundant landing confirmation and shows real standing pins directly. Multiple destinations remain selectable on the map. Choosing a standing pin opens Position-first photos; even one origin is not auto-opened. At most four source recipes are offered after selecting an exact destination.

Group, utility, landing and standing selection, photos and Back preserve same-floor zoom/pan. Only manual pan/zoom/Fit or changing map/floor context changes that view. Pointer clicks and panning show no whole-map focus border; keyboard navigation retains a themed focus indicator on both maps. Tests cover all 20 map/floor/side contexts and all 64 map/side/utility combinations, including unique-destination shortcuts, hidden-background keyboard recovery, cancellation, Mid Doors, source provenance, 320px layouts and manual-camera preservation.

Photos use the independent, stable fitting frame with source-confirmed aim overlays, swipe/zoom and explicit keys. Matching videos load only from the compact Video tab. The restored unboxed route symbol, classic Dust animated Home scenes, pen colours/arrows/inline board text and portable tactic sharing remain. Playbooks is greyed out as Coming soon while records and backup models are preserved.

## Content and practical limits

The inventory remains **1,504 photo-first entries / 1,424 source pages**, 751 typed destinations, eight approved maps and ten floors. There are 1,497 publisher standing references and seven registered named areas, including 24 cross-floor guides. The collection references 4,597 unique images; 420 bundled images total 90,424,612 bytes. Other original photos and videos require internet.

Live checks decoded Position/Aim images for 16 sampled guides across every map, checked native video playback and YouTube embed delivery, and exercised phone, Saved and cached offline board behavior. YouTube embed delivery is not proof of every clip's playback or regional availability. Navigation can cancel media/telemetry requests; uncached map thumbnails can fail while intentionally offline. Download all maps explicitly for broad offline map coverage.

Source evidence and approximate navigation pins do not establish current-game throw accuracy. Physical iPhone, native signing/App Store distribution and the actual Steam browser remain untested. Browser origin separates saved data; use workspace export/import to transfer localhost saves to the public address. There is no account sync or live shared editing. See [Cloudflare delivery](cloudflare-deployment.md).
