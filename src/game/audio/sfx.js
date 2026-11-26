import { noteHz as n } from '../../kit/audio/synth.js';

// Sound effect candidates (2-3 versions each) for Jozo and the kids to pick.
// Each is a list of synth voices (see src/kit/audio/synth.js).
export const SFX = {
  tap: {
    label: 'Tap (lift)',
    A: { name: 'Blip', v: [{ wave: 'square', f0: 660, f1: 990, dur: 0.05, vol: 0.3 }] },
    B: {
      name: 'Soft puff',
      v: [
        { wave: 'triangle', f0: 300, f1: 560, dur: 0.08, vol: 0.6 },
        { wave: 'noise', filter: 1500, dur: 0.05, vol: 0.12 },
      ],
    },
    C: { name: 'Chirp', v: [{ wave: 'pulse25', f0: 1200, f1: 700, dur: 0.045, vol: 0.25 }] },
  },
  pickup: {
    label: 'Person rescued (+100)',
    A: {
      name: 'Ding-ding',
      v: [
        { wave: 'square', f0: n('B5'), dur: 0.08, vol: 0.28 },
        { t: 0.08, wave: 'square', f0: n('E6'), dur: 0.3, vol: 0.28, hold: 0.3 },
      ],
    },
    B: {
      name: 'Happy arpeggio',
      v: [
        {
          wave: 'pulse25',
          f0: n('C6'),
          dur: 0.28,
          vol: 0.28,
          hold: 0.6,
          steps: [[0.05, n('E6')], [0.1, n('G6')], [0.15, n('C7')]],
        },
      ],
    },
    C: {
      name: 'Sparkle',
      v: [
        { wave: 'pulse12', f0: 800, f1: 2400, dur: 0.14, vol: 0.22 },
        { t: 0.1, wave: 'triangle', f0: n('E6'), dur: 0.25, vol: 0.5 },
      ],
    },
  },
  crash: {
    label: 'Crash',
    A: {
      name: 'Boom',
      v: [
        { wave: 'noise', filter: 2000, filter1: 200, dur: 0.6, vol: 0.8 },
        { wave: 'triangle', f0: 120, f1: 40, dur: 0.4, vol: 0.7 },
      ],
    },
    B: {
      name: 'Crunch',
      v: [
        { wave: 'noise', filter: 6000, filter1: 500, dur: 0.35, vol: 0.7 },
        { wave: 'square', f0: 400, f1: 60, dur: 0.3, vol: 0.25 },
      ],
    },
    C: {
      name: 'Big explosion',
      v: [
        { wave: 'noise', filter: 3000, filter1: 100, dur: 1.0, vol: 0.85 },
        { t: 0.15, wave: 'noise', filter: 1500, filter1: 100, dur: 0.7, vol: 0.6 },
        { wave: 'triangle', f0: 90, f1: 30, dur: 0.6, vol: 0.7 },
      ],
    },
  },
  countdown: {
    label: 'READY! 3 2 1 GO!',
    A: {
      name: 'Classic beeps',
      v: [
        { t: 0.0, wave: 'square', f0: n('A5'), dur: 0.12, vol: 0.25 },
        { t: 0.5, wave: 'square', f0: n('A5'), dur: 0.12, vol: 0.25 },
        { t: 1.0, wave: 'square', f0: n('A5'), dur: 0.12, vol: 0.25 },
        { t: 1.5, wave: 'square', f0: n('A6'), dur: 0.4, vol: 0.25, hold: 0.5 },
      ],
    },
    B: {
      name: 'Soft beeps + GO! chord',
      v: [
        { t: 0.0, wave: 'triangle', f0: n('E5'), dur: 0.15, vol: 0.6 },
        { t: 0.5, wave: 'triangle', f0: n('E5'), dur: 0.15, vol: 0.6 },
        { t: 1.0, wave: 'triangle', f0: n('E5'), dur: 0.15, vol: 0.6 },
        { t: 1.5, wave: 'pulse25', f0: n('C6'), dur: 0.45, vol: 0.22, hold: 0.5, steps: [[0.04, n('E6')], [0.08, n('G6')]] },
        { t: 1.5, wave: 'triangle', f0: n('C5'), dur: 0.45, vol: 0.5, hold: 0.5 },
      ],
    },
  },
  landing: {
    label: 'Landing on the helipad',
    A: {
      name: 'Thump',
      v: [
        { wave: 'triangle', f0: 140, f1: 50, dur: 0.2, vol: 0.8 },
        { wave: 'noise', filter: 600, dur: 0.12, vol: 0.3 },
      ],
    },
    B: {
      name: 'Touchdown',
      v: [
        { wave: 'triangle', f0: 140, f1: 50, dur: 0.18, vol: 0.7 },
        { t: 0.1, wave: 'pulse25', f0: n('G5'), dur: 0.08, vol: 0.22 },
        { t: 0.18, wave: 'pulse25', f0: n('C6'), dur: 0.25, vol: 0.22, hold: 0.4 },
      ],
    },
  },
  levelClear: {
    label: 'Level complete jingle',
    A: {
      name: 'Fanfare',
      v: [
        ...['C5', 'E5', 'G5', 'C6'].map((x, i) => ({ t: i * 0.09, wave: 'square', f0: n(x), dur: 0.09, vol: 0.22 })),
        { t: 0.45, wave: 'square', f0: n('G5'), dur: 0.18, vol: 0.22 },
        { t: 0.63, wave: 'square', f0: n('C6'), dur: 0.9, vol: 0.22, hold: 0.6 },
        { t: 0.0, wave: 'triangle', f0: n('C3'), dur: 0.36, vol: 0.5 },
        { t: 0.45, wave: 'triangle', f0: n('G3'), dur: 0.18, vol: 0.5 },
        { t: 0.63, wave: 'triangle', f0: n('C4'), dur: 0.9, vol: 0.5, hold: 0.6 },
      ],
    },
    B: {
      name: 'Bouncy',
      v: [
        ...['G5', 'C6', 'E6', 'G6', 'E6', 'G6'].map((x, i) => ({
          t: i * 0.12,
          wave: 'pulse25',
          f0: n(x),
          dur: 0.1,
          vol: 0.22,
        })),
        { t: 0.72, wave: 'pulse25', f0: n('C7'), dur: 0.8, vol: 0.2, hold: 0.6 },
        ...['C3', 'G3', 'C4', 'G3'].map((x, i) => ({ t: i * 0.24, wave: 'triangle', f0: n(x), dur: 0.2, vol: 0.5 })),
        { t: 0.96, wave: 'triangle', f0: n('C3'), dur: 0.6, vol: 0.5 },
      ],
    },
  },
  click: {
    label: 'Menu button',
    A: { name: 'Tick', v: [{ wave: 'square', f0: 1500, dur: 0.025, vol: 0.2 }] },
    B: { name: 'Blip', v: [{ wave: 'pulse25', f0: 900, f1: 1300, dur: 0.04, vol: 0.22 }] },
  },
};
