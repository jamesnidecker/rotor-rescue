import { PAL } from './palette.js';
import { text } from './text.js';

// Square, pixel-bevelled button: light edge top-left, dark edge bottom-right.
// x, y are final positions. The touch zone is NOT inside the container: Phaser
// mis-places taps on container children once the camera has scrolled, so the
// zone is a separate object at the same spot (button.zone). For screen-fixed
// UI, give it scrollFactor 0 (opts.fixed, default true).
export function makeButton(scene, x, y, w, h, label, onTap, opts = {}) {
  const c = scene.add.container(x, y);
  const parts = [
    scene.add.rectangle(0, 0, w, h, PAL.black).setOrigin(0),
    scene.add.rectangle(1, 1, w - 2, h - 2, PAL.lightGrey).setOrigin(0),
    scene.add.rectangle(2, 2, w - 3, h - 3, PAL.darkGrey).setOrigin(0),
    scene.add.rectangle(2, 2, w - 4, h - 4, PAL.midGrey).setOrigin(0),
  ];
  const t = text(scene, w / 2, Math.round(h / 2 - 4), label, PAL.white, 8, 'center');
  c.add([...parts, t]);
  c.label = t;
  const zone = scene.add.zone(x, y, w, h).setOrigin(0).setInteractive();
  if (opts.fixed !== false) zone.setScrollFactor(0);
  zone.isUI = true;
  zone.on('pointerdown', () => onTap());
  c.zone = zone;
  return c;
}

// Small pixel pause icon in a bordered square.
export function makePauseIcon(scene, x, y) {
  const c = scene.add.container(x, y);
  c.add([
    scene.add.rectangle(0, 0, 16, 16, PAL.white).setOrigin(0),
    scene.add.rectangle(1, 1, 14, 14, PAL.black).setOrigin(0),
    scene.add.rectangle(5, 4, 2, 8, PAL.white).setOrigin(0),
    scene.add.rectangle(9, 4, 2, 8, PAL.white).setOrigin(0),
  ]);
  return c;
}

