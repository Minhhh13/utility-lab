# Photo guide coverage

Generated **2026-11-10** from local application data. Current main browsing contains **1,504 complete photo-and-video guide records**, representing **1,424 distinct original source pages**. Every published row has a separate Position reference, an Aim reference, recorded throw inputs and a matching source video. Counts are side-specific: a source explicitly marked for either team can appear on both sides.

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

All **64 of 64** map/side/utility combinations have published guides. Floor-specific counts are available in [expanded catalogue](expanded-catalogue.md) and the [machine-readable inventory](data/current-catalogue-summary.json).

The main viewer contains **4,870 photo references** to **4,597 unique image resources**: 4,547 references to 4,279 original remote images, plus 323 references to 318 bundled images. Reused source panels and T/CT rows count as references, not extra original captures.

Photos opens first in Utility Lab's own bounded viewer. Position precedes Aim; supplied throw/result images follow. People can swipe, choose labelled steps or zoom while the keys bar remains visible. The Video choice is enabled for all 1,504 current records: **699 native-file primary rows** and **805 YouTube primary rows**, with 511 exact-guide fallback links. Video is lazy-loaded after selection. Source websites are not embedded; original photo credits remain attached.

1,504 published rows have registered callout-area pins (1,497 publisher-destination registrations and 7 named map anchors). Every published row has a registered pin.

The offline photo pack lists **420 local images**, 90,424,612 bytes (86.24 MiB); every listed file exists. It includes archive images and source-video stills as well as current browsing references. Original remote HTTPS photos and videos require internet and stay on their publishers' servers; backups retain those links. Personal uploaded photos continue to export as bytes.

The compatibility archive remains **488 legacy records**: **265 historical photo-backed guides** and **223 older creator-video-only records**. The historical photo list had 17 matching video choices. These archive counts describe the earlier library, not the expanded main list. Existing deep links continue to resolve. Compendium panel views preserve the original images and floor annotations; they are not new captures.

Source and media provenance: [Dust II / Mirage / Ancient](expanded-dma-sources.md), [Inferno / Anubis / Cache](expanded-iac-sources.md), [Nuke / Vertigo](expanded-nv-sources.md), [additional Nuke CSNADES](expanded-nuke-csnades-sources.md), [Cache completions](expanded-cache-completions.md), [Cache landing review](expanded-cache-pin-review.md), and [independent publisher-map registration review](map-registration-publisher-independent-review.md). The [16-case independent local UI audit](expanded-final-ui-media-audit.md) checked actual photo decoding, visible keys and native/YouTube playback across every map and both sides. Public availability can change; these source audits do not substitute for executing a throw on a particular game build. Actual Steam-browser, iPhone and Xcode execution remain unverified. Research and this report use project data and online sources only, without accessing CS2 or its installation.

Regenerate: `node --experimental-strip-types scripts/report-catalogue.mjs`. This reads local data and files only; it does not fetch media, build, publish or run the game.
