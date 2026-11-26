import { HEX } from './palette.js';

// Pixel art drawn in code. A sprite is a list of strings, one character per
// pixel. Each character names a palette colour; '.' is transparent.
// Only palette colours can be used, so art always stays inside the 16 colours.
export const PIXEL_KEYS = {
  K: HEX.black,
  N: HEX.midnight,
  P: HEX.deepPurple,
  B: HEX.royalBlue,
  S: HEX.skyBlue,
  C: HEX.cyan,
  W: HEX.white,
  L: HEX.lightGrey,
  M: HEX.midGrey,
  D: HEX.darkGrey,
  R: HEX.red,
  O: HEX.orange,
  Y: HEX.yellow,
  G: HEX.green,
  H: HEX.hotPink,
  U: HEX.brown,
};

export function spriteSize(rows) {
  return { w: Math.max(...rows.map((r) => r.length)), h: rows.length };
}

// Draw a sprite onto a 2D canvas context (whole pixels, no smoothing).
export function drawSprite(ctx, rows, x, y, scale = 1, flipX = false) {
  const { w } = spriteSize(rows);
  for (let py = 0; py < rows.length; py++) {
    const row = rows[py];
    for (let px = 0; px < row.length; px++) {
      const c = PIXEL_KEYS[row[px]];
      if (!c) continue;
      const dx = flipX ? w - 1 - px : px;
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x + dx * scale), Math.round(y + py * scale), scale, scale);
    }
  }
}

// A sprite as its own canvas (e.g. to add as a Phaser texture).
export function spriteCanvas(rows, scale = 1) {
  const { w, h } = spriteSize(rows);
  const c = document.createElement('canvas');
  c.width = w * scale;
  c.height = h * scale;
  drawSprite(c.getContext('2d'), rows, 0, 0, scale);
  return c;
}

// Several animation frames side by side in one canvas (a sprite sheet).
export function sheetCanvas(frames, scale = 1) {
  const { w, h } = spriteSize(frames[0]);
  const c = document.createElement('canvas');
  c.width = w * scale * frames.length;
  c.height = h * scale;
  const ctx = c.getContext('2d');
  frames.forEach((f, i) => drawSprite(ctx, f, i * w * scale, 0, scale));
  return c;
}

// 80s-style "gradient": two palette colours mixed with an ordered dither.
// level 0..4: 0 = all colour A, 2 = checkerboard, 4 = all colour B.
const BAYER = [
  [0, 2],
  [3, 1],
];
export function ditherRect(ctx, x, y, w, h, colA, colB, level) {
  ctx.fillStyle = colA;
  ctx.fillRect(x, y, w, h);
  if (level <= 0) return;
  ctx.fillStyle = colB;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      if (BAYER[(y + py) & 1][(x + px) & 1] < level) ctx.fillRect(x + px, y + py, 1, 1);
    }
  }
}

// Small deterministic random generator, so generated art is the same every time.
export function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}
