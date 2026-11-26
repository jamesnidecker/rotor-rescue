// Art & sound picks for milestone 2. Open: preview.html
// Shows the candidate art and sounds; Jozo picks, then taps "Copy my picks".
import './preview.css';
import { HEX } from '../kit/palette.js';
import { drawSprite, spriteSize } from '../kit/pixels.js';
import { createSynth } from '../kit/audio/synth.js';
import { createMusicPlayer } from '../kit/audio/music.js';
import { createStore } from '../kit/storage.js';
import { copyText } from '../kit/dev/clipboard.js';
import { HELICOPTERS } from '../game/art/helicopters.js';
import { PERSON_FRAMES } from '../game/art/people.js';
import { drawBuilding, drawSky, drawCloud, drawSkyline } from '../game/art/city.js';
import { SFX } from '../game/audio/sfx.js';
import { TITLE_THEME } from '../game/audio/titleTheme.js';
import { buildWorld } from '../game/world.js';
import { getLevel } from '../game/levels/index.js';
import { GAME_W, GAME_H, GROUND_Y, HUD_H } from '../game/config.js';

const store = createStore('rotor-rescue.');
const picks = { heli: 'A', ...store.load('picks.v1', {}) };
const savePicks = () => store.save('picks.v1', picks);
const synth = createSynth({ volume: 0.35 });
const music = createMusicPlayer(synth);

const el = (tag, props = {}, ...kids) => {
  const e = document.createElement(tag);
  Object.assign(e, props);
  for (const k of kids) e.append(k);
  return e;
};
const app = document.body;

app.append(
  el('h1', {}, 'Rotor Rescue'),
  el('p', { className: 'note' }, 'Art & sound picks for level 1. Tap your favourites, then "Copy my picks" at the bottom and paste it to Claude. Sound: turn the silent switch off and the volume up.')
);

// ---------------------------------------------------------------- live scene
app.append(el('h2', {}, '1. Live scene'));
app.append(el('p', { className: 'note' }, 'Level 1 with the new art. The helicopter here flies by itself; it uses the helicopter you pick below.'));
const scene = el('canvas', { className: 'scene', width: GAME_W, height: GAME_H });
app.append(scene);

const world = buildWorld(getLevel(1));
const peopleRoofs = new Set(world.people.map((p) => p.roofY + ':' + p.x));
// Pre-draw the whole level (buildings, helipad, ground) once.
const strip = el('canvas', { width: world.length + GAME_W, height: GAME_H });
{
  const g = strip.getContext('2d');
  world.solids.forEach((s, i) => {
    if (s.kind === 'building') {
      const hasPerson = world.people.some((p) => p.x >= s.x && p.x <= s.x + s.w);
      drawBuilding(g, s.x, s.y, s.w, s.h, s.shade, hasPerson ? 0 : i + 1);
    } else {
      g.fillStyle = HEX.darkGrey;
      g.fillRect(s.x, s.y, s.w, s.h);
      g.fillStyle = HEX.midGrey;
      g.fillRect(s.x, s.y + 4, s.w, 2);
      g.fillStyle = HEX.orange;
      g.fillRect(s.x, s.y, s.w, 4);
    }
  });
  g.fillStyle = HEX.darkGrey;
  g.fillRect(0, GROUND_Y, strip.width, GAME_H - GROUND_Y);
  g.fillStyle = HEX.green;
  g.fillRect(0, GROUND_Y, strip.width, 2);
  g.fillStyle = HEX.midGrey;
  for (let x = 0; x < strip.width; x += 12) g.fillRect(x, GROUND_Y + 8, 6, 1);
}
// Background layers: sky (fixed), far skyline (slow), clouds (slower still).
const sky = el('canvas', { width: GAME_W, height: GAME_H });
drawSky(sky.getContext('2d'), GAME_W, HUD_H, GROUND_Y);
const skyline = el('canvas', { width: 900, height: GAME_H });
drawSkyline(skyline.getContext('2d'), 900, GROUND_Y, 7);
const clouds = el('canvas', { width: 900, height: 140 });
{
  const g = clouds.getContext('2d');
  [[20, 40, 40], [150, 70, 28], [300, 30, 52], [470, 85, 34], [640, 50, 44], [800, 75, 30]].forEach(([x, y, w], i) =>
    drawCloud(g, x, y, w, i + 11)
  );
}
void peopleRoofs;

