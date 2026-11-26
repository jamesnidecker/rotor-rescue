// What Jozo and the kids picked on the picks page (preview.html), 2026-11-26.
// Change a letter here to switch to another version.
import { SFX } from './audio/sfx.js';
import { TITLE_THEMES } from './audio/titleTheme.js';
import { LEVEL_THEMES } from './audio/levelMusic.js';

export const CHOICES = {
  heli: 'B', // Bubble
  sky: 'C', // Plain
  clouds: 'A', // Puffy
  theme: 3, // Draft 3 — Sunny
  levelMusic: 1, // Draft 1 — Sky Patrol (Claude's pick until the kids choose)
  sfx: {
    tap: 'A', // Blip
    pickup: 'B', // Happy arpeggio
    crash: 'G', // Mega explosion (kids' pick, round 3)
    countdown: 'A', // Classic beeps
    landing: 'B', // Touchdown
    levelClear: 'B', // Bouncy
    click: 'B', // Blip
  },
};

export const CHOSEN_SFX = Object.fromEntries(Object.entries(CHOICES.sfx).map(([k, v]) => [k, SFX[k][v].v]));
export const CHOSEN_THEME = TITLE_THEMES[CHOICES.theme - 1];
export const CHOSEN_LEVEL_MUSIC = LEVEL_THEMES[CHOICES.levelMusic - 1];
