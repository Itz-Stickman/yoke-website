# Yoke website

The landing page for [Yoke](https://github.com/Itz-Stickman/yoke-releases), a music player for the files you own. No ads, no account, no nonsense.

It's a single static page (`index.html` plus `assets/`) served with GitHub Pages. No build step: edit the files, push, and the site updates.

## Updating the download links

The download buttons point at a specific release. When a new version is out, search `index.html` for the old version number (for example `1.3.0`) and replace it with the new one. There are three spots: the hero button, the installer button, and the portable button, plus the version line under them.
