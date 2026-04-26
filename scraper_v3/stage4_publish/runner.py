"""Stage 4 — publish detections into the website's per-slug JSON layout.

Combines:
  - data/detections/{slug}.json (from stage 3)
  - data/councils.csv (database fields like region, county, council_name)
into the per-slug files at client/public/data/councils/{slug}.json
plus directory.json + councils_scored.json with new scores and ranks.
"""
from __future__ import annotations
import argparse
import csv
import json
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List


# VDTI v4.0 indicator weights — must match lib/scoring.ts INDICATORS
WEIGHTS = {
    "1.1": (1, "Working council website",                 10),
    "1.2": (1, "Council email address published",         5),
    "1.3": (1, "Phone number published",                  5),
    "1.4": (1, "Named clerk identified",                  5),
    "2.1": (2, "Meeting agendas published",               15),
    "2.2": (2, "Meeting minutes published",               10),
    "3.1": (3, "AGAR / annual financial statement",       15),
    "3.2": (3, "Clerk email — correspondence channel",    10),
    "4.1": (4, "Chair / Mayor named",                     5),
    "4.2": (4, "At least one councillor identified",      5),
    "4.3": (4, "Accessibility statement published",       10),
    "4.4": (4, "Secure connection (HTTPS)",               5),
}


def band_for(score: int) -> str:
    if score >= 80: return "Excellent"
    if score >= 65: return "Good"
    if score >= 50: return "Developing"
    return "Needs Attention"


def assemble_council_json(council: dict, detections: dict) -> dict:
    """Build the per-slug JSON shape the website expects."""
    indicators = []
    pillar_earned = {"1": 0, "2": 0, "3": 0, "4": 0}
    evidence = {}

    for ind_id, (pillar, label, max_pts) in WEIGHTS.items():
        det = detections.get("indicators", {}).get(ind_id, {})
        found = det.get("found", False)
        confidence = det.get("confidence", 0)
        # We award full points only at confidence >= 0.7
        earned = max_pts if (found and confidence >= 0.7) else 0
        pillar_earned[str(pillar)] += earned
        indicators.append({
            "id": ind_id,
            "pillar": pillar,
            "label": label,
            "max_points": max_pts,
            "earned": earned,
            "assessed": True,
            "input_snapshot": {
                "evidence_url": det.get("evidence_url"),
                "evidence_snippet": det.get("evidence_snippet"),
                "document_date": det.get("document_date"),
                "confidence": confidence,
            },
        })
        if found:
            evidence[ind_id] = {
                "url": det.get("evidence_url"),
                "snippet": det.get("evidence_snippet"),
                "document_date": det.get("document_date"),
                "confidence": confidence,
            }

    score = sum(i["earned"] for i in indicators)

    # Pull flat fields out of detector snippets — these populate the contact
    # panel on the council profile page (council.email, council.clerk_name etc.).
    # Each detector's evidence_snippet IS the extracted value, so we can copy it.
    inds_dict = detections.get("indicators", {})
    def snippet_if_found(ind_id: str, conf_min: float = 0.7) -> str | None:
        d = inds_dict.get(ind_id, {})
        if d.get("found") and d.get("confidence", 0) >= conf_min:
            return d.get("evidence_snippet") or None
        return None

    # Email: drop the "Clerk: " prefix some detectors prepend
    email = snippet_if_found("1.2")
    phone = snippet_if_found("1.3")
    clerk_name_raw = snippet_if_found("1.4")
    clerk_name = clerk_name_raw.replace("Clerk: ", "").strip() if clerk_name_raw else None
    clerk_email = snippet_if_found("3.2")
    chair_name_raw = snippet_if_found("4.1")
    chair_name = chair_name_raw.replace("Chair: ", "").strip() if chair_name_raw else None
    councillors_listed = bool(snippet_if_found("4.2"))

    return {
        "council_id": council.get("id"),
        "slug": council["slug"],
        "name": council["council_name"],
        "type": council.get("type", "parish"),
        "county": council.get("county"),
        "region": council.get("region"),
        # Flat observable fields — single source of truth for the contact panel
        "website": detections.get("homepage"),
        "email": email,
        "phone": phone,
        "clerk_name": clerk_name,
        "clerk_email": clerk_email,
        "chair_name": chair_name,
        "councillors_listed": councillors_listed,
        "has_agendas": bool(snippet_if_found("2.1")),
        "has_minutes": bool(snippet_if_found("2.2")),
        "has_financials": bool(snippet_if_found("3.1")),
        "has_accessibility_statement": bool(snippet_if_found("4.3")),
        # Derived
        "indicators": indicators,
        "evidence": evidence,
        "pillar_earned": pillar_earned,
        "pillar_max_assessed": {"1": 25, "2": 25, "3": 25, "4": 25},
        "numerator": score,
        "denominator": 100,
        "score": score,
        "completeness": 1.0,
        "band": band_for(score),
        "methodology_version": "VDTI v4.0",
        "data_extraction_date": "scraper_v3 first run",
        "scrape_status": "ok",
    }


