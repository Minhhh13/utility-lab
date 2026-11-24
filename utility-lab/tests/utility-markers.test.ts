import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { clusterUtilityAreas, groupUtilityMarkers, splitUtilityDestinations, utilityMarkerArea } from "../src/utility-markers.ts";
import { layoutLandingSpots, nameLandingSpots } from "../src/landing-map-layout.ts";
import { UTILITY_REFERENCES } from "../src/utility-data.ts";
import { PHOTO_GUIDE_LIBRARY } from "../src/guide-library.ts";
import { normalizeExpandedGuides, mergePhotoGuides } from "../src/expanded-guide-model.ts";
import { curateLineups } from "../src/lineup-curation.ts";
test("nearby utility targets group without inventing an averaged location; zoom separates them", () => {
  const base = UTILITY_REFERENCES[0];
  const records = [
    { ...base, id: "first", x: 100, y: 200 },
    { ...base, id: "second", x: 120, y: 205 },
    { ...base, id: "unmapped", x: 105, y: 200, showMarker: false },
    { ...base, id: "far", x: 800, y: 800 },
  ];
  const grouped = groupUtilityMarkers(records, 1);
  assert.equal(grouped.length, 2);
  assert.equal(grouped[0].x, 100);
  assert.equal(grouped[0].y, 200);
  assert.deepEqual(
    grouped[0].records.map((item) => item.id),
    ["first", "second"],
  );
  assert.equal(groupUtilityMarkers(records, 0.25).length, 3);
});

const maps = ["mirage", "dust2", "inferno", "nuke", "ancient", "anubis", "cache", "vertigo"];
const published = mergePhotoGuides(PHOTO_GUIDE_LIBRARY, maps.flatMap(map => normalizeExpandedGuides(
  JSON.parse(readFileSync(new URL(`../src/data/expanded/${map}.json`, import.meta.url), "utf8")), map,
)));
const contexts = maps.flatMap(map => ["T", "CT"].flatMap(side =>
  [...new Set(published.filter(record => record.mapId === map).map(record => record.levelId))].map(level =>
    curateLineups(published.filter(record => record.mapId === map && record.levelId === level && record.side === side)),
  ),
)).filter(records => records.length);

test("Dust II Mid Doors stays an independent complete utility location at overview and close zoom", () => {
  const records = curateLineups(published.filter(record => record.mapId === "dust2" && record.side === "T"));
  const midDoors = records.filter(record => record.target.trim() === "Mid Doors");
  assert.equal(midDoors.filter(record => record.type === "Smoke").length, 4);
  for (const unit of [.25, 1, 1.5, 2.5, 3]) {
    const groups = groupUtilityMarkers(records, unit);
    const doors = groups.filter(group => group.areaId === "dust2:main:mid-doors");
    assert.ok(doors.length, `Mid Doors must remain available at mapUnit ${unit}`);
    const shownSmokeIds = doors.flatMap(group => group.records.filter(record => record.type === "Smoke").map(record => record.id));
    assert.deepEqual(shownSmokeIds.sort(), midDoors.filter(record => record.type === "Smoke").map(record => record.id).sort());
    for (const group of doors) {
      assert.ok(!group.records.some(record => ["Lower Tunnels", "X Box", "Short"].includes(record.target.trim())));
      assert.ok(group.records.some(record => record.x === group.x && record.y === group.y));
    }
    assert.ok(groups.some(group => group.areaId === "dust2:main:lower-tunnels"));
    assert.ok(groups.some(group => group.detailTargets.includes("X Box")));
  }
});

