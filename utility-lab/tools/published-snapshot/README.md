# Published Utility Lab baseline

The Cloudflare deployment supplied by the owner was ahead of GitHub `main`
(`a26b2c8`). Its Lineups library contains 1,500 records and its target → utility →
throw-position chooser, photo annotations and storage behavior must be preserved.
The matching authored source was unavailable. This directory pins the public
deployment captured on 15 November 2026; it does not claim to recover the original
TypeScript source.

`source.json.gz` contains the unmodified text of all 31 published JS/CSS modules.
`manifest.json` records their SHA-256 hashes and the exact JSON/media asset bytes.
No browser-local personal records are included. External creator links remain
external. The archive is parsed as data, never evaluated by the restore tool.

```sh
node tools/published-snapshot/restore.mjs
node tools/published-snapshot/restore.mjs --check
npm test
npm run build
```

The adapter retains the application dependency graph, uses the repo's installed
React/React DOM/Lucide packages, imports paired stylesheets and lets Vite regenerate
chunks. `src/main.tsx` owns mounting and production service-worker registration.
The original worker, storage keys, catalogue IDs, map anchors, photo metadata,
video chapters and UI flows are retained. Old authored components remain in
`src/` for reference, but the active entry imports `src/published-app/`.

The requested edits are isolated in `src/lineups-layout.css`,
`src/usePhotoWheelZoom.ts` and an AST transform that places minus and plus next
to each other in the existing map/photo toolbars and attaches that wheel hook.
The hook calls the original photo zoom function and retains its 100–400% bounds.
Map wheel zoom, pan, image annotations, target grouping and the media viewer
come from the published baseline. Existing button handlers are unchanged.

When the matching authored source becomes available, replace this snapshot with
that source and port only those presentation edits. Do not edit generated modules
by hand or replace the catalogue with the older library from `main`.
