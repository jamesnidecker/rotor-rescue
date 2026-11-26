import Phaser from 'phaser';
import { PAL, TEXT } from '../../kit/palette.js';
import { centerText, score6, blink } from '../../kit/text.js';
import { GAME_W, GAME_H } from '../config.js';
import { store } from '../store.js';
import { sound } from '../sound.js';
import { spriteCanvas } from '../../kit/pixels.js';
import { ICON_MUSIC, ICON_SPEAKER, offVersion } from '../../kit/icons.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    this.cameras.main.setBackgroundColor(PAL.black);

    // Placeholder title (the real chunky logo comes in milestone 2).
    for (const [y, word] of [[72, 'ROTOR'], [104, 'RESCUE']]) {
      const shadow = centerText(this, y + 3, word, PAL.red, 24);
      shadow.x += 3;
      centerText(this, y, word, PAL.yellow, 24);
    }

    centerText(this, 168, 'HI-SCORE', TEXT.label);
    centerText(this, 180, score6(store.getHiScore()), TEXT.number);

    const tap = centerText(this, 232, 'TAP TO PLAY', TEXT.message);
    // Blink about twice per second.
    blink(this, tap);

    centerText(this, GAME_H - 24, '8BLIP ARCADE', PAL.midGrey);

    // Small MUSIC and SFX icons in the bottom corners (same settings as the
    // pause menu). White = on, grey with a red stripe = off.
    const iconTex = (key, rows) => {
      if (!this.textures.exists(key)) this.textures.addCanvas(key, spriteCanvas(rows));
      return key;
    };
    const toggle = (x, key, rows) => {
      const on = iconTex(`icon-${key}-on`, rows);
      const off = iconTex(`icon-${key}-off`, offVersion(rows));
      const img = this.add.image(x, GAME_H - 20, store.getSettings()[key] ? on : off).setOrigin(0);
      // Bigger invisible touch area around the small icon.
      const zone = this.add.zone(x - 9, GAME_H - 32, 28, 30).setOrigin(0).setInteractive();
      zone.isUI = true;
      zone.on('pointerdown', () => {
        const st = store.getSettings();
        st[key] = !st[key];
        store.setSettings(st);
        img.setTexture(st[key] ? on : off);
        sound.applySettings();
        if (key === 'music' && st.music) sound.music('title');
        sound.play('click');
      });
    };
    toggle(8, 'music', ICON_MUSIC);
    toggle(GAME_W - 17, 'sfx', ICON_SPEAKER);

    // Title theme. Browsers only allow sound after a tap, so on the very first
    // visit the first tap starts the music and the next tap starts the game.
    // (Later visits: music plays right away and one tap starts the game.)
    sound.music('title');
    let waitingForMusic = !sound.unlocked && store.getSettings().music;
    const start = (pointer, over) => {
      if (over && over.some((o) => o.isUI)) return; // tapped a switch
      if (waitingForMusic) {
        waitingForMusic = false; // this tap unlocked the sound; the theme starts now
        return;
      }
      sound.play('click');
      sound.stopMusic();
      this.scene.start('game', { fresh: true });
    };
    this.input.on('pointerdown', start);
    this.input.keyboard?.on('keydown-SPACE', () => start());
  }
}
