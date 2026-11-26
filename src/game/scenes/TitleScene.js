import Phaser from 'phaser';
import { PAL, TEXT } from '../../kit/palette.js';
import { centerText, score6, blink } from '../../kit/text.js';
import { GAME_H } from '../config.js';
import { store } from '../store.js';
import { sound } from '../sound.js';
import { makeButton } from '../../kit/widgets.js';
import { setText } from '../../kit/text.js';

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

    // MUSIC and SFX switches (same settings as the pause menu).
    const onOff = (v) => (v ? 'ON' : 'OFF');
    const toggle = (x, key, label) => {
      const btn = makeButton(this, x, GAME_H - 64, 82, 24, `${label} ${onOff(store.getSettings()[key])}`, () => {
        const st = store.getSettings();
        st[key] = !st[key];
        store.setSettings(st);
        setText(btn.label, `${label} ${onOff(st[key])}`);
        sound.applySettings();
        if (key === 'music' && st.music) sound.music('title');
        sound.play('click');
      });
      return btn;
    };
    toggle(6, 'music', 'MUSIC');
    toggle(92, 'sfx', 'SFX');

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
