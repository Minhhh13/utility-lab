import { samplePlan, uid, type SavedTactic } from "./board-model";
import { createRoundSetup, type Playbook, type PlaybookStep } from "./playbook-model";

export const MIRAGE_EXAMPLE_NAME = "Mirage A split";
export const MIRAGE_EXAMPLE_LINEUP = "expanded-cs2tricks-mirage-sandwich-from-t-roof-e916-t";

/** Use the same Mirage board and lineup record that players can open in the editors. */
export function createMirageExample(): { book: Playbook; tactics: SavedTactic[] } {
  const tactic = { id: uid(), updatedAt: new Date().toISOString(), plan: samplePlan("mirage", "main") };
  const positions = [{ x: 700, y: 435 }, { x: 765, y: 420 }, { x: 808, y: 435 }, { x: 730, y: 505 }, { x: 690, y: 465 }];
  const plantBoard: SavedTactic = {
    id: uid(), updatedAt: tactic.updatedAt,
    plan: {
      ...tactic.plan, name: "A site post-plant", notes: "Example post-plant positions for the five-player rehearsal.",
      objects: tactic.plan.objects.filter(object => object.kind === "t").map((object, index) => ({ ...object, ...positions[index] })),
    },
  };
  const round = createRoundSetup("mirage", "main");
  const roles = ["Entry", "Trade", "Palace", "Support", "Caller"];
  round.players = round.players.map((player, index) => ({ ...player, role: roles[index] }));
  const calls: Omit<PlaybookStep, "id" | "role" | "timing">[] = [
    { atSeconds: 0, title: "Check the starting board", notes: "Find your number on the radar and confirm your role.", tacticId: tactic.id },
    { atSeconds: 8, playerId: "p3", title: "Set up in Palace", notes: "Call when you are ready to join the A split." },
    { atSeconds: 15, playerId: "p4", title: "Play the Sandwich lineup", notes: "Open the T Roof guide for the standing and aim photos.", lineupId: MIRAGE_EXAMPLE_LINEUP },
    { atSeconds: 20, playerId: "p1", title: "Take A ramp", notes: "Move on the support call." },
    { atSeconds: 20, playerId: "p2", title: "Follow the entry", notes: "Stay close enough to trade the first contact." },
    { atSeconds: 34, playerId: "p5", title: "Call the plant", notes: "Confirm the plant position with your teammates.", tacticId: plantBoard.id },
    { atSeconds: 105, title: "Review the round", notes: "Compare the round with the plan and agree on one adjustment." },
  ];
  return {
    tactics: [tactic, plantBoard],
    book: {
      id: uid(), name: MIRAGE_EXAMPLE_NAME, notes: "Rehearse an A split from ramp and Palace.",
      round, tacticIds: [tactic.id, plantBoard.id], lineupIds: [MIRAGE_EXAMPLE_LINEUP],
      steps: calls.map(cue => ({ id: uid(), role: "", timing: "", ...cue })),
    },
  };
}
