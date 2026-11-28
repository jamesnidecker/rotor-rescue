import { HEX } from '../../kit/palette.js';
import { GAME_W, GAME_H, GROUND_Y } from '../config.js';
import { drawBuilding, drawSky, drawClouds, drawSkyline } from './city.js';

// Draws a whole level (buildings, helipad, ground) into one canvas.
// Roofs with people get no rooftop details, so nothing hides a person.
// `info` (optional) receives { windows, lights } positions for animated details.
export function levelCanvas(world, info = null) {
  if (info) Object.assign(info, { windows: info.windows || [], lights: info.lights || [] });
  const c = document.createElement('canvas');
  c.width = world.length + GAME_W;
  c.height = GAME_H;
  const g = c.getContext('2d');
  world.solids.forEach((s, i) => {
    if (s.kind === 'building') {
      const hasPerson = world.people.some((p) => p.x >= s.x && p.x <= s.x + s.w);
      drawBuilding(g, s.x, s.y, s.w, s.h, s.shade, hasPerson ? 0 : i + 1, info);
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
  g.fillRect(0, GROUND_Y, c.width, GAME_H - GROUND_Y);
  g.fillStyle = HEX.green;
  g.fillRect(0, GROUND_Y, c.width, 2);
  g.fillStyle = HEX.midGrey;
  for (let x = 0; x < c.width; x += 12) g.fillRect(x, GROUND_Y + 8, 6, 1);
  return c;
}

// Background layers (all repeat every 720 px horizontally).
export const BG_REPEAT = 720;

export function skyCanvas(key, top, bottom) {
  const c = document.createElement('canvas');
  c.width = GAME_W;
  c.height = GAME_H;
  drawSky(c.getContext('2d'), GAME_W, top, bottom, key);
  return c;
}

export function skylineCanvas() {
  const c = document.createElement('canvas');
  c.width = BG_REPEAT + GAME_W;
  c.height = GAME_H;
  drawSkyline(c.getContext('2d'), c.width, GROUND_Y, 7);
  // make the strip wrap seamlessly: copy the start to the end
  c.getContext('2d').drawImage(c, 0, 0, GAME_W, GAME_H, BG_REPEAT, 0, GAME_W, GAME_H);
  return c;
}

export function cloudsCanvas(key) {
  const c = document.createElement('canvas');
  c.width = BG_REPEAT + GAME_W;
  c.height = 140;
  const g = c.getContext('2d');
  drawClouds(g, key);
  g.drawImage(c, 0, 0, GAME_W, 140, BG_REPEAT, 0, GAME_W, 140);
  return c;
}
