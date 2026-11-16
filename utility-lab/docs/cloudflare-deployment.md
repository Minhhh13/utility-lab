# Cloudflare delivery

Utility Lab is published at **[utilitylab.au](https://utilitylab.au)**. The existing Cloudflare Pages project is `utility-lab`, with production branch `main`. The Porkbun-registered custom domain is connected to this existing project; www redirects to the apex. See [domain setup](custom-domain.md). Local development remains available at http://127.0.0.1:5180.

## Latest verified release — 16 November 2026

Production deployment `6e7a19c7-194f-4da3-967a-83ce79fc149d` serves the compact Lineups canvas, grouped photo zoom controls and pointer-centered wheel zoom. The Local workspace label and green dot are removed. Cloudflare records source commit `de86a535b23e9f7eae6f3e61484412e222fdd142` on `main`, with a clean deployment source. The complete application source has been pushed to the public GitHub repository.

The release contains 517 verified static files. The complete release checks pass: 147 model tests, 147 Edge browser tests and five WebKit tests, with two existing browser cases skipped. Post-deployment checks on **utilitylab.au itself** confirm the new desktop and 320px phone canvas, badge removal, combined filters, map wheel/Fit, photo wheel/Fit, aim marker, adjacent zoom buttons and separate Video tab. No application JavaScript errors were observed; www still redirects to the canonical HTTPS domain. Machine evidence and screenshots are in ignored `outputs/compact-lineups/`.

## Release workflow

The public deployment uses a filtered, verified static package rather than the repository root or unfiltered build. The package excludes unused maps, discarded landscapes, local output, credentials and server source. Deployment does not push Git commits or upload browser workspace records.

From the application folder:

```powershell
npm run check:local
node --experimental-strip-types scripts/package-local.mjs > outputs/releases/latest-package.json
npm run prepare:cloudflare
$prepared = Get-Content outputs/cloudflare/latest-prepared.json -Raw | ConvertFrom-Json
npx --yes wrangler@4.159.0 pages deploy $prepared.directory --project-name utility-lab --branch main --commit-dirty=true
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
