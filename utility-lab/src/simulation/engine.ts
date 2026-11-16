export type Point = { x: number; y: number };
export type Wall = { a: Point; b: Point };
export type Team = "T" | "CT";
export type GrenadeKind = "smoke" | "flash" | "molotov" | "incendiary" | "he";

export interface Actor {
  id: string;
  team: Team;
  start: Point;
  waypoints: Point[];
  /** Optional pause after reaching each corresponding waypoint, in seconds. */
  holds?: number[];
  delay: number;
  /** World units per second. */
  speed: number;
  /** Degrees clockwise from the right side of the radar. */
  facing: number;
  faceRoute?: boolean;
}

export interface Grenade {
  id: string;
  kind: GrenadeKind;
  at: Point;
  /** Seconds after playback starts at which the grenade takes effect. */
  time: number;
  /** For flashbangs this overrides the maximum blind time. */
  duration?: number;
  throwerId?: string;
  /** Seconds before activation when the grenade leaves the thrower's hand. */
  flightSeconds?: number;
}

export interface Scenario {
  actors: Actor[];
  grenades: Grenade[];
  unitsPerBoardUnit: number;
  walls?: Wall[];
}

export interface ActorFrame extends Point {
  id: string;
  team: Team;
  facing: number;
  hp: number;
  blind: number;
  blindRemaining: number;
  burning: boolean;
  inSmoke: boolean;
  blockedByWall: boolean;
}

type Circle = Point & { radius: number };
export interface EffectFrame extends Circle {
  id: string;
  kind: GrenadeKind;
  remaining: number;
  progress: number;
  opacity: number;
  /** World-space holes in an individual smoke, in board coordinates. */
  holes: Circle[];
}

export interface Frame {
  time: number;
  actors: ActorFrame[];
  effects: EffectFrame[];
  flights: FlightFrame[];
}

export interface FlightFrame extends Point {
  id: string;
  kind: GrenadeKind;
  from: Point;
  to: Point;
  progress: number;
}

export interface Simulation {
  duration: number;
  canceledThrowIds: string[];
  frameAt: (time: number) => Frame;
}

// The smoke and fire lifetimes and movement speeds are based on game
// convars / demo measurements. Radii for smoke, HE and flash, their radial
// falloffs and the duration of an HE opening are planar rehearsal estimates.
export const DEFAULTS = {
  speed: 215,
  flashBlindSeconds: 5.3,
  damagePerSecond: 40,
  duration: { smoke: 22, flash: 0.4, molotov: 7, incendiary: 5.5, he: 0.65 },
  radius: { smoke: 144, flash: 1500, molotov: 150, incendiary: 110, he: 350 },
} as const;

// Published game overview scales (2026-11-11), in units per original pixel.
const overviewScales: Record<string, number> = {
  ancient: 5,
  anubis: 5.22,
  cache: 5.5,
  dust2: 4.4,
  inferno: 4.9,
  mirage: 5,
  nuke: 7,
  vertigo: 4,
};
export function unitsPerBoardUnitForMap(mapId: string): number {
  return ((overviewScales[mapId.replace(/^de_/, "")] ?? 5) * 1024) / 1000;
}

const FIRE_TICK = 0.2;
const HE_OPEN_SECONDS = 1.5;
const EPS = 1e-9;
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(value, low));
const within = (point: Point, circle: Circle) =>
  distance(point, circle) <= circle.radius;
const activeAt = (starts: number, ends: number, time: number) =>
  starts <= time && time < ends;

interface Leg {
  a: Point;
  b: Point;
  start: number;
  end: number;
  facing: number;
}

/** First crossing of a zero-width cover segment. A token can leave a wall
 * it starts on or travel alongside it. A corner reached head-on blocks it. */
function firstWallFraction(
  from: Point,
  to: Point,
  walls: Wall[],
): number | undefined {
  const dx = to.x - from.x,
    dy = to.y - from.y;
  let first = Infinity;
  for (const { a, b } of walls) {
    const wx = b.x - a.x,
      wy = b.y - a.y;
    const determinant = dx * wy - dy * wx;
    if (Math.abs(determinant) <= EPS) continue;
    const ax = a.x - from.x,
      ay = a.y - from.y;
    const t = (ax * wy - ay * wx) / determinant;
    const u = (ax * dy - ay * dx) / determinant;
    if (t > EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS)
      first = Math.min(first, t);
  }
  return Number.isFinite(first) ? Math.min(first, 1) : undefined;
}

