# Rotor Rescue — 80s Arcade Style Guide

**Version:** 0.2 · 2026-11-23
**Decided (Jozo):** everything — fonts, colours, typography, screens, effects — looks and feels like an 80s arcade game.
**Status of the details below:** proposals, to be judged by Jozo and the kids in the playable link, unless marked DECIDED.

Applies to the game, the iPad cabinet panels, the App Store screenshots and the TikTok teasers.

---

## 1. Principles
- **Limited palette.** 80s machines could only show a handful of colours. We use one fixed 16-colour palette for everything (see §2). No colours outside it
- **Hard pixels.** No smoothing, no anti-aliasing, no blur, no soft shadows, no gradients
- **Gradients become dithering.** A sunset sky is bands of colour and checkerboard dither patterns, not a smooth blend
- **Day and night via palette swaps.** The same building art gets different colours per level (morning, sunset, night). That's how 80s games did it, and it saves drawing work
- **Black is the stage.** Menus, high score tables and the title screen sit on black, like an arcade screen

## 2. Palette — 16 colours (proposal)

| # | Name | Hex | Used for |
|---|---|---|---|
| 1 | Black | `#000000` | Menu backgrounds, outlines |
| 2 | Midnight | `#1D1A3A` | Night sky, cabinet panels |
| 3 | Deep purple | `#3B2C6B` | Cabinet, night buildings |
| 4 | Royal blue | `#2F5DD3` | Water, evening sky |
| 5 | Sky blue | `#5FB4FF` | Day sky |
| 6 | Cyan | `#3FE0E0` | Labels, neon, highlights |
| 7 | White | `#FFFFFF` | Main text, windows |
| 8 | Light grey | `#B8B8C8` | Buildings (lit side) |
| 9 | Mid grey | `#6E6E82` | Buildings |
| 10 | Dark grey | `#3A3A48` | Buildings (shadow side) |
| 11 | Red | `#E8303A` | Helicopter, lives, crash |
| 12 | Orange | `#FF8A1F` | Sunset, fire, helipad lights |
| 13 | Yellow | `#FFD93B` | Score, "+100", highlights |
| 14 | Green | `#3CCB55` | Trees, "GO!" |
| 15 | Hot pink | `#FF4FA3` | Neon city, cabinet stripes |
| 16 | Brown | `#8A4B2A` | Crates, harbour, canyon |

## 3. Typography
- **Font:** **Press Start 2P** — a free pixel font made in the style of 80s arcade lettering (SIL Open Font License, free for commercial use). Bundled inside the game, not loaded from the internet
- **One font for everything** in the game: HUD, menus, high scores. The logo is the exception (§8)
- **CAPITALS ONLY** for all in-game text
- **Pixel-perfect sizes:** text only in whole multiples of the font's 8-pixel grid, never scaled in between
- **Colour coding, like the classics:**
  - Labels (HI-SCORE, 1UP, LEVEL): cyan
  - Numbers (scores, timers): yellow
  - Messages and body text: white
  - Warnings (GAME OVER, last life): red
- **Scores with leading zeros:** `012400`, always 6 digits
- **Blinking text** for calls to action ("TAP TO PLAY"), about twice per second
- Optional 1-pixel black drop shadow under text over busy backgrounds

## 4. Arcade words and screens
Use classic arcade language:
- Title screen: **TAP TO PLAY** (the phone version of "insert coin" / "push start")
- Level start: **READY!** → **3 2 1** → **GO!**
- HUD: **1UP**, **HI-SCORE**, **LEVEL 03**
- Rewards: **+100**, **BONUS**, **PERFECT RESCUE!** (all saved), **1UP!** (extra life)
- End: **GAME OVER**, **LOOP 2**
- High score entry: **ENTER YOUR NAME**, followed by the table:

```
RANK  SCORE   NAME
1ST   048900  JOZO
2ND   031200  KIDDO
3RD   025500  ACE
```
Each row in a different palette colour, like the classics.

## 5. UI elements
- **Square corners** everywhere. No rounded buttons
- Buttons and frames: **1–2 pixel borders** with a simple pixel bevel (light edge top-left, dark edge bottom-right)
- Pause, info and sound icons drawn as small pixel icons, not system icons
- Screen transitions: **wipe** or **pixel dissolve**, never a smooth fade
- Crash: white **screen flash** + shake + pixel explosion
- Optional **CRT scanlines**: faint horizontal lines over the whole screen, like an old arcade monitor. Proposal: on in the attract mode and the title screen, test with the kids whether they like it in-game too

## 6. Sound fits the look
All music and effects are 8-bit chiptune (see the design doc §9). No real-world recorded sounds.

## 7. Outside the game
- **App icon:** the helicopter in pixel art on a black or midnight background, with palette colours only. The full logo is too wide to read at icon size
- **App Store screenshots and TikTok teasers:** real gameplay, with the Press Start 2P font for any captions, same palette
- **iPad cabinet panels:** same palette, sunset stripes in orange / yellow / hot pink

## 8. Logo — DECIDED direction: chunky 3D letters (Jozo)
- **Direction 1 chosen** from three sketches (chunky 3D, sunset stripes, rotor in the O)
- Solid, heavy 80s arcade letters with a thick black outline and a "depth" edge underneath that gives a 3D block effect, in the spirit of classic arcade marquees
- Sketch colours: yellow letters, red depth edge, deep purple shadow. Final colours from the palette, to be judged
- **Own hand-drawn pixel letters**, not typed in Press Start 2P, so the logo is recognisable as a logo
- Two lines: **ROTOR** / **RESCUE**
- Small touches from the other directions are optional, to be judged when the logo exists (e.g. a spinning rotor in the O for the title animation)
- **Made in milestone 2 (vertical slice)**, by Claude Code, together with the title screen, iPad cabinet and app icon
- **Versions needed:**
  - Title screen, animated: letters drop in one by one, a shine sweeps across
  - Vertical, for the iPad cabinet side panel
  - Large and crisp, for App Store screenshots, TikTok and later merch
- Process: Claude Code makes the logo → Jozo and the kids give short feedback ("thicker", "more red") → final versions

## Changelog
| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-23 | First style guide after Jozo decided everything should look and feel 80s arcade. Palette, font and screen proposals by Claude. |
| 0.2 | 2026-11-23 | Logo direction decided: chunky 3D letters (Jozo picked direction 1 of 3 sketches). Logo is made in milestone 2 with own pixel letters, plus animated, vertical and large versions. |
