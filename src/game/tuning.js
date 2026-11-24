import { createTuning } from '../kit/tuning.js';
import { store } from './store.js';

// Everything Jozo can adjust in the ?tune=1 panel. Units are game pixels and seconds.
export const TUNING_SPEC = [
  { key: 'gravity', label: 'Gravity', min: 200, max: 1500, step: 10, def: 620, unit: 'px/s²' },
  { key: 'tapImpulse', label: 'Tap impulse (lift)', min: 50, max: 400, step: 5, def: 165, unit: 'px/s' },
  { key: 'hoverStrength', label: 'Hover strength', min: 1, max: 30, step: 0.5, def: 10, unit: '/s' },
  { key: 'forwardSpeed', label: 'Forward speed', min: 20, max: 150, step: 1, def: 60, unit: 'px/s' },
  { key: 'hitboxPct', label: 'Hitbox size', min: 40, max: 100, step: 1, def: 75, unit: '%' },
  { key: 'pickupReach', label: 'Pickup reach', min: 4, max: 60, step: 1, def: 24, unit: 'px' },
  // Extras (not in the brief, but useful knobs for the same feel):
  { key: 'hoverDelay', label: 'Hold → hover after', min: 0, max: 400, step: 10, def: 150, unit: 'ms' },
  { key: 'maxFallSpeed', label: 'Max fall speed', min: 100, max: 800, step: 10, def: 320, unit: 'px/s' },
];

export const tune = createTuning(TUNING_SPEC, store);
export const DEFAULT_TUNING = tune.defaults;
// One live object. The game reads it every frame, the panel writes to it.
export const tuning = tune.values;
