# Local lineup media audit

Checked 2026-11-09T16:35:07.186Z against http://127.0.0.1:5192 in headless Microsoft Edge at 1440×900. The audit used only the local website and original public HTTPS media; it did not access Steam, CS2, a game installation or gameplay.

All **16 of 16** sampled published guides passed: one T and one CT guide on each of the eight maps, with four samples for every utility type.

- Photos opened first; all 16 Position and 16 Aim renders decoded from their expected image URL (5 bundled source stills and 27 original remote images).
- Exact throw-key labels, concrete mouse buttons and the keys bar stayed visible without scrolling on both photo stages.
- All 16 Video choices were enabled and loaded only after Load video.
- Nine native clips played with positive duration and advancing time. Seven original YouTube clips played through the normal in-app Play video control, with the expected video ID, positive duration and advancing time, without an ad or player error at the observation.
- Cache CT Boost HE opened the exact NartOutHere clip at 396 seconds and advanced to 396.408604 seconds.
- No page errors were recorded.

| Map | Side | Utility | Published guide | Actual player | Result |
| --- | --- | --- | --- | --- | --- |
| mirage | T | Smoke | Window smoke · T Spawn | Native MP4 | Pass |
| mirage | CT | Flash | Window flash · Jungle | YouTube | Pass |
| dust2 | T | HE | Mid Doors HE · XBox | Native MP4 | Pass |
| dust2 | CT | Molotov | Car molly · Long Barrels | Native MP4 | Pass |
| inferno | T | Flash | First Orange Flash from Banana-Sandbags | YouTube | Pass |
| inferno | CT | HE | Top Banana Grenade from CT | Native MP4 | Pass |
| nuke | T | Molotov | 2nd Vent molotov · T Roof | YouTube | Pass |
| nuke | CT | Smoke | Outside smoke · CT Box | Native MP4 | Pass |
| ancient | T | Smoke | Top Mid smoke · T Spawn | Native MP4 | Pass |
| ancient | CT | Flash | Mid flash · Elbow | YouTube | Pass |
| anubis | T | HE | Hole Grenade from Ruins | YouTube | Pass |
| anubis | CT | Molotov | Carpet Molotov from Plat | Native MP4 | Pass |
| cache | T | Flash | Mid Flash from Garage | Native MP4 | Pass |
| cache | CT | HE | Boost HE · White Box | YouTube | Pass |
| vertigo | T | Molotov | B Headshot molotov · Stairs | YouTube | Pass |
| vertigo | CT | Smoke | Deep Ramp smoke · Elevator | Native MP4 | Pass |

The Cache CT HE and Nuke T Molotov Aim screenshots were also visually reviewed: the full source image, photo navigation and mouse-key instructions fit inside the viewer. This is a targeted integration sample; it does not claim every library clip was replayed in this run, an iPhone/Steam browser was tested, or the throws were executed in the game.

Evidence: [JSON report](../outputs/expanded-final-ui-media-audit.json), [reproducible audit script](../outputs/expanded-final-ui-media-audit.mjs), and [16 Aim-stage screenshots](../outputs/expanded-final-ui-media-audit/). App source, production builds and full test suites were left to the parent integration pass.
