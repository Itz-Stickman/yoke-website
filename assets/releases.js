// Yoke release data. The site ships with a copy so pages render right away,
// then refreshes from GitHub so new releases appear without editing the site.
(function () {
  var REPO = 'Itz-Stickman/yoke-releases';
  var DOWNLOAD_BASE = 'https://github.com/' + REPO + '/releases/download/';
  var CACHE_KEY = 'yoke-releases-v2';

  var FALLBACK = [['1.5.1', '2026-10-30'], ['1.4.6', '2026-10-28'], ['1.4.5', '2026-10-28'], ['1.4.0', '2026-10-28'], ['1.3.1', '2026-10-28'], ['1.3.0', '2026-10-28']].map(function (v) {
    return { version: v[0], date: v[1], setup: 'Yoke-Setup-' + v[0] + '.exe', portable: 'Yoke-' + v[0] + '-portable.exe' };
  });

  // Notes written for the site, in the same Markdown as GitHub releases.
  // If a GitHub release has its own notes, those win.
  var NOTES = {
    '1.5.1': [
      '## ✨ New',
      '- **Play CDs.** Plug in a CD drive (USB works) and a new **CD** page appears in the sidebar. Put in a music CD and Yoke plays it straight from the disc in full quality.',
      '  - Album, song names and cover art are found automatically on **MusicBrainz**.',
      '  - The visualizer, 3D Audio, output device picker and Discord status all work with CDs.',
      '  - **⏏ Eject** pops the disc out from inside Yoke.',
      '- **Add CDs to your library.** **＋ Add to library** copies a CD so you can play it without the disc, lossless, with names and cover included.',
      '  - Copies are protected: they\'re encrypted and only play in Yoke on your PC and Windows account, so they can\'t be shared or opened in other apps.',
      '- **Plugins.** A new **Plugins** section in Settings lets you add plugins that bring new features (.js files) or change how Yoke looks (.css files), and turn each one on or off.',
      '  - Plugins are off until you allow them, and Yoke shows you every plugin\'s full code to check before it\'s added.',
      '- **Yoke API.** Stream overlays, Stream Deck, Streamer.bot and other apps can now see what\'s playing and control Yoke.',
      '  - Turn it on and create a key for each app in **Settings → Advanced → Yoke API**. Each key only gets the permissions you choose, and you can delete it any time.',
      '  - Developer docs are at **yokebeat.com/api.html**.',
      '- **More music formats with FFmpeg.** With FFmpeg installed, Yoke also plays **WMA, AIFF, APE, WavPack, DSD, TTA, MKA, AC3** and **Musepack**. Set it up in **Settings → Audio Format**.',
      '- **Tune 3D Audio.** New sliders in **Settings → 3D Audio** for **stereo width**, **speaker angle**, **room size** and **centre focus**.',
      '- **Five new visualizers:** **Ridgeline**, **Tunnel**, **Prism**, **Sparks** and **Orbit**. That makes ten in all.',
      '- **Player options** in **Settings → Appearance**: **rounder album covers**, a **glow around the play button**, and a **"Now playing"** pop-up when a new song starts. All on by default and easy to switch off.',
      '- **Online services switches.** Turn off lyrics, artist pictures, CD names or Discord album covers individually to keep Yoke fully offline.',
      '## 🔄 Changed',
      '- **Settings are now grouped into sections**: General, Appearance, Audio Format, 3D Audio, Plugins, Advanced and About.',
      '- **Listening on other devices** is now a switch in **Settings → Advanced → Local network** (you can set the port there too), instead of editing a config file. Your old setting carries over.',
      '- **Your own Discord application ID** has moved to **Settings → Advanced**.',
      '- **Choosing a visualizer** is now a dropdown with a preview in Settings; the Visualizer page shows the name with ‹ › arrows.',
      '## 🔧 Fixed',
      '- **Songs that wouldn\'t play were skipped silently.** Yoke now retries them through FFmpeg (this fixes Apple Lossless files saved as .m4a), and if a song still can\'t play it tells you why.'
    ].join('\n'),
    '1.4.6': [
      '## ✨ New',
      '- **Light mode.** Settings → Appearance now has a **Theme** switch: **Dark**, **Light** or **Match Windows**. Match Windows follows your Windows setting and switches live, title bar included.',
      '- **12 accent colours.** Six new ones: **Indigo, Crimson, Orange, Lime, Cyan** and a neutral **Silver**.',
      '- **Output device picker.** A new speaker button on the playback bar lets you choose where Yoke plays: speakers, headphones, monitors or Bluetooth devices.',
      '  - The icon shows a **Bluetooth** mark and lights up in your accent colour when you\'re on a Bluetooth device.',
      '  - If your Bluetooth headphones disconnect, Yoke switches to your default speakers, then back again when they reconnect.',
      '- **Taskbar controls.** Hover Yoke in the taskbar for **Previous / Play-Pause / Next** buttons under the preview. They work while Yoke is minimized.',
      '- **About Yoke.** A new section at the bottom of Settings shows your version, with links to our **website**, **X** and **Instagram**.',
      '## 🔧 Fixed',
      '- **Hard-to-read buttons on light accents:** buttons now use dark text on Amber (and the new Lime and Silver) instead of white.'
    ].join('\n'),
    '1.4.5': [
      '## Added',
      '- **Visualizers.** Choose from up to 5, with more coming soon.',
      '- **Live concerts**',
      '- **3D audio**',
      '## Fixed',
      "- The Artists tab now shows and updates to the current artist's profile.",
      '- Other minor bug fixes.'
    ].join('\n')
  };

  // A body like "Yoke 1.4.5" is just a title, not notes.
  function isPlaceholder(body) {
    return !body || /^\s*(yoke\s*)?v?\d+(\.\d+)*\s*$/i.test(body);
  }

  // Turns simple Markdown release notes into sections of headings and items.
  // Items keep their **bold** markers; indented bullets become sub-items of the one above.
  function parseBody(body) {
    var sections = [];
    var cur = null;
    var last = null;
    var section = function () { if (!cur) { cur = { heading: '', items: [] }; sections.push(cur); } return cur; };
    body.replace(/\r/g, '').split('\n').forEach(function (raw) {
      var line = raw.trim();
      if (!line || /^#*\s*(yoke\s*)?(ver(sion)?\.?\s*)?v?\d+(\.\d+)+\s*$/i.test(line)) return;
      var item = line.match(/^[-*+]\s+(.*)$/);
      var h = !item && (line.match(/^#{1,6}\s+(.*)$/) || line.match(/^\*\*([^*]+)\*\*:?$/) || line.match(/^([^-*+].*?)\s*[:\-]$/));
      if (item && /^\s{2,}/.test(raw) && last) {
        last.sub.push(item[1]);
      } else if (h) {
        cur = { heading: h[1].replace(/\*\*/g, '').trim(), items: [] };
        sections.push(cur);
        last = null;
      } else {
        last = { text: item ? item[1] : line, sub: [] };
        section().items.push(last);
      }
    });
    return sections.filter(function (s) { return s.items.length; });
  }

  function finish(list) {
    return list.map(function (r) {
      r.notes = r.notes || (NOTES[r.version] ? parseBody(NOTES[r.version]) : []);
      r.setupUrl = r.setup ? DOWNLOAD_BASE + 'v' + r.version + '/' + r.setup : null;
      r.portableUrl = r.portable ? DOWNLOAD_BASE + 'v' + r.version + '/' + r.portable : null;
      r.pageUrl = 'https://github.com/' + REPO + '/releases/tag/v' + r.version;
      return r;
    });
  }

  function fromGitHub(data) {
    return data.filter(function (r) { return !r.draft; }).map(function (r) {
      var find = function (re) { var a = (r.assets || []).filter(function (x) { return re.test(x.name); })[0]; return a ? a.name : null; };
      return {
        version: r.tag_name.replace(/^v/i, ''),
        date: (r.published_at || '').slice(0, 10),
        prerelease: r.prerelease,
        setup: find(/^Yoke-Setup-.*\.exe$/i),
        portable: find(/portable\.exe$/i),
        notes: isPlaceholder(r.body) ? null : parseBody(r.body)
      };
    });
  }

  function load() {
    try {
      var hit = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (hit && Date.now() - hit.t < 10 * 60 * 1000) return Promise.resolve(finish(fromGitHub(hit.data)));
    } catch (e) {}
    return fetch('https://api.github.com/repos/' + REPO + '/releases?per_page=100', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) { if (!res.ok) throw new Error('GitHub ' + res.status); return res.json(); })
      .then(function (data) {
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: data })); } catch (e) {}
        var list = finish(fromGitHub(data));
        if (!list.length) throw new Error('No releases');
        return list;
      });
  }

  // Points every [data-dl] link and [data-version] label at the newest release.
  function applyDownloads(list) {
    var latest = list.filter(function (r) { return !r.prerelease && r.setupUrl; })[0];
    if (!latest) return;
    document.querySelectorAll('[data-dl="setup"]').forEach(function (a) { a.href = latest.setupUrl; });
    document.querySelectorAll('[data-dl="portable"]').forEach(function (a) { if (latest.portableUrl) a.href = latest.portableUrl; });
    document.querySelectorAll('[data-version]').forEach(function (el) { el.textContent = latest.version; });
  }

  window.YokeReleases = { fallback: finish(FALLBACK.map(function (r) { return Object.assign({}, r); })), load: load, applyDownloads: applyDownloads };
})();
