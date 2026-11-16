# Utility Lab

Public website: **[utilitylab.au](https://utilitylab.au)**, hosted on Cloudflare Pages. Local development remains available at **http://127.0.0.1:5180**.

A local-first Counter-Strike 2 planning workspace: tactic board, map-based photo/video lineups and local statistics, with Playbooks staged as Coming soon.

## Start the local release

Install Node.js **22.13 or newer**, then run from this folder in PowerShell:

```powershell
.\Start-UtilityLab.ps1
```

The launcher installs dependencies if needed, builds the app and serves it at **http://127.0.0.1:5180**. Keep the terminal open; press **Ctrl+C** to stop. The first dependency installation needs internet access.

For manual setup:

```sh
cd utility-lab
npm ci
npm run build
npm start
```

Public releases use a verified filtered static artifact uploaded to Cloudflare Pages. The complete application source is maintained in the [public repository](https://github.com/Minhhh13/utility-lab); a Git push and a Cloudflare deployment are separate release steps. Current hosting checks and limitations are recorded in the [verification record](utility-lab/docs/verification.md).

## Included

- Eight maps and 10 floor views, with a full-canvas tactic editor, recoverable drafts, named tactics and JSON/PNG transfer. Smooth freehand strokes form one undo action each; text is edited directly on the board. Pen and arrow colours are selectable, and arrowheads follow their shaft colour.
- **1,504 complete photo-and-video entries** from 1,424 source pages drive map-only browsing, with no normal right sidebar or location list. Fixed neutral 36px group markers use real utility glyphs. The map asks only for choices that exist: a group with one available utility and one exact destination goes straight to standing pins; one utility with several destinations shows landing pins directly. A multi-utility group opens its radial, then shows landing pins only if the chosen utility has several destinations. Overview markers hide while the radial is open. Photos open only after you select a standing pin. All distinct registered landings remain available; the limit of four applies only to standing recipes for a chosen landing. Choosing utility, landing and standing pins, opening photos, and returning to targets preserve the current zoom and pan on the same floor. Manual wheel/pinch zoom still reaches 4×, with pan and Fit controls available. Combine filters; clearing the last selection restores All.
- Position and aim images appear directly in Utility Lab's own bounded viewer, with stable fit, swiping, labelled steps, zoom, source-confirmed aim markers and visible throw keys. Every published entry has standing/aim photos, explicit throw inputs and a matching small Video tab. Source websites are not embedded.
- The viewer's Save star and ellipsis menu preserve favorites, Copy lineup link, Download lineup and Make my own. Personal guides also expose Edit personal lineup and Delete your lineup; saving an edit reopens its viewer.
- Lineups controls float over a larger map canvas, with responsive utility/filter docks. Photo zoom buttons sit together, and the mouse wheel or trackpad zooms around the pointer from 100–400%. The header has no Local workspace badge or green status dot.
- A small **Suggest lineup** action stores up to 50 suggestions locally and exports JSON. It does not submit to a backend. Personal records and uploaded media retain their portable files and direct links.
- Playbooks is greyed out and marked **Coming soon**. Existing round-plan data remains in local storage and workspace backups.
- Filtered local statistics, four accent palettes, Light/Dark/System appearance, workspace backups and an all-maps offline action.
- A compact **Display settings** menu groups In-game view, persistent **Auto / 16:9 / 4:3** desktop frames and **Hide top bar**. A floating 44px **Show top bar** control restores the header. Narrow phones fit automatically; map geometry and editing state stay intact. Home stays full-screen; the saved ratio applies to the working tabs.
- A responsive web app and a prepared Capacitor iOS project. The native project has not been compiled or signed.
- Three pixel recreations of Dust from original CS, Source and early CS:GO, selected through the top bar, with rising lane smoke, windblown sand, drifting dust and short workspace fades. A restored route symbol is shared across the app and installation icons.

Your browser keeps the workspace. The public site, `127.0.0.1:5180`, `localhost:5180` and development each have separate storage. To transfer local work to the public site, use **Workspace settings → Export workspace** at the old URL, then **Import backup** at the new URL. Keep a backup before clearing browser data. Uploaded photos are included in portable exports. The offline photo pack includes 420 bundled images; original source-hosted galleries and videos require internet. Photos and clips load only when requested, and map catalogues load one at a time. See the [current source and coverage inventory](utility-lab/docs/expanded-catalogue.md).

The eight Compendium guides show three source-panel views plus the full original composite. These views preserve original floor boxes and annotations; they are not additional captures. The 223 older creator-video records remain available through existing deep links, outside the primary photo-map catalogue.

All 1,504 published entries have source-backed target-area pins. Publisher destination coordinates are registered to the displayed artwork, with explicit floor reviews. Original media decoding and browser playback have been checked; the sources are not independent validation of throws on the current game build. Actual Steam-overlay and physical iPhone behavior remain unverified.

This update uses online sources and project files only. Utility Lab does not launch CS2, access its installation or interact with gameplay.

![Utility Lab fullscreen entry](utility-lab/docs/preview-home.png)

See the [application guide](utility-lab/README.md), [local release instructions](utility-lab/docs/local-release.md), [product scope](PRODUCT.md), [design system](DESIGN.md), [creator sources](utility-lab/docs/lineup-sources.md) and [verification record](utility-lab/docs/verification.md).

The custom domain is verified with HTTPS. The former [pages.dev address](https://utility-lab-8b0.pages.dev) remains available for workspace exports; [domain setup and backup transfer](utility-lab/docs/custom-domain.md).
