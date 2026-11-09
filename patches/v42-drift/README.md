# GAIA JET DUO — V42 Drift Test Patch

This branch contains **only the V41→V42 drift patch**, not a playable 43 MB HTML build. `main` (V13) remains untouched.

## Required baseline

`GAIA-JET-DUO-v41-FINISH-NOBUOY.html` (SHA-256: `3ab16924adca81e0d793d9465b1166159e24f89584159896fa631ae6d7bcc568`).

## Rebuild V42 locally (Linux/macOS / Git Bash)

Place the V41 HTML and downloaded patch in one directory, then run:

```bash
patch -o GAIA-JET-DUO-v42-DRIFT-TEST.html GAIA-JET-DUO-v41-FINISH-NOBUOY.html < GAIA-JET-DUO-v41-to-v42-DRIFT.patch
```

Expected output SHA-256: `be3cb6df07a37c43f8510eed304d1cba5ac48d9d972dd79f4e4da25bd3c897e2`.

## Changes and exclusions

See `GAIA-JET-DUO-v42-DRIFT-HANDOFF.md`. Only the player brake + high-speed turn drift physics changed. Fire effects and rival AI drifting are **not implemented** pending tablet test. The V41 buoy policy and finish banner are unchanged.

No V41 image, audio, mini-game or dialogue files were re-uploaded or modified here.
