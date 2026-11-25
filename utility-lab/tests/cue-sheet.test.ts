import assert from "node:assert/strict";
import test from "node:test";
import { cueSheetHash, cueSheetText, makeCueSheet, parseCueSheet } from "../src/cue-sheet.ts";
import { getRoundPlan, type Playbook } from "../src/playbook-model.ts";
import { UTILITY_REFERENCES } from "../src/utility-data.ts";

const guide = UTILITY_REFERENCES.find(item => item.mapId === "mirage")!;
const base = { notes: "", role: "", timing: "" };
const book: Playbook = {
  id: "round-3", name: "Mirage α + ? #", notes: "Captain’s own notes", tacticIds: [], lineupIds: [guide.id],
  steps: [
    { ...base, id: "team", title: "Group", atSeconds: 0, role: "Support", timing: "On the call" },
    { ...base, id: "someone", title: "Other player only", atSeconds: 4, playerId: "p2" },
    { ...base, id: "mine", title: "Line up", atSeconds: 4, playerId: "p1", lineupId: guide.id },
    { ...base, id: "private", title: "Use personal guide", atSeconds: 5, playerId: "p1", lineupId: "personal" },
  ],
};
const plan = getRoundPlan(book);
const sheet = makeCueSheet(book, "mirage", plan.round.players[0], plan.steps, [], [
  guide, { ...guide, id: "personal", title: "Personal lineup", userCreated: true },
]);

test("shared links survive URL encoding and carry the selected player and team cues to a fresh browser", () => {
  const url = new URL(cueSheetHash(sheet), "http://localhost");
  const payload = new URLSearchParams(url.hash.split("?")[1]).get("sheet")!;
  assert.deepEqual(parseCueSheet(payload), sheet);
  assert.equal(sheet.bookId, "round-3");
  assert.deepEqual(sheet.cues.map(cue => cue.title), ["Group", "Line up", "Use personal guide"]);
  assert.equal(sheet.cues[0].role, "Support");
  assert.equal(sheet.cues[0].timing, "On the call");
  assert.match(sheet.cues[1].guide!.link!, /^#utilities\?/);
  assert.equal(sheet.cues[2].guide!.link, undefined);
  const offline = cueSheetText(sheet);
  assert.match(offline, /0:04  Line up/);
  assert.match(offline, /https:\/\/utilitylab.au\/#utilities\?/);
  assert.ok(offline.includes(guide.throwType));
  assert.ok(!offline.includes("Other player") && !offline.includes("Captain’s own notes"));
});

test("shared sheet reader rejects broken data, invalid times and third-party navigation", () => {
  assert.equal(parseCueSheet("bad"), null);
  for (const override of [{ seconds: -1 }, { seconds: 0.5 }, { title: {} }, { guide: { title: "Guide", detail: "", link: "https://example.org" } }]) {
    assert.equal(parseCueSheet(JSON.stringify({ ...sheet, cues: [{ ...sheet.cues[0], ...override }] })), null);
  }
});

test("a full round of long notes still opens after JSON escaping", () => {
  const longBook = { ...book, steps: Array.from({ length: 40 }, (_, index) => ({
    ...base, id: String(index), title: "Cue", notes: "\u0001".repeat(1000), atSeconds: index,
  })) };
  const longPlan = getRoundPlan(longBook);
  const longSheet = makeCueSheet(longBook, "mirage", longPlan.round.players[0], longPlan.steps, [], []);
  assert.deepEqual(parseCueSheet(JSON.stringify(longSheet)), longSheet);
});
