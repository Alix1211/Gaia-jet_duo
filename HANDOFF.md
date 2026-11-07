# GAIA JET DUO — handoff / 작업 기록 (2026-11-07)

## Source and continuity

- Repository: https://github.com/Alix1211/Gaia-jet_duo.git
- Base revision: `8879b182315c168b2eddd1db2413d9484b2d85f6` (v13)
- Working branch: `jet-team-animation-skills`. Keep `main` untouched unless the user requests a merge.
- Two preceding shared chats: `https://chatgpt.com/share/6aeeef60-304c-83ee-85ed-32526c759db1` and `https://chatgpt.com/share/6aeeef0d-0064-83ee-b73f-018ccb803603`.
- Previous assistant's attempted push was not on remote: working branch was identical to main at start of this session. The remote is the source of truth; do not describe previous unpushed work as present.

## Confirmed design rules to preserve

- 2.5D rear-view water-jetski arcade racer, driver (purple hair) and gunner (pink hair).
- Separate front `FIRE ▲` / back `FIRE ▼`; no sideways attack.
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

Both source and bundled offline tests passed in this session. The generated single-file HTML is outside the repo root: `../GAIA-JET-DUO-v14-7TEAM.html` (~7.83 MB). Check any new commit and `git ls-remote` against GitHub after pushing, and record exactly whether the push succeeded.
