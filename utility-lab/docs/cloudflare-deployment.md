# Cloudflare delivery

Utility Lab is published at **[utilitylab.au](https://utilitylab.au)**. The existing Cloudflare Pages project is `utility-lab`, with production branch `main`. The Porkbun-registered custom domain is connected to this existing project; www redirects to the apex. See [domain setup](custom-domain.md). Local development remains available at http://127.0.0.1:5180.

## Latest verified release — 25 November 2026

Cloudflare Pages reports a successful production deployment on `main` for application commit `ca220422faf352c0c0300b6a9e8d67d64d702d1a`, with a clean source tree. The deployment ID is `2737877e-7863-4221-a4f7-7504158ccf53`. The prepared release contains 583 files totalling 117,863,404 bytes. [Production website](https://utilitylab.au) · [Immutable deployment](https://2737877e.utility-lab-8b0.pages.dev) · [Application commit](https://github.com/Minhhh13/utility-lab/commit/ca220422faf352c0c0300b6a9e8d67d64d702d1a)

The public domain served 103 checked files byte-for-byte, including the HTML entry, all application bundles and map catalogues, the service worker, maps, backgrounds and Ancient source stills. The www host returned a 301 to the apex. A missing asset returned 404. [Release verification](verification.md)

## Earlier release — 25 November 2026

Production deployment `1f17cc40-5a46-480d-ac32-e94955057c88` serves application commit `5bf41586ef922cbdc5003a50aabbaf60c9775044` on `main`, with `commit_dirty: false`. Source changes are pushed to the existing GitHub repository. The [immutable deployment](https://1f17cc40.utility-lab-8b0.pages.dev) and **utilitylab.au** serve the checked 575-file / 115,180,083-byte static artifact.

The release adds 53 source recipes, improves 16 existing guides, retains all origin choices, moves desktop controls to the map edges and adds subtle pointer feedback and bounded browser photo caching. All 386 automated tests pass: 172 model, 183 Edge and 31 WebKit. All 575 packaged HTTP asset hashes match. Eight public functional groups, three real-photo WebKit cache checks and live artifact/redirect/404 checks also pass, with actual sampled native and Camera YouTube playback. Cloudflare's canonical deployment, production branch and exact source commit were read back through the connected API. [Detailed verification](release-2026-11-25.md).

## Previous verified release — 16 November 2026

Production deployment `c39dd969-a0fd-4e29-8cae-2866af0f8da2` serves the larger photo dialog, full-edge interactive map canvas and smaller Back to targets text. The compact Lineups controls, photo wheel zoom and removed workspace badge remain. Cloudflare records source commit `d93a9e966054973976bae98980857947d3f212d0` on `main`, with a clean deployment source. The application changes have been pushed to the public GitHub repository.

The release contains 517 verified static files. The complete release checks pass: 147 model tests, 158 Edge browser tests and five WebKit tests, with two existing browser cases skipped. Twenty-two additional WebKit cases cover the new viewer/canvas and retained wheel zoom. Ten post-deployment verification groups on **utilitylab.au itself** confirm full-edge SVG input with the header shown/hidden, unchanged selection camera, 12px Back text with a 44px hit target, a fully contained 799px-high landscape photo at 1920×1080, reachable controls/keys, combined filters, photo wheel/Fit, aim marker and the separate Video tab. No application JavaScript errors were observed; www still redirects to the canonical HTTPS domain. Machine evidence and screenshots are in ignored `outputs/full-canvas/`.

## Release workflow

The public deployment uses a filtered, verified static package rather than the repository root or unfiltered build. The package excludes unused maps, discarded landscapes, local output, credentials and server source. Deployment does not push Git commits or upload browser workspace records.

From the application folder:

```powershell
npm run check:local
node --experimental-strip-types scripts/package-local.mjs > outputs/releases/latest-package.json
npm run prepare:cloudflare
$prepared = Get-Content outputs/cloudflare/latest-prepared.json -Raw | ConvertFrom-Json
$sourceCommit = git rev-parse HEAD
npx --yes wrangler@4.159.0 pages deploy $prepared.directory --project-name utility-lab --branch main --commit-hash $sourceCommit --commit-dirty=false
```

`prepare:cloudflare` requires successful production checks, compares every packaged asset with the current build using SHA-256, checks file limits and copies the tested security headers and static 404 page. The final release and live verification are recorded in [verification.md](verification.md); machine-readable deployment evidence stays under ignored `outputs/cloudflare/`.

The Pages project already exists. Future updates use `pages deploy`; do not create another project, use `--force`, migrate hosting or enable paid resources as routine maintenance. The initial direct upload preserved the locally modified working tree without pushing it to GitHub.

## Delivery behavior

HTTPS serves the app with the same Content Security Policy as the local production server. HTML and service-worker manifests revalidate; hashed JavaScript and CSS use immutable caching. Missing assets return a genuine 404. Remote reference photos and videos remain on their original hosts and load on demand.

The service worker updates the installed app on a later visit/reload. If an already open tab still shows an earlier interface, refresh it. Do not clear site data as an update step: doing so removes local saves and uploaded photos.

Browser storage belongs to each origin. The public address, an immutable deployment address, localhost, another browser and an iPhone have separate workspaces. Use **Workspace settings → Export workspace** at the old address, then **Import backup** at the new one to transfer saved records and uploaded photos. Publishing provides no automatic account sync.

## Cloudflare agent setup

The user-requested [official agent setup instructions](https://developers.cloudflare.com/agent-setup/prompt.md) were fetched and applied. Cloudflare's 22 skills were installed in the universal agent skills directory. The `cloudflare` remote MCP server is configured at `https://mcp.cloudflare.com/mcp`, and its separate Codex OAuth login completed. Wrangler's deployment login also completed through device authorization after the original localhost callback expired.

The configured Cloudflare MCP connection is available in Codex and was used to connect the custom domain. Credentials remain in the tools' own local credential stores and are excluded from the app and deployment artifacts.

## Boundaries

The website runs independently of CS2. This release uses project files and public online reference media only; it does not launch the game, access its installation, change configuration, inject software or inspect live gameplay. Native iOS compilation/signing, physical iPhone testing and the actual Steam overlay browser remain separate verification work.