test("nearby different callouts never combine; zoom only separates qualifiers of the same reviewed area", () => {
  const base = { ...UTILITY_REFERENCES[0], mapId: "dust2", levelId: "main", side: "T" as const };
  const records = [
    { ...base, id: "doors", target: "Mid Doors", x: 100, y: 200 },
    { ...base, id: "close-doors", target: "Close Mid Doors", x: 120, y: 205 },
    { ...base, id: "tunnels", target: "Lower Tunnels", x: 103, y: 200 },
    { ...base, id: "composite", target: "Mid Doors/Window", x: 105, y: 200 },
  ];
  const overview = groupUtilityMarkers(records, 3);
  assert.equal(overview.length, 3);
  assert.deepEqual(overview[0].records.map(record => record.id), ["doors", "close-doors"]);
  assert.equal(overview[0].label, "Mid Doors");
  assert.equal(groupUtilityMarkers(records, .25).length, 4);
  assert.equal(groupUtilityMarkers(records, .25).find(group => group.id === "close-doors")?.label, "Close Mid Doors");
});

test("every researched main area and every plotted guide remains represented across zoom on all maps", () => {
  assert.equal(published.length, 1558);
  for (const records of contexts) {
    const pinned = records.filter(record => record.showMarker !== false);
    const expectedAreas = [...new Set(pinned.map(record => utilityMarkerArea(record).id))].sort();
    for (const unit of [.5, 1.5, 3]) {
      const groups = groupUtilityMarkers(records, unit);
      assert.deepEqual([...new Set(groups.map(group => group.areaId))].sort(), expectedAreas);
      assert.deepEqual(groups.flatMap(group => group.records.map(record => record.id)).sort(), pinned.map(record => record.id).sort());
      for (const group of groups) {
        assert.ok(group.records.every(record => utilityMarkerArea(record).id === group.areaId));
        assert.ok(group.records.some(record => record.x === group.x && record.y === group.y));
      }
    }
  }
});

test("all maps retain every landing and its coordinates behind separated, labelled touch targets", () => {
  const checked = new Set<string>();
  let paginated = 0;
  for (const map of maps) for (const side of ["T", "CT"]) {
    const mapSide = published.filter(record => record.mapId === map && record.side === side);
    for (const level of new Set(mapSide.map(record => record.levelId))) for (const width of [320, 1440]) {
      const unit = 1000 / width, bounds = { x: 0, y: 0, width: 1000, height: 1000 + 200 * unit };
      const groups = groupUtilityMarkers(mapSide.filter(record => record.levelId === level), unit, true);
      for (const area of clusterUtilityAreas(groups, unit)) for (const type of ["Smoke", "Flash", "Molotov", "HE"]) {
        const destinations = splitUtilityDestinations(area.records.filter(record => record.type === type));
        if (destinations.length < 2) continue;
        const names = nameLandingSpots(destinations), seen: string[] = [];
        const dock = { x: 0, y: 0, width, height: width === 320 ? 136 : 48 };
        const layout = (page: number) => layoutLandingSpots(names, bounds, unit, 144, [dock], page);
        const first = layout(0);
        if (first.pages > 1) paginated++;
        for (let page = 0; page < first.pages; page++) {
          const current = layout(page);
          assert.deepEqual(current.pager, first.pager, "paging controls stay still");
          const positions = current.callouts.map(item => item.center);
          if (current.pager) positions.push(current.pager);
          for (const [index, point] of positions.entries()) {
            assert.ok(point.y - 22 >= dock.height && point.x >= current.chipWidth / 2);
            assert.ok(point.x <= width - current.chipWidth / 2 && point.y + 22 <= bounds.height / unit);
            for (const other of positions.slice(index + 1))
              assert.ok(Math.abs(point.x-other.x) >= current.chipWidth || Math.abs(point.y-other.y) >= 44);
          }
          for (const {group, point} of current.callouts) {
            seen.push(group.id);
            assert.ok(Math.abs(group.x - point.x * unit) < .0001 && Math.abs(group.y - point.y * unit) < .0001);
          }
        }
        assert.deepEqual(seen.sort(), destinations.map(item => item.id).sort());
        checked.add(map);
      }
    }
  }
  assert.deepEqual([...checked].sort(), [...maps].sort());
  assert.ok(paginated > 0);
});

