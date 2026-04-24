"""Split the big councils_scored.json back into per-slug files that the site reads.

Run this after build_audit.py has produced a fresh data/councils_scored.json.
"""
from __future__ import annotations
import json, os, sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC  = REPO / "data" / "councils_scored.json"
OUT  = REPO / "client" / "public" / "data" / "councils"
SLIM = REPO / "client" / "public" / "data" / "directory.json"

if not SRC.exists():
    print(f"No {SRC} — nothing to split.")
    sys.exit(0)

OUT.mkdir(parents=True, exist_ok=True)
data = json.load(SRC.open())
councils = data.get("councils", [])

# Per-slug full JSON
n = 0
for c in councils:
    slug = c.get("slug")
    if not slug: continue
    safe = "".join(ch if ch.isalnum() or ch in "-_" else "_" for ch in slug)
    (OUT / f"{safe}.json").write_text(json.dumps(c, separators=(",", ":"), default=str))
    n += 1

# Slim directory.json
slim = [{
    "id": c.get("council_id"), "slug": c.get("slug"), "name": c.get("name"),
    "type": c.get("type"), "county": c.get("county"), "region": c.get("region"),
    "score": c.get("score"), "band": c.get("band"), "completeness": c.get("completeness"),
    "rank_national": c.get("rank_national"), "rank_type": c.get("rank_type"), "rank_region": c.get("rank_region"),
} for c in councils]
SLIM.write_text(json.dumps(slim, default=str))

print(f"Split {n} per-slug files, wrote slim directory ({SLIM})")