function route(
  actor: Actor,
  scale: number,
  walls: Wall[],
): { legs: Leg[]; blockedAt: number } {
  const legs: Leg[] = [];
  let origin = actor.start;
  let startTime = actor.delay;
  for (const [index, destination] of actor.waypoints.entries()) {
    const length = distance(origin, destination);
    if (length > 0) {
      const collision = firstWallFraction(origin, destination, walls);
      // Stop at most one world unit short, to remain on the arrival side.
      const fraction =
        collision === undefined
          ? 1
          : Math.max(0, collision - 1 / (length * scale));
      if (!fraction) return { legs, blockedAt: startTime };
      const end = startTime + (length * fraction * scale) / actor.speed;
      legs.push({
        a: origin,
        b: {
          x: origin.x + (destination.x - origin.x) * fraction,
          y: origin.y + (destination.y - origin.y) * fraction,
        },
        start: startTime,
        end,
        facing:
          (Math.atan2(destination.y - origin.y, destination.x - origin.x) *
            180) /
          Math.PI,
      });
      if (collision !== undefined) return { legs, blockedAt: end };
      startTime = end;
    }
    origin = destination;
    const hold = clamp(actor.holds?.[index] ?? 0, 0, 120);
    if (hold > 0) {
      legs.push({
        a: destination,
        b: destination,
        start: startTime,
        end: startTime + hold,
        facing: legs[legs.length - 1]?.facing ?? actor.facing,
      });
      startTime += hold;
    }
  }
  return { legs, blockedAt: Infinity };
}

function pose(
  actor: Actor,
  legs: Leg[],
  time: number,
): Point & { facing: number } {
  if (!legs.length || time < actor.delay)
    return { ...actor.start, facing: actor.facing };
  const leg =
    legs.find((segment) => time < segment.end) ?? legs[legs.length - 1];
  const fraction = clamp((time - leg.start) / (leg.end - leg.start), 0, 1);
  return {
    x: leg.a.x + fraction * (leg.b.x - leg.a.x),
    y: leg.a.y + fraction * (leg.b.y - leg.a.y),
    facing: actor.faceRoute === false ? actor.facing : leg.facing,
  };
}

const orientation = (p: Point, q: Point, r: Point) =>
  (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);

/** Closed segment intersection, including the case of looking along a wall. */
function blocked(from: Point, to: Point, walls: Wall[]) {
  return walls.some(({ a, b }) => {
    if (a.x === b.x && a.y === b.y) return false;
    if (
      Math.max(from.x, to.x) < Math.min(a.x, b.x) ||
      Math.min(from.x, to.x) > Math.max(a.x, b.x) ||
      Math.max(from.y, to.y) < Math.min(a.y, b.y) ||
      Math.min(from.y, to.y) > Math.max(a.y, b.y)
    )
      return false;
    return (
      orientation(from, to, a) * orientation(from, to, b) <= 0 &&
      orientation(a, b, from) * orientation(a, b, to) <= 0
    );
  });
}

interface Effect extends Circle {
  grenade: Grenade;
  start: number;
  end: number;
}

const isFire = (effect: Effect) =>
  effect.grenade.kind === "molotov" || effect.grenade.kind === "incendiary";

function prepareEffects(
  grenades: Grenade[],
  scale: number,
  walls: Wall[],
): Effect[] {
  const effects = grenades.map((grenade) => {
    const lifetime =
      grenade.kind === "flash"
        ? DEFAULTS.duration.flash
        : (grenade.duration ?? DEFAULTS.duration[grenade.kind]);
    return {
      ...grenade.at,
      grenade,
      start: grenade.time,
      end: grenade.time + lifetime,
      radius: DEFAULTS.radius[grenade.kind] / scale,
    };
  });
  const smokes = effects.filter((effect) => effect.grenade.kind === "smoke");
  for (const fire of effects.filter(isFire)) {
    for (const smoke of smokes) {
      const overlap = Math.max(fire.start, smoke.start);
      if (
        overlap < Math.min(fire.end, smoke.end) &&
        within(fire, smoke) &&
        !blocked(fire, smoke, walls)
      )
        fire.end = overlap;
    }
  }
  return effects;
}

