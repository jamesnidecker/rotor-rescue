import { HEX } from '../../kit/palette.js';
import { drawSprite, seeded } from '../../kit/pixels.js';
import { GAME_W, GROUND_Y, HUD_H } from '../config.js';

// Living-city details (none of them can be crashed into). Background things
// stay small, soft and "far away", so they never look like obstacles. Real
// birds to dodge come in later levels and will look clearly different
// (bigger, darker, in front).

const BIRD = [
  ['B...B', '.B.B.', '..B..'],
  ['.....', 'BB.BB', '..B..'],
];
const BALLOON = [
  '..HHH..',
  '.HYYYH.',
  'HHYYYHH',
  'HHYYYHH',
  '.HYYYH.',
  '..HYH..',
  '...D...',
  '..D.D..',
  '..UUU..',
];
const BLIMP = [
  '....LLLLLLLL....',
  '..LLLLLLLLLLLL.D',
  '.LLLLLLLLLLLLLDD',
  '.RRRRRRRRRRRRRRD',
  '..LLLLLLLLLLLL.D',
  '....LLLLLLLL....',
  '......MMM.......',
];
const CAR = ['.XXX...', 'XXXXXXX', '.D...D.'];
const CAR_COLOURS = ['R', 'Y', 'C', 'W', 'O', 'B'];
const carSprite = (c, flip) => CAR.map((r) => {
  const row = r.replace(/X/g, c);
  return flip ? [...row].reverse().join('') : row;
});

// How far-away things are drawn (picked on the picks page):
//   blue  = soft blue silhouettes, the same colour as the far skyline
//   grey  = light grey silhouettes
//   color = in full colour
export const SILHOUETTES = {
  blue: { name: 'Soft blue silhouettes', note: 'Same colour as the far skyline: reads as "far away"' },
  grey: { name: 'Light grey silhouettes', note: 'Grey shapes, no colour' },
  color: { name: 'In colour', note: 'Full colour (most eye-catching)' },
};
const silhouette = (rows, style) =>
  style === 'color' ? rows : rows.map((r) => r.replace(/[^.]/g, style === 'grey' ? 'L' : 'B'));
const cache = new Map();
const look = (name, rows, style) => {
  const key = name + style;
  if (!cache.has(key)) cache.set(key, silhouette(rows, style));
  return cache.get(key);
};

export const DETAILS = {
  birds: { name: 'Birds in the distance', note: 'A small flock, soft blue, far away' },
  balloon: { name: 'Hot-air balloon', note: 'Far away, slowly drifting up and down' },
  blimp: { name: 'Blimp', note: 'High up, slowly floating' },
  cars: { name: 'Cars on the road', note: 'Little cars driving both ways' },
  antennaLights: { name: 'Blinking antenna lights', note: 'Red lights on the antennas' },
  windows: { name: 'Windows switching on and off', note: 'Now and then a window lights up' },
};

// Cars: fixed set, deterministic, spread over the level.
export function makeCars(levelWidth) {
  const rnd = seeded(42);
  const cars = [];
  for (let i = 0; i < Math.ceil(levelWidth / 90); i++) {
    const right = i % 2 === 0;
    cars.push({
      x: rnd() * levelWidth,
      y: right ? GROUND_Y + 4 : GROUND_Y + 10,
      speed: (right ? 1 : -1) * (24 + rnd() * 26),
      sprite: carSprite(CAR_COLOURS[i % CAR_COLOURS.length], !right),
    });
  }
  return cars;
}

// Draw all enabled details for this frame onto a 2D canvas.
//   on: { birds: true, ... }   cam: camera x   t: time in seconds
//   level: { width, windows, lights } (from levelCanvas info)
// ---- shared movement (used by the picks page and the game) ----
const acrossSky = (t, cam, speed, parallax, span, offset) =>
  GAME_W + 20 - ((((t * speed + cam * parallax + offset) % span) + span) % span);
const FLOCK = [[0, 0], [7, -4], [13, 2], [19, -2], [8, 6]];

// Bird positions on screen: [{ x, y, frame }]
export function birdFlock(cam, t) {
  const baseX = Math.round(acrossSky(t, cam, 16, 0.2, GAME_W + 160, 60));
  const baseY = HUD_H + 56 + Math.round(Math.sin(t * 0.6) * 6);
  return FLOCK.map(([dx, dy], i) => ({ x: baseX + dx, y: baseY + dy, frame: Math.floor(t * 4 + i) % 2 }));
}
// The two bird frames as pixel rows, facing left (they fly right-to-left).
export function birdFrames(style = 'blue') {
  return BIRD.map((f) => silhouette(f, style === 'color' ? 'blue' : style).map((r) => [...r].reverse().join('')));
}
// A car's x in the world at time t.
export function carX(c, t, width) {
  return (((c.x + c.speed * t) % width) + width) % width;
}
export const antennaLightOn = (t) => Math.floor(t * 1.5) % 2 === 0;

export function createDetails(level) {
  const cars = makeCars(level.width);
  const winRnd = seeded(7);
  const winOn = new Map(); // window index -> until time
  return {
    // Things far away (drawn behind the buildings).
    drawFar(g, on, cam, t, style = 'blue') {
      // Everything far away moves right-to-left across the sky: its own slow
      // speed plus a little parallax from the camera.
      const across = (speed, parallax, span, offset) =>
        GAME_W + 20 - ((((t * speed + cam * parallax + offset) % span) + span) % span);
      if (on.blimp) {
        const x = Math.round(across(6, 0.05, GAME_W + 60, 0));
        drawSprite(g, look('blimp', BLIMP, style), x, HUD_H + 10 + Math.round(Math.sin(t * 0.4) * 2));
      }
      if (on.balloon) {
        const x = Math.round(across(2, 0.1, GAME_W + 220, 120));
        drawSprite(g, look('balloon', BALLOON, style), x, Math.round(HUD_H + 40 + Math.sin(t * 0.25) * 10));
      }
      if (on.birds) {
        const frames = birdFrames(style);
        for (const b of birdFlock(cam, t)) drawSprite(g, frames[b.frame], b.x, b.y);
      }
    },
    // Things on the buildings and road (drawn on top of the level picture).
    drawNear(g, on, cam, t) {
      if (on.windows) {
        // now and then one window lights up white for a few seconds
        if (winRnd() < 0.04 && level.windows.length) {
          winOn.set(Math.floor(winRnd() * level.windows.length), t + 2 + winRnd() * 4);
        }
        for (const [i, until] of winOn) {
          if (t > until) {
            winOn.delete(i);
            continue;
          }
          const [wx, wy] = level.windows[i];
          if (wx - cam > -4 && wx - cam < GAME_W + 4) {
            g.fillStyle = HEX.yellow;
            g.fillRect(wx - cam, wy, 2, 3);
          }
        }
      }
      if (on.antennaLights && antennaLightOn(t)) {
        g.fillStyle = HEX.white;
        for (const [lx, ly] of level.lights) if (lx - cam > -2 && lx - cam < GAME_W + 2) g.fillRect(lx - cam, ly, 1, 1);
      }
      if (on.cars) {
        for (const c of cars) {
          const x = carX(c, t, level.width) - cam;
          if (x > -8 && x < GAME_W + 8) drawSprite(g, c.sprite, Math.round(x), c.y);
        }
      }
    },
  };
}
