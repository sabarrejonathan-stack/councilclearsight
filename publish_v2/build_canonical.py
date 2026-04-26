"""Build the canonical council list — Excel UNION ONS register.

Output: publish_v2/data/canonical.csv
Columns: council_id, ons_code, slug, name, type, county, region,
         principal_authority, source

Source tiers (used downstream by publish.py):
  - "excel"     : in the Excel database (has contact baseline)
  - "ons_only"  : only in the ONS parish register (no contact baseline)

Slug strategy:
  - Excel councils keep their existing slug (matches what's shipped today).
  - ONS-only parishes get a fresh slug = slugify(ons_name). To avoid collisions
    with Excel slugs, we always append "-parish" if that doesn't already match.
"""
from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

import openpyxl

REPO = Path(__file__).resolve().parents[1]
EXCEL = REPO / "Council_ClearSight_16.04.26.xlsx"
ONS = REPO / "Parishes_(April_2025)_Names_and_Codes_in_EW_v2.csv"
OUT_DIR = REPO / "publish_v2" / "data"
OUT = OUT_DIR / "canonical.csv"


def slugify(s: str) -> str:
    s = (s or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


# Map from LAD25CD prefix → English region. ONS doesn't carry region directly,
# so we infer it from the principal authority's GSS code prefix.
# (Heuristic — covers the Common Cases; refined later by joining to Excel rows.)
def infer_region_from_lad(lad_code: str, lad_name: str) -> str:
    # Most ONS rows are pre-2023 districts; there's no clean prefix→region map.
    # We'll fall back to "Unknown" and rely on the Excel join (where present).
    return "Unknown"


def load_excel():
    wb = openpyxl.load_workbook(EXCEL, read_only=True, data_only=True)
    ws = wb["All Councils"]
    header = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    rows = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0] is None:
            continue
        d = dict(zip(header, row))
        rows.append(d)
    return rows


def load_ons():
    rows = []
    with ONS.open(encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if not r["PAR25CD"].startswith("E04"):
                continue  # English parishes only for launch
            rows.append({
                "ons_code": r["PAR25CD"],
                "name": r["PAR25NM"],
                "lad_code": r["LAD25CD"],
                "lad_name": r["LAD25NM"],
            })
    return rows


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    excel_rows = load_excel()
    ons_rows = load_ons()
    print(f"Excel rows: {len(excel_rows)}")
    print(f"ONS English parishes: {len(ons_rows)}")

    # Build a lookup of Excel rows by various slug candidates so we can match
    # ONS rows to existing Excel councils where the same place appears.
    excel_by_slug = {}
    excel_slugs_lookup = {}  # variant → canonical excel slug
    for er in excel_rows:
        slug = er.get("Slug")
        if not slug:
            continue
        excel_by_slug[slug] = er
        excel_slugs_lookup[slug] = slug
        # Also index by base name (slug without -parish-council, etc.)
        for suffix in ["-parish-council", "-town-council", "-community-council",
                       "-parish-meeting", "-city-council"]:
            if slug.endswith(suffix):
                base = slug[: -len(suffix)]
                excel_slugs_lookup.setdefault(base, slug)
                break

    # First emit Excel rows (preserve existing slugs and IDs)
    canonical = []
    seen_slugs = set()
    for er in excel_rows:
        slug = er.get("Slug")
        if not slug or slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        canonical.append({
            "council_id": er.get("ID"),
            "ons_code": "",  # filled in below if matched
            "slug": slug,
            "name": er.get("Council Name"),
            "type": er.get("Type") or "parish",
            "county": er.get("County") or "",
            "region": er.get("Region") or "",
            "principal_authority": er.get("District") or "",
            "source": "excel",
        })

    # Now add ONS rows that aren't already present in Excel
    matched_to_excel = 0
    ons_only_added = 0
    for orow in ons_rows:
        base = slugify(orow["name"])
        # Try common slug variants to find an existing Excel match
        candidate_slugs = [
            f"{base}-parish-council",
            f"{base}-town-council",
            f"{base}-community-council",
            f"{base}-parish-meeting",
            f"{base}-city-council",
            base,  # bare slug
        ]
        match = None
        for c in candidate_slugs:
            if c in excel_by_slug:
                match = c
                break
        if match:
            # Annotate the existing canonical row with the ONS code
            for cr in canonical:
                if cr["slug"] == match:
                    cr["ons_code"] = orow["ons_code"]
                    cr["principal_authority"] = (
                        cr["principal_authority"] or orow["lad_name"]
                    )
                    break
            matched_to_excel += 1
        else:
            # ONS-only — emit a fresh row
            slug = f"{base}-parish"
            # Avoid collision with any Excel slug
            n = 2
            while slug in seen_slugs:
                slug = f"{base}-parish-{n}"
                n += 1
            seen_slugs.add(slug)
            canonical.append({
                "council_id": "",  # no Council ClearSight ID yet
                "ons_code": orow["ons_code"],
                "slug": slug,
                "name": orow["name"],
                "type": "parish",  # ONS register is parishes
                "county": "",
                "region": "",
                "principal_authority": orow["lad_name"],
                "source": "ons_only",
            })
            ons_only_added += 1

    print(f"\nMatched ONS to existing Excel: {matched_to_excel}")
    print(f"ONS-only added to canonical:    {ons_only_added}")
    print(f"Total canonical rows:           {len(canonical)}")

    # Sort: Excel first (by slug), then ONS-only (by slug)
    canonical.sort(key=lambda r: (0 if r["source"] == "excel" else 1, r["slug"]))

    fields = ["council_id", "ons_code", "slug", "name", "type", "county",
              "region", "principal_authority", "source"]
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in canonical:
            w.writerow(r)
    print(f"\nWrote {OUT.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
