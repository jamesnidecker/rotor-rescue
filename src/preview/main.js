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
import { drawBuilding, drawSky, drawCloud, drawClouds, drawSkyline, SKIES, CLOUDS } from '../game/art/city.js';
import { SFX } from '../game/audio/sfx.js';
import { TITLE_THEMES } from '../game/audio/titleTheme.js';
import { LEVEL_THEMES } from '../game/audio/levelMusic.js';
import { buildWorld } from '../game/world.js';
import { getLevel } from '../game/levels/index.js';
import { levelCanvas } from '../game/art/level.js';
import { GAME_W, GAME_H, GROUND_Y, HUD_H } from '../game/config.js';

const store = createStore('rotor-rescue.');
const picks = { heli: 'A', sky: 'A', clouds: 'A', ...store.load('picks.v1', {}) };
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
const strip = levelCanvas(world);
// Background layers: sky (fixed), far skyline (slow), clouds (slower still).
const sky = el('canvas', { width: GAME_W, height: GAME_H });
const skyline = el('canvas', { width: 900, height: GAME_H });
drawSkyline(skyline.getContext('2d'), 900, GROUND_Y, 7);
const clouds = el('canvas', { width: 900, height: 140 });
function redrawBackground() {
  const sg = sky.getContext('2d');
  sg.clearRect(0, 0, GAME_W, GAME_H);
  drawSky(sg, GAME_W, HUD_H, GROUND_Y, picks.sky);
  const cg = clouds.getContext('2d');
  cg.clearRect(0, 0, 900, 140);
  drawClouds(cg, picks.clouds);
}
redrawBackground();

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
  card.dataset.group = 'heli';
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

// ---------------------------------------------------------------- sky & clouds
function pickRow(title, note, options, key) {
  app.append(el('h2', {}, title), el('p', { className: 'note' }, note));
  const row = el('div', { className: 'row' });
  for (const [k, o] of Object.entries(options)) {
    const card = el('div', { className: 'card' }, el('div', {}, el('b', {}, `${k}: ${o.name}`)), el('div', { className: 'sub' }, o.note));
    card.dataset.group = key;
    card.dataset.key = k;
    card.addEventListener('click', () => {
      picks[key] = k;
      savePicks();
      redrawBackground();
      refresh();
      scene.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    row.append(card);
  }
  app.append(row);
}
pickRow('3. Sky', 'Tap one: the live scene at the top changes to show it.', SKIES, 'sky');
pickRow('4. Clouds', 'Tap one: the live scene at the top changes to show it.', CLOUDS, 'clouds');

// ---------------------------------------------------------------- people & city
app.append(el('h2', {}, '5. People and buildings'));
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
app.append(el('h2', {}, '6. Sound effects'));
app.append(el('p', { className: 'note' }, 'Tap ▶ to listen, then tap the one you like best.'));
const soundButtons = [];
for (const [key, s] of Object.entries(SFX)) {
  const box = el('div', { className: 'sound' }, el('div', { className: 'title' }, s.label));
  for (const v of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']) {
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
app.append(el('h2', {}, '7. Title theme'));
app.append(el('p', { className: 'note' }, 'Three drafts, each about 25-30 seconds and looping. All drafts are kept, so you can always come back to one. Tap the one you like best.'));
const themeBtns = [];
TITLE_THEMES.forEach((song, i) => {
  const play = el('button', { className: 'play' }, `▶ ${song.name}`);
  play.addEventListener('click', () => music.play(song));
  const pick = el('button', {}, 'Favourite');
  pick.dataset.theme = String(i + 1);
  pick.addEventListener('click', () => {
    picks.theme = String(i + 1);
    savePicks();
    refresh();
  });
  themeBtns.push(pick);
  app.append(el('div', { className: 'sound' }, play, pick));
});
app.append(el('h2', {}, '7b. Music while flying'));
app.append(el('p', { className: 'note' }, 'Three drafts of the in-level music, about 40 seconds each, looping. It should be fun to fly to and not annoying after many rounds. Tap the one you like best.'));
const levelBtns = [];
LEVEL_THEMES.forEach((song, i) => {
  const play = el('button', { className: 'play' }, `▶ ${song.name}`);
  play.addEventListener('click', () => music.play(song));
  const pick = el('button', {}, 'Favourite');
  pick.dataset.level = String(i + 1);
  pick.addEventListener('click', () => {
    picks.levelMusic = String(i + 1);
    savePicks();
    refresh();
  });
  levelBtns.push(pick);
  app.append(el('div', { className: 'sound' }, play, pick));
});
const stopBtn = el('button', {}, '■ Stop music');
stopBtn.addEventListener('click', () => music.stop());
app.append(el('div', {}, stopBtn));

// ---------------------------------------------------------------- notes + copy
app.append(el('h2', {}, '8. Anything else?'));
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
    `sky: ${picks.sky} (${SKIES[picks.sky].name})`,
    `clouds: ${picks.clouds} (${CLOUDS[picks.clouds].name})`,
    `title theme: ${picks.theme ? TITLE_THEMES[Number(picks.theme) - 1]?.name ?? picks.theme : '-'}`,
    `music while flying: ${picks.levelMusic ? LEVEL_THEMES[Number(picks.levelMusic) - 1]?.name : '-'}`,
    `notes: ${picks.notes || '-'}`,
  ];
  status.textContent = (await copyText(lines.join('\n'))) ? 'Copied! Paste it to Claude.' : 'Copy failed';
});
app.append(el('div', { className: 'actions' }, copyBtn, status));

function refresh() {
  document.querySelectorAll('.card').forEach((c) => c.classList.toggle('picked', picks[c.dataset.group] === c.dataset.key));
  soundButtons.forEach((b) => b.classList.toggle('picked', picks[b.dataset.sound] === b.dataset.key));
  themeBtns.forEach((b) => b.classList.toggle('picked', picks.theme === b.dataset.theme));
  levelBtns.forEach((b) => b.classList.toggle('picked', picks.levelMusic === b.dataset.level));
}
refresh();
