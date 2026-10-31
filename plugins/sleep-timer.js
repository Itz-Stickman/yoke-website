// ==YokePlugin==
// @name        Sleep Timer
// @version     1.0
// @author      Yoke
// @description Adds a moon button that stops the music after 15, 30, 60 or 90 minutes, fading out gently.
// ==/YokePlugin==

const CHOICES = [0, 15, 30, 60, 90]; // minutes; 0 is off
const FADE_SECONDS = 20;

plugin.addStyle(`
  #sleep-timer-btn {
    position: fixed; right: 16px; bottom: 96px; z-index: 30; cursor: pointer;
    background: var(--panel-2); color: var(--text); border: 1px solid var(--border);
    font: 600 12px/1 inherit; padding: 8px 12px; border-radius: 999px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, .35);
  }
  #sleep-timer-btn.on { background: var(--accent); color: var(--on-accent); border-color: var(--accent); }
`);

const button = document.createElement('button');
button.id = 'sleep-timer-btn';
document.body.append(button);
plugin.onUnload(() => button.remove());

let choice = 0;
let endsAt = 0;
let fading = null; // volume to restore after a fade

function restoreVolume() {
  if (fading === null) return;
  plugin.player.setVolume(fading);
  fading = null;
}

function draw() {
  button.classList.toggle('on', Boolean(endsAt));
  if (!endsAt) {
    button.textContent = '🌙 Sleep timer';
    return;
  }
  const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 60000));
  button.textContent = `🌙 ${left} min left`;
}

button.onclick = () => {
  choice = (choice + 1) % CHOICES.length;
  restoreVolume();
  endsAt = CHOICES[choice] ? Date.now() + CHOICES[choice] * 60000 : 0;
  plugin.toast(endsAt ? `Music stops in ${CHOICES[choice]} minutes` : 'Sleep timer off');
  draw();
};

plugin.setInterval(() => {
  if (!endsAt) return;
  const left = (endsAt - Date.now()) / 1000;
  if (left <= 0) {
    plugin.player.pause();
    restoreVolume();
    endsAt = 0;
    choice = 0;
    plugin.toast('Sleep timer finished. Good night!');
  } else if (left <= FADE_SECONDS) {
    if (fading === null) fading = plugin.player.volume;
    plugin.player.setVolume(fading * (left / FADE_SECONDS));
  }
  draw();
}, 1000);

plugin.onUnload(restoreVolume);
draw();
