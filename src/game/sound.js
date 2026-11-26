import { createSound } from '../kit/audio/sound.js';
import { store } from './store.js';
import { CHOSEN_SFX, CHOSEN_THEME, CHOSEN_LEVEL_MUSIC } from './choices.js';

// One sound system for the whole game.
export const sound = createSound({
  store,
  sfx: CHOSEN_SFX,
  songs: { title: CHOSEN_THEME, level: CHOSEN_LEVEL_MUSIC },
  songVolume: { level: 0.6 }, // a bit quieter while flying, so sound effects stay clear
});
