"""publish_v2/run_full_audit.py - end-to-end audit pipeline (concurrent).

Single sync orchestrator with worker pool. Resumable. Polite per-host.
See run_full_audit.ps1 for CLI flags.
"""
from __future__ import annotations

import argparse
import csv
import sys
import threading
import time
import traceback
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO))

from publish_v2 import discover  # noqa: E402
from publish_v2 import scrape_lite  # noqa: E402

CANONICAL = REPO / "publish_v2" / "data" / "canonical.csv"
V2_RESULTS = REPO / "scraper" / "data" / "scrape_results_enriched.csv"
PROGRESS = REPO / "publish_v2" / "data" / "coverage_progress.csv"
MANUAL_SEEDS = REPO / "publish_v2" / "data" / "manual_seeds.csv"

PROGRESS_FIELDS = [
    "slug", "name", "audit_status", "url", "discovery_method",
    "scrape_status", "indicators_evidence_found_count", "error", "attempted_at",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load_canonical():
    with CANONICAL.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_existing_v2():
    if not V2_RESULTS.exists():
        return {}
    out = {}
    with V2_RESULTS.open(newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r.get("scrape_status") == "ok":
                out[r["slug"]] = r
    return out


def load_excel_contacts():
    excel = REPO / "Council_ClearSight_16.04.26.xlsx"
    if not excel.exists():
        return {}
    import openpyxl
    wb = openpyxl.load_workbook(excel, read_only=True, data_only=True)
    ws = wb["All Councils"]
    header = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    out = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0] is None:
            continue
        d = dict(zip(header, row))
        slug = d.get("Slug")
        if not slug:
            continue
        out[slug] = {
            "url": (d.get("Website URL") or "").strip(),
            "email": (d.get("Email") or "").strip(),
            "phone": str(d.get("Phone") or "").strip(),
            "clerk_email": (d.get("Clerk Email") or "").strip(),
            "clerk_name": (d.get("Clerk Name") or "").strip(),
        }
    return out


def load_progress():
    out = {}
    if not PROGRESS.exists() or PROGRESS.stat().st_size == 0:
        return out
    try:
        with PROGRESS.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            if not reader.fieldnames or "slug" not in reader.fieldnames:
                print("  warn: coverage_progress.csv has no 'slug' column; "
                      "ignoring", file=sys.stderr)
                return out
            for r in reader:
                slug = (r.get("slug") or "").strip()
                if slug:
                    out[slug] = r
    except (csv.Error, UnicodeDecodeError, OSError) as e:
        print(f"  warn: coverage_progress.csv unreadable ({e}); ignoring",
              file=sys.stderr)
    return out


_progress_lock = threading.Lock()
_enriched_lock = threading.Lock()


def append_progress(row):
    PROGRESS.parent.mkdir(parents=True, exist_ok=True)
    with _progress_lock:
        needs_header = (not PROGRESS.exists()) or PROGRESS.stat().st_size == 0
        for attempt in range(5):
            try:
                with PROGRESS.open("a", newline="", encoding="utf-8") as f:
                    w = csv.DictWriter(f, fieldnames=PROGRESS_FIELDS)
                    if needs_header:
                        w.writeheader()
                    w.writerow({k: row.get(k, "") for k in PROGRESS_FIELDS})
                return
            except PermissionError:
                time.sleep(0.5 + attempt)


def append_enriched_row(row, header):
    with _enriched_lock:
        new_file = not V2_RESULTS.exists()
        V2_RESULTS.parent.mkdir(parents=True, exist_ok=True)
        for attempt in range(5):
            try:
                with V2_RESULTS.open("a", newline="", encoding="utf-8") as f:
                    w = csv.DictWriter(f, fieldnames=header,
                                       extrasaction="ignore")
                    if new_file:
                        w.writeheader()
                    w.writerow(row)
                return
            except PermissionError:
                time.sleep(0.5 + attempt)


_enriched_header = []


def get_or_init_enriched_header(sample_row):
    global _enriched_header
    if _enriched_header:
        return _enriched_header
    with _enriched_lock:
        if _enriched_header:
            return _enriched_header
        if V2_RESULTS.exists() and V2_RESULTS.stat().st_size > 0:
            with V2_RESULTS.open(encoding="utf-8") as f:
                _enriched_header = next(csv.reader(f))
        else:
            _enriched_header = list(sample_row.keys())
    return _enriched_header


def process_one(canonical_row, existing_v2, excel_contacts, manual_seeds,
                disc_session, gate, scrape_session, fast=False,
                discover_only=False, no_discover=False):
    slug = canonical_row["slug"]
    name = canonical_row["name"]
    out = {"slug": slug, "name": name, "audit_status": "pending",
           "url": "", "discovery_method": "", "scrape_status": "",
           "indicators_evidence_found_count": "", "error": "",
           "attempted_at": now_iso()}

    if slug in existing_v2:
        prev = existing_v2[slug]
        out["audit_status"] = "verified"
        out["url"] = prev.get("website_url", "")
        out["discovery_method"] = "pre-existing"
        out["scrape_status"] = "ok"
        out["indicators_evidence_found_count"] = prev.get(
            "indicators_evidence_found_count", "")
        return out

    excel = excel_contacts.get(slug, {})
    url = excel.get("url", "")
    method = "excel" if url else ""

    if not url and not no_discover:
        try:
            res = discover.discover(slug, name, disc_session,
                                    manual_seeds=manual_seeds,
                                    pause_between=0.3 if fast else 1.0)
        except Exception as e:
            out["audit_status"] = "discovery_error"
            out["error"] = f"{type(e).__name__}: {e}"
            return out
        if res:
            url = res.url
            method = res.method

    if not url:
        out["audit_status"] = "no_web_presence_found"
        return out

    out["url"] = url
    out["discovery_method"] = method or "unknown"

    if discover_only:
        out["audit_status"] = "url_discovered_pending_scrape"
        return out

    try:
        scraped = scrape_lite.scrape_council(
            slug=slug, name=name, url=url,
            council_id=canonical_row.get("council_id") or "",
            contact_email=excel.get("email", ""),
            clerk_email=excel.get("clerk_email", ""),
            phone=excel.get("phone", ""),
            gate=gate, session=scrape_session, fast=fast,
        )
    except Exception as e:
        out["audit_status"] = "scrape_error"
        out["error"] = f"{type(e).__name__}: {e}"
        return out

    out["scrape_status"] = scraped.get("scrape_status") or ""
    out["indicators_evidence_found_count"] = scraped.get(
        "indicators_evidence_found_count") or ""
    out["error"] = scraped.get("error") or ""

    try:
        header = get_or_init_enriched_header(scraped)
        append_enriched_row(scraped, header)
    except Exception as e:
        print(f"  warn: enriched-CSV append failed for {slug}: {e}",
              file=sys.stderr)

    if out["scrape_status"] == "ok":
        out["audit_status"] = "verified"
    elif out["scrape_status"] == "robots-disallow":
        out["audit_status"] = "blocked_by_robots"
    elif "unreach" in (out["scrape_status"] or "").lower():
        out["audit_status"] = "url_unreachable"
    else:
        out["audit_status"] = "scrape_failed"
    return out


# Thread-local storage for per-worker sessions
_tls = threading.local()


def get_tls_sessions():
    if not hasattr(_tls, "disc"):
        _tls.disc = discover.make_session()
        _tls.scrape = scrape_lite.make_session()
    return _tls.disc, _tls.scrape


def worker(canonical_row, existing_v2, excel_contacts, manual_seeds, gate,
           fast, discover_only, no_discover):
    try:
        disc, scrape = get_tls_sessions()
        return process_one(canonical_row, existing_v2, excel_contacts,
                           manual_seeds, disc, gate, scrape, fast=fast,
                           discover_only=discover_only,
                           no_discover=no_discover)
    except Exception as e:
        traceback.print_exc()
        return {"slug": canonical_row.get("slug", ""),
                "name": canonical_row.get("name", ""),
                "audit_status": "fatal_error", "url": "",
                "discovery_method": "", "scrape_status": "",
                "indicators_evidence_found_count": "",
                "error": f"uncaught: {type(e).__name__}: {e}",
                "attempted_at": now_iso()}


def main():
    p = argparse.ArgumentParser(
        description="End-to-end Council ClearSight audit pipeline (concurrent)")
    p.add_argument("--limit", type=int, default=0)
    p.add_argument("--rescan", action="store_true")
    p.add_argument("--discover-only", action="store_true")
    p.add_argument("--no-discover", action="store_true")
    p.add_argument("--skip-publish", action="store_true")
    p.add_argument("--filter-source", choices=["excel", "ons_only"], default=None)
    p.add_argument("--workers", type=int, default=8,
                   help="Concurrent workers (default 8). 1=serial. Max recommended 32.")
    p.add_argument("--fast", action="store_true",
                   help="Skip SSL probe and per-PDF HEAD requests for speed")
    args = p.parse_args()

    print("=" * 60)
    print(" Council ClearSight - end-to-end audit pipeline")
    print("=" * 60)
    print(f" Started: {now_iso()}")
    print(f" Workers: {args.workers}    Fast mode: {args.fast}")
    print()

    canonical = load_canonical()
    print(f"Loaded canonical list: {len(canonical)} councils")
    if args.filter_source:
        canonical = [r for r in canonical
                     if r.get("source") == args.filter_source]
        print(f"Filtered to source={args.filter_source}: {len(canonical)}")

    existing_v2 = load_existing_v2()
    print(f"Loaded existing v2 results (ok status): {len(existing_v2)}")
    excel_contacts = load_excel_contacts()
    print(f"Loaded Excel contacts: {len(excel_contacts)}")
    manual_seeds = discover.load_manual_seeds(MANUAL_SEEDS)
    print(f"Loaded manual seeds: {len(manual_seeds)}")

    progress = {} if args.rescan else load_progress()
    if progress:
        print(f"Resuming - {len(progress)} councils already processed")
    if args.rescan and PROGRESS.exists():
        try:
            PROGRESS.unlink()
        except PermissionError:
            print("  warn: cannot unlink locked progress file", file=sys.stderr)

    gate = scrape_lite.PoliteGate()

    todo = [r for r in canonical if r["slug"] not in progress]
    if args.limit:
        todo = todo[:args.limit]
    print(f"To process: {len(todo)}")
    print()

    counts = defaultdict(int)
    started = time.time()

    if args.workers <= 1:
        # Serial path - keeps a simple code path for debugging
        for i, row in enumerate(todo, 1):
            try:
                result = worker(row, existing_v2, excel_contacts,
                                manual_seeds, gate, args.fast,
                                args.discover_only, args.no_discover)
            except KeyboardInterrupt:
                print("\nInterrupted. Progress saved.")
                return 130
            counts[result["audit_status"]] += 1
            append_progress(result)
            if i % 25 == 0 or i == len(todo):
                _print_progress(i, len(todo), counts, started)
    else:
        # Concurrent path
        try:
            with ThreadPoolExecutor(max_workers=args.workers) as ex:
                futures = {ex.submit(worker, row, existing_v2, excel_contacts,
                                     manual_seeds, gate, args.fast,
                                     args.discover_only, args.no_discover): row
                           for row in todo}
                done = 0
                for fut in as_completed(futures):
                    result = fut.result()
                    counts[result["audit_status"]] += 1
                    append_progress(result)
                    done += 1
                    if done % 25 == 0 or done == len(todo):
                        _print_progress(done, len(todo), counts, started)
        except KeyboardInterrupt:
            print("\nInterrupted. Progress saved (in-flight workers may still be writing).")
            return 130

    print()
    print("=" * 60)
    print(" Audit run complete")
    print("=" * 60)
    print(f" Finished: {now_iso()}")
    print(" Counts:")
    for status, n in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"   {status:30s} {n:>6}")
    print()

    if not args.skip_publish:
        print("Running publish_v2/publish.py to regenerate per-slug JSONs...")
        import subprocess
        try:
            subprocess.run(
                [sys.executable, str(REPO / "publish_v2" / "publish.py")],
                check=True, cwd=REPO)
        except subprocess.CalledProcessError as e:
            print(f"  publish failed: {e}")
            return 1
        print("Publish complete.")
    return 0


def _print_progress(done, total, counts, started):
    elapsed = time.time() - started
    rate = done / elapsed if elapsed > 0 else 0
    eta = (total - done) / rate if rate > 0 else 0
    verified = counts.get("verified", 0)
    print(f"  [{done:>5}/{total}] verified={verified}  rate={rate:.2f}/s  "
          f"eta={eta/60:.1f}m  counts={dict(counts)}")


if __name__ == "__main__":
    sys.exit(main())
