# Yoke website

The landing page for [Yoke](https://github.com/Itz-Stickman/yoke-releases), a music player for the files you own. No ads, no account, no nonsense.

It's a single static page (`index.html` plus `assets/`) served with GitHub Pages. No build step: edit the files, push, and the site updates.

## Updating the download links

The download buttons point at a specific release. When a new version is out, search `index.html` for the old version number (for example `1.3.0`) and replace it with the new one. There are three spots: the hero button, the installer button, and the portable button, plus the version line under them.

## Yoke Remote (`remote/`)

`remote/index.html` is the phone page for Yoke's **Phone remote** setting. It connects to the Yoke app over WebRTC using PeerJS (`remote/peerjs-1.5.5.min.js`, pinned to the version the app uses). Its message format must match the "phone remote" section of `public/app.js` in the app.
