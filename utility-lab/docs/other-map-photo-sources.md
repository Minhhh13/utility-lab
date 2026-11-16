# Inferno and Anubis source-hosted photo guides

> **10 November 2026 update:** Photos now appear directly in Utility Lab's own swipeable viewer, not inside source websites. The active photo catalogue has 48 bundled guides (102 images) and 217 native online galleries (642 GO NADE plus 24 other image references). See the [native GO NADE audit](native-gonade-photo-sources.md) and [other native-photo audit](native-other-photo-sources.md). Full-page/iframe descriptions below document the previous implementation and its research evidence.

Checked **9 November 2026** using public GO NADE pages, without game access. The audit identified **95 photo-guide records**: 45 for [Inferno](https://gonade.app/map/inferno) and 50 for [Anubis](https://gonade.app/map/anubis). Each had at least two lineup photos and a result photo. Both maps included smoke, flash, molotov/incendiary and HE guides for T and CT.

| Map | Smoke | Flash | Fire | HE | T | CT | Guides |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Inferno | 19 | 13 | 6 | 7 | 21 | 24 | 45 |
| Anubis | 22 | 11 | 11 | 6 | 28 | 22 | 50 |

The previous Utility Lab wrapper displayed complete public source pages, including their branding, controls and notes, without individual image references. The native viewer now displays direct original photos with source credit and the canonical guide link. Source photo/video files are not bundled, rehosted or licensed by this app; these online references require internet. A source-declared MP4 URL alone is not proof of playable video; see the separate [verified-video audit](native-gonade-video-sources.md).

## Verification

The research found 96 pages with two or more lineup photos. A fresh headless browser page opened each original page in a sandboxed local frame, waited for its exact canonical URL, and decoded every lineup/result photo. Concurrency was limited to two. Video requests were blocked during this check, and no sign-in was attempted. **All 96 frames passed, with 302 decoded photos and no page errors.** The accepted 95 records reference **299 photos**.

Research evidence is in `outputs/other-photo-research/metadata-audit.json` and `frame-audit.json`. Four representative original-frame screenshots are in that directory. The public-page parser and browser audit scripts are saved alongside them. `OTHER_PHOTO_EVIDENCE` records the accepted guide counts, input labels and photo roles in source.

## Instruction fidelity and exclusion

Twenty source notes were checked for actionable prerequisites. Instructions retain the wood-window aim adjustment, second-step release, wire-clip aim, antenna aim and wall marks where supplied. Twenty-nine guides identify their final lineup image as a **release-position** reference; those are not labelled as simple aim photos. All nine source-labelled **Middle click** inputs stay unexpanded; no LMB/RMB combination is invented.

The [Anubis A Plat smoke from Outside A Main](https://gonade.app/nade/anubis-a-plat-from-outside-a-main-smoke) is excluded: its publisher explicitly questions its usefulness after the January 2026 map update. Six Inferno pages with fewer than two lineup photos were not included in this set. Source-photo availability does not establish current-build throw accuracy; no live game test was performed. Map pins are resolved separately through the existing callout registration.
