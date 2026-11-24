# Precise Mirage and Ancient spawn references

Reviewed 24 November 2026 using original public publisher pages and prerecorded media only. No game, Steam, installation or gameplay was accessed.

The catalogue already contained all five Mirage T-spawn Window smokes and all five Ancient CT-spawn Elbow smokes. Numbered origins were collapsed into a generic spawn family, while selection capped recipes at four. These ten precision overrides keep the same source URLs and IDs and attach explicit source-specific family/slot metadata. They are improvements to existing recipes, not ten new landing targets.

Each override retains its own original position frame, full aim photograph, landing image and matching clip. A second, unchanged publisher zoomed aim photograph makes the precise wall/railing landmark easier to identify. All twenty full/detail aim photos were visually reviewed; original camera-center registration is retained. No marker is inferred from a different spawn's picture. Mirage captions now identify the crack, railing curl, carpet-pattern intersection, sandstone lip or balcony edge for that exact spawn.

| Family | Source slots | Input |
| --- | --- | --- |
| Mirage T → Window | 1, 2, 3, 4, 5 | Stationary W jumpthrow: hold LMB, then jump, tap W and release LMB |
| Ancient CT → Elbow | 1, 2, 3, 4, 5 | Walking jumpthrow: Shift + W, jump and release LMB; retain the source clip's walking timing |

Ancient's walking recipes must not be relabelled as stationary Tap W throws. A separate GO NADE Spawn 5 recipe explicitly discusses a half-step walk, but its numbering/timing is not silently substituted into CS2Tricks records. Publisher spawn numbering remains local to each family.

Original sources:

- Mirage Window: [1](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-1-d3bd), [2](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-2-e54c), [3](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-3-e1f4), [4](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-4-000c), [5](https://www.cs2tricks.com/nades/mirage/smokes/window-from-t-spawn-5-a08b).
- Ancient Elbow: [1](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-1-35af), [2](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-2-9550), [3](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-3-494a), [4](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-4-8b27), [5](https://www.cs2tricks.com/nades/ancient/smokes/elbow-from-ct-spawn-5-0e13).
- Current corroboration: the publisher's [Ancient smokes article](https://www.cs2tricks.com/posts/ancient-cs2-smokes-mid-a-and-b-executes-and-ct-side-5db9) explicitly offers five CT spawn variants. [GO NADE](https://gonade.app/nade/ancient-mid-elbow-from-5-smoke) describes its walking variant, and [nades.ai's spawn index](https://nades.ai/guides/ancient/spawn-instas) lists current pro-derived five-spawn families.

Verification: source pages and all full/detail aim images returned HTTP 200. Four direct Ancient MP4s decoded and played at 1920×1080 in an isolated headless Edge browser. The six YouTube-primary records reached player state 1 with advancing playback time and no player error in a real iframe-API test, not just an HTTP availability check. All ten matching YouTube metadata requests returned 200. These observations establish delivery at the check time, not worldwide availability or independent in-game accuracy.

Machine evidence: `docs/data/precise-mirage-ancient-evidence.json`. Source/media audit scripts and detailed browser results remain in ignored `outputs/precise-dma/`. Integrate `PRECISE_MIRAGE_ANCIENT` before older source exports so source-key deduplication applies the overrides. No original catalogue entry or saved ID is removed.
