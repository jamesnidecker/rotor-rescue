# Rotor Rescue — Game Design

**Version:** 0.11 · 2026-11-26
**Studio:** 8Blip Arcade
**App Store title:** Rotor Rescue · **Subtitle (proposal):** 8-bit Heli Rescue Arcade
**Replaces:** the dodge game as game #1 (the dodge game moves to "later")
**Build:** all coding happens in Claude Code, starting from `docs/build-brief-milestone-1.md`
**Engine:** Phaser (HTML5 2D game engine)

---

## 1. Core idea
Fly a rescue helicopter through a city full of obstacles. Pick up people and goods from rooftops and platforms along the way, and reach the helipad at the end of every level. Flappy Bird controls, a goal for every level, and a short landing scene as a reward. Very 80s arcade in look and sound.

## 2. Controls and screen — DECIDED
- **Tap** = the helicopter goes up a little
- **Hold** = hover / fly level
- **Let go** = the helicopter drops
- **Limited hover — TO TEST (Jozo's idea, 2026-11-24):** hovering only lasts a limited time, so it can't make the game too easy. Two versions to compare in playtests: (a) **fixed time per hold**: after ~1–1.5 s of holding, the helicopter starts sinking; (b) **hover gauge**: a small bar that drains while hovering and refills when not holding. Both tunable in the tuning panel; 0 = unlimited for comparison
- The helicopter **always moves forward** at a fixed speed. The player only controls height.
- **Pickup** = fly low over people or goods and they grab on. No landing needed.
- **Portrait, one thumb** — DECIDED
- **iPad and wider screens — DECIDED: arcade cabinet frame.** The play area stays exactly the same size as on a phone (fair for the leaderboard). The side strips show arcade cabinet panels in pixel art: score and best score on the left, lives and level on the right, "Rotor Rescue" and "8Blip Arcade" written vertically, 80s sunset stripes at the bottom. Turning an iPad sideways shows a short "turn your device" screen. On iPhones the game fills the screen. App Store listing then also needs iPad screenshots.

## 3. Game loop — DECIDED
1. Title screen with attract mode (the game plays itself), an info button and the sound switches → tap to play
2. Level starts with a "3-2-1" countdown
3. Fly through the level, dodge obstacles, pick up people and goods (optional)
4. Reach the helipad → automatic landing → people and goods get out (3–4 sec, tap to skip)
5. Score tally → next level
6. Crash → lose a life → restart **that** level from the beginning
7. All lives gone → **game over → back to level 1** (true arcade)
8. Game over screen → if the score is good enough: type a nickname → worldwide high score list → play again

## 4. Win / lose — DECIDED
- **Win a level:** reach the helipad. Rescuing people is optional; skipping them is allowed.
- **Lose a life:** touching anything (buildings, tunnel walls, ground, ceiling, moving obstacles) = crash.
- **Forgiving crashes:** the crash area is slightly smaller than the helicopter sprite, so scraping past feels fair.
- **Start:** 3 lives.
- **Extra life:** every X points (proposal: every 10,000, tune in testing).
- **Game over:** 0 lives → score is final → back to level 1.
- Levels should be short (aim: 40–50 seconds each).

## 5. Scoring — DECIDED (numbers are proposals)
- Each person or crate picked up: **100**
- Reaching the helipad: **500** level bonus
- **All saved bonus:** everyone in the level rescued → that level's rescue points are doubled
- Score is **one running total for the whole run** (arcade style); that total goes on the leaderboard
- People and goods are worth the same; the difference is only visual

## 6. Levels and backgrounds — DECIDED: 12 levels at launch, every level looks different

| Level | Background | What's new |
|---|---|---|
| 1 | City, morning | Buildings and gaps only. Tutorial level |
| 2 | City, afternoon | Narrower gaps |
| 3 | City, sunset | First low tunnels and overhangs (static) |
| 4 | City, night with lit windows | Longer tunnels |
| 5 | Harbour, foggy morning | Swinging crane hooks |
| 6 | Harbour, sunset | Crane hooks in tighter spots |
| 7 | Snowy mountain town, day | Birds flying across |
| 8 | Snowy mountain town, snowfall | Birds + narrow passes |
| 9 | Desert canyon, day | Moving platforms in tunnels |
| 10 | Desert canyon, dusk | Moving platforms + narrow tunnels |
| 11 | City in a storm | Everything so far combined |
| 12 | **Neon futuristic city — DECIDED (Jozo)** | Finale: drones and laser fences, narrowest gaps |

Levels 1–11 are a proposal; level 12 as a neon futuristic city is decided.

**Art approach:** 6 base locations (city, harbour, mountains, canyon, storm city, neon city), varied by sky colour, lighting and weather.

## 7. Difficulty

### Target — DECIDED (Jozo): challenging but doable
Hard enough that nobody plays to the end in 10 minutes, doable enough that you want to keep playing.

**Measurable targets (proposal, checked in playtests):**
| Moment | Target |
|---|---|
| Level 1 | Almost every new player finishes it in 1–2 tries |
| First game ever | A new player reaches about level 3–5 |
| First week of playing | Reaching level 8–10 feels within reach |
| Finishing all 12 in one run | Takes most players many attempts (days, not minutes). A real milestone |
| Every crash | Feels like "my fault", never "that was unfair" |
| After game over | The player taps "play again" without being asked |

A perfect run through 12 levels of 40–50 seconds takes about 8–10 minutes of pure flying, so "not finished in 10 minutes" is built in; the difficulty decides how many attempts it takes.

### Difficulty curve — DECIDED: narrower gaps and moving obstacles, as a sawtooth
- **Forward speed stays the same** in the first loop
- **Gaps and tunnels get narrower** level by level
- **New obstacles are introduced gradually** (see §6), first in an easy spot, then combined with others
- **Sawtooth:** the first level of each new location starts slightly easier than the level before it, then ramps up. A breather to learn the new obstacle, then the squeeze
- **Rescues get riskier:** later, people sit in harder spots, so skipping becomes a real choice. Skilled players earn more points; less skilled players can still progress by skipping
- **Tuning tools:** the tuning panel (gravity, lift, hover, speed, hitbox, pickup reach) plus a **playtest stats screen**: per level, how many attempts and where crashes happen. Stored only on the test device, never sent anywhere, hidden behind a test link and not in the App Store version

### After the last level — DECIDED: loop back to level 1, faster
- Proposal: **+15% speed per loop**, capped at **+45%** (loop 4 and beyond stay at max). Tune in testing.
- Each loop gets a small "LOOP 2" banner, like old arcade games

### Randomisation — DECIDED: no fully random levels
- **Loop 1: hand-made and fixed.** Learning the levels is part of the arcade fun
- **Pickup spots vary every run** in all loops: each level has 2–3 possible spots per pickup, one is chosen at random
- **From loop 2: building sections are shuffled** from a pool of hand-made, tested pieces per location, so it's never impossible but can't be memorised

## 8. Other elements
- **Attract mode — DECIDED:** the title screen runs a scripted demo flight of about 15–20 seconds that shows the whole game:
  1. The helicopter takes off and flies forward, tapping up and hovering past buildings
  2. It swoops low over a rooftop and picks up people, with "+100" pop-ups
  3. It dodges one obstacle (e.g. a crane hook) and flies through a short tunnel
  4. It lands on the helipad and the people get out
  5. Then the screen shows the worldwide high score list for a few seconds, and the demo starts again
  - "TAP TO PLAY" blinks over it the whole time; any tap starts the game
  - The demo is **scripted** (a fixed recorded flight), not a computer pilot, so it always looks good and never crashes
  - Demo flights can also be screen-recorded as TikTok teasers
- **Info button — DECIDED:** on the title screen. Opens a short "How to play" screen with 3 small animated panels: tap = up, hold = hover, fly low = rescue. Almost no text
- **Ghost hand — DECIDED:** only on the **very first play** of level 1, and only until the player has done each move once. Replay it any time via the info button
- **HUD:** score, lives, level number, rescued count (e.g. 3/5). On iPad, score and lives move to the cabinet panels
- **Feedback:** "+100" pop-up on a pickup, screen shake and a phone buzz on a crash
- **Sound on/off — DECIDED:** separate switches for music and sound effects. On the title screen and in the pause menu
- **Pause — DECIDED:** small pause button in a corner. The game also pauses automatically when the app goes to the background
- **Respawn:** countdown before the level restarts

## 9. Music and sound effects — OUTLINE
**How it's made:** Claude Code writes the tunes and sound effects in code, played by a small built-in 8-bit synthesiser. **BeepBox** (music) and **jfxr** (effects) stay available as optional tools for hand tweaks.

**Music**
| Track | Length | Mood |
|---|---|---|
| Title theme | 20–30 s loop | Catchy, upbeat. Plays under the attract mode. Doubles as the TikTok jingle |
| In-level loop | 30–60 s loop | Driving, ~150 BPM, not annoying on repeat |
| Level complete | 2–3 s jingle | Short victory fanfare |
| All saved | 2 s jingle | Extra flourish on top of level complete |
| Game over | 2–3 s jingle | Short descending "aww" |
| High score entry | 15–20 s loop | Calm, proud |

**Sound effects**
- Tap / lift: short soft blip
- Pickup: bright "ding"
- Crash: 8-bit explosion
- Extra life: classic "1UP" rising arpeggio
- Countdown: 3 beeps + higher "GO"
- Landing: soft touchdown thump
- Menu button: click
- Rotor hum: **optional**, test whether it adds or annoys

## 10. High score list and seasons — DECIDED, technical setup still open
- Free nickname, max 10 characters, rude-word filter
- Worldwide list, online
- **Seasons:** every content update starts a new season with a fresh leaderboard. The previous season's top 10 stays visible as the Hall of Fame
- **Needs:** a simple online leaderboard service, a privacy policy and an updated App Store privacy label (nickname + score)

## 11. Updates and roadmap — DECIDED: 10 new levels per update, cap 42
Each update: new location(s), one new obstacle type, one new music track, new season.

| Release | Levels | Setting | New element |
|---|---|---|---|
| Launch | 1–12 | City through the day, harbour, mountains, canyon, storm, neon city | (this design) |
| Spring 2027 | 13–22 | Tropical islands and volcano | Lava bursts, erupting finale |
| Summer 2027 | 23–32 | Open sea and oil rig | Crashing waves, lightning |
| Autumn 2027 | 33–42 | **OPEN** — options: jungle temple, arctic research base, space launch base | **OPEN** |

- **Level cap: 42.** After that the game keeps looping faster
- Settings per update are proposals
- How updates work: build in Claude Code, submit via App Store Connect, Apple review (usually a day or two), players get it automatically. Saved data and the online list survive updates

## 12. Monetisation — DECIDED: free for now
- Launch free, no ads, no purchases
- Build it so extra helicopters/planes can be added later as **cosmetic** unlocks
- **Advice:** don't sell extra lives. Combined with "back to level 1" it feels like "pay or start over" to parents

## 13. Production workflow — DECIDED
**Principle:** Claude proposes and makes, Jozo (and the kids) judge. Feedback is short: "helicopter red", "faster", "too busy".

**Engine — DECIDED: Phaser.** Free 2D web game engine. Handles drawing, collisions, input, sound, scenes and crisp pixel-art scaling. Runs in the browser (playable as a link) and wraps into an iPhone app with Capacitor. Unity/Unreal/Godot rejected as too heavy; plain canvas rejected because Claude Code would have to rebuild all the basics.

**Art:** Claude Code draws the pixel art in code. No Blender and no general AI image generators. **Piskel** is optional for hand touch-ups.

**Sound:** Claude Code makes 2–3 versions of each sound effect; Jozo and the kids pick the favourite. Music starts with the title theme; once that's right, the other tracks follow in the same style.

**Testing:**
- **Phone (main):** every build goes online via GitHub Pages as a link. Open in Safari, play with your finger. Tip: Share → "Add to Home Screen" for full screen. Same link works on the kids' iPad and for friends
- **MacBook:** same link in the browser; mouse click or space bar acts as the finger. Judge the feel on the phone
- **Near the end:** the real app version via TestFlight, the last check before the App Store

**Build order:** see `docs/8blip-playbook.md` ("Rotor Rescue mapped to this playbook"), which replaces the earlier list here. Milestone 1 = grey-block version.

## 14. Name — DECIDED: Rotor Rescue
- Covers flying and rescuing, sounds 80s arcade. No App Store game found with this name (checked 2026-11-23)
- "Heli Rescue" goes in the **subtitle** for search, e.g. "8-bit Heli Rescue Arcade"
- Heli Hurdle parked as a possible name for a future pure dodge game

---

## Still open
- Limited hover: fixed time per hold vs hover gauge vs unlimited (§2), decided in the milestone 1 playtest
- Setting for the autumn 2027 update (§11)
- Per-level background and obstacle list for levels 1–11 (proposal in §6)
- Exact point values, extra-life threshold and loop speed (tune in testing)
- Difficulty targets in §7 (proposal; confirm after the first playtests)
- ~~Helicopter look and sprites~~ → DECIDED 2026-11-26: **B "Bubble"** (picked by Jozo's kids on the picks page)
- Leaderboard tech setup (Claude proposes before the polish milestone)

## Changelog
| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-23 | First design after the interview with Jozo. Rescue helicopter replaces the dodge game as game #1. Controls changed from double-tap to hold-to-hover, because double-tap adds a delay to every tap. Online leaderboard with nickname changes the earlier "no data collected" decision. |
| 0.2 | 2026-11-23 | Locked: forgiving crashes, separate music/effects switches, tutorial as playable level with ghost hand (not a video), loop back to level 1 faster after the last level. Added: music and sound effects outline, randomisation proposal, pause and attract-mode proposals, how updates and seasons affect high scores. |
| 0.3 | 2026-11-23 | Locked: pause button, attract mode, info button, ghost hand only on first play, no fully random levels. Backgrounds changed to "every level looks different" at Jozo's request. |
| 0.4 | 2026-11-23 | Attract mode worked out: scripted 15–20 second demo flight followed by the high score list. |
| 0.5 | 2026-11-23 | Added production workflow. BeepBox/jfxr optional, Claude Code generates music and effects itself. |
| 0.6 | 2026-11-23 | Locked: Phaser, 12 levels at launch, seasons per update. Added 2027 roadmap and name candidates. |
| 0.7 | 2026-11-23 | Locked: 10 levels per update, cap 42. Level 12 is a neon futuristic city finale. |
| 0.8 | 2026-11-23 | Name locked: Rotor Rescue. Build brief for milestone 1 written. |
| 0.9 | 2026-11-23 | Locked: portrait, iPad arcade cabinet frame. Added difficulty target with measurable playtest targets, sawtooth curve and a local-only playtest stats screen. Copied into the repo's `docs/` folder on 2026-11-24; build order now lives in the playbook. |
| 0.11 | 2026-11-26 | Milestone 2 picks by Jozo's kids (picks page `preview.html`): helicopter B "Bubble", plain sky, puffy clouds, title theme Draft 3 "Sunny"; sounds: tap Blip, rescue Happy arpeggio, countdown Classic beeps, landing Touchdown, level complete Bouncy, menu Blip. Crash: none of round 1 — "more of an exploding sound, bigger impact" → round 2 (D/E/F) made. |
| 0.10 | 2026-11-24 | Added limited hover as a test item (Jozo's idea): fixed hover time per hold or a hover gauge, both tunable, compared against unlimited hover in the first playtest. Same intent as the original double-tap idea, without the input delay. |
