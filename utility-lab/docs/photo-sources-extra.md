# Additional public photo-source audit

Reviewed **9 November 2026** for genuine CS2 standing-position, aim and result images. This audit uses public web/repository material only. The accepted sources are author photo releases with a usable media license; a software license or public video URL alone does not establish image-reuse permission.

## Result

An additional **Mirage** source was confirmed: [1234/cs2-compendium's Mirage guide images](https://github.com/1234/cs2-compendium/tree/deaae65ebae1a9a48240ea215d3d72d5e1c7a712/training/utility/mirage), explicitly released under **CC BY-SA 4.0**. Its two original composite images show standing/spawn, aim and landing panels for five Window variants and three Palace Alley A-execute smokes. The guide text provides throw inputs, and attribution is watermarked into the artwork. Import is handled with the other photo catalogue work; retain the original attribution/license and identify any adaptations. The inspected tree has no equivalent photo guides for the other four target maps. [License statement](https://github.com/1234/cs2-compendium/blob/deaae65ebae1a9a48240ea215d3d72d5e1c7a712/training/utility/mirage/README.md)

No additional **distribution-ready** standing/aim photo source was established for **Inferno, Nuke, Anubis or Vertigo** in the sources below. This is an audit finding, not a claim that no such source exists. These remain real coverage gaps rather than being filled with result-only stills, thumbnails, unrelated screenshots or reconstructed aim scenery.

[The separately reviewed Kielson123/CS2Lineups source](https://github.com/Kielson123/CS2Lineups/tree/05972d55ec70194ffe6a4a8b677cdd0322fbda8c) covers Cache, Ancient and Dust II with original WebP sequences under MIT. Its import was not duplicated in this audit.

## Substantial candidates and exclusions

| Primary source | Actual content inspected | Decision |
| --- | --- | --- |
| [jesb92/esbosmokes](https://github.com/jesb92/esbosmokes/tree/be0b1873a65cff63ba25c30f3bebe6e3fb127e74) | Root MIT notice names Alberto Iglesias Silva (2026). `data/nades.json` has 67 records and bundled MP4/result images for seven maps. Actual Mirage, Anubis and Nuke clips visibly carry **CSNADES.gg** branding. Some record IDs, descriptions and instructions are mismatched or copied placeholders. | **Rejected for media import.** The repository license does not establish permission to sublicense third-party clips. A separate Inferno sample without that watermark also lacks clear independent ownership evidence. No Esbo-derived files were put in the app's public library. |
| [LeeYanyu-1234/CS2-Playbook](https://github.com/LeeYanyu-1234/CS2-Playbook/tree/b001ed83acc89395c5341d6246164ba81b71efbf) | Six [Inferno guides](https://github.com/LeeYanyu-1234/CS2-Playbook/blob/b001ed83acc89395c5341d6246164ba81b71efbf/Map_Parsing/Inferno/CS2_Playbook_Inferno.md) reference 11 genuine CS2 screenshots and describe LMB, jumping, crouching, walking or both buttons. The first standing/aim pair was visually checked. Root MIT notice exists, but the README says most content was collected from the internet; per-image ownership is not established. | **Conditional lead, not imported.** Useful source paths and explicit inputs exist, but media provenance needs clarification before treating the screenshots as an author-licensed release. Other target-map folders contain logos/placeholders rather than equivalent guide sequences. |
| [nc3021/cs-prop-spots](https://github.com/nc3021/cs-prop-spots/tree/fb393ff8d4ad6ef4469da7414507b54307e486a1) | Example data includes 52 utility records and references 63 aim screenshots, with separate buttons/jump/movement fields. | **Excluded by explicit media terms.** The [README disclaimer](https://github.com/nc3021/cs-prop-spots/blob/fb393ff8d4ad6ef4469da7414507b54307e486a1/README.en.md#disclaimer) limits MIT to code and says the game screenshots are personal reference and not relicensed. |
| [DavidPurvis/cs2-utility-playbook](https://github.com/DavidPurvis/cs2-utility-playbook/tree/e195d158db7d81b21bfe09e9a3cb5898f63d5a1c) | Ten Dust II directories contain position/aim/result WebPs. A root MIT file exists, but its [README license section](https://github.com/DavidPurvis/cs2-utility-playbook/blob/e195d158db7d81b21bfe09e9a3cb5898f63d5a1c/README.md#license) says “No license granted; do not redistribute.” | **Excluded pending clarification.** Conflicting public license statements; also outside the four remaining map gaps. |
| [bubfusion/Tactical-Toss-Tutor](https://github.com/bubfusion/Tactical-Toss-Tutor) and [Sulivan7/duck-utility](https://github.com/Sulivan7/duck-utility) | A 55-smoke catalogue links to external Imgur media, including Vertigo, Nuke, Anubis, Mirage and Inferno. The original README says MIT, but no LICENSE file or explicit external-media ownership/license was found in its tree. The rewrite credits the original data. | **Not import-ready.** A license on a bot/link catalogue does not automatically license linked third-party GIFs. Imgur pages could not be inspected through the browsing tool; no access block was bypassed. |
| [44stv/utilMate](https://github.com/44stv/utilMate/tree/0e5fe12b2301c3d7d9d9eb7859edfea648fc2162) | Two complete Mirage stand/aim/result JPEG triplets exist; several other JSON image paths have no matching file. | **Outside the requested MIT/CC source set.** Repository license is GPL-3.0, and no separate permissive photo release was established. |
| [shimupan/lineupx](https://github.com/shimupan/lineupx/tree/f3137cd58dd8fdd845f9ff6f1b0cb3f1678822b5) | A community website implements three-photo user posts with externally hosted uploads. The repository supplies branding, map images and UI screenshots, not a bundled public photo-guide dataset. | **Not a licensed dataset.** MIT source code does not establish redistribution rights to hosted user photos. No hosted library was scraped. |

## Other repositories checked

- [Ovi-Wan/CS2-Helper](https://github.com/Ovi-Wan/CS2-Helper): YouTube links and map art, not standing/aim image files.
- [PrimsparK/Utility-Master](https://github.com/PrimsparK/Utility-Master): maps/icons and a user-content tool; no ready guide-photo set.
- [spreedated/vectorline](https://github.com/spreedated/vectorline): one Cache video, no photos for the remaining maps.
- [ArdaAKP1NAR/lineUps](https://github.com/ArdaAKP1NAR/lineUps): upload/admin software and three test clips, without an identified map-guide catalogue.
- [zhuty2001/Cs2Utility](https://github.com/zhuty2001/Cs2Utility): two Dust II screenshots; remaining target-map data files are empty.
- [wwwaywood1/cs2-pro-playbook](https://github.com/wwwaywood1/cs2-pro-playbook): expects owner-supplied map screenshots; those are not a bundled standing/aim library.
- [kox1906/instant-smokes-cs2](https://github.com/kox1906/instant-smokes-cs2): spawn maps and application screenshots rather than actual per-lineup aim sequences.
- [Darknetzz/cs2-config-generator](https://github.com/Darknetzz/cs2-config-generator): configuration/crosshair examples, not a utility photo catalogue.
- [AdieuJ777/cs2-assistant](https://github.com/AdieuJ777/cs2-assistant): radar-analysis examples, not lineup instructions/photos.
- [athirazizi/tactical-throws](https://github.com/athirazizi/tactical-throws): legacy CS:GO material, not a current CS2 photo source.

No executable from these repositories was downloaded or run.

## Public website media terms

[CS2.APP's terms](https://cs2.app/terms-and-conditions) cover photographs and video as protected content and provide a limited personal/noncommercial or internal-use license. They do not provide an open redistribution license for a competing guide library; broader public use requires permission. Its [About page](https://cs2.app/about-us) identifies NartOutHere as the creator. Public source links or permitted remote players remain distinct from copying its images into this app.

[CSNADES.gg](https://csnades.gg/) and its linked [privacy policy](https://csnades.gg/privacy) did not expose affirmative media-reuse permission in the inspected pages. Its reachable image/video files and permissive cross-origin responses are not a license. The watermark found in the Esbo samples establishes a third-party provenance issue, not evidence of permission to relicense those clips.

The public robots files for both sites returned HTTP 200 through ordinary unauthenticated requests. CS2.APP allows normal pages and excludes `/api/`, account/admin paths and some redirect paths. No excluded API, login, CAPTCHA, session cookie, proxy or private endpoint was used. The browsing tool could not retrieve some pages; ordinary public HTTP requests fetched the pages with status 200, without bypassing a server denial.

The creator-video research found no affirmative CC license evidence for eight inspected primary YouTube candidates. A CC credit for background music would not license the video footage. Keep standard or unknown-license videos remote; do not turn thumbnails into aim-reference photos.

## Evidence retained locally

Ignored audit files are under `utility-lab/outputs/photo-sources-extra/`: four small result-image samples, four bounded public source clips, their decoded audit frames and `sample-frame-metadata.json` with source-file hashes and exact sampled timestamps. They are research evidence only and were not imported into public application assets. Three sampled clips visibly show the CSNADES.gg watermark. The inspected source clips do not supply independent current-build throw verification.

The next importable source must identify the actual photo/clip author, include a license that covers the media, provide real standing/aim steps for the same throw, and preserve attribution. When those conditions are missing, retain a source link and an honest photo-coverage gap.
