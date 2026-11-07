# GAIA JET DUO

2.5D arcade jet-ski racing prototype — endless oval circuit, seven AI teams and bubble-gun test (v15 working branch).

- `index.html` — browser playable source (load with the `assets/` directory).
- `assets/` — optimized game textures and character sprites, including seven teams × three poses and three water/scenery variants.
- `assets-source/teams/` — original, unmodified PNG sheets for all seven rival teams (21 images).
- `assets-clean/teams/` — properly segmented, transparent, padded PNG sheets (21 images, each pose in a clean cell).
- `assets-source/` — original unoptimized water and buoy source images.
- `rebuild-team-sheets.py` — reproducible alpha-component extraction and per-frame clipping validation.
- `bundle.mjs` — builds a single offline HTML file with embedded assets.
- `smoke-preview.cjs` — preview, physics and combat smoke tests.
- `HANDOFF.md` — verified status, decisions, open issues and tests for the next session.

Run `node bundle.mjs` to create `../GAIA-JET-DUO-v15.3-SPEED-FEEL.html` as a standalone offline game file. Run `node smoke-preview.cjs --physics-tests` to verify gameplay; run with `../GAIA-JET-DUO-v15.3-SPEED-FEEL.html` to test the offline output. Previous v14.1, v15 and v15.2 builds remain as separate rollback builds. v15.3 further raises the world-motion factor to **8.2×** (buoys move past ~58% faster than v15.2) while keeping the roughly 90-second lap. It adds scrolling water-texture samples, world-anchored foam, a subtle speed-/boost-sensitive camera lens and denser original-art wake/splash. No character artwork or HUD text was altered.

**Sprite cutout repair:** the original 3-pose image sheets were *not* evenly spaced; naive `width/3` cropping cut whole characters and jetski hulls. Use `python rebuild-team-sheets.py` to detect the three largest intact alpha components, place each on its own generously padded cell, strip detached speck components, export cleaned transparent PNGs and correctly aligned compressed game WebPs, and assert alpha-free frame borders. Do not split the original source sheets into three equal widths again.

The closed oval course repeats indefinitely with two straightaways and two curves, an accurate oval minimap, laps, and sparse waves. Heavy and light crafts have distinct acceleration, handling, grip, and top speed. Rival AI steers, jumps waves, uses boost and fires bubble pellets. A **single FIRE button auto-selects the nearest eligible rival** and launches discrete round projectiles forward or backward. Water hits slow speed, with a major slowdown on the tenth consecutive hit. Neon hearts, hitting rivals, jumping and steering charge the player's boost. The HUD avoids descriptive text and on-screen rival name tags. The opening card preserves the seven teams' character art.

The nine named rival special skills from the previous conversation are **not implemented or assigned to teams** here: their exact names/effects and confirmed mapping could not be recovered. See `HANDOFF.md` before making any assignments.

No GitHub Pages deployment has been configured.
