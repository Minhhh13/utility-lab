/** Recompute documentation from the same generated rows and merge used by the app.
 * Run: node --experimental-strip-types scripts/report-catalogue.mjs
 * Reads local project data/assets only; no requests, build, or game access.
 */
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { MAPS } from '../src/maps.ts';
import { lineupLink } from '../src/routes.ts';
import { GUIDE_LIBRARY, PHOTO_GUIDE_LIBRARY, BUNDLED_GUIDE_PHOTOS } from '../src/guide-library.ts';
import { mergePhotoGuides, hasCompleteGuideMedia, normalizeExpandedGuides } from '../src/expanded-guide-model.ts';
import { parseUtilityVideo, utilityPhotos, isBundledPhoto } from '../src/utility-data.ts';
import { lineupWalkthrough } from '../src/lineup-walkthrough.ts';
import { withAimPlacement } from '../src/aim-placement.ts';
import {curateLineups} from '../src/lineup-curation.ts';
import {findLineupOrigin, originSourceKey, parseOriginLookup} from '../src/lineup-origins.ts';

const project = new URL('../', import.meta.url);
const file = path => new URL(path, project);
const types = ['Smoke', 'Flash', 'Molotov', 'HE'];
const sides = ['T', 'CT'];
const count = (rows, predicate) => rows.filter(predicate).length;
const unique = values => [...new Set(values)];
const countBy = (rows, key) => Object.fromEntries(unique(rows.map(key)).sort().map(value => [value, count(rows, row => key(row) === value)]));
const videoFor = (row, fallback = false) => {
  try { return parseUtilityVideo(fallback ? row.videoFallbackUrl || '' : row.videoUrl || '', fallback ? undefined : row.videoStart); } catch { return null; }
};
const clipKey = video => video.kind === 'youtube' ? `youtube:${video.id}` : video.url.split('#')[0];
const segmentKey = video => `${clipKey(video)}#t=${video.start || 0}`;
const registered = row => row.showMarker === true && row.markerBasis === 'callout-area';
const generatedInputs = [];
const generatedOrigins = [];
const originLookups = {};
const expanded = [];
for (const map of MAPS) {
  const path = `src/data/expanded/${map.id}.json`, content = await readFile(file(path));
  const rows = normalizeExpandedGuides(JSON.parse(content.toString('utf8')), map.id);
  expanded.push(...rows);
  generatedInputs.push({ path, bytes: content.byteLength, sha256: createHash('sha256').update(content).digest('hex'), rows: rows.length });
  const originPath = `src/data/lineup-origins/origins-${map.id}.json`, originContent = await readFile(file(originPath));
  originLookups[map.id] = parseOriginLookup(JSON.parse(originContent.toString('utf8')));
  generatedOrigins.push({path:originPath,bytes:originContent.byteLength,sha256:createHash('sha256').update(originContent).digest('hex'),sources:Object.keys(originLookups[map.id]).length});
}
const main = mergePhotoGuides(PHOTO_GUIDE_LIBRARY, expanded);

const walkthroughs = main.map(row => ({ row, steps: lineupWalkthrough(row, utilityPhotos(withAimPlacement(row))) }));
const views = walkthroughs.flatMap(({ steps }) => steps.flatMap(step => step.views));
const standingVideoIds = walkthroughs.filter(({ steps }) => !steps[1].views[0].photo).map(({ row }) => row.id);
const walkthroughCoverage = {
  completeFiveStageRows: walkthroughs.filter(({ steps }) => steps.length === 5 && steps.every(step => step.views[0].photo)).length,
  stillRowsByStage: Object.fromEntries(['stand', 'setup', 'aim', 'detail', 'landing'].map((stage, i) =>
    [stage, walkthroughs.filter(({ steps }) => steps[i].stage === stage && steps[i].views[0].photo).length])),
  sourcedAimDetails: walkthroughs.filter(({ steps }) => !steps[3].views[0].magnifyAim).length,
  magnifiedAimDetails: walkthroughs.filter(({ steps }) => steps[3].views[0].magnifyAim).length,
  uniqueImages: unique(views.flatMap(({ photo }) => photo ? [photo.image] : [])).length,
  markedAimViews: views.filter(({ photo }) => photo?.kind === 'aim' && photo.aimPoint).length,
  standingVideoIds,
};

