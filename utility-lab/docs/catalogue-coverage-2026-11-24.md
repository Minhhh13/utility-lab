# Origin coverage review — 24 November 2026

The update adds more **throw-from choices for existing named destinations** and exposes alternatives previously hidden by the four-origin limit. The primary library now contains **1,557 side-specific records from 1,477 source pages**, up from 1,504 records and 1,424 pages. The precision exports review 69 references: **53 new source recipes and 16 improvements to existing IDs**. Existing saved IDs and original source coordinates are retained.

| Map | Previous records | Current records | New recipes | Precision improvements |
| --- | ---: | ---: | ---: | ---: |
| Mirage | 234 | 234 | 0 | 5 |
| Dust II | 202 | 209 | 7 | 0 |
| Inferno | 206 | 212 | 6 | 0 |
| Nuke | 185 | 189 | 4 | 0 |
| Ancient | 165 | 165 | 0 | 5 |
| Anubis | 284 | 310 | 26 | 1 |
| Cache | 118 | 128 | 10 | 0 |
| Vertigo | 110 | 110 | 0 | 5 |

Full before/current side-type counts, typed destination groups, record IDs and sources are in [the coverage JSON](data/coverage-2026-11-24.json). All 1,557 records have Position/Aim metadata and a parseable video URL; that is structural completeness, not proof that every historic video still plays or every throw works in the current game. New media playback and photo checks are recorded separately in the source evidence. Cache CT Flash/HE and Vertigo CT Flash/Molly remain relatively sparse and are explicit priorities for later verified origin research.

After selecting an exact destination, every source recipe stays available. Nearby standing points share a real anchor and open a visual map chooser, with pagination when needed. Standing points are not invented or displaced for tap spacing. Source-confirmed spawn families share only an exact normalized target name, map, floor, side, utility, area and coverage qualifier; provider impact variation does not create redundant landing choices. Other point-specific guides, close/far variants, different target names and personal guides remain separate.

## Dust II Mid Doors

The baseline Smoke catalogue had 16 exact `Mid Doors` records across both sides: 14 T and two CT. Four new T origins bring that destination to **18 T recipes plus two CT recipes**. The existing choices include T Spawn #2–5, T Spawn/T-Spawn, Suicide, Outside Long, Lower Tunnels, Xbox, A Plat, Top Mid and Long Barrels. Removing the old display cap exposes them alongside the new sources, rather than adding more indistinguishable destination pins.

The original [setpos.gg Mid Doors family](https://setpos.gg/dust2/mid-doors) offers six source-specific origins. Only the four with complete reviewed aim and input evidence were imported: **T 3, 12, 14 and 15**. These numbers belong to the publisher's sheet, not CS2Tricks. T 3/14 are stationary jumpthrows; T 12/15 use W jumpthrows. T 1 has no supplied aim image, while T 11 moves to a second position without complete direction-key data, so they were withheld. Three additional CT Long Doors recipes preserve the A → A+S → jumpthrow sequence. [Detailed review](precise-other-maps.md).

## Other spawn families

- Mirage's five existing T-spawn Window recipes and Ancient's five existing CT-spawn Elbow recipes gain precise source-specific captions and an original zoomed aim photograph. Mirage uses Tap W + Jump + LMB; Ancient retains Shift + W walking timing. Three legacy Ancient Lower Mid result photos were additionally reviewed as the same Elbow corridor and remain alternative origins in that named destination. [Precision review](precise-mirage-ancient.md).
- [Inferno](https://setpos.gg/inferno) adds six CT Shallow Mid recipes. Source slots 1–2 use jumpthrows and 3–6 add W. This is a different source numbering convention from [CSNADES' six-slot sheet](https://astro.csnades.gg/guides/inferno-ct-instant-bottom-mid-smokes); matching the integer alone never replaces another creator's inputs.
- [Nuke](https://setpos.gg/nuke) adds four T-spawn Vent recipes, slots 5–8. Each keeps its continuous W run-up, release reference and original clip. Slots 1–4 lack full reviewed representation and are not fabricated.
- [Cache](https://setpos.gg/cache) adds ten T-spawn B Main recipes. The four existing [CT Garage](https://astro.csnades.gg/guides/cache-ct-instant-garage-smokes) variants also remain accessible. Their source says the fifth CT spawn is dynamic; no fifth exact Garage throw is invented.
- Vertigo gains five improved existing CT Spawn/EBox/Elevator/Generator references. EBox from Stairs now distinguishes a crouched aiming setup from a standing release; it does not invent an instant family for this map.
- Anubis adds 23 T-spawn smokes collectively covering all 11 source slots, two Window mollies and a running Camera origin, plus one existing Camera precision improvement. Conn Inside, Conn Outside and the older generic coverage remain distinct within the existing B Connector area. Window mollies preserve running jumpthrows; the two Camera-family throws preserve their stationary-LMB and running-LMB differences. [Anubis review](precise-anubis.md).

The new source records retain their matching original Position/Aim/Release/Landing media and clips. Original first-person start frames are labelled as starting views rather than third-person foot-placement photos. Publisher overlays, source commands and original clip timing remain precision evidence; none of this work independently tests the throw in CS2. Some source combinations remain unavailable: not every Anubis target has a recipe from every spawn, and the historical GO NADE Camera1017 video redirects to its homepage, so its proposed override was withheld in favor of source-complete alternatives.

## Media and speed

Same-origin app assets already use a service worker cache, and map catalogues load lazily one map at a time. The major remote providers lack CORS read headers in the sampled image responses. Their regular image elements still work; browser HTTP caching remains useful, particularly the CloudFront image's one-year immutable response. The implemented follow-up uses a small browser-only viewed-photo cache, successful image-decode confirmation and explicit retry eviction, without a database, proxy, video download or whole-catalogue prefetch. See [image caching](image-caching.md).

All work uses project data and public online publisher sources. No CS2/Steam process, installation, configuration or gameplay was accessed.
