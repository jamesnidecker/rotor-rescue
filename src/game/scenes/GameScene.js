import Phaser from 'phaser';
import { PAL, TEXT } from '../../kit/palette.js';
import { text, centerText, score6, blink } from '../../kit/text.js';
import { createHud } from '../../kit/hud.js';
import { createPauseMenu } from '../../kit/pauseMenu.js';
import {
  GAME_W,
  GAME_H,
  GROUND_Y,
  GROUND_H,
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
import { buildWorld, checkCrash, checkPickups, reachedHelipad, PERSON_W, PERSON_H } from '../world.js';
import { createHeli, press, release, stepHeli } from '../physics.js';
import { lifeIcon, personIcon } from '../icons.js';

const DT = 1 / 120; // fixed physics step: same feel at 60 Hz and 120 Hz
const UI_DEPTH = 100;
const MSG_DEPTH = 200;
const MENU_DEPTH = 250;
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
    this.cameras.main.setBackgroundColor(PAL.skyBlue);
    this.cameras.main.setRoundPixels(true);

    this.world = buildWorld(getLevel(this.run.level));
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

    this.paused = false;
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
    const len = this.world.length + GAME_W;
    // Ground: dark grey with a green grass edge.
    this.add.rectangle(0, GROUND_Y, len, GROUND_H, PAL.darkGrey).setOrigin(0);
    this.add.rectangle(0, GROUND_Y, len, 2, PAL.green).setOrigin(0);

    const bodies = [PAL.midGrey, PAL.lightGrey, PAL.midGrey];
    for (const s of this.world.solids) {
      if (s.kind === 'building') {
        const body = bodies[s.shade % bodies.length];
        this.add.rectangle(s.x, s.y, s.w, s.h, body).setOrigin(0);
        this.add.rectangle(s.x, s.y, 2, s.h, body === PAL.lightGrey ? PAL.white : PAL.lightGrey).setOrigin(0);
        this.add.rectangle(s.x + s.w - 2, s.y, 2, s.h, PAL.darkGrey).setOrigin(0);
        this.add.rectangle(s.x, s.y, s.w, 1, body === PAL.lightGrey ? PAL.white : PAL.lightGrey).setOrigin(0);
      } else if (s.kind === 'helipad') {
        this.add.rectangle(s.x, s.y, s.w, s.h, PAL.darkGrey).setOrigin(0);
        this.add.rectangle(s.x, s.y, s.w, 4, PAL.orange).setOrigin(0);
        // landing lights
        for (let lx = s.x + 2; lx < s.x + s.w - 2; lx += 12) {
          this.add.rectangle(lx, s.y + 6, 2, 2, PAL.orange).setOrigin(0);
        }
      }
    }

    this.personRects = new Map();
    for (const p of this.world.people) {
      this.personRects.set(p.id, this.add.rectangle(p.x, p.y, PERSON_W, PERSON_H, PAL.yellow).setOrigin(0));
    }
  }

  createHeli() {
    // Grey-box helicopter, 16x10, facing right.
    const c = this.add.container(0, 0).setDepth(10);
    this.rotor = this.add.rectangle(1, 0, 15, 1, PAL.darkGrey).setOrigin(0);
    c.add([
      this.rotor,
      this.add.rectangle(7, 1, 2, 2, PAL.darkGrey).setOrigin(0), // mast
      this.add.rectangle(4, 3, 12, 6, PAL.red).setOrigin(0), // body
      this.add.rectangle(0, 4, 4, 2, PAL.red).setOrigin(0), // tail
      this.add.rectangle(0, 2, 1, 3, PAL.red).setOrigin(0), // tail fin
      this.add.rectangle(12, 4, 3, 2, PAL.white).setOrigin(0), // window
      this.add.rectangle(5, 9, 10, 1, PAL.darkGrey).setOrigin(0), // skid
    ]);
    this.heliGfx = c;
    this.rotorTick = 0;
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
      depth: MENU_DEPTH,
    });
  }

  canPause() {
    return !this.paused && (this.state === 'ready' || this.state === 'flying' || this.state === 'landing');
  }

  pauseGame() {
    if (!this.canPause()) return;
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
    if (this.state === 'flying') {
      this.heli.vy = 0;
      this.heli.waitingForFirstTouch = true;
    }
    this.acc = 0;
  }

  restartRun() {
    if (this.state === 'flying') this.endAttempt('quit');
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
      [900, () => this.message('3', TEXT.number, 24)],
      [1400, () => this.message('2', TEXT.number, 24)],
      [1900, () => this.message('1', TEXT.number, 24)],
      [
        2400,
        () => {
          this.message('GO!', PAL.green, 24);
          this.state = 'flying';
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
    this.clearMessages();
    const o = (obj) => obj.setScrollFactor(0).setDepth(MENU_DEPTH);
    o(this.add.rectangle(0, 0, GAME_W, GAME_H, PAL.black).setOrigin(0));
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
    // People pop out next to the helicopter, one by one.
    const n = this.rescued.size;
    for (let i = 0; i < n; i++) {
      this.time.delayedCall(150 + i * 120, () => {
        const side = i % 2 === 0 ? 1 : -1;
        const step = Math.floor(i / 2) + 1;
        const x = this.heli.x + (side > 0 ? HELI_W + 2 + (step - 1) * 6 : -2 - PERSON_W - (step - 1) * 6);
        this.add.rectangle(x, this.world.pad.y - PERSON_H, PERSON_W, PERSON_H, PAL.yellow).setOrigin(0);
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
    store.submitScore(this.run.score);
    this.updateHud();

    const o = (obj) => obj.setScrollFactor(0).setDepth(MENU_DEPTH);
    const top = 72;
    const h = perfect ? 168 : 140;
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

    this.tapOkAt = this.time.now + 300; // tap to skip
    this.time.delayedCall(3000, () => this.nextLevel());
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
    if (reachedHelipad(this.world, this.heli)) return this.startLanding();
    if (checkCrash(this.world, this.heli, tuning)) this.crash();
  }

  pickup(p) {
    this.rescued.add(p.id);
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
    // Rotor flicker.
    this.rotorTick = (this.rotorTick + 1) % 6;
    if (this.rotorTick < 3) this.rotor.setPosition(1, 0).setSize(15, 1);
    else this.rotor.setPosition(4, 0).setSize(9, 1);

    const maxScroll = this.world.length - GAME_W;
    const sx = Phaser.Math.Clamp(Math.round(h.x - HELI_SCREEN_X), 0, maxScroll);
    this.cameras.main.setScroll(sx, 0);
  }
}
