"""Extract the canonical council list from the April 2026 database into a CSV.

Output: scraper_v3/data/councils.csv with columns:
    id, slug, council_name, type, county, region, website (db url, may be wrong)

This is the single source of truth for which councils stage 1 tries to discover.
"""
import argparse
import csv
import sys
from pathlib import Path

from openpyxl import load_workbook


def run(xlsx_path: str, out_path: str):
    print(f"Loading {xlsx_path}...")
    wb = load_workbook(xlsx_path, data_only=True, read_only=True)
    ws = wb["All Councils"]
    rows_iter = ws.iter_rows(values_only=True)
    headers = list(next(rows_iter))

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "slug", "council_name", "type", "county", "district", "region", "website"])
        n = 0
        for row in rows_iter:
            rec = dict(zip(headers, row))
            if not rec.get("Slug"):
                continue
            writer.writerow([
                rec.get("ID") or "",
                rec.get("Slug"),
                rec.get("Council Name") or "",
                (rec.get("Type") or "parish").lower(),
                rec.get("County") or "",
                rec.get("District") or "",
                rec.get("Region") or "",
                rec.get("Website URL") or "",
            ])
            n += 1
    print(f"Wrote {n} councils to {out_path}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--xlsx", required=True, help="Path to Council_ClearSight_*.xlsx")
    p.add_argument("--out", default="scraper_v3/data/councils.csv")
    args = p.parse_args()
    run(args.xlsx, args.out)


if __name__ == "__main__":
    main()
