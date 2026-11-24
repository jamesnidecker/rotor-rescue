// LEVEL 1 — city, morning. Tutorial level: buildings and gaps only.
// Pure data. Units: game pixels. x = distance from the level start,
// w = width, h = height above the ground. The screen is 180 px wide and the
// helicopter flies at the "forward speed" (default 60 px/s), so ~2700 px ≈ 45 s.
//
// Built with Nintendo's 4 steps (docs/8blip-playbook.md):
//   1 intro: low buildings, wide gaps, easy rooftop pickups
//   2 development: taller buildings, a pickup right after a tall one
//   3 twist: a low rooftop down in a deep gap between two tall buildings
//   4 conclusion: a short final stretch, then the helipad
export default {
  id: 1,
  name: 'CITY MORNING',
  start: { x: 40, y: 150 },
  length: 2800,

  buildings: [
    // 1 — introduction
    { x: 280, w: 60, h: 60 },
    { x: 400, w: 72, h: 90 },
    { x: 540, w: 50, h: 120 },
    { x: 660, w: 80, h: 80 },
    // 2 — development
    { x: 820, w: 40, h: 150 },
    { x: 910, w: 64, h: 70 },
    { x: 1060, w: 60, h: 130 },
    { x: 1180, w: 100, h: 50 },
    { x: 1340, w: 50, h: 160 },
    { x: 1460, w: 50, h: 110 },
    { x: 1570, w: 60, h: 140 },
    // 3 — twist: dip down into the gap for the last person
    { x: 1720, w: 40, h: 170 },
    { x: 1820, w: 56, h: 60 },
    { x: 1980, w: 60, h: 150 },
    // 4 — conclusion
    { x: 2120, w: 60, h: 100 },
    { x: 2250, w: 50, h: 130 },
    { x: 2380, w: 70, h: 90 },
  ],

  // One person per entry, standing on the roof under x.
  people: [{ x: 436 }, { x: 700 }, { x: 950 }, { x: 1250 }, { x: 1846 }],

  // The level ends when the helicopter reaches this platform.
  helipad: { x: 2560, w: 90, h: 36 },
};