test("landing captions follow a normal pan and never clamp an offscreen destination into view", () => {
  const base = { ...UTILITY_REFERENCES[0], mapId: "nuke", levelId: "upper", side: "T" as const };
  const groups = splitUtilityDestinations([
    { ...base, id: "outside-one", target: "Outside", x: 600, y: 600 },
    { ...base, id: "outside-two", target: "Outside", x: 605, y: 609 },
    { ...base, id: "invisible", target: "Outside Garage", x: 1400, y: 300 },
  ]);
  const names = nameLandingSpots(groups), reversed = nameLandingSpots([...groups].reverse());
  assert.deepEqual(names.map(item => item.ordinal), [1, 2, undefined]);
  assert.deepEqual(names.map(item => item.ordinal), reversed.reverse().map(item => item.ordinal));
  const view = { x: 0, y: 0, width: 1280, height: 960 };
  const before = layoutLandingSpots(names, view, 1, 144, []);
  const after = layoutLandingSpots(names, { ...view, x: 12, y: 8 }, 1, 144, []);
  assert.deepEqual(before.callouts.map(item => item.group.id), groups.slice(0,2).map(item => item.id));
  for (const [i, item] of after.callouts.entries()) {
    assert.equal(item.center.x, before.callouts[i].center.x - 12);
    assert.equal(item.center.y, before.callouts[i].center.y - 8);
  }
});

test("grouping follows the 46px target hit area at each map scale", () => {
  const base = UTILITY_REFERENCES[0];
  for (const mapUnit of [0.5, 1, 2]) {
    const records = [
      { ...base, id: "target", x: 100, y: 200 },
      { ...base, id: "overlapping", x: 100 + 45 * mapUnit, y: 200 },
      { ...base, id: "separate", x: 100 + 47 * mapUnit, y: 200 },
    ];
    const groups = groupUtilityMarkers(records, mapUnit);
    assert.equal(groups.length, 2);
    assert.deepEqual(groups[0].records.map(record => record.id), ["target", "overlapping"]);
    assert.equal(groups[0].x, records[0].x);
    assert.equal(groups[1].x, records[2].x);
  }
});

test("destination splitting uses exact two-decimal identities without averaging preferred coordinates", () => {
  const base = { ...UTILITY_REFERENCES[0], mapId: "dust2", levelId: "main", side: "T" as const, type: "Smoke" as const };
  const preferred = { ...base, id: "preferred", target: "Close Mid Doors", x: 454.531, y: 361.964 };
  const alias = { ...base, id: "alias", target: "Mid Doors", x: 454.534, y: 361.961 };
  const nearby = { ...base, id: "nearby", target: "Mid Doors", x: 454.54, y: 361.96 };
  const records = [preferred, alias, nearby];
  const original = JSON.stringify(records);
  const groups = splitUtilityDestinations(records);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0].records, [preferred, alias]);
  assert.equal(groups[0].x, preferred.x); assert.equal(groups[0].y, preferred.y);
  assert.equal(groups[0].label, "Mid Doors");
  assert.deepEqual(groups[0].detailTargets, ["Close Mid Doors", "Mid Doors"]);
  assert.equal(splitUtilityDestinations([preferred])[0].label, "Close Mid Doors");
  assert.deepEqual(new Set(splitUtilityDestinations([...records].reverse()).map(group => group.id)), new Set(groups.map(group => group.id)));
  assert.equal(JSON.stringify(records), original);
});

