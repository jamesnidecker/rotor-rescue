import { buildSong } from '../../kit/audio/compose.js';

// In-level music drafts (played while flying). ALL drafts stay here (archive).
// Shape: A (8 bars) + B (8 bars) + A again = 24 bars, about 40 s, then loops.
const AAB = (a, b) => [...a, ...b, ...a];

// Draft 1 — "Sky Patrol": G major like the title theme, driving, 150 BPM.
const SKY_A_CHORDS = ['G', 'Em', 'C', 'D', 'G', 'Em', 'C', 'D'];
const SKY_B_CHORDS = ['C', 'D', 'Bm', 'Em', 'C', 'D', 'G', 'D'];
const SKY_A = [
  [['D6', 1], ['B5', 1], ['G5', 1], ['B5', 1], ['D6', 2], ['G6', 2]],
  [['E6', 2], ['D6', 1], ['B5', 1], ['G5', 2], ['E5', 2]],
  [['E6', 1], ['D6', 1], ['C6', 1], ['E6', 1], ['G6', 2], ['E6', 2]],
  [['F#6', 2], ['E6', 1], ['D6', 1], ['A5', 2], ['D6', 2]],
  [['B5', 1], ['D6', 1], ['G6', 2], ['F#6', 1], ['E6', 1], ['D6', 2]],
  [['E6', 1], ['G6', 1], ['B5', 2], ['A5', 1], ['G5', 1], ['E5', 2]],
  [['C6', 2], ['E6', 2], ['D6', 1], ['C6', 1], ['A5', 2]],
  [['D6', 4], ['r', 2], ['D5', 2]],
];
const SKY_B = [
  [['G5', 2], ['C6', 2], ['E6', 2], ['C6', 2]],
  [['A5', 2], ['D6', 2], ['F#6', 2], ['D6', 2]],
  [['F#5', 1], ['B5', 1], ['D6', 2], ['F#6', 2], ['D6', 2]],
  [['E6', 4], ['B5', 2], ['G5', 2]],
  [['C6', 1], ['C6', 1], ['E6', 2], ['G6', 2], ['E6', 2]],
  [['D6', 1], ['D6', 1], ['F#6', 2], ['A6', 2], ['F#6', 2]],
  [['G6', 2], ['D6', 2], ['B5', 2], ['G5', 2]],
  [['A5', 2], ['B5', 2], ['C6', 2], ['D6', 2]],
];
const DRAFT_1 = buildSong({
  name: 'Draft 1 — Sky Patrol',
  bpm: 150,
  chords: AAB(SKY_A_CHORDS, SKY_B_CHORDS),
  melody: AAB(SKY_A, SKY_B),
  lead: 'pulse25',
  leadVol: 0.15,
  arp: 'pulse12',
  arpVol: 0.05,
  drums: ['k.h.s.h.k.h.s.h.', 'k.h.s.h.k.k.s.h.', 'k.h.s.h.k.h.s.h.', 'k.h.s.hhk.k.s.ss'],
});

