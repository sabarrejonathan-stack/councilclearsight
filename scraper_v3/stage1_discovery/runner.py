"""Stage 1 driver: discover and validate a working URL for every council.

Order of attempts per council:
    1. Database URL (if present in the source CSV)
    2. Pattern-guessed URLs (top-5 highest-yield variants)
    3. parishcouncils.uk directory lookup  ← long-tail fallback
    4. Search-engine fallback (disabled by default)

Each candidate is validated by a small Range-GET sniff (`validate.py`); the
highest-confidence candidate above the configured threshold wins. The
directory lookup is only invoked when steps 1+2 don't already produce a
high-confidence URL — that keeps the fast path fast and reserves the slower,
rate-limited directory call for the councils that actually need it.

Output: data/urls_resolved.json
        [
          {
            "slug": "...",
            "council_name": "...",
            "url": "https://...",
            "confidence": 0.92,
            "source": "database" | "pattern" | "directory" | "search",
            "candidates_tried": 7
          },
          ...
        ]
"""
from __future__ import annotations
import argparse
import asyncio
import csv
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import List, Optional

import structlog

from ..core.config import load_config
from ..core.audit import setup_logging, get_logger
from .pattern_guess import candidates_for_slug
from .search_engine import search
from .directory_seed import lookup_directory
from .validate import validate_url, ValidationResult


@dataclass
class ResolvedCouncil:
    slug: str
    council_name: str
    url: Optional[str]
    confidence: float
    source: str           # "database" | "pattern" | "search" | "none"
    candidates_tried: int
    notes: str = ""


async def discover_one(
    slug: str,
    council_name: str,
    db_url: Optional[str],
    cfg,
    log,
) -> ResolvedCouncil:
    """Resolve a single council. Returns best URL found above threshold."""
    user_agent = cfg.http.user_agent
    threshold = cfg.discovery.min_confidence_to_accept
    candidates_tried = 0
    best: Optional[ValidationResult] = None
    best_source = "none"

    # 1. Database URL
    if db_url:
        candidates_tried += 1
        v = await validate_url(db_url, council_name, user_agent)
        log.info("validate.candidate", slug=slug, source="database", url=db_url, confidence=v.confidence)
        if v.confidence >= threshold:
            return ResolvedCouncil(slug, council_name, v.resolved_url, v.confidence, "database", candidates_tried)
        if v.confidence > 0:
            best, best_source = v, "database"

    # 2. Pattern guess
    pattern_urls = candidates_for_slug(slug, cfg.discovery.pattern_candidates)
    for url in pattern_urls[:20]:                          # cap to avoid runaway
        candidates_tried += 1
        v = await validate_url(url, council_name, user_agent)
        log.info("validate.candidate", slug=slug, source="pattern", url=url, confidence=v.confidence)
        if v.confidence >= threshold and v.confidence > (best.confidence if best else 0):
            best, best_source = v, "pattern"
            if v.confidence >= 0.85:
                break                                      # very strong match — stop early

    if best and best.confidence >= threshold:
        return ResolvedCouncil(slug, council_name, best.resolved_url, best.confidence, best_source, candidates_tried)

    # 3. parishcouncils.uk directory lookup — only invoked when steps 1+2
    # haven't produced an above-threshold result. Captures councils that don't
    # live on the canonical *-pc.gov.uk pattern (Hugo Fox, 2commune, etc.).
    if getattr(cfg.discovery, "use_directory", True):
        try:
            dir_urls = await lookup_directory(council_name, user_agent)
            for url in dir_urls:
                candidates_tried += 1
                v = await validate_url(url, council_name, user_agent)
                log.info("validate.candidate", slug=slug, source="directory", url=url, confidence=v.confidence)
                if v.confidence >= threshold and v.confidence > (best.confidence if best else 0):
                    best, best_source = v, "directory"
                    if v.confidence >= 0.85:
                        break
        except Exception as e:
            log.warning("directory.failed", slug=slug, error=str(e))

    if best and best.confidence >= threshold:
        return ResolvedCouncil(slug, council_name, best.resolved_url, best.confidence, best_source, candidates_tried)

    # 4. Search-engine fallback — disabled if configured (empty search_engine).
    # In the fast pass we skip DDG entirely; it's slow and rate-limited and
    # only contributed a few hundred extra resolutions in the previous run.
    if cfg.discovery.search_engine and cfg.discovery.search_results_to_score > 0:
        try:
            results = await search(council_name, user_agent, max_results=cfg.discovery.search_results_to_score)
            for r in results:
                candidates_tried += 1
                v = await validate_url(r.url, council_name, user_agent)
                log.info("validate.candidate", slug=slug, source="search", url=r.url, confidence=v.confidence)
                if v.confidence >= threshold and v.confidence > (best.confidence if best else 0):
                    best, best_source = v, "search"
                    if v.confidence >= 0.85:
                        break
        except Exception as e:
            log.warning("search.failed", slug=slug, error=str(e))

    if best and best.confidence >= threshold:
        return ResolvedCouncil(slug, council_name, best.resolved_url, best.confidence, best_source, candidates_tried)

    # No URL found above threshold
    return ResolvedCouncil(
        slug, council_name,
        url=best.resolved_url if best else None,
        confidence=best.confidence if best else 0.0,
        source=best_source,
        candidates_tried=candidates_tried,
        notes=f"Below confidence threshold {threshold}",
    )


