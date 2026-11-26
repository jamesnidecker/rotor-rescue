import { createSound } from '../kit/audio/sound.js';
import { store } from './store.js';
import { CHOSEN_SFX, CHOSEN_THEME } from './choices.js';

// One sound system for the whole game.
export const sound = createSound({
  store,
  sfx: CHOSEN_SFX,
  songs: { title: CHOSEN_THEME },
});