function safeHeight(x) {
  let top = 190; // open sky: cruise at a comfortable height
  for (const s of world.solids) if (s.x < x + 40 && s.x + s.w > x - 6) top = Math.min(top, s.y);
  return Math.max(HUD_H + 16, top - 26);
}
let heliX = 30;
let heliY = 150;
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  heliX += 60 * dt;
  if (heliX > world.pad.x + 20) heliX = 30;
  heliY += (safeHeight(heliX) + Math.sin(now / 400) * 3 - heliY) * Math.min(1, dt * 3);
  const cam = Math.max(0, Math.min(world.length - GAME_W, Math.round(heliX - 40)));
  const g = scene.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(sky, 0, 0);
  const cx = Math.round(now / 1000 * 4 + cam * 0.1) % 720;
  g.drawImage(clouds, -cx, HUD_H);
  g.drawImage(clouds, 720 - cx, HUD_H);
  const sx = Math.round(cam * 0.3) % 720;
  g.drawImage(skyline, -sx, 0);
  g.drawImage(skyline, 720 - sx, 0);
  g.drawImage(strip, -cam, 0);
  const wave = Math.floor(now / 350) % 2;
  for (const p of world.people) {
    drawSprite(g, PERSON_FRAMES[(wave + p.id) % 2], Math.round(p.x - cam - 0.5), p.roofY - 7);
  }
  // blinking helipad lights
  if (Math.floor(now / 500) % 2) {
    g.fillStyle = HEX.yellow;
    for (let lx = world.pad.x + 2; lx < world.pad.x + world.pad.w - 2; lx += 12) g.fillRect(lx - cam, world.pad.y + 1, 2, 2);
  }
  const heli = HELICOPTERS[picks.heli];
  drawSprite(g, heli.frames[Math.floor(now / 60) % 2], Math.round(heliX - cam), Math.round(heliY));
  // HUD bar placeholder (the real HUD stays as it is now)
  g.fillStyle = HEX.black;
  g.fillRect(0, 0, GAME_W, HUD_H);
  g.fillStyle = HEX.darkGrey;
  g.fillRect(0, HUD_H - 1, GAME_W, 1);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------------------------------------------------------------- helicopters
app.append(el('h2', {}, '2. Helicopter'));
app.append(el('p', { className: 'note' }, 'Same size as now (so the flying stays exactly the same). Tap one to pick it.'));
const heliRow = el('div', { className: 'row' });
app.append(heliRow);
const heliCanvases = [];
for (const [key, h] of Object.entries(HELICOPTERS)) {
  const { w, h: hh } = spriteSize(h.frames[0]);
  const c = el('canvas', { width: w * 8, height: hh * 8 });
  c.style.width = `${w * 8}px`;
  c.style.background = HEX.skyBlue;
  const card = el('div', { className: 'card' }, c, el('div', {}, el('b', {}, `${key}: ${h.name}`)), el('div', { className: 'sub' }, h.note));
  card.addEventListener('click', () => {
    picks.heli = key;
    savePicks();
    refresh();
  });
  card.dataset.key = key;
  heliRow.append(card);
  heliCanvases.push([c, h]);
}
(function animateHelis(now) {
  for (const [c, h] of heliCanvases) {
    const g = c.getContext('2d');
    g.fillStyle = HEX.skyBlue;
    g.fillRect(0, 0, c.width, c.height);
    drawSprite(g, h.frames[Math.floor(now / 60) % 2], 0, 0, 8);
  }
  requestAnimationFrame(animateHelis);
})(0);

