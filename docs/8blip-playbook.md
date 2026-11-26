# 8Blip Playbook — how we make every game

**Version:** 1.2 · 2026-11-26
**Applies to:** every 8Blip Arcade game (Rotor Rescue first, then the shoot 'em up and the rescue run)
**Based on:** standard indie game development practice: greybox prototyping, vertical slice, Nintendo's 4-step level design, "juice" for game feel, structured playtesting, scope freeze, soft launch, post-launch content and a postmortem.

---

## The route, step by step

| # | Phase | What happens | Gate to move on |
|---|---|---|---|
| 1 | **Design** | Interview until ~95% clear, design doc with decided vs open, style guide | Jozo says "build it" |
| 2 | **Greybox** | Playable version with grey blocks, one level, tuning panel | The controls feel good on the phone |
| 3 | **Vertical slice** | Level 1 made final: pixel art, sound, music, menus, iPad frame | Jozo and the kids approve level 1 as "this is the game" |
| 4 | **Scope freeze** | Feature list locked. New ideas go to the "Later" list, not into this release | — |
| 5 | **Production** | Build the remaining levels, each with the 4-step method | All levels playable, tuned against the difficulty targets |
| 6 | **Juice round** | Separate pass for effects: particles, shake, flashes, sounds, small animations. In moderation | The kids notice it feels better, not busier |
| 7 | **Polish and launch prep** | Leaderboard, attract mode, info screen, bugs, App Store listing, privacy policy | Launch checklist complete |
| 8 | **Soft launch** | TestFlight with a small group of friends and their kids | No crashes, no "how does this work?" |
| 9 | **Launch** | App Store release, TikTok | Live |
| 10 | **Look back** | Short postmortem: what went well, what didn't, what to change for the next game | Lessons added to this playbook |
| 11 | **Updates** | New levels and seasons (live ops) | Per update, phases 5–9 again |
| 12 | **Fill the 8Blip Kit** | Move the reusable parts of the game into the shared kit (see below) | The next game can start from the kit |

**Why the vertical slice matters:** if the look, sound or feel changes after level 1, only one level has to be redone instead of twelve.

## The 8Blip Kit — build once, use again
A shared box of building blocks on top of Phaser, reused by every 8Blip game. **Decided (Jozo, 2026-11-24).** We keep Phaser as the engine; we don't write our own engine.

**What goes in the kit (from Rotor Rescue):**
- The 16-colour palette and the Press Start 2P font setup
- HUD: score, lives, level, leading-zero numbers, blinking text
- Pause menu with music and sound switches, auto-pause
- The iPad arcade cabinet side panels and the "turn your device" screen
- Title screen pattern: logo, attract mode, info button
- READY! / 3 2 1 / GO!, GAME OVER and high score entry screens
- Worldwide high score list and seasons
- Tuning panel (`?tune=1`) and playtest stats screen (`?stats=1`)
- The 8-bit synthesiser for music and sound effects
- Screen flash, shake and pixel transitions

**How:**
- While building Rotor Rescue: keep these parts separate from the game's own code, so they're easy to lift out later
- After the Rotor Rescue launch (phase 12): move them into the kit
- Every next game starts from the kit and only builds what's new (the ship, the enemies, the levels)
- An improvement to the kit, such as a better pause menu, can be brought into every game

**Why:** game #2 gets finished much faster than game #1, and all 8Blip games feel like they come from the same studio.

## How we work day to day — "Claude makes, Jozo picks" (DECIDED, Jozo 2026-11-26)
Jozo: "I love this way of working and how I can pick and choose." Keep this for every game.

**The loop**
1. Claude builds something playable or listenable and puts it online (every push to `main` is live in about a minute)
2. Jozo (and the kids) try it on the phone
3. Jozo copies the result with a button and pastes it back to Claude in the chat
4. Claude turns it into the new default, and the next step starts

**The test links (every game has them, from the 8Blip Kit)**
| Link | What it's for | What Jozo sends back |
|---|---|---|
| Play link | Just play | Plain words: "drops too fast", "kids loved it" |
| `?tune=1` | Sliders for the feel (gravity, lift, speed, hitbox…), change while playing, Restart button, build number at the top | **Copy values** |
| `?stats=1` | Playtest stats stored on the device: attempts, crashes, where crashes happen | **Copy stats** |
| `preview.html` | The picks page: 2–3 versions of every art piece, sound and music track, side by side, with a live scene | **Copy my picks** + notes |

**Picking rules**
- Always **2–3 versions** to choose from, never just one
- Every version is **kept** (on the picks page and in the project history), so we can always go back. Drafts are numbered ("Draft 3 — Sunny")
- If nothing fits ("crash: none, more explosive"), Claude makes new versions; the old ones stay
- The kids pick most of the look and sound; Jozo decides the feel and the difficulty
- Picks are saved on the phone, so choosing can happen over several sittings

**Things learned (Rotor Rescue, milestones 1–2)**
- Defaults vs phone settings: sliders moved on a phone are saved on that phone and win over new defaults. After Claude changes defaults, tap **Reset to defaults** in `?tune=1`
- A new version can take a few minutes to show up on a phone (browser cache). Close the tab and reopen; the build number in `?tune=1` shows which version is running
- On iPhone, sound needs the silent switch off and starts only after the first tap (browser rule)
- Claude tests every change in an emulated iPhone before pushing, including several rounds in a row (land twice, restart, game over twice), pause in every screen, and the dev panels open. Bugs found by Jozo become part of that routine
- Plain words work best for feedback: "more of an exploding sound, bigger impact" is perfect

## Level design: Nintendo's 4 steps
Every level, or every new obstacle, follows four steps:
1. **Introduction:** the new thing appears in a safe spot. Hard to fail
2. **Development:** the same thing again, now with real risk
3. **Twist:** a surprise variation (two at once, combined with a pickup, moving faster)
4. **Conclusion:** a short final test, then the finish

Example (crane hooks, Rotor Rescue level 5): one slow hook in open space → several hooks in a row → a hook swinging right next to a rooftop pickup → a tight final stretch before the helipad.

## Playtesting: the fixed routine
- **Watch, don't help.** No explaining, no tips, no "tap now!". Helping hides the problems we want to find
- **Note** where they get stuck, where they crash, where they laugh and where they get bored. The `?stats=1` screen records crashes per level
- **Afterwards, three questions:**
  1. What was fun?
  2. What was annoying or unfair?
  3. Do you want to play again?
- Also watch whether they **tap "play again" by themselves**. That's the strongest signal
- Pass the notes back to Claude in plain words: "everyone crashed at the third tall building"

## Scope freeze and the "Later" list
- After the vertical slice, the feature list for the release is **locked**
- Every new idea goes on the **Later** list with one line on what it is. Good ideas aren't lost, they wait for an update or the next game
- Only exception: something that fixes a real problem found in playtesting

## Juice — in moderation
- Juice makes actions feel significant: screen shake, flashes, particles, little bounces, satisfying sounds
- One separate round after production, so it's done consistently across the game
- Test it: more is not always better. If the kids find it busy or confusing, tone it down

## Soft launch
- TestFlight build to a small group (friends, their kids, maybe colleagues)
- Look for crashes, confusing moments and difficulty spikes
- Fix, then submit to the App Store

## Launch checklist (per game)
- App name and subtitle, description, keywords
- iPhone and iPad screenshots, app icon in pixel art
- Age rating questionnaire
- Privacy policy page and support page
- App privacy label (what data is collected, e.g. nickname + score for the leaderboard)
- TestFlight soft launch done
- TikTok teaser ready (attract-mode recording works well)

## Postmortem (after every launch)
Half an hour, three questions:
1. What went well and should stay?
2. What cost too much time or went wrong?
3. What do we change in this playbook for the next game?

---

## Rotor Rescue mapped to this playbook

| Playbook phase | Rotor Rescue milestone |
|---|---|
| 1 Design | Done: design doc, style guide |
| 2 Greybox | **Milestone 1** — build brief ready, starts 2026-11-24 |
| 3 Vertical slice | Milestone 2: level 1 final (pixel art, iPad cabinet), plus sound effects and title theme |
| 4 Scope freeze | After milestone 2 approval |
| 5 Production | Levels 2–12, 4-step method, tuned with the stats screen |
| 6 Juice round | After all levels are playable |
| 7 Polish and launch prep | Leaderboard, attract mode, info screen, App Store listing |
| 8 Soft launch | TestFlight with friends |
| 9 Launch | App Store + TikTok |
| 10 Look back | Postmortem, lessons into this playbook |
| 11 Updates | Spring, summer, autumn 2027: 10 levels each, new season |
| 12 8Blip Kit | After launch: reusable parts move into the kit, ready for the shoot 'em up |

This table replaces the "Build order" list in the design doc (§13) where they differ.

## Changelog
| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-11-23 | First playbook, after Jozo asked whether our process matches known game development practice. Added vertical slice gate, 4-step level design, playtest routine, scope freeze, juice round, soft launch, launch checklist and postmortem. |
| 1.1 | 2026-11-24 | Added the 8Blip Kit (phase 12): shared building blocks on top of Phaser, reused by every game. Decided to stay with Phaser rather than write an own engine. |
| 1.2 | 2026-11-26 | Added "How we work day to day": the Claude-makes / Jozo-picks loop, the four test links (play, `?tune=1`, `?stats=1`, `preview.html`) with their copy buttons, picking rules, and lessons from Rotor Rescue milestones 1–2. |
