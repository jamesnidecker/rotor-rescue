// Rotor Rescue entry point. Reusable parts come from src/kit (8Blip Kit);
// everything specific to this game lives in src/game.
import { createArcadeGame } from './kit/page.js';
import { GAME_W, GAME_H, DEV_TOOLS } from './game/config.js';
import { tune } from './game/tuning.js';
import { stats } from './game/store.js';
import { sound } from './game/sound.js';
import BootScene from './game/scenes/BootScene.js';
import TitleScene from './game/scenes/TitleScene.js';
import GameScene from './game/scenes/GameScene.js';

async function start() {
  tune.load();
  const game = await createArcadeGame({
    width: GAME_W,
    height: GAME_H,
    scenes: [BootScene, TitleScene, GameScene],
  });
  window.__game = game; // handy for debugging in the browser console
  window.__sound = sound;

  if (DEV_TOOLS) {
    const params = new URLSearchParams(window.location.search);
    if (params.has('tune')) {
      const { mountTunePanel } = await import('./kit/dev/tunePanel.js');
      mountTunePanel(tune, {
        soundCheck: { info: () => sound.debugInfo(), beep: () => sound.testBeep() },
        // eslint-disable-next-line no-undef
        build: typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev',
        onRestart: () => {
          const g = game.scene.getScene('game');
          if (g.sys.isActive()) g.restartRun();
          else {
            game.scene.stop('title');
            game.scene.start('game', { fresh: true });
          }
        },
      });
    }
    if (params.has('stats')) {
      const [{ mountStatsPanel }, strip] = await Promise.all([
        import('./kit/dev/statsPanel.js'),
        import('./game/statsStrip.js'),
      ]);
      mountStatsPanel({
        stats,
        title: 'Rotor Rescue',
        outcomes: { crash: 'Crashed', finish: 'Reached helipad', quit: 'Quit (restart)' },
        levelLength: strip.levelLength,
        drawLevelStrip: strip.drawLevelStrip,
      });
    }
  }
}

start();
