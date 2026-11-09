# Utility Lab

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

User-approved lightweight React, TypeScript and Vite with static delivery and progressive web app support. A Capacitor iOS project with Swift Package Manager dependencies wraps the shared web code. Project generation and asset sync work locally on Windows; native builds require macOS/Xcode.

## Users and Purpose

Counter-Strike 2 players preparing rounds on desktop or iPhone and looking up utility through the Steam in-game browser. The product combines a tactic board, video/photo lineups, local playbooks and workspace statistics.

## Brand Commitments

The user approved the **Utility Lab** name and logo. MetaStack is the supplied functional reference; its branding and proprietary interface are not copied. The user requested a full UI overhaul and a fullscreen animated pixel-art entry leading to four working destinations.

## Current Scope

- **Tactic board:** a dominant map canvas, grouped tools, players, utility, routes, drawing, text, notes, precise position controls, undo/redo, local saves and JSON/PNG transfer. The inspector starts closed.
- **Maps:** only the union of Active Duty and FACEIT matchmaking pools: Mirage, Dust II, Inferno, Nuke, Ancient, Anubis, Cache and Vertigo. Nuke and Vertigo include upper/lower views, for 10 selectable map levels.
- **Lineups:** T/CT, utility, level, search and saved filtering. Sixteen source-linked creator video examples open at chapter timestamps. Another 68 stored practice references are illustrative and unverified; matching duplicate titles can be suppressed in the interface. Personal lineups support real uploaded photo slides, captions, video/source links, creator attribution and throw methods.
- **Inputs:** “Both buttons” means LMB and RMB pressed together. Instructions must distinguish buttons, movement and jump timing without guessing unobserved inputs.
- **Playbooks:** named local collections of saved tactics and personal/favorited lineup references, with notes and JSON export.
- **Stats:** counts derived from this browser's saved workspace records. There is no Steam/FACEIT account connection, match history or performance-stat backend.
- **Appearance:** Light, Dark or System mode with Cobalt, Ember, Mint and Rose palettes across the shell, board, maps and related workspaces.

## Operating and Delivery Constraints

The current website stays local. Its source repository is public at https://github.com/Minhhh13/utility-lab; publishing source does not deploy the website. Data is stored in the browser and does not sync between devices. Exported files are the current backup/transfer mechanism. Creator videos require network access and load only after a user requests the player.

The native iOS project has not been compiled or signed. Native setup, device testing and distribution require macOS/Xcode and signing decisions.

## Evidence and Product Principles

Real local radar artwork and attributed creator video links are available. Personal aim screenshots come from user uploads; decorative pixel artwork must never substitute for real lineup evidence. Radar markers are approximate navigation aids, not measured grenade footprints or exact aim points. No lineup is independently verified on the current game build merely because it has a video or bundled map.

Keep frequent actions immediate, let the map lead, preserve recoverable editing, and identify local data and verification limits plainly. Physical iPhone, Safari/WebKit, Steam overlay performance and actual external video playback remain unverified until tested in those environments.
