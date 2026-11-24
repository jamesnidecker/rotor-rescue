import Phaser from 'phaser';

// Press Start 2P is bundled (src/assets/fonts). We turn it into a hard-edged
// bitmap font at startup: each glyph is drawn 8x larger, then every one of its
// 8x8 pixels is sampled at its centre and made fully on or fully off.
// Result: crisp, unsmoothed arcade letters at any whole multiple of 8 px.

export const FONT_KEY = 'arcade';
export const FONT_FAMILY = 'Press Start 2P';
const CHARS = Phaser.GameObjects.RetroFont.TEXT_SET1; // ' ' .. '~'
const CELL = 8;
const COLS = 16;
const ZOOM = 8;
// The font's baseline sits 8 pixels below the top of its 8-pixel cell.
const BASELINE = 8;

export async function loadFontFace(url) {
  const face = new FontFace(FONT_FAMILY, `url(${url})`);
  await face.load();
  document.fonts.add(face);
}

export function buildArcadeFont(scene) {
  if (scene.cache.bitmapFont.exists(FONT_KEY)) return;
  const BIG = CELL * ZOOM;
  const scratch = document.createElement('canvas');
  scratch.width = BIG;
  scratch.height = BIG;
  const sctx = scratch.getContext('2d', { willReadFrequently: true });
  sctx.font = `${BIG}px "${FONT_FAMILY}"`;
  sctx.textBaseline = 'alphabetic';
  sctx.textAlign = 'left';
  sctx.fillStyle = '#FFFFFF';

  const rows = Math.ceil(CHARS.length / COLS);
  const out = document.createElement('canvas');
  out.width = COLS * CELL;
  out.height = rows * CELL;
  const octx = out.getContext('2d');
  const img = octx.createImageData(out.width, out.height);

  for (let i = 0; i < CHARS.length; i++) {
    sctx.clearRect(0, 0, BIG, BIG);
    sctx.fillText(CHARS[i], 0, BASELINE * ZOOM);
    const src = sctx.getImageData(0, 0, BIG, BIG).data;
    const ox = (i % COLS) * CELL;
    const oy = Math.floor(i / COLS) * CELL;
    for (let py = 0; py < CELL; py++) {
      for (let px = 0; px < CELL; px++) {
        const sx = px * ZOOM + ZOOM / 2;
        const sy = py * ZOOM + ZOOM / 2;
        const a = src[(sy * BIG + sx) * 4 + 3];
        if (a >= 128) {
          const o = ((oy + py) * out.width + ox + px) * 4;
          img.data[o] = 255;
          img.data[o + 1] = 255;
          img.data[o + 2] = 255;
          img.data[o + 3] = 255;
        }
      }
    }
  }
  octx.putImageData(img, 0, 0);
  scene.textures.addCanvas('arcade-font', out);

  // Parse() returns a ready cache entry: { data, texture, frame }.
  const entry = Phaser.GameObjects.RetroFont.Parse(scene, {
    image: 'arcade-font',
    width: CELL,
    height: CELL,
    chars: CHARS,
    charsPerRow: COLS,
    spacing: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    lineSpacing: 0,
  });
  scene.cache.bitmapFont.add(FONT_KEY, entry);
}
