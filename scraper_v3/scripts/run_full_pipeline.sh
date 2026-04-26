#!/usr/bin/env bash
# scraper_v3 — full pipeline runner.
# All four stages with sensible concurrency. Resumable; re-run after a crash.

set -euo pipefail

cd "$(dirname "$0")/../.."

XLSX="${XLSX:-uploads/Council_ClearSight_16.04.26.xlsx}"

echo "── Stage 0 — extract council list ──"
python -m scraper_v3.scripts.extract_council_list \
    --xlsx "$XLSX" \
    --out scraper_v3/data/councils.csv

echo "── Stage 1 — URL discovery (~2-4 hours) ──"
python -m scraper_v3.stage1_discovery.runner \
    --councils scraper_v3/data/councils.csv \
    --out scraper_v3/data/urls_resolved.json \
    --max-concurrency 50

echo "── Stage 2 — polite crawl (~24-48 hours) ──"
python -m scraper_v3.stage2_crawl.runner \
    --urls scraper_v3/data/urls_resolved.json \
    --out scraper_v3/data/crawl_log.json \
    --max-concurrency 50

echo "── Stage 3 — indicator detection (~6-12 hours) ──"
python -m scraper_v3.stage3_detect.runner \
    --urls scraper_v3/data/urls_resolved.json \
    --out scraper_v3/data/detections \
    --max-concurrency 30

echo "── Stage 4 — publish to website ──"
python -m scraper_v3.stage4_publish.runner \
    --detections scraper_v3/data/detections \
    --councils scraper_v3/data/councils.csv \
    --output client/public/data

echo "── Done ──"
