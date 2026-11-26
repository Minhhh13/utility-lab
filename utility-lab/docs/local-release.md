# Run and keep the local release

The local release runs on your computer. The public website is also available at **[utilitylab.au](https://utilitylab.au)** through the separately authorized [Cloudflare deployment](cloudflare-deployment.md). Running the local launcher does not publish changes, upload workspace data or push source to GitHub.

## From the source folder on Windows

Install Node.js **22.13 or newer**, then open PowerShell in the repository root and run:

```powershell
.\Start-UtilityLab.ps1
```

The launcher installs dependencies only if `node_modules` is absent, builds the production app and starts its read-only server. The first dependency installation needs internet. Open **http://127.0.0.1:5180**, leave the terminal open and press **Ctrl+C** when finished.

For manual startup:

```sh
cd utility-lab
npm ci
npm run build
npm start
```

Opening `dist/index.html` directly is not supported: use the local server so modules, routing and the service worker receive a proper origin.

## Prepared package

Release folder: [utility-lab-local-1.0.0-20261110T074620](../outputs/releases/utility-lab-local-1.0.0-20261110T074620/)  
Archive: [Local release ZIP](../outputs/releases/utility-lab-local-1.0.0-20261110T074620.zip) (94.5 MB)  
Package startup: **double-click `Start-UtilityLab.cmd`**, then open **http://127.0.0.1:5180**.

The generated `utility-lab-local-1.0.0-[stamp]` folder contains built assets, its Node server and a Windows launcher. It needs Node.js 22.13 or newer, but no npm install. From another terminal/platform, run `node scripts/serve-local.mjs` inside the package folder. The package must be served, not opened as a `file://` page.

To create a fresh package from the source application folder, run `npm run package:local`. It builds and writes a timestamped folder under `outputs/releases/`, retaining the configured map pool and active font. It does not publish or upload. The exact generated folder/archive and final test results belong in the [verification record](verification.md).

## Ports and a phone on the same network

Use another port if 5180 is busy:

```powershell
.\Start-UtilityLab.ps1 -Port 5181
```

To try the responsive app on a phone connected to the same network:

```powershell
.\Start-UtilityLab.ps1 -LAN
```

Open one of the same-network URLs printed by the server. The computer must remain awake with the server running. The manual server equivalent is `npm start -- --lan`; add `--port 5181` if needed. The default without `-LAN` listens only on this computer.

Plain HTTP LAN access is for online local browsing. Normal Home Screen/offline web-app installation outside localhost requires HTTPS; the native iOS project is another delivery path and still needs a macOS build. A phone connection does not share the desktop browser's saved workspace automatically.

## Keep and transfer your work

Browser storage belongs to the exact URL origin. **127.0.0.1:5180**, **localhost:5180**, a different port, a development URL and a phone each have separate workspaces. Keep using the same address, or export/import when changing it.

1. Save unfinished personal lineups and playbooks.
2. Open **Workspace settings → Export workspace** at the old URL.
3. Keep the JSON file in a location you control. It contains uploaded photo bytes as well as saved records, favorites, board drafts/custom radars and appearance.
4. Open **Workspace settings → Import backup** at the new URL, review its contents and merge. Existing records and map drafts stay; conflicts become copies. Importing appearance is optional.

Individual tactics, lineups and playbooks can also be exported. Portable playbooks carry linked tactics/lineups and their photos. A personal lineup link selects a record already present on that browser; it does not transfer the record or photos by itself.

Lineup suggestions are saved only on this device. Use the suggestion dialog’s **Export suggestions** to transfer them; they are separate from the workspace backup.

Saved metadata uses localStorage and saved photos use IndexedDB. Clearing site data removes both. Draft recovery helps interrupted editing but does not replace an exported backup.

## Prepare offline maps

Open **Workspace settings** on the production localhost address and select **Download all maps**. The offline package includes supported radars, eight Home map scenes, picker previews and map art credits. **Download photo guides** separately caches bundled lineup photos. Map catalogues are cached when opened. Source-hosted media needs an internet connection unless a previously viewed photo is available in the browser cache. Uploaded photos stay on this device.

Saved tactics can be shared through **Share tactic → Copy code**. Your friend opens the code in their own Utility Lab to preview it, then chooses **Edit a copy**. A code contains the board, notes, floor and optional custom radar; later edits are separate. Nothing is uploaded and no online short-code service is used. Local links work only where the app is running at their address.

If the action says no production worker is active, open the production URL, allow its first load to finish and try again. Vite development mode and plain HTTP phone connections do not provide this offline worker. Browser cache can be evicted; keep backups of important work.

## Native project

The [iOS project guide](../ios/README.md) covers macOS/Xcode preparation. The wrapper, native export helper and privacy manifest are source deliverables; they are not a compiled, signed or App Store-ready application. Phone-sized WebKit checks do not replace hardware testing.
