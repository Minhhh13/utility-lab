import { MIRAGE_GUIDES } from "./guides-deep-mirage.ts";
import { DUST2_GUIDES } from "./guides-deep-dust2.ts";
import { INFERNO_GUIDES } from "./guides-deep-inferno.ts";
import { NUKE_GUIDES } from "./guides-deep-nuke.ts";
import { ANCIENT_GUIDES } from "./guides-deep-ancient.ts";
import { ANUBIS_GUIDES } from "./guides-deep-anubis.ts";
import { CACHE_GUIDES } from "./guides-deep-cache.ts";
import { VERTIGO_GUIDES } from "./guides-deep-vertigo.ts";
import type { CreatorGuideDetails } from "../creator-guides.ts";

export const EXPANDED_GUIDE_DETAILS: CreatorGuideDetails[] = [
  ...MIRAGE_GUIDES,
  ...DUST2_GUIDES,
  ...INFERNO_GUIDES,
  ...NUKE_GUIDES,
  ...ANCIENT_GUIDES,
  ...ANUBIS_GUIDES,
  ...CACHE_GUIDES,
  ...VERTIGO_GUIDES,
];
