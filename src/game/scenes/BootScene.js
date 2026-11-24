import Phaser from 'phaser';
import { buildArcadeFont } from '../../kit/font.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    buildArcadeFont(this);
    this.scene.start('title');
  }
}
