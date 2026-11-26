// Build a looping chiptune song from chords + a melody (see music.js format).
//   chords:  one chord name per bar; 'F/G' = two chords in one bar
//   melody:  one array per bar of [note, eighths] (8 eighths per bar)
//   tones:   chord name -> its three notes (without octave)
export const TONES = {
  C: ['C', 'E', 'G'],
  Dm: ['D', 'F', 'A'],
  D: ['D', 'F#', 'A'],
  Em: ['E', 'G', 'B'],
  E: ['E', 'G#', 'B'],
  F: ['F', 'A', 'C'],
  G: ['G', 'B', 'D'],
  Am: ['A', 'C', 'E'],
  Bb: ['Bb', 'D', 'F'],
};

export function buildSong({ name, bpm, chords, melody, lead = 'square', leadVol = 0.16, arp = 'pulse12', arpVol = 0.06, bassVol = 0.45, drums, drumVol = 0.8, arpOctave = 4, bassStyle = 'octave' }) {
  const split = (bar) => chords[bar].split('/');
  const arpNotes = [];
  const bassNotes = [];
  chords.forEach((_, bar) => {
    const cs = split(bar);
    for (let i = 0; i < 16; i++) {
      const t = TONES[cs[Math.floor((i * cs.length) / 16)]];
      const seq = [t[0] + arpOctave, t[1] + arpOctave, t[2] + arpOctave, t[0] + (arpOctave + 1)];
      arpNotes.push([seq[i % 4], 1]);
    }
    for (let i = 0; i < 8; i++) {
      const t = TONES[cs[Math.floor((i * cs.length) / 8)]];
      const note = bassStyle === 'walk' ? [t[0] + '2', t[2] + '2', t[0] + '3', t[2] + '2'][i % 4] : t[0] + (i % 2 ? '3' : '2');
      bassNotes.push([note, 2]);
    }
  });
  return {
    name,
    bpm,
    bars: chords.length,
    tracks: [
      { wave: lead, vol: leadVol, gate: 0.85, notes: melody.flat().map(([x, l]) => [x, l * 2]) },
      { wave: arp, vol: arpVol, gate: 0.7, notes: arpNotes },
      { wave: 'triangle', vol: bassVol, gate: 0.8, notes: bassNotes },
      { drums, vol: drumVol },
    ],
  };
}
