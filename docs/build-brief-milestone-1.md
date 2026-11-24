# Rotor Rescue — Build Brief, Milestone 1: grey-box playable

**Version:** 1.3 · 2026-11-24 (repo exists and is public; docs live in this repo's `docs/` folder)

You are building **Rotor Rescue**, a retro 8-bit arcade game by 8Blip Arcade (a hobby studio). Jozo, the owner, does not write code. You write all of it. Jozo and his kids (around 10) test on their phones and judge how it feels.

For full context, read `docs/game1-rescue-heli-design.md`, `docs/style-guide-80s-arcade.md` and `docs/8blip-playbook.md` in this repo. For this milestone, **this brief wins** where they differ.

## Goal of this milestone
A playable **grey-box** version of level 1 on a phone, through a link, so Jozo can judge one thing: **do the controls feel good?** No art, no sound, no menus beyond the basics.

Overall difficulty target for the game: **challenging but doable.** Level 1 is the easy one: almost every new player should finish it in 1–2 tries.

## Tech — decided
- **Phaser 3** (latest stable), JavaScript, bundled with **Vite**
- Repo: `jamesnidecker/rotor-rescue` (already exists, **public**, so GitHub Pages works on the free GitHub plan). Work on `main`
- Deploy: **GitHub Pages via GitHub Actions**, auto-deploy on every push to `main`. The public game link must work in iPhone Safari. If enabling Pages needs a click in the repo settings (Settings → Pages → Source: GitHub Actions), tell Jozo exactly what to click
- Later the same build gets wrapped for iOS with **Capacitor**, so: no server, no network calls, everything static and relative paths (set Vite `base` correctly for the Pages URL)
- Pixel-art setup: low base resolution (**180×320, portrait**), `pixelArt: true`, scaled up with `Scale.FIT`, centred, no blurry scaling
- Levels are **data, not code**: one file per level (JSON or JS object) describing buildings, gaps, pickups and the helipad, so new levels can be added later without touching game logic

## Style — decided: 80s arcade, even in the grey box
- **Font:** Press Start 2P (SIL Open Font License), **bundled in the repo**, not loaded from the internet. Used for all text. **Capitals only.** Only whole multiples of its 8-pixel size, never scaled in between
- **Palette:** use only these 16 colours, everywhere (put them in one palette file so they can be swapped later):
  `#000000` black · `#1D1A3A` midnight · `#3B2C6B` deep purple · `#2F5DD3` royal blue · `#5FB4FF` sky blue · `#3FE0E0` cyan · `#FFFFFF` white · `#B8B8C8` light grey · `#6E6E82` mid grey · `#3A3A48` dark grey · `#E8303A` red · `#FF8A1F` orange · `#FFD93B` yellow · `#3CCB55` green · `#FF4FA3` hot pink · `#8A4B2A` brown
- Grey boxes: buildings in the greys, sky in sky blue, helicopter in red, people in yellow, helipad in orange
- **Text colours:** labels (1UP, HI-SCORE, LEVEL) cyan · numbers yellow · messages white · GAME OVER red
- **Scores with leading zeros**, 6 digits: `012400`
- **Blinking** "TAP TO PLAY", about twice per second
- Arcade words: **READY!** → **3 2 1** → **GO!**, **+100**, **PERFECT RESCUE!** (all saved), **GAME OVER**
- **Square corners**, pixel borders, no gradients, no smoothing, no soft shadows. Crash = white screen flash + shake

## Screen — decided
- **Portrait only**, one thumb
- **The play area is the same size on every device** (fair for a future worldwide leaderboard). On wider screens such as iPads and older iPhones, the extra space left and right stays outside the play area
- For this milestone, fill those side strips with midnight (`#1D1A3A`). In milestone 2 they become arcade cabinet panels (score, lives, logo), so keep the layout ready for that
- If a device is held in landscape, show a simple "TURN YOUR DEVICE" screen

## Controls — decided, build exactly this
- **Tap** = helicopter goes up a little
- **Hold** = hover / fly level
- **Let go** = drops (gravity)
- The helicopter **always moves forward** at a fixed speed; the player only controls height
- **No input delay.** On press, give an upward impulse immediately. If the finger is still down after ~150 ms, switch to hover (vertical speed eased to zero). Release = gravity
- Desktop testing: mouse button and **space bar** act as the finger
- Prevent iOS Safari zoom, scroll, text selection and the long-press menu on the game canvas

## Level 1 content (grey boxes)
- Length: about **40–50 seconds** of flying at default speed
- Rectangles for buildings of different heights, with gaps the helicopter must fly over and between
- The **top of the screen counts as a ceiling** (touching it = crash), the ground too
- **5 people** as small boxes on rooftops. **Pickup = fly low over them**: if the helicopter passes within a set reach above the roof, they're picked up (they vanish, "+100" pops up)
- A **helipad** at the end (a flat platform). Reaching it ends the level

## Rules — decided
- Touching anything = crash = lose a life
- **Forgiving hitbox:** the crash box is smaller than the helicopter shape (tunable, start at ~75%)
- **3 lives.** Crash → flash/shake → "READY! 3 2 1 GO!" → restart level 1 from the start
- 0 lives → **GAME OVER** screen with the score → tap → back to level 1 with 3 lives and score 0
- Scoring: **100** per person, **500** for reaching the helipad, **all 5 saved → rescue points doubled** ("PERFECT RESCUE!")
- Reaching the helipad: helicopter **auto-lands** (simple descent), people pop out next to it, score tally for ~3 seconds (**tap to skip**), then level 1 restarts (only one level exists for now)
- Save the **best score** on the device (localStorage) and show it as HI-SCORE

## Screens and HUD
- Minimal title screen on black: "ROTOR RESCUE", HI-SCORE, blinking "TAP TO PLAY"
- HUD: 1UP score, lives, LEVEL 01, rescued count (e.g. 3/5)
- **Pause button** in a top corner (pixel icon): RESUME, RESTART, and MUSIC / SFX switches (they don't do anything yet, but put them there). Game auto-pauses when the browser tab/app goes to the background
- Large touch targets, almost no text (kids around 10)

## Tuning panel — important
Jozo judges feel on his phone and needs to adjust it without code. Add a hidden **tuning panel**, opened by adding `?tune=1` to the URL. Sliders for:
- gravity
- tap impulse (how much one tap lifts)
- hover strength (how quickly it levels out when holding)
- forward speed
- hitbox size (% of the helicopter)
- pickup reach (how low you must fly)

Show the numbers next to the sliders, save them in localStorage, and add a **"Copy values"** button that copies all values as text, so Jozo can paste them back to you. (The tuning and stats panels are developer tools and don't need the arcade style.)

## Playtest stats — for tuning difficulty
Add a hidden **stats screen**, opened with `?stats=1`. Stored **only on the device** (localStorage), never sent anywhere, and not part of the App Store version later. Show:
- attempts per level and how many ended in a crash vs. reaching the helipad
- people rescued per attempt
- **where crashes happen**: a simple strip of the level with a dot for each crash position
- a "Copy stats" button (text) and a "Reset stats" button

## Measurable checks before you report back
- Runs at a steady **60 fps** in Safari on a recent iPhone (check frame time in the browser; keep the game light)
- No errors in the browser console
- First load under ~2 seconds on mobile
- Tap → upward movement starts in the same frame
- The link opens and plays in iPhone Safari, portrait, no zoom or scroll
- On an iPad-shaped browser window, the play area keeps its phone size with side strips
- All text is Press Start 2P, crisp, capitals; no colours outside the 16-colour palette

## Out of scope for this milestone
Pixel art sprites, cabinet panel art, CRT scanlines, sound and music, levels 2–12, attract mode, info screen, ghost-hand tutorial, online high scores, Capacitor/iOS wrapping.

## Repo setup
- `README.md` with the play link, the tuning link (`…?tune=1`), the stats link (`…?stats=1`) and how to run locally
- `CLAUDE.md` with these working rules:
  - Retro 8-bit pixel-art arcade game for kids around 10 and older players. Phaser 3 + Vite. Portrait, touch first, one thumb
  - Design, style guide and playbook live in `docs/`; read them before starting new work
  - Everything looks and sounds 80s arcade: Press Start 2P only, capitals, fixed 16-colour palette (palette file), hard pixels, no gradients or smoothing, chiptune sound
  - Same play area on every device; wider screens get side panels, never a bigger view
  - No ads, no tracking, no external links, no network calls (except a future leaderboard, decided later)
  - Levels are data files; keep game logic separate from level content
  - Difficulty target: challenging but doable. Every crash should feel like the player's own fault, never unfair
  - Small playable steps; after every change the game must still load and run without console errors
  - Fun, feel, look and difficulty are judged by Jozo and his kids: ask, don't assume
  - Plain language when explaining things to Jozo; he doesn't code

## When you're done, report back with
1. The play link, the tuning link and the stats link
2. What to test, in 3–5 short bullet points (for example: "Can you get past the tall building after the second gap by holding?")
3. The current default tuning values
4. Anything you had to decide yourself that wasn't in this brief

Then wait for Jozo's verdict on the feel before starting milestone 2 (pixel art for level 1 and the cabinet panels).
