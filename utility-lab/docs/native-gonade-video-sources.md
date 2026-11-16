# Same-guide GO NADE video choices

Checked **10 November 2026** with public online sources only. `src/data/gonade-guide-videos.ts` exports `GONADE_GUIDE_VIDEOS`: **10 source-hosted MP4 choices** tied to the same guide IDs as the native photo galleries. The clips are not copied into the application or offline storage, and the native player does not autoplay.

The prior source audits covered 45 Nuke, 41 Vertigo and 12 Mirage guides. Five Nuke MP4s already passed `video/mp4` response and positive-duration browser metadata checks. This pass checked the remaining **111** guides: 95 Inferno/Anubis records and 16 selected Dust II/Ancient/Cache records. It reused the exact advertised source video paths from original public page metadata; the 16 fill pages were read normally to extract their actual `<video src>` values. Paths were not invented from image IDs.

Ordinary HEAD requests were limited to concurrency two. **106 of the 111 remaining endpoints returned an HTML fallback** rather than a video, even though they reported HTTP 200. They were rejected. The five genuine `video/mp4` candidates then loaded real browser metadata with finite positive duration and nonzero dimensions, using `preload="metadata"` from a localhost page without autoplay. The temporary browser and metadata server were closed after checking.

## Newly accepted clips

| Map | Guide | Original source clip |
| --- | --- | --- |
| Anubis | T Stairs HE from A Plat | `https://gonade.app/videos/1008.mp4` |
| Anubis | Mid Doors/Window molotov from Ruins | `https://gonade.app/videos/1014.mp4` |
| Anubis | Mid Doors/Window smoke from T Spawn | `https://gonade.app/videos/1041.mp4` |
| Inferno | Top Mid smoke from T Spawn | `https://gonade.app/videos/7048.mp4` |
| Ancient | Lane HE from B Short | `https://gonade.app/videos/2046.mp4` |

These complement Nuke's existing A Site T-spawn flash, Vent Drop smoke, Top Hut molotov, Mustang molotov and Secret molotov. Vertigo and the selected Mirage photo records still have no accepted same-guide source MP4; a real photo guide is not given a fake video option just because its source HTML contains a player element. Existing separately attributed creator video records remain separate throws.

Every exported clip's numeric source ID matches its own native gallery's image directory. Original guide links and source credit remain attached to the photos. These are technical media-availability checks, not a current-game throw test or an affirmative media-republication license.

Evidence:

- `outputs/native-gonade-photos/remaining-video-heads.json`
- `outputs/native-gonade-photos/remaining-video-metadata.json`
- `outputs/native-gonade-photos/video-summary.json`
- `outputs/nuke-online-research/video-metadata-results.json` (five existing Nuke choices)
- `tests/native-gonade-videos.test.ts`

The reproducible local audit is `outputs/audit-gonade-native-videos.mjs`. No Steam client, CS2 installation, game process or game files were accessed.
