// Add new levels here. Each level is a data file; no game code changes needed.
import level01 from './level01.js';

export const LEVELS = [level01];

export function getLevel(n) {
  return LEVELS[(n - 1) % LEVELS.length];
}
