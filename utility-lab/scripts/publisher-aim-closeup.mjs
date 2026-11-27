import bindings from '../docs/data/cs2tricks-aim-closeups.json' with { type: 'json' };

const pages = 'https://www.cs2tricks.com/nades/';
const cdn = 'https://d1ntlvfrxziqo6.cloudfront.net/';

/** Add the publisher's own zoom image only to its matching wide-camera record.
 * CS2Tricks renders the same centered reticle over these two original assets. */
export function withPublisherAimCloseup(record) {
  if (record.userCreated || !record.source?.startsWith(pages)) return record;
  const pair = bindings[record.source.slice(pages.length)];
  if (!pair) return record;
  const photos = [...(record.remotePhotos ?? []), ...(record.photos ?? [])];
  const aims = photos.filter(photo => photo.kind === 'aim');
  if (aims.length !== 1) return record;
  const wide = aims[0];
  if (wide.source !== record.source || wide.region || wide.image !== cdn + pair.wide ||
      (wide.aimPoint && (wide.aimPoint.x !== 0.5 || wide.aimPoint.y !== 0.5))) return record;
  const detail = {
    kind: 'aim', caption: 'Aim detail', image: cdn + pair.detail,
    source: wide.source, creator: wide.creator, aimPoint: { x: 0.5, y: 0.5 },
  };
  const field = record.remotePhotos?.includes(wide) ? 'remotePhotos' : 'photos';
  return { ...record, [field]: record[field].flatMap(photo => photo === wide ? [photo, detail] : [photo]) };
}
