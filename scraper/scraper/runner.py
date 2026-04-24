"""Council scraper runner.

Input:  a CSV with council_id, slug, name, website_url columns (and whatever else).
Output: scrape_results.csv with the exact columns the scoring engine expects.

Resume-safe: if the output CSV already exists, skips councils whose slug is present.
Atomic: writes each row as it completes, so killing the script mid-run is safe.
"""
from __future__ import annotations
import csv
import logging
import sys
import time
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator

from .fetcher import PoliteFetcher
from .extractors import accessibility, governance, people


log = logging.getLogger("scraper.runner")

# Columns written to scrape_results.csv. Matches (a superset of) what
# scoring_engine/build_audit.py expects as its input row.
OUTPUT_COLUMNS = [
    "council_id", "slug", "name",
    "website_url", "website_resolves",
    "has_accessibility_statement", "accessibility_scrape_attempted", "accessibility_evidence_url",
    "has_agendas",       "agendas_evidence_url",
    "has_minutes",       "minutes_evidence_url",
    "has_financials",    "financials_evidence_url",
    "has_register_of_interests", "register_evidence_url",
    "governance_scrape_attempted",
    "chair_name_scraped",
    "councillors_listed_count", "councillors_email_count",
    "scraped_at", "scrape_status", "error",
]


def _blank_row(council: dict) -> dict:
    row = {k: "" for k in OUTPUT_COLUMNS}
    row["council_id"]       = council.get("council_id", "")
    row["slug"]             = council.get("slug", "")
    row["name"]             = council.get("name", "")
    row["website_url"]      = council.get("website_url", "")
    row["scraped_at"]       = datetime.now(timezone.utc).isoformat()
    return row


def load_processed_slugs(output_path: Path) -> set[str]:
    if not output_path.exists():
        return set()
    seen = set()
    with output_path.open("r", newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r.get("slug"):
                seen.add(r["slug"])
    return seen


def iter_councils(input_path: Path) -> Iterator[dict]:
    with input_path.open("r", newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            yield r


def process_one(fetcher: PoliteFetcher, council: dict) -> dict:
    """Scrape one council. Never raises; always returns a row."""
    row = _blank_row(council)
    url = (council.get("website_url") or "").strip()

    if not url:
        row["scrape_status"] = "no-url"
        row["website_resolves"] = "0"
        return row

    # 1. Website resolves?
    head = fetcher.head(url)
    resolves = 1 if 200 <= head.status < 400 else 0
    row["website_resolves"] = str(resolves)

    if not resolves:
        row["scrape_status"] = f"unreachable ({head.status} {head.error or ''})".strip()
        # We attempted — mark so the scoring engine knows.
        row["accessibility_scrape_attempted"] = "1"
        row["governance_scrape_attempted"]    = "1"
        return row

    # 2. Fetch homepage for extractors.
    home = fetcher.get(head.final_url or url)
    if home.status != 200:
        row["scrape_status"] = f"home-{home.status}"
        row["accessibility_scrape_attempted"] = "1"
        row["governance_scrape_attempted"]    = "1"
        return row

    # 3. Accessibility statement
    try:
        acc = accessibility.extract(home.final_url, home.body, fetcher)
        row["has_accessibility_statement"]    = "1" if acc.found else "0"
        row["accessibility_evidence_url"]     = acc.evidence_url or ""
        row["accessibility_scrape_attempted"] = "1"
    except Exception as e:
        row["error"] = (row["error"] + f"; accessibility: {e}").strip("; ")

    # 4. Governance docs
    try:
        gov = governance.extract_all(home.final_url, home.body)
        row["has_agendas"]                = "1" if gov["agendas"].found else "0"
        row["agendas_evidence_url"]       = gov["agendas"].evidence_url or ""
        row["has_minutes"]                = "1" if gov["minutes"].found else "0"
        row["minutes_evidence_url"]       = gov["minutes"].evidence_url or ""
        row["has_financials"]             = "1" if gov["financials"].found else "0"
        row["financials_evidence_url"]    = gov["financials"].evidence_url or ""
        row["has_register_of_interests"]  = "1" if gov["register"].found else "0"
        row["register_evidence_url"]      = gov["register"].evidence_url or ""
        row["governance_scrape_attempted"]= "1"
    except Exception as e:
        row["error"] = (row["error"] + f"; governance: {e}").strip("; ")

    # 5. People (chair, councillors, emails)
    try:
        pp = people.extract(home.final_url, home.body, fetcher)
        row["chair_name_scraped"]         = pp.chair_name or ""
        row["councillors_listed_count"]   = str(pp.councillors_listed_count)
        row["councillors_email_count"]    = str(pp.councillors_email_count)
    except Exception as e:
        row["error"] = (row["error"] + f"; people: {e}").strip("; ")

    row["scrape_status"] = "ok"
    return row


def run(input_csv: Path, output_csv: Path, limit: int | None = None) -> None:
    fetcher = PoliteFetcher()
    processed = load_processed_slugs(output_csv)
    log.info("resuming with %d already-processed slugs", len(processed))

    # Open output in append mode with header only if file is new.
    mode = "a" if output_csv.exists() else "w"
    with output_csv.open(mode, newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=OUTPUT_COLUMNS)
        if mode == "w":
            w.writeheader()
            fh.flush()

        n = 0
        t0 = time.time()
        for council in iter_councils(input_csv):
            slug = council.get("slug", "").strip()
            if not slug or slug in processed:
                continue
            row = process_one(fetcher, council)
            w.writerow(row)
            fh.flush()
            n += 1
            if n % 25 == 0:
                log.info("progress: %d done in %.1fs (%.2f s/council)", n, time.time() - t0, (time.time() - t0) / n)
            if limit and n >= limit:
                break
        log.info("finished batch of %d in %.1fs", n, time.time() - t0)


def main(argv: list[str]) -> int:
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--input",   required=True, help="Input council CSV (council_id,slug,name,website_url,...)")
    p.add_argument("--output",  required=True, help="Output scrape_results.csv")
    p.add_argument("--limit",   type=int, default=None, help="Max councils this run (omit = all)")
    p.add_argument("--verbose", action="store_true")
    args = p.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
    )
    run(Path(args.input), Path(args.output), args.limit)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
