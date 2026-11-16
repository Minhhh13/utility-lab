# Expanded Dust II, Mirage and Ancient guides

Public-source research checked **10 November 2026 (Australia/Sydney)**. This work reads online guide pages and their original media only. It does not launch or inspect CS2, Steam, a game process or a game installation. No video file is downloaded into the project.

The final three-map export contains **601 fully paired library rows from 553 original guides**: Dust II 202 rows / 184 guides, Mirage 234 / 213, and Ancient 165 / 156. Every accepted row has a standing reference, a separate aim photo, source inputs and a matched working video. The CS2Tricks inventory and checks below account for 597 rows / 549 guides; four explicit T-side Dust II HE guides from CSNADES complete the supplement described next.

## Dust II T-side HE supplement

The CS2Tricks Dust II HE inventory is explicitly CT-only. Four original [CSNADES Dust II HE guides](https://csnades.gg/dust2/hegrenades) provide the missing T-side choices: [Mid Doors from XBox](https://csnades.gg/dust2/hegrenades/mid-doors-from-xbox), [Short from Lower Tunnels](https://csnades.gg/dust2/hegrenades/short-from-lower-tunnels), [Short Stairs Corner from Mid](https://csnades.gg/dust2/hegrenades/short-stairs-corner-from-mid), and [Back Plat from Upper Tunnels](https://csnades.gg/dust2/hegrenades/back-plat-from-upper-tunnels). Each source explicitly labels Team Terrorist and connects its own full-size lineup image with its original MP4. All four images decoded and all four clips produced positive browser duration and 2562×1440 dimensions.

Each clip visibly shows its standing setup. Four reviewed, unmodified source-video JPEG stills supply that first step; the second step remains the guide's original aim image. No result photo is invented. [The supplement evidence](data/dust2-t-he-source-evidence.json) records exact source and media URLs, the original movement/mouse inputs, actual capture times, dimensions and hashes. The additional JPEGs live under `public/lineup-media/source-video-stills/csnades/dust2/`. The original source publication/update dates remain evidence rather than a claim that these throws were retested on the current map version.

## Complete discovery inventory

The ordinary public [CS2Tricks sitemap](https://www.cs2tricks.com/sitemap.xml) advertised **550 individual utility guides** across these three maps. All 550 canonical pages returned readable guide metadata; their canonical URLs matched the requested URLs. Category pages, wallbangs, skill jumps, boosts and combination pages are excluded.

| Map | Smoke | Flash | Molotov/incendiary | HE | Original guide pages |
| --- | ---: | ---: | ---: | ---: | ---: |
| Dust II | 107 | 41 | 24 | 8 | 180 |
| Mirage | 128 | 40 | 29 | 16 | 213 |
| Ancient | 92 | 24 | 36 | 5 | 157 |
| **Total** | **327** | **105** | **89** | **29** | **550** |

The [public robots file](https://www.cs2tricks.com/robots.txt) allows public guide routes while excluding account, submission and edit routes. No excluded route, authentication, private endpoint or access-check bypass is used. The [CSNADES sitemap](https://csnades.gg/sitemap.xml) additionally identified 298 individual utility pages for these maps, but the initial expansion prioritizes the separate standing/aim photos published by CS2Tricks.

## Exact source bindings

`src/data/expanded-dust2-mirage-ancient.ts` exports `EXPANDED_DUST2_MIRAGE_ANCIENT`. Each row keeps its original canonical guide, creator, exact target and origin labels. The source's public structured guide object explicitly connects its Position, Lineup/Aim and Result images to its original file-video URL and YouTube ID. Related-guide images, covers and generic thumbnails are not substituted for a standing or aim photo.

**518 original guides publish separate Position and Aim photos.** No source Position URL duplicates its Aim URL. The remaining 32 lack a published Position photograph: five Dust II, six Mirage and 21 Ancient guides. Where an original clip actually shows the standing position, a separately reviewed still can provide that step; an aiming-only view cannot be relabelled as a standing photograph.

The complete original-media pass decoded all 518 published standing/aim pairs. The core expansion accepts **549 original CS2Tricks guides / 597 source-side rows**, all with a matched working video. Counts are Dust II 180 originals / 198 rows, Mirage 213 / 234 and Ancient 156 / 165. One Ancient Top Mid T Spawn #2 variant is held outside the clear-standing set because its clip never provides a usable origin view; its landing preview is not relabelled as a position.

### Recovered standing views

For guides without a published Position image, **28 original source-video stills** provide actual standing references. Each full frame was reviewed for the settled origin rather than an approach, aiming-only shot, trajectory preview or landing. Original floor markings and feet remain where the creator recorded them; no circle, box, scene object or map view is fabricated. The 28 local JPEGs total about 6.2 MB and live under `public/lineup-media/source-video-stills/cs2tricks/`. Exact original clip URL, timestamp, native/output dimensions, creator, review rationale and file hash are in [the still manifest](data/expanded-dma-position-stills.json).

Three additional Top Mid variants use explicitly shared **predefined Ancient T Spawn #1/#4/#5** standing references from the publisher's A Donut guides. Each original/donor pair shares the exact publisher origin UUID and x/y, and the donor frame visibly shows feet/standing ground. The position photo links and credits its actual donor guide; the aim photo and video remain those of the original Top Mid guide. [The three explicit exceptions](data/shared-spawn-photo-evidence.json) are durable evidence. Generic callout names/UUIDs do not authorize shared-photo substitution.

YouTube stills come from the actual decoded source video frame through ordinary browser canvas security; tainted/blocked extraction is rejected. File clips use the original video element at 1280×720. The frame review retains the source image without scene edits or browser chrome. Advertisements complete normally before any source frame is captured, and per-frame source-ID/ad checks reject the wrong content. No clip file is saved.

Explicit source sides are retained. A `terrorist` record produces a T row; `counter_terrorist` produces a CT row. Only the source's own `any_team` label permits one T and one CT row using the same media. Library-row counts therefore differ from original-guide counts; these shared photographs are not represented as independently captured throws.

## Input fidelity

Movement and mouse/jump inputs come from each guide's structured fields and actual rendered input labels. These include Left Click, Right Click, Mouse Both, Jump & Mouse Left, Jump & Mouse Right, Jump & Mouse Both, and Jump & Mouse Left + W. **Mouse Both means LMB + RMB.** The W variant's source explanation says to tap W; it is not changed to an instruction to hold W.

Three short steps show where to stand, which crosshair to match and which published movement/throw combination to use. No standing command is executed or included in app instructions. Published descriptions and required preparation remain in the research metadata for comparison with the source clip; source publication/update dates are not represented as capture dates or current-build testing.

The Dust II CT Spawn #1 Long Doors smoke also preserves the creator's explicit A then A + S jumpthrow sequence; [its input evidence](data/expanded-dma-input-evidence.json) records the source description and original clip captions. It is not flattened into generic running.

## Direct-image and video checks

Original, source-advertised full-size WebPs are checked with native browser image elements from a localhost page and the browser's normal referrer. An advertised JPG alternative is tried only if the corresponding original WebP fails. Accepted position and aim images must decode at a genuine photo resolution; HTML responses and broken assets do not count. The viewer keeps the original source URLs and credits, without a source-website iframe or a copied online image bundle.

A file-video choice requires an actual supported MP4/WebM response and positive finite browser duration with nonzero video dimensions. A filename ending in `.mp4` or an HTTP 200 response alone is insufficient. Original MOV/MKV files are not offered as an iPhone-compatible file-video choice merely because the source advertises them.

YouTube IDs are read from the same original guide. Official oEmbed identifies the published clip. The normal embedded player is then opened from localhost, its actual Play video button is used, and the exact video ID, positive duration and advancing playback time are checked. The player is paused and removed immediately; no clip or extracted audio is saved. Current mobile embed controls differ from the older desktop `.ytp-large-play-button` markup, so accessible button names are used. A published exact YouTube watch URL is also retained as `videoFallbackUrl` for verified file clips where available.

The completed pass verified **275 supported original file clips** and observed playback on **475 distinct exact-source YouTube clips**. Their source-URL union covers all 550 original guides; the file and YouTube counts overlap and are not added as independent guide counts.

External availability can change. The evidence distinguishes original publication, browser playback and file-metadata checks instead of treating every advertised media URL as working.

## Pin evidence and provenance

Original start/end location UUIDs, names, creator, source dates, page hashes and exact photo/video identifiers are retained in `outputs/expanded-dma/accepted-evidence.json` and `source-page-audit.json`. Some source records also publish bounce points. Those are trajectory/bounce facts, not automatically a landing point or coordinates registered to Utility Lab's map SVG.

The public map/category pages also explicitly publish destination `end_position_id` x/y and separate origin `start_position_id` x/y. All **550** guide records resolve to both through their original UUIDs, with evidence in `publisher-position-evidence.json` and `map-original-clusters.json`. Browser network/DOM observation confirmed `/minimap/dust2.webp`, `/minimap/mirage.webp` and `/minimap/ancient.webp` at 2000×2000 pixels. These source frames have different padding/scaling from Utility Lab's artwork; their logical coordinates are not applied as an identity transform.

New rows initially have hidden pins. The central registration may place only a separately matched target callout area on the correct map. Neither a source standing position nor a guessed midpoint becomes the utility's destination pin.

Source photographs and clips remain credited to their publishers and creators. Direct online references and limited credited stills do not assert ownership, a general media redistribution license, Valve endorsement or independent validation of the throw on the current game build.

## Research receipts

`outputs/expanded-dma/` contains the source discovery/robots receipts, full structured-page audit, native-image and file-video results, exact YouTube playback results, per-record accepted evidence, explicit rejections and current aggregate `summary.json`. Source-frame reviews, when needed, retain their original clip, exact timestamp, resolution and manual selection rationale. This source research makes no game-file changes and runs no deployment.
