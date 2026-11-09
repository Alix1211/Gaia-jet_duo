# GAIA JET DUO — update channel

Dedicated, non-main branch for Android WebView content updates. V44 is the bundled baseline. To publish V45, upload `updates/jetduo/game-v45.html`, compute its SHA-256 and update the version/url/sha256 in `updates/jetduo/update.json` **only after** the HTML is accessible. The app downloads a verified file and applies it on next launch; it never silently installs APKs.

The repo is public, so embedded images/audio in uploaded HTML will be publicly downloadable.
