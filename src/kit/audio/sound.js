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

  // Unlock on a touch / click / key anywhere on the page. iPhones only accept
  // some moments of a tap (often the finger lifting), so keep trying on every
  // gesture until the audio is really running.
  const GESTURES = ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'click', 'keydown'];
  const tryUnlock = () => {
    if (unlocked) return;
    synth.unlockFromTap().then((running) => {
      if (!running || unlocked) return;
      unlocked = true;
      GESTURES.forEach((ev) => window.removeEventListener(ev, tryUnlock, true));
      startWanted();
    });
  };
  GESTURES.forEach((ev) => window.addEventListener(ev, tryUnlock, { capture: true, passive: true }));
  const unlockOnce = tryUnlock;
  // Silence while the app/tab is in the background.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) synth.suspend();
    else {
      synth.resume();
      // iOS can leave audio stopped after switching apps; then the next tap
      // unlocks it again and the music restarts.
      setTimeout(() => {
        if (unlocked && !synth.running) {
          unlocked = false;
          player.stop();
          GESTURES.forEach((ev) => window.addEventListener(ev, tryUnlock, { capture: true, passive: true }));
        }
      }, 300);
    }
  });

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
