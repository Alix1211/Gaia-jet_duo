# GAIA JET DUO — handoff / 작업 기록 (2026-11-07)

## Source and continuity

- Repository: https://github.com/Alix1211/Gaia-jet_duo.git
- Base revision: `8879b182315c168b2eddd1db2413d9484b2d85f6` (v13)
- Working branch: `jet-team-animation-skills`. Keep `main` untouched unless the user requests a merge.
- Two preceding shared chats: `https://chatgpt.com/share/6aeeef60-304c-83ee-85ed-32526c759db1` and `https://chatgpt.com/share/6aeeef0d-0064-83ee-b73f-018ccb803603`.
- Previous assistant's attempted push was not on remote: working branch was identical to main at start of this session. The remote is the source of truth; do not describe previous unpushed work as present.

## Confirmed design rules to preserve

- 2.5D rear-view water-jetski arcade racer, driver (purple hair) and gunner (pink hair).
- **Superseded in v15:** separate front/rear buttons are replaced by **one held FIRE button with automatic nearest-rival aiming**. The gun shoots round, translucent bubble pellets, not a continuous water stream; targets can dodge the projectile.
- Waterguns disable handling, slow down and cause skids, not hull damage.
- Each water hit causes small slowdown; the **tenth consecutive hit causes major slowdown**.
- Colliding with a buoy or rival slows and knocks both craft; strong inertia, wave buoyancy and jump avoidance remain.
- BOOST launches with immediate speed surge then decays; fill from hits, rivals, jumps/control and neon-heart pickups. Hearts give a large fill.
- River = weak waves/medium inertia; artificial stadium = medium waves/medium inertia; sea = irregular strong waves/strong inertia. Terrain-specific tuning now has provisional game values, not final approved numbers.
- Keep the seven existing team visual identities exactly, and do not assign special skills/teams without evidence.
- The GAIA world is bright, kitschy, playful and adult; retain established art rather than imposing unrequested changes.

## This session — implemented

1. Restored seven team ZIP packages from the project's saved original assets; stored **all 21 original PNGs** unchanged in `assets-source/teams/`.
2. Created compressed translucent WebP sprites in `assets/teams/` (~2.7 MB total vs ~43 MB PNG). All 3 frames in `move` and `attack` are connected to each rival. The ROYAL sheet is 1774×887 (3 cells ~591×887) versus other teams' 2172×724 (3 cells of 724×724); the draw logic handles both aspect ratios.
3. Added 7 team racer entries, with their images and names; the front images appear as seven previews on the game's start card.
4. Front/rear watergun sends a real projectile through course-space collision; rivals shoot backwards at the player. Basic hits slow speed/handling, with a stronger brake on the 10th landed hit.
5. Booster meter, collectible neon-line hearts, hit/jump/steering charge; BOOST consumes gauge. Player's existing boost impulse and decay remain.
6. Updated the offline bundler to embed all nested WebP/PNG and start-card images. Tested single-file HTML works in local canvas simulation.
7. Expanded tests in `smoke-preview.cjs` for team count, water-hits, 10th hit, neon hearts, projectile hits, old collisions/boost/inertia/waves/theme switching.
8. Applied distinct wave strength/inertia response per river, sea and artificial dome; sea adds irregular crest offsets. Retained the old default physics for regression comparisons.

## Explicitly not implemented / uncertain

- **The nine rival-specific special skills**: their exact *names*, effects, activation rules and team/character mapping are not verifiably available in the recovered design log. Previous assistant claimed to implement them locally, but those code changes were never pushed. Do **not** fabricate skills or silently map them to the seven teams; recover original list/approval before implementation.
- Nine characters vs seven teams: user-approved association is unconfirmed.
- Exact terrain tuning parameters require on-device feel testing. The approved relative difficulty (river mild, stadium moderate, sea strong) has been preserved.
- The watergun balance values are **provisional test numbers**, not user-approved final balancing. Current source: shot interval `.22s`, combo gap `2.6s`, tenth-hit multiplier `.55`, heart fill `48`, boost cost `55`.
- No Android-device or actual FPS verification has been performed. Canvas headless smoke tests are not a substitute.

## Verification

