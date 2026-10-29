# Yoke website

The landing page for [Yoke](https://github.com/Itz-Stickman/yoke-releases), a music player for the files you own. No ads, no account, no nonsense.

It's a single static page (`index.html` plus `assets/`) served with GitHub Pages. No build step: edit the files, push, and the site updates.

## Updating the download links

The download buttons point at a specific release. When a new version is out, search `index.html` for the old version number (for example `1.3.0`) and replace it with the new one. There are three spots: the hero button, the installer button, and the portable button, plus the version line under them.

## Send to Yoke (`send/`)

`send/index.html` is the page phones open from Yoke's **Add music → From your phone** screen (via the QR code, or by typing yokebeat.com/send and the 4-digit code). It connects to the Yoke app over WebRTC using PeerJS (`send/peerjs-1.5.5.min.js`, pinned to the same version the app uses) and sends the chosen songs straight to the PC. No files are uploaded to this site. The peer ID prefix and message format must match `public/app.js` in the app.
