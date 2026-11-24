import { FONT_KEY } from './font.js';

// All text: Press Start 2P, CAPITALS, sizes 8/16/24/32 only, whole-pixel positions.
// align: 'left' | 'center' | 'right' (x is the left edge, centre or right edge).
export function text(scene, x, y, str, color, size = 8, align = 'left') {
  if (size % 8 !== 0) throw new Error('Text size must be a multiple of 8');
  const t = scene.add.bitmapText(0, 0, FONT_KEY, String(str).toUpperCase(), size);
  t.setTint(color);
  t._align = align;
  t._ax = x;
  t.setY(Math.round(y));
  placeX(t);
  return t;
}

function placeX(t) {
  let x = t._ax;
  if (t._align === 'center') x = t._ax - t.width / 2;
  else if (t._align === 'right') x = t._ax - t.width;
  t.setX(Math.round(x));
}

// Change the string and keep the alignment.
export function setText(t, str) {
  t.setText(String(str).toUpperCase());
  placeX(t);
  return t;
}

export function centerText(scene, y, str, color, size = 8) {
  return text(scene, scene.scale.gameSize.width / 2, y, str, color, size, 'center');
}

// Arcade score: always 6 digits with leading zeros.
export function score6(n) {
  return String(Math.max(0, Math.floor(n)) % 1000000).padStart(6, '0');
}

// Blink an object about twice per second (call-to-action text).
export function blink(scene, obj, ms = 250) {
  return scene.time.addEvent({ delay: ms, loop: true, callback: () => obj.setVisible(!obj.visible) });
}
