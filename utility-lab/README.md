# Utility Lab

A local-first Counter-Strike 2 tactic board for desktop, the Steam overlay browser, and phone-sized screens. This draft focuses on the board. A utility lineup library and a team playbook are next.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Nothing is deployed by these commands.

```sh
npm test
npm run build
npm run preview
```

`npm run test:browser` builds and runs the desktop, phone, transfer, and offline checks using installed Microsoft Edge. The browser runner manages its own local preview server. Change the configured browser channel if testing on a machine without Edge.

`npm run preview` serves the production build locally. The production build registers a service worker: after the first successful visit, the app shell and visited map artwork can be available offline. An unvisited map still needs a first network load. The development server does not register a worker.

## The board

- 24 playable CS2 map variants and 49 floor/arena views, checked on 9 November 2026.
- Local map artwork, including multiple floors and Rush arenas.
- Player and utility markers, routes, drawing, text, selection and movement.
- Undo/redo, per-map drafts, named local strategies, and tactic file import/export.
- A compact in-game view and responsive phone layout.
- Keyboard tools and position controls for moving without dragging.

The starting Mirage execute is an illustrative, editable plan. It is not a verified grenade lineup. Radar artwork can lag game changes. See [map sources](docs/map-sources.md) for coverage, dates, credits, and asset provenance.

## Your data

Drafts and strategies are saved in this browser's local storage. They do not sync to other browsers, Steam, your phone, or a server. Export important strategies as backup before clearing browser data. Custom radar images are stored locally. There is no account, analytics script, or remote collaboration service.

## iPhone and native iOS

The responsive web app includes a web app manifest and icons. When served over HTTPS, it can be added to the iPhone Home Screen. `capacitor.config.ts` and Capacitor dependencies prepare the shared web code for a later native iOS project. On macOS, after installing Xcode and dependencies:

```sh
npm run build
npx cap add ios
npm run ios:sync
npm run ios:open
```

Signing, device testing, and App Store distribution are separate steps. The current draft is a web board, not an App Store release. Physical iPhone and Steam overlay checks have not yet been run.

## Design sources

The implementation follows the installed Impeccable, Apple Design, and Emil Design Engineering guidance plus the requested [reference pack](docs/design-references/README.md). The [review contract](docs/design-review-guide.md) records measurable checks. The inaccessible Figma skill page was resolved through the canonical Better Interface source.

## Artwork and attribution

Original vector minimaps: **[Minimaps by setpos.gg](https://setpos.gg)**, CC BY 4.0. Game radar artwork belongs to Valve and the respective map creators; it is not covered by any application-source license. Inter is under the SIL Open Font License in `public/fonts/OFL.txt`. Third-party design skill licenses are retained in their reference directories.

This is an unofficial fan project and is not affiliated with Valve or MetaStack. MetaStack is a functional reference; its branding and proprietary content are not copied.
