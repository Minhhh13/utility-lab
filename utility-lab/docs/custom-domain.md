# Utility Lab domain

Verified **11 November 2026 (Australia/Sydney)**. The primary website is **[utilitylab.au](https://utilitylab.au)**. **[www.utilitylab.au](https://www.utilitylab.au)** permanently redirects to it, preserving paths, query strings and the app's map/guide fragments.

The existing Cloudflare Pages project remains `utility-lab`, serving `utility-lab-8b0.pages.dev`. The domain points to the same verified deployment, `b09073e7-be76-41eb-94b5-c2d4cbe4f9fd`; no application rebuild, redeployment or Git push was needed. Registration remains at Porkbun. The Cloudflare zone uses the Free Website plan.

## DNS and delivery

Porkbun delegates the domain to:

```text
julian.ns.cloudflare.com
kiki.ns.cloudflare.com
```

Cloudflare serves two proxied CNAME records, with automatic TTL:

| Name | Target |
| --- | --- |
| utilitylab.au | utility-lab-8b0.pages.dev |
| www.utilitylab.au | utility-lab-8b0.pages.dev |

The registrar initially contained only parking records, with no email records or registry DNSSEC entries. To cover resolvers retaining the old Porkbun delegation, its old zone also now has an apex ALIAS and an explicit `www` CNAME pointing to the same Pages target, both with TTL 600. The unrelated wildcard parking record remains as it was. This bridge does not change the Cloudflare delegation.

The Cloudflare zone and both Pages custom domains report **active**, including domain verification and certificate validation. Normal HTTPS requests passed certificate verification. All five `.au` parent nameservers published the Cloudflare delegation during verification. Some recursive nameserver caches can still show the old delegation temporarily; the legacy records also lead to the working site.

## Zone settings to preserve

- A hostname-specific Single Redirect sends `www.utilitylab.au` to `https://utilitylab.au`, preserving the path and query string. Browser checks confirmed map and photo-guide hash fragments survive.
- **Browser Cache TTL = 0 (Respect Existing Headers).** The initial four-hour default overrode the service-worker JavaScript policy. It was corrected and only the two `/sw.js` URLs were purged. HTML, the worker and manifests now revalidate; hashed assets retain their immutable cache policy.
- A configuration rule with **`disable_rum: true`** applies only to the two Utility Lab hostnames. This prevents browser-dependent Cloudflare Insights injection. The zone's RUM setting is also off. The original Content Security Policy was retained.
- The former `pages.dev` address remains available for workspace exports. It is not forcibly redirected.

Resource identifiers and current settings are recorded in ignored `outputs/cloudflare/custom-domain-setup.json`. Future deployments to the existing Pages project do not need a new zone or domain association.

## Verification

**33 functional checks passed** on the custom domain, covering all 20 map/floor/side contexts, the full catalogue, original Position/Aim photos across all eight maps, on-demand video wiring, map navigation, display controls, phone interactions, Saved records and offline app loading. A separate **three-check final pass** verified cache headers, permanent redirects and real-browser privacy behavior after the zone fixes.

The initial JavaScript is byte-for-byte identical across the new domain, the immutable release and the local build: `index-CPA0TY-O.js`, 246,031 bytes, SHA-256 `b5bd073b03399d95c16fbf53ad0e67c1b6c19f86cf7500d81b970ffcf81bed46`.

Evidence:

- `outputs/cloudflare/domain-live-smoke.json`: 33 passing checks. Its earlier run records now-resolved beacon attempts; it is not evidence of zero failed requests.
- `outputs/cloudflare/domain-redirect-privacy-smoke.json`: three final passing checks, no Insights injection or beacon requests, and no JavaScript errors.
- `outputs/cloudflare/domain-artifact-match.json`: matching deployed bundle.
- `outputs/cloudflare/domain-live/www-guide-redirect.png`: actual decoded source photo after the `www` redirect.

Native video playback was sampled successfully; YouTube embed delivery was verified, without claiming playback or regional availability for every clip. Physical iPhone, native compilation and the actual Steam browser remain outside this verification. No CS2, Steam or game files were accessed.

## Bring saved work across

The app's records belong to each browser origin. Connecting the domain does not automatically copy saved tactics, personal photos or favorites from localhost or the former public address.

1. Open the old address, such as [utility-lab-8b0.pages.dev](https://utility-lab-8b0.pages.dev), in the browser where the work was saved.
2. Save unfinished forms, then choose **Workspace settings → Export workspace**.
3. At [utilitylab.au](https://utilitylab.au), choose **Workspace settings → Import backup** and review the merge. Existing records stay; conflicts become copies.

An installed web app also remains tied to the address from which it was installed. Keep the exported backup when changing to an installation from the new domain.

No Supabase service was needed. If future work needs Supabase, the user's chosen organization is **Team TouchLine**, accessed through Chrome when the connector does not expose it.

References: [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), [Porkbun nameservers](https://kb.porkbun.com/article/22-how-to-change-nameservers), [Cloudflare Browser Cache TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/set-browser-ttl/), [disable RUM configuration rule](https://developers.cloudflare.com/rules/configuration-rules/settings/#disable-real-user-monitoring-rum).