test("a chosen area exposes five distinct destination fixture points without zooming or an origin cap", () => {
  // A synthetic contract fixture, not five claimed published game locations.
  const base = { ...UTILITY_REFERENCES[0], mapId: "nuke", levelId: "upper", side: "T" as const, type: "Smoke" as const, target: "A Site", userCreated: true };
  const records = Array.from({ length: 5 }, (_, index) => ({ ...base, id: `destination-${index}`, x: 100 + index * 20, y: 200 }));
  records.push(...Array.from({ length: 7 }, (_, index) => ({ ...base, id: `source-variant-${index}`, x: 100, y: 200 })));
  assert.equal(groupUtilityMarkers(records, 3).length, 1);
  assert.equal(groupUtilityMarkers(records, .2).length, 5);
  const destinations = splitUtilityDestinations(records);
  assert.equal(destinations.length, 5, "all precise landing options are available before manual zoom");
  assert.equal(destinations[0].records.length, 8, "origin display caps are applied later, not to destination membership");
  assert.deepEqual(destinations.map(group => group.x), [100, 120, 140, 160, 180]);
});

test("published Nuke Secret smoke variants expand to every real destination rather than nearby zoom clusters", () => {
  const records = published.filter(record => record.mapId === "nuke" && record.levelId === "upper" && record.side === "T" && record.type === "Smoke" && utilityMarkerArea(record).id === "nuke:upper:secret");
  assert.equal(records.length, 17);
  assert.equal(groupUtilityMarkers(records, 3).length, 1);
  assert.equal(groupUtilityMarkers(records, .5).length, 2);
  const groups = splitUtilityDestinations(records);
  assert.equal(groups.length, 4);
  assert.deepEqual(groups.map(group => `${group.x.toFixed(2)},${group.y.toFixed(2)}`).sort(), [
    "605.88,708.96", "605.94,713.16", "638.36,716.31", "638.38,701.33",
  ]);
  assert.deepEqual(groups.flatMap(group => group.records.map(record => record.id)).sort(), records.map(record => record.id).sort());
});

test("Dust II exact destinations never cross Mid Doors, Lower Tunnels or Xbox families", () => {
  const records = published.filter(record => record.mapId === "dust2" && record.side === "T" && record.type === "Smoke");
  const groups = splitUtilityDestinations(records);
  for (const areaId of ["dust2:main:mid-doors", "dust2:main:lower-tunnels", "dust2:main:xbox"]) {
    const exact = groups.filter(group => group.areaId === areaId);
    const expected = records.filter(record => utilityMarkerArea(record).id === areaId);
    assert.ok(exact.length);
    assert.deepEqual(exact.flatMap(group => group.records.map(record => record.id)).sort(), expected.map(record => record.id).sort());
    assert.ok(exact.every(group => group.records.every(record => utilityMarkerArea(record).id === areaId)));
  }
});

test("all-map choices preserve every source point while source-confirmed spawn families share their named landing", () => {
  const pinned = published.filter(record => record.showMarker !== false);
  const pointKey = (record: typeof pinned[number]) => JSON.stringify([
    record.mapId, record.levelId, record.side, record.type, utilityMarkerArea(record).id,
    Math.round(record.x * 100), Math.round(record.y * 100),
  ]);
  const expected = new Set(pinned.map(pointKey));
  const groups = splitUtilityDestinations(published);
  assert.ok(groups.length<=expected.size);
  assert.equal(new Set(groups.map(group => group.id)).size, groups.length);
  assert.deepEqual(new Set(groups.flatMap(group=>group.records.map(pointKey))), expected);
  assert.deepEqual(groups.flatMap(group => group.records.map(record => record.id)).sort(), pinned.map(record => record.id).sort());
  assert.ok(groups.some(group => group.records.length > 4), "source variants are not dropped to satisfy the later origin-view limit");
  for (const group of groups) {
    const first = group.records[0];
    if(group.records.some(record=>record.spawn)) {
      assert.ok(group.records.every(record=>record.mapId===first.mapId&&record.levelId===first.levelId&&record.side===first.side&&record.type===first.type&&utilityMarkerArea(record).id===group.areaId));
      assert.equal(new Set(group.records.map(record=>`${record.target.toLowerCase().trim()}|${record.landingVariant||''}`)).size,1);
    } else assert.ok(group.records.every(record => pointKey(record) === pointKey(first)));
    assert.equal(group.x, first.x); assert.equal(group.y, first.y);
  }
  assert.deepEqual(new Set(splitUtilityDestinations([...published].reverse()).map(group => group.id)), new Set(groups.map(group => group.id)));
});

