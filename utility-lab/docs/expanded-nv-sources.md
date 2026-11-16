# Nuke and Vertigo source expansion

Reviewed: 2026-11-09T16:16:37.749Z. Online sources only. This work did not launch CS2, inspect or change Steam/game files, or interact with gameplay.

## Included sources

- 84 CS2Tricks Nuke guides: each source publishes separate Position, Aim and Result images and the exact same-guide video ID. 28 publish a native MP4; 56 use the original YouTube player.
- 38 CS2Tricks Vertigo guides: original Aim and Result images plus a manually reviewed standing frame from the matching source clip. Seven native MP4s; 31 exact YouTube videos. Four source MKV clips are used only for local source-frame extraction, with YouTube retained for iPhone playback.
- 72 CSNADES.gg Vertigo guides: original Aim image, manually reviewed standing-phase source frame, exact source VTT instructions and source HQ MP4. All 72 clips were decoded, sought and observed playing forward.

Total: **194 guides**, with **110 locally derived standing stills**. Each opens with Position, then Aim. All keys/movement/timing come from the same source guide; no unrelated clip, invented input or guessed timestamp is substituted.

## Source and media checks

CS2Tricks public sitemap and normal guide/category pages supplied the exact original image URLs, creator, source description, team, movement, technique, published video file and YouTube ID. Normal image HEAD responses and official YouTube oEmbed/watch status were checked for all 122 guides. All 35 selected native MP4s decoded with a positive duration. All 35 native files and all 87 selected YouTube embeds were observed playing forward, with the intended source video ID. Durable evidence: [data/expanded-nv-media-validation.json](data/expanded-nv-media-validation.json). All 110 final local images decoded at 1280×720 or 1920×1080.

CSNADES normal public sitemap and guide HTML supplied the original image/video assets, source-authored VTT cues, team and throw enums. All 72 original Aim images returned HTTP 200/image type. Standing frames were selected within the source's explicit standing cue after comparing three source frames; two molotovs use the middle standing frame because the last frame had already turned up toward aim. Cache keys and asset filenames include the utility type because an HE and molotov share a slug.

No video was downloaded or rehosted. Native video files remain on the publisher's HTTPS CDN. Local standing images are unchanged screenshots or exact decoded frames of the original online source video. YouTube captures preserve the decoded original scene and contain no browser masthead, advertisement, added marker or AI edits.

Durable per-frame provenance: [data/expanded-nv-position-stills.json](data/expanded-nv-position-stills.json). Each row records the canonical source, creator, exact media URL/video UID, actual timestamp, source/output dimensions, extraction method, SHA-256, and manual review. Full request/capture checks live in ignored outputs/expanded-nv. Source creators retain their rights; these local derived stills are not represented as freely licensed or cleared for public redistribution.

## Destination floors and pins

- Floors describe the destination, not where the player stands.
- Nuke New End HE from Ramp (9e71) is **lower/B reactor**, corrected after reviewing the source's Position/Result photos (red B sign/reactor). Its publisher category/API incorrectly lists level 1. The exact published endpoint is retained with the explicit floor correction.
- Vertigo Deep Ramp from Elevator (9cb9) is **lower**, matching the source Level 2 category, UUID endpoint and lower map art.
- CSNADES Bottom Ramp from Elevator is **lower**, confirmed by the original clip's landing under the A ramp beam. Both A Ramp throws and Bottom B Main are **lower**, confirmed against the publisher's exact throwTo level 2 and reviewed source landings (A-ramp lower tunnel and B-stairs base).
- CSNADES Ramp Lurk from Bridge lands at the middle A-ramp yellow-tarp/bag area; upper is provisional, and its precise map destination pin remains hidden pending calibrated publisher endpoint evidence.
- Other CSNADES exact target coordinates were not published in the parsed guide object; their map pins are hidden instead of being guessed. Root integration separately applies checked publisher-source map registrations to CS2Tricks UUID destinations.

Source dates are publication/update metadata where available, not a claim of a fresh game-build capture. These online guides were not tested in the game. Map changes can affect a throw.

## Coverage

```json
{
  "nuke": {
    "T": {
      "Smoke": 40,
      "Flash": 3,
      "Molotov": 12,
      "HE": 3
    },
    "CT": {
      "Smoke": 7,
      "Flash": 6,
      "Molotov": 7,
      "HE": 6
    }
  },
  "vertigo": {
    "T": {
      "Smoke": 52,
      "Flash": 7,
      "Molotov": 16,
      "HE": 2
    },
    "CT": {
      "Smoke": 18,
      "Flash": 4,
      "Molotov": 5,
      "HE": 6
    }
  }
}
```

## Source inventory

