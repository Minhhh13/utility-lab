import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { mergePhotoGuides, normalizeExpandedGuides } from "../src/expanded-guide-model.ts";
import { PHOTO_GUIDE_LIBRARY } from "../src/guide-library.ts";
import { findLineupOrigin, parseOriginLookup } from "../src/lineup-origins.ts";
import { MAPS } from "../src/maps.ts";
import { originChoiceLayout, ORIGIN_PAGE_SIZE } from "../src/origin-choice-layout.ts";
import { groupOriginOptions, groupPersonalGuides, originRecipeOptions, type OriginGroup, type OriginOption } from "../src/origin-options.ts";
import { splitUtilityDestinations } from "../src/utility-markers.ts";

type Point = { x: number; y: number };
const epsilon = 1e-7;
const same = (a: Point, b: Point) => Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;
const cross = (a: Point, b: Point, c: Point) => (b.x-a.x)*(c.y-a.y) - (b.y-a.y)*(c.x-a.x);

function onSegment(a: Point, b: Point, c: Point) {
  return Math.abs(cross(a,b,c)) < epsilon &&
    c.x >= Math.min(a.x,b.x)-epsilon && c.x <= Math.max(a.x,b.x)+epsilon &&
    c.y >= Math.min(a.y,b.y)-epsilon && c.y <= Math.max(a.y,b.y)+epsilon;
}

// Independent of the assignment solver. A shared dot is legal, sharing any
// positive length of a leader or passing through another source is ambiguous.
function leadersConflict(a: Point, b: Point, c: Point, d: Point) {
  if (same(a,c)) return Math.abs(cross(a,b,d)) < epsilon && (b.x-a.x)*(d.x-a.x)+(b.y-a.y)*(d.y-a.y) > 0;
  if (onSegment(a,b,c) || onSegment(a,b,d) || onSegment(c,d,a) || onSegment(c,d,b)) return true;
  return (cross(a,b,c) > 0) !== (cross(a,b,d) > 0) && (cross(c,d,a) > 0) !== (cross(c,d,b) > 0);
}

const read = (path: string) => JSON.parse(readFileSync(new URL(`../src/data/${path}.json`, import.meta.url), "utf8"));

test("personal chooser links coincident and distinct targets to their own original recipe on every page", () => {
  const records=Array.from({length:17},(_,i)=>({
    ...PHOTO_GUIDE_LIBRARY[0], id:`saved-${i}`, userCreated:true, x:400+i%3, y:350+(i%4)*5,
  }));
  const [group]=groupPersonalGuides(records,1);
  const ids: string[]=[];
  for(let page=0;page<3;page++){
    const {options,sources,points,preview,direct}=originChoiceLayout(group,296,page);
    assert.equal(direct,false);
    options.forEach((option,i)=>{
      ids.push(option.record.id);
      const source=sources[i];
      const world={x:preview.x+(source.x-preview.start)*preview.span/preview.size,
        y:preview.y+(source.y-preview.start)*preview.span/preview.size};
      assert.ok(same(world,option.record));
      for(let j=0;j<i;j++)assert.equal(leadersConflict(source,points[i],sources[j],points[j]),false);
    });
  }
  assert.deepEqual(ids,records.map(record=>record.id));
});

