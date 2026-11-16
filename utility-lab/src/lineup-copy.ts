import type { UtilityReference } from "./utility-data.ts";
import { COMPENDIUM_PHOTO_REGIONS } from "./data/compendium-photo-regions.ts";

function compendiumPanels(record: UtilityReference) {
  const original = record.photos?.[0];
  const panels = COMPENDIUM_PHOTO_REGIONS[record.id];
  if (!original || !panels) return record.photos;
  return [
    ...panels.map((panel) => ({ ...original, ...panel })),
    { ...original, kind: "context" as const, caption: "Full guide · Original source panels and annotations." },
  ];
}

/** Presentation copy for imported guides; source attribution stays in photo metadata. */
export function clearPhotoInstructions(
  record: UtilityReference,
): UtilityReference {
  if (record.userCreated) return record;
  if (record.id.startsWith("photo-kielson-")) {
    return {
      ...record,
      purpose: "",
      steps: [
        `Stand at ${record.from}. Match the position photo.`,
        "Match the green crosshair in the aim photo.",
        record.throwType.endsWith(".")
          ? record.throwType
          : `${record.throwType}.`,
      ],
      photos: record.photos?.map((photo) => ({
        ...photo,
        caption:
          photo.kind === "position"
            ? `Stand at ${record.from}.`
            : photo.kind === "aim"
              ? "Match the green crosshair."
              : `Target: ${record.target}.`,
      })),
    };
  }
  if (record.id.startsWith("compendium-mirage-palace-")) {
    const row = record.id.endsWith("jungle")
      ? 1
      : record.id.endsWith("stairs")
        ? 2
        : 3;
    return {
      ...record,
      purpose: "",
      steps: [
        "Match the Palace Alley position in the left panels.",
        `Use row ${row}: ${record.target}. Match its aim point in the centre.`,
        "Jump and release LMB.",
      ],
      photos: compendiumPanels(record),
    };
  }
  if (record.id.startsWith("compendium-mirage-window-spawn-")) {
    const spawn = record.id.split("-").at(-1);
    return {
      ...record,
      purpose: "",
      steps: [
        `Use T spawn ${spawn} in the left panel.`,
        `Match aim panel ${spawn}.`,
        "Hold Shift + W, jump, then release LMB at the peak.",
      ],
      photos: compendiumPanels(record),
    };
  }
  return record;
}

export function photoStepName(
  kind: NonNullable<UtilityReference["photos"]>[number]["kind"],
  index: number,
  caption = "",
): string {
  if (/^Full guide\b/i.test(caption)) return "Full guide";
  if (kind === "context" && caption === "Walk jump throw") return "Technique";
  if (/^Position & aim\b/i.test(caption)) return "Position & aim";
  return kind === "position"
    ? "Position"
    : kind === "aim"
      ? "Aim"
      : kind === "release"
        ? "Throw"
        : kind === "landing"
          ? "Landing"
          : kind === "context"
            ? "Target"
            : `Photo ${index + 1}`;
}