// ---------------------------------------------------------------- people & city
app.append(el('h2', {}, '3. People and buildings'));
app.append(el('p', { className: 'note' }, 'People wave until you pick them up. Buildings get windows, a light and a shadow side and rooftop details (water tanks, antennas, air conditioning). The background (skyline, clouds) is kept soft so it never looks like something you can crash into.'));
const close = el('canvas', { width: 180, height: 110 });
close.style.width = '360px';
close.style.maxWidth = '100%';
app.append(close);
(function animateClose(now) {
  const g = close.getContext('2d');
  g.fillStyle = HEX.skyBlue;
  g.fillRect(0, 0, 180, 110);
  drawCloud(g, 120, 6, 40, 5);
  drawBuilding(g, 8, 40, 50, 70, 0, 3);
  drawBuilding(g, 68, 62, 44, 48, 1, 0);
  drawBuilding(g, 122, 30, 50, 80, 2, 9);
  drawSprite(g, PERSON_FRAMES[Math.floor(now / 350) % 2], 86, 55);
  requestAnimationFrame(animateClose);
})(0);

// ---------------------------------------------------------------- sounds
app.append(el('h2', {}, '4. Sound effects'));
app.append(el('p', { className: 'note' }, 'Tap ▶ to listen, then tap the one you like best.'));
const soundButtons = [];
for (const [key, s] of Object.entries(SFX)) {
  const box = el('div', { className: 'sound' }, el('div', { className: 'title' }, s.label));
  for (const v of ['A', 'B', 'C']) {
    if (!s[v]) continue;
    const play = el('button', { className: 'play' }, `▶ ${v}`);
    play.addEventListener('click', () => synth.play(s[v].v));
    const pick = el('button', {}, `${v}: ${s[v].name}`);
    pick.addEventListener('click', () => {
      synth.play(s[v].v);
      picks[key] = v;
      savePicks();
      refresh();
    });
    pick.dataset.sound = key;
    pick.dataset.key = v;
    soundButtons.push(pick);
    box.append(el('div', {}, play, pick));
  }
  app.append(box);
}

// ---------------------------------------------------------------- music
app.append(el('h2', {}, '5. Title theme'));
app.append(el('p', { className: 'note' }, 'First draft of the title music (about 27 seconds, it loops). Does it sound like an 80s arcade game? Is it catchy?'));
const playBtn = el('button', { className: 'play' }, '▶ Play title theme');
const stopBtn = el('button', {}, '■ Stop');
playBtn.addEventListener('click', () => music.play(TITLE_THEME));
stopBtn.addEventListener('click', () => music.stop());
const likeBtns = ['Love it', 'OK, keep going', 'Try something else'].map((label) => {
  const b = el('button', {}, label);
  b.dataset.theme = label;
  b.addEventListener('click', () => {
    picks.theme = label;
    savePicks();
    refresh();
  });
  return b;
});
app.append(el('div', {}, playBtn, stopBtn), el('div', {}, ...likeBtns));

// ---------------------------------------------------------------- notes + copy
app.append(el('h2', {}, '6. Anything else?'));
const notes = el('textarea', { placeholder: 'e.g. "helicopter more red", "kids loved the crash sound", "clouds too busy"', value: picks.notes || '' });
notes.addEventListener('input', () => {
  picks.notes = notes.value;
  savePicks();
});
app.append(notes);

const status = el('span', { className: 'ok' });
const copyBtn = el('button', { className: 'picked' }, 'Copy my picks');
copyBtn.addEventListener('click', async () => {
  const lines = [
    'ROTOR RESCUE PICKS',
    `helicopter: ${picks.heli} (${HELICOPTERS[picks.heli].name})`,
    ...Object.entries(SFX).map(([k, s]) => `${k}: ${picks[k] ? `${picks[k]} (${s[picks[k]].name})` : '-'}`),
    `title theme: ${picks.theme || '-'}`,
    `notes: ${picks.notes || '-'}`,
  ];
  status.textContent = (await copyText(lines.join('\n'))) ? 'Copied! Paste it to Claude.' : 'Copy failed';
});
app.append(el('div', { className: 'actions' }, copyBtn, status));

function refresh() {
  heliRow.querySelectorAll('.card').forEach((c) => c.classList.toggle('picked', c.dataset.key === picks.heli));
  soundButtons.forEach((b) => b.classList.toggle('picked', picks[b.dataset.sound] === b.dataset.key));
  likeBtns.forEach((b) => b.classList.toggle('picked', picks.theme === b.dataset.theme));
}
refresh();
