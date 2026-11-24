import { createTuning } from '../kit/tuning.js';
import { store } from './store.js';

// Everything Jozo can adjust in the ?tune=1 panel. Units are game pixels and seconds.
// Defaults = Jozo's values from his own play test (2026-11-24).
export const TUNING_SPEC = [
  { key: 'gravity', label: 'Gravity', min: 200, max: 1500, step: 10, def: 400, unit: 'px/s²' },
  { key: 'tapImpulse', label: 'Tap impulse (lift)', min: 50, max: 400, step: 5, def: 150, unit: 'px/s' },
  { key: 'hoverStrength', label: 'Hover strength', min: 1, max: 30, step: 0.5, def: 10, unit: '/s' },
  { key: 'forwardSpeed', label: 'Forward speed', min: 20, max: 150, step: 1, def: 60, unit: 'px/s' },
  { key: 'hitboxPct', label: 'Hitbox size', min: 40, max: 100, step: 1, def: 91, unit: '%' },
  { key: 'pickupReach', label: 'Pickup reach', min: 4, max: 60, step: 1, def: 20, unit: 'px' },
  // Extras (not in the brief, but useful knobs for the same feel):
  { key: 'hoverDelay', label: 'Hold → hover after', min: 0, max: 400, step: 10, def: 150, unit: 'ms' },
  { key: 'maxFallSpeed', label: 'Max fall speed', min: 100, max: 800, step: 10, def: 270, unit: 'px/s' },
  // Limited hover — to compare in the playtest (design doc §2):
  //   0 = unlimited, 1 = fixed time per hold, 2 = hover gauge
  { key: 'hoverLimitMode', label: 'Hover limit: 0 off · 1 time per hold · 2 gauge', min: 0, max: 2, step: 1, def: 2, unit: '' },
  { key: 'hoverTimeLimit', label: '(1) Hover time per hold', min: 0.25, max: 4, step: 0.05, def: 1.25, unit: 's' },
  { key: 'gaugeSeconds', label: '(2) Full gauge lasts', min: 0.25, max: 6, step: 0.05, def: 2, unit: 's' },
  { key: 'gaugeDisplay', label: '(2) Gauge shown: 0 top bar + flash · 1 flash only · 2 above heli', min: 0, max: 2, step: 1, def: 0, unit: '' },
  { key: 'gaugeRefillSeconds', label: '(2) Gauge refills in', min: 0.25, max: 8, step: 0.05, def: 2, unit: 's' },
];

export const tune = createTuning(TUNING_SPEC, store);
export const DEFAULT_TUNING = tune.defaults;
// One live object. The game reads it every frame, the panel writes to it.
export const tuning = tune.values;
