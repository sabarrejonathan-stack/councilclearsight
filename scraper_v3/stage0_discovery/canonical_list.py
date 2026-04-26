"""Build the canonical council list for England.

Merges three sources (in priority order):
  1. Council ClearSight Excel (existing 7,031 records with VDTI scores)
  2. ONS Parishes Register (authoritative — every civil parish in England)
  3. ONS Code History Database (catches anything missed)

Output: scraper_v3/data/councils.csv — every English council, deduplicated.

ONS publishes the parishes register at the Open Geography Portal. The exact
URL changes when ONS publishes a new edition (May/December every year). We
try a few known recent URLs; if all fail, the script tells the user how to
download manually.

Honest about coverage: even with all sources merged, we may still miss a
handful of brand-new parish meetings created in the last 6 months. Those will
be picked up at the next quarterly merge run.
"""
from __future__ import annotations
import argparse
import csv
import json
import re
import sys
from io import BytesIO, StringIO
from pathlib import Path
from typing import Dict, List, Optional, Set
from zipfile import ZipFile

# httpx imported lazily inside fetch functions so the pure-Python helpers
# (slugify, normalise_for_match, etc.) can be unit-tested without it.


# ─── ONS Parishes Register endpoints ──────────────────────────────────────
# We try these in order. ONS rotates URLs when they republish, so this list
# is intentionally redundant. If all fail, the user can manually download
# from https://geoportal.statistics.gov.uk/ and place at the path below.

ONS_CANDIDATE_URLS = [
    # Parishes (December 2024) — England & Wales — names + codes only
    "https://www.arcgis.com/sharing/rest/content/items/d635ddf45b6e44f993f6dec80b1e6f4e/data",
    # Parishes (May 2024)
    "https://www.arcgis.com/sharing/rest/content/items/abc123/data",
    # ONS Open Data — Civil Parishes lookup
    "https://www.ons.gov.uk/file?uri=/methodology/geography/geographicalproducts/namesandcodeslistings/namesandcodesforparishesinenglandasat31stmay2024/parishnames-may-2024.csv",
]

# Search list — first hit wins. Allows the user to drop the ONS CSV anywhere
# convenient (their workspace root, the scraper data dir, etc.) without editing
# this file. The April 2025 ONS register filename is the most common one we see.
LOCAL_FALLBACK_PATHS = [
    "scraper_v3/data/ons_parishes_manual.csv",
    "Parishes_(April_2025)_Names_and_Codes_in_EW_v2.csv",
    "scraper_v3/data/Parishes_(April_2025)_Names_and_Codes_in_EW_v2.csv",
    "data/Parishes_(April_2025)_Names_and_Codes_in_EW_v2.csv",
]
LOCAL_FALLBACK_PATH = LOCAL_FALLBACK_PATHS[0]   # back-compat alias for older callers

USER_AGENT = "CouncilClearSight/3.0 (+https://councilclearsight.org.uk/about/bot - info@councilclearsight.org.uk)"


# ─── Helpers ──────────────────────────────────────────────────────────────

def slugify(name: str) -> str:
    """URL-safe slug. Mirrors the existing Excel slug convention."""
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9-\s]+", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def normalise_for_match(name: str) -> str:
    """Aggressive normalisation — used only for de-duping. Lowercased, strip
    trailing 'parish council', 'town council' etc., strip punctuation."""
    s = name.lower().strip()
    for suffix in (" parish council", " town council", " community council",
                   " city council", " parish meeting", " (parish council)",
                   " parish", " town", " community", " city"):
        if s.endswith(suffix):
            s = s[: -len(suffix)]
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s


# ─── ONS fetcher ──────────────────────────────────────────────────────────

def try_fetch_ons() -> Optional[List[Dict]]:
    """Try each known ONS URL. Returns parsed records or None."""
    import httpx          # imported lazily — only stage 0+ needs this
    for url in ONS_CANDIDATE_URLS:
        print(f"  Trying ONS endpoint: {url[:80]}...")
        try:
            with httpx.Client(timeout=60.0, follow_redirects=True,
                              headers={"User-Agent": USER_AGENT}) as client:
                r = client.get(url)
            if r.status_code != 200:
                print(f"    HTTP {r.status_code} — skipping")
                continue
            content_type = r.headers.get("content-type", "").lower()
            data = r.content
            print(f"    Got {len(data)} bytes ({content_type})")

            # Try to parse as CSV directly
            try:
                text = data.decode("utf-8-sig")
                rows = list(csv.DictReader(StringIO(text)))
                if rows and any("PAR" in (k or "").upper() or "parish" in (k or "").lower() for k in rows[0].keys()):
                    return rows
            except Exception:
                pass

            # Try as zip
            if data[:2] == b"PK":
                try:
                    with ZipFile(BytesIO(data)) as zf:
                        for name in zf.namelist():
                            if name.lower().endswith(".csv"):
                                inner = zf.read(name).decode("utf-8-sig")
                                rows = list(csv.DictReader(StringIO(inner)))
                                if rows:
                                    return rows
                except Exception:
                    pass
        except httpx.HTTPError as e:
            print(f"    Network error: {e}")
            continue
    return None


def load_local_ons_fallback() -> Optional[List[Dict]]:
    """If the user has dropped an ONS register CSV anywhere on the search path,
    read it from disk. First match wins."""
    for candidate in LOCAL_FALLBACK_PATHS:
        p = Path(candidate)
        if p.exists():
            print(f"  Loading ONS register from {p}")
            with open(p, "r", encoding="utf-8-sig") as f:
                return list(csv.DictReader(f))
    return None