```bash
node smoke-preview.cjs --physics-tests
node bundle.mjs
node smoke-preview.cjs ../GAIA-JET-DUO-v14-7TEAM.html --physics-tests
```

Both source and bundled offline tests passed for the earlier v14 test. The bundler/tests reject empty team images: one zero-byte ROYAL front WebP was detected during review and rebuilt from the unchanged original PNG. Check any new commit and `git ls-remote` against GitHub after pushing, and record exactly whether the push succeeded.

## Critical art correction (v14.1)

- The user's review correctly identified serious art clipping. The original sheets are **not divided into equal-width cells**. Example: KPOP move pose 1 ends around x=560 rather than x=724, meaning the former fixed-width slice cut through pose 2. Many teams have the same problem.
- `rebuild-team-sheets.py` now extracts the three *actual independent connected RGBA figures* in each source sheet, preserving original pixels in their entirety while removing disconnected background specks. Each figure is centered in a separate generously padded cell, and all borders are validated to have clear transparent margins.
- New transparent PNG master sprites: `assets-clean/teams/` (21). New game WebPs overwrite only the previous broken **derived** files in `assets/teams/` (21). The originals in `assets-source/teams/` remain untouched.
- Visual QA contact sheets: `../GAIA-JET-DUO-v14-CUTOUT-QA-MOVE.png`, `../GAIA-JET-DUO-v14-CUTOUT-QA-ATTACK.png`. Source and packed gameplay preview show intact silhouettes; all 42 animated frame borders pass automatic tests.
- Some **original source art** reaches the original canvas boundary (e.g. ROYAL attack ponytail at image top). No art outside that source exists to extract; any pixel-perfect outpainting at those original edges requires separately approved illustration repair. The current correction eliminates **all newly introduced frame-cutting**, not missing source pixels.
- The historical standalone art-correction deliverable is `../GAIA-JET-DUO-v14.1-CLEAN.html`. The bundler now creates a separate v15 file, leaving v14.1 intact.

## v15 — endless circuit / race foundations (2026-11-07)

**User priorities:** art quality is foremost; avoid sprite cropping and leftover fragments, don't add explanatory gameplay text, and make the race itself compelling before optional shooting/special skills. The user approved implementation of this first phase, and audio files will be provided separately **after** gameplay code testing.

- Source `index.html` now has a genuinely closed 5,000m *oval* course: two physical straights and two half-circle bends. `trackAt(s)` returns continuous geometry and normal, `proj()` uses that world geometry, and the minimap draws the real oval. No finish-state cutoff; laps continue indefinitely; ranking and LAP are terse HUD indications.
- Actual speed progression in meters (`speed/3.6`), turn-induced lateral drift, per-team acceleration/top-speed/mass/handling/grip. Stronger/heavier LEATHER and nimble PINK are intentionally contrasted; these numerical test values are provisional until real-device feedback.
- Fewer waves: crest start 1,050m and spacing 1,600m (roughly 3 per lap). Crossing a wave without a manual jump now causes an actual speed penalty and shake; manual jump clears the penalty. River/sea/dome profiles are retained.
- Rival teams run AI racing lines, lane changes and obstacle avoidance; they anticipate/jump waves, fire auto-targeted bubbles in either direction and spend their own boost meter. Shooting can involve rivals as well as the player. These are generic team behaviors; the previously specified unique special skills **remain unimplemented** pending recovery of their original table.
- Single button `FIRE` (`J` or `K` on keyboard): nearest eligible craft within ~650m, snapshots target's lateral direction, projectile flies forward/back and can miss. 0.22-second fire interval; 10-shot combo slowdown preserved. Round, translucent bubble projectile rendering, circular splash particles and visible impact reactions; no water-beam graphics.
- Removed on-course name tags, collision text toasts, help labels and footer. Minimal `KM/H`, `LAP`, `position / 8`, boost gauge and icon buttons remain. Start card previews the character art with no verbose explanation.
- Character source art/21 cleaned master PNGs/21 optimized team WebPs are **unchanged** from v14.1 and have the same cutout validation. No new art generation, crops or avatar substitutions.
- Offline output is `../GAIA-JET-DUO-v15-LOOP-RACE.html` (10.92MB). Test with:

