"""Stage 3 driver: run all 12 detectors against each council's cached corpus.

For each confirmed URL:
  1. Build a CouncilCorpus from the SQLite cache (HTML pages + PDFs).
  2. Run every detector function in detectors/ALL_DETECTORS.
  3. Write data/detections/{slug}.json with the full evidence record.

Detector results are sandboxed — a crash in one detector doesn't block others.
Audit log records every detector outcome for replay.
"""
from __future__ import annotations
import argparse
import asyncio
import json
from dataclasses import asdict
from pathlib import Path
from typing import List

import structlog

from ..core.config import load_config
from ..core.audit import setup_logging, get_logger
from .corpus import CouncilCorpus, DetectorResult
from .detectors import ALL_DETECTORS


async def detect_one(slug: str, homepage: str, cache_path: str, log) -> dict:
    """Run all detectors against one council's corpus. Returns serialisable dict."""
    corpus = await CouncilCorpus.load(cache_path, slug, homepage)
    results: dict[str, dict] = {}
    for ind_id, detector in ALL_DETECTORS.items():
        try:
            r = await detector(corpus)
            results[ind_id] = asdict(r)
        except Exception as e:
            log.error("detector.crashed", slug=slug, indicator=ind_id, error=str(e))
            results[ind_id] = asdict(DetectorResult(
                indicator_id=ind_id, found=False,
                evidence_snippet=f"Detector crashed: {e}",
                notes="Detector raised an exception; treated as not-found.",
            ))
    return {
        "slug": slug,
        "homepage": homepage,
        "docs_in_corpus": len(corpus.docs),
        "indicators": results,
    }


async def run(urls_path: str, out_dir: str, *, max_concurrency: int = 30, only_slug: str | None = None):
    setup_logging("scraper_v3/data/stage3.jsonl")
    log = get_logger("stage3")
    cfg = load_config("scraper_v3/config.yaml")

    with open(urls_path) as f:
        resolved = json.load(f)

    confirmed = [r for r in resolved if r.get("url")
                 and r.get("confidence", 0) >= cfg.discovery.min_confidence_to_accept]
    if only_slug:
        confirmed = [r for r in confirmed if r["slug"] == only_slug]
    log.info("stage3.start", total=len(confirmed))

    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    sem = asyncio.Semaphore(max_concurrency)

    async def worker(row):
        async with sem:
            return await detect_one(row["slug"], row["url"], cfg.cache.path, log)

    tasks = [asyncio.create_task(worker(r)) for r in confirmed]
    done = 0
    for t in asyncio.as_completed(tasks):
        result = await t
        with open(out_path / f"{result['slug']}.json", "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        done += 1
        if done % 100 == 0:
            log.info("stage3.progress", done=done, total=len(confirmed))

    log.info("stage3.complete", total=done)


def main():
    p = argparse.ArgumentParser(description="Stage 3: indicator detection")
    p.add_argument("--urls", default="scraper_v3/data/urls_resolved.json")
    p.add_argument("--out", default="scraper_v3/data/detections")
    p.add_argument("--max-concurrency", type=int, default=30)
    p.add_argument("--only", default=None)
    args = p.parse_args()
    asyncio.run(run(args.urls, args.out, max_concurrency=args.max_concurrency, only_slug=args.only))


if __name__ == "__main__":
    main()
