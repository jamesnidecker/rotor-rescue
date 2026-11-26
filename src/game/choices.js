// What Jozo and the kids picked on the picks page (preview.html), 2026-11-26.
// Change a letter here to switch to another version.
import { SFX } from './audio/sfx.js';
import { TITLE_THEMES } from './audio/titleTheme.js';

export const CHOICES = {
  heli: 'B', // Bubble
  sky: 'C', // Plain
  clouds: 'A', // Puffy
  theme: 3, // Draft 3 — Sunny
  sfx: {
    tap: 'A', // Blip
    pickup: 'B', // Happy arpeggio
    crash: 'E', // Explosion + debris — Claude's pick until the kids choose (round 2)
    countdown: 'A', // Classic beeps
    landing: 'B', // Touchdown
    levelClear: 'B', // Bouncy
    click: 'B', // Blip
  },
};

export const CHOSEN_SFX = Object.fromEntries(Object.entries(CHOICES.sfx).map(([k, v]) => [k, SFX[k][v].v]));
export const CHOSEN_THEME = TITLE_THEMES[CHOICES.theme - 1];
