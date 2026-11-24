// Safe localStorage, namespaced per game. localStorage can throw (private mode,
// blocked storage); that must never break a game.
export function createStore(prefix) {
  const load = (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(prefix + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  };
  const save = (key, value) => {
    try {
      window.localStorage.setItem(prefix + key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  };
  const remove = (key) => {
    try {
      window.localStorage.removeItem(prefix + key);
    } catch {
      /* ignore */
    }
  };
  return {
    load,
    save,
    remove,
    getHiScore: () => load('hiscore', 0) | 0,
    submitScore(score) {
      if (score > (load('hiscore', 0) | 0)) save('hiscore', score);
    },
    getSettings: () => ({ music: true, sfx: true, ...load('settings', {}) }),
    setSettings: (s) => save('settings', s),
  };
}
