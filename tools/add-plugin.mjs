// Adds or updates a plugin in the store:  node tools/add-plugin.mjs path/to/plugin.js
// Copies the file into plugins/, reads its ==YokePlugin== header and records its SHA-256 in
// plugins/index.json. Yoke refuses any download that doesn't match that fingerprint.
// To take one down:  node tools/add-plugin.mjs --remove plugin.js
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const dir = path.join(root, 'plugins');
const indexFile = path.join(dir, 'index.json');

if (process.argv[2] === '--remove') {
  const name = path.basename(process.argv[3] || '');
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  const kept = index.plugins.filter((p) => p.file !== name);
  if (kept.length === index.plugins.length) {
    console.error(`${name || 'That plugin'} isn't in the store.`);
    process.exit(1);
  }
  fs.writeFileSync(indexFile, `${JSON.stringify({ ...index, plugins: kept }, null, 2)}\n`);
  fs.rmSync(path.join(dir, name), { force: true });
  console.log(`Removed ${name}. Commit and push to publish it.`);
  process.exit(0);
}

const source = process.argv[2];
if (!source) {
  console.error('Usage: node tools/add-plugin.mjs path/to/plugin.js');
  process.exit(1);
}
const file = path.basename(source);
if (!/^[a-z0-9][a-z0-9-]*\.(js|css)$/.test(file)) {
  console.error('Name the file like sleep-timer.js or my-theme.css (lowercase letters, numbers and dashes).');
  process.exit(1);
}
const bytes = fs.readFileSync(source);
if (bytes.length > 1024 * 1024) {
  console.error('Plugins can be at most 1 MB.');
  process.exit(1);
}
const block = bytes.toString('utf8').match(/==YokePlugin==([\s\S]*?)==\/YokePlugin==/);
if (!block) {
  console.error('This file has no ==YokePlugin== header.');
  process.exit(1);
}
const info = {};
for (const line of block[1].split('\n')) {
  const m = line.match(/@(\w+)\s+(.+?)\s*(\*\/)?$/);
  if (m) info[m[1].toLowerCase()] = m[2];
}
if (!info.name || !info.version) {
  console.error('The header needs at least @name and @version.');
  process.exit(1);
}

const index = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')) : { plugins: [] };
const entry = {
  id: file.replace(/\.(js|css)$/, ''),
  file,
  name: info.name,
  version: info.version,
  author: info.author || 'Unknown',
  description: info.description || '',
  type: file.endsWith('.css') ? 'style' : 'script',
  size: bytes.length,
  sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
};
const at = index.plugins.findIndex((p) => p.file === file);
if (at >= 0) index.plugins[at] = entry;
else index.plugins.push(entry);
index.plugins.sort((a, b) => a.name.localeCompare(b.name));
fs.mkdirSync(dir, { recursive: true });
if (path.resolve(source) !== path.join(dir, file)) fs.writeFileSync(path.join(dir, file), bytes);
fs.writeFileSync(indexFile, `${JSON.stringify(index, null, 2)}\n`);
console.log(`${at >= 0 ? 'Updated' : 'Added'} ${entry.name} ${entry.version} (${entry.sha256.slice(0, 12)}…). Commit and push to publish it.`);
