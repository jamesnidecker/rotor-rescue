import { PAL, TEXT } from './palette.js';
import { centerText, setText } from './text.js';
import { makeButton } from './widgets.js';

// Pause overlay: RESUME, RESTART, MUSIC and SFX switches (saved in the store).
// opts: { store, onResume, onRestart, onButton (any tap, e.g. a click sound),
//         onToggle(key, value) (after MUSIC / SFX change), depth }
export function createPauseMenu(scene, opts) {
  const W = scene.scale.gameSize.width;
  const H = scene.scale.gameSize.height;
  const m = scene.add.container(0, 0).setDepth(opts.depth ?? 250).setVisible(false);
  const px = 20;
  const pw = W - 40;
  const ph = 176;
  const py = Math.round((H - ph) / 2) - 8;
  m.add([
    scene.add.rectangle(0, 0, W, H, PAL.midnight).setOrigin(0),
    scene.add.rectangle(px, py, pw, ph, PAL.white).setOrigin(0),
    scene.add.rectangle(px + 2, py + 2, pw - 4, ph - 4, PAL.black).setOrigin(0),
    centerText(scene, py + 12, 'PAUSED', TEXT.message, 16),
  ]);
  const bw = pw - 24;
  const bx = px + 12;
  const onOff = (v) => (v ? 'ON' : 'OFF');
  const at = (i) => py + 40 + i * 32;
  const toggle = (i, key, label) => {
    const b = makeButton(scene, bx, at(i), bw, 24, `${label} ${onOff(opts.store.getSettings()[key])}`, () => {
      opts.onButton?.();
      const s = opts.store.getSettings();
      s[key] = !s[key];
      opts.store.setSettings(s);
      setText(b.label, `${label} ${onOff(s[key])}`);
      opts.onToggle?.(key, s[key]);
    });
    return b;
  };
  const buttons = [
    makeButton(scene, bx, at(0), bw, 24, 'RESUME', () => (opts.onButton?.(), opts.onResume?.())),
    makeButton(scene, bx, at(1), bw, 24, 'RESTART', () => (opts.onButton?.(), opts.onRestart?.())),
    toggle(2, 'music', 'MUSIC'),
    toggle(3, 'sfx', 'SFX'),
  ];
  m.add(buttons);
  m.setScrollFactor(0, 0, true);
  const zones = buttons.map((b) => b.zone.setDepth((opts.depth ?? 250) + 1));
  zones.forEach((z) => z.disableInteractive());

  return {
    get visible() {
      return m.visible;
    },
    show() {
      m.setVisible(true);
      zones.forEach((z) => z.setInteractive());
    },
    hide() {
      m.setVisible(false);
      zones.forEach((z) => z.disableInteractive());
    },
  };
}
