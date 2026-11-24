# Rotor Rescue

An 8-bit arcade rescue helicopter game by **8Blip Arcade**.
Fly over the city, pick people up from the rooftops and land on the helipad.

## Play

- **Play:** https://jamesnidecker.github.io/rotor-rescue/
- **Tuning panel:** https://jamesnidecker.github.io/rotor-rescue/?tune=1
- **Playtest stats:** https://jamesnidecker.github.io/rotor-rescue/?stats=1

Tap = up a little · hold = hover · let go = drop. On a computer, the mouse
button or the space bar is your finger (Esc or P pauses).

Tip for iPhone: Share → "Add to Home Screen" for full-screen play.

Every push to `main` builds and publishes the game automatically
(GitHub Actions → GitHub Pages).

## Status

Milestone 1: **grey-box** level 1 (boxes instead of art, no sound) to judge the
controls. See `docs/build-brief-milestone-1.md`.

## Run it on your own computer

Needs [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open the address it prints (also works on a phone on the same Wi-Fi).

```bash
npm run build
```

builds the static game into `dist/`.

```bash
npm run check
```

checks that every level can be finished and every person can be saved with the
default tuning.

## How the code is organised

| Folder | What |
|---|---|
| `src/kit/` | **8Blip Kit**: reusable parts for all our games (palette, font, HUD, pause menu, page setup / side strips, tuning and stats panels). Knows nothing about helicopters |
| `src/game/` | Rotor Rescue itself: flight physics, collisions, scenes |
| `src/game/levels/` | One data file per level (buildings, people, helipad) |
| `docs/` | Design, style guide, playbook, build briefs |

## Credits

Font: Press Start 2P by CodeMan38, SIL Open Font License 1.1
(`src/kit/assets/fonts/OFL.txt`).
