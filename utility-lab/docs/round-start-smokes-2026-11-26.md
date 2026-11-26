# Round-start smoke coverage, 26 November 2026

Utility Lab adds 54 numbered round-start recipes for existing landing areas. Each has a standing reference, a marked first-person aim, a landing view and the original recording. The table uses each publisher’s numbering. Moving throws retain their run-up and release cues.

| Map | New recipes | Existing targets and new source positions |
| --- | ---: | --- |
| Ancient | 8 | B Doors from CT 1–5. Jaguar from T 1, 4 and 5. [B Doors, CT 1](https://setpos.gg/ancient/b-doors/ct1) · [Jaguar, T 4](https://setpos.gg/ancient/cave/t4) |
| Anubis | 5 | Stairs from CT 2–5. Carpet from CT 3. [Stairs, CT 4](https://setpos.gg/anubis/stairs/ct4) · [Carpet, CT 3](https://setpos.gg/anubis/carpets/ct3) |
| Cache | 11 | Connector from T 1, 2, 4, 5, 7, 8, 9 and 10. Boost from T 2, 5 and 9. [Connector, T 8](https://setpos.gg/cache/connector/t8) · [Boost, T 5](https://setpos.gg/cache/boost/t5) |
| Dust II | 8 | Mid Doors from T 1. Long Corner from T 11–15. X Box from T 13 and 14. Kaide’s T 1 setup uses an SSG 08 at its second zoom on the satellite dish before switching to the smoke. [Mid Doors, T 1](https://setpos.gg/dust2/mid-doors/t1) · [Long Corner, T 12](https://setpos.gg/dust2/long-corner/t12) · [X Box, T 13](https://setpos.gg/dust2/xbox/t13) |
| Inferno | 3 | Banana from CT 2, 4 and 5. The first two use a walking jumpthrow. CT 5 starts crouched. [CT 2](https://setpos.gg/inferno/banana/ct2) · [CT 5](https://setpos.gg/inferno/banana/ct5) |
| Mirage | 7 | Top Mid from T 1, 4, 6, 8, 9 and 10. Deep Top Mid from CT 5. T 9 uses both mouse buttons. [Top Mid, T 9](https://setpos.gg/mirage/catwalk/t9) · [Deep Top Mid, CT 5](https://setpos.gg/mirage/top-mid/ct5) |
| Nuke | 7 | T Red from T 1, 4 and 7. Outside Main from T 5–8. Each Outside Main throw has its own timed approach and release reference. [T Red, T 7](https://setpos.gg/nuke/t-red/t7) · [Outside Main, T 6](https://setpos.gg/nuke/outside-main/t6) |
| Vertigo | 5 | Lower A Ramp from upper CT 1–5. Viri’s post-update video marks a different ceiling reference for each spawn, then shows the run through the doorway and the release before the final ceiling tile. [First chapter](https://www.youtube.com/watch?v=HGhSBNdWJEs&t=3) · [Fifth chapter](https://www.youtube.com/watch?v=HGhSBNdWJEs&t=118) |

## What was checked

The 49 setpos.gg recipes use the player’s original replay, mouse-release events and spawn coordinates. Every source page was opened, its images decoded and its replay sought to the published aim and landing. For Dust II T 1, the replay’s marked aim chapter supplies the missing scoped still. The other 48 use the publisher’s original unmarked and marked aim renders. A release image accompanies each of the 19 throws with a separate movement cue. [Replay metadata and media checks](data/instant-spawn-smokes-evidence.json)

Destination naming was compared with Utility Lab’s existing landing photos. Mirage’s setpos.gg “Catwalk” family lands beside the blue wall at the Top Mid boxes. The CT “Top Mid” recipe closes the other side of that corner, at the existing Deep Top Mid target. Ancient’s “Cave” series lands at the Jaguar tent opening. [Mirage Top Mid reference](https://www.cs2tricks.com/nades/mirage/smokes/top-mid-from-t-spawn-f429) · [Mirage Deep Top Mid reference](https://www.cs2tricks.com/nades/mirage/smokes/deep-top-mid-from-ct-spawn-18c6) · [Ancient Jaguar reference](https://www.cs2tricks.com/nades/ancient/smokes/jaguar-from-backtspawn-8c8f)

Vertigo’s creator supplies world positions and starting angles for all five variants. The published upper radar matches the bundled image byte-for-byte. The source coordinates agree with the independent spawn list within 1.31 world units in XY. Viri labels the row in the opposite direction to NadesDB. Each of the original video’s five timed chapters was reviewed for the standing view, aim, run-up and smoke covering the lower A Ramp doorway under the truss. The same doorway is visible in the existing map guide. [Viri’s post](https://www.reddit.com/r/GlobalOffensive/comments/1d0ief5/with_iem_dallas_using_the_new_vertigo_here_are/) · [Independent positions](https://nadesdb.com/vertigo/spawns/) · [Existing A Ramp landing](https://csnades.gg/vertigo/smokes/a-ramp-from-a-conn) · [Per-spawn checks](data/instant-vertigo-evidence.json)

## Coverage limits

- The five published Mirage Window positions in the replay catalogue already correspond to the five physical positions in Utility Lab. Ancient Elbow already has all five positions. Both families keep their original numbering. [Mirage spawn coordinates](https://setpos.gg/mirage/spawns) · [Original pose checks](data/reviewed-world-origins.json)
- Anubis’s existing 23 T-spawn guides cover 11 source slots across three variants. Coverage is tracked separately for each destination. The reviewed replay catalogue added no further T variants to those families. [Anubis replay index](https://setpos.gg/anubis) · [Existing Anubis evidence](precise-anubis.md)
- The available footage for Dust II T 11 Mid Doors and CT 4–5 Long Doors, Cache’s CT Garage set, and Nuke T 3 Vent includes a reposition before release. The source describes the movement without publishing all the direction inputs. These remain outside this batch. [Dust II T 11](https://setpos.gg/dust2/mid-doors/t11) · [Cache Garage](https://setpos.gg/cache/garage) · [Nuke T 3 Vent](https://setpos.gg/nuke/vent/t3)
- This review checked source geometry, media and in-app interactions. Independent reproduction on a running CS2 game is still unverified.
