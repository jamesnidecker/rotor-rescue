// Small pixel icons (9x9) for sound switches. 'W' = icon colour.
export const ICON_MUSIC = [
  '....WWW..',
  '....W.WW.',
  '....W..W.',
  '....W....',
  '....W....',
  '.WWWW....',
  'WWWWW....',
  'WWWW.....',
  '.WW......',
];

export const ICON_SPEAKER = [
  '...W.....',
  '..WW..W..',
  'WWWW...W.',
  'WWWW.W.W.',
  'WWWW.W.W.',
  'WWWW...W.',
  '..WW..W..',
  '...W.....',
  '.........',
];

// "Off" version: grey icon with a red stripe across.
export function offVersion(rows) {
  return rows.map((r, y) => [...r].map((ch, x) => (x === y ? 'R' : ch === 'W' ? 'M' : ch)).join(''));
}
