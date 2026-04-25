"""scraper_v2.runner — orchestrates the comprehensive council audit.

Pipeline per council
--------------------
1. Read identity from the input CSV (council_id, slug, name, website_url).
2. Skip if no website_url, or if robots.txt forbids us.
3. Fetch the homepage (politely; rate-limited per host; uses the v1
   PoliteFetcher under the hood so the politeness rules are identical).
4. Apply ~30 extractors against the homepage HTML — agendas, minutes,
   AGAR, Transparency Code 2015 items, LCAS docs, social media, etc.
5. For every evidence URL found, HEAD it to capture last-modified +
   content-type + http_status.  This is what makes claims defensible
   under public scrutiny.
6. Validate council and clerk emails (format + domain resolution).
7. Validate phone numbers (UK format).
8. Inspect the website's TLS certificate (HTTPS quality).
9. Write a row of ~70 columns to the enriched CSV; resume safely on rerun.

Run from the scraper directory:

    cd scraper
    .\.venv\Scripts\Activate.ps1
    python -m scraper_v2.runner \
        --identity data/councils_input.csv \
        --v1-results data/scrape_results_full.csv \
        --output data/scrape_results_enriched.csv

If you only want a quick smoke test against ~10 councils:

    python -m scraper_v2.runner \
        --identity data/councils_smoke.csv \
        --v1-results data/scrape_results_full.csv \
        --output data/scrape_enriched_smoke.csv \
        --limit 10
"""
from __future__ import annotations
import argparse
import csv
import logging
import sys
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator
from urllib.parse import urlparse

# Reuse the v1 fetcher so politeness rules (3 s/host, robots.txt, retries)
# are identical to what councils have already seen.
from scraper.fetcher import PoliteFetcher
from bs4 import BeautifulSoup

from .extractors import EXTRACTORS, extract_social_media
from .validators import check_email, check_phone, check_url
from .document_meta import fetch_doc_meta, days_since
from .legacy_loader import LegacyRecord, load as load_legacy, empty_record as empty_legacy

log = logging.getLogger("scraper_v2.runner")


# ─────────────────────────────────────────────────────────────────────
# Output schema — every column is documented in the README.
#
# The order matters because we write headers from this list and
# resume-logic reads back from the same file.  Adding a column is fine;
# changing names mid-run breaks the resume logic.
# ─────────────────────────────────────────────────────────────────────

CORE_COLUMNS = [
    "council_id", "slug", "name", "website_url",
    "scraped_at", "scrape_status", "error",
]

# For each extractor, we write 7 columns: found, url, last_modified (HTTP),
# inferred_date (filename), file_format, http_status, document_count.
EXTRACTOR_COLUMN_SUFFIXES = [
    "found", "evidence_url", "last_modified",
    "inferred_date", "file_format", "http_status", "document_count",
]

SOCIAL_COLUMNS = [
    "social_facebook_url", "social_twitter_url", "social_instagram_url",
    "social_youtube_url", "social_linkedin_url", "social_nextdoor_url",
]

CONTACT_COLUMNS = [
    # council email
    "council_email_raw", "council_email_format_valid",
    "council_email_domain", "council_email_domain_resolves",
    "council_email_is_gov_uk", "council_email_is_generic_clerk",
    # clerk email
    "clerk_email_raw", "clerk_email_format_valid",
    "clerk_email_domain", "clerk_email_domain_resolves",
    "clerk_email_is_gov_uk", "clerk_email_is_generic_clerk",
    # phone
    "phone_raw", "phone_format_valid", "phone_normalised", "phone_is_mobile",
    # website TLS
    "website_scheme", "website_is_https", "website_is_gov_uk",
    "website_domain_resolves", "website_ssl_valid",
]

QUALITY_COLUMNS = [
    "indicators_assessed_count",
    "indicators_evidence_found_count",
    "evidence_links_total_count",
    "stale_documents_count",      # evidence URLs whose Last-Modified > 365 days ago
    "fresh_documents_count",      # evidence URLs whose Last-Modified < 90 days ago
    "data_completeness_pct",
]