test("fit overview has one semantic parent on every map while retaining all precise destinations", () => {
  for (const records of contexts) {
    const pinned = records.filter(record => record.showMarker !== false);
    const expected = [...new Set(pinned.map(record => utilityMarkerArea(record).id))].sort();
    for (const unit of [.25, 1.5, 3]) {
      const parents = groupUtilityMarkers(records, unit, true);
      assert.deepEqual(parents.map(group => group.areaId).sort(), expected);
      assert.deepEqual(parents.flatMap(group => group.records.map(record => record.id)).sort(), pinned.map(record => record.id).sort());
      for (const group of parents) {
        assert.equal(group.label, utilityMarkerArea(group.records[0]).label);
        assert.equal(group.x, group.records[0].x); assert.equal(group.y, group.records[0].y);
      }
    }
  }
});

test("one Nuke overview parent expands to all four real Secret smoke landings independently of zoom", () => {
  const records = published.filter(record => record.mapId === "nuke" && record.levelId === "upper" && record.side === "T" && record.type === "Smoke" && utilityMarkerArea(record).id === "nuke:upper:secret");
  const parent = groupUtilityMarkers(records, .5, true);
  assert.equal(parent.length, 1);
  assert.equal(parent[0].records.length, records.length);
  assert.equal(splitUtilityDestinations(parent[0].records).length, 4);
  const zoomed = groupUtilityMarkers(records, .5);
  assert.equal(zoomed.length, 2);
  assert.deepEqual(zoomed.flatMap(group => group.records.map(record => record.id)).sort(), parent[0].records.map(record => record.id).sort());
  const qualified = { ...records[0], id: "qualified", target: "Close Mid Doors", mapId: "dust2", levelId: "main" };
  assert.equal(groupUtilityMarkers([qualified], 1, true)[0].label, "Mid Doors");
  assert.equal(groupUtilityMarkers([qualified], 1)[0].label, "Close Mid Doors");
});

test("nearby area clusters keep real representative points fixed and retain every named area and guide", () => {
  for (const records of contexts) for (const unit of [.5, 1.5, 3]) {
    const groups = groupUtilityMarkers(records, unit, true);
    const before = JSON.stringify(groups);
    const clusters = clusterUtilityAreas(groups, unit);
    assert.equal(JSON.stringify(groups), before);
    assert.deepEqual(clusters.flatMap(cluster => cluster.areas.map(area => area.areaId)).sort(), groups.map(group => group.areaId).sort());
    assert.deepEqual(clusters.flatMap(cluster => cluster.records.map(record => record.id)).sort(), groups.flatMap(group => group.records.map(record => record.id)).sort());
    for (const [index, cluster] of clusters.entries()) {
      assert.ok(groups.some(group => group.x === cluster.x && group.y === cluster.y));
      assert.equal(cluster.x, cluster.areas[0].x); assert.equal(cluster.y, cluster.areas[0].y);
      assert.equal(new Set(cluster.areas.map(area => area.areaId)).size, cluster.areas.length);
      if (cluster.areas.length > 1) assert.equal(cluster.label, "Nearby locations");
      else assert.equal(cluster.label, cluster.areas[0].label);
      for (const other of clusters.slice(index + 1))
        assert.ok(Math.hypot(cluster.x - other.x, cluster.y - other.y) >= 46 * unit - .001);
    }
  }
});

