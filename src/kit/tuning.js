// Live tuning values described by a spec:
//   [{ key, label, min, max, step, def, unit }]
// The game reads `values` every frame; the ?tune=1 panel writes to it.
export function createTuning(spec, store) {
  const defaults = Object.fromEntries(spec.map((s) => [s.key, s.def]));
  const values = { ...defaults };
  return {
    spec,
    defaults,
    values,
    load() {
      const saved = store?.load('tuning', {}) ?? {};
      for (const s of spec) {
        const v = Number(saved[s.key]);
        if (Number.isFinite(v)) values[s.key] = Math.min(s.max, Math.max(s.min, v));
      }
    },
    save() {
      store?.save('tuning', values);
    },
    reset() {
      Object.assign(values, defaults);
      store?.save('tuning', values);
    },
    asText() {
      return spec.map((s) => `${s.key}: ${values[s.key]}`).join('\n');
    },
  };
}