# ─────────────────────────────────────────────────────────────────────
# Legacy-data columns (sourced from Council_ClearSight_16.04.26.xlsx)
#
# District + school data are real and useful as-is.  The legacy_has_*
# flags are stale snapshots — kept so the merge step can detect movement
# (e.g. a council that historically published minutes but no longer does).
# ─────────────────────────────────────────────────────────────────────
LEGACY_COLUMNS = [
    "legacy_district",
    "legacy_school_count",
    "legacy_school_names",         # pipe-joined
    "legacy_school_websites",      # pipe-joined
    "legacy_school_head_teachers", # pipe-joined
    # Has-X snapshot from April 2026 (Yes/No/blank).
    # Use these only as a baseline for movement detection, not as truth.
    "legacy_has_website",
    "legacy_has_agendas",
    "legacy_has_minutes",
    "legacy_has_financials",
    "legacy_has_contact_details",
    "legacy_has_accessibility_statement",
    # Movement deltas: did v2 find something legacy didn't (or vice versa)?
    # These are the columns the subscriber dashboard will use to detect
    # 'document removed' / 'newly published' events.
    "movement_minutes",            # 'added' / 'removed' / 'unchanged' / 'unknown'
    "movement_agendas",
    "movement_financials",
    "movement_accessibility_statement",
]


def make_header(extractor_names: list[str]) -> list[str]:
    cols = list(CORE_COLUMNS)
    for name in extractor_names:
        for suffix in EXTRACTOR_COLUMN_SUFFIXES:
            cols.append(f"{name}_{suffix}")
    cols.extend(SOCIAL_COLUMNS)
    cols.extend(CONTACT_COLUMNS)
    cols.extend(QUALITY_COLUMNS)
    cols.extend(LEGACY_COLUMNS)
    return cols


def _movement(v2_found: int, legacy_flag) -> str:
    """Compute movement label between historical legacy data and v2 result.

    legacy_flag is True / False / None (Yes / No / unknown).
    """
    if legacy_flag is None:
        return "unknown"
    v2_yes = bool(v2_found)
    if v2_yes and not legacy_flag:
        return "added"          # newly published since legacy snapshot
    if not v2_yes and legacy_flag:
        return "removed"        # was published, now not findable
    return "unchanged"


# ─────────────────────────────────────────────────────────────────────
# Resume logic
# ─────────────────────────────────────────────────────────────────────

