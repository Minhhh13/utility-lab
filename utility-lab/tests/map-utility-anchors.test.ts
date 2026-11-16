import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { MAPS } from "../src/maps.ts";
import {
  UTILITY_MAP_ANCHORS,
  resolveUtilityAnchor,
  applyRegisteredUtilityAnchor,
} from "../src/map-utility-anchors.ts";
import {
  UTILITY_ANCHOR_EVIDENCE,
  UTILITY_MAP_REGISTRATIONS,
} from "../src/data/map-utility-anchor-evidence.ts";
import {
  ALL_LINEUP_REFERENCES,
  GUIDE_LIBRARY,
  REGISTERED_PRACTICE_REFERENCES,
} from "../src/guide-library.ts";

const lookup = (mapId: string, levelId: string, target: string) =>
  resolveUtilityAnchor({ mapId, levelId, target, title: "", from: "" });

function contains(point: number[], polygon: number[][]): boolean {
  let crossings = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    if ((a[1] <= point[1] && point[1] < b[1]) ||
        (b[1] <= point[1] && point[1] < a[1])) {
      const intersection = a[0] +
        ((point[1] - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
      if (intersection > point[0]) crossings++;
    }
  }
  return crossings % 2 === 1;
}

test("every anchor has a source-region interior and a registration to the displayed artwork", () => {
  assert.equal(new Set(UTILITY_MAP_ANCHORS.map(a => a.id)).size, UTILITY_MAP_ANCHORS.length);
  for (const anchor of UTILITY_MAP_ANCHORS) {
    const map = MAPS.find(map => map.id === anchor.mapId);
    assert.ok(map?.levels.some(level => level.id === anchor.levelId), anchor.id);
    const evidence = UTILITY_ANCHOR_EVIDENCE.find(item => item.anchorId === anchor.id);
    assert.ok(evidence, `No region evidence: ${anchor.id}`);
    assert.ok(contains(evidence.referencePoint, evidence.referencePolygon),
      `Point outside its named source region: ${anchor.id}`);
    const registration = UTILITY_MAP_REGISTRATIONS.find(item => item.id === anchor.registrationId);
    assert.ok(registration, anchor.id);
    assert.equal(registration.mapId, anchor.mapId);
    assert.equal(registration.levelId, anchor.levelId);
    assert.equal(registration.sourceUrl, anchor.sourceUrl);
    assert.ok(anchor.x > 0 && anchor.x < 1000 && anchor.y > 0 && anchor.y < 1000, anchor.id);
    const transform = registration.transform;
    const artworkPoint = anchor.artworkPoint || evidence.artworkPoint;
    const expected = artworkPoint
      ? artworkPoint.map(value => value * 1000 / 1024)
      : [
          evidence.referencePoint[0] * transform!.scaleX + transform!.translateX,
          evidence.referencePoint[1] * transform!.scaleY + transform!.translateY,
        ];
    assert.ok(Math.abs(expected[0] - anchor.x) < 0.011, anchor.id);
    assert.ok(Math.abs(expected[1] - anchor.y) < 0.011, anchor.id);
    if (anchor.artworkPoint) {
      assert.ok(anchor.auditedAt && anchor.auditNote, `Missing later artwork audit: ${anchor.id}`);
      assert.ok(transform, `Later point needs an invertible source registration: ${anchor.id}`);
      const sourcePoint = [
        (anchor.x - transform.translateX) / transform.scaleX,
        (anchor.y - transform.translateY) / transform.scaleY,
      ];
      assert.ok(contains(sourcePoint, evidence.referencePolygon),
        `Later artwork point left its original named source region: ${anchor.id}`);
    }
  }
});

test("replacing a registered map asset requires a fresh coordinate audit", () => {
  for (const registration of UTILITY_MAP_REGISTRATIONS) {
    const asset = readFileSync(new URL(`../public${registration.artwork}`, import.meta.url));
    assert.equal(createHash("sha256").update(asset).digest("hex"), registration.artworkSha256,
      `Displayed artwork changed; recheck anchors: ${registration.artwork}`);
  }
});

test("bombsite anchors follow each displayed map's orientation and plant area", () => {
  // Bounds read from the displayed artwork, independent of the source polygons.
  const cases: [string, string, string, number, number, number, number][] = [
    ["mirage", "main", "A site", 470, 620, 730, 830],
    ["mirage", "main", "B site", 190, 270, 240, 325],
    ["dust2", "main", "A site", 760, 830, 120, 220],
    ["inferno", "main", "A site", 770, 850, 600, 750],
    ["inferno", "main", "B site", 430, 540, 170, 280],
    ["nuke", "upper", "A site", 540, 620, 450, 570],
    ["nuke", "lower", "B site", 530, 620, 500, 590],
    ["ancient", "main", "A site", 260, 350, 220, 300],
    ["ancient", "main", "B site", 700, 810, 370, 450],
    ["anubis", "main", "A site", 700, 810, 200, 320],
    ["anubis", "main", "B site", 290, 380, 450, 540],
    ["cache", "main", "A site", 275, 355, 210, 320],
    ["cache", "main", "B site", 290, 400, 760, 860],
    ["vertigo", "upper", "A site", 640, 790, 540, 640],
    ["vertigo", "upper", "B site", 180, 260, 190, 290],
  ];
  for (const [map, level, target, x0, x1, y0, y1] of cases) {
    const anchor = lookup(map, level, target);
    assert.ok(anchor, `${map}:${level}:${target}`);
    assert.ok(anchor.x >= x0 && anchor.x <= x1 && anchor.y >= y0 && anchor.y <= y1,
      `Outside displayed plant area: ${anchor.id}`);
  }
});

test("Mirage resolves distinct Mid/Market windows and corrected A execution callouts", () => {
  const window = lookup("mirage", "main", "  MID   WINDOW  ")!;
  const market = lookup("mirage", "main", "Market window")!;
  assert.equal(window.id, "mirage:main:mid-window");
  assert.equal(lookup("mirage", "main", "Window")?.id, window.id);
  assert.ok(window.x > 370 && window.x < 430 && window.y > 470 && window.y < 570);
  assert.ok(market.x > 200 && market.x < 280 && market.y > 360 && market.y < 430);
  const stairs = lookup("mirage", "main", "Stairs")!;
  const jungle = lookup("mirage", "main", "Jungle")!;
  const ct = lookup("mirage", "main", "CT")!;
  assert.ok(stairs.x > 510 && stairs.x < 570 && stairs.y > 600 && stairs.y < 680);
  assert.ok(jungle.x > 410 && jungle.x < 480 && jungle.y > 570 && jungle.y < 650);
  assert.ok(ct.x > 400 && ct.x < 480 && ct.y > 760 && ct.y < 850);
});

test("ambiguous destinations and unregistered floors never inherit a guessed marker", () => {
  for (const target of ["Jungle / Stairs", "A or B", "Unknown", "Window smoke please"]) {
    assert.equal(resolveUtilityAnchor({ mapId: "mirage", levelId: "main", target,
      title: "Window", from: "Window" }), null);
  }
  assert.equal(lookup("nuke", "upper", "B site"), null);
  assert.equal(lookup("nuke", "lower", "A site"), null);
  assert.equal(lookup("vertigo", "lower", "B site"), null);
  assert.equal(lookup("vertigo", "upper", "A CT / Back site"), null);
  assert.equal(lookup("dust2", "main", "B window / doors"), null);
});

test("the source's Dust II Long-to-Car molly uses A Car without guessing other Car targets", () => {
  const guide = GUIDE_LIBRARY.find(guide => guide.id === "photo-kielson-dust2-m_car_0-t")!;
  assert.ok(guide.showMarker, "The selected Dust II T molly must appear on the map");
  assert.equal(resolveUtilityAnchor(guide)?.id, "dust2:main:a-car");
  assert.equal(guide.x, lookup("dust2", "main", "A Car")!.x);
  assert.equal(lookup("dust2", "main", "Car"), null);
  assert.equal(resolveUtilityAnchor({mapId:"dust2",levelId:"main",target:"Car",from:"B tunnels",title:"Car molly"}),null);
});

test("Ancient B Long stays centred inside its narrow displayed corridor", () => {
  const artwork = readFileSync(new URL("../public/maps/ancient.svg", import.meta.url), "utf8");
  // Native SVG boundary: west wall x823.5, east wall x855.5, between y333 and y387.
  // The old (828,340) app point was only 7.6 native pixels from the east wall.
  assert.match(artwork, /H823\.5V387H855\.5V333/);
  const anchor = lookup("ancient", "main", "B Long")!;
  const x = anchor.x * 1024 / 1000, y = anchor.y * 1024 / 1000;
  assert.ok(y > 333 && y < 387, "B Long must remain on its own approach corridor");
  assert.ok(x - 823.5 >= 15 && 855.5 - x >= 15,
    "Pin centre must have clear floor on both sides, not hug the outer wall");
  assert.notEqual(anchor.id, lookup("ancient", "main", "B Short")?.id);
  assert.notEqual(anchor.id, lookup("ancient", "main", "B site")?.id);
});

test("all multi-floor aliases stay on their registered destination floor", () => {
  for (const anchor of UTILITY_MAP_ANCHORS.filter(item => item.mapId === "nuke" || item.mapId === "vertigo")) {
    const wrongFloor = anchor.levelId === "upper" ? "lower" : "upper";
    for (const alias of anchor.aliases) {
      assert.equal(lookup(anchor.mapId, wrongFloor, alias), null,
        `Target alias leaked onto ${wrongFloor}: ${anchor.id}:${alias}`);
    }
  }
  // A standing/origin label must never decide a grenade's destination floor.
  assert.equal(resolveUtilityAnchor({mapId:"nuke",levelId:"upper",target:"B site",from:"A site",title:"A site"}), null);
  assert.equal(resolveUtilityAnchor({mapId:"vertigo",levelId:"lower",target:"A site",from:"A site",title:"A site"}), null);
});

test("bundled creator, photo and practice records use registered targets; saved pins retain their coordinates", () => {
  assert.ok(GUIDE_LIBRARY.length > 200);
  assert.ok(REGISTERED_PRACTICE_REFERENCES.length > 0);
  for (const guide of ALL_LINEUP_REFERENCES) {
    const anchor = resolveUtilityAnchor(guide);
    assert.equal(guide.showMarker, Boolean(anchor), guide.id);
    if (anchor) {
      assert.deepEqual([guide.x, guide.y], [anchor.x, anchor.y], guide.id);
      assert.equal(guide.markerBasis, "callout-area", guide.id);
    }
  }
  const original = { ...GUIDE_LIBRARY[0], userCreated: true, x: 123, y: 876 };
  assert.equal(applyRegisteredUtilityAnchor(original), original);
  assert.deepEqual([original.x, original.y], [123, 876]);
  const unresolved = { ...original, userCreated: false, target: "No source region", showMarker: true };
  assert.equal(applyRegisteredUtilityAnchor(unresolved).showMarker, false);
  assert.equal(unresolved.showMarker, true, "Registration must not mutate the original record");
  for (const map of MAPS) {
    const outside = {...original, userCreated:false, mapId:map.id, levelId:map.levels[0].id,
      target:"No source region", x:1500, y:-100, showMarker:true};
    assert.equal(applyRegisteredUtilityAnchor(outside).showMarker, false,
      `Out-of-artwork legacy coordinates must not become a fallback: ${map.id}`);
  }
});

test('the four reviewed legacy guides use their own named regions without creating a composite alias',()=>{
 const review=JSON.parse(readFileSync(new URL('../docs/data/legacy-complete-guide-pin-review.json',import.meta.url),'utf8'));
 for(const proof of review.proposals){
  const guide=GUIDE_LIBRARY.find(guide=>guide.id===proof.guideId)!;assert.ok(guide.showMarker,proof.guideId);
  assert.equal(resolveUtilityAnchor(guide)?.id,proof.proposedAnchorId);assert.deepEqual([guide.x,guide.y],[proof.appPoint.x,proof.appPoint.y]);
 }
 const composite=GUIDE_LIBRARY.find(guide=>guide.id==='gonade-anubis-mid-doorswindow-from-ruins-molotov')!;
 assert.equal(resolveUtilityAnchor({...composite,source:undefined}),null);
 assert.equal(resolveUtilityAnchor({...composite,source:'https://example.com/another-guide'}),null);
});
