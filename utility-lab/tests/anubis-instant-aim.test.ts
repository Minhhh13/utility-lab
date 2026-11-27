import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PRECISE_ANUBIS } from "../src/data/precise-anubis.ts";
import { lineupWalkthrough } from "../src/lineup-walkthrough.ts";
import { utilityPhotos } from "../src/utility-data.ts";

type SourceAction = { t: number; description: string; inputs: string[] | null };
type SourceGuide = {
  provider: string;
  sourceId: string;
  source: string;
  guideId: string;
  sourceSteps: { type: string; actions?: SourceAction[] }[];
  aimImages: { role: string; image: string; overlayStyle: string; width: number; height: number }[];
};
const evidence = JSON.parse(readFileSync(new URL("../docs/data/precise-anubis-evidence.json", import.meta.url), "utf8")).records as SourceGuide[];

test("every numbered Anubis T instant opens its own publisher aim frame and landmark in Aim detail", () => {
  const guides = PRECISE_ANUBIS.filter(record => record.spawn?.family.startsWith("setpos-anubis-t-"));
  const cues = new Set<string>();
  assert.equal(guides.length, 23);
  for (const guide of guides) {
    const proof = evidence.find(record => record.provider === "setpos" && record.guideId === guide.id)!;
    const sourceAim = proof.aimImages.find(photo => photo.role === "aim")!;
    const steps = lineupWalkthrough(guide, utilityPhotos(guide));
    const wide = steps.find(step => step.stage === "aim")!.views[0];
    const detail = steps.find(step => step.stage === "detail")!.views[0];
    assert.equal(wide.photo?.image, sourceAim.image, guide.id);
    assert.equal(detail.photo?.image, sourceAim.image, guide.id);
    assert.equal(detail.photo?.source, proof.source, guide.id);
    assert.equal(detail.magnifyAim, true, guide.id);
    assert.equal(sourceAim.overlayStyle, "crosshair", guide.id);
    assert.deepEqual([sourceAim.width, sourceAim.height], [1920, 1080], guide.id);
    assert.deepEqual(detail.photo?.aimPoint, { x: 0.5, y: 0.5 }, guide.id);
    assert.notEqual(guide.steps[1], detail.photo!.caption, guide.id);
    assert.doesNotMatch(detail.photo!.caption, /marked point/i, guide.id);
    cues.add(detail.photo!.caption);
  }
  assert.equal(cues.size, guides.length);
});

test("Anubis T5 and T7 Inside Connector retain their different Shift and W timing", () => {
  for (const [slot, sourceId] of [[5, "93"], [7, "57"]] as const) {
    const guide = PRECISE_ANUBIS.find(record => record.spawn?.family === "setpos-anubis-t-conn" && record.spawn.slot === slot)!;
    const proof = evidence.find(record => record.sourceId === sourceId && record.provider === "setpos")!;
    const events = proof.sourceSteps.find(step => step.type === "throw")!.actions!;
    assert.equal(guide.source, proof.source);
    const jump = events.find(e => e.description === "Jump.")!;
    const release = events.find(e => e.description === "Release left mouse button.")!;
    assert.ok(jump.inputs?.includes("shift"));
    if (slot === 5) {
      assert.equal(jump.t, release.t);
      assert.ok(!jump.inputs.includes("w"));
      assert.ok(events.find(e => e.description === "Press W.")!.t > release.t);
      assert.equal(guide.throwType, "Shift + Jump + LMB");
      assert.match(guide.steps.at(-1)!, /W press comes just after the release/);
    } else {
      assert.ok(jump.inputs.includes("w") && jump.t < release.t);
      assert.equal(guide.throwType, "Walk + Jump + LMB");
      assert.match(guide.steps.at(-1)!, /move forward with W/);
    }
  }
});
