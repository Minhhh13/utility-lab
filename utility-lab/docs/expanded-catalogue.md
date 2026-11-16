# Expanded lineup catalogue

Generated **2026-11-10**. The app lazy-loads a local JSON catalogue for the selected map, normalizes its records, then runs `mergePhotoGuides(PHOTO_GUIDE_LIBRARY, expanded)`. Current generated files contribute **1,500 rows**; after the same merge, the complete catalogue contains **1,504 rows / 1,424 unique source pages**. Exact source-and-side matches preserve established lineup IDs.

Default browsing selects **1,258 guides** with at most four per target spot, floor, side and utility. Simpler throws and distinct standing areas come first; numbered spawn variants count as one origin family. The full **1,504-guide** catalogue remains available for saved guides and existing links. The matrix below reports that full researched inventory, not the smaller default selection.

All **1,504** published guides have source-backed throw-from map locations: **1,497** publisher start points and **7** registered named origin areas. **24** cross-floor throws retain the source floor independently of their landing floor; source-published alternate floor views remain available. These map pins lead to the Position photo for the exact standing reference. See [origin evidence and curation](lineup-origins.md).

| Map | Guides | T: Smoke / Flash / Fire / HE | CT: Smoke / Flash / Fire / HE |
| --- | ---: | --- | --- |
| Mirage | 234 | 107 / 24 / 25 / 9 | 25 / 24 / 8 / 12 |
| Dust II | 202 | 84 / 22 / 17 / 4 | 29 / 25 / 13 / 8 |
| Inferno | 206 | 65 / 19 / 31 / 6 | 36 / 20 / 20 / 9 |
| Nuke | 185 | 92 / 12 / 24 / 5 | 14 / 13 / 14 / 11 |
| Ancient | 165 | 63 / 12 / 24 / 2 | 32 / 16 / 13 / 3 |
| Anubis | 284 | 88 / 45 / 44 / 7 | 41 / 27 / 23 / 9 |
| Cache | 118 | 59 / 4 / 20 / 3 | 23 / 1 / 7 / 1 |
| Vertigo | 110 | 52 / 7 / 16 / 2 | 18 / 4 / 5 / 6 |

## Floor coverage

| Map | Floor | Guides | T: Smoke / Flash / Fire / HE | CT: Smoke / Flash / Fire / HE | Pins |
| --- | --- | ---: | --- | --- | ---: |
| Mirage | Overview | 234 | 107 / 24 / 25 / 9 | 25 / 24 / 8 / 12 | 234 |
| Dust II | Overview | 202 | 84 / 22 / 17 / 4 | 29 / 25 / 13 / 8 | 202 |
| Inferno | Overview | 206 | 65 / 19 / 31 / 6 | 36 / 20 / 20 / 9 | 206 |
| Nuke | Upper | 179 | 91 / 12 / 24 / 5 | 13 / 12 / 13 / 9 | 179 |
| Nuke | Lower | 6 | 1 / 0 / 0 / 0 | 1 / 1 / 1 / 2 | 6 |
| Ancient | Overview | 165 | 63 / 12 / 24 / 2 | 32 / 16 / 13 / 3 | 165 |
| Anubis | Overview | 284 | 88 / 45 / 44 / 7 | 41 / 27 / 23 / 9 | 284 |
| Cache | Overview | 118 | 59 / 4 / 20 / 3 | 23 / 1 / 7 / 1 | 118 |
| Vertigo | Upper | 105 | 52 / 7 / 16 / 2 | 13 / 4 / 5 / 6 | 105 |
| Vertigo | Lower | 5 | 0 / 0 / 0 / 0 | 5 / 0 / 0 / 0 | 5 |

A zero denotes a source gap for that floor, side and utility. The map-wide matrix and floor-specific coverage are reported separately.

## Media inventory

- Position + Aim + matching video: 1,504 of 1,504 published rows.
- Photo references: 4,870; unique image resources: 4,597 (4,279 remote, 318 local).
- Position references: 1,504 / 1,421 unique images; Aim references: 2,065 / 1,954 unique images.
- Native primary videos: 699 rows / 661 unique files.
- YouTube primary videos: 805 rows / 760 unique video IDs.
- All primary videos: 1,421 unique clips / 1,421 distinct configured start segments.
- Same-guide fallback links: 511 rows / 473 unique clips. Primary and fallback together reference 1,894 unique clips.
- Offline BUNDLED_GUIDE_PHOTOS: 420 listed files, 90,424,612 bytes; 420 exist.

Source-hosted HTTPS images and clips remain online resources. Only bundled local images belong to the offline photo pack. Some local images are exact stills extracted from the corresponding public video; their source and timestamp evidence are retained in the research manifests. Slide references, original image files and actual video resources have separate counts to avoid treating panels or repeated T/CT rows as new captures.

## Pin and compatibility inventory

1,504 published rows have registered callout-area pins (1,497 publisher-destination registrations and 7 named map anchors). Every published row has a registered pin.

The compatibility archive retains 488 older records, including the historical 265-guide photo list and 223 creator-video-only rows. Only records satisfying the current complete-media rule enter the main merge. Archive deep links remain available.

## Source evidence

[Dust II / Mirage / Ancient](expanded-dma-sources.md), [Inferno / Anubis / Cache](expanded-iac-sources.md), [Nuke / Vertigo](expanded-nv-sources.md), [additional Nuke CSNADES](expanded-nuke-csnades-sources.md), [Cache completions](expanded-cache-completions.md), [Cache landing review](expanded-cache-pin-review.md), and [independent publisher-map registration review](map-registration-publisher-independent-review.md).

Counts, per-map/floor matrices, generated-input hashes, source hosts, image references, video resources, pin registrations and exact offline byte sizes are in [current-catalogue-summary.json](data/current-catalogue-summary.json). The [local UI media audit](expanded-final-ui-media-audit.md) is a 16-guide functional sample, rather than a replay of every published clip. Map-update/gameplay validation and actual Steam-browser/iPhone/Xcode testing are outside that sample.

Regenerate with `node --experimental-strip-types scripts/report-catalogue.mjs`. The reporter uses no network, build or game access.
