import {readFileSync} from 'node:fs';
import {MAPS} from '../src/maps';import {PHOTO_GUIDE_LIBRARY} from '../src/guide-library';import {mergePhotoGuides,normalizeExpandedGuides} from '../src/expanded-guide-model';
export const PUBLISHED_LINEUPS=MAPS.flatMap(map=>mergePhotoGuides(PHOTO_GUIDE_LIBRARY.filter(record=>record.mapId===map.id),normalizeExpandedGuides(JSON.parse(readFileSync(`src/data/expanded/${map.id}.json`,'utf8')),map.id)));
