import assets from './high-resolution-photo-assets.json' with {type:'json'};

export interface HighResolutionPhoto {
  image: string;
  width: number;
  height: number;
}

const originals: Record<string, HighResolutionPhoto> = assets;

/** Returns a measured, composition-matched original for this exact still. */
export function highResolutionPhoto(image: string): HighResolutionPhoto | undefined {
  return Object.prototype.hasOwnProperty.call(originals, image) ? originals[image] : undefined;
}