```bash
node smoke-preview.cjs --physics-tests
node bundle.mjs
node smoke-preview.cjs ../GAIA-JET-DUO-v15-LOOP-RACE.html --physics-tests
```

Source and standalone physics/render tests pass, including oval closure, lap rollover, rival jumping/boosting/shooting, auto-targeting in both directions, burst graphics and terrain-specific waves. No actual Android tablet FPS or hands-on handling test has been performed. The user's next step is gameplay testing, then provide downloaded BGM/SFX for linking, then consider individual team special skills.

## v15.2 — visual racing speed hotfix

**User found the v15 race visibly crawling despite speedometer readings.** Root cause: v14 displaced race coordinates by `(speed/3.6)*5.2` per second, but v15 changed it to `speed/3.6` in an attempt to make the 5,000m oval last longer. This accidentally slowed the scenery and buoy approach by a factor of 5.2. The game's apparent speed is **not** validated by checking the HUD speed value alone.

- Introduced `WORLD_SCALE=5.2` and restored the arcade world-coordinate pace for both player and rival craft.
- Scaled the oval length, radius, rival starting gaps, wave crest positions/spacing and heart pickup positions by the same factor. A nominal 199 km/h craft still takes about 90.5 seconds for one physical 5km lap, but world scenery flows at the former fast arcade pace.
- Kept steering, wave buoyancy, actual player/bot speedometer values, AI firing, sprite images and the existing HUD unchanged. **An attempted unshipped AI shooting-frequency reduction was explicitly reverted** because the user pointed out that slow course motion—not shooting—is the immediate bug.
- New standalone output: `../GAIA-JET-DUO-v15.2-SPEED-FIX.html`. Rebuild with `node bundle.mjs` and test with `node smoke-preview.cjs --physics-tests` plus bundled HTML.
- Added an automated regression asserting world motion remains `5.2 × speed/3.6` and the nominal 5km lap stays roughly 90 seconds. Source and offline bundle passed; 200-second world simulation finished at ~49,863 arcade units with no end cutoff.

**Limitations:** Headless canvas screenshots and physics tests are available, but a real browser/device interactive run was not completed. The connected browser was unavailable and a cloud-browser attempt to open the local `file:` URL was refused by browser policy; no further bypass attempted. User must visually verify speed and frame rate on their tablet before declaring the problem closed.

## v15.3 — apparent speed / buoy travel / visual motion

The user said v15.2 still felt slow (even v14 was not particularly fast) and explicitly approved increasing **buoy fly-past speed**, moving surface water, camera speed response and wake/boost impact together in one test build. The graphic standard takes precedence: keep team images, cutouts and HUD unchanged.

- `WORLD_SCALE` raised from **5.2** to **8.2**; world-coordinate buoy and road geometry now approach/pass about **58% faster** at the same speedometer reading. Circuit circumference, curve radius, waves and heart positions all scale with the same factor, keeping nominal lap duration at ~90.5 seconds. Buoys stay at the original 210-unit world gap, which makes them more frequent in time, so watch on-device feel.
- Ocean artwork keeps its static depth composition plus a moving semi-transparent sampled layer. Its speed varies with surface depth and increases with the boost, preserving a continuous wrap using crossfaded half-cycle samples. World-positioned small foam highlights and near-water streaks also cross the screen more rapidly; no textual effects were added.
- Projection uses speed- and boost-sensitive lens depth/scale and a mild foreground expansion. Existing original transparent spray sheets respond more intensely to higher speed and boost, and both player/rival craft use their actual speeds for wake strength.
- Bubble projectile world travel speed scales from `600` to `600 × 8.2 / 5.2` with the racing units, preserving relative hit timing. Auto-targeting, damage, AI, jumping, handling and all seven team graphics remain intact.
- `bundle.mjs` now emits `../GAIA-JET-DUO-v15.3-SPEED-FEEL.html`. Test source and bundled HTML with `smoke-preview.cjs --physics-tests`. New smoke assertions check the increased buoy pass rate and unchanged long-lap duration.

**Still unverified:** actual motion feel/FPS on the user's Android tablet; screenshots from the headless canvas cannot prove perceived frame rate. Deliver as a test build, not an announced final release. Do not push to GitHub without fresh authorization; a preceding remote push was denied.
