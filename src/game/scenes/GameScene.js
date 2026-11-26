import Phaser from 'phaser';
import { PAL, TEXT } from '../../kit/palette.js';
import { text, centerText, score6, blink } from '../../kit/text.js';
import { createHud } from '../../kit/hud.js';
import { createPauseMenu } from '../../kit/pauseMenu.js';
import {
  GAME_W,
  GAME_H,
  HUD_H,
  GROUND_Y,
  HELI_W,
  HELI_H,
  HELI_SCREEN_X,
  START_LIVES,
  POINTS_PERSON,
  POINTS_HELIPAD,
} from '../config.js';
import { tuning } from '../tuning.js';
import { store, stats } from '../store.js';
import { getLevel } from '../levels/index.js';
import { buildWorld, checkCrash, checkPickups, reachedHelipad, pastLevelEnd, PERSON_W, PERSON_H } from '../world.js';
import { createHeli, press, release, stepHeli } from '../physics.js';
import { lifeIcon, personIcon } from '../icons.js';
import { sound } from '../sound.js';
import { CHOICES } from '../choices.js';
import { levelCanvas, skyCanvas, skylineCanvas, cloudsCanvas, BG_REPEAT } from '../art/level.js';

const DT = 1 / 120; // fixed physics step: same feel at 60 Hz and 120 Hz
const UI_DEPTH = 100;
const MSG_DEPTH = 200;
const MENU_DEPTH = 250; // score screen, game over
const PAUSE_DEPTH = 260; // pause menu: above everything except the crash flash
const FLASH_DEPTH = 300;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
  }

  init(data) {
    // A "run" = one game from 3 lives to GAME OVER. Score is one running total.
    this.run = data.fresh || !data.run ? { score: 0, lives: START_LIVES, level: 1 } : data.run;
  }

  create() {
    this.time.paused = false; // never start with a frozen clock
    this.cameras.main.setBackgroundColor(PAL.skyBlue);
    this.cameras.main.setRoundPixels(true);

    this.world = buildWorld(getLevel(this.run.level));
    this.levelMusic = getLevel(this.run.level).music || 'skyPatrol';
    this.drawWorld();
    this.createHeli();
    this.createHud();
    this.createPauseMenu();

    this.flash = this.add
      .rectangle(0, 0, GAME_W, GAME_H, PAL.white)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(FLASH_DEPTH)
      .setVisible(false);

    // Reset ALL per-round state here: Phaser re-uses this scene object on
    // restart, so anything not reset would leak into the next round.
    this.paused = false;
    this.leaving = false;
    this.musicWasOn = false;
    this.tapOkAt = 0;
    this.landTarget = null;
    this.fingers = new Set();
    this.spaceDown = false;
    this.debris = [];
    this.popups = [];
    this.acc = 0;

    this.setupInput();
    this.setupAutoPause();
    this.startAttempt();
  }

  // ---------- world drawing ----------

  drawWorld() {
    // Background (fixed to the screen, moved by hand for a parallax effect):
    // sky, a soft far skyline (30% speed) and clouds (10% speed + a slow drift).
    const tex = (key, make) => (this.textures.exists(key) ? key : (this.textures.addCanvas(key, make()), key));
    const bg = (key) => this.add.image(0, 0, key).setOrigin(0).setScrollFactor(0);
    bg(tex(`sky-${CHOICES.sky}`, () => skyCanvas(CHOICES.sky, HUD_H, GROUND_Y))).setDepth(-30);
    this.skylineImg = bg(tex('skyline', skylineCanvas)).setDepth(-20);
    this.cloudsImg = bg(tex(`clouds-${CHOICES.clouds}`, () => cloudsCanvas(CHOICES.clouds))).setDepth(-10).setY(HUD_H);

    // The level itself (buildings, helipad, ground) as one picture.
    this.add.image(0, 0, tex(`level-${this.world.id}`, () => levelCanvas(this.world))).setOrigin(0);

    // Blinking helipad lights.
    const pad = this.world.pad;
    this.padLights = [];
    for (let lx = pad.x + 2; lx < pad.x + pad.w - 2; lx += 12) {
      this.padLights.push(this.add.rectangle(lx, pad.y + 1, 2, 2, PAL.yellow).setOrigin(0));
    }

    // People: waving sprites, feet on the roof.
    this.personRects = new Map();
    for (const p of this.world.people) {
      this.personRects.set(p.id, this.add.sprite(p.x, p.roofY - 7, 'person', p.id % 2).setOrigin(0));
    }
  }

  createHeli() {
    // Pixel-art helicopter (picked on the picks page), 16x10, two rotor frames.
    this.heliGfx = this.add.sprite(0, 0, 'heli', 0).setOrigin(0).setDepth(10);
    // Hover gauge (only in hover-limit mode 2): thin bar above the helicopter.
    this.gaugeBg = this.add.rectangle(0, 0, 14, 2, PAL.black).setOrigin(0).setDepth(12).setVisible(false);
    this.gaugeFill = this.add.rectangle(0, 0, 14, 2, PAL.cyan).setOrigin(0).setDepth(13).setVisible(false);
  }

  createHud() {
    this.hud = createHud(this, {
      score: this.run.score,
      level: this.run.level,
      maxLives: START_LIVES,
      lifeIcon,
      counterIcon: personIcon,
      counterTotal: this.world.people.length,
      onPause: () => this.pauseGame(),
      depth: UI_DEPTH,
    });
    this.msgLayer = []; // centred messages (READY!, 3 2 1, GO!)
  }

  updateHud() {
    this.hud.setScore(this.run.score);
    this.hud.setCounter(this.rescued.size);
    this.hud.setLives(this.run.lives);
  }

  // ---------- pause menu ----------

  createPauseMenu() {
    this.menu = createPauseMenu(this, {
      store,
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartRun(),
      onButton: () => sound.play('click'),
      onToggle: () => sound.applySettings(),
      depth: PAUSE_DEPTH,
    });
  }

  canPause() {
    // Always available (flying, score screen, game over...), so the MUSIC / SFX
    // switches can be reached at any moment.
    return !this.paused && !!this.state;
  }

  pauseGame() {
    if (!this.canPause()) return;
    sound.play('click');
    this.musicWasOn = this.state === 'flying';
    sound.stopMusic();
    this.paused = true;
    this.time.paused = true;
    this.tweens.pauseAll();
    this.fingers.clear();
    this.spaceDown = false;
    release(this.heli);
    this.menu.show();
  }

  resumeGame() {
    if (!this.paused) return;
    this.paused = false;
    this.time.paused = false;
    this.tweens.resumeAll();
    this.menu.hide();
    // Hover in place until the next touch, so resuming is never a surprise drop.
    if (this.state === 'flying' && this.musicWasOn) sound.music(this.levelMusic);
    if (this.state === 'flying') {
      this.heli.vy = 0;
      this.heli.waitingForFirstTouch = true;
    }
    this.acc = 0;
  }

  restartRun() {
    if (this.state === 'flying') this.endAttempt('quit');
    sound.stopMusic();
    // Un-pause the scene clock first: it survives a scene restart, and a paused
    // clock would freeze the READY / 3 2 1 / GO! countdown.
    this.paused = false;
    this.time.paused = false;
    this.tweens.resumeAll();
    this.scene.restart({ fresh: true });
  }

  setupAutoPause() {
    const onHidden = () => this.pauseGame();
    const onTurn = () => this.pauseGame();
    this.game.events.on('hidden', onHidden);
    window.addEventListener('kit-autopause', onTurn);
    this.events.once('shutdown', () => {
      this.game.events.off('hidden', onHidden);
      window.removeEventListener('kit-autopause', onTurn);
    });
  }

  // ---------- input ----------

  setupInput() {
    this.input.on('pointerdown', (pointer, over) => {
      if (over.some((o) => o.isUI)) return;
      this.fingers.add(pointer.id);
      this.onPress();
    });
    const up = (pointer) => {
      this.fingers.delete(pointer.id);
      this.onRelease();
    };
    this.input.on('pointerup', up);
    this.input.on('pointerupoutside', up);

    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-SPACE', (e) => {
        if (e.repeat) return;
        this.spaceDown = true;
        this.onPress();
      });
      kb.on('keyup-SPACE', () => {
        this.spaceDown = false;
        this.onRelease();
      });
      kb.on('keydown-ESC', () => (this.paused ? this.resumeGame() : this.pauseGame()));
      kb.on('keydown-P', () => (this.paused ? this.resumeGame() : this.pauseGame()));
    }
  }

  onPress() {
    if (this.paused) return;
    if (this.state === 'flying') {
      // Immediate impulse: the very next frame already moves up.
      press(this.heli, tuning);
      sound.play('tap');
    } else if (this.state === 'tally' && this.time.now >= this.tapOkAt) {
      this.nextLevel();
    } else if (this.state === 'gameover' && this.time.now >= this.tapOkAt) {
      this.scene.restart({ fresh: true });
    }
  }

  onRelease() {
    if (this.fingers.size === 0 && !this.spaceDown && this.heli) release(this.heli);
  }

  // ---------- attempt flow ----------

  startAttempt() {
    const st = this.world.start;
    this.heli = createHeli(st.x, st.y);
    this.rescued = new Set();
    this.attemptStartScore = this.run.score;
    this.personRects.forEach((r) => r.setVisible(true));
    this.heliGfx.setVisible(true);
    this.fingers.clear();
    this.spaceDown = false;
    this.state = 'ready';
    this.renderHeli();
    this.updateHud();
    this.countdown();
  }

  clearMessages() {
    this.msgLayer.forEach((m) => m.destroy());
    this.msgLayer = [];
  }

  message(str, color, size, y = 136) {
    this.clearMessages();
    const t = centerText(this, y, str, color, size).setScrollFactor(0).setDepth(MSG_DEPTH);
    this.msgLayer.push(t);
    return t;
  }

  countdown() {
    const steps = [
      [0, () => this.message('READY!', TEXT.message, 16)],
      [
        900,
        () => {
          this.message('3', TEXT.number, 24);
          sound.play('countdown'); // beeps on 3, 2, 1 and GO! (one sound, 0.5 s apart)
        },
      ],
      [1400, () => this.message('2', TEXT.number, 24)],
      [1900, () => this.message('1', TEXT.number, 24)],
      [
        2400,
        () => {
          this.message('GO!', PAL.green, 24);
          this.state = 'flying';
          sound.music(this.levelMusic); // in-level music starts at GO!
          this.acc = 0;
          // A finger that is already down when GO! appears counts as holding.
          if (this.fingers.size || this.spaceDown) {
            this.heli.held = true;
            this.heli.hovering = true;
            this.heli.waitingForFirstTouch = false;
          }
        },
      ],
      [2900, () => this.clearMessages()],
    ];
    for (const [ms, fn] of steps) this.time.delayedCall(ms, fn);
  }

  endAttempt(outcome) {
    const h = this.heli;
    stats.record({
      level: this.run.level,
      outcome,
      rescued: this.rescued.size,
      people: this.world.people.length,
      x: Math.round(h.x + HELI_W / 2),
      y: Math.round(h.y + HELI_H / 2),
    });
  }

  crash() {
    this.state = 'crashed';
    this.endAttempt('crash');
    sound.stopMusic(); // silence for the explosion; music restarts at the next GO!
    sound.play('crash');
    release(this.heli);
    this.heliGfx.setVisible(false);
    this.spawnDebris();

    // White flash (hard on/off, no fade) + shake.
    const f = this.flash;
    const seq = [0, 70, 140, 210];
    seq.forEach((ms, i) => this.time.delayedCall(ms, () => f.setVisible(i % 2 === 0)));
    this.cameras.main.shake(350, 0.03);

    this.time.delayedCall(1300, () => {
      this.run.lives -= 1;
      // Rescue points only count once people reach the helipad.
      this.run.score = this.attemptStartScore;
      this.clearPopups();
      if (this.run.lives > 0) this.startAttempt();
      else this.gameOver();
    });
  }

  spawnDebris() {
    const cx = this.heli.x + HELI_W / 2;
    const cy = this.heli.y + HELI_H / 2;
    const cols = [PAL.red, PAL.orange, PAL.yellow, PAL.white, PAL.darkGrey];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const sp = 40 + (i % 3) * 25;
      const r = this.add.rectangle(cx, cy, 2, 2, cols[i % cols.length]).setOrigin(0).setDepth(11);
      this.debris.push({ r, x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: 0.9 });
    }
  }

  gameOver() {
    this.state = 'gameover';
    store.submitScore(this.run.score);
    this.updateHud(); // lives now show 0
    this.clearMessages();
    const o = (obj) => obj.setScrollFactor(0).setDepth(MENU_DEPTH);
    // Below the HUD bar, so the score and the pause button stay visible.
    o(this.add.rectangle(0, HUD_H, GAME_W, GAME_H - HUD_H, PAL.black).setOrigin(0));
    o(centerText(this, 96, 'GAME OVER', TEXT.warning, 16));
    o(centerText(this, 144, 'SCORE', TEXT.label));
    o(centerText(this, 156, score6(this.run.score), TEXT.number));
    o(centerText(this, 184, 'HI-SCORE', TEXT.label));
    o(centerText(this, 196, score6(store.getHiScore()), TEXT.number));
    const tap = o(centerText(this, 248, 'TAP TO PLAY', TEXT.message)).setVisible(false);
    this.tapOkAt = this.time.now + 1000;
    this.time.delayedCall(1000, () => {
      blink(this, tap);
    });
  }

  // ---------- helipad ----------

  startLanding() {
    this.state = 'landing';
    sound.stopMusic(); // the level-complete jingle takes over
    this.endAttempt('finish');
    release(this.heli);
    const pad = this.world.pad;
    this.landTarget = {
      x: Math.round(pad.x + pad.w / 2 - HELI_W / 2),
      y: pad.y - HELI_H,
    };
  }

  updateLanding(dt) {
    const h = this.heli;
    const tx = this.landTarget.x;
    const ty = this.landTarget.y;
    const sp = Math.max(18, Math.min(tuning.forwardSpeed, (tx - h.x) * 2.5));
    h.x = Math.min(tx, h.x + sp * dt);
    h.y = Math.min(ty, h.y + 40 * dt);
    if (h.x >= tx && h.y >= ty) this.touchdown();
  }

  touchdown() {
    this.state = 'touchdown';
    sound.play('landing');
    // People pop out next to the helicopter, one by one.
    const n = this.rescued.size;
    for (let i = 0; i < n; i++) {
      this.time.delayedCall(150 + i * 120, () => {
        const side = i % 2 === 0 ? 1 : -1;
        const step = Math.floor(i / 2) + 1;
        const x = this.heli.x + (side > 0 ? HELI_W + 2 + (step - 1) * 6 : -2 - PERSON_W - (step - 1) * 6);
        this.add.sprite(x, this.world.pad.y - 7, 'person', 1).setOrigin(0);
      });
    }
    this.time.delayedCall(250 + n * 120, () => this.showTally());
  }

  showTally() {
    this.state = 'tally';
    const total = this.world.people.length;
    const n = this.rescued.size;
    const perfect = n === total && total > 0;
    const rescuePts = n * POINTS_PERSON; // already added at pickup
    const bonus = perfect ? rescuePts : 0; // all saved -> rescue points doubled
    this.run.score += bonus + POINTS_HELIPAD;
    this.time.delayedCall(150, () => sound.play('levelClear'));
    store.submitScore(this.run.score);
    this.updateHud();

    const o = (obj) => obj.setScrollFactor(0).setDepth(MENU_DEPTH);
    const top = 72;
    const h = perfect ? 176 : 148;
    o(this.add.rectangle(12, top, GAME_W - 24, h, PAL.white).setOrigin(0));
    o(this.add.rectangle(14, top + 2, GAME_W - 28, h - 4, PAL.black).setOrigin(0));
    let y = top + 12;
    o(centerText(this, y, 'HELIPAD!', TEXT.message, 16));
    y += 28;
    const row = (label, value) => {
      o(text(this, 24, y, label, TEXT.label));
      o(text(this, GAME_W - 24, y, value, TEXT.number, 8, 'right'));
      y += 16;
    };
    row('RESCUED', `${n}/${total}`);
    row('PEOPLE', score6(rescuePts));
    if (perfect) {
      const p = o(centerText(this, y, 'PERFECT RESCUE!', TEXT.message));
      blink(this, p);
      y += 16;
      row('BONUS X2', score6(bonus));
    }
    row('HELIPAD', score6(POINTS_HELIPAD));
    y += 4;
    row('SCORE', score6(this.run.score));

    // The player decides when to go on. TAP TO CONTINUE appears after a short
    // moment, so a tap that was meant for flying doesn't skip the score.
    y += 12;
    const cont = o(centerText(this, y, 'TAP TO CONTINUE', TEXT.message)).setVisible(false);
    this.tapOkAt = this.time.now + 1000;
    this.time.delayedCall(1000, () => {
      cont.setVisible(true);
      blink(this, cont);
    });
  }

  nextLevel() {
    if (this.leaving) return;
    this.leaving = true;
    // Only level 1 exists for now, so this restarts level 1 (score and lives kept).
    this.scene.restart({ run: this.run });
  }

  // ---------- frame update ----------

  update(_time, delta) {
    if (this.paused) return;
    const dt = Math.min(delta / 1000, 0.05);

    if (this.state === 'flying') {
      this.acc += dt;
      while (this.acc >= DT && this.state === 'flying') {
        this.acc -= DT;
        this.physicsStep(DT);
      }
    } else if (this.state === 'landing') {
      this.updateLanding(dt);
    }

    this.updateDebris(dt);
    this.updatePopups(dt);
    this.renderHeli();
  }

  physicsStep(dt) {
    stepHeli(this.heli, tuning, dt);
    for (const p of checkPickups(this.world, this.heli, this.rescued, tuning)) this.pickup(p);
    if (reachedHelipad(this.world, this.heli, tuning)) return this.startLanding();
    if (checkCrash(this.world, this.heli, tuning) || pastLevelEnd(this.world, this.heli)) this.crash();
  }

  pickup(p) {
    this.rescued.add(p.id);
    sound.play('pickup');
    this.personRects.get(p.id).setVisible(false);
    this.run.score += POINTS_PERSON;
    this.updateHud();
    const t = text(this, p.x + 2, p.y - 10, '+100', TEXT.number, 8, 'center').setDepth(20);
    this.popups.push({ t, y: t.y, age: 0 });
  }

  updatePopups(dt) {
    for (const p of this.popups) {
      p.age += dt;
      p.t.setY(Math.round(p.y - p.age * 20)); // whole-pixel steps
      if (p.age > 0.7) p.t.destroy();
    }
    this.popups = this.popups.filter((p) => p.age <= 0.7);
  }

  clearPopups() {
    this.popups.forEach((p) => p.t.destroy());
    this.popups = [];
  }

  updateDebris(dt) {
    for (const d of this.debris) {
      d.life -= dt;
      d.vy += 300 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.r.setPosition(Math.round(d.x), Math.round(d.y));
      if (d.life <= 0) d.r.destroy();
    }
    this.debris = this.debris.filter((d) => d.life > 0);
  }

  renderHeli() {
    const h = this.heli;
    this.heliGfx.setPosition(Math.round(h.x), Math.round(h.y));
    // Rotor: switch frames every 60 ms. People wave, helipad lights blink.
    const now = this.time.now;
    this.heliGfx.setFrame(Math.floor(now / 60) % 2);
    const wave = Math.floor(now / 350) % 2;
    this.personRects.forEach((spr, id) => spr.setFrame((wave + id) % 2));
    const lightsOn = Math.floor(now / 500) % 2 === 0;
    this.padLights.forEach((l) => l.setVisible(lightsOn));

    // Hover gauge display (hover-limit mode 2), see tuning 'gaugeDisplay':
    //   0 = small meter in the HUD + helicopter flashes when almost empty
    //   1 = flash only   2 = bar above the helicopter
    const gaugeMode = tuning.hoverLimitMode === 2;
    const low = gaugeMode && h.gauge < 0.3 && this.state === 'flying';
    this.hud.showMeter(gaugeMode && tuning.gaugeDisplay === 0);
    if (gaugeMode) this.hud.setMeter(h.gauge, low);
    const flash = low && tuning.gaugeDisplay !== 2 && Math.floor(this.time.now / 100) % 2 === 0;
    if (flash) this.heliGfx.setTintFill(PAL.white);
    else this.heliGfx.clearTint();
    const showGauge = gaugeMode && tuning.gaugeDisplay === 2 && this.heliGfx.visible && h.gauge < 1;
    this.gaugeBg.setVisible(showGauge).setPosition(Math.round(h.x) + 1, Math.round(h.y) - 4);
    const fw = Math.round(14 * h.gauge);
    this.gaugeFill
      .setVisible(showGauge && fw > 0)
      .setPosition(Math.round(h.x) + 1, Math.round(h.y) - 4)
      .setSize(Math.max(1, fw), 2)
      .setFillStyle(h.gauge < 0.3 ? PAL.red : PAL.cyan);

    const maxScroll = this.world.length - GAME_W;
    const sx = Phaser.Math.Clamp(Math.round(h.x - HELI_SCREEN_X), 0, maxScroll);
    this.cameras.main.setScroll(sx, 0);

    // Parallax background (whole pixels only).
    this.skylineImg.setX(-(Math.round(sx * 0.3) % BG_REPEAT));
    this.cloudsImg.setX(-(Math.round(sx * 0.1 + now * 0.004) % BG_REPEAT));
  }
}