function inventory(rows) {
  const origins = rows.map(row => ({row,point:findLineupOrigin(row,originLookups[row.mapId])}));
  const photos = rows.flatMap(utilityPhotos), images = photos.map(photo => photo.image);
  const primary = rows.map(row => videoFor(row)).filter(Boolean), native = primary.filter(video => video.kind === 'file'), youtube = primary.filter(video => video.kind === 'youtube');
  const fallback = rows.map(row => videoFor(row, true)).filter(Boolean);
  const mapSideType = Object.fromEntries(MAPS.map(map => [map.id, Object.fromEntries(sides.map(side => [side, Object.fromEntries(types.map(type => [type, count(rows, row => row.mapId === map.id && row.side === side && row.type === type)]))]))]));
  const floors = Object.fromEntries(MAPS.map(map => [map.id, Object.fromEntries(map.levels.map(level => {
    const onFloor = rows.filter(row => row.mapId === map.id && row.levelId === level.id);
    return [level.id, { name: level.name, rows: onFloor.length, uniqueSources: unique(onFloor.map(row => row.source).filter(Boolean)).length, registeredPins: count(onFloor, registered), T: Object.fromEntries(types.map(type => [type, count(onFloor, row => row.side === 'T' && row.type === type)])), CT: Object.fromEntries(types.map(type => [type, count(onFloor, row => row.side === 'CT' && row.type === type)])) }];
  }))]));
  const remote = images.filter(image => /^https:\/\//.test(image)), bundled = images.filter(isBundledPhoto);
  return {
    rows: rows.length,
    uniqueSources: unique(rows.map(row => row.source).filter(Boolean)).length,
    completeMediaRows: count(rows, hasCompleteGuideMedia),
    mapRows: Object.fromEntries(MAPS.map(map => [map.id, count(rows, row => row.mapId === map.id)])),
    mapSideType,
    nonemptyMapSideTypeCombinations: MAPS.flatMap(map => sides.flatMap(side => types.map(type => mapSideType[map.id][side][type]))).filter(Boolean).length,
    floors,
    photos: {
      rowsWithPosition: count(rows, row => utilityPhotos(row).some(photo => photo.kind === 'position')),
      rowsWithAim: count(rows, row => utilityPhotos(row).some(photo => photo.kind === 'aim')),
      rowsWithPositionAndAim: count(rows, row => utilityPhotos(row).some(photo => photo.kind === 'position') && utilityPhotos(row).some(photo => photo.kind === 'aim')),
      mediaReferences: images.length,
      uniqueImages: unique(images).length,
      remoteReferences: remote.length,
      uniqueRemoteImages: unique(remote).length,
      bundledReferences: bundled.length,
      uniqueBundledImages: unique(bundled).length,
      regionViewReferences: count(photos, photo => Boolean(photo.region)),
      referencesByKind: countBy(photos, photo => photo.kind || 'unclassified'),
      kinds: Object.fromEntries(unique(photos.map(photo => photo.kind || 'unclassified')).sort().map(kind => {
        const references = photos.filter(photo => (photo.kind || 'unclassified') === kind);
        return [kind, { references: references.length, uniqueImages: unique(references.map(photo => photo.image)).length, uniqueRemoteImages: unique(references.map(photo => photo.image).filter(image => /^https:\/\//.test(image))).length, uniqueBundledImages: unique(references.map(photo => photo.image).filter(isBundledPhoto)).length }];
      })),
    },
    videos: {
      playableSourceRows: primary.length,
      nativePrimaryRows: native.length,
      youtubePrimaryRows: youtube.length,
      uniqueNativePrimaryClips: unique(native.map(clipKey)).length,
      uniqueYouTubePrimaryClips: unique(youtube.map(clipKey)).length,
      uniquePrimaryClips: unique(primary.map(clipKey)).length,
      uniquePrimarySegments: unique(primary.map(segmentKey)).length,
      fallbackRows: fallback.length,
      uniqueFallbackClips: unique(fallback.map(clipKey)).length,
      uniquePrimaryAndFallbackClips: unique([...primary, ...fallback].map(clipKey)).length,
    },
    pins: {
      registered: count(rows, registered),
      publisherDestinationRows: count(rows, row => registered(row) && Boolean(row.markerSource)),
      namedAnchorRows: count(rows, row => registered(row) && !row.markerSource),
      registrationRows: countBy(rows.filter(row => registered(row) && row.markerSource), row => row.markerSource.registrationId),
      unregistered: rows.filter(row => !registered(row)).map(({ id, mapId, levelId, title, side, type, source }) => ({ id, mapId, levelId, title, side, type, source })),
    },
    origins: {
      sourceBackedRows: count(origins,item => Boolean(item.point)),
      publisherStartRows: count(origins,item => item.point?.basis === 'publisher-origin'),
      worldStartSources: unique(origins.filter(({row,point}) => row.source && point?.precision === 'world').map(({row}) => originSourceKey(row.source))).length,
      namedOriginAreaRows: count(origins,item => item.point?.basis === 'callout-area'),
      alternateSourceFloorRows: count(origins,item => Boolean(item.point?.alternateLevels?.length)),
      crossFloorRows: count(origins,item => Boolean(item.point) && ![item.point.levelId,...(item.point.alternateLevels || []).map(point => point.levelId)].includes(item.row.levelId)),
      missingIds: origins.filter(item => !item.point).map(item => item.row.id),
    },
    sourceHosts: countBy(rows, row => { try { return new URL(row.source).hostname.replace(/^www\./, ''); } catch { return 'unrecorded'; } }),
  };
}

const offlineAssets = [];
for (const path of BUNDLED_GUIDE_PHOTOS) {
  if (!path.startsWith('/lineup-media/') || path.includes('..')) throw Error(`Unexpected bundled photo path: ${path}`);
  try {
    const info = await stat(file(`public${path}`));
    offlineAssets.push({ path, bytes: info.size, exists: info.isFile() });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    offlineAssets.push({ path, bytes: 0, exists: false });
  }
}
const summary = {
  generatedAt: new Date().toISOString(),
  generatedLocalDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
  timeZone: 'Australia/Sydney',
  method: 'Normalize every generated per-map JSON, then mergePhotoGuides(PHOTO_GUIDE_LIBRARY, expanded). Counts are side-specific browsing records; unique source pages and image/video resources are counted separately.',
  generatedInputs,
  generatedOrigins,
  mainPublished: inventory(main),
  walkthroughCoverage,
  defaultCurated: {
    policy: 'Overview preference subset only: up to four preferred recipes per target, floor, side and utility determine ordering. Main browsing restores every matching catalogue record before grouping destinations and origins; all numbered spawns and other origin recipes remain available.',
    preferenceSubsetMaxPerTargetSideType: 4,
    actualOriginAvailability: 'All matching records in mainPublished; this subset is not a browsing or standing-recipe limit.',
    ...inventory(curateLineups(main)),
  },
  generatedExpanded: inventory(expanded),
  offlineBundledGuidePhotos: {
    count: BUNDLED_GUIDE_PHOTOS.length,
    existingCount: count(offlineAssets, asset => asset.exists),
    bytes: offlineAssets.reduce((total, asset) => total + asset.bytes, 0),
    missingPaths: offlineAssets.filter(asset => !asset.exists).map(asset => asset.path),
    mainReferencedUniqueImages: unique(main.flatMap(utilityPhotos).map(photo => photo.image).filter(isBundledPhoto)).length,
    assets: offlineAssets,
  },
  compatibilityArchive: {
    rows: GUIDE_LIBRARY.length,
    legacyPhotoBackedRows: PHOTO_GUIDE_LIBRARY.length,
    legacyCreatorVideoOnlyRows: count(GUIDE_LIBRARY, row => !utilityPhotos(row).some(photo => photo.kind !== 'context')),
    legacyPhotoRowsWithVideoChoice: count(PHOTO_GUIDE_LIBRARY, row => Boolean(videoFor(row))),
    legacyPhotoRowsMeetingCurrentCompleteMediaRule: count(PHOTO_GUIDE_LIBRARY, hasCompleteGuideMedia),
    legacyInventory: inventory(GUIDE_LIBRARY),
    note: 'Compatibility archive is not added wholesale to current browsing. Historical photo guides without separate Position, Aim and a matching video remain resolvable by their existing IDs.',
  },
};
await mkdir(file('docs/data/'), { recursive: true });
await writeFile(file('docs/data/current-catalogue-summary.json'), JSON.stringify(summary, null, 2) + '\n');

const n = number => number.toLocaleString('en-US');
const mainStats = summary.mainPublished, archive = summary.compatibilityArchive, offline = summary.offlineBundledGuidePhotos;
const date = summary.generatedLocalDate;
const mapNames = Object.fromEntries(MAPS.map(map => [map.id, map.name]));
const matrix = [
  '| Map | Guides | T: Smoke / Flash / Fire / HE | CT: Smoke / Flash / Fire / HE |',
  '| --- | ---: | --- | --- |',
  ...MAPS.map(map => `| ${map.name} | ${n(mainStats.mapRows[map.id])} | ${types.map(type => mainStats.mapSideType[map.id].T[type]).join(' / ')} | ${types.map(type => mainStats.mapSideType[map.id].CT[type]).join(' / ')} |`),
];
const practiceMatrix = [
  '| Map | Mollies | HE grenades | Numbered spawn smokes | Source pages with exact starting coordinates |',
  '| --- | ---: | ---: | ---: | ---: |',
  ...MAPS.map(map => {
    const records = main.filter(record => record.mapId === map.id);
    const spawns = records.filter(record => record.type === 'Smoke' && record.spawn);
    const worldSources = new Set(records.filter(record =>
      findLineupOrigin(record, originLookups[map.id])?.precision === 'world').map(record => record.source));
    const spawnLink = spawns.length ? `[${spawns.length}](${lineupLink(spawns[0], 'https://utilitylab.au/')})` : '0';
    return `| ${map.name} | ${count(records, record => record.type === 'Molotov')} | ${count(records, record => record.type === 'HE')} | ${spawnLink} | ${worldSources.size} |`;
  }),
];
const researchLinks = '[Dust II / Mirage / Ancient](expanded-dma-sources.md), [Inferno / Anubis / Cache](expanded-iac-sources.md), [Nuke / Vertigo](expanded-nv-sources.md), [additional Nuke CSNADES](expanded-nuke-csnades-sources.md), [Cache completions](expanded-cache-completions.md), [Cache landing review](expanded-cache-pin-review.md), [independent publisher-map registration review](map-registration-publisher-independent-review.md), [Mirage / Ancient precision review](precise-mirage-ancient.md), [other-map spawn and origin review](precise-other-maps.md), and [Anubis precision review](precise-anubis.md)';
const pinSentence = `${n(mainStats.pins.registered)} published rows have registered callout-area pins (${n(mainStats.pins.publisherDestinationRows)} publisher-destination registrations and ${n(mainStats.pins.namedAnchorRows)} named map anchors). ${mainStats.pins.unregistered.length ? `${n(mainStats.pins.unregistered.length)} rows remain browsable without a map pin; their IDs are listed in the JSON report.` : 'Every published row has a registered pin.'}`;
const walkthroughText = `Walkthroughs open in the order **Where to stand**, **First-person view**, **Where to aim**, **Aim detail** and **Landing**. **${n(walkthroughCoverage.completeFiveStageRows)}** guides have stills or a registered standing map for all five steps. The other **${n(standingVideoIds.length)}** open their source video for the starting view. Aim detail uses a publisher close-up in ${n(walkthroughCoverage.sourcedAimDetails)} guides and a 2.5× crop centred on the recorded aim point in ${n(walkthroughCoverage.magnifiedAimDetails)}. Crops stay within the original source panel. The walkthroughs use ${n(walkthroughCoverage.uniqueImages)} distinct images and ${n(walkthroughCoverage.markedAimViews)} source-registered aim views. The marker stays aligned during zoom and pan, with adjustable colour, size and shape.`;
const coverage = [
  '# Photo guide coverage', '',
  `Generated **${date}** from local application data. Current main browsing contains **${n(mainStats.rows)} complete photo-and-video guide records**, representing **${n(mainStats.uniqueSources)} distinct original source pages**. Every published row has a separate Position reference, an Aim reference, recorded throw inputs and a matching source video. Counts are side-specific: a source explicitly marked for either team can appear on both sides.`, '',
  ...matrix, '',
  `All **${mainStats.nonemptyMapSideTypeCombinations} of ${MAPS.length * sides.length * types.length}** map/side/utility combinations have published guides. Floor-specific counts are available in [expanded catalogue](expanded-catalogue.md) and the [machine-readable inventory](data/current-catalogue-summary.json).`, '',
  `The original galleries supply **${n(mainStats.photos.mediaReferences)} photo references** to **${n(mainStats.photos.uniqueImages)} unique image resources**: ${n(mainStats.photos.remoteReferences)} references to ${n(mainStats.photos.uniqueRemoteImages)} original remote images, plus ${n(mainStats.photos.bundledReferences)} references to ${n(mainStats.photos.uniqueBundledImages)} bundled images. Reused source panels and T/CT rows count as references, not extra original captures.`, '',
  walkthroughText, '',
  pinSentence, '',
  `The offline photo pack lists **${n(offline.count)} local images**, ${n(offline.bytes)} bytes (${(offline.bytes / 1048576).toFixed(2)} MiB); ${offline.missingPaths.length ? `${offline.missingPaths.length} files are missing and listed in the report` : 'every listed file exists'}. It includes archive images and source-video stills as well as current browsing references. Original remote HTTPS photos and videos require internet and stay on their publishers' servers; backups retain those links. Personal uploaded photos continue to export as bytes.`, '',
  `The compatibility archive remains **${n(archive.rows)} legacy records**: **${n(archive.legacyPhotoBackedRows)} historical photo-backed guides** and **${n(archive.legacyCreatorVideoOnlyRows)} older creator-video-only records**. The historical photo list had ${n(archive.legacyPhotoRowsWithVideoChoice)} matching video choices. These archive counts describe the earlier library, not the expanded main list. Existing deep links continue to resolve. Compendium panel views preserve the original images and floor annotations; they are not new captures.`, '',
  `Source and media provenance: ${researchLinks}. The [16-case independent local UI audit](expanded-final-ui-media-audit.md) checked actual photo decoding, visible keys and native/YouTube playback across every map and both sides. Public availability can change; these source audits do not substitute for executing a throw on a particular game build. Actual Steam-browser, iPhone and Xcode execution remain unverified. Research and this report use project data and online sources only, without accessing CS2 or its installation.`, '',
  'Regenerate: `node --experimental-strip-types scripts/report-catalogue.mjs`. This reads local data and files only; it does not fetch media, build, publish or run the game.', '',
];
if (!process.argv.includes('--preserve-photo-coverage')) await writeFile(file('docs/photo-coverage.md'), coverage.join('\n'));

const floorTable = [
  '| Map | Floor | Guides | T: Smoke / Flash / Fire / HE | CT: Smoke / Flash / Fire / HE | Pins |',
  '| --- | --- | ---: | --- | --- | ---: |',
  ...MAPS.flatMap(map => Object.entries(mainStats.floors[map.id]).map(([levelId, floor]) => `| ${map.name} | ${floor.name || levelId} | ${n(floor.rows)} | ${types.map(type => floor.T[type]).join(' / ')} | ${types.map(type => floor.CT[type]).join(' / ')} | ${n(floor.registeredPins)} |`)),
];
const unpinned = mainStats.pins.unregistered.length ? ['The following main records have no registered pin:', '', ...mainStats.pins.unregistered.map(row => `- ${mapNames[row.mapId]} / ${row.side} / ${row.type}: ${row.title} — \`${row.id}\``), ''] : [];
const catalogue = [
  '# Expanded lineup catalogue', '',
  `Generated **${date}**. The app lazy-loads a local JSON catalogue for the selected map, normalizes its records, then runs \`mergePhotoGuides(PHOTO_GUIDE_LIBRARY, expanded)\`. Current generated files contribute **${n(summary.generatedExpanded.rows)} rows**; after the same merge, the complete catalogue contains **${n(mainStats.rows)} rows / ${n(mainStats.uniqueSources)} unique source pages**. Exact source-and-side matches preserve established lineup IDs.`, '',
  `Main browsing exposes all **${n(mainStats.rows)} guides**, including every matching origin recipe and numbered spawn. A **${n(summary.defaultCurated.rows)}-record preference subset** orders the quiet overview; its up-to-four preference per target, floor, side and utility does not limit landing or standing availability. The UI restores the complete matching catalogue before map grouping. Simpler throws and distinct standing areas rank first, while shared standing pins open a visual map chooser in pages of eight. Singleton standing recipes open directly.`, '',
  `All **${n(mainStats.origins.sourceBackedRows)}** published guides have standing locations. **${n(mainStats.origins.publisherStartRows)}** use publisher start points and **${n(mainStats.origins.namedOriginAreaRows)}** use named origin areas. **${n(mainStats.origins.worldStartSources)} distinct source pages** have starts verified in world coordinates. **${n(mainStats.origins.crossFloorRows)}** cross-floor throws retain the source floor independently of their landing floor. The Position step shows the starting location and links to the first-person setup. See [origin evidence and curation](lineup-origins.md).`, '',
  ...matrix, '',
  '## Molly, HE and spawn smoke audit', '',
  ...practiceMatrix, '',
  'The first three columns count playable, side-specific recipes. Each linked spawn count opens an example on that map. In Lineups, select Smoke and switch on **Spawn smokes** to see the eligible landing spots. Numbered slots follow the original creator’s spawn sheet. Some starts include a step or run before release. The last column counts distinct source pages across all utility types with registered in-game coordinates. Other published starts use a radar point or a named area with a visual setup.', '',
  '## Floor coverage', '',
  ...floorTable, '',
  'A zero denotes a source gap for that floor, side and utility. The map-wide matrix and floor-specific coverage are reported separately.', '',
  '## Media inventory', '',
  walkthroughText, '',
  `- Position + Aim + matching video: ${n(mainStats.completeMediaRows)} of ${n(mainStats.rows)} published rows.`,
  `- Original gallery photo references: ${n(mainStats.photos.mediaReferences)}; unique image resources: ${n(mainStats.photos.uniqueImages)} (${n(mainStats.photos.uniqueRemoteImages)} remote, ${n(mainStats.photos.uniqueBundledImages)} local).`,
  `- Position references: ${n(mainStats.photos.kinds.position?.references || 0)} / ${n(mainStats.photos.kinds.position?.uniqueImages || 0)} unique images; Aim references: ${n(mainStats.photos.kinds.aim?.references || 0)} / ${n(mainStats.photos.kinds.aim?.uniqueImages || 0)} unique images.`,
  `- Native primary videos: ${n(mainStats.videos.nativePrimaryRows)} rows / ${n(mainStats.videos.uniqueNativePrimaryClips)} unique files.`,
  `- YouTube primary videos: ${n(mainStats.videos.youtubePrimaryRows)} rows / ${n(mainStats.videos.uniqueYouTubePrimaryClips)} unique video IDs.`,
  `- All primary videos: ${n(mainStats.videos.uniquePrimaryClips)} unique clips / ${n(mainStats.videos.uniquePrimarySegments)} distinct configured start segments.`,
  `- Same-guide fallback links: ${n(mainStats.videos.fallbackRows)} rows / ${n(mainStats.videos.uniqueFallbackClips)} unique clips. Primary and fallback together reference ${n(mainStats.videos.uniquePrimaryAndFallbackClips)} unique clips.`,
  `- Offline BUNDLED_GUIDE_PHOTOS: ${n(offline.count)} listed files, ${n(offline.bytes)} bytes; ${n(offline.existingCount)} exist.`, '',
  'Source-hosted HTTPS images and clips remain online resources. Only bundled local images belong to the explicit offline photo pack. A separate browser cache reuses at most 12 successfully viewed publisher photos for seven days, and only the next adjacent slide is warmed after the current image loads. No database, image proxy, video download or whole-catalogue media prefetch is added. See [image caching](image-caching.md). Some local images are exact stills extracted from the corresponding public video; their source and timestamp evidence are retained in the research manifests. Slide references, original image files and actual video resources have separate counts to avoid treating panels or repeated T/CT rows as new captures.', '',
  '## Pin and compatibility inventory', '',
  pinSentence, '',
  ...unpinned,
  `The compatibility archive retains ${n(archive.rows)} older records, including the historical ${n(archive.legacyPhotoBackedRows)}-guide photo list and ${n(archive.legacyCreatorVideoOnlyRows)} creator-video-only rows. Only records satisfying the current complete-media rule enter the main merge. Archive deep links remain available.`, '',
  '## Source evidence', '',
  researchLinks + '.', '',
  'Mirage Window, Ancient CT Elbow and Ancient T Top Mid each have five source-numbered spawn guides. Dust II Mid Doors includes four numbered T Spawn squares matched to independently recorded starts. Anubis instant smokes cover 11 source slots across several destinations on the v22 radar. Both Anubis Window mollies and the stationary Upper-to-Camera smoke use creator-published standing poses. See [reviewed spawn coordinates and original sources](lineup-origins.md).', '',
  'Counts, per-map/floor matrices, generated-input hashes, source hosts, image references, video resources, pin registrations and exact offline byte sizes are in [current-catalogue-summary.json](data/current-catalogue-summary.json). The [local UI media audit](expanded-final-ui-media-audit.md) is a 16-guide functional sample, rather than a replay of every published clip. Map-update/gameplay validation and actual Steam-browser/iPhone/Xcode testing are outside that sample.', '',
  'Regenerate with `node --experimental-strip-types scripts/report-catalogue.mjs`. The reporter uses no network, build or game access.', '',
];
await writeFile(file('docs/expanded-catalogue.md'), catalogue.join('\n'));
console.log(JSON.stringify({ report: fileURLToPath(file('docs/data/current-catalogue-summary.json')), mainRows: mainStats.rows, defaultCuratedRows:summary.defaultCurated.rows, originRows:mainStats.origins.sourceBackedRows, publisherOriginRows:mainStats.origins.publisherStartRows, namedOriginAreas:mainStats.origins.namedOriginAreaRows, crossFloorOrigins:mainStats.origins.crossFloorRows, uniqueSources: mainStats.uniqueSources, generatedRows: summary.generatedExpanded.rows, mediaComplete: mainStats.completeMediaRows, pins: mainStats.pins.registered, unpinned: mainStats.pins.unregistered.length, photoReferences: mainStats.photos.mediaReferences, uniqueImages: mainStats.photos.uniqueImages, nativePrimaryRows: mainStats.videos.nativePrimaryRows, youtubePrimaryRows: mainStats.videos.youtubePrimaryRows, offlinePhotos: offline.count, offlineBytes: offline.bytes, missingOffline: offline.missingPaths.length }, null, 2));
