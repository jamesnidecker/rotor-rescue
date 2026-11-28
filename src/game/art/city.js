import { HEX } from '../../kit/palette.js';
import { ditherRect, ditherGradient, pixelCircle, seeded } from '../../kit/pixels.js';

// City art for level 1 ("city, morning"), drawn in code.
// Rule: everything you can crash into is clear and strong; the background is
// soft and low in contrast, so it can never be mistaken for an obstacle.

const SHADES = [
  { body: HEX.midGrey, lit: HEX.lightGrey, dark: HEX.darkGrey },
  { body: HEX.lightGrey, lit: HEX.white, dark: HEX.midGrey },
  { body: HEX.darkGrey, lit: HEX.midGrey, dark: HEX.black },
];

// One building (x, y = top-left on the canvas, w x h). Windows, edges and a
// few rooftop details, all from the palette. `seed` keeps it the same each time.
// `info` (optional) collects window and antenna-light positions, for animation.
export function drawBuilding(ctx, x, y, w, h, shadeIndex = 0, seed = 1, info = null) {
  const s = SHADES[shadeIndex % SHADES.length];
  const rnd = seeded(seed * 7919 + w * 31 + h);
  ctx.fillStyle = s.body;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = s.lit; // lit left side and top ledge
  ctx.fillRect(x, y, 2, h);
  ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = s.dark; // shadow side and ledge underline
  ctx.fillRect(x + w - 2, y, 2, h);
  ctx.fillRect(x + 2, y + 2, w - 4, 1);

  // Windows: 2x3, every 5 px across and 6 px down. Morning: sky reflections.
  for (let wy = y + 6; wy + 3 < y + h - 4; wy += 6) {
    for (let wx = x + 4; wx + 2 < x + w - 3; wx += 5) {
      const r = rnd();
      ctx.fillStyle = r < 0.12 ? HEX.white : r < 0.55 ? HEX.skyBlue : HEX.royalBlue;
      ctx.fillRect(wx, wy, 2, 3);
      if (info) info.windows.push([wx, wy, ctx.fillStyle]);
    }
  }

  // Rooftop details (never on roofs with people: pass seed 0 to skip them).
  if (seed && w >= 30) {
    const kind = Math.floor(rnd() * 3);
    if (kind === 0) {
      // water tank on legs
      const tx = x + 6 + Math.floor(rnd() * (w - 20));
      ctx.fillStyle = HEX.brown;
      ctx.fillRect(tx, y - 7, 7, 5);
      ctx.fillStyle = HEX.darkGrey;
      ctx.fillRect(tx + 1, y - 2, 1, 2);
      ctx.fillRect(tx + 5, y - 2, 1, 2);
      ctx.fillRect(tx - 1, y - 8, 9, 1);
    } else if (kind === 1) {
      // antenna with a red light
      const ax = x + w - 8;
      ctx.fillStyle = HEX.darkGrey;
      ctx.fillRect(ax, y - 9, 1, 9);
      ctx.fillStyle = HEX.red;
      ctx.fillRect(ax, y - 10, 1, 1);
      if (info) info.lights.push([ax, y - 10]);
    } else {
      // air conditioning box
      const bx = x + 4 + Math.floor(rnd() * (w - 16));
      ctx.fillStyle = s.lit;
      ctx.fillRect(bx, y - 4, 8, 4);
      ctx.fillStyle = s.dark;
      ctx.fillRect(bx + 2, y - 3, 4, 1);
    }
  }
}

// Morning sky versions to pick from. All keep the lower sky (where you fly)
// plain and calm.
export const SKIES = {
  A: {
    name: 'Smooth fade',
    note: 'Royal blue at the top fading into sky blue, with a fine dither (no stripes)',
    draw(ctx, w, top, bottom) {
      const h = bottom - top;
      ctx.fillStyle = HEX.skyBlue;
      ctx.fillRect(0, top, w, h);
      ditherGradient(ctx, 0, top, w, Math.round(h * 0.45), HEX.royalBlue, HEX.skyBlue);
    },
  },
  B: {
    name: 'Retro lines',
    note: 'Classic 80s: royal blue lines that get thinner and further apart',
    draw(ctx, w, top, bottom) {
      const h = bottom - top;
      ctx.fillStyle = HEX.royalBlue;
      ctx.fillRect(0, top, w, Math.round(h * 0.08));
      ctx.fillStyle = HEX.skyBlue;
      let y = top + Math.round(h * 0.08);
      ctx.fillRect(0, y, w, bottom - y);
      // alternating bands: blue line, then a growing gap
      let line = 5;
      let gap = 2;
      ctx.fillStyle = HEX.royalBlue;
      while (line > 0 && y < top + h * 0.5) {
        y += gap;
        ctx.fillRect(0, y, w, line);
        y += line;
        line -= 1;
        gap += 3;
      }
    },
  },
  C: {
    name: 'Plain',
    note: 'Just sky blue: the calmest, most classic look',
    draw(ctx, w, top, bottom) {
      ctx.fillStyle = HEX.skyBlue;
      ctx.fillRect(0, top, w, bottom - top);
    },
  },
};

