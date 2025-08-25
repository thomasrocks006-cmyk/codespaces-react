#!/usr/bin/env python3
from __future__ import annotations
import json, os
from pathlib import Path

hist_root = Path(/home/codespace/.vscode-remote/data/User/History)
repo_subpath = /workspaces/codespaces-react/Revoclone/
items: list[tuple[int, str, str]] = []
if hist_root.exists():
    for root, _dirs, files in os.walk(hist_root):
        if entries.json not in files:
            continue
        p = Path(root) / entries.json
        try:
            data = json.loads(p.read_text(encoding=utf-8))
        except Exception:
            continue
        res = data.get(resource, ) or 
        if repo_subpath not in res:
            continue
        for e in data.get(entries, []) or []:
            src = (e.get(source) or )
            ts = int(e.get(timestamp) or 0)
            if Chat
