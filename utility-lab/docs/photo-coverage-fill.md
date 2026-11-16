# Targeted photo coverage additions

> **10 November 2026 update:** Photos now appear directly in Utility Lab's own swipeable viewer, not inside source websites. The active photo catalogue has 48 bundled guides (102 images) and 217 native online galleries (642 GO NADE plus 24 other image references). See the [native GO NADE audit](native-gonade-photo-sources.md) and [other native-photo audit](native-other-photo-sources.md). Full-page/iframe descriptions below document the previous implementation and its research evidence.

Checked **9 November 2026** using public online sources only. These 17 reference records fill ten previously missing combinations of map, side and utility. No source photo/video files are copied into the application, and no game installation or running game was accessed.

| Map | Side | Utility | Added photo guides |
| --- | --- | --- | ---: |
| Dust II | T | HE | 1 |
| Dust II | CT | Fire | 2 |
| Dust II | CT | HE | 2 |
| Ancient | T | HE | 2 |
| Ancient | CT | Flash | 2 |
| Ancient | CT | HE | 1 |
| Cache | T | Flash | 2 |
| Cache | T | HE | 1 |
| Cache | CT | Flash | 2 |
| Cache | CT | HE | 2 |

## GO NADE: 16 original pages

The public [Dust II](https://gonade.app/map/dust2), [Ancient](https://gonade.app/map/ancient) and [Cache](https://gonade.app/map/cache) map pages advertise the anonymous index used by their own frontend. Only the missing type/side pairs were selected, favoring two distinct destinations where available. Each selected page has two lineup photos and one result photo.

All **16 canonical source frames and 48 original images** passed headless browser checks. The checks waited for each exact canonical document, decoded the photos and blocked video requests. Source inputs and release-photo roles were read from the original page. Dust II’s source-labelled Middle click remains unexpanded. The Cache A Main flash includes the source’s teammate callout.

## Cache T HE: scully / Lineups.pro

GO NADE’s public Cache index has four HE guides, all explicitly CT. None was relabelled as T. The missing T reference comes from [Highway Nade from Firetruck](https://lineups.pro/cache/5erxnx), a public gallery by **scully**, added and updated **5 July 2026**.

The dedicated original page shows **Find Spot, Exact Spot, Aim, Release and three Result photographs**. It labels the throw as T-side HE, Run Jumpthrow, using W + JUMP + M1. All seven gallery tabs were exercised in a sandboxed localhost frame without signing in: six full images decoded at 1920×1440, and the author's aim crop at 915×686. The login dialog stayed hidden; it is for optional account actions. No page errors occurred.

The previous implementation displayed the complete original page, including its branding, author and media, without individual image references. Its [terms](https://lineups.pro/legal#terms) retain contributor ownership and do not grant this app an asset republication license. The native viewer now references the original photos directly with source credit; it does not bundle, rehost or make offline copies of those files. Neither the earlier frame check nor the current direct-image check is a license grant.

Research: `outputs/photo-coverage-fill/index-summary.json`, `metadata-audit.json`, `frame-audit.json`, and `cache-t-he-frame.json`. Representative screenshots are in that directory. `FILL_PHOTO_EVIDENCE` records the accepted counts and source facts. These references establish photo availability, not independent current-build throw validation; the central library handles map pins separately.
