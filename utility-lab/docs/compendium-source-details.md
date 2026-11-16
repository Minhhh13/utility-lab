# Bundled source panels and matching-video audit

Checked 10 November 2026 (Sydney). This review used original public GitHub sources and existing project media only. No CS2, Steam, game installation or gameplay access was used. No app build, deployment or push was performed.

## Compendium: eight Mirage guides

Original author: **spnk / CS2 Compendium**, [pinned Mirage source page](https://github.com/1234/cs2-compendium/blob/deaae65ebae1a9a48240ea215d3d72d5e1c7a712/training/utility/mirage/README.md), CC BY-SA 4.0. Both source images were visually inspected. Fresh public HTTP responses were `200 image/webp`; their bytes exactly match the bundled originals. Both are **1280 × 800**.

| Original composite | Bytes | SHA-256 |
| --- | ---: | --- |
| `mirage-t-palace-alley-a-smokes.webp` | 151,710 | `90e88198457b55fcf4fdc5742d83edc722b93c9740ff96d271e55b90939b114d` |
| `t-spawn-insta-window-smokes.webp` | 154,870 | `34e0687ade9004520eb180675ed6540d7184d2284f7731109fcfcb2bc6f11bf8` |

`src/data/compendium-photo-regions.ts` supplies three bounded viewport regions per guide. Coordinates below are native source pixels (`x, y, width, height`). These are views of existing composite panels, not separate photo captures. The image files remain unchanged; retain the original per-photo source/creator/license and the complete original as an Overview if the viewer permits four slides.

Palace Alley starts with one shared Position region **10, 70, 429, 507**, preserving the source's third-person standing reference above its first-person position reference. The original does **not** contain a floor circle or position arrow in these views. Do not draw an invented exact marker.

| Guide ID suffix | Aim region | Landing region |
| --- | --- | --- |
| `palace-jungle` | 451, 69, 469, 235 | 930, 69, 340, 235 |
| `palace-stairs` | 451, 314, 469, 234 | 930, 314, 340, 234 |
| `palace-ct` | 451, 555, 469, 235 | 930, 555, 340, 235 |

Full IDs start `compendium-mirage-`. Each Palace sequence is Position → the matching colored Aim row → that row's Landing. The source specifies `Space + left click` jump throws. No release-frame photograph is supplied.

Window guides start with the shared first-person, downward-looking Position region **10, 69, 420, 505**. Its numbered colored spawn boxes are genuine source annotations; preserve the entire panel so the selected number retains its spatial context. The source says to use the corresponding exact spawn, with no repositioning.

| Guide ID suffix | Matching aim region |
| --- | --- |
| `window-spawn-1` | 441, 69, 410, 235 |
| `window-spawn-2` | 859, 69, 411, 235 |
| `window-spawn-3` | 441, 314, 410, 234 |
| `window-spawn-4` | 859, 314, 411, 234 |
| `window-spawn-5` | 441, 555, 410, 235 |

Their third region is the original Technique panel **860, 557, 410, 233**, labeled Context. It shows `Shift + W + Jump + Left-click` and release at the jump's peak. This is text/keys evidence, not a release-frame photograph. There is no separate Window landing image. Do not manufacture one.

## Matching videos: no verified association for these 48 bundled records

The pinned and current default-branch trees were checked for both upstream projects. Both current tree SHAs equal the project's pinned source revisions.

- **Compendium (8 records):** no video media files in the repository; no video URL in the Mirage or utility README. The top-level README's HaiX channel credit concerns training and does not identify a matching lineup video. No same-guide clip was verified, so leave Video unset.
- **_Kielson (40 project records / 36 distinct source throws):** [original project](https://github.com/Kielson123/CS2Lineups/tree/05972d55ec70194ffe6a4a8b677cdd0322fbda8c) publishes photo arrays and throw inputs. Its README, both page templates, both JS renderers and the three map JSON files expose no video URL or player. All 54 entries in the complete upstream Ancient, Dust II and Cache JSON datasets have no video field. No video files occur in the source tree. No same-guide video was verified for the selected 40 records.

These are bounded source findings, not a claim that the creators have never published a video elsewhere. A similar target or map name is insufficient to match a clip to an exact position, aim and throw.

## Evidence

- `outputs/compendium-source-details/source-audit.json`: URLs, HTTP status, current and pinned tree SHAs, video-field scans, dimensions and unchanged-byte checks.
- `outputs/compendium-source-details/region-validation.json`: all 8 IDs / 24 regions fit 1280 × 800; all start Position → Aim; each has at most 3 regions.
- The same directory contains the public source text/tree snapshots and `research.mjs` for a bounded repeat audit. Original source images were compared in memory; no replacement or new game captures were created.

The native viewer can present these original panels now. A Photos/Video control should only offer Video when a real, correctly associated source clip is available.
