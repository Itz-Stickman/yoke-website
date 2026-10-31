// ==YokePlugin==
// @name        Intro Scan
// @version     1.0
// @author      Yoke
// @description Like the button on an old CD player: press I to hear the first 15 seconds of each song in the queue.
// ==/YokePlugin==

const SECONDS = 15;
let scanning = false;

function onKey(e) {
  if (e.key.toLowerCase() !== 'i' || e.ctrlKey || e.altKey || e.metaKey) return;
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; // typing, not a shortcut
  scanning = !scanning;
  plugin.toast(scanning ? `Intro Scan on: ${SECONDS} seconds of each song` : 'Intro Scan off');
}
document.addEventListener('keydown', onKey);
plugin.onUnload(() => document.removeEventListener('keydown', onKey));

plugin.on('timeupdate', () => {
  // Live radio has no length, so it's left alone.
  if (scanning && plugin.player.duration > 0 && plugin.player.position >= SECONDS) {
    if (plugin.player.position < SECONDS + 2) plugin.player.next();
  }
});
