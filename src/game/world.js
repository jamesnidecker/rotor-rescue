import { CEILING_Y, GROUND_Y, HELI_W, HELI_H } from './config.js';

// Turns a level data file (src/levels/*.js) into rectangles the game can use.
// Game logic lives here; level CONTENT lives in the level files.

export const PERSON_W = 4;
export const PERSON_H = 6;

export function buildWorld(level) {
  const solids = level.buildings.map((b, i) => ({
    x: b.x,
    y: GROUND_Y - b.h,
    w: b.w,
    h: b.h,
    kind: 'building',
    shade: b.shade ?? i % 3,
  }));

  const p = level.helipad;
  const pad = { x: p.x, y: GROUND_Y - p.h, w: p.w, h: p.h, kind: 'helipad' };
  solids.push(pad);

  const people = level.people.map((person, i) => {
    const roof = solids.find(
      (s) => s.kind === 'building' && person.x >= s.x && person.x + PERSON_W <= s.x + s.w
    );
    if (!roof) throw new Error(`Level ${level.id}: person ${i} at x=${person.x} is not on a roof`);
    return { id: i, x: person.x, y: roof.y - PERSON_H, w: PERSON_W, h: PERSON_H, roofY: roof.y };
  });

  return {
    id: level.id,
    name: level.name,
    start: level.start,
    length: level.length,
    solids,
    pad,
    people,
  };
}

// The crash box: smaller than the helicopter, centred on it.
export function hitbox(heli, pct) {
  const k = pct / 100;
  const w = HELI_W * k;
  const h = HELI_H * k;
  return { x: heli.x + (HELI_W - w) / 2, y: heli.y + (HELI_H - h) / 2, w, h };
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Returns null, or what was hit.
export function checkCrash(world, heli, t) {
  const hb = hitbox(heli, t.hitboxPct);
  if (hb.y < CEILING_Y) return 'ceiling';
  if (hb.y + hb.h > GROUND_Y) return 'ground';
  for (const s of world.solids) if (overlap(hb, s)) return s.kind;
  return null;
}

// People within reach: helicopter passes over them, its bottom no more than
// `pickupReach` px above the roof they stand on.
export function checkPickups(world, heli, rescued, t) {
  const got = [];
  const bottom = heli.y + HELI_H;
  for (const p of world.people) {
    if (rescued.has(p.id)) continue;
    const overX = heli.x < p.x + p.w + 2 && heli.x + HELI_W > p.x - 2;
    if (overX && bottom >= p.roofY - t.pickupReach) got.push(p);
  }
  return got;
}

// Reached the helipad: the helicopter is over the pad and above its surface.
export function reachedHelipad(world, heli) {
  const pad = world.pad;
  return heli.x + HELI_W >= pad.x + 6 && heli.y + HELI_H <= pad.y;
}
