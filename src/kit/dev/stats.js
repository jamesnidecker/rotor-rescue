// Playtest stats. Stored ONLY on this device (localStorage). Never sent anywhere.
// Each attempt: { level, outcome: 'crash' | 'finish' | 'quit', rescued, people, x, y, at }
const KEY = 'stats.v1';
const MAX = 2000;

export function createStats(store) {
  const all = () => {
    const a = store.load(KEY, []);
    return Array.isArray(a) ? a : [];
  };
  return {
    all,
    record(rec) {
      const a = all();
      a.push({ ...rec, at: Date.now() });
      while (a.length > MAX) a.shift();
      store.save(KEY, a);
    },
    reset() {
      store.remove(KEY);
    },
  };
}
