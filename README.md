# GAIA JET DUO

2.5D arcade jet-ski racing prototype — seven-team watergun test (v14 working branch).

- `index.html` — browser playable source (load with the `assets/` directory).
- `assets/` — optimized game textures and character sprites, including seven teams × three poses and three water/scenery variants.
- `assets-source/teams/` — original, unmodified PNG sheets for all seven rival teams (21 images).
- `assets-source/` — original unoptimized water and buoy source images.
- `bundle.mjs` — builds a single offline HTML file with embedded assets.
- `smoke-preview.cjs` — preview, physics and combat smoke tests.
- `HANDOFF.md` — verified status, decisions, open issues and tests for the next session.

Run `node bundle.mjs` to create `../GAIA-JET-DUO-v14-7TEAM.html` as a standalone offline game file. Run `node smoke-preview.cjs --physics-tests` to verify the original physics plus watergun, combo and neon-heart interactions; run with `../GAIA-JET-DUO-v14-7TEAM.html` to test the offline file too.

The existing craft/buoy collisions, inertia, boost surge/decay, jumping and water-wave motions are retained. The front/back fire buttons now create projectiles; water hits slow steering and speed, and ten consecutive hits cause a larger slowdown. AI gunners shoot backwards toward the player. Neon-heart pickups, hitting rivals, jumps and steering charge the booster meter. The opening card previews all seven teams; each racing team has animated rear movement and rear-fire art.

The nine named rival special skills from the previous conversation are **not implemented or assigned to teams** here: their exact names/effects and confirmed mapping could not be recovered. See `HANDOFF.md` before making any assignments.

No GitHub Pages deployment has been configured.
