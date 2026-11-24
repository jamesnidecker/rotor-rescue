// Level sanity check: can a level be finished — and can all people be saved —
// with the default tuning and only coarse, human-speed inputs?
// Usage: npm run check   (runs a small beam search over tap / hold / let go)
import { LEVELS } from '../src/game/levels/index.js';
import { buildWorld, checkCrash, checkPickups, reachedHelipad, pastLevelEnd } from '../src/game/world.js';
import { createHeli, press, release, stepHeli } from '../src/game/physics.js';
import { DEFAULT_TUNING } from '../src/game/tuning.js';

const DT = 1 / 120;

function clone(s) {
  return { heli: { ...s.heli }, rescued: new Set(s.rescued), alive: true, done: false };
}

function run(level, t, decisionSec, beamWidth) {
  const world = buildWorld(level);
  const stepsPerDecision = Math.round(decisionSec / DT);
  let beam = [{ heli: createHeli(level.start.x, level.start.y), rescued: new Set(), alive: true }];
  beam[0].heli.waitingForFirstTouch = false; // be strict: gravity from the first frame
  let finished = [];
  const maxDecisions = Math.ceil(world.length / t.forwardSpeed / decisionSec) + 10;
  for (let d = 0; d < maxDecisions && beam.length; d++) {
    const next = new Map();
    for (const s of beam) {
      for (const action of ['release', 'hold', 'tap']) {
        const n = clone(s);
        if (action === 'release') release(n.heli);
        else if (action === 'tap' || !n.heli.held) press(n.heli, t);
        for (let i = 0; i < stepsPerDecision; i++) {
          stepHeli(n.heli, t, DT);
          for (const p of checkPickups(world, n.heli, n.rescued, t)) n.rescued.add(p.id);
          if (reachedHelipad(world, n.heli, t)) { n.done = true; break; }
          if (checkCrash(world, n.heli, t) || pastLevelEnd(world, n.heli)) { n.alive = false; break; }
        }
        if (!n.alive) continue;
        if (n.done) { finished.push(n); continue; }
        const key = `${[...n.rescued].sort()}|${Math.round(n.heli.y)}|${Math.round(n.heli.vy / 20)}|${n.heli.held}|${n.heli.hovering}`;
        if (!next.has(key)) next.set(key, n);
      }
    }
    beam = [...next.values()]
      .sort((a, b) => b.rescued.size - a.rescued.size || Math.random() - 0.5)
      .slice(0, beamWidth);
  }
  const best = finished.reduce((m, s) => Math.max(m, s.rescued.size), -1);
  return { finishable: finished.length > 0, bestRescued: best, total: world.people.length };
}

let ok = true;
for (const level of LEVELS) {
  const cases = [
    ['default tuning, input every 0.10 s', DEFAULT_TUNING, 0.1],
    ['default tuning, input every 0.15 s', DEFAULT_TUNING, 0.15],
    ['hitbox 100%, input every 0.10 s', { ...DEFAULT_TUNING, hitboxPct: 100 }, 0.1],
    ['hover limit 1 (time per hold)', { ...DEFAULT_TUNING, hoverLimitMode: 1 }, 0.1],
    ['hover limit 2 (gauge)', { ...DEFAULT_TUNING, hoverLimitMode: 2 }, 0.1],
  ];
  for (const [name, t, dec] of cases) {
    const r = run(level, t, dec, 400);
    const line = `Level ${level.id} (${name}): ${r.finishable ? 'finishable' : 'NOT FINISHABLE'}, best rescue ${r.bestRescued}/${r.total}`;
    console.log(line);
    if (!r.finishable || r.bestRescued < r.total) ok = false;
  }
  const secs = (level.helipad.x - level.start.x) / DEFAULT_TUNING.forwardSpeed;
  console.log(`Level ${level.id}: about ${secs.toFixed(0)} s of flying at default speed`);
}
process.exit(ok ? 0 : 1);
