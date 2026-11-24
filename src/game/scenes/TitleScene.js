import Phaser from 'phaser';
import { PAL, TEXT } from '../../kit/palette.js';
import { centerText, score6, blink } from '../../kit/text.js';
import { GAME_H } from '../config.js';
import { store } from '../store.js';

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

    const start = () => this.scene.start('game', { fresh: true });
    this.input.once('pointerdown', start);
    this.input.keyboard?.once('keydown-SPACE', start);
  }
}