def already_processed_slugs(out_path: Path) -> set[str]:
    """Re-read the output file (if any) and return the set of slugs already done."""
    if not out_path.exists() or out_path.stat().st_size == 0:
        return set()
    seen: set[str] = set()
    with out_path.open("r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            if row.get("slug"):
                seen.add(row["slug"])
    return seen


# ─────────────────────────────────────────────────────────────────────
# Loading inputs
# ─────────────────────────────────────────────────────────────────────

def load_identity(path: Path) -> Iterator[dict]:
    """Yield a dict per council with at least council_id, slug, name, website_url."""
    with path.open("r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            yield {
                "council_id": row.get("council_id") or row.get("id") or "",
                "slug": row.get("slug") or "",
                "name": row.get("name") or "",
                "website_url": (row.get("website_url") or "").strip(),
            }


def load_v1_contact_data(path: Path) -> dict[str, dict]:
    """Build a slug → {email, clerk_email, phone} index from the v1 results.

    Why: the v1 scraper / contact-database already has the canonical email,
    clerk email and phone.  We don't need to re-discover them; we just
    validate them in v2.  If you don't have a v1 results CSV yet, pass an
    empty path — every contact row will be blank.
    """
    if not path or not path.exists():
        return {}
    out: dict[str, dict] = {}
    with path.open("r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            out[row.get("slug", "")] = {
                "email": row.get("council_email") or "",
                "clerk_email": row.get("clerk_email") or "",
                "phone": row.get("phone") or "",
            }
    return out


# ─────────────────────────────────────────────────────────────────────
# Main per-council processor
# ─────────────────────────────────────────────────────────────────────

def process_council(
    council: dict,
    contact: dict,
    fetcher: PoliteFetcher,
    *,
    legacy: LegacyRecord | None = None,
    fetch_doc_metadata: bool = True,
) -> dict:
    """Run the full extractor + validator suite over one council.

    Returns a flat dict of all output columns (suitable for csv.DictWriter).
    """
    legacy = legacy or empty_legacy()
    row: dict = {col: "" for col in make_header(list(EXTRACTORS.keys()))}
    row["council_id"] = council["council_id"]
    row["slug"] = council["slug"]
    row["name"] = council["name"]
    row["website_url"] = council["website_url"]
    row["scraped_at"] = datetime.now(timezone.utc).isoformat()

    # ── Legacy enrichment (real, non-stale fields from the April 2026 file)
    row.update({
        "legacy_district": legacy.district,
        "legacy_school_count": legacy.school_count,
        "legacy_school_names": "|".join(legacy.school_names),
        "legacy_school_websites": "|".join(legacy.school_websites),
        "legacy_school_head_teachers": "|".join(legacy.school_head_teachers),
        # Stale Has-X snapshot — kept only for movement detection
        "legacy_has_website": "" if legacy.legacy_has_website is None else int(legacy.legacy_has_website),
        "legacy_has_agendas": "" if legacy.legacy_has_agendas is None else int(legacy.legacy_has_agendas),
        "legacy_has_minutes": "" if legacy.legacy_has_minutes is None else int(legacy.legacy_has_minutes),
        "legacy_has_financials": "" if legacy.legacy_has_financials is None else int(legacy.legacy_has_financials),
        "legacy_has_contact_details": "" if legacy.legacy_has_contact_details is None else int(legacy.legacy_has_contact_details),
        "legacy_has_accessibility_statement": "" if legacy.legacy_has_accessibility_statement is None else int(legacy.legacy_has_accessibility_statement),
    })

    # If contact dict is empty (no v1-results CSV available), fall back to
    # the legacy contact data — it's the next best baseline for what to
    # validate.  v2 still re-validates everything from scratch (format,
    # DNS, etc.) so this is safe.
    if not contact.get("email") and legacy.council_email:
        contact["email"] = legacy.council_email
    if not contact.get("clerk_email") and legacy.clerk_email:
        contact["clerk_email"] = legacy.clerk_email
    if not contact.get("phone") and legacy.council_phone:
        contact["phone"] = legacy.council_phone

    # ── 1. URL quality (cheap, even when we won't fetch the page)
    url_check = check_url(council["website_url"])
    row.update({
        "website_scheme": url_check.scheme or "",
        "website_is_https": int(url_check.is_https),
        "website_is_gov_uk": int(url_check.is_gov_uk),
        "website_domain_resolves": int(url_check.domain_resolves),
        "website_ssl_valid": "" if url_check.ssl_valid is None else int(url_check.ssl_valid),
    })

    # ── 2. Validate contact data (independent of the homepage fetch)
    e = check_email(contact.get("email", ""))
    row.update({
        "council_email_raw": e.raw,
        "council_email_format_valid": int(e.format_valid),
        "council_email_domain": e.domain or "",
        "council_email_domain_resolves": int(e.domain_resolves),
        "council_email_is_gov_uk": int(e.is_gov_uk),
        "council_email_is_generic_clerk": int(e.is_generic_clerk),
    })
    ce = check_email(contact.get("clerk_email", ""))
    row.update({
        "clerk_email_raw": ce.raw,
        "clerk_email_format_valid": int(ce.format_valid),
        "clerk_email_domain": ce.domain or "",
        "clerk_email_domain_resolves": int(ce.domain_resolves),
        "clerk_email_is_gov_uk": int(ce.is_gov_uk),
        "clerk_email_is_generic_clerk": int(ce.is_generic_clerk),
    })
    p = check_phone(contact.get("phone", ""))
    row.update({
        "phone_raw": p.raw,
        "phone_format_valid": int(p.format_valid),
        "phone_normalised": p.normalised or "",
        "phone_is_mobile": int(p.is_mobile),
    })

    # ── 3. If no website at all, mark and exit early
    if not council["website_url"]:
        row["scrape_status"] = "no-url"
        row.update(_quality_summary(row))
        return row

    # ── 4. Fetch the homepage
    fr = fetcher.get(council["website_url"])
    if fr.disallowed:
        row["scrape_status"] = "robots-disallow"
        row["error"] = fr.error or ""
        row.update(_quality_summary(row))
        return row
    if fr.status == 0 or fr.status >= 400:
        row["scrape_status"] = f"unreachable ({fr.status})"
        row["error"] = (fr.error or "")[:200]
        row.update(_quality_summary(row))
        return row

    # ── 5. Parse and run all extractors
    try:
        soup = BeautifulSoup(fr.body, "lxml")
    except Exception as e:
        soup = BeautifulSoup(fr.body, "html.parser")

    base_url = fr.final_url

    # Apply each extractor
    for name, fn in EXTRACTORS.items():
        try:
            f = fn(soup, base_url)
        except Exception as e:
            row[f"{name}_found"] = 0
            row[f"{name}_evidence_url"] = ""
            row[f"{name}_last_modified"] = ""
            row[f"{name}_inferred_date"] = ""
            row[f"{name}_file_format"] = ""
            row[f"{name}_http_status"] = ""
            row[f"{name}_document_count"] = 0
            log.warning("extractor %s raised on %s: %s", name, council["slug"], e)
            continue

        row[f"{name}_found"] = int(f.found)
        row[f"{name}_evidence_url"] = f.evidence_url or ""
        row[f"{name}_inferred_date"] = f.inferred_date or ""
        row[f"{name}_file_format"] = f.file_format or ""
        row[f"{name}_document_count"] = f.document_count

        # Optionally: HEAD the evidence URL to grab Last-Modified + status.
        if f.found and f.evidence_url and fetch_doc_metadata:
            meta = fetch_doc_meta(f.evidence_url, fetcher._session)
            row[f"{name}_last_modified"] = meta.last_modified or ""
            row[f"{name}_http_status"] = meta.http_status if meta.http_status else ""
        else:
            row[f"{name}_last_modified"] = ""
            row[f"{name}_http_status"] = ""

    # ── 6. Social media
    social = extract_social_media(soup, base_url)
    for plat in ("facebook", "twitter", "instagram", "youtube", "linkedin", "nextdoor"):
        row[f"social_{plat}_url"] = social.get(plat, "")

    # ── 7. Movement deltas vs the legacy snapshot
    # These columns let the subscriber dashboard surface "newly published"
    # and "removed" events between scrapes — exactly the brief's
    # "Peer movement alerts" feature.
    row["movement_minutes"] = _movement(int(row.get("minutes_found") or 0), legacy.legacy_has_minutes)
    row["movement_agendas"] = _movement(int(row.get("agendas_found") or 0), legacy.legacy_has_agendas)
    row["movement_financials"] = _movement(int(row.get("agar_found") or 0), legacy.legacy_has_financials)
    row["movement_accessibility_statement"] = _movement(
        int(row.get("accessibility_statement_found") or 0),
        legacy.legacy_has_accessibility_statement,
    )

    # ── 8. Quality summary
    row["scrape_status"] = "ok"
    row.update(_quality_summary(row))
    return row


def _quality_summary(row: dict) -> dict:
    """Compute roll-up metrics across the indicator columns."""
    extractor_names = list(EXTRACTORS.keys())
    assessed = 0
    found = 0
    stale = 0
    fresh = 0
    total_links = 0

    for name in extractor_names:
        # We consider an indicator "assessed" if we tried (i.e. we have a
        # row at all — irrelevant of finding).  This will always be True
        # once we've reached this function; kept here for future scenarios
        # like indicator-specific bypass.
        assessed += 1
        if int(row.get(f"{name}_found") or 0):
            found += 1
            total_links += int(row.get(f"{name}_document_count") or 0)
            age = days_since(row.get(f"{name}_last_modified") or "")
            if age is not None:
                if age > 365:
                    stale += 1
                elif age <= 90:
                    fresh += 1
    pct = round(found / assessed * 100, 1) if assessed else 0.0
    return {
        "indicators_assessed_count": assessed,
        "indicators_evidence_found_count": found,
        "evidence_links_total_count": total_links,
        "stale_documents_count": stale,
        "fresh_documents_count": fresh,
        "data_completeness_pct": pct,
    }


# ─────────────────────────────────────────────────────────────────────
# Top-level run loop
# ─────────────────────────────────────────────────────────────────────

def run(
    identity_csv: Path,
    v1_results_csv: Path,
    output_csv: Path,
    *,
    legacy_xlsx: Path | None = None,
    limit: int | None = None,
    fetch_doc_metadata: bool = True,
) -> None:
    contact_lookup = load_v1_contact_data(v1_results_csv)
    log.info("loaded %d contact rows from %s", len(contact_lookup), v1_results_csv)

    legacy_lookup: dict[str, LegacyRecord] = {}
    if legacy_xlsx and legacy_xlsx.exists():
        legacy_lookup = load_legacy(legacy_xlsx)
        log.info("loaded %d legacy records from %s", len(legacy_lookup), legacy_xlsx)
    else:
        log.info("no legacy xlsx supplied; running without enrichment")

    done = already_processed_slugs(output_csv)
    log.info("resuming; %d slugs already in %s", len(done), output_csv)

    # Open output in append mode if resuming, else write header
    new_file = not output_csv.exists() or output_csv.stat().st_size == 0
    out_f = output_csv.open("a", encoding="utf-8", newline="")
    writer = csv.DictWriter(out_f, fieldnames=make_header(list(EXTRACTORS.keys())))
    if new_file:
        writer.writeheader()

    fetcher = PoliteFetcher()
    processed = 0
    started_at = datetime.now(timezone.utc)

    try:
        for council in load_identity(identity_csv):
            if council["slug"] in done:
                continue
            if limit is not None and processed >= limit:
                break
            try:
                row = process_council(
                    council,
                    dict(contact_lookup.get(council["slug"], {})),
                    fetcher,
                    legacy=legacy_lookup.get(council["slug"]),
                    fetch_doc_metadata=fetch_doc_metadata,
                )
                writer.writerow(row)
                out_f.flush()
                processed += 1
                if processed % 25 == 0:
                    elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
                    log.info("%d processed in %.1fs (%.1f/min)",
                             processed, elapsed, processed / elapsed * 60 if elapsed else 0)
            except KeyboardInterrupt:
                log.warning("interrupted by user; partial output saved at %s", output_csv)
                raise
            except Exception as e:
                log.exception("council %s failed: %s", council.get("slug"), e)
                # write a minimal error row so we don't reprocess on resume
                err_row = {col: "" for col in make_header(list(EXTRACTORS.keys()))}
                err_row.update({
                    "council_id": council["council_id"],
                    "slug": council["slug"],
                    "name": council["name"],
                    "website_url": council["website_url"],
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                    "scrape_status": "runner-error",
                    "error": str(e)[:200],
                })
                writer.writerow(err_row)
                out_f.flush()
    finally:
        out_f.close()
        log.info("run complete; processed %d new councils", processed)


# ─────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--identity", required=True, type=Path,
                    help="CSV with council_id, slug, name, website_url (e.g. data/councils_input.csv)")
    ap.add_argument("--v1-results", default=Path("data/scrape_results_full.csv"), type=Path,
                    help="The v1 scraper output, used to read existing contact data (optional)")
    ap.add_argument("--legacy-xlsx", default=None, type=Path,
                    help="The April 2026 legacy Excel (Council_ClearSight_16.04.26.xlsx) for "
                         "district + clerk + school enrichment and movement deltas (optional)")
    ap.add_argument("--output", required=True, type=Path,
                    help="Where to write the enriched CSV")
    ap.add_argument("--limit", type=int, default=None,
                    help="Process at most N new councils (useful for smoke tests)")
    ap.add_argument("--no-doc-metadata", action="store_true",
                    help="Skip HEADing every evidence URL (much faster, less defensible)")
    ap.add_argument("--verbose", "-v", action="store_true")
    args = ap.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    run(
        identity_csv=args.identity,
        v1_results_csv=args.v1_results,
        output_csv=args.output,
        legacy_xlsx=args.legacy_xlsx,
        limit=args.limit,
        fetch_doc_metadata=not args.no_doc_metadata,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