function effectFrame(
  effect: Effect,
  time: number,
  blasts: Effect[],
  scale: number,
  walls: Wall[],
): EffectFrame {
  const { grenade, start, end } = effect;
  const age = time - start;
  const remaining = end - time;
  const progress = age / (end - start);
  const smoke = grenade.kind === "smoke";
  const holes: Circle[] = [];
  if (smoke) {
    // A nearby HE opens only the overlap. The opening closes gradually.
    for (const blast of blasts) {
      const elapsed = time - blast.start;
      if (blast.start < start || elapsed < 0 || elapsed >= HE_OPEN_SECONDS)
        continue;
      const radius =
        (160 / scale) * Math.min(1, (HE_OPEN_SECONDS - elapsed) / 0.5);
      if (
        distance(effect, blast) < radius + effect.radius &&
        !blocked(effect, blast, walls)
      )
        holes.push({ x: blast.x, y: blast.y, radius });
    }
  }
  return {
    id: grenade.id,
    kind: grenade.kind,
    x: effect.x,
    y: effect.y,
    remaining,
    progress,
    radius: effect.radius * (smoke ? clamp(age / 0.7, 0.1, 1) : 1),
    opacity: smoke ? clamp(Math.min(age / 0.4, remaining / 1.5), 0, 1) : 1,
    holes,
  };
}

interface Damage {
  time: number;
  hp: number;
}

interface Flash {
  time: number;
  duration: number;
  strength: number;
}

function flashAt(player: ReturnType<typeof pose>, effect: Effect): Flash {
  const distanceFactor = clamp(
    1 - distance(player, effect) / effect.radius,
    0,
    1,
  );
  const angle = (player.facing * Math.PI) / 180;
  const towards = Math.atan2(effect.y - player.y, effect.x - player.x);
  const dot = distance(player, effect) < EPS ? 1 : Math.cos(towards - angle);
  const strength = distanceFactor * (0.2 + (0.8 * (1 + dot)) / 2);
  return {
    time: effect.start,
    strength,
    duration:
      strength * (effect.grenade.duration ?? DEFAULTS.flashBlindSeconds),
  };
}

interface FireTick {
  time: number;
  fires: Effect[];
}
/** Build a fixed damage clock once. Crossings between samples are approximate. */
function fireTicks(fires: Effect[]): FireTick[] {
  const byTick = new Map<number, Effect[]>();
  for (const fire of fires) {
    const first = Math.floor(fire.start / FIRE_TICK + EPS) + 1;
    const last = Math.floor(fire.end / FIRE_TICK + EPS);
    for (let tick = first; tick <= last; tick++) {
      const burning = byTick.get(tick);
      if (burning) burning.push(fire);
      else byTick.set(tick, [fire]);
    }
  }
  return [...byTick.entries()]
    .sort(([a], [b]) => a - b)
    .map(([tick, fires]) => ({ time: tick / 5, fires }));
}

function nearFire(player: Point, fire: Effect, walls: Wall[]) {
  return within(player, fire) && !blocked(player, fire, walls);
}

const releaseTime = (grenade: Grenade) =>
  Math.max(0, grenade.time - (grenade.flightSeconds ?? 0));

/** Compile all time-dependent hits once; sampling or rewinding never mutates a tactic. */
export function compileScenario(scenario: Scenario): Simulation {
  return compileThrows(scenario, new Set<string>());
}

