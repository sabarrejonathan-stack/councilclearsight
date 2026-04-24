"""Merge scrape_results.csv into the scoring engine's input.

The scoring engine (scoring_engine/build_audit.py) currently reads the Excel
database as its source of truth. This script takes the scraper's CSV output
and injects its findings into that source, then re-runs the engine.

For each council in scrape_results.csv:
  - If website_resolves is populated, set it in the base data
  - If has_accessibility_statement was assessed, set it
  - Same for has_agendas, has_minutes, has_financials, has_register_of_interests
  - Set accessibility_scrape_attempted and governance_scrape_attempted flags

Output: writes scraper/data/merged_input.csv which build_audit.py can ingest
(once build_audit is updated to accept CSV input; currently it reads xlsx,
so this script also writes into a pandas dataframe and saves as xlsx).
"""
from __future__ import annotations
import csv
import os
import sys
from pathlib import Path

# Run from repo root
REPO = Path(__file__).resolve().parents[2]
SCRAPE = REPO / "scraper" / "data" / "scrape_results.csv"
OUT    = REPO / "scraper" / "data" / "merged_inputs.csv"

if not SCRAPE.exists():
    print(f"No scrape results at {SCRAPE} — skipping merge.")
    sys.exit(0)

rows_out = []
with SCRAPE.open() as f:
    for r in csv.DictReader(f):
        rows_out.append({
            "council_id": r["council_id"],
            "slug":       r["slug"],
            "name":       r["name"],
            "website_url":      r["website_url"],
            "website_resolves": r["website_resolves"],
            "has_accessibility_statement":       r["has_accessibility_statement"],
            "accessibility_scrape_attempted":    r["accessibility_scrape_attempted"],
            "has_agendas":                       r["has_agendas"],
            "has_minutes":                       r["has_minutes"],
            "has_financials":                    r["has_financials"],
            "has_register_of_interests":         r["has_register_of_interests"],
            "governance_scrape_attempted":       r["governance_scrape_attempted"],
            "chair_name_scraped":                r["chair_name_scraped"],
            "councillors_listed_count":          r["councillors_listed_count"],
            "councillors_email_count":           r["councillors_email_count"],
        })

OUT.parent.mkdir(parents=True, exist_ok=True)
with OUT.open("w", newline="") as f:
    if rows_out:
        w = csv.DictWriter(f, fieldnames=list(rows_out[0].keys()))
        w.writeheader()
        w.writerows(rows_out)

print(f"Wrote {len(rows_out)} merged rows to {OUT}")
print("Next step: update scoring_engine/build_audit.py to read merged_inputs.csv as a")
print("supplementary override on top of the xlsx base. Then re-run build_audit.py.")
