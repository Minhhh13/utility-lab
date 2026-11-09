# Utility Lab

A local-first Counter-Strike 2 planning app for desktop and phone-sized screens, with a compact in-game view. The user-approved Utility Lab identity now leads into a fullscreen animated pixel-art entry and four working destinations.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. These commands do not deploy the website.

```sh
npm test
npm run build
npm run preview
```

`npm run test:browser` builds the app and runs the isolated browser suite using installed Microsoft Edge. Its runner manages a local production preview. Change the browser channel in `playwright.config.ts` when testing on a machine without Edge. Current results and limits are in [verification](docs/verification.md).

## Workspaces

**Tactic board.** A large map canvas with the inspector initially closed. Place T/CT players, smoke, flash, molly and HE markers; draw routes, freehand strokes and labels. Use undo/redo, keyboard placement/nudging, coordinates and route endpoints. Keep per-map/level drafts, save named tactics, import/export JSON, export PNG, or use a custom local radar.

**Lineups.** Choose a map, level and side, then filter/search by utility or saved references. Sixteen attributed smoke examples link to eight creator videos at selected chapters. Selecting a video/photo lineup opens its media viewer. A YouTube player is created only after **Load video**; playback does not autoplay. Direct HTTPS video files are also supported, and original source links remain available.

Add personal lineups with positions, instructions, throw methods, creator/source links and up to four captioned photos. Photos are prepared locally and bounded to about 2 MB combined; source files can be up to 8 MB each before resizing. Slides have previous/next controls, direct selection and arrow-key navigation. **Both buttons (LMB + RMB)** means pressing the left and right mouse buttons together. Jump/movement variants are separate choices.

The 68 additional practice references contain illustrative targets and checklists, not verified aim points. Creator videos are demonstrations, not independent validation against the installed game build. Approximate map markers do not establish grenade coverage. See [creator sources and limitations](docs/lineup-sources.md).

**Playbooks.** Create named local collections with notes, saved tactics and personal/favorited lineup references. Open saved tactics on the board and export a playbook as JSON.

**Stats.** Inspect counts of saved tactics, personal lineups, playbooks and saved references, map coverage, and utility placements across saved tactics. These figures come from browser records. There is no Steam/FACEIT match-stat connection or backend.

## Maps and appearance

The picker is restricted to the union of Active Duty and FACEIT pools: **Mirage, Dust II, Inferno, Nuke, Ancient, Anubis, Cache and Vertigo**. Upper/lower Nuke and Vertigo produce **10 selectable views**. Other historical assets may remain in the repository but are not picker entries.

Choose **Light**, **Dark** or **System**, and **Cobalt**, **Ember**, **Mint** or **Rose**. Semantic tokens apply across the shell, board, canvas, controls and supporting workspaces. The active UI font is self-hosted Manrope.

## Local data and offline use

Drafts, tactics, lineups, photos, favorites, playbooks and appearance preferences live in this browser's storage. They do not sync between Steam, a desktop browser and an iPhone. Export important records before clearing browser data. Session recovery helps when a board draft cannot be written, but it is not durable storage.

The production service worker caches the app shell, local artwork and visited assets. Unvisited maps may still need an initial online load. Creator videos require network access. The development server does not register the production worker. No analytics, remote collaboration service or account backend is included.

## iPhone and native iOS

The responsive web app includes a manifest and Home Screen icons. HTTPS hosting is needed for normal installable web-app use outside localhost. The [native Capacitor iOS project](ios/README.md) is included with Swift Package Manager dependencies; it has not been compiled or signed.

On macOS with Xcode 26 or newer and the required signing setup:

```sh
npm ci
npm run ios:sync
npm run ios:open
```

Physical iPhone, Safari/WebKit, Steam overlay, native compilation and App Store distribution remain separate verification/delivery work.

## Design and attribution

The redesign draws on the installed Apple Design, Emil, TasteSkill and Impeccable guidance, plus the [requested reference pack](docs/design-references/README.md) and [additional sources](docs/new-design-sources.md). The actual system is recorded in the root `DESIGN.md`.

Original vector minimaps: **[Minimaps by setpos.gg](https://setpos.gg)**, CC BY 4.0. Game radar art remains the property of Valve and the map creators. Creator videos remain on their original services and retain attribution. Manrope's SIL Open Font License is in `public/fonts/Manrope-OFL.txt`; retained third-party skill licenses accompany their references.

Utility Lab is an unofficial fan project, unaffiliated with Valve or MetaStack. The [public source repository](https://github.com/Minhhh13/utility-lab) does not publish or host the website.
