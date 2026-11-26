# 8Blip Kit

Reusable parts for every 8Blip Arcade game. **Nothing in this folder may know
about a specific game** (no helicopters, no levels). Game code lives in
`src/game/` and *uses* the kit; the kit never imports from the game.

| File | What it is |
|---|---|
| `palette.js` | The fixed 16-colour palette + text colour roles. The only colours allowed |
| `font.js`, `assets/fonts/` | Bundled Press Start 2P (SIL OFL) turned into a crisp bitmap font |
| `text.js` | Text helper: capitals only, sizes 8/16/24/32, whole pixels; 6-digit scores |
| `pixels.js` | Pixel art from text maps (one letter per palette colour), dithering, seeded random |
| `audio/synth.js` | 8-bit synthesiser: square, pulse, triangle, noise voices; sound effects as data |
| `audio/music.js` | Chiptune music player (tracks of notes + drum patterns, loops) |
| `widgets.js` | Square bevelled button, pixel pause icon |
| `hud.js` | Arcade HUD bar: 1UP + score, LEVEL, lives, a counter, pause button |
| `pauseMenu.js` | Pause overlay: RESUME, RESTART, MUSIC / SFX switches |
| `page.js` | Phone page setup: fixed play area + side strips, no zoom/scroll, TURN YOUR DEVICE, auto-pause signals |
| `storage.js` | Safe localStorage (hi-score, settings), namespaced per game |
| `tuning.js` | Live tuning values from a slider spec (saved on device) |
| `dev/tunePanel.js` | `?tune=1` slider panel with "Copy values" |
| `dev/stats.js`, `dev/statsPanel.js` | `?stats=1` local-only playtest stats with crash strip |
| `kit.css` | Page, side strips, turn screen and dev panel styles |

Later this folder can be moved into its own repo / package ("8Blip Kit").
