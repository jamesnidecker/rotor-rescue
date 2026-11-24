// The ONLY colours allowed in the game. Swap values here to re-skin everything.
// Style guide §2. Do not use any colour that is not in this file.
export const HEX = {
  black: '#000000',
  midnight: '#1D1A3A',
  deepPurple: '#3B2C6B',
  royalBlue: '#2F5DD3',
  skyBlue: '#5FB4FF',
  cyan: '#3FE0E0',
  white: '#FFFFFF',
  lightGrey: '#B8B8C8',
  midGrey: '#6E6E82',
  darkGrey: '#3A3A48',
  red: '#E8303A',
  orange: '#FF8A1F',
  yellow: '#FFD93B',
  green: '#3CCB55',
  hotPink: '#FF4FA3',
  brown: '#8A4B2A',
};

// Same colours as numbers (0xRRGGBB) for Phaser.
export const PAL = Object.fromEntries(
  Object.entries(HEX).map(([k, v]) => [k, parseInt(v.slice(1), 16)])
);

// Text colour roles (style guide §3).
export const TEXT = {
  label: PAL.cyan, // 1UP, HI-SCORE, LEVEL
  number: PAL.yellow, // scores, timers
  message: PAL.white, // messages and body text
  warning: PAL.red, // GAME OVER, last life
};
