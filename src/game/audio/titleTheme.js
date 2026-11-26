// Title theme — first draft. Upbeat chiptune, 140 BPM, 16 bars (~27 s loop).
// Lead: square. Arpeggio: thin pulse. Bass: triangle. Drums: noise + kick.

const CHORDS = [
  // A section
  'C', 'Am', 'F', 'G', 'C', 'Am', 'F/G', 'C',
  // B section
  'F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'G',
];
const TONES = { C: ['C', 'E', 'G'], Am: ['A', 'C', 'E'], F: ['F', 'A', 'C'], G: ['G', 'B', 'D'], Em: ['E', 'G', 'B'] };

// Melody in eighth notes (each length x2 = sixteenths).
const MELODY_8THS = [
  [['E5', 2], ['G5', 1], ['C6', 1], ['B5', 2], ['G5', 2]],
  [['A5', 2], ['G5', 1], ['E5', 1], ['C5', 2], ['E5', 2]],
  [['F5', 2], ['A5', 1], ['C6', 1], ['A5', 2], ['F5', 2]],
  [['G5', 3], ['A5', 1], ['B5', 2], ['D6', 2]],
  [['E6', 2], ['D6', 1], ['C6', 1], ['G5', 2], ['E5', 2]],
  [['A5', 2], ['C6', 1], ['A5', 1], ['E5', 2], ['C5', 2]],
  [['F5', 1], ['A5', 1], ['C6', 2], ['D6', 1], ['B5', 1], ['G5', 2]],
  [['C6', 6], ['r', 2]],
  [['A5', 1], ['A5', 1], ['C6', 2], ['A5', 2], ['F5', 2]],
  [['B5', 1], ['B5', 1], ['D6', 2], ['B5', 2], ['G5', 2]],
  [['G5', 1], ['G5', 1], ['B5', 2], ['E6', 2], ['B5', 2]],
  [['C6', 2], ['B5', 1], ['A5', 1], ['E5', 4]],
  [['F5', 1], ['G5', 1], ['A5', 2], ['C6', 2], ['F6', 2]],
  [['G5', 1], ['A5', 1], ['B5', 2], ['D6', 2], ['G6', 2]],
  [['E6', 2], ['D6', 1], ['C6', 1], ['D6', 2], ['E6', 2]],
  [['D6', 2], ['B5', 2], ['G5', 2], ['r', 2]],
];

function chordsOfBar(bar) {
  return CHORDS[bar].split('/');
}

function arpeggio() {
  const notes = [];
  CHORDS.forEach((_, bar) => {
    const cs = chordsOfBar(bar);
    for (let i = 0; i < 16; i++) {
      const ch = cs[Math.floor((i * cs.length) / 16)];
      const t = TONES[ch];
      const seq = [t[0] + '4', t[1] + '4', t[2] + '4', t[0] + '5'];
      notes.push([seq[i % 4], 1]);
    }
  });
  return notes;
}

function bass() {
  const notes = [];
  CHORDS.forEach((_, bar) => {
    const cs = chordsOfBar(bar);
    for (let i = 0; i < 8; i++) {
      const root = TONES[cs[Math.floor((i * cs.length) / 8)]][0];
      notes.push([root + (i % 2 ? '3' : '2'), 2]);
    }
  });
  return notes;
}

export const TITLE_THEME = {
  name: 'Title theme (draft 1)',
  bpm: 140,
  bars: 16,
  tracks: [
    { wave: 'square', vol: 0.16, gate: 0.85, notes: MELODY_8THS.flat().map(([x, l]) => [x, l * 2]) },
    { wave: 'pulse12', vol: 0.06, gate: 0.7, notes: arpeggio() },
    { wave: 'triangle', vol: 0.45, gate: 0.8, notes: bass() },
    { drums: ['k.h.s.h.k.h.s.h.', 'k.h.s.h.k.k.s.hh'], vol: 0.8 },
  ],
};
