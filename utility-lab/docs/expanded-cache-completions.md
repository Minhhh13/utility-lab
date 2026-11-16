# Cache CT Flash and HE completions

Checked **10 November 2026 (Sydney)**, using public online sources only. Export: `EXPANDED_CACHE_COMPLETIONS` in `src/data/expanded-cache-completions.ts`. No CS2, Steam, game installation or gameplay access was used; nothing was pushed or deployed.

## A Main flash from Electro

The [official NadesDB Cache flash page](https://nadesdb.com/cache/flashbangs/) explicitly lists this as its CT-side flash. The [exact public guide](https://app.nadesdb.com/maps/cache?nade=41360a2b-812f-433c-9e94-c23651fc3757) identifies creator **JohnWeak**, team `ct`, technique `left`, movement `walking`, and `jumpthrow: false`. The anonymous app returned `auth/me: null`; only its public guide responses were read.

Its original Stand, Aim and Result images are referenced directly on `media.nadesdb.com`, reordered Position → Aim → Result. All three decoded in a normal localhost viewer. The exact published MP4 returned `200 video/mp4`, decoded at 1440 × 1080 with duration 6.317 seconds, and advanced during muted playback before being paused. The app therefore shows **Walk + LMB**, without a jump input.

Evidence: `outputs/expanded-cache-completions/nadesdb-ct-flash-source.json`, `nadesdb-ct-flash-media-audit.json` and `nadesdb-dom.json`. The source's normalized standing and landing coordinates are retained there for radar registration; the exported record leaves its pin hidden until registered.

## Boost HE from White Box

**NartOutHere's** [published Cache guide at its Boost HE chapter](https://www.youtube.com/watch?v=5gbIC3igve8&t=396) supplies all three frames and the matching video. Source narration instructs getting onto the cable spool by White Box, aiming at the ladder, then using a left click. The short release cue is “then left click throw.” Two local speech-recognition models independently returned that cue from the actual public video-element audio. No microphone, desktop/system audio or game capture was used.

The jump is the setup action onto the spool, **not a jumpthrow at release**. The app's throw keys are therefore **LMB**; its steps separately explain the setup jump. Source frames around 388–392 seconds and after 405 seconds depict other throws and are not mixed into this guide.

| View | Actual source time | Evidence |
| --- | ---: | --- |
| Position | 398.132 seconds | Settled first-person view on the spool after the setup jump |
| Aim | 399.127 seconds | The publisher's ladder/crosshair detail from the same throw |
| Result | 402.125 seconds | The same HE's Boost target/landing area |

These clean 1280 × 720 JPEGs contain only the original decoded video frame, without website chrome or added markers. They live in `public/lineup-media/source-video-stills/cache-completions/`. Every photo retains creator and exact chapter credit. `published-stills-manifest.json` records source ID, actual times, dimensions and extraction paths. The full source video opens at **396 seconds**.

## Validation and limits

`completion-validation.json` records six image decodes and actual normal embedded Play-button playback of the HE clip at the requested chapter, with the exact video ID and advancing time. The Flash has separate positive native-player playback evidence. Neither guide is paired with a different variant or relabelled from a T-side source.

Remote NadesDB media stays on its original HTTPS host and needs internet. The Nart images are attributed stills derived from the public clip; no new media licence is asserted. Source capture/build dates and current-game accuracy are not invented. These guides complete otherwise missing source combinations; they are not a claim to contain every possible Cache throw.
