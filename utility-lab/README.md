# Utility Lab

Public website: **[utilitylab.au](https://utilitylab.au)**, hosted on Cloudflare Pages. Local development remains at **http://127.0.0.1:5180**.

A local-first Counter-Strike 2 planning app for desktop and phone-sized screens, with a compact in-game view, a fullscreen pixel-art entry, a tactic board, map-based lineups and local statistics. Playbooks is staged as Coming soon.

The launch screen offers three pixel recreations of Dust: original Counter-Strike (1999), Counter-Strike: Source and early CS:GO. Its compact selector sits in the top bar, remembers the choice and loads only the selected scene. Subtle drift, light, smoke and dust animate the artwork; reduced motion makes it static and hidden pages pause it. Workspace changes use short, interruptible opacity fades, while keyboard navigation and editing stay immediate.

The former [pages.dev address](https://utility-lab-8b0.pages.dev) remains available for saved-work exports. See [domain setup and backup transfer](docs/custom-domain.md).

## Run locally

Requires Node.js **22.13 or newer**. From this folder:

```sh
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:5180** and keep the terminal running. Press **Ctrl+C** to stop. The root PowerShell launcher, `..\Start-UtilityLab.ps1`, performs the same setup and builds before starting.

`npm start` serves only the built `dist` files, using a read-only Node server with gzip, cache headers and a loopback default. The public Cloudflare release was uploaded directly from the verified filtered static artifact; this did not push the current working tree to the [existing public repository](https://github.com/Minhhh13/utility-lab). See [local release instructions](docs/local-release.md) for ports, phone access and backup transfer.

Utility Lab does not launch Counter-Strike, write game configuration, inject software or read live game state. Its runtime is the website and local web server.

For development and checks:

```sh
npm run dev
npm run catalogue:build
npm test
npm run build
npm run test:browser
npm run test:webkit
npm run check:local
```

The development URL printed by Vite has its own browser storage. Production builds regenerate validated per-map JSON from the audited source exports before compiling. Browser tests use isolated contexts, installed Microsoft Edge and a separate phone-sized WebKit suite. The default suite manages production servers on 4173 and 5180. Install the Playwright WebKit runtime before running its separate configuration. Results and exact limits are recorded in [verification](docs/verification.md).

## Workspaces

**Tactic board.** Place T/CT players, smoke, flash, molly and HE; draw routes, continuous freehand strokes and labels. Coalesced pointer samples keep pen strokes smooth, with one undo action per stroke. Pick pen/arrow ink; selected strokes recolour in one undo step, and arrowheads match their shaft. Text edits inline: Enter or blur saves it, Escape cancels, and the inspector stays closed. Use undo/redo, keyboard placement/nudging, exact coordinates and route endpoints. Per-map/floor drafts recover locally. Save named tactics, import/export JSON, export PNG or use a custom local radar. Operational maps have no decorative animation.

**Lineups.** The complete library contains **1,504 photo-first entries from 1,424 source pages**. All eight maps have T/CT options for all four utility types. Normal browsing uses the full map, with no right sidebar or reference/location list. Nearby areas share fixed 36px neutral-circle markers containing real grenade glyphs. Main markers have no pastel pie sectors, offset grid or connector lines. Selection asks only for necessary choices after active filters. One available utility and one exact destination go straight from the group to standing pins; one utility with several destinations shows landing pins directly. A multi-utility group opens its radial; choosing a type shows landing pins only if several exact destinations exist, otherwise it shows standing pins. The overview-marker layer hides during the radial, and the old overlapping chooser hint is removed. Photos open only after selecting a standing pin, even when there is a single start. Every landing point remains available; only the later standing recipe choices are limited to four. Group, utility, landing and standing selections, opening photos, and returning to targets preserve the current zoom and pan on the same floor. Manual wheel/pinch zoom remains available to 4×, with pan and Fit controls. Changing map or floor context retains its normal fitting behavior. Combine filters; clearing the last selection restores All. Saved guides and existing links retain their full records. Search, Site, Media and practice-target controls are absent. See [map flow](docs/compact-overview.md), [photo coverage](docs/photo-coverage.md) and [origin evidence](docs/lineup-origins.md).

The **223 older creator-video records from 57 primary sources** remain available through existing deep links and record resolution, outside the primary photo-map catalogue. Their attribution and chapter offsets are retained; see [creator sources](docs/lineup-sources.md).

Selecting a lineup opens Utility Lab's own bounded-height viewer with **Photos first**. It fits the standing photo, then aim and throw/result references where supplied, while keeping the throw keys visible. Labelled steps, arrow keys, touch swipes and zoom/pan work inside the viewer. Fixed-frame measurement prevents fit/scrollbar feedback. Source-confirmed crosshairs remain aligned with the photo while zooming and panning. A combined original reference stays labelled **Position & aim**. Each of the eight Compendium guides shows three source-panel views plus the full original Overview. The original floor boxes and annotations stay intact; panel views are not extra captures. Complete source websites are not embedded, and every photo keeps its creator/source credit.

The viewer header's **Save** star keeps favorites. Its ellipsis menu offers **Copy lineup link**, **Download lineup** and **Make my own**. Personal guides expose **Edit personal lineup** and **Delete your lineup**. The editor opens only for an explicit personal-edit action; saving reopens the guide viewer. Personal records can travel through exported files or a workspace backup without restoring a reference list to normal browsing.

The current collection references **4,597 unique images**. Original HTTPS photos stay on their source servers and require internet. Credited source-video stills provide standing views where the original guide does not publish a separate photo. The **420-image bundled pack** can be cached explicitly for offline viewing; source-hosted galleries are not copied into it. All new frame captures retain original source, timestamp and review evidence. See [expanded source inventory](docs/expanded-catalogue.md) and [coverage](docs/photo-coverage.md).

**Every primary published entry offers a matching Video tab** beside Photos. Native HTTPS clips use the app's controls; exact YouTube players retain source chapter offsets. A verified same-guide YouTube alternative is used if an original file clip fails, where published. Nothing autoplays. Older incomplete photo references remain available through their archive links, with unavailable video choices disabled.

The small **Suggest lineup** action replaces the header Import/Add buttons. Suggestions stay in a local queue of up to 50 items and can be exported as JSON; nothing is submitted to a backend.

Personal lineup records support instructions, a map position, throw methods, creator/source links and up to four captioned, reorderable photos. Uploaded images are resized locally and checked against file/combined-photo limits; source images can be up to 8 MB each before preparation. Form recovery, draft export, legacy record validation and workspace-backup transfer remain supported. Uploaded photos travel as actual bytes in exports; remote gallery images remain URL references. **LMB + RMB** means holding both mouse buttons together and releasing them together; jump and movement timing are separate instructions.

Direct lineup links retain map, level, side and record selection. A personal lineup must already exist on the receiving browser; a workspace backup can transfer it and its uploaded photos. A URL alone does not transfer personal photos or records.

Creator demonstrations are not independent validation against the current game build; map pins identify target callout areas. Source dates, evidence and limitations are documented separately from the short in-app instructions. See [creator sources and content limits](docs/lineup-sources.md).

**Playbooks.** Marked **Coming soon** and greyed out on Home and in navigation. Direct links show a placeholder. Existing plans, linked records, models and portable backup data are retained for development; the editor is not exposed in this release.

**Stats.** Filter saved workspace counts and coverage by map, side and utility. Map/side scope tactics and lineups; utility scopes lineups and placements. Playbooks shows the device total. The figures come from browser records, not Steam/FACEIT match history or player performance.

## Maps and appearance

The picker contains the Active Duty/FACEIT pool union checked on 9 November 2026: **Mirage, Dust II, Inferno, Nuke, Ancient, Anubis, Cache and Vertigo**. Nuke and Vertigo have upper/lower views, giving **10 selectable levels**. Historical assets elsewhere in the repository are not extra picker entries.

Use **Display settings** for the compact **In-game view**, persistent **Auto / 16:9 / 4:3** desktop frames and **Hide top bar**. A floating 44px **Show top bar** button restores the header. Narrow phones fit automatically and retain the desktop frame preference. Frame and header changes preserve map geometry and editor state; In-game view changes only the website layout. Home stays full-screen; the saved ratio applies to the working tabs.

Choose **Light**, **Dark** or **System**, with **Cobalt**, **Ember**, **Mint** or **Rose**. Semantic tokens apply to the shell, board, canvas, inspector and supporting workspaces. Manrope is self-hosted.

## Local data, backups and offline use

Saved records, board drafts, favorites, form recovery and appearance preferences use browser storage; saved photo bytes use IndexedDB rather than large localStorage strings. Older inline-photo records remain readable. Nothing syncs automatically between browsers or devices, and no account, analytics or remote collaboration backend is included.

Storage belongs to an exact **origin**. The public Cloudflare URL, `127.0.0.1:5180`, `localhost:5180`, port 5173 and a phone each have different workspaces. Before changing URLs or clearing browser data, open **Workspace settings → Export workspace**. Import the resulting JSON at the new URL. Backups include saved tactics, personal lineups and their photos, retained playbooks, saved references, board drafts/custom radars and appearance. Save unfinished personal lineup forms first. Import previews the contents and merges them; existing records/drafts stay, conflicting records become copies, and appearance is optional.

Under **Workspace settings**, use the offline actions to cache all supported maps, launch artwork and the 420 bundled guide images. The production service worker also caches the app shell and route assets. Wait for the completion message before disconnecting. Uploaded photos stay local. Remote gallery images remain online references in backups and are not saved by the offline action; those images and creator videos need internet. Development mode does not register this worker. Browser storage can be cleared or evicted, so keep exported backups of important work.

## iPhone and native iOS

The responsive web app includes a manifest and Home Screen icons. Normal installable/offline web-app use outside localhost needs HTTPS. Plain HTTP LAN access is useful for trying the phone layout while the local server is running.

The [Capacitor iOS project and native setup guide](ios/README.md) are included. Native export code uses Filesystem and Share to prepare the system share sheet; browser exports request a download. The iOS project has not been compiled, signed or verified on hardware. On a supported macOS/Xcode setup:

```sh
npm ci
npm run ios:sync
npm run ios:open
```

Phone-sized WebKit tests do not establish physical iPhone gestures, native share behavior or App Store readiness. Actual Steam overlay performance, physical iPhone playback and regional media-host availability remain separate verification tasks.

## Design and attribution

The redesign uses the installed Apple Design, Emil, TasteSkill and Impeccable guidance and the [requested reference pack](docs/design-references/README.md) and [additional sources](docs/new-design-sources.md). The visual system is recorded in the root [DESIGN.md](../DESIGN.md).

The restored **route symbol** uses the previous three circular nodes and diamond endpoint. The header and favicon have no square border or background; installation icons use the same symbol on their platform icon field. Its colour follows the theme and palette. The name remains Utility Lab.

Original vector minimaps: **[Minimaps by setpos.gg](https://setpos.gg)**, CC BY 4.0. Game radar art remains the property of Valve and map creators. Creator videos remain on their original services with attribution. Manrope's SIL Open Font License is in `public/fonts/Manrope-OFL.txt`; retained third-party skill licenses accompany their references.

Utility Lab is an unofficial fan project, unaffiliated with Valve or MetaStack.
