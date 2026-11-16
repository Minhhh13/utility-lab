# Lineup photo sources

> **10 November 2026 update:** Photos now appear directly in Utility Lab's own swipeable viewer, not inside source websites. The active photo catalogue has 48 bundled guides (102 images) and 217 native online galleries (642 GO NADE plus 24 other image references). See the [native GO NADE audit](native-gonade-photo-sources.md) and [other native-photo audit](native-other-photo-sources.md). Full-page/iframe descriptions below document the previous implementation and its research evidence.

Checked **9 November 2026**. Photo guides and coordinate annotations are separate evidence. A licensed source photo does not establish that its throw still works on the current game build.

## Included photo sequences: Cache, Ancient and Dust II

[Kielson123/CS2Lineups](https://github.com/Kielson123/CS2Lineups/tree/05972d55ec70194ffe6a4a8b677cdd0322fbda8c) supplies the imported photo sequences. The pinned snapshot is `05972d55ec70194ffe6a4a8b677cdd0322fbda8c`.

| Map | Selected source guides | Library rows | Unique original images |
| --- | ---: | ---: | ---: |
| Cache | 12 | 14 | See asset manifest |
| Ancient | 12 | 13 | See asset manifest |
| Dust II | 12 | 13 | See asset manifest |
| Total | 36 | 40 | 100 |

The source marks four selected throws as usable by both sides. Those share the same photographs in separate T/CT library rows; they are not additional independently recorded throws. Selection favors smokes, then useful flash/molly references. This source contains no selected HE photo guide. Mirage guide panels come from the separate source below.

### Permission and provenance

- The repository's [MIT license](https://github.com/Kielson123/CS2Lineups/blob/05972d55ec70194ffe6a4a8b677cdd0322fbda8c/LICENSE) names **Copyright (c) 2025 _Kielson**. Its full notice is retained at `public/lineup-media/kielson/LICENSE.txt`.
- The [source README](https://github.com/Kielson123/CS2Lineups/blob/05972d55ec70194ffe6a4a8b677cdd0322fbda8c/README.md) documents a coherent content workflow: place game screenshots in the lineup directory, connect their exact order to map JSON, and run its image optimizer. Its [readable optimizer source](https://github.com/Kielson123/CS2Lineups/blob/05972d55ec70194ffe6a4a8b677cdd0322fbda8c/scripts/optimize_images.py) processes local PNG/JPEG files into WebP. No repository executable was downloaded or run.
- All 100 imported images were rendered and visually reviewed in contact sheets. They are consistent CS2 game screenshots with the source's green crosshair, standing/aim sequences and target views. No third-party site watermark or generic video thumbnail was detected. Acceptance rests on that publication, license and workflow evidence; no separately witnessed photography claim is made.
- Counter-Strike artwork, map designs and game trademarks retain their respective owners' rights. The source's MIT notice does not relicense Valve's underlying game content. Utility Lab is an unofficial fan tool; no Valve endorsement is claimed. [Valve legal information](https://store.steampowered.com/legal) identifies that ownership.
- Files are **original source WebP bytes**, without cropping, repainting, AI generation or local recompression. The 100 images total **28,025,514 bytes**; the largest is **469,730 bytes**. Each guide remains within the app's four-photo and transfer-size limits.

Every image's original path, pinned source URL, SHA-256 checksum and byte size is recorded in `public/lineup-media/kielson/asset-manifest.json`. The selected records retain their JSON file, section, index, original title, side and throw object in `photoSource`. Local map JSON copies are retained alongside the license.

### What each step establishes

The source JSON links each standing reference to its own aim image(s). These become `kind: position` and `kind: aim`; the same guide's preview/result view is conservatively labeled `context`. Those previews are not substituted for aim photos, and no release-frame image is invented. Captions retain the source order and tell the reader which alignment to reproduce.

The source's [mouse renderer](https://github.com/Kielson123/CS2Lineups/blob/05972d55ec70194ffe6a4a8b677cdd0322fbda8c/assets/js/map.js) distinguishes `both-click` (“both buttons”) from `middle-click` (“middle button”). Imported `both-click` records therefore mean **LMB + RMB**, never the mouse wheel. Jump, run and named movement keys come from the corresponding JSON. Missing movement or release timing stays unspecified.

The upstream capture date and game build are not published. The import does not claim current-build retesting or measured grenade landings. Raw source records start with `showMarker: false`. The central guide library separately enables a named target-callout pin only when [the displayed map artwork has a registered anchor](map-marker-registration.md); unknown targets remain hidden. These area pins are navigation aids, not a registration of the source photographs' standing position or exact throw landing.

## Included original guide panels: Mirage

[spnk / CS2 Compendium](https://github.com/1234/cs2-compendium/tree/deaae65ebae1a9a48240ea215d3d72d5e1c7a712/training/utility/mirage) publishes two genuine CS2 guide composites, pinned at `deaae65ebae1a9a48240ea215d3d72d5e1c7a712`. Its [content license](https://github.com/1234/cs2-compendium/blob/deaae65ebae1a9a48240ea215d3d72d5e1c7a712/README.md#license) explicitly includes the guide images under **CC BY-SA 4.0**. The creator attribution, license and source links remain visible in photo metadata and in each unchanged image's watermark. The original license and README copies are retained in `public/lineup-media/compendium/`.

The Palace Alley panel combines a shared third-person standing location and first-person view with separate Jungle, Top Stairs and CT aim/landing rows. It supplies three independently selectable smoke records. The Window panel matches five numbered T-spawn boxes to five aim references, supplying five spawn-specific records. Each record displays the full original composite and names its exact numbered panel; these are **eight source throws in two original images**, rather than eight independently photographed slideshows. The app does not crop attribution or manufacture release frames.

The [source instructions](https://github.com/1234/cs2-compendium/blob/deaae65ebae1a9a48240ea215d3d72d5e1c7a712/training/utility/mirage/README.md) specify **Space + LMB** for the Palace Alley set and **Shift + W + Jump + LMB** for Window. The Window image also states its release timing, which remains a source instruction to check while practicing. No current-build result is asserted.

[Repository history](https://github.com/1234/cs2-compendium/commits/deaae65ebae1a9a48240ea215d3d72d5e1c7a712/training/utility/mirage) dates the original Window publication to **17 June 2026** and Palace Alley to **20 June 2026**; the actual screenshot dates and game build are not stated. Both 1280×800 WebPs were visually reviewed: they show real CS2 scenes with position and crosshair annotations, retain the author's repository watermark and contain no detected competitor watermark. Original bytes are retained: **151,710** and **154,870** bytes, with SHA-256 checksums in the asset manifest.

`COMPENDIUM_PHOTO_LINEUPS` in `src/photos.compendium.ts` exports these eight records. The guide images and adapted guide text retain CC BY-SA 4.0; this does not change unrelated app code's license. The source expressly reserves Valve's underlying game assets and trademarks. Raw records use `showMarker: false` because the source does not provide registered app-map coordinates. The central library may enable a separately audited target-callout area pin; that does not establish an exact grenade impact, photo viewpoint or current-build throw validation.

These bundled sources provide **48 library records from 44 source throws**, with **102 unique original images across four maps**. The current library also includes **217 native online galleries with 666 direct original image references** (642 GO NADE and 24 other images), bringing photo access to **265 records across all eight supported maps**. Every map has photo references for T and CT, across Smoke, Flash, Molotov/incendiary and HE. This is a map/side/type availability matrix, not a claim to include every possible throw or every floor-specific combination.

The earlier online implementation displayed complete original pages. Photos now render directly in Utility Lab's own viewer with source credit and original guide links; photo files remain on their original hosts. The [native GO NADE audit](native-gonade-photo-sources.md) and [other native-photo audit](native-other-photo-sources.md) document direct-image decoding. Earlier source-page discovery checks remain in [Nuke](nuke-photo-sources.md), [Vertigo](vertigo-photo-sources.md), [Inferno/Anubis](other-map-photo-sources.md), [Mirage](mirage-online-photo-sources.md) and [remaining map/side/type additions](photo-coverage-fill.md). HTML placeholders and non-video responses were excluded; current working clips are listed in the [verified-video audit](native-gonade-video-sources.md). Online guides require internet. The earlier Reddit viewer candidates are no longer in the active catalogue.

## Public-web coordinate annotations

[ReneRebsdorf/CS2-annotations](https://github.com/ReneRebsdorf/CS2-annotations/tree/f6b2b17dac00f8167e7226b7029f1f4c0f4ceabe) is a separate source, pinned at `f6b2b17dac00f8167e7226b7029f1f4c0f4ceabe`. Its [MIT license](https://github.com/ReneRebsdorf/CS2-annotations/blob/f6b2b17dac00f8167e7226b7029f1f4c0f4ceabe/LICENSE) names **Copyright (c) 2025 Rene Rebsdorf**. The full notice and seven original annotation text files are bundled in `public/lineup-media/cs2-annotations/`.

The [contribution instructions](https://github.com/ReneRebsdorf/CS2-annotations/blob/f6b2b17dac00f8167e7226b7029f1f4c0f4ceabe/CONTRIBUTING.md) explain its linked standing, aim-target and destination annotations. Matching their IDs produces these complete source triples:

| Map | Complete grenade triples |
| --- | ---: |
| Mirage | 42 |
| Dust II | 22 |
| Inferno | 69 |
| Nuke | 33 |
| Ancient | 57 |
| Anubis | 80 |
| Vertigo | 31 |
| Cache | No upstream file |
| Total | 334 |

`WEB_SOURCE_ANNOTATIONS` in `src/lineup-photos.ts` retains exact public source world positions, aim angles, aim-marker positions, destination coordinates, tolerance, source node IDs, jump flags and raw instruction text. Source-file SHA-256 hashes accompany each record. The equivalent source data is `public/lineup-media/cs2-annotations/web-source-annotations.json`. These annotations are separate from completed photo guides.

The source instruction text stays intact rather than inferring missing mouse buttons or movement. Four source jump flags conflict with their instruction text; those records retain an explicit source inconsistency warning.

No local game installation, overview transform, derived floor boundary, build identifier or capture workflow is part of this public-web dataset. Public world coordinates remain unregistered to the app's SVG drawings and are never used as guessed visible pins.

The two bundled Nuke documentation screenshots show several standing/aim annotations at once. They are exported only as `ANNOTATION_CONTEXT_PHOTOS`, with `kind: context`; they are not complete per-lineup photo guides. Public source records are never matched to a creator video by target name alone.

## MetaStack public-web access check

On 9 November 2026 ordinary public requests to the [MetaStack homepage](https://metastack.gg/) and its advertised sitemap returned **HTTP 403** with a Cloudflare access check. The accessible [robots.txt](https://metastack.gg/robots.txt) lists excluded application routes and advertises that sitemap. No authentication, challenge bypass or guessed private API was used.

Its public [Lineups help page](https://help.metastack.gg/features/lineups.html) explains the product's photo fields, movement and throw choices. The public [account documentation](https://help.metastack.gg/getting-started/account.html) explains that access to the application uses Steam sign-in. These are useful source links and product references, not a downloadable lineup-image dataset or a media redistribution grant. No MetaStack lineup photos were copied.

## 5Stack public-web access check

[5Stack's utility documentation](https://docs.5stack.gg/features/utility-library) describes public signed-out guides with six ordered game-recorded stills. The delivered website JavaScript advertises its [GraphQL endpoint](https://api.5stack.gg/v1/graphql), public lineup fields and the `/utility/lineup/:id` route. An ordinary anonymous read-only query succeeded without a token or account. The returned metadata distinguishes stance, first-person stance, aim, pulled-pin aim, aim close-up and landing, plus a preview-render timestamp. Media URLs are signed, expiring CDN links.

On 9 November 2026 its public, unarchived records with still metadata numbered **Mirage 14, Ancient 4 and Dust II 17**; the same query returned zero for Inferno, Nuke, Anubis, Vertigo and Cache. This is an observed instance count, not a claim about every 5Stack installation or independent validation of those throws.

The [published software license](https://docs.5stack.gg/license) and [repository notice](https://github.com/5stackgg/5stack-panel/blob/main/NOTICE) describe AGPL/GPL code terms, without an express redistribution grant for hosted player-guide media. The public source pages can be linked, but no 5Stack CDN photos or clips were copied into the app. At the time of this audit, that source did not close the four-map photo gap; other providers supplied the later additions documented above.

## CS2.APP private-download terms check

The complete [CS2.APP terms](https://www.cs2.app/terms-and-conditions), updated **25 September 2026**, do not establish permission for an automated private photo library. Section 2 permits limited personal, noncommercial or internal downloads only while complying with the other terms. Section 3 excludes bot/script access. Section 4 excludes systematic collection into a database without written permission, automated extraction and unauthorized framing, among other restrictions. Keeping a collection private or outside Git does not remove those published restrictions. No CS2.APP photo assets were imported; this is a reading of the provider's stated terms, not a legal guarantee about every possible use.

## Historical Reddit evaluation, outside the active catalogue

The earlier evaluation considered Reddit's [Embeds Terms](https://redditinc.com/policies/embeds-terms) for displaying public posts with the provider's complete presentation. Creator rights, Reddit branding and attribution would have remained intact; an embed would not have authorized offline media copying or implied endorsement. That design required an original-post fallback because remote content could become unavailable. It is not the current native-photo implementation.

The historical `src/photos.reddit.ts` records retained one entry per original image/gallery post, rather than counting numbered spawn panels as independently checked app lineups. None is included in the active photo catalogue:

| Source author | Map / source guide | Published | Provider media type |
| --- | --- | --- | --- |
| [u/biio1337](https://www.reddit.com/r/cs2/comments/1lkgx2s/inferno_instant_smokes_ct_to_lower_mid/) | Inferno CT to Lower Mid, six-spawn gallery | 25 June 2025 | Gallery |
| [u/Vien78](https://www.reddit.com/r/cs2/comments/1lkboof/anubis_instant_smokes_ct_to_stairs_cheatsheet/) | Anubis CT to Stairs | 25 June 2025 | Image |
| [u/Vien78](https://www.reddit.com/r/cs2/comments/1llubl1/anubis_instant_smoke_ct_to_mid_cheatsheet/) | Anubis CT to Mid, instant and standard setups | 27 June 2025 | Gallery |
| [u/markfoged](https://www.reddit.com/r/GlobalOffensive/comments/1ard0jk/anubis_house_aka_window_instant_smoke_cheat_sheet/) | Anubis T-spawn House / Window sheet | 15 February 2024 | Image |

Each provider oEmbed request and official embedded page returned HTTP 200 on 9 November 2026. Provider metadata identifies the image/gallery type, publication timestamp, original creator and non-NSFW status. The original authors describe making the photographed guides; Vien78 describes a screenshot/Canva workflow and using Refrag for the standing views. The older Anubis sources are explicitly dated and are not evidence of current-map success.

Those 200 responses came from ordinary Node HTTP requests. A separate isolated headless Edge request to the official Inferno viewer returned **HTTP 403** from Reddit's network security, so actual browser photo rendering was not marked verified. The access check was not bypassed. That result required a direct original-post fallback in the earlier design; an iframe URL and source metadata did not guarantee browser rendering.

The inspected Reddit oEmbed response returned a blockquote and its official `embed.reddit.com/widgets.js` loader, not a literal iframe element. That loader generated the allowlisted `https://embed.reddit.com/<original-post-path>/?embed=true&ref_source=embed&ref=share&utm_medium=widgets&utm_source=embedv2&utm_term=23&utm_name=post_embed` URL. The earlier wrapper stored that URL and the original post link without injecting supplied HTML. Media would have remained on Reddit and loaded on demand, without an offline-copy claim.

The historical records preserved input ambiguity. The Inferno gallery's Spawn 2 caption said W while its body said jump throw; its record flagged that conflict. The Anubis Stairs author marked position 0 unusable. Inputs absent from post text were left for the original photo panel rather than filled with guessed LMB or timing values. No Reddit photo assets or posters were downloaded into the app.

## Sources examined but not imported as photo guides

- [Natxo09/cs2-utility-web](https://github.com/Natxo09/cs2-utility-web): MIT app with video-link data and team icons, rather than standing/aim photo sequences.
- [M-Rocchinotti/cs2-lineup-hub](https://github.com/M-Rocchinotti/cs2-lineup-hub): reference/upload UI; no bundled lineup photo library was found.
- [njyeung/cs2-nade-guide](https://github.com/njyeung/cs2-nade-guide): useful annotation-tool documentation images, not a completed per-lineup photo catalogue.
- [chrislitality-svg/cs2-lineups](https://github.com/chrislitality-svg/cs2-lineups): user photos are stored in the user's IndexedDB; its public assets do not supply the required photo sequences.
- [CSNades/website](https://github.com/CSNades/website): historical website code; no current CS2 media license was established. Public accessibility is not treated as permission to copy a competitor's library.
- [EsboSmokes](https://github.com/jesb92/esbosmokes): its top-level code license is MIT, but inspected video samples carried a **CSNADES.gg** watermark. That does not establish rights to redistribute the third-party footage. No Esbo clips or extracted frames are included in public assets.

The supported map/side/type photo matrix is now filled by the sources above. Exhaustive throw coverage and independent current-build verification remain content gaps; no simulated screenshots substitute for them. Creator-video guides remain independently attributed, and users can add their own genuine photo steps.
