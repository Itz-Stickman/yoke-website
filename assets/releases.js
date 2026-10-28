// Yoke release data. The site ships with a copy so pages render right away,
// then refreshes from GitHub so new releases appear without editing the site.
(function () {
  var REPO = 'Itz-Stickman/yoke-releases';
  var DOWNLOAD_BASE = 'https://github.com/' + REPO + '/releases/download/';
  var CACHE_KEY = 'yoke-releases-v1';

  var FALLBACK = [
    { version: '1.4.5', date: '2026-10-28', setup: 'Yoke-Setup-1.4.5.exe', portable: 'Yoke-1.4.5-portable.exe' },
    { version: '1.4.0', date: '2026-10-28' },
    { version: '1.3.1', date: '2026-10-28' },
    { version: '1.3.0', date: '2026-10-28', setup: 'Yoke-Setup-1.3.0.exe', portable: 'Yoke-1.3.0-portable.exe' }
  ];

  // Notes written for the site. If a GitHub release has its own notes, those win.
  var NOTES = {
    '1.4.5': [
      { heading: 'Added', items: [
        'Visualizers: choose from up to 5, with more coming soon',
        'Live concerts',
        '3D audio'
      ] },
      { heading: 'Fixed', items: [
        "The Artists tab now shows and updates to the current artist's profile",
        'Other minor bug fixes'
      ] }
    ]
  };

  // A body like "Yoke 1.4.5" is just a title, not notes.
  function isPlaceholder(body) {
    return !body || /^\s*(yoke\s*)?v?\d+(\.\d+)*\s*$/i.test(body);
  }

  // Turns simple Markdown release notes into sections of headings and bullet items.
  function parseBody(body) {
    var sections = [];
    var cur = null;
    body.replace(/\r/g, '').split('\n').forEach(function (raw) {
      var line = raw.trim();
      if (!line || /^#*\s*(yoke\s*)?(ver(sion)?\.?\s*)?v?\d+(\.\d+)+\s*$/i.test(line)) return;
      var h = line.match(/^#{1,6}\s+(.*)$/) || line.match(/^\*\*(.+?)\*\*:?$/) || line.match(/^([^-*+].*?)\s*[:\-]$/);
      var item = line.match(/^[-*+]\s+(.*)$/);
      if (item) {
        if (!cur) { cur = { heading: '', items: [] }; sections.push(cur); }
        cur.items.push(item[1].replace(/\*\*/g, ''));
      } else if (h) {
        cur = { heading: h[1].replace(/\*\*/g, '').trim(), items: [] };
        sections.push(cur);
      } else {
        if (!cur) { cur = { heading: '', items: [] }; sections.push(cur); }
        cur.items.push(line.replace(/\*\*/g, ''));
      }
    });
    return sections.filter(function (s) { return s.items.length; });
  }

  function finish(list) {
    return list.map(function (r) {
      r.notes = r.notes || NOTES[r.version] || [];
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
