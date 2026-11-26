import Phaser from 'phaser';
import { buildArcadeFont } from '../../kit/font.js';
import { sheetCanvas, spriteSize } from '../../kit/pixels.js';
import { HELICOPTERS } from '../art/helicopters.js';
import { PERSON_FRAMES } from '../art/people.js';
import { CHOICES } from '../choices.js';

// Turns the pixel art (drawn in code) into Phaser textures once at startup.
function addSheet(scene, key, frames) {
  const { w, h } = spriteSize(frames[0]);
  const tex = scene.textures.addCanvas(key, sheetCanvas(frames));
  frames.forEach((_, i) => tex.add(i, 0, i * w, 0, w, h));
}

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    buildArcadeFont(this);
    addSheet(this, 'heli', HELICOPTERS[CHOICES.heli].frames);
    addSheet(this, 'person', PERSON_FRAMES);
    this.scene.start('title');
  }
}