def run(detections_dir: str, councils_csv: str, output_dir: str):
    detections_dir, councils_csv, output_dir = Path(detections_dir), Path(councils_csv), Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    with open(councils_csv) as f:
        councils = {r["slug"]: r for r in csv.DictReader(f)}

    rows = []
    for det_file in sorted(detections_dir.glob("*.json")):
        slug = det_file.stem
        if slug not in councils:
            continue
        with open(det_file) as f:
            det = json.load(f)
        body = assemble_council_json(councils[slug], det)
        with open(output_dir / "councils" / f"{slug}.json", "w", encoding="utf-8") as f:
            (output_dir / "councils").mkdir(parents=True, exist_ok=True)
            json.dump(body, f, ensure_ascii=False, indent=2)
        rows.append(body)

    # Rank
    rows.sort(key=lambda r: (-r["score"], r["name"]))
    prev_score, prev_rank = None, 0
    for i, r in enumerate(rows):
        if r["score"] == prev_score:
            r["rank"] = prev_rank
        else:
            r["rank"] = i + 1
            prev_rank = i + 1
            prev_score = r["score"]

    # Regional rank
    by_region = defaultdict(list)
    for r in rows: by_region[r["region"]].append(r)
    for items in by_region.values():
        items.sort(key=lambda r: (-r["score"], r["name"]))
        ps, pr = None, 0
        for i, r in enumerate(items):
            if r["score"] == ps: r["regional_rank"] = pr
            else:
                r["regional_rank"] = i + 1; pr = i + 1; ps = r["score"]

    N = len(rows) or 1
    for r in rows:
        r["percentile"] = round(100 * (N - r["rank"] + 1) / N, 1)

    # Re-write per-slug with rank
    for r in rows:
        with open(output_dir / "councils" / f"{r['slug']}.json", "w", encoding="utf-8") as f:
            json.dump(r, f, ensure_ascii=False, indent=2)

    # directory.json + councils_scored.json
    summary = [{
        "id": r["council_id"], "slug": r["slug"], "name": r["name"],
        "type": r["type"], "county": r["county"], "region": r["region"],
        "score": r["score"], "rank": r["rank"], "regional_rank": r.get("regional_rank"),
        "percentile": r.get("percentile"), "band": r["band"],
        "has_website": bool(r.get("website")),
        "scrape_status": r.get("scrape_status", "ok"),
    } for r in rows]
    with open(output_dir / "directory.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False)
    with open(output_dir / "councils_scored.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False)
    print(f"Published {len(rows)} councils to {output_dir}")


def main():
    p = argparse.ArgumentParser(description="Stage 4: publish per-slug JSONs")
    p.add_argument("--detections", default="scraper_v3/data/detections")
    p.add_argument("--councils", default="scraper_v3/data/councils.csv")
    p.add_argument("--output", default="client/public/data")
    args = p.parse_args()
    run(args.detections, args.councils, args.output)


if __name__ == "__main__":
    main()
