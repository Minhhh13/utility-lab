# CS2 map catalogue and artwork sources

Checked on **9 November 2026** (Australia/Sydney). This is a local-first fan-tool prototype, not an official Valve product. Game geometry can change; do not infer that a saved throw is verified merely because its radar is bundled.

## Playable map coverage

The catalogue has **24 current playable map definitions**, including the day/night variants. It includes more than the seven Premier maps. Nuke, Train, Vertigo and Baggage include both extracted radar floors; Boulder includes its second extracted layer. Complex includes the overall radar and all 20 local arena radars. Wingman also uses restricted areas of Inferno, Nuke, Overpass and Vertigo; those maps are already included rather than duplicated as different maps.

The scope excludes non-playable lobby and Workshop preview maps, old overview files left in the depot, and removed community maps. It does not label the mere presence of a historical icon as current availability.

| Group | Included maps |
| --- | --- |
| Active Duty / Premier | Ancient, Anubis, Cache, Dust II, Inferno, Mirage, Nuke |
| Other Competitive | Overpass, Train, Vertigo |
| Competitive/Casual/Deathmatch community rotation | Boulder, Fachwerk, Shelter (hostage) |
| Hostage | Italy, Office, Shelter |
| Additional Wingman community maps | Debris, El Dorado, Poseidon |
| Arms Race | Baggage, Pool Day, Shoots (Day), Shoots (Night) |
| Casual/Retakes alternate | Ancient (Night) |
| Rush | Complex (`rush_001`), with its arena radars |

### Availability evidence

- [Valve official news and release-notes feed](https://www.counter-strike.net/news/CS2?l=english), current through 5 November 2026.
- [Valve: Season 5, Armory, and More, 8 July 2026](https://www.counter-strike.net/newsentry/701021228894257508?l=english): Cache replaces Overpass in Active Duty; Boulder, Fachwerk and Shelter are added to Competitive/Casual/Deathmatch; Debris and El Dorado to Wingman.
- [Valve release notes, 8 July 2026, via official Steam feed](https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1836506165581827): removes Warden, Stronghold, Alpine and Sanctum from all modes. Overpass leaving Active Duty is not removal from the game.
- [Valve release notes, 22 September 2026](https://www.counter-strike.net/newsentry/674006995886407685): introduces Rush, with battle arenas selected per match.
- Valve's shipped [`gamemodes.txt`, mirrored by SteamDatabase](https://github.com/SteamDatabase/GameTracking-CS2/blob/cce7bf1f190144c1c08fb0fe75fd3c9514f2637f/game/csgo/pak01_dir/gamemodes.txt), snapshot dated 5 November 2026: the `competitive`, `casual`, `retakes`, `2v2`, Arms Race and Rush mode definitions resolve the complete set above. SteamDatabase is a third-party mirror of Valve's game data, not the publisher.
- [Valve official Steam news API](https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730&count=100&maxlength=0&feeds=steam_community_announcements&format=json) was also used to read the publisher's full release notes when the JavaScript news page did not expose readable HTML.

## Radar artwork: distinct ownership from application code

The PNG radar files are extracted game artwork. **They are not covered by the application's source-code license.** Artwork and map designs remain the property of Valve Corporation and the respective community map creators. The extraction repositories do not grant an independent open-source license to Valve's assets. Their local use here is for the requested Counter-Strike fan-tool draft; a public source repository does not transfer ownership or establish a new license for the art.

### Game-depot radar extraction

- Source: [MurkyYT/cs2-map-icons](https://github.com/MurkyYT/cs2-map-icons).
- Snapshot: [`50ca4c14b67762b3b3ee137b526b8cf300c0d8c9`](https://github.com/MurkyYT/cs2-map-icons/tree/50ca4c14b67762b3b3ee137b526b8cf300c0d8c9), 5 November 2026.
- Remote path: `images/radars/<filename>.png`.
- Local path: `public/maps/<same filename>.png`.
- The source README explicitly identifies icons, radars, thumbnails and overview data as Valve property. The source automates extraction from the official game depot and retains historical files, so its complete asset list was **not** used as a current availability list.
- Source inventory: [`data/available.json`](https://github.com/MurkyYT/cs2-map-icons/blob/50ca4c14b67762b3b3ee137b526b8cf300c0d8c9/data/available.json).
- The catalogue selects the named base radar images rather than duplicates and historic versions. It includes the actual PNGs for all current maps except Pool Day, which uses the source below.
- All files were downloaded unmodified. Application rendering scales the complete square image; no invented map layout is substituted.

### Pool Day

- Source: [2mlml/cs2-radar-images](https://github.com/2mlml/cs2-radar-images).
- Snapshot: [`34df8bc70d47b64cb699091ef6b871cdcca22b59`](https://github.com/2mlml/cs2-radar-images/tree/34df8bc70d47b64cb699091ef6b871cdcca22b59), 8 May 2025.
- Remote `ar_pool_day.png`; local `public/maps/ar_pool_day.png`.
- Extracted game radar, not original artwork made for this app. This source is older than the other radars and is marked accordingly in the catalogue. The app does not claim it is in-game validated for the current patch.

## Optional original vector minimaps

Seven optional SVG drawings are also bundled: Mirage, Dust II, Inferno, Ancient, Anubis, Nuke (upper only) and Cache.

- Source: [setposgg/cs2-minimaps](https://github.com/setposgg/cs2-minimaps).
- Snapshot: [`ba5f793883e1ce13076dd6919aa1601099c247cf`](https://github.com/setposgg/cs2-minimaps/tree/ba5f793883e1ce13076dd6919aa1601099c247cf), 23 October 2026.
- Local paths: `public/maps/{slug}.svg`.
- These are original vector drawings under **CC BY 4.0**. The licensor explicitly waives requirements beyond a linked credit line: **[Minimaps by setpos.gg](https://setpos.gg)**. Keep this credit when using the SVGs.
- Their README states that layouts may lag game updates and Nuke has no lower-level vector drawing. Lower Nuke therefore uses the extracted game PNG rather than faked geometry.

## Runtime delivery

Assets are local and should load only for the selected map and level. There are no required third-party radar requests while planning. The original PNGs plus optional SVGs total approximately 10.4 MB on disk; an individual default map radar is typically 50–240 KB, with some community radars larger. Do not eagerly load every map or arena into the initial screen.
