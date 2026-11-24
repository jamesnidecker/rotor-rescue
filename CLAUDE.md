# Rotor Rescue — working rules

- Retro 8-bit pixel-art arcade game for kids around 10 and older players. Phaser 3 + Vite. Portrait, touch first, one thumb
- Design, style guide and playbook live in `docs/`; read them before starting new work
- Everything looks and sounds 80s arcade: Press Start 2P only, capitals, fixed 16-colour palette (`src/kit/palette.js`), hard pixels, no gradients or smoothing, chiptune sound
- Same play area on every device; wider screens get side panels, never a bigger view
- No ads, no tracking, no external links, no network calls (except a future leaderboard, decided later)
- Levels are data files (`src/game/levels/`); keep game logic separate from level content
- Difficulty target: challenging but doable. Every crash should feel like the player's own fault, never unfair
- Small playable steps; after every change the game must still load and run without console errors
- Fun, feel, look and difficulty are judged by Jozo and his kids: ask, don't assume
- Plain language when explaining things to Jozo; he doesn't code

## Code layout

- `src/kit/` = **8Blip Kit**, shared with future 8Blip games (palette, font, text, HUD, pause menu, page setup and side strips, storage, tuning, dev panels). The kit must never import from `src/game/` or mention Rotor Rescue
- `src/game/` = Rotor Rescue only (config, physics, world/collisions, scenes, icons)
- `npm run check` must pass (every level finishable with all people saved); it runs in the deploy workflow
- Deploy: push to `main` → GitHub Actions → GitHub Pages
