# GAIA JET DUO

2.5D arcade jet-ski racing prototype — v16 main hub, career progression, 4-/8-team schedules, seven AI identities and bubble-gun racing.

- `index.html` — browser playable source (load with the `assets/` directory).
- `assets/` — optimized game textures, the user's original front-facing protagonist duo (`main-duo-front.webp`), seven teams × three poses and three water/scenery variants.
- `assets-source/teams/` — original, unmodified PNG sheets for all seven rival teams (21 images).
- `assets-clean/teams/` — properly segmented, transparent, padded PNG sheets (21 images, each pose in a clean cell).
- `assets-source/` — original unoptimized water and buoy source images.
- `rebuild-team-sheets.py` — reproducible alpha-component extraction and per-frame clipping validation.
- `bundle.mjs` — builds a single offline HTML file with embedded assets.
- `smoke-preview.cjs` — preview, physics and combat smoke tests.
- `HANDOFF.md` — verified status, decisions, open issues and tests for the next session.

Run `node bundle.mjs` to create `../GAIA-JET-DUO-v16.0-MAIN-SYSTEM.html` as a standalone offline game file. Run `node smoke-preview.cjs --physics-tests` to verify gameplay; run with `../GAIA-JET-DUO-v16.0-MAIN-SYSTEM.html` to test the offline output. Previous v14/v15 builds remain as separate rollback builds. v15.3 raised world-motion speed to **8.2×** while retaining a roughly 90-second lap. v16 keeps its racing core and adds the main system.

**v16 main system:** landscape lobby with the existing river skyline, original purple/pink protagonist front art bobbing on the water, and four 2×2 menu buttons (락커룸 / 경기 일정 / 훈련 / 기록실). The five stored stats are 체력 (hit resistance), 색기 (booster meter gain), 음란 (watergun rate/pressure), 개방 (acceleration/max speed), and 복종 (steering/grip). Practice races give XP even on a loss; level-ups grant two manually assigned stat points. There is no shop, currency, or compulsory mini-game. 4-team races use the player + a named rival + allied/enemy dummy; the championship uses all 8 teams. Race results, levels, stats and records persist in browser local storage. The two planned optional GAIA LIFE mini-games are **listed but not ported yet**, pending their source/asset integration. Booster now gives a strong instant surge and **3.2 seconds of sustained extra speed**. On-device visual/FPS balance still needs user testing.

**Sprite cutout repair:** the original 3-pose image sheets were *not* evenly spaced; naive `width/3` cropping cut whole characters and jetski hulls. Use `python rebuild-team-sheets.py` to detect the three largest intact alpha components, place each on its own generously padded cell, strip detached speck components, export cleaned transparent PNGs and correctly aligned compressed game WebPs, and assert alpha-free frame borders. Do not split the original source sheets into three equal widths again.

The closed oval course has two straightaways and two curves, an accurate oval minimap, laps, and sparse waves. Heavy and light crafts have distinct acceleration, handling, grip, and top speed. Rival AI steers, jumps waves, uses boost and fires bubble pellets. A **single FIRE button auto-selects the nearest eligible hostile rival** and launches discrete round projectiles forward or backward. Water hits slow speed, with a major slowdown on the tenth consecutive hit. Neon hearts, hitting rivals, jumping and steering charge the player's boost. The racing HUD avoids descriptive text and on-screen rival name tags. The team front portraits are reused in menus; no new team art was fabricated.

The nine named rival special skills from the previous conversation are **not implemented or assigned to teams** here: their exact names/effects and confirmed mapping could not be recovered. See `HANDOFF.md` before making any assignments.

No GitHub Pages deployment has been configured.
