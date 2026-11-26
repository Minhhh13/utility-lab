export const CROSSHAIR_KEY = "utility-lab:photo-crosshair:v1";
export const CROSSHAIR_MIN_SIZE = 14;
export const CROSSHAIR_MAX_SIZE = 56;
export type CrosshairSettings = { shape: "reticle" | "cross" | "dot"; color: string; size: number };
export const DEFAULT_CROSSHAIR: CrosshairSettings = { shape: "reticle", color: "#4dffd1", size: 34 };

export function readCrosshairSettings(storage?: Pick<Storage, "getItem">): CrosshairSettings {
  try {
    const raw = JSON.parse((storage ?? localStorage).getItem(CROSSHAIR_KEY) ?? "null");
    if (!raw || typeof raw !== "object") return { ...DEFAULT_CROSSHAIR };
    return {
      shape: ["reticle", "cross", "dot"].includes(raw.shape) ? raw.shape : DEFAULT_CROSSHAIR.shape,
      color: typeof raw.color === "string" && /^#[0-9a-f]{6}$/i.test(raw.color) ? raw.color.toLowerCase() : DEFAULT_CROSSHAIR.color,
      size: Number.isInteger(raw.size) && raw.size >= CROSSHAIR_MIN_SIZE && raw.size <= CROSSHAIR_MAX_SIZE ? raw.size : DEFAULT_CROSSHAIR.size,
    };
  } catch {
    return { ...DEFAULT_CROSSHAIR };
  }
}

export function saveCrosshairSettings(settings: CrosshairSettings, storage?: Pick<Storage, "setItem">): boolean {
  try {
    (storage ?? localStorage).setItem(CROSSHAIR_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}
