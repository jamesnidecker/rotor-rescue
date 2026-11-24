import { PAL } from '../kit/palette.js';

// Mini helicopter icon for the lives counter (8x5).
export function lifeIcon(scene, x, y) {
  const c = scene.add.container(x, y);
  c.add([
    scene.add.rectangle(1, 0, 7, 1, PAL.red).setOrigin(0),
    scene.add.rectangle(2, 1, 6, 3, PAL.red).setOrigin(0),
    scene.add.rectangle(0, 2, 2, 1, PAL.red).setOrigin(0),
    scene.add.rectangle(6, 2, 2, 1, PAL.white).setOrigin(0),
    scene.add.rectangle(3, 4, 5, 1, PAL.red).setOrigin(0),
  ]);
  return c;
}

// Little person for the "rescued" counter.
export function personIcon(scene, x, y) {
  return scene.add.rectangle(x, y, 4, 7, PAL.yellow).setOrigin(0);
}
