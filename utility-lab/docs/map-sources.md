# Map scope and artwork sources

Updated **9 November 2026** (Australia/Sydney). Utility Lab is an unofficial CS2 fan tool. Its configured picker is intentionally limited to Active Duty/FACEIT planning; it no longer exposes the earlier all-modes catalogue.

## Current picker

| Configured group | Maps |
| --- | --- |
| Active Duty / Premier | Ancient, Anubis, Cache, Dust II, Inferno, Mirage, Nuke |
| Additional FACEIT option | Vertigo |

This produces **8 map entries and 10 selectable views**. Nuke and Vertigo each have upper/lower views; the other six maps have one overview. The FACEIT filter includes the seven shared maps plus Vertigo. There is no live map-pool API or automatic rotation update.

`src/maps.ts` is the application catalogue. Extra game artwork retained from the original broader prototype is not a current picker entry and does not establish matchmaking availability.

### Pool evidence and limits

- [Valve's Season 5 announcement, 8 July 2026](https://www.counter-strike.net/newsentry/701021228894257508?l=english) documents Cache replacing Overpass in Active Duty. The [official Steam news feed](https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730&count=100&maxlength=0&feeds=steam_community_announcements&format=json) was used where the JavaScript news page did not expose readable text.
- Valve's shipped [`gamemodes.txt`, mirrored by SteamDatabase](https://github.com/SteamDatabase/GameTracking-CS2/blob/cce7bf1f190144c1c08fb0fe75fd3c9514f2637f/game/csgo/pak01_dir/gamemodes.txt) provides the game-data snapshot used in the original map research. SteamDatabase is a third-party mirror, not the game publisher.
- [FACEIT's Season 9 Map Vote FAQ](https://support.faceit.com/hc/en-us/articles/28929221706652-Season-9-Map-Vote-FAQ), updated 28 July 2026, names Vertigo as the optional Elo-enabled addition from 5 August. It describes Season 9 availability and allows significant later changes; it is not an evergreen guarantee of future seasons. The app's Vertigo inclusion is based on that published configuration.

Pool membership and map geometry can change. Update the catalogue from current publisher/platform evidence when requirements change; do not infer membership from an old radar file or describe the static catalogue as live-synced.

## Original vector minimaps

The seven Active Duty maps use original SVG drawings from [setposgg/cs2-minimaps](https://github.com/setposgg/cs2-minimaps). Nuke's drawing is upper-only, so its lower view uses game radar artwork. Local light/dark variants support the app's appearance modes.

- Source snapshot: [`ba5f793883e1ce13076dd6919aa1601099c247cf`](https://github.com/setposgg/cs2-minimaps/tree/ba5f793883e1ce13076dd6919aa1601099c247cf), 23 October 2026.
- Local files: `public/maps/{map}.svg` and `public/maps/{map}-light.svg` for Mirage, Dust II, Inferno, Nuke, Ancient, Anubis and Cache.
- License: **CC BY 4.0**. The licensor waives requirements beyond the linked credit **[Minimaps by setpos.gg](https://setpos.gg)**. Preserve that credit when displaying these drawings.
- Layouts may lag game updates. Source art is not independent in-game validation of saved positions or throws.

## Game radar artwork

Nuke lower and both Vertigo views use genuine game radar PNGs. The other game's PNGs also supply thumbnails/reference artwork where retained. Radar art and community map designs remain the property of Valve Corporation and their respective creators; they are not relicensed as application source code.

- Source: [MurkyYT/cs2-map-icons](https://github.com/MurkyYT/cs2-map-icons), which documents extraction from the game depot and identifies the assets as Valve property.
- Snapshot: [`50ca4c14b67762b3b3ee137b526b8cf300c0d8c9`](https://github.com/MurkyYT/cs2-map-icons/tree/50ca4c14b67762b3b3ee137b526b8cf300c0d8c9), 5 November 2026.
- Remote path: `images/radars/<filename>.png`; local path: `public/maps/<filename>.png`.
- Current lower/floor files include `de_nuke_lower_radar_psd.png`, `de_vertigo_radar_psd.png` and `de_vertigo_lower_radar_psd.png`.
- Full-size PNGs were downloaded without redrawing geometry. Small map-picker thumbnails in `public/map-thumbnails/` are resized local derivatives. The source repository retains historic files, so asset presence was not used as a current map-pool list.

For provenance of retained historical artwork only: the unused Pool Day radar came from [2mlml/cs2-radar-images](https://github.com/2mlml/cs2-radar-images/tree/34df8bc70d47b64cb699091ef6b871cdcca22b59), snapshot `34df8bc70d47b64cb699091ef6b871cdcca22b59` dated 8 May 2025. Pool Day is not exposed by the current picker.

## Rendering and lineup meaning

Map artwork is bundled locally, and full-size views load for the selected map/level. Appearance modes use the corresponding original vector variant or a radar display filter. Custom uploaded map/lineup images retain their own appearance.

The interface may fit the genuine art to its visible bounds; it does not substitute invented layouts. Utility pins are approximate navigation aids, not source-measured aim coordinates, landing points, trajectories or grenade volumes. Video examples and personal photo steps have separate provenance in [lineup-sources.md](lineup-sources.md).
