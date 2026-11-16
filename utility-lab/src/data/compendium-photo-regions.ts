/** Viewport crops of the unchanged 1280 × 800 source composites.
 * Source/credit/license come from the existing Compendium photo record.
 * Keep the original source annotations; these regions add no markers.
 */
type CompendiumPhotoRegion = {
  kind: 'position' | 'aim' | 'release' | 'landing' | 'context';
  caption: string;
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
    sourceWidth: number;
    sourceHeight: number;
  };
};

function panel(
  kind: CompendiumPhotoRegion['kind'],
  caption: string,
  x: number,
  y: number,
  width: number,
  height: number,
): CompendiumPhotoRegion {
  return { kind, caption, region: { x, y, width, height, sourceWidth: 1280, sourceHeight: 800 } };
}

const palacePosition = [
  panel('position', 'Palace Alley · standing position and first-person view', 10, 70, 429, 507),
];

const windowPosition = (number: number) =>
  panel('position', `Start at spawn box ${number}`, 10, 69, 420, 505);

const windowTechnique = () =>
  panel('context', 'Walk jump throw', 860, 557, 410, 233);

export const COMPENDIUM_PHOTO_REGIONS: Record<string, CompendiumPhotoRegion[]> = {
  'compendium-mirage-palace-jungle': [
    ...palacePosition,
    panel('aim', 'Jungle · aim at the orange ring', 451, 69, 469, 235),
    panel('landing', 'Jungle smoke result', 930, 69, 340, 235),
  ],
  'compendium-mirage-palace-stairs': [
    ...palacePosition,
    panel('aim', 'Top Stairs · aim at the blue ring', 451, 314, 469, 234),
    panel('landing', 'Top Stairs smoke result', 930, 314, 340, 234),
  ],
  'compendium-mirage-palace-ct': [
    ...palacePosition,
    panel('aim', 'CT · aim at the green ring', 451, 555, 469, 235),
    panel('landing', 'CT entrance smoke result', 930, 555, 340, 235),
  ],
  'compendium-mirage-window-spawn-1': [
    windowPosition(1),
    panel('aim', 'Spawn 1 · aim at the orange ring', 441, 69, 410, 235),
    windowTechnique(),
  ],
  'compendium-mirage-window-spawn-2': [
    windowPosition(2),
    panel('aim', 'Spawn 2 · aim at the blue ring', 859, 69, 411, 235),
    windowTechnique(),
  ],
  'compendium-mirage-window-spawn-3': [
    windowPosition(3),
    panel('aim', 'Spawn 3 · aim at the green ring', 441, 314, 410, 234),
    windowTechnique(),
  ],
  'compendium-mirage-window-spawn-4': [
    windowPosition(4),
    panel('aim', 'Spawn 4 · aim at the light-blue ring', 859, 314, 411, 234),
    windowTechnique(),
  ],
  'compendium-mirage-window-spawn-5': [
    windowPosition(5),
    panel('aim', 'Spawn 5 · aim at the purple ring', 441, 555, 410, 235),
    windowTechnique(),
  ],
};