export function drawSky(ctx, w, top, bottom, key = 'A') {
  (SKIES[key] || SKIES.A).draw(ctx, w, top, bottom);
}

// Cloud versions to pick from. Each draws one cloud of about width w.
function puffy(ctx, x, y, w, rnd) {
  const r = Math.max(3, Math.round(w / 6));
  const n = Math.max(3, Math.round(w / (r * 1.4)));
  const centers = [];
  for (let i = 0; i < n; i++) {
    const cx = x + r + Math.round(((w - 2 * r) * i) / (n - 1));
    const lift = i === 0 || i === n - 1 ? 0 : Math.round(r * (0.4 + rnd() * 0.6));
    const rr = i === 0 || i === n - 1 ? r - 1 : r + Math.round(rnd() * 2);
    centers.push([cx, y + r * 2 - lift, rr]);
  }
  ctx.fillStyle = HEX.lightGrey; // soft grey underside, 1 px lower
  for (const [cx, cy, rr] of centers) pixelCircle(ctx, cx, cy + 1, rr);
  ctx.fillRect(x + r, y + r * 2 + 1, w - 2 * r, r);
  ctx.fillStyle = HEX.white;
  for (const [cx, cy, rr] of centers) pixelCircle(ctx, cx, cy, rr);
  ctx.fillRect(x + r, y + r * 2, w - 2 * r, r);
}

export const CLOUDS = {
  A: {
    name: 'Puffy',
    note: 'Round, soft clouds with a light grey underside',
    layout: [[10, 30, 44], [150, 62, 30], [300, 22, 56], [470, 78, 36], [640, 40, 48], [800, 70, 32]],
    draw: puffy,
  },
  B: {
    name: 'Streaks',
    note: 'Long, thin morning clouds — very calm',
    layout: [[0, 30, 70], [130, 58, 46], [260, 20, 90], [420, 72, 54], [560, 40, 80], [740, 64, 60]],
    draw(ctx, x, y, w) {
      ctx.fillStyle = HEX.lightGrey;
      ctx.fillRect(x + 3, y + 3, w - 6, 1);
      ctx.fillStyle = HEX.white;
      ctx.fillRect(x + 4, y, w - 14, 1);
      ctx.fillRect(x, y + 1, w, 2);
      ctx.fillRect(x + 10, y - 1, Math.round(w / 3), 1);
    },
  },
  C: {
    name: 'Few and small',
    note: 'Just a couple of small puffy clouds — least busy',
    layout: [[60, 40, 26], [420, 66, 22], [700, 30, 28]],
    draw: puffy,
  },
};

// All clouds of one version into a wide strip (canvas context), repeating.
export function drawClouds(ctx, key = 'A') {
  const c = CLOUDS[key] || CLOUDS.A;
  c.layout.forEach(([x, y, w], i) => c.draw(ctx, x, y, w, seeded(i + 11)));
}

// Old single cloud helper (puffy), used by the close-up.
export function drawCloud(ctx, x, y, w, seed = 1) {
  puffy(ctx, x, y, w, seeded(seed));
}

// Far-away skyline: soft, lightly dithered (mostly sky blue with a little royal
// blue), low and low-contrast so it reads as "far away", never as an obstacle.
export function drawSkyline(ctx, width, baseY, seed = 3) {
  const rnd = seeded(seed);
  let x = 0;
  while (x < width) {
    const w = 8 + Math.floor(rnd() * 16);
    const h = 16 + Math.floor(rnd() * 40);
    ditherRect(ctx, x, baseY - h, w, h, HEX.skyBlue, HEX.royalBlue, 1);
    x += w + Math.floor(rnd() * 3);
  }
}
