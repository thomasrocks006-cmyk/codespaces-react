const fs = require(fs);
const path = require(path);

const HISTORY_ROOT = /home/codespace/.vscode-remote/data/User/History;
const WORKSPACE_ROOT = /workspaces/codespaces-react;

function listDirs(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => path.join(dir, d.name)); }
  catch { return []; }
}
function ensureDir(p) { fs.mkdirSync(path.dirname(p), { recursive: true }); }
function decodeResourceToPath(resource) {
  try {
    const u = new URL(resource);
    let p = decodeURIComponent(u.pathname);
    const idx = p.indexOf(/workspaces/codespaces-react/);
    if (idx === -1) return null;
    return p.slice(idx);
  } catch { return null; }
}

let restored = [];
for (const dir of listDirs(HISTORY_ROOT)) {
  const entriesJson = path.join(dir, entries.json);
  if (!fs.existsSync(entriesJson)) continue;
  let data; try { data = JSON.parse(fs.readFileSync(entriesJson, utf8)); } catch { continue; }
  const resource = data.resource;
  if (!resource || !resource.includes(/workspaces/codespaces-react/Revoclone/)) continue;
  const targetRel = decodeResourceToPath(resource);
  if (!targetRel) continue;
  const entries = Array.isArray(data.entries) ? data.entries : [];
  if (!entries.length) continue;
  entries.sort((a,b) => (a.timestamp||0) - (b.timestamp||0));
  const latest = entries[entries.length - 1];
  if (!latest || !latest.id) continue;
  const snapshot = path.join(dir, latest.id);
  if (!fs.existsSync(snapshot)) continue;
  const dest = path.join(WORKSPACE_ROOT, targetRel.replace(/^\/+/, ));
  try {
    ensureDir(dest);
    fs.copyFileSync(snapshot, dest);
    restored.push(dest);
  } catch (e) {
    console.error(Failed
