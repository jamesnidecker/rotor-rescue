import { createSynth } from './synth.js';
import { createMusicPlayer } from './music.js';

// Game sound: named sound effects + named songs, obeying the MUSIC / SFX
// switches saved in the store (pause menu). Browsers only allow sound after a
// tap, so nothing plays until unlock() has been called from a tap.
//   sfx:   { name: [voices] }      songs: { name: song }
export function createSound({ store, sfx = {}, songs = {}, volume = 0.3 }) {
  const synth = createSynth({ volume });
  const player = createMusicPlayer(synth);
  let unlocked = false;
  let wanted = null; // song that should be playing (if music is on)

  const settings = () => store.getSettings();

  function startWanted() {
    if (unlocked && wanted && settings().music && !player.playing) player.play(songs[wanted]);
  }

  // Unlock on the first touch / click / key anywhere on the page.
  const unlockOnce = () => {
    if (unlocked) return;
    synth.unlock();
    unlocked = true;
    startWanted();
  };
  for (const ev of ['pointerdown', 'touchend', 'keydown']) {
    window.addEventListener(ev, unlockOnce, { capture: true, passive: true });
  }
  // Silence while the app/tab is in the background.
  document.addEventListener('visibilitychange', () => (document.hidden ? synth.suspend() : synth.resume()));

  return {
    get unlocked() {
      return unlocked;
    },
    unlock: unlockOnce,
    play(name) {
      if (!unlocked || !settings().sfx) return;
      const v = sfx[name];
      if (v) synth.play(v);
    },
    music(name) {
      if (wanted === name && player.playing) return;
      wanted = name;
      player.stop();
      startWanted();
    },
    stopMusic() {
      wanted = null;
      player.stop();
    },
    // Call after the MUSIC / SFX switches change.
    applySettings() {
      if (!settings().music) player.stop();
      else startWanted();
    },
  };
}
