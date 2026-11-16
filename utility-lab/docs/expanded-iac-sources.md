# Expanded Inferno, Anubis and Cache guides

Checked **10 November 2026 (Sydney)** using ordinary public online sources. No CS2, Steam, game installation, game process or gameplay access was used. This work stays local, with no push or deployment.

The export is `src/data/expanded-inferno-anubis-cache.ts`, named `EXPANDED_INFERNO_ANUBIS_CACHE`. It contains **537 distinct published throws / 568 app rows**. Sources explicitly marked Any Team produce separate T and CT rows with the same attribution; these are side variants, not additional unique throws.

| Map | Distinct source guides | App rows |
| --- | ---: | ---: |
| Inferno | 183 | 206 |
| Anubis | 278 | 282 |
| Cache | 76 | 80 |

## Source collection and photos

The ordinary public [CS2Tricks sitemap](https://www.cs2tricks.com/sitemap.xml) supplies the exact guide URLs. Each source page serializes its published guide metadata in React Flight: creator, target, standing callout, side, utility, movement, technique, image URLs and associated video IDs/URLs. Only that exact page's `initialData` is parsed; related-guide images are not substituted. Game-console metadata is excluded from the exported data.

**530 guides provide separate original Position and Aim images**, with an aim-detail crop and Result image. All **2,120** source-image references decoded successfully from an ordinary localhost page. Images stay as unchanged HTTPS references on the original CloudFront host, with per-photo creator and canonical guide credit. They are not downloaded into the offline pack or rehosted by this expansion.

Seven further Inferno guides have no published Position image. Their actual source clips provide usable pre-throw first-person position views. Those views were reviewed alongside adjacent setup/aim frames and captured as **1280 × 720 JPEGs at quality 90**, without adding arrows, circles or other markings. Six CT-spawn clips retain the publisher's original blue floor boxes; the First Orange clip shows the feet/platform reference. Each uses a three-photo sequence: captured Position → original source Aim → original source Result.

The seven selected JPEGs are in `outputs/expanded-iac/position-stills/`; `position-stills-manifest.json` records the original guide, creator, exact clip URL, actual source timestamp, native video dimensions, frame file and intended `/lineup-media/expanded-iac/` path. These are derived frames of the published online clips, not game captures or additional original photos. The final source set uses **2,134 original remote image references plus seven attributed source-video stills**.

## Video availability checks

The preferred video is the exact direct MP4 advertised by that same guide when its media checks pass; the guide's original YouTube clip is retained as fallback. No media filename is guessed and no clip bytes are added to the app bundle.

- **164 source guides** have verified native MP4 choices: 157 explicit-position guides plus all seven position-still guides. The direct files returned video content types and positive browser duration/dimensions. Other advertised native files with unsupported Matroska/QuickTime containers use the published YouTube clip instead.
- All **535 unique associated YouTube IDs** returned the expected ID with watch-page playability `OK` and `playableInEmbed: true`.
- All **371 unique YouTube-only clips** also played after an ordinary embedded **Play video** button click on localhost: the expected video ID, positive duration and advancing playback time were observed. Playback was muted, then immediately paused and removed. No failed clip was retained through this audit.
- Official YouTube oEmbed and ordinary embed responses were checked as publication evidence; HTTP 200 alone was not treated as proof of playback.

These checks establish observed online media availability at the recorded time. They do not independently establish current-game throw accuracy or guarantee future third-party availability.

## Inputs and presentation

The source's rendered input labels were checked for all seven technique enums. Left/right/both mouse buttons, jump and movement remain distinct. `jumpthrow_left_w` explicitly specifies **tap W**; it is not changed to a held W input. Explicit W instructions in source descriptions are retained for spawn variants. A few source descriptions distinguish crouching to align from standing to release; concise per-guide steps preserve that distinction.

The exported galleries start with Position, then Aim and optional detail/Result. Every row has concrete mouse inputs and a matching video choice. No practice target, invented floor marker or source-website iframe is added.

## Publisher coordinates

All **537** source throws resolve to both their exact destination UUID and origin UUID in the twelve public map/type category payloads. `publisher-position-evidence.json` keeps landing destinations separate from standing origins. `map-original-clusters.json` retains the original source coordinates and category links.

Actual source artwork is [Inferno](https://www.cs2tricks.com/minimap/inferno.webp), [Anubis](https://www.cs2tricks.com/minimap/anubis.webp) and [Cache](https://www.cs2tricks.com/minimap/cache.webp): each decoded at **2000 × 2000**. The public source DOM displays it on a **1000 × 1000 logical map**, with pin percentages derived from that logical coordinate range. Browser proof is in `publisher-map-art.json` and `publisher-map-logical-size.json`. These source coordinates must be registered against Utility Lab's different radar artwork before enabling pins; the data module itself leaves unregistered markers hidden.

## Evidence and limits

`outputs/expanded-iac/` contains the public sitemap inventory, source-record snapshot, source-input label evidence, image decodes, direct-file HEAD/browser metadata, exact YouTube metadata and actual-playback audits, source-frame manifests, publisher map evidence and repeatable research/generation scripts. `generated-manifest.json` records the final verified export counts.

This source provides no Cache CT/Any-Team Flash or HE guide, so those combinations need an additional genuinely matching provider. T-side records are not relabelled to fill that gap. This is a complete collection of this publisher's available snapshot for these three maps, not a claim to contain every possible throw on the internet. Source capture dates and game builds are not invented.