function compileThrows(scenario: Scenario, canceled: Set<string>): Simulation {
  const walls = scenario.walls ?? [];
  const grenades = scenario.grenades.filter(
    (grenade) => !canceled.has(grenade.id),
  );
  const effects = prepareEffects(grenades, scenario.unitsPerBoardUnit, walls);
  const fires = effects.filter(isFire);
  const ticks = fireTicks(fires);
  const blasts = effects.filter((effect) => effect.grenade.kind === "he");
  const flashbangs = effects.filter(
    (effect) => effect.grenade.kind === "flash",
  );
  let duration = effects.reduce((max, effect) => Math.max(max, effect.end), 1);

  const tracks = scenario.actors.map((actor) => {
    const { legs, blockedAt } = route(actor, scenario.unitsPerBoardUnit, walls);
    const hits: { time: number; amount: number }[] = [];
    for (const blast of blasts) {
      const player = pose(actor, legs, blast.start);
      if (within(player, blast) && !blocked(player, blast, walls)) {
        // Unarmored radial estimate. No equipment or team damage modifiers.
        const amount = Math.round(
          99 * (1 - distance(player, blast) / blast.radius) ** 2,
        );
        if (amount > 0) hits.push({ time: blast.start, amount });
      }
    }
    for (const tick of ticks) {
      const player = pose(actor, legs, tick.time);
      if (tick.fires.some((fire) => nearFire(player, fire, walls)))
        hits.push({
          time: tick.time,
          amount: DEFAULTS.damagePerSecond * FIRE_TICK,
        });
    }
    hits.sort((a, b) => a.time - b.time);
    const damage: Damage[] = [];
    let hp = 100,
      death = Infinity;
    for (const hit of hits) {
      hp = Math.max(0, hp - hit.amount);
      damage.push({ time: hit.time, hp });
      if (hp === 0) {
        death = hit.time;
        break;
      }
    }
    const flashes: Flash[] = [];
    for (const flash of flashbangs) {
      if (flash.start >= death) continue;
      const player = pose(actor, legs, flash.start);
      if (within(player, flash) && !blocked(player, flash, walls)) {
        const exposure = flashAt(player, flash);
        flashes.push(exposure);
        duration = Math.max(
          duration,
          Math.min(death, exposure.time + exposure.duration),
        );
      }
    }
    const arrival = Number.isFinite(blockedAt)
      ? blockedAt
      : (legs[legs.length - 1]?.end ?? 0);
    duration = Math.max(duration, Math.min(arrival, death));
    return { actor, legs, blockedAt, death, damage, flashes };
  });

  // An invalid throw can otherwise kill the thrower of a later, valid throw.
  // Deaths before the first invalid release are already final. Cancel those
  // throwers' remaining releases together, then resolve later deaths anew.
  const actorsById = new Map(tracks.map((track) => [track.actor.id, track]));
  const invalid = grenades.filter((grenade) => {
    const thrower = grenade.throwerId
      ? actorsById.get(grenade.throwerId)
      : undefined;
    return thrower && thrower.death < releaseTime(grenade);
  });
  if (invalid.length) {
    const earliest = Math.min(...invalid.map(releaseTime));
    for (const grenade of invalid) {
      const thrower = actorsById.get(grenade.throwerId!);
      if (thrower && thrower.death < earliest) canceled.add(grenade.id);
    }
    return compileThrows(scenario, canceled);
  }
  const throws = grenades.flatMap((grenade) => {
    const thrower = grenade.throwerId
      ? actorsById.get(grenade.throwerId)
      : undefined;
    const start = releaseTime(grenade);
    if (!thrower || start >= grenade.time) return [];
    const { x, y } = pose(thrower.actor, thrower.legs, start);
    return [{ grenade, start, from: { x, y } }];
  });
  // Preserve a canceled throw's timestamp on the scrubber.
  for (const grenade of scenario.grenades)
    duration = Math.max(duration, grenade.time);
  return {
    duration,
    canceledThrowIds: [...canceled],
    frameAt(seconds) {
      const time = clamp(Number.isNaN(seconds) ? 0 : seconds, 0, duration);
      const visible = effects.filter((effect) =>
        activeAt(effect.start, effect.end, time),
      );
      const painted = visible.map((effect) =>
        effectFrame(effect, time, blasts, scenario.unitsPerBoardUnit, walls),
      );
      const activeFires = visible.filter(isFire);
      const smokes = painted.filter(
        (effect) => effect.kind === "smoke" && effect.opacity > 0,
      );
      const actors = tracks.map(
        ({ actor, legs, blockedAt, death, damage, flashes }): ActorFrame => {
          const player = pose(actor, legs, Math.min(time, death));
          let hp = 100;
          for (const hit of damage) {
            if (hit.time > time) break;
            hp = hit.hp;
          }
          let blind = 0,
            blindRemaining = 0;
          if (hp > 0)
            for (const exposure of flashes) {
              const remaining = exposure.time + exposure.duration - time;
              if (exposure.time > time || remaining <= 0) continue;
              blindRemaining = Math.max(blindRemaining, remaining);
              const fade = Math.min(
                1,
                remaining / Math.max(EPS, exposure.duration * 0.6),
              );
              blind = Math.max(blind, exposure.strength * fade);
            }
          return {
            id: actor.id,
            team: actor.team,
            ...player,
            hp,
            blind,
            blindRemaining,
            blockedByWall: hp > 0 && time >= blockedAt,
            burning:
              hp > 0 &&
              activeFires.some((fire) => nearFire(player, fire, walls)),
            inSmoke: smokes.some(
              (smoke) =>
                within(player, smoke) &&
                !blocked(player, smoke, walls) &&
                !smoke.holes.some((hole) => within(player, hole)),
            ),
          };
        },
      );
      const flights = throws
        .filter(({ start, grenade }) => activeAt(start, grenade.time, time))
        .map(({ start, grenade, from }): FlightFrame => {
          const progress = (time - start) / (grenade.time - start);
          return {
            id: grenade.id,
            kind: grenade.kind,
            from,
            to: grenade.at,
            progress,
            x: from.x + (grenade.at.x - from.x) * progress,
            y: from.y + (grenade.at.y - from.y) * progress,
          };
        });
      return { time, actors, effects: painted, flights };
    },
  };
}
