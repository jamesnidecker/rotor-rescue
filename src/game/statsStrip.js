import { HEX } from '../kit/palette.js';
import { GAME_H, CEILING_Y, GROUND_Y } from './config.js';
import { buildWorld } from './world.js';
import { LEVELS } from './levels/index.js';

const levelById = (id) => LEVELS.find((l) => l.id === id) ?? LEVELS[0];

export function levelLength(id) {
  return levelById(id).length;
}

// Draws a whole level as a thin strip with a red dot per crash (stats screen).
export function drawLevelStrip(canvas, id, crashes) {
  const world = buildWorld(levelById(id));
  const W = 1400;
  const H = 160;
  canvas.width = W;
  canvas.height = H;
  const sx = W / world.length;
  const sy = H / GAME_H;
  const g = canvas.getContext('2d');
  g.fillStyle = HEX.skyBlue;
  g.fillRect(0, 0, W, H);
  g.fillStyle = HEX.black;
  g.fillRect(0, 0, W, CEILING_Y * sy);
  g.fillStyle = HEX.darkGrey;
  g.fillRect(0, GROUND_Y * sy, W, H);
  for (const s of world.solids) {
    g.fillStyle = s.kind === 'helipad' ? HEX.orange : HEX.midGrey;
    g.fillRect(s.x * sx, s.y * sy, Math.max(1, s.w * sx), s.h * sy);
  }
  g.fillStyle = HEX.yellow;
  for (const p of world.people) g.fillRect(p.x * sx, p.y * sy, 4, 6);
  g.fillStyle = HEX.red;
  g.strokeStyle = HEX.black;
  for (const c of crashes) {
    g.beginPath();
    g.arc(c.x * sx, c.y * sy, 7, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
}