// Draft 2 — "Rooftop Run": A minor, fast and driving, 156 BPM.
const RUN_A_CHORDS = ['Am', 'G', 'F', 'G', 'Am', 'G', 'F', 'E'];
const RUN_B_CHORDS = ['Dm', 'F', 'G', 'Am', 'Dm', 'F', 'G', 'E'];
const RUN_A = [
  [['A5', 1], ['r', 1], ['A5', 1], ['C6', 1], ['E6', 2], ['C6', 2]],
  [['B5', 1], ['r', 1], ['B5', 1], ['D6', 1], ['G6', 2], ['D6', 2]],
  [['A5', 1], ['r', 1], ['A5', 1], ['C6', 1], ['F6', 2], ['E6', 2]],
  [['D6', 2], ['B5', 2], ['G5', 2], ['B5', 2]],
  [['E6', 1], ['D6', 1], ['C6', 1], ['B5', 1], ['A5', 2], ['E5', 2]],
  [['D6', 1], ['C6', 1], ['B5', 1], ['A5', 1], ['G5', 2], ['D5', 2]],
  [['C6', 2], ['A5', 2], ['F5', 2], ['A5', 2]],
  [['G#5', 2], ['B5', 2], ['E6', 4]],
];
const RUN_B = [
  [['F5', 2], ['A5', 2], ['D6', 2], ['F6', 2]],
  [['E6', 2], ['C6', 2], ['A5', 2], ['F5', 2]],
  [['G5', 1], ['B5', 1], ['D6', 2], ['G6', 2], ['D6', 2]],
  [['E6', 4], ['C6', 2], ['A5', 2]],
  [['D6', 1], ['F6', 1], ['A6', 2], ['F6', 2], ['D6', 2]],
  [['C6', 1], ['F6', 1], ['A6', 2], ['F6', 2], ['C6', 2]],
  [['B5', 2], ['D6', 2], ['G6', 2], ['B5', 2]],
  [['B5', 2], ['G#5', 2], ['E5', 2], ['r', 2]],
];
const DRAFT_2 = buildSong({
  name: 'Draft 2 — Rooftop Run',
  bpm: 156,
  chords: AAB(RUN_A_CHORDS, RUN_B_CHORDS),
  melody: AAB(RUN_A, RUN_B),
  lead: 'square',
  leadVol: 0.14,
  arp: 'pulse12',
  arpVol: 0.05,
  bassStyle: 'walk',
  drums: ['k.hhs.hhk.hhs.hh', 'k.hhs.hhkkhhs.hs'],
});

// Draft 3 — "Happy Heli": C major, bouncy with little pauses, 138 BPM.
const HAPPY_A_CHORDS = ['C', 'F', 'C', 'G', 'C', 'F', 'G', 'C'];
const HAPPY_B_CHORDS = ['Am', 'Em', 'F', 'G', 'Am', 'Em', 'F/G', 'C'];
const HAPPY_A = [
  [['C6', 1], ['r', 1], ['G5', 1], ['C6', 1], ['E6', 1], ['r', 1], ['D6', 2]],
  [['C6', 1], ['r', 1], ['A5', 1], ['C6', 1], ['F6', 1], ['r', 1], ['E6', 2]],
  [['E6', 1], ['D6', 1], ['C6', 1], ['D6', 1], ['E6', 2], ['G6', 2]],
  [['D6', 2], ['r', 1], ['B5', 1], ['G5', 2], ['B5', 2]],
  [['C6', 1], ['r', 1], ['G5', 1], ['C6', 1], ['E6', 1], ['r', 1], ['G6', 2]],
  [['A6', 1], ['r', 1], ['G6', 1], ['F6', 1], ['E6', 2], ['C6', 2]],
  [['D6', 1], ['E6', 1], ['D6', 1], ['C6', 1], ['B5', 2], ['G5', 2]],
  [['C6', 4], ['r', 4]],
];
const HAPPY_B = [
  [['A5', 2], ['C6', 2], ['E6', 2], ['A5', 2]],
  [['G5', 2], ['B5', 2], ['E6', 2], ['G5', 2]],
  [['A5', 1], ['C6', 1], ['F6', 2], ['E6', 2], ['C6', 2]],
  [['B5', 1], ['D6', 1], ['G6', 2], ['F6', 2], ['D6', 2]],
  [['E6', 2], ['A6', 2], ['G6', 1], ['E6', 1], ['C6', 2]],
  [['B5', 2], ['E6', 2], ['D6', 1], ['B5', 1], ['G5', 2]],
  [['A5', 2], ['C6', 2], ['B5', 2], ['D6', 2]],
  [['C6', 2], ['E6', 2], ['G6', 2], ['r', 2]],
];
const DRAFT_3 = buildSong({
  name: 'Draft 3 — Happy Heli',
  bpm: 138,
  chords: AAB(HAPPY_A_CHORDS, HAPPY_B_CHORDS),
  melody: AAB(HAPPY_A, HAPPY_B),
  lead: 'square',
  leadVol: 0.14,
  arp: 'pulse25',
  arpVol: 0.045,
  arpOctave: 4,
  drums: ['k..hs.h.k.k.s.h.', 'k..hs.h.k.k.s.hs'],
});

export const LEVEL_THEMES = [DRAFT_1, DRAFT_2, DRAFT_3];
