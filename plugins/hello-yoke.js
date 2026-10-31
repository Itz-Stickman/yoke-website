// ==YokePlugin==
// @name        Hello Yoke
// @version     1.0
// @author      Yoke
// @description Says hello, announces each new song, and shows a play counter in the corner. A good one to read if you want to make your own.
// ==/YokePlugin==

// Say hello when the plugin is turned on.
plugin.toast('Hello from the Hello Yoke plugin! 👋');

// A small badge in the bottom-right corner.
plugin.addStyle(`
  #hello-yoke-badge {
    position: fixed; right: 16px; bottom: 96px; z-index: 30;
    background: var(--accent); color: var(--on-accent);
    font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 999px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, .35); pointer-events: none;
  }
`);
const badge = document.createElement('div');
badge.id = 'hello-yoke-badge';
document.body.append(badge);
plugin.onUnload(() => badge.remove()); // clean up when turned off

// Count songs, remembered between restarts.
let total = plugin.storage.get('total', 0);
let session = 0;
const showCount = () => { badge.textContent = `🎵 ${session} this session · ${total} total`; };
showCount();

plugin.on('trackchange', (track) => {
  session++;
  total++;
  plugin.storage.set('total', total);
  showCount();
  plugin.toast(`Now playing: ${track.title} by ${track.artist}`);
});

plugin.on('ended', (track) => {
  if (track) console.log(`[Hello Yoke] Finished ${track.title}`);
});
