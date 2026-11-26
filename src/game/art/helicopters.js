// Three helicopter designs to choose from. Each is 16x10 pixels (the same size
// as the grey box, so the gameplay doesn't change) with two rotor frames.
// Letters are palette colours (see src/kit/pixels.js); '.' = transparent.

const rotorLong = 'DDDDDDDDDDDDDDD.';
const rotorShort = '....DDDDDDDD....';

function withRotor(body) {
  return [
    [rotorLong, ...body],
    [rotorShort, ...body],
  ];
}

export const HELICOPTERS = {
  A: {
    name: 'Classic rescue',
    note: 'Red with a white stripe, like a real rescue chopper',
    frames: withRotor([
      '.......DD.......',
      '......RRRRRR....',
      'R....RRRRRRRCC..',
      'RR..RRRRRRRRCCC.',
      'RRRRRRRRRRRRRRRR',
      '....WWWWWWWWWWW.',
      '.....RRRRRRRRR..',
      '......D....D....',
      '....DDDDDDDDDD..',
    ]),
  },
  B: {
    name: 'Bubble',
    note: 'Round and friendly, with a big glass bubble',
    frames: withRotor([
      '........DD......',
      '.......CCCCC....',
      'R.....CCCCWCC...',
      'RR...RCCCCCWCC..',
      'RRRRRRRCCCCCCC..',
      '....RRRRRRCCCC..',
      '.....RRRRRRRR...',
      '......D....D....',
      '....DDDDDDDDDD..',
    ]),
  },
  C: {
    name: 'Coast guard',
    note: 'White and orange, long and sleek',
    frames: withRotor([
      '........DD......',
      '.......WWWWWW...',
      'O.....WWWWWWWCC.',
      'OO...WWWWWWWWCCC',
      'OOWWWWWWWWWWWWWW',
      '......OOOOOOOOOO',
      '.......WWWWWWWW.',
      '.........D...D..',
      '.......DDDDDDDDD',
    ]),
  },
};
