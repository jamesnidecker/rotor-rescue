import { HEX } from '../../kit/palette.js';
import { ditherRect, seeded } from '../../kit/pixels.js';

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
export function drawBuilding(ctx, x, y, w, h, shadeIndex = 0, seed = 1) {
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

// Morning sky, top to bottom: royal blue fading into sky blue. Dithered bands
// instead of a smooth gradient (style guide). Plain sky blue lower down, so the
// area where you fly stays calm.
export function drawSky(ctx, w, top, bottom) {
  const h = bottom - top;
  const band = (i, a, b, level) => {
    const y0 = top + Math.round((h * i) / 10);
    const y1 = top + Math.round((h * (i + 1)) / 10);
    ditherRect(ctx, 0, y0, w, y1 - y0, a, b, level);
  };
  band(0, HEX.royalBlue, HEX.skyBlue, 2);
  band(1, HEX.royalBlue, HEX.skyBlue, 3);
  for (let i = 2; i < 10; i++) band(i, HEX.skyBlue, HEX.skyBlue, 0);
}

// A puffy pixel cloud, roughly w x h.
export function drawCloud(ctx, x, y, w, seed = 1) {
  const rnd = seeded(seed);
  const h = Math.max(6, Math.round(w / 3));
  ctx.fillStyle = HEX.white;
  ctx.fillRect(x, y + h - 4, w, 4); // flat base
  const puffs = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < puffs; i++) {
    const pw = Math.round(w * (0.3 + rnd() * 0.3));
    const px = x + Math.round(rnd() * (w - pw));
    const ph = Math.round(h * (0.5 + rnd() * 0.5));
    ctx.fillRect(px, y + h - ph, pw, ph);
    ctx.fillRect(px + 1, y + h - ph - 1, pw - 2, 1);
  }
  ctx.fillStyle = HEX.lightGrey; // soft underside
  ctx.fillRect(x + 1, y + h - 1, w - 2, 1);
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
