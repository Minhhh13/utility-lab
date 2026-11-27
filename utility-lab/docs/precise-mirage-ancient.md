# Precise Mirage and Ancient spawn references

Reviewed 24 November 2026 using original public publisher pages and prerecorded media only. No game, Steam, installation or gameplay was accessed.

The catalogue already contained all five Mirage T-spawn Window smokes and all five Ancient CT-spawn Elbow smokes. Numbered origins were collapsed into a generic spawn family, while selection capped recipes at four. These ten precision overrides keep the same source URLs and IDs and attach explicit source-specific family/slot metadata. They are improvements to existing recipes, not ten new landing targets.

Each override retains its own original position frame, full aim photograph, landing image and matching clip. A second, unchanged publisher zoomed aim photograph makes the precise wall/railing landmark easier to identify. All twenty full/detail aim photos were visually reviewed; original camera-center registration is retained. No marker is inferred from a different spawn's picture. Mirage captions now identify the crack, railing curl, carpet-pattern intersection, sandstone lip or balcony edge for that exact spawn.

| Family | Source slots | Input |
| --- | --- | --- |
| Mirage T → Window | 1, 2, 3, 4, 5 | Stationary W jumpthrow: hold LMB, then jump, tap W and release LMB |
| Ancient CT → Elbow | 1, 2, 3, 4, 5 | Walking jumpthrow: Shift + W, jump and release LMB; retain the source clip's walking timing |

Ancient's walking recipes must not be relabelled as stationary Tap W throws. A separate GO NADE Spawn 5 recipe explicitly discusses a half-step walk, but its numbering/timing is not silently substituted into CS2Tricks records. Publisher spawn numbering remains local to each family.

### Ancient Elbow standing and aim review, 27 November 2026

The north-up radar shows StellaraQwQ’s five CT starts from right to left. The three middle dots sit slightly higher than the outer pair. Each slot uses the starting coordinates matched from its own pre-throw camera view and the original aim images identified on its CS2Tricks page. [Recorded world positions and image matches](data/reviewed-world-origins.json)

| Creator slot | Radar point (0–1000) | Landmark at the crosshair | Original guide |
| --- | --- | --- | --- |
| 1 | 539.26, 91.41 | Mortar T-joint to the right of the U-shaped fitting | [CT 1](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-1-35af) |
| 2 | 526.76, 85.16 | Midpoint of the sloping top edge of a long roof capstone | [CT 2](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-2-9550) |
| 3 | 508.01, 85.16 | A sliver of sky above the capstone just left of the treetop | [CT 3](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-3-494a) |
| 4 | 489.26, 85.16 | Inside the upper-right corner of a large stone beneath the pale roof lip | [CT 4](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-4-8b27) |
| 5 | 476.76, 91.41 | Near the top of the opening between the two stone prongs | [CT 5](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-5-0e13) |

Rechecking the live publisher records confirmed the five guide IDs, start IDs, source images, walking input and jumpthrow. Each world position projected to the standing pin shown above using the published Ancient radar calibration. Each creator starting frame was also compared with all five Setpos reference views. The matching slot had 211–625 scene features consistent with a rotation from the same standing point. Every alternate slot had at most 73. For slot 1 the matching Setpos camera view comes from CT 1 Catwalk and establishes only the standing position. All five Elbow aim images and clips come from the Elbow creator. [Setpos Ancient radar](https://setpos.gg/ancient) · [CT 1 reference camera](https://setpos.gg/ancient/catwalk/ct1)

Both marked aim views are 1400 × 788. Matching each native close-up against its own wide image located its center within 1.81 wide-image pixels of the camera center. The measured magnifications span 3.72× to 3.80×. Each guide keeps the publisher’s centered crosshair and original walking clip. Independent gameplay accuracy remains unconfirmed. [Photo hashes and per-pair measurements](data/precise-mirage-ancient-evidence.json)

Original sources:

- Mirage Window: [1](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-1-d3bd), [2](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-2-e54c), [3](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-3-e1f4), [4](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-4-000c), [5](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-5-a08b).
- Ancient Elbow: [1](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-1-35af), [2](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-2-9550), [3](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-3-494a), [4](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-4-8b27), [5](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-5-0e13).
- Current corroboration: the publisher's [Ancient smokes article](https://www.cs2tricks.com/posts/ancient-cs2-smokes-mid-a-and-b-executes-and-ct-side-5db9) explicitly offers five CT spawn variants. [GO NADE](https://gonade.app/nade/ancient-mid-elbow-from-5-smoke) describes its walking variant, and [nades.ai's spawn index](https://nades.ai/guides/ancient/spawn-instas) lists current pro-derived five-spawn families.

Verification: source pages and all full/detail aim images returned HTTP 200. Four direct Ancient MP4s decoded and played at 1920×1080 in an isolated headless Edge browser. The six YouTube-primary records reached player state 1 with advancing playback time and no player error in a real iframe-API test, not just an HTTP availability check. All ten matching YouTube metadata requests returned 200. These observations establish delivery at the check time, not worldwide availability or independent in-game accuracy.

Machine evidence: `docs/data/precise-mirage-ancient-evidence.json`. Source/media audit scripts and detailed browser results remain in ignored `outputs/precise-dma/`. Integrate `PRECISE_MIRAGE_ANCIENT` before older source exports so source-key deduplication applies the overrides. No original catalogue entry or saved ID is removed.
