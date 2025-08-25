import json, os, shutil, urllib.parse
HIST = "/home/codespace/.vscode-remote/data/User/History"
ROOT = "/workspaces/codespaces-react"

def decode_resource_path(resource: str):
    try:
        u = urllib.parse.urlparse(resource)
        p = urllib.parse.unquote(u.path)
        idx = p.find("/workspaces/codespaces-react/")
        if idx == -1:
            return None
        # relative path under repo root
        return p[idx+len("/workspaces/codespaces-react/"):].lstrip(/)
    except Exception:
        return None

restored = []
if os.path.isdir(HIST):
    for d in os.listdir(HIST):
        dpath = os.path.join(HIST, d)
        if not os.path.isdir(dpath):
            continue
        entries_json = os.path.join(dpath, "entries.json")
        if not os.path.isfile(entries_json):
            continue
        try:
            data = json.load(open(entries_json, "r"))
        except Exception:
            continue
        resource = data.get("resource")
        if not resource or "/workspaces/codespaces-react/Revoclone/" not in resource:
            continue
        rel = decode_resource_path(resource)
        if not rel:
            continue
        entries = data.get("entries") or []
        if not entries:
            continue
        # latest snapshot
        entries = sorted(entries, key=lambda e: e.get("timestamp", 0))
        latest = entries[-1]
        snap_id = latest.get("id")
        if not snap_id:
            continue
        snap_file = os.path.join(dpath, snap_id)
        if not os.path.isfile(snap_file):
            continue
        dest = os.path.join(ROOT, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        try:
            shutil.copy2(snap_file, dest)
            restored.append(dest)
        except Exception as e:
            print("FAILED", dest, str(e))
print("RESTORED_COUNT", len(restored))
for p in restored:
    print("RESTORED", os.path.relpath(p, ROOT))