test("published origin chooser pages preserve recipe anchors and have disjoint leader lines", t => {
  const full = process.env.UTILITY_LAB_ALL_ORIGIN_SUBSETS === "1";
  const counters = { records: 0, destinations: 0, groups: 0, pages: 0, leaders: 0, splitPages: 0, sharedDots: 0, direct: 0 };
  const seen = new Set<string>();

  function audit(group: OriginGroup) {
    if (group.options.length < 2) return;
    const key = group.point.levelId + "|" + group.options.map(option => option.record.id).join("|");
    if (seen.has(key)) return;
    seen.add(key);
    counters.groups++;
    for (const width of [296,328]) {
      for (let page=0; page*ORIGIN_PAGE_SIZE<group.options.length; page++) {
        const layout = originChoiceLayout(group,width,page);
        const expected = group.options.slice(page*ORIGIN_PAGE_SIZE,(page+1)*ORIGIN_PAGE_SIZE);
        assert.equal(layout.points.length,expected.length);
        assert.equal(layout.sources.length,expected.length);
        assert.equal(layout.options.length,expected.length);
        counters.pages++;
        if (page) counters.splitPages++;
        if (layout.direct) counters.direct++;
        const {span,size,start,x,y} = layout.preview;
        for (let i=0; i<expected.length; i++) {
          // Invert the displayed SVG viewBox independently, comparing it with
          // the original option whose record opens when this button is chosen.
          assert.equal(layout.options[i].record,expected[i].record);
          const point = layout.points[i], source = layout.sources[i];
          const original = {x: x + (source.x-start)*span/size, y: y + (source.y-start)*span/size};
          assert.ok(same(original, expected[i].point), `Incorrect anchor for ${expected[i].record.id}`);
          assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y) && point.x >= 22 && point.x <= width-22 && point.y >= 22 && point.y <= width-22);
          if (layout.direct) assert.ok(same(point,source));
          else counters.leaders++;
          for (let j=0; j<i; j++) {
            assert.ok(!same(point,layout.points[j]), "Two recipes share an action target");
            if (layout.direct) continue;
            if (same(source, layout.sources[j])) counters.sharedDots++;
            if (leadersConflict(source,point,layout.sources[j],layout.points[j])) {
              assert.fail(`Intersecting leaders for ${expected[i].record.id} and ${expected[j].record.id}, width ${width}, page ${page+1} of ${key}`);
            }
          }
        }
      }
    }
  }

  for (const map of MAPS) {
    const records = mergePhotoGuides(PHOTO_GUIDE_LIBRARY.filter(item => item.mapId === map.id),
      normalizeExpandedGuides(read(`expanded/${map.id}`),map.id));
    const lookup = parseOriginLookup(read(`lineup-origins/origins-${map.id}`));
    counters.records += records.length;
    // With spawn families present the app groups by named destination. Without
    // a saved spawn, same-coordinate non-spawn records can instead join.
    const normal = splitUtilityDestinations(records);
    counters.destinations += normal.length;
    const destinations = [...normal,...splitUtilityDestinations(records.filter(item => !item.spawn))];
    const destinationSets = new Set<string>();
    for (const dest of destinations) {
      const byRecipe = originRecipeOptions(dest.records);
      const membership = byRecipe.map(record => record.id).join("|");
      if (byRecipe.length < 2 || destinationSets.has(membership)) continue;
      destinationSets.add(membership);
      // Subsets below preserve this order. Verify every real pair has the
      // same order when the app actually sorts that two-favorite selection.
      for (let i=0; i<byRecipe.length; i++) for (let j=i+1; j<byRecipe.length; j++) {
        assert.equal(originRecipeOptions([byRecipe[j],byRecipe[i]])[0],byRecipe[i]);
      }
      for (const level of map.levels) {
        const options = byRecipe.flatMap(record => {
          const point = findLineupOrigin(record,lookup,level.id);
          return point?.levelId === level.id ? [{record,point}] : [];
        });
        if (options.length < 2) continue;
        // Group membership changes only when the 46px hit radius crosses a
        // source-pair distance. Cover every interval, including zoom extremes.
        const units = new Set([.01]);
        for (let i=0; i<options.length; i++) {
          for (let j=0; j<i; j++) {
            const a=options[i].point, b=options[j].point;
            units.add(Math.hypot(a.x-b.x,a.y-b.y)/46 + 1e-6);
          }
        }
        for (const unit of units) for (const group of groupOriginOptions(options,unit)) audit(group);
        // Favorites can exclude the usual group anchor and any combination of
        // its neighbours. Each resulting group is a subsequence of its landing
        // floor's ordered recipes. Include all combinations in the full audit.
        const maxUnit = full ? Infinity : 4;
        for (let i=0; i<options.length-1; i++) {
          const anchor = options[i], rest = options.slice(i+1).filter(candidate =>
            Math.hypot(anchor.point.x-candidate.point.x,anchor.point.y-candidate.point.y) < 46*maxUnit);
          const chosen: OriginOption[] = [anchor];
          function visit(from: number) {
            for (let j=from; j<rest.length; j++) {
              chosen.push(rest[j]);
              audit({ id: anchor.record.id, label: dest.label, point: anchor.point, options: chosen });
              visit(j+1);
              chosen.pop();
            }
          }
          visit(0);
        }
      }
    }
  }
  assert.ok(counters.splitPages && counters.sharedDots && counters.direct && counters.leaders);
  t.diagnostic(`Catalogue audit ${JSON.stringify(counters)}`);
});
