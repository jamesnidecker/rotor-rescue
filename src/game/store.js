import { createStore } from '../kit/storage.js';
import { createStats } from '../kit/dev/stats.js';

// Everything Rotor Rescue saves on the device lives under this prefix.
export const store = createStore('rotor-rescue.');
export const stats = createStats(store);
