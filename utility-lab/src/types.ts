export type MapId =
  "mirage" | "dust2" | "inferno" | "ancient" | "anubis" | "nuke" | "cache";
export type Utility = "Smoke" | "Flash" | "Molotov" | "HE";
export type Point = { x: number; y: number };
export type Lineup = {
  id: string;
  map: MapId;
  title: string;
  from: string;
  target: string;
  side: "T" | "CT";
  utility: Utility;
  throwType: string;
  difficulty: "Easy" | "Medium";
  start: Point;
  end: Point;
  steps: string[];
  note: string;
  example: boolean;
  image?: string;
  source?: string;
};
