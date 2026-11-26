import { createSound } from '../kit/audio/sound.js';
import { store } from './store.js';
import { CHOSEN_SFX, CHOSEN_THEME } from './choices.js';
import { LEVEL_TRACKS } from './audio/levelMusic.js';

// One sound system for the whole game.
export const sound = createSound({
  store,
  sfx: CHOSEN_SFX,
  songs: { title: CHOSEN_THEME, ...LEVEL_TRACKS },
  // In-level tracks a bit quieter, so sound effects stay clear.
  songVolume: Object.fromEntries(Object.keys(LEVEL_TRACKS).map((k) => [k, 0.6])),
});