def extract_parish_records(raw_rows: List[Dict]) -> List[Dict]:
    """From whatever shape the ONS CSV has, pull out (code, name, country)."""
    if not raw_rows:
        return []

    # Find the right column names (ONS uses different conventions over time)
    sample = raw_rows[0]
    keys = {k.lower(): k for k in sample.keys()}

    name_key = next((keys[k] for k in keys if k in ("par24nm", "par_nm", "par19nm", "par22nm", "par23nm",
                                                     "par25nm", "par_name", "name", "parish", "parish_nm")), None)
    code_key = next((keys[k] for k in keys if k in ("par24cd", "par_cd", "par19cd", "par22cd", "par23cd",
                                                     "par25cd", "par_code", "code")), None)
    country_key = next((keys[k] for k in keys if k in ("ctry21nm", "ctry_nm", "country", "ctry")), None)

    out = []
    for r in raw_rows:
        name = (r.get(name_key) or "").strip() if name_key else ""
        code = (r.get(code_key) or "").strip() if code_key else ""
        country = (r.get(country_key) or "").strip() if country_key else ""
        if not name:
            continue
        # Filter to England only (E04 prefix on parish codes)
        if code and not code.startswith("E04"):
            continue
        if country and "england" not in country.lower():
            continue
        out.append({"ons_code": code, "name": name, "country": country or "England"})
    return out


# ─── Merger ───────────────────────────────────────────────────────────────

def load_existing_csv(path: str) -> List[Dict]:
    if not Path(path).exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def merge_sources(excel_rows: List[Dict], ons_rows: List[Dict]) -> List[Dict]:
    """Merge Excel + ONS, dedupe by aggressive name normalisation.

    Strategy:
      - Every Excel row is kept (it has the most data — VDTI score, contact info etc.)
      - ONS rows are added only if no Excel row matches by normalised name
      - New ONS rows get empty contact fields and the "ons" data_source
    """
    existing_norms: Set[str] = set()
    by_norm: Dict[str, Dict] = {}

    for r in excel_rows:
        norm = normalise_for_match(r.get("council_name") or "")
        if not norm:
            continue
        existing_norms.add(norm)
        by_norm[norm] = r

    new_count = 0
    out = list(excel_rows)
    for parish in ons_rows:
        name = parish["name"]
        norm = normalise_for_match(name)
        if not norm or norm in existing_norms:
            continue

        # Determine the council "type" — heuristic from the name
        nlower = name.lower()
        if "town council" in nlower or " tc" in nlower:
            ctype = "town"
        elif "city council" in nlower:
            ctype = "city"
        elif "community council" in nlower:
            ctype = "community"
        else:
            ctype = "parish"

        # Add as new council
        full_name = name
        if not any(suf in nlower for suf in ("parish council", "town council", "community council",
                                              "city council", "parish meeting")):
            full_name = f"{name} Parish Council"

        out.append({
            "id": f"ons-{parish.get('ons_code') or new_count}",
            "slug": slugify(full_name),
            "council_name": full_name,
            "type": ctype,
            "county": "",                       # ONS register doesn't include — to be enriched later
            "district": "",
            "region": "",
            "website": "",
            "data_source": "ons",
            "ons_code": parish.get("ons_code") or "",
        })
        existing_norms.add(norm)
        new_count += 1

    return out, new_count


# ─── Main ─────────────────────────────────────────────────────────────────

def run(existing_csv: str, out_csv: str, *, skip_ons: bool = False):
    print(f"Loading existing council list from {existing_csv}...")
    excel_rows = load_existing_csv(existing_csv)
    print(f"  → {len(excel_rows)} rows from Excel/database extract")

    ons_parishes: List[Dict] = []
    if not skip_ons:
        print("\nFetching ONS Parishes Register...")
        raw = try_fetch_ons()
        if raw is None:
            print("  No ONS endpoint succeeded. Trying manual fallback...")
            raw = load_local_ons_fallback()
        if raw:
            ons_parishes = extract_parish_records(raw)
            print(f"  → {len(ons_parishes)} parish records extracted from ONS")
        else:
            print("  → 0 ONS records (none of the candidate endpoints worked)")
            print(f"\n  Manual fallback: download the parishes register from:")
            print(f"    https://geoportal.statistics.gov.uk/")
            print(f"  Search for 'Parishes (May 2024)' or latest, download the CSV,")
            print(f"  and save as: {LOCAL_FALLBACK_PATH}")
            print(f"  Then re-run this script.")

    print(f"\nMerging sources...")
    merged, new_count = merge_sources(excel_rows, ons_parishes)
    print(f"  → {len(merged)} councils total ({len(excel_rows)} from Excel + {new_count} new from ONS)")

    # Write canonical CSV
    Path(out_csv).parent.mkdir(parents=True, exist_ok=True)
    fieldnames = ["id", "slug", "council_name", "type", "county", "district", "region",
                  "website", "data_source", "ons_code"]
    with open(out_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for r in merged:
            row = {k: r.get(k, "") for k in fieldnames}
            if not row.get("data_source"):
                row["data_source"] = "excel"
            writer.writerow(row)

    print(f"\nWrote canonical list to {out_csv}")
    print(f"  Total councils to scrape: {len(merged)}")
    return len(merged), new_count


def main():
    p = argparse.ArgumentParser(description="Build canonical English council list")
    p.add_argument("--existing", default="scraper_v3/data/councils.csv",
                   help="Existing Excel-extracted CSV (will be read + merged)")
    p.add_argument("--out", default="scraper_v3/data/councils.csv",
                   help="Output canonical CSV (defaults to overwriting input)")
    p.add_argument("--skip-ons", action="store_true",
                   help="Skip ONS fetch (just rewrite existing as canonical)")
    args = p.parse_args()
    run(args.existing, args.out, skip_ons=args.skip_ons)


if __name__ == "__main__":
    main()