| Map | Side | Utility | Guide | Inputs | Standing frame | Source publication |
|---|---|---|---|---|---|---|
| nuke | CT | Flash | [A Site from CT Spawn](https://www.cs2tricks.com/nades/nuke/flashbangs/a-site-from-ct-spawn-0fc1) | Jump + LMB | Original Position image | 2025-09-18T20:45:29.81536Z |
| nuke | CT | Flash | [A Site from Heaven](https://www.cs2tricks.com/nades/nuke/flashbangs/a-site-from-heaven-00bf) | LMB | Original Position image | 2025-09-18T20:41:24.627858Z |
| nuke | T | Flash | [A Site from Silo](https://www.cs2tricks.com/nades/nuke/flashbangs/a-site-from-silo-cccc) | Crouch + LMB | Original Position image | 2026-02-08T02:26:25.397977Z |
| nuke | T | Flash | [A Site from T Roof](https://www.cs2tricks.com/nades/nuke/flashbangs/a-site-from-t-roof-9f65) | Jump + LMB | Original Position image | 2025-09-21T23:37:57.454932Z |
| nuke | T | Flash | [Hut from Lobby](https://www.cs2tricks.com/nades/nuke/flashbangs/hut-from-lobby-9ec9) | LMB | Original Position image | 2025-07-21T14:09:15.993242Z |
| nuke | CT | Flash | [Lobby from Rafters](https://www.cs2tricks.com/nades/nuke/flashbangs/lobby-from-rafters-3385) | LMB | Original Position image | 2025-07-21T12:23:22.950596Z |
| nuke | CT | Flash | [Main from Garage](https://www.cs2tricks.com/nades/nuke/flashbangs/main-from-garage-f56a) | Crouch + LMB | Original Position image | 2025-07-21T12:28:14.743851Z |
| nuke | CT | Flash | [Squeaky from Heaven](https://www.cs2tricks.com/nades/nuke/flashbangs/squeaky-from-heaven-a6f8) | LMB | Original Position image | 2025-07-21T12:17:05.063813Z |
| nuke | CT | Flash | [Trophy from Ramp](https://www.cs2tricks.com/nades/nuke/flashbangs/trophy-from-ramp-5ab6) | LMB | Original Position image | 2025-10-03T21:23:45.946302Z |
| nuke | T | HE | [A Site from T-Roof](https://www.cs2tricks.com/nades/nuke/grenades/a-site-from-t-roof-c400) | Jump + LMB | Original Position image | 2025-07-21T14:45:54.477538Z |
| nuke | CT | HE | [Hut from A Site](https://www.cs2tricks.com/nades/nuke/grenades/hut-from-a-site-264a) | Run + LMB | Original Position image | 2025-07-21T12:37:20.625678Z |
| nuke | T | HE | [Hut from T-Roof](https://www.cs2tricks.com/nades/nuke/grenades/hut-from-t-roof-70d8) | Run + Jump + LMB | Original Position image | 2025-07-21T14:39:14.425286Z |
| nuke | CT | HE | [Main from Garage](https://www.cs2tricks.com/nades/nuke/grenades/main-from-garage-92b7) | LMB | Original Position image | 2025-07-21T12:35:00.527566Z |
| nuke | CT | HE | [B site (New End) from Ramp](https://www.cs2tricks.com/nades/nuke/grenades/new-end-from-ramp-9e71) | LMB | Original Position image | 2026-08-30T09:41:22.310666Z |
| nuke | CT | HE | [Silo from Outside Main](https://www.cs2tricks.com/nades/nuke/grenades/silo-from-outside-main-af81) | LMB | Original Position image | 2025-09-16T17:20:51.842776Z |
| nuke | CT | HE | [Silo from Rafters](https://www.cs2tricks.com/nades/nuke/grenades/silo-from-rafters-7b2f) | LMB | Original Position image | 2025-09-16T17:16:47.002607Z |
| nuke | CT | HE | [Squeaky from A Site](https://www.cs2tricks.com/nades/nuke/grenades/squeaky-from-a-site-73dc) | Run + LMB | Original Position image | 2025-07-21T12:31:59.022622Z |
| nuke | T | HE | [Squeaky from Lobby](https://www.cs2tricks.com/nades/nuke/grenades/squeaky-from-lobby-0f88) | LMB | Original Position image | 2025-07-21T14:33:20.310453Z |
| nuke | T | Molotov | [2nd Vent from T Roof](https://www.cs2tricks.com/nades/nuke/molotovs/2nd-vent-from-t-roof-43d0) | Run + Jump + LMB | Original Position image | 2025-09-17T16:53:38.157705Z |
| nuke | T | Molotov | [A Site from T Roof](https://www.cs2tricks.com/nades/nuke/molotovs/a-site-from-t-roof-19a5) | Jump + LMB | Original Position image | 2025-09-17T16:30:41.357319Z |
| nuke | T | Molotov | [A Site from T Roof](https://www.cs2tricks.com/nades/nuke/molotovs/a-site-from-t-roof-d73e) | Jump + LMB | Original Position image | 2025-09-17T16:34:55.787435Z |
| nuke | T | Molotov | [Heaven from Silo](https://www.cs2tricks.com/nades/nuke/molotovs/heaven-from-silo-bfc0) | Run + Jump + LMB | Original Position image | 2026-06-12T14:06:22.195898Z |
| nuke | T | Molotov | [Heaven from T-Roof](https://www.cs2tricks.com/nades/nuke/molotovs/heaven-from-t-roof-589a) | Jump + LMB | Original Position image | 2026-06-22T05:34:49.297734Z |
| nuke | CT | Molotov | [Hut from Heaven](https://www.cs2tricks.com/nades/nuke/molotovs/hut-from-heaven-2bd3) | LMB | Original Position image | 2025-07-21T12:12:30.274296Z |
| nuke | CT | Molotov | [Hut from Heaven](https://www.cs2tricks.com/nades/nuke/molotovs/hut-from-heaven-34c1) | LMB | Original Position image | 2025-07-21T12:14:56.254254Z |
| nuke | T | Molotov | [Hut from Silo](https://www.cs2tricks.com/nades/nuke/molotovs/hut-from-silo-4454) | LMB | Original Position image | 2025-10-03T20:52:33.253073Z |
| nuke | T | Molotov | [Hut from T Roof](https://www.cs2tricks.com/nades/nuke/molotovs/hut-from-t-roof-4359) | Run + Jump + LMB | Original Position image | 2025-09-17T16:44:47.863519Z |
| nuke | T | Molotov | [Hut from T-Roof](https://www.cs2tricks.com/nades/nuke/molotovs/hut-from-t-roof-55fe) | Run + LMB | Original Position image | 2025-07-21T13:05:39.78319Z |
| nuke | T | Molotov | [Hut from T Roof](https://www.cs2tricks.com/nades/nuke/molotovs/hut-from-t-roof-7bee) | Run + LMB | Original Position image | 2025-09-17T16:39:49.833709Z |
| nuke | T | Molotov | [Main from Lobby](https://www.cs2tricks.com/nades/nuke/molotovs/main-from-lobby-f4e2) | Run + LMB | Original Position image | 2025-07-21T13:00:33.667824Z |
| nuke | T | Molotov | [Rafters from T Roof](https://www.cs2tricks.com/nades/nuke/molotovs/rafters-from-t-roof-6c0c) | LMB | Original Position image | 2025-09-17T16:25:38.738403Z |
| nuke | T | Molotov | [Ramp Box from Trophy](https://www.cs2tricks.com/nades/nuke/molotovs/ramp-box-from-trophy-0bee) | LMB | Original Position image | 2025-09-17T16:49:59.894691Z |
| nuke | CT | Molotov | [Silo from CT Red](https://www.cs2tricks.com/nades/nuke/molotovs/silo-from-ct-red-4f77) | Jump + LMB | Original Position image | 2025-09-17T17:01:34.560046Z |
| nuke | CT | Molotov | [Silo from Rafters](https://www.cs2tricks.com/nades/nuke/molotovs/silo-from-rafters-10cc) | Crouch + LMB | Original Position image | 2025-09-17T16:20:39.418139Z |
| nuke | CT | Molotov | [Squeaky from Heaven](https://www.cs2tricks.com/nades/nuke/molotovs/squeaky-from-heaven-9e00) | Run + LMB | Original Position image | 2025-05-05T11:03:38.135994Z |
| nuke | CT | Molotov | [Squeaky from Heaven](https://www.cs2tricks.com/nades/nuke/molotovs/squeaky-from-heaven-d3f5) | LMB | Original Position image | 2025-07-21T12:09:57.467657Z |
| nuke | CT | Molotov | [T Outside from CT Box](https://www.cs2tricks.com/nades/nuke/molotovs/t-outside-from-ct-box-4351) | Run + LMB | Original Position image | 2025-10-03T21:26:32.118239Z |
| nuke | T | Smoke | [CT Red from Outside](https://www.cs2tricks.com/nades/nuke/smokes/ct-red-from-outside-a3c6) | LMB | Original Position image | 2025-09-16T15:55:19.032138Z |
| nuke | T | Smoke | [Garage from Outside](https://www.cs2tricks.com/nades/nuke/smokes/garage-from-outside-f062) | LMB | Original Position image | 2025-10-03T20:56:59.506745Z |
| nuke | T | Smoke | [Garage from T-Spawn](https://www.cs2tricks.com/nades/nuke/smokes/garage-from-t-spawn-7fda) | Jump + LMB | Original Position image | 2025-09-16T16:06:28.100944Z |
| nuke | T | Smoke | [Heaven from Outside](https://www.cs2tricks.com/nades/nuke/smokes/heaven-from-outside-00f3) | Run + Jump + LMB | Original Position image | 2025-10-18T13:03:52.266941Z |
| nuke | T | Smoke | [Heaven from Outside](https://www.cs2tricks.com/nades/nuke/smokes/heaven-from-outside-7739) | Jump + LMB | Original Position image | 2025-07-21T12:42:29.087521Z |
| nuke | T | Smoke | [Heaven from Silo](https://www.cs2tricks.com/nades/nuke/smokes/heaven-from-silo-dd2c) | LMB | Original Position image | 2025-09-16T16:42:05.951222Z |
| nuke | T | Smoke | [Heaven from T Roof](https://www.cs2tricks.com/nades/nuke/smokes/heaven-from-t-roof-08f2) | Jump + LMB | Original Position image | 2025-10-18T12:13:50.031106Z |
| nuke | T | Smoke | [Heaven from T Roof](https://www.cs2tricks.com/nades/nuke/smokes/heaven-from-t-roof-6f9a) | LMB | Original Position image | 2025-10-18T12:51:54.181026Z |
| nuke | T | Smoke | [Heaven from T Roof](https://www.cs2tricks.com/nades/nuke/smokes/heaven-from-t-roof-7bcf) | Jump + LMB | Original Position image | 2025-09-21T23:29:35.381764Z |
| nuke | T | Smoke | [Heaven from T Roof](https://www.cs2tricks.com/nades/nuke/smokes/heaven-from-t-roof-7e8c) | Run + Jump + LMB | Original Position image | 2025-09-16T17:07:44.213365Z |
| nuke | T | Smoke | [Heaven from T-Spawn](https://www.cs2tricks.com/nades/nuke/smokes/heaven-from-t-spawn-eb88) | Run + Jump + LMB | Original Position image | 2026-03-11T14:04:55.438791Z |
| nuke | CT | Smoke | [Hut from Heaven](https://www.cs2tricks.com/nades/nuke/smokes/hut-from-heaven-88db) | LMB | Original Position image | 2025-07-21T11:38:03.623769Z |
| nuke | T | Smoke | [Hut from T-Spawn](https://www.cs2tricks.com/nades/nuke/smokes/hut-from-t-spawn-07ff) | Crouch + Jump + LMB | Original Position image | 2025-07-21T12:56:50.3457Z |
| nuke | T | Smoke | [Lockers from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/lockers-from-t-spawn-3d4f) | Run + Jump + LMB | Original Position image | 2025-09-16T16:49:06.022441Z |
| nuke | T | Smoke | [Lockers from T-Spawn](https://www.cs2tricks.com/nades/nuke/smokes/lockers-from-t-spawn-dffd) | Jump + LMB | Original Position image | 2025-10-18T11:53:05.576313Z |
| nuke | T | Smoke | [Main from Outside](https://www.cs2tricks.com/nades/nuke/smokes/main-from-outside-2beb) | Run + Jump + LMB | Original Position image | 2025-07-21T12:47:04.946837Z |
| nuke | T | Smoke | [Main from Outside](https://www.cs2tricks.com/nades/nuke/smokes/main-from-outside-dfc0) | LMB | Original Position image | 2025-10-03T21:00:27.986553Z |
| nuke | T | Smoke | [Main from T Roof](https://www.cs2tricks.com/nades/nuke/smokes/main-from-t-roof-90c9) | Jump + both buttons (LMB + RMB) | Original Position image | 2025-09-16T16:55:58.160276Z |
| nuke | T | Smoke | [Main from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/main-from-t-spawn-1f0c) | Jump + LMB | Original Position image | 2025-10-03T21:03:25.233783Z |
| nuke | T | Smoke | [Main from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/main-from-t-spawn-39eb) | Jump + LMB | Original Position image | 2026-05-17T08:18:41.724966Z |
| nuke | T | Smoke | [Main from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/main-from-t-spawn-9dfd) | Jump + LMB | Original Position image | 2026-02-08T02:28:03.189817Z |
| nuke | T | Smoke | [Main from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/main-from-t-spawn-ddf0) | Jump + LMB | Original Position image | 2025-10-21T12:41:21.842932Z |
| nuke | T | Smoke | [Secret Far from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/new-location-from-t-spawn-464d) | Jump + LMB | Original Position image | 2025-09-16T16:10:20.157196Z |
| nuke | CT | Smoke | [Outside from CT Box](https://www.cs2tricks.com/nades/nuke/smokes/outside-from-ct-box-7884) | Jump + LMB | Original Position image | 2025-10-03T21:36:25.024469Z |
| nuke | T | Smoke | [Outside from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/outside-from-t-spawn-f5a3) | Run + Jump + LMB | Original Position image | 2025-10-21T13:09:52.186954Z |
| nuke | T | Smoke | [Secret Far from Outside](https://www.cs2tricks.com/nades/nuke/smokes/outside-garage-from-outside-7ee3) | Jump + LMB | Original Position image | 2026-02-08T02:29:06.261932Z |
| nuke | T | Smoke | [Secret Far from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/outside-garage-from-t-spawn-84d5) | Walk + Jump + LMB | Original Position image | 2025-10-31T20:53:07.107963Z |
| nuke | T | Smoke | [Outside Garage from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/outside-garage-from-t-spawn-cfc0) | Jump + LMB | Original Position image | 2026-05-17T08:19:55.729349Z |
| nuke | T | Smoke | [Outside Main from Outside](https://www.cs2tricks.com/nades/nuke/smokes/outside-main--from-outside-5349) | Jump + LMB | Original Position image | 2025-09-16T16:33:54.481869Z |
| nuke | T | Smoke | [Outside Main from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/outside-main--from-t-spawn-6320) | Jump + LMB | Original Position image | 2025-09-16T16:28:46.048686Z |
| nuke | T | Smoke | [Outside Main from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/outside-main--from-t-spawn-63d2) | Jump + LMB | Original Position image | 2026-05-17T08:19:21.441865Z |
| nuke | T | Smoke | [Outside Main from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/outside-main--from-t-spawn-cbdb) | Jump + LMB | Original Position image | 2025-10-31T20:39:35.104833Z |
| nuke | T | Smoke | [Ramp from Trophy](https://www.cs2tricks.com/nades/nuke/smokes/ramp-from-trophy-786b) | Run + LMB | Original Position image | 2025-09-16T17:00:20.849957Z |
| nuke | T | Smoke | [Ramp from Trophy](https://www.cs2tricks.com/nades/nuke/smokes/ramp-from-trophy-b453) | Run + LMB | Original Position image | 2025-09-16T17:03:17.357367Z |
| nuke | T | Smoke | [Secret Far from Outside](https://www.cs2tricks.com/nades/nuke/smokes/secret-far-from-outside-0adb) | Jump + LMB | Original Position image | 2025-09-16T16:16:53.927213Z |
| nuke | T | Smoke | [Secret Far from Outside](https://www.cs2tricks.com/nades/nuke/smokes/secret-far-from-outside-5982) | Jump + LMB | Original Position image | 2025-09-16T16:13:54.466436Z |
| nuke | T | Smoke | [Secret Far from Outside](https://www.cs2tricks.com/nades/nuke/smokes/secret-far-from-outside-790e) | Jump + LMB | Original Position image | 2025-09-16T16:24:56.967769Z |
| nuke | T | Smoke | [Secret Far from T Red](https://www.cs2tricks.com/nades/nuke/smokes/secret-far-from-t-red-14cd) | LMB | Original Position image | 2026-05-17T08:22:41.774214Z |
| nuke | T | Smoke | [Secret Far from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/secret-far-from-t-spawn-0922) | Jump + LMB | Original Position image | 2025-09-16T16:19:59.717849Z |
| nuke | T | Smoke | [Secret Far from T Spawn](https://www.cs2tricks.com/nades/nuke/smokes/secret-far-from-t-spawn-1eb1) | Jump + LMB | Original Position image | 2025-10-21T12:58:13.913112Z |
| nuke | CT | Smoke | [Silo from CT Box](https://www.cs2tricks.com/nades/nuke/smokes/silo-from-ct-box-b0d7) | Jump + LMB | Original Position image | 2025-09-16T16:01:25.048171Z |
| nuke | CT | Smoke | [Squeaky from A Site](https://www.cs2tricks.com/nades/nuke/smokes/squeaky-from-a-site-0312) | Jump + LMB | Original Position image | 2026-05-17T08:17:26.72169Z |
| nuke | CT | Smoke | [Squeaky from Garage](https://www.cs2tricks.com/nades/nuke/smokes/squeaky-from-garage-9761) | Crouch + LMB | Original Position image | 2025-07-21T11:47:22.323419Z |
| nuke | CT | Smoke | [Squeaky from Heaven](https://www.cs2tricks.com/nades/nuke/smokes/squeaky-from-heaven-2038) | Run + LMB | Original Position image | 2025-07-21T11:43:17.68835Z |
| nuke | T | Smoke | [Squeaky from T-Spawn](https://www.cs2tricks.com/nades/nuke/smokes/squeaky-from-t-spawn-bcda) | Jump + LMB | Original Position image | 2025-09-16T16:37:25.219521Z |
| nuke | CT | Smoke | [T Outside from CT Spawn](https://www.cs2tricks.com/nades/nuke/smokes/t-outside-from-ct-spawn-a31e) | Tap W + Jump + LMB | Original Position image | 2025-10-21T13:31:16.054691Z |
| nuke | T | Smoke | [T Red from Outside](https://www.cs2tricks.com/nades/nuke/smokes/t-red-from-outside-d7c3) | Run + LMB | Original Position image | 2025-10-03T21:40:48.96016Z |
| vertigo | CT | HE | [T Mid from Mid](https://www.cs2tricks.com/nades/vertigo/grenades/t-mid-from-mid-2f9a) | Jump + LMB | 4.000 s; fXMqOolcGvo | 2026-04-23T19:21:38.095428Z |
| vertigo | T | Molotov | [B Headshot from Stairs](https://www.cs2tricks.com/nades/vertigo/molotovs/b-headshot-from-stairs-2d80) | LMB | 2.500 s; gMzCYARlEfI | 2025-09-29T07:50:51.185631Z |
| vertigo | T | Molotov | [Headshot from Ramp](https://www.cs2tricks.com/nades/vertigo/molotovs/headshot-from-ramp-c7c8) | LMB | 2.500 s; LWQtd1oCzWI | 2025-09-30T08:07:49.637573Z |
| vertigo | T | Molotov | [Lane from Ladder](https://www.cs2tricks.com/nades/vertigo/molotovs/lane-from-ladder-1682) | LMB | 3.500 s; FuKQzhfV65o | 2025-11-04T13:03:11.637018Z |
| vertigo | T | Molotov | [Pillar from Stairs](https://www.cs2tricks.com/nades/vertigo/molotovs/pillar-from-stairs-cb99) | Jump + LMB | 3.500 s; 5adr6_WGv60 | 2025-09-29T07:47:37.467832Z |
| vertigo | T | Molotov | [Sidewalk from Ladder](https://www.cs2tricks.com/nades/vertigo/molotovs/sidewalk-from-ladder-f7cb) | Crouch + Jump + LMB | 3.500 s; UR0c8sSurqI | 2025-09-29T07:56:14.636633Z |
| vertigo | T | Molotov | [Wood from Stairs](https://www.cs2tricks.com/nades/vertigo/molotovs/wood-from-stairs-848c) | LMB | 2.500 s; 0f67InbEEmQ | 2025-09-29T07:39:14.144644Z |
| vertigo | T | Smoke | [A Conn from Mid](https://www.cs2tricks.com/nades/vertigo/smokes/a-conn-from-mid-c798) | Walk + LMB | 3.500 s; Rwko6tOGx1o | 2025-09-23T16:07:59.547952Z |
| vertigo | T | Smoke | [A Site Left from Ramp](https://www.cs2tricks.com/nades/vertigo/smokes/a-site-left-from-ramp-cc8f) | Jump + LMB | 2.500 s; rz2dOO09qkA | 2025-09-26T07:40:07.885069Z |
| vertigo | T | Smoke | [A Site Left from T Spawn](https://www.cs2tricks.com/nades/vertigo/smokes/a-site-left-from-t-spawn-b650) | Jump + LMB | 1.500 s; qagpkD3nDhs | 2025-09-26T07:35:38.11461Z |
| vertigo | T | Smoke | [B Connector from Mid](https://www.cs2tricks.com/nades/vertigo/smokes/b-connector--from-mid-0e4b) | LMB | 1.500 s; 4XtthUAMLo4 | 2025-09-23T15:50:33.415061Z |
| vertigo | T | Smoke | [B Cross from Stairs](https://www.cs2tricks.com/nades/vertigo/smokes/b-cross-from-stairs-a167) | LMB | 2.500 s; zlQul2JuktQ | 2025-09-23T14:47:16.673366Z |
| vertigo | T | Smoke | [B Cross from T Spawn](https://www.cs2tricks.com/nades/vertigo/smokes/b-cross-from-t-spawn-274d) | LMB | 1.500 s; iRqRHnwizu8 | 2025-09-23T15:00:22.43617Z |
| vertigo | T | Smoke | [B Headshot from Stairs](https://www.cs2tricks.com/nades/vertigo/smokes/b-headshot-from-stairs-3fbc) | LMB | 1.500 s; ykiNkboWuUA | 2025-09-23T15:08:09.614391Z |
| vertigo | CT | Smoke | [B Main from CT Spawn](https://www.cs2tricks.com/nades/vertigo/smokes/b-main-from-ct-spawn-75b5) | LMB | 1.500 s; D7NscQC4wJQ | 2025-09-23T14:40:20.921755Z |
| vertigo | CT | Smoke | [B Main from CT Spawn](https://www.cs2tricks.com/nades/vertigo/smokes/b-main-from-ct-spawn-cb0c) | LMB | 1.500 s; Pv0bYimfLN0 | 2025-09-23T14:36:02.835839Z |
| vertigo | CT | Smoke | [Crane from A Site](https://www.cs2tricks.com/nades/vertigo/smokes/crane-from-a-site-ad0e) | LMB | 2.500 s; pu-EEr_qpmc | 2025-09-26T07:50:45.561837Z |
| vertigo | T | Smoke | [CT from Mid](https://www.cs2tricks.com/nades/vertigo/smokes/ct-from-mid-38e3) | LMB | 1.500 s; 215Gzn_2Jog | 2025-09-23T16:02:31.496698Z |
| vertigo | T | Smoke | [CT Spawn from Stairs](https://www.cs2tricks.com/nades/vertigo/smokes/ct-spawn-from-stairs-e997) | LMB | 1.500 s; UNV8n0-OYvQ | 2025-09-23T15:45:53.326189Z |
| vertigo | CT | Smoke | [Deep Ramp from Elevator](https://www.cs2tricks.com/nades/vertigo/smokes/deep-ramp-from-elevator-9cb9) | Run + LMB | 2.500 s; 8FyPMfXWYpQ | 2025-11-04T12:34:55.267511Z |
| vertigo | T | Smoke | [EBox from Stairs](https://www.cs2tricks.com/nades/vertigo/smokes/ebox-from-stairs-bc18) | LMB | 1.500 s; BGDa4LOSnvQ | 2025-09-23T15:12:36.099163Z |
| vertigo | T | Smoke | [EBox from T Spawn](https://www.cs2tricks.com/nades/vertigo/smokes/ebox-from-t-spawn-4b77) | Jump + LMB | 0.750 s; khpL4k-BNPw | 2025-11-04T12:56:37.668421Z |
| vertigo | T | Smoke | [EBox from T Spawn](https://www.cs2tricks.com/nades/vertigo/smokes/ebox-from-t-spawn-5a5b) | Jump + LMB | 2.500 s; fdb7gyyKn38 | 2025-09-23T15:17:09.959019Z |
| vertigo | T | Smoke | [Elevator from Ramp](https://www.cs2tricks.com/nades/vertigo/smokes/elevator-from-ramp-0d0b) | Run + Jump + LMB | 2.500 s; MjkKd-LXPj0 | 2025-09-26T07:27:29.43421Z |
| vertigo | T | Smoke | [Front Elevator from Ramp](https://www.cs2tricks.com/nades/vertigo/smokes/front-elevator-from-ramp-54ee) | Jump + LMB | 1.500 s; 9UoSx0YZCeU | 2025-09-26T07:46:55.567101Z |
| vertigo | T | Smoke | [Front Elevator from Ramp](https://www.cs2tricks.com/nades/vertigo/smokes/front-elevator-from-ramp-ab1b) | Jump + both buttons (LMB + RMB) | 1.500 s; 8GjeN7YUoa4 | 2025-09-26T07:43:56.831094Z |
| vertigo | T | Smoke | [Generator Left from Mid](https://www.cs2tricks.com/nades/vertigo/smokes/generator-left-from-mid-8750) | Crouch + LMB | 1.500 s; T_C8mJ6JQrE | 2025-09-23T15:40:56.460667Z |
| vertigo | T | Smoke | [Generator Left from Under Stairs](https://www.cs2tricks.com/nades/vertigo/smokes/generator-left-from-stairs-8a4a) | Jump + LMB | 1.500 s; 4UXMRpyy1FY | 2025-09-23T15:27:09.36851Z |
| vertigo | T | Smoke | [Generator Left from Stairs](https://www.cs2tricks.com/nades/vertigo/smokes/generator-left-from-stairs-b2bb) | Crouch + Jump + LMB | 2.500 s; GU-0SVgkbos | 2025-09-23T15:31:28.085091Z |
| vertigo | T | Smoke | [Generator Left from T Spawn](https://www.cs2tricks.com/nades/vertigo/smokes/generator-left-from-t-spawn-ab3f) | Jump + LMB | 1.500 s; CdjOZ-XaDcc | 2025-09-23T15:35:46.174794Z |
| vertigo | T | Smoke | [Headshot from Ramp](https://www.cs2tricks.com/nades/vertigo/smokes/headshot-from-ramp-800d) | LMB | 2.500 s; zCfglYEpPo8 | 2025-09-26T07:31:41.872858Z |
| vertigo | CT | Smoke | [Mid from CT](https://www.cs2tricks.com/nades/vertigo/smokes/mid-from-ct-6e48) | Jump + LMB | 2.500 s; YAEPX7MLZBU | 2025-09-23T16:13:37.242963Z |
| vertigo | CT | Smoke | [Mid from Top Mid](https://www.cs2tricks.com/nades/vertigo/smokes/mid-from-top-mid-40c8) | Jump + LMB | 1.500 s; EqCKVnEm2V4 | 2025-11-04T12:51:27.419901Z |
| vertigo | CT | Smoke | [Sidewalk from Double](https://www.cs2tricks.com/nades/vertigo/smokes/sidewalk-from-double-f8b2) | LMB | 0.750 s; _18ZDNDdQ10 | 2025-11-04T12:36:26.329287Z |
| vertigo | T | Smoke | [Sidewalk from T Spawn](https://www.cs2tricks.com/nades/vertigo/smokes/sidewalk-from-t-spawn-741f) | Jump + LMB | 2.500 s; -5eAPmaZKnY | 2025-09-23T22:02:47.984981Z |
| vertigo | T | Smoke | [Sniper's Nest from Ramp](https://www.cs2tricks.com/nades/vertigo/smokes/sniper's-nest-from-ramp-88b5) | LMB | 1.500 s; JznkrfdOqcg | 2025-09-26T07:21:46.064523Z |
| vertigo | CT | Smoke | [Stairs from B Site](https://www.cs2tricks.com/nades/vertigo/smokes/stairs-from-b-site-252d) | LMB | 1.500 s; m75EvhPcp1E | 2025-11-04T12:38:07.158177Z |
| vertigo | T | Smoke | [Top Mid from Mid](https://www.cs2tricks.com/nades/vertigo/smokes/top-mid--from-mid-87c7) | Run + Jump + LMB | 1.500 s; Eys6HFdWr0k | 2025-09-23T15:56:19.794936Z |
| vertigo | T | Flash | [A Short from Sidewalk](https://csnades.gg/vertigo/flashbangs/a-short-from-sidewalk) | LMB | 2.350 s; vertigo-flashbang-VdQpF9Xvip | 2023-12-08T16:18:50.557Z |
| vertigo | CT | Flash | [A Site from Heaven](https://csnades.gg/vertigo/flashbangs/a-site-from-heaven) | LMB | 2.350 s; vertigo-flashbang-rchsSQuW8Z | 2023-12-08T16:18:11.399Z |
| vertigo | T | Flash | [B Site from Stairs](https://csnades.gg/vertigo/flashbangs/b-site-from-stairs) | LMB | 2.350 s; vertigo-flashbang-r5fW7mzj28 | 2023-12-08T16:18:28.765Z |
| vertigo | T | Flash | [B Site from Under T Mid](https://csnades.gg/vertigo/flashbangs/b-site-from-under-t-mid) | LMB | 3.433 s; vertigo-flashbang-I9HvO0wJoh | 2023-12-08T16:18:17.015Z |
| vertigo | CT | Flash | [Mid from CT Mid](https://csnades.gg/vertigo/flashbangs/mid-from-ct-mid) | LMB | 2.350 s; vertigo-flashbang-MXoTsiA6QN | 2023-12-08T16:17:35.476Z |
| vertigo | T | Flash | [Mid from Iron](https://csnades.gg/vertigo/flashbangs/mid-from-iron) | both buttons (LMB + RMB) | 2.350 s; vertigo-flashbang-SW2O8pZHMP | 2023-12-08T16:18:05.787Z |
| vertigo | T | Flash | [Mid from T Mid](https://csnades.gg/vertigo/flashbangs/mid-from-t-mid) | LMB | 2.350 s; vertigo-flashbang-TPzypIlAoj | 2023-12-08T16:18:41.433Z |
| vertigo | CT | Flash | [Sidewalk from Headshot](https://csnades.gg/vertigo/flashbangs/sidewalk-from-headshot) | LMB | 2.350 s; vertigo-flashbang-UZ1rNN9HqV | 2023-12-08T16:18:14.307Z |
| vertigo | T | Flash | [Sidewalk from Sidewalk](https://csnades.gg/vertigo/flashbangs/sidewalk-from-sidewalk) | Crouch + Jump + RMB | 2.350 s; vertigo-flashbang-3scH1xEJR3 | 2023-12-08T16:19:14.340Z |
| vertigo | CT | Flash | [T Mid from Mid Box](https://csnades.gg/vertigo/flashbangs/t-mid-from-mid-box) | Run + Jump + RMB | 2.350 s; vertigo-flashbang-bWA6zswYai | 2024-03-09T23:59:23.793Z |
| vertigo | T | Flash | [Whitebox from Stairs](https://csnades.gg/vertigo/flashbangs/whitebox-from-stairs) | LMB | 2.350 s; vertigo-flashbang-XvCsfCDHqj | 2023-12-08T16:17:55.012Z |
| vertigo | CT | HE | [Default A from Backsite](https://csnades.gg/vertigo/hegrenades/default-a-from-backsite) | Jump + LMB | 2.350 s; vertigo-he-eAdWtexeB1 | 2023-12-08T16:17:46.433Z |
| vertigo | CT | HE | [Default A from Headshot](https://csnades.gg/vertigo/hegrenades/default-a-from-headshot) | Jump + LMB | 2.350 s; vertigo-he-RS5XdyGLLx | 2023-12-08T16:17:51.494Z |
| vertigo | CT | HE | [Default B from Generator](https://csnades.gg/vertigo/hegrenades/default-b-from-generator) | Run + LMB | 2.350 s; vertigo-he-KBn6S5cuhX | 2023-12-08T16:18:03.036Z |
| vertigo | CT | HE | [Sandbags from Crane](https://csnades.gg/vertigo/hegrenades/sandbags-from-crane) | LMB | 2.350 s; vertigo-he-Rq02neqsMm | 2023-12-08T16:17:11.915Z |
| vertigo | CT | HE | [T Mid from Boost Box](https://csnades.gg/vertigo/hegrenades/t-mid-from-boost-box) | LMB | 2.350 s; vertigo-he-OoyKIFKDyG | 2023-12-08T16:17:48.881Z |
| vertigo | T | HE | [Whitebox from Under Stairs](https://csnades.gg/vertigo/hegrenades/whitebox-from-under-stairs) | Jump + LMB | 2.350 s; vertigo-he-6YAIMfOsVh | 2023-12-08T16:17:26.603Z |
| vertigo | T | HE | [Wood from B Stairs](https://csnades.gg/vertigo/hegrenades/wood-from-b-stairs) | LMB | 2.366 s; vertigo-he-cupHPhyqzo | 2024-03-20T21:23:59.934Z |
| vertigo | T | Molotov | [Connector from Mid Iron](https://csnades.gg/vertigo/molotovs/connector-from-mid-iron) | LMB | 2.350 s; vertigo-molotov-LBvUUSiugV | 2023-12-08T16:18:25.982Z |
| vertigo | CT | Molotov | [Default A from Heaven](https://csnades.gg/vertigo/molotovs/default-a-from-heaven) | LMB | 2.350 s; vertigo-molotov-MKrcPIM9ev | 2023-12-08T16:17:29.487Z |
| vertigo | T | Molotov | [Default A from Ramp](https://csnades.gg/vertigo/molotovs/default-a-from-ramp) | Walk + Jump + LMB | 2.350 s; vertigo-molotov-h0XTM4tXUi | 2023-12-08T16:18:37.418Z |
| vertigo | CT | Molotov | [Default B from Connector](https://csnades.gg/vertigo/molotovs/default-b-from-connector) | LMB | 2.350 s; vertigo-molotov-5BeVdjmj4Q | 2023-12-08T16:18:47.099Z |
| vertigo | CT | Molotov | [Default B from CT Spawn](https://csnades.gg/vertigo/molotovs/default-b-from-ct-spawn) | LMB | 2.350 s; vertigo-molotov-gF8IVsW8sJ | 2023-12-08T16:19:03.643Z |
| vertigo | T | Molotov | [Headshot from Area 51](https://csnades.gg/vertigo/molotovs/headshot-from-area-51) | Jump + LMB | 2.366 s; vertigo-molotov-iZdnWXJ0b3 | 2024-03-20T04:10:04.236Z |
| vertigo | T | Molotov | [Headshot from Ramp](https://csnades.gg/vertigo/molotovs/headshot-from-ramp) | LMB | 4.316 s; vertigo-molotov-567681fcB0 | 2023-12-08T16:17:57.576Z |
| vertigo | T | Molotov | [Headshot from Ramp](https://csnades.gg/vertigo/molotovs/headshot-from-ramp-b) | Jump + LMB | 2.366 s; vertigo-molotov-SJ1BAyNw3I | 2024-03-21T03:38:59.589Z |
| vertigo | T | Molotov | [Headshot from Sidewalk](https://csnades.gg/vertigo/molotovs/headshot-from-sidewalk) | Crouch + Jump + LMB | 2.350 s; vertigo-molotov-G3sb93YDAe | 2023-12-08T16:17:14.790Z |
| vertigo | T | Molotov | [Pillar from B Stairs](https://csnades.gg/vertigo/molotovs/pillar-from-b-stairs) | Jump + LMB | 2.350 s; vertigo-molotov-MhXEFJqHF9 | 2023-12-08T16:18:23.424Z |
| vertigo | CT | Molotov | [Ramp from Crane](https://csnades.gg/vertigo/molotovs/ramp-from-crane) | LMB | 1.508 s; vertigo-molotov-NxSHrm3gRj | 2024-03-21T03:40:30.848Z |
| vertigo | T | Molotov | [Sidewalk from Ladder](https://csnades.gg/vertigo/molotovs/sidewalk-from-ladder) | Jump + LMB | 5.600 s; vertigo-molotov-FaEdGwC7yV | 2024-09-08T23:47:20.025Z |
| vertigo | CT | Molotov | [T Mid from Sandbags](https://csnades.gg/vertigo/molotovs/t-mid-from-sandbags) | LMB | 2.350 s; vertigo-molotov-5TooLtgC27 | 2023-12-08T16:18:44.394Z |
| vertigo | T | Molotov | [Triple from B Stairs](https://csnades.gg/vertigo/molotovs/triple-from-b-stairs) | LMB | 2.350 s; vertigo-molotov-Xqoq5mQWUs | 2023-12-08T16:18:08.513Z |
| vertigo | T | Molotov | [Wood from B Stairs](https://csnades.gg/vertigo/molotovs/wood-from-b-stairs) | LMB | 1.508 s; vertigo-molotov-xtTrNX5b7Q | 2024-03-20T17:46:09.481Z |
| vertigo | T | Smoke | [A Conn from Mid](https://csnades.gg/vertigo/smokes/a-conn-from-mid) | Walk + LMB | 4.800 s; vertigo-smoke-s2EG2EtZWU | 2023-12-08T16:19:38.711Z |
| vertigo | T | Smoke | [A Entry from Tarp](https://csnades.gg/vertigo/smokes/a-entry-from-tarp) | Jump + LMB | 2.350 s; vertigo-smoke-EkYjo3n3Dj | 2023-12-08T16:19:49.027Z |
| vertigo | CT | Smoke | [A Ramp from A Conn](https://csnades.gg/vertigo/smokes/a-ramp-from-a-conn) | Run + LMB | 2.350 s; vertigo-smoke-OCWUxlteIP | 2023-12-08T16:17:38.271Z |
| vertigo | CT | Smoke | [A Ramp from CT Mid](https://csnades.gg/vertigo/smokes/a-ramp-from-ct-mid) | Run + LMB | 2.350 s; vertigo-smoke-u2AcCDRYoM | 2023-09-14T23:31:15.575Z |
| vertigo | T | Smoke | [A Site from Ramp](https://csnades.gg/vertigo/smokes/a-site-from-ramp) | Walk + Jump + LMB | 2.499 s; vertigo-smoke-LZ7w8nAhRU | 2023-09-14T23:25:27.023Z |
| vertigo | T | Smoke | [A Site from T Spawn](https://csnades.gg/vertigo/smokes/a-site-from-t-spawn) | Jump + LMB | 2.350 s; vertigo-smoke-TEYNbRIHID | 2023-12-08T16:18:31.550Z |
| vertigo | T | Smoke | [A Site Left from Ramp](https://csnades.gg/vertigo/smokes/a-site-left-from-ramp) | Jump + LMB | 2.366 s; vertigo-smoke-ynNaNJ7Ga9 | 2023-12-08T16:19:00.169Z |
| vertigo | T | Smoke | [A Site Right from Ramp](https://csnades.gg/vertigo/smokes/a-site-right-from-ramp) | LMB | 2.350 s; vertigo-smoke-cOpgHeMF27 | 2023-12-08T16:20:05.545Z |
| vertigo | T | Smoke | [B Connector from Mid](https://csnades.gg/vertigo/smokes/b-connector-from-mid) | LMB | 2.350 s; vertigo-smoke-IeKwajySMF | 2023-12-08T16:18:56.756Z |
| vertigo | T | Smoke | [B Cross from Stairs](https://csnades.gg/vertigo/smokes/b-cross-from-stairs) | LMB | 3.816 s; vertigo-smoke-PQ1pgZ84Kb | 2023-12-08T16:17:32.308Z |
| vertigo | T | Smoke | [B Cross from T Spawn](https://csnades.gg/vertigo/smokes/b-cross-from-t-spawn) | LMB | 2.350 s; vertigo-smoke-0rGQhkDC5z | 2023-12-08T16:17:41.115Z |
| vertigo | T | Smoke | [B Headshot from Stairs](https://csnades.gg/vertigo/smokes/b-headshot-from-stairs) | LMB | 2.350 s; vertigo-smoke-eFNgTkYBaM | 2023-12-08T16:17:43.889Z |
| vertigo | CT | Smoke | [B Main from CT Spawn](https://csnades.gg/vertigo/smokes/b-main-from-ct-spawn) | LMB | 2.350 s; vertigo-smoke-oUEmuLqsn5 | 2023-12-08T16:19:31.852Z |
| vertigo | CT | Smoke | [B Main from CT Spawn](https://csnades.gg/vertigo/smokes/b-main-from-ct-spawn-b) | LMB | 2.350 s; vertigo-smoke-F4Byo6FWod | 2024-01-18T04:41:58.985Z |
| vertigo | CT | Smoke | [Bottom B Main from B Site](https://csnades.gg/vertigo/smokes/bottom-b-main-from-b-site) | Walk + LMB | 2.350 s; vertigo-smoke-0cna4sznKf | 2023-12-08T16:19:11.152Z |
| vertigo | CT | Smoke | [Bottom Ramp from Elevator](https://csnades.gg/vertigo/smokes/bottom-ramp-from-elevator) | Run + LMB | 2.350 s; vertigo-smoke-Hys7uCz0Qx | 2024-05-28T15:43:09.757Z |
| vertigo | CT | Smoke | [Crane from A Site](https://csnades.gg/vertigo/smokes/crane-from-a-site) | LMB | 2.366 s; vertigo-smoke-GtVlFr6AV1 | 2023-12-08T16:20:01.321Z |
| vertigo | T | Smoke | [CT from Mid](https://csnades.gg/vertigo/smokes/ct-from-mid) | LMB | 2.350 s; vertigo-smoke-i7KNkUQ8kz | 2023-12-08T16:19:42.036Z |
| vertigo | T | Smoke | [CT Spawn from Stairs](https://csnades.gg/vertigo/smokes/ct-spawn-from-stairs) | LMB | 2.350 s; vertigo-smoke-cdq3ldLxa3 | 2023-12-08T16:19:21.537Z |
| vertigo | T | Smoke | [EBox from B Stairs](https://csnades.gg/vertigo/smokes/ebox-from-b-stairs) | LMB | 2.416 s; vertigo-smoke-kLpQfwtnrZ | 2023-09-14T23:16:06.269Z |
| vertigo | T | Smoke | [Elevator from Ramp](https://csnades.gg/vertigo/smokes/elevator-from-ramp) | Run + Jump + LMB | 2.350 s; vertigo-smoke-9hmj4yj4R3 | 2024-03-04T23:26:34.672Z |
| vertigo | T | Smoke | [Front Elevator from Ramp](https://csnades.gg/vertigo/smokes/front-elevator-from-ramp-a) | Jump + LMB | 2.350 s; vertigo-smoke-tpGDzrmtUP | 2024-05-28T01:03:18.407Z |
| vertigo | T | Smoke | [Front Elevator from Ramp](https://csnades.gg/vertigo/smokes/front-elevator-from-ramp-b) | Jump + both buttons (LMB + RMB) | 2.350 s; vertigo-smoke-MPtQAQhFSg | 2024-05-28T01:07:22.217Z |
| vertigo | T | Smoke | [Generator Left from Mid Iron](https://csnades.gg/vertigo/smokes/generator-left-from-mid-iron) | Crouch + LMB | 2.350 s; vertigo-smoke-6uslwKvIeA | 2023-12-08T16:18:20.228Z |
| vertigo | T | Smoke | [Generator Left from Stairs](https://csnades.gg/vertigo/smokes/generator-left-from-stairs) | Crouch + Jump + LMB | 2.350 s; vertigo-smoke-dYZc5WmSg0 | 2023-12-08T16:18:00.424Z |
| vertigo | T | Smoke | [Generator Left from Stairs](https://csnades.gg/vertigo/smokes/generator-left-from-stairs-b) | Jump + LMB | 2.350 s; vertigo-smoke-7i9hAxSqdw | 2023-12-08T16:19:07.423Z |
| vertigo | T | Smoke | [Generator Left from T Spawn](https://csnades.gg/vertigo/smokes/generator-left-from-t-spawn) | Jump + LMB | 2.350 s; vertigo-smoke-a4G5X7OX8f | 2023-12-08T16:18:34.681Z |
| vertigo | T | Smoke | [Generator Right from T Spawn](https://csnades.gg/vertigo/smokes/generator-right-from-t-spawn) | Jump + LMB | 2.350 s; vertigo-smoke-d4Fi8e5fMw | 2023-12-08T16:17:19.892Z |
| vertigo | T | Smoke | [Headshot from A Ramp](https://csnades.gg/vertigo/smokes/headshot-from-a-ramp) | LMB | 3.866 s; vertigo-smoke-fgahXx0KyV | 2023-12-08T16:19:35.477Z |
| vertigo | T | Smoke | [Heaven from Ramp](https://csnades.gg/vertigo/smokes/heaven-from-ramp) | Jump + LMB | 2.366 s; vertigo-smoke-5EXvkuPydU | 2024-03-20T04:10:45.889Z |
| vertigo | T | Smoke | [Heaven from Ramp](https://csnades.gg/vertigo/smokes/heaven-from-ramp-b) | Jump + LMB | 2.350 s; vertigo-smoke-p7fOlTmomB | 2024-05-28T15:40:32.253Z |
| vertigo | CT | Smoke | [Mid from CT](https://csnades.gg/vertigo/smokes/mid-from-ct) | Jump + LMB | 2.350 s; vertigo-smoke-ECkJMakj5x | 2023-12-08T16:19:28.722Z |
| vertigo | T | Smoke | [Ramp Lurk from Bridge](https://csnades.gg/vertigo/smokes/ramp-lurk-from-bridge) | LMB | 2.366 s; vertigo-smoke-7aaSJs7qds | 2024-03-20T17:37:46.368Z |
| vertigo | T | Smoke | [Sidewalk from T Spawn](https://csnades.gg/vertigo/smokes/sidewalk-from-t-spawn) | Jump + LMB | 2.350 s; vertigo-smoke-27bmxMi0pS | 2023-12-08T16:17:17.469Z |
| vertigo | T | Smoke | [Sniper's Nest from Ramp](https://csnades.gg/vertigo/smokes/snipers-nest-from-ramp) | LMB | 2.350 s; vertigo-smoke-p4Sgmzaaw1 | 2023-12-08T16:19:25.346Z |
| vertigo | T | Smoke | [Sniper's Nest from Tarp](https://csnades.gg/vertigo/smokes/snipers-nest-from-tarp) | Jump + LMB | 2.350 s; vertigo-smoke-eya1wSKuCZ | 2023-12-08T16:19:18.340Z |
| vertigo | CT | Smoke | [Tarp from A Site](https://csnades.gg/vertigo/smokes/tarp-from-a-site) | LMB | 2.350 s; vertigo-smoke-qMX7mv9E5v | 2023-12-08T16:19:53.584Z |
| vertigo | CT | Smoke | [Top A Ramp from Heaven](https://csnades.gg/vertigo/smokes/top-a-ramp-from-heaven) | Jump + LMB | 2.350 s; vertigo-smoke-T7wlpObMtB | 2023-12-08T16:17:08.101Z |
| vertigo | T | Smoke | [Top Mid from Mid](https://csnades.gg/vertigo/smokes/top-mid-from-mid) | Run + Jump + LMB | 2.350 s; vertigo-smoke-MdynVcVs2e | 2023-12-08T16:19:45.584Z |
