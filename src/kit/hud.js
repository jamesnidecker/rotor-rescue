import { PAL, TEXT } from './palette.js';
import { text, setText, score6 } from './text.js';
import { makePauseIcon } from './widgets.js';

export const HUD_H = 24;

// Classic arcade HUD bar, fixed to the screen:
//   1UP        LEVEL 01            [II]
//   000000     ▲▲▲      ■ 0/5
// opts: { score, level, lives, maxLives, lifeIcon(scene,x,y), counterIcon(scene,x,y),
//         counterTotal, onPause, depth }
export function createHud(scene, opts) {
  const W = scene.scale.gameSize.width;
  const depth = opts.depth ?? 100;
  const ui = (o) => o.setScrollFactor(0).setDepth(depth);

  ui(scene.add.rectangle(0, 0, W, HUD_H, PAL.black).setOrigin(0));
  ui(scene.add.rectangle(0, HUD_H - 1, W, 1, PAL.darkGrey).setOrigin(0));

  ui(text(scene, 4, 3, '1UP', TEXT.label));
  const score = ui(text(scene, 4, 13, score6(opts.score ?? 0), TEXT.number));
  ui(text(scene, 60, 3, 'LEVEL', TEXT.label));
  const level = ui(text(scene, 108, 3, String(opts.level ?? 1).padStart(2, '0'), TEXT.number));

  const lives = [];
  for (let i = 0; i < (opts.maxLives ?? 3); i++) {
    lives.push(ui(opts.lifeIcon(scene, 60 + i * 12, 14)));
  }

  let counter = null;
  if (opts.counterTotal != null) {
    if (opts.counterIcon) ui(opts.counterIcon(scene, 108, 13));
    counter = ui(text(scene, 116, 13, `0/${opts.counterTotal}`, TEXT.number));
  }

  ui(makePauseIcon(scene, W - 20, 4));
  // Big touch target around the small icon.
  const pauseZone = ui(scene.add.zone(W - 34, 0, 34, HUD_H + 8).setOrigin(0).setInteractive());
  pauseZone.isUI = true;
  pauseZone.on('pointerdown', () => opts.onPause?.());

  return {
    height: HUD_H,
    setScore: (n) => setText(score, score6(n)),
    setLevel: (n) => setText(level, String(n).padStart(2, '0')),
    setLives: (n) => lives.forEach((ic, i) => ic.setVisible(i < n)),
    setCounter: (n, total) => counter && setText(counter, `${n}/${total ?? opts.counterTotal}`),
  };
}
