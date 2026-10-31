// ==YokePlugin==
// @name        Listening Time
// @version     1.0
// @author      Yoke
// @description Shows how long you've listened today and this week, under your song count in the sidebar.
// ==/YokePlugin==

const SAVE_EVERY = 15; // seconds
const DAYS_KEPT = 7;

// Seconds listened per day: { "2026-10-31": 3600 }
const days = plugin.storage.get('days', {});
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Saved days older than a week aren't needed.
const cutoff = Date.now() - DAYS_KEPT * 86400000;
for (const day of Object.keys(days)) {
  if (new Date(`${day}T12:00:00`).getTime() < cutoff) delete days[day];
}

const line = document.createElement('div');
line.className = 'muted small';
line.style.marginTop = '4px';
line.style.textAlign = 'center';
document.querySelector('#lib-status').after(line);
plugin.onUnload(() => line.remove());

const format = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};
function draw() {
  const week = Object.values(days).reduce((sum, s) => sum + s, 0);
  line.textContent = `${format(days[today()] || 0)} today · ${format(week)} this week`;
}

let unsaved = 0;
plugin.setInterval(() => {
  if (!plugin.player.playing) return;
  days[today()] = (days[today()] || 0) + 1;
  if (++unsaved >= SAVE_EVERY) {
    unsaved = 0;
    plugin.storage.set('days', days);
  }
  draw();
}, 1000);
plugin.onUnload(() => plugin.storage.set('days', days));
draw();
