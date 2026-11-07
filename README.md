# GAIA JET DUO

2.5D arcade jet-ski racing prototype — background and water switch test (v13).

- `index.html` — browser playable source (load with the `assets/` directory).
- `assets/` — optimized game textures and character sprites, including three water and three scenery variants.
- `assets-source/` — original unoptimized water and buoy source images.
- `bundle.mjs` — builds a single offline HTML file with embedded assets.
- `smoke-preview.cjs` — preview and physics smoke tests.

Run `node bundle.mjs` to create the standalone offline game file. The source game keeps collision, boost, inertia, jumping and wave behavior from v12. Select scenery using the top-right button; water and horizon scenery change together in this test version.

No GitHub Pages deployment has been configured.
