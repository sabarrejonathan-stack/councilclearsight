"""Stage 2 driver: crawl every confirmed URL, store responses in cache."""
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
from ..core.cache import ResponseCache
from ..core.robots import RobotsChecker
from ..core.http import PoliteClient
from .crawler import crawl_council, CrawlResult


async def run(urls_path: str, out_path: str, *, max_concurrency: int = 50, only_slug: str = None):
    setup_logging("scraper_v3/data/stage2.jsonl")
    log = get_logger("stage2")
    cfg = load_config("scraper_v3/config.yaml")

    cache = ResponseCache(cfg.cache.path)
    await cache.init()
    robots = RobotsChecker(cfg.http.user_agent, cfg.robots.cache_ttl_hours)
    client = PoliteClient(cfg.http, cache, robots)

    with open(urls_path) as f:
        resolved = json.load(f)

    confirmed = [r for r in resolved if r.get("url") and r.get("confidence", 0) >= cfg.discovery.min_confidence_to_accept]
    if only_slug:
        confirmed = [r for r in confirmed if r["slug"] == only_slug]
    log.info("stage2.start", total=len(confirmed), max_concurrency=max_concurrency)

    sem = asyncio.Semaphore(max_concurrency)
    results: List[CrawlResult] = []

    async def worker(row):
        async with sem:
            return await crawl_council(
                slug=row["slug"],
                homepage_url=row["url"],
                client=client,
                max_depth=cfg.crawl.max_depth,
                max_pages_per_host=cfg.crawl.max_pages_per_host,
                max_pdf_size_mb=cfg.crawl.max_pdf_size_mb,
                allowed_extensions=cfg.crawl.allowed_extensions,
            )

    tasks = [asyncio.create_task(worker(r)) for r in confirmed]
    for i, t in enumerate(asyncio.as_completed(tasks)):
        cr = await t
        results.append(cr)
        if (i + 1) % 50 == 0:
            log.info("stage2.progress", done=i + 1, total=len(confirmed))
            stats = await cache.stats()
            log.info("stage2.cache_stats", **stats)
            # Write incremental log
            Path(out_path).parent.mkdir(parents=True, exist_ok=True)
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump([asdict(r) for r in results], f, ensure_ascii=False, indent=2)

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump([asdict(r) for r in results], f, ensure_ascii=False, indent=2)

    final_stats = await cache.stats()
    log.info("stage2.complete", total=len(results), **final_stats)


def main():
    p = argparse.ArgumentParser(description="Stage 2: polite crawl")
    p.add_argument("--urls", default="scraper_v3/data/urls_resolved.json")
    p.add_argument("--out", default="scraper_v3/data/crawl_log.json")
    p.add_argument("--max-concurrency", type=int, default=50)
    p.add_argument("--only", default=None, help="Run for a single slug (debug)")
    args = p.parse_args()
    asyncio.run(run(args.urls, args.out, max_concurrency=args.max_concurrency, only_slug=args.only))


if __name__ == "__main__":
    main()
