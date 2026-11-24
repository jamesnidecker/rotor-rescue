import Phaser from 'phaser';
import { PAL } from './palette.js';
import { loadFontFace } from './font.js';
import fontUrl from './assets/fonts/PressStart2P.woff2';
import './kit.css';

// Phone-first page setup shared by all 8Blip games.
//  - fixed play area (e.g. 180x320) scaled to fit, centred; the space left
//    over on wider screens are "side strips" (midnight now, cabinet panels later)
//  - no zoom, scroll, text selection or long-press menu
//  - "TURN YOUR DEVICE" on touch devices held in landscape
//  - window event 'kit-autopause' when the device is turned (games pause on it;
//    Phaser's own 'hidden' event covers app/tab switching)

const DEV_SELECTORS = '#tune-panel, #stats-panel';

export function guardPage() {
  const stop = (e) => {
    if (!e.target.closest?.(DEV_SELECTORS)) e.preventDefault();
  };
  // iOS Safari ignores user-scalable=no for pinch, so block gestures here too.
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend', 'contextmenu', 'selectstart', 'dblclick']) {
    document.addEventListener(ev, stop);
  }
  document.addEventListener('touchmove', stop, { passive: false });
}

export function mountTurnScreen() {
  const d = document.createElement('div');
  d.id = 'turn';
  d.innerHTML = '<div class="turn-phone"></div><p>TURN YOUR<br>DEVICE</p>';
  document.body.appendChild(d);
  const mq = window.matchMedia('(orientation: landscape) and (pointer: coarse)');
  mq.addEventListener?.('change', () => {
    if (mq.matches) window.dispatchEvent(new Event('kit-autopause'));
  });
}

// Side strips: the parts of the screen outside the play area. For now they are
// plain midnight (page background). Milestone 2 draws cabinet panels into them;
// subscribe here to get their size whenever the layout changes.
export function onSideStrips(game, cb) {
  const report = () => {
    const r = game.canvas.getBoundingClientRect();
    cb({
      left: { x: 0, y: 0, w: r.left, h: window.innerHeight },
      right: { x: r.right, y: 0, w: window.innerWidth - r.right, h: window.innerHeight },
      playArea: { x: r.left, y: r.top, w: r.width, h: r.height },
    });
  };
  game.scale.on('resize', report);
  report();
}

export async function createArcadeGame({ width, height, scenes, parent = 'game', background = PAL.black }) {
  guardPage();
  mountTurnScreen();
  try {
    await loadFontFace(fontUrl);
  } catch (e) {
    console.warn('Font could not be loaded', e);
  }
  let host = document.getElementById(parent);
  if (!host) {
    host = document.createElement('div');
    host.id = parent;
    document.body.prepend(host);
  }
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: background,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    banner: false,
    disableContextMenu: true,
    audio: { noAudio: true }, // no sound yet; avoids audio-unlock warnings
    // Phaser stops the space bar from scrolling the page (capture).
    input: { activePointers: 3, keyboard: { capture: [32] } },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      expandParent: false,
    },
    scene: scenes,
  });
}