async def run(councils_csv: str, out_path: str, *, max_concurrency: int = 50, resume: bool = True):
    setup_logging("scraper_v3/data/stage1.jsonl")
    log = get_logger("stage1")
    cfg = load_config("scraper_v3/config.yaml")

    # Load council list
    rows = []
    with open(councils_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append({
                "slug": r["slug"],
                "council_name": r["council_name"],
                "db_url": r.get("website") or None,
            })
    log.info("stage1.start", total=len(rows))

    # Resume support: load already-resolved
    existing: dict = {}
    if resume and Path(out_path).exists():
        with open(out_path) as f:
            for item in json.load(f):
                if item.get("url") and item.get("confidence", 0) >= cfg.discovery.min_confidence_to_accept:
                    existing[item["slug"]] = item
        log.info("stage1.resume", already_resolved=len(existing))

    # Run with concurrency
    sem = asyncio.Semaphore(max_concurrency)
    results: List[ResolvedCouncil] = []

    async def worker(row):
        if row["slug"] in existing:
            return ResolvedCouncil(**existing[row["slug"]])
        async with sem:
            return await discover_one(row["slug"], row["council_name"], row["db_url"], cfg, log)

    tasks = [asyncio.create_task(worker(r)) for r in rows]
    for i, t in enumerate(asyncio.as_completed(tasks)):
        rc = await t
        results.append(rc)
        if (i + 1) % 50 == 0:
            log.info("stage1.progress", done=i + 1, total=len(rows))
            # Write checkpoint
            Path(out_path).parent.mkdir(parents=True, exist_ok=True)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump([asdict(r) for r in results], f, ensure_ascii=False, indent=2)

    # Final write
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump([asdict(r) for r in results], f, ensure_ascii=False, indent=2)

    resolved_count = sum(1 for r in results if r.url and r.confidence >= cfg.discovery.min_confidence_to_accept)
    log.info("stage1.complete",
             resolved=resolved_count, total=len(rows),
             rate=round(resolved_count / max(1, len(rows)), 3))


def main():
    p = argparse.ArgumentParser(description="Stage 1: URL discovery")
    p.add_argument("--councils", default="scraper_v3/data/councils.csv")
    p.add_argument("--out", default="scraper_v3/data/urls_resolved.json")
    p.add_argument("--max-concurrency", type=int, default=50)
    p.add_argument("--no-resume", action="store_true")
    args = p.parse_args()
    asyncio.run(run(args.councils, args.out, max_concurrency=args.max_concurrency, resume=not args.no_resume))


if __name__ == "__main__":
    main()
