import type { SavedTactic } from "./board-model.ts";
import { getMap } from "./maps.ts";
import {
  MAX_CUE_SECONDS, MAX_PLAYBOOK_STEPS,
  type RoundPlayer, type RoundStep, type Playbook,
} from "./playbook-model.ts";
import { lineupLink, parseRoute } from "./routes.ts";
import type { UtilityReference } from "./utility-data.ts";

type SheetGuide = { title: string; detail: string; link?: string };
type SheetCue = {
  seconds: number;
  title: string;
  team: boolean;
  notes: string;
  timing: string;
  role?: string;
  tactic?: string;
  guide?: SheetGuide;
};
export type CueSheet = {
  version: 1;
  book: string;
  bookId: string;
  map: string;
  player: string;
  role: string;
  cues: SheetCue[];
};

export function clockTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export function playerName(player: RoundPlayer): string {
  return player.name.trim() || `Player ${player.id.slice(1)}`;
}

export function makeCueSheet(
  book: Playbook, mapId: string, player: RoundPlayer, sortedSteps: RoundStep[],
  tactics: SavedTactic[], lineups: UtilityReference[],
): CueSheet {
  return {
    version: 1, book: book.name, bookId: book.id, map: getMap(mapId).name,
    player: playerName(player), role: player.role,
    cues: sortedSteps.filter(step => !step.playerId || step.playerId === player.id).map(step => {
      const tactic = tactics.find(item => item.id === step.tacticId);
      const lineup = lineups.find(item => item.id === step.lineupId);
      let guide: SheetGuide | undefined;
      if (lineup) {
        guide = {
          title: lineup.title,
          detail: [[lineup.from, lineup.target].filter(Boolean).join(" → "), lineup.throwType].filter(Boolean).join(" · "),
          ...(!lineup.userCreated && { link: new URL(lineupLink(lineup, "https://utilitylab.au")).hash }),
        };
      } else if (step.lineupId) {
        guide = { title: "Unavailable lineup", detail: "" };
      }
      return {
        seconds: step.atSeconds, title: step.title, team: !step.playerId,
        notes: step.notes, timing: step.timing,
        ...(step.role && { role: step.role }),
        ...(step.tacticId && { tactic: tactic?.plan.name || "Unavailable tactic" }),
        ...(guide && { guide }),
      };
    }),
  };
}

export function cueSheetHash(sheet: CueSheet): string {
  return `#playbooks?${new URLSearchParams({ sheet: JSON.stringify(sheet) })}`;
}

const boundedText = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

function validGuide(value: unknown): value is SheetGuide {
  if (!record(value) || !boundedText(value.title, 200) || !boundedText(value.detail, 500)) return false;
  if (value.link === undefined) return true;
  if (!boundedText(value.link, 2048) || !value.link.startsWith("#utilities?")) return false;
  const route = parseRoute(value.link);
  return !!(route.mapId && route.levelId && route.lineupId);
}

export function parseCueSheet(payload: string): CueSheet | null {
  // JSON can encode a single valid note character as a six-character escape.
  if (payload.length > 800_000) return null;
  try {
    const sheet: unknown = JSON.parse(payload);
    if (!record(sheet) || sheet.version !== 1 || !boundedText(sheet.book, 100) || !boundedText(sheet.bookId, 100)
      || !boundedText(sheet.map, 100) || !boundedText(sheet.player, 100) || !boundedText(sheet.role, 100)
      || !Array.isArray(sheet.cues) || sheet.cues.length > MAX_PLAYBOOK_STEPS) return null;
    if (!sheet.cues.every((cue: unknown) => record(cue)
      && typeof cue.seconds === "number" && Number.isInteger(cue.seconds) && cue.seconds >= 0 && cue.seconds <= MAX_CUE_SECONDS
      && boundedText(cue.title, 120) && typeof cue.team === "boolean" && boundedText(cue.notes, 1000)
      && boundedText(cue.timing, 80) && (cue.role === undefined || boundedText(cue.role, 100))
      && (cue.tactic === undefined || boundedText(cue.tactic, 200))
      && (cue.guide === undefined || validGuide(cue.guide)))) return null;
    return sheet as CueSheet;
  } catch {
    return null;
  }
}

export function cueSheetText(sheet: CueSheet): string {
  const heading = [sheet.book, sheet.map, [sheet.player, sheet.role].filter(Boolean).join(" · ")].join("\n");
  const cues = sheet.cues.map(cue => [
    `${clockTime(cue.seconds)}  ${cue.title}${cue.team ? " (Team)" : ""}`,
    cue.role, cue.timing, cue.notes, cue.tactic && `Tactic · ${cue.tactic}`,
    cue.guide?.title, cue.guide?.detail,
    cue.guide?.link && new URL(cue.guide.link, "https://utilitylab.au").href,
  ].filter(Boolean).join("\n"));
  return [heading, ...cues].join("\n\n") + "\n";
}