test("cluster spacing scales with the map and explicit pixel distance without moving or averaging centres", () => {
  const base = { ...UTILITY_REFERENCES[0], mapId: "dust2", levelId: "main", side: "T" as const };
  for (const unit of [.5, 1, 2]) {
    const groups = groupUtilityMarkers([
      { ...base, id: "first", target: "Mid Doors", x: 100, y: 200 },
      { ...base, id: "nearby", target: "Lower Tunnels", x: 100 + 45 * unit, y: 200 },
      { ...base, id: "separate", target: "Long Doors", x: 100 + 47 * unit, y: 200 },
    ], unit, true);
    const clusters = clusterUtilityAreas(groups, unit);
    assert.equal(clusters.length, 2);
    assert.equal(clusters[0].x, 100); assert.equal(clusters[0].y, 200);
    assert.deepEqual(clusters[0].areas.map(area => area.id), ["first", "nearby"]);
    assert.equal(clusters[1].x, groups[2].x);
    assert.equal(clusterUtilityAreas(groups, unit, 48).length, 1);
    const smaller = clusterUtilityAreas(groups, unit, 44);
    assert.equal(smaller.length, 2);
    assert.deepEqual(smaller[0].areas.map(area => area.id), ["first"]);
    assert.deepEqual(smaller[1].areas.map(area => area.id), ["nearby", "separate"]);
  }
});

test("same-area refined members deduplicate within a cluster while a single specific label survives", () => {
  const base = { ...UTILITY_REFERENCES[0], mapId: "dust2", levelId: "main", side: "T" as const };
  const groups = groupUtilityMarkers([
    { ...base, id: "doors", target: "Mid Doors", x: 100, y: 200 },
    { ...base, id: "close-doors", target: "Close Mid Doors", x: 120, y: 200 },
    { ...base, id: "lower", target: "Lower Tunnels", x: 105, y: 220 },
  ], .2);
  assert.equal(groups.length, 3);
  const clusters = clusterUtilityAreas(groups, 1);
  assert.equal(clusters.length, 1);
  assert.equal(clusters[0].areas.length, 2);
  const doors = clusters[0].areas.find(area => area.areaId === "dust2:main:mid-doors")!;
  assert.equal(doors.label, "Mid Doors");
  assert.deepEqual(doors.records.map(record => record.id), ["doors", "close-doors"]);
  assert.deepEqual(doors.detailTargets, ["Mid Doors", "Close Mid Doors"]);
  const specific = clusterUtilityAreas([groups.find(group => group.id === "close-doors")!], 1);
  assert.equal(specific[0].label, "Close Mid Doors");
  assert.equal(specific[0].areas[0].label, "Close Mid Doors");
});

test("cluster IDs reflect stable membership, source duplicates remain preferred, and floors or sides never mix", () => {
  const base = { ...UTILITY_REFERENCES[0], mapId: "nuke", levelId: "upper", side: "T" as const, target: "A Site" };
  const preferred = { ...base, id: "preferred", x: 100, y: 200 };
  const groups = groupUtilityMarkers([
    preferred,
    { ...base, id: "other", target: "Hut", x: 120, y: 200 },
  ], .2, true);
  const first = clusterUtilityAreas(groups, 1);
  const reversed = clusterUtilityAreas([...groups].reverse(), 1);
  assert.equal(first[0].id, reversed[0].id);
  assert.equal(first[0].areaId, reversed[0].areaId);
  assert.equal(first[0].x, groups[0].x); assert.equal(reversed[0].x, groups[1].x);
  const duplicates = clusterUtilityAreas([groups[0], { ...groups[0], records: [{ ...preferred, title: "Later duplicate" }] }], 1);
  assert.equal(duplicates[0].records.length, 1);
  assert.equal(duplicates[0].records[0], preferred);
  const otherScopes = groupUtilityMarkers([
    preferred,
    { ...preferred, id: "ct", side: "CT" },
    { ...preferred, id: "lower", levelId: "lower" },
  ], 1, true);
  assert.equal(clusterUtilityAreas(otherScopes, 1).length, 3);
});
