#!/usr/bin/env bash
# Local test run — scrape 10 councils from wherever `councils_input.csv` is.
set -euo pipefail

cd "$(dirname "$0")/.."
if [ ! -f data/councils_input.csv ]; then
  echo "Create data/councils_input.csv with columns: council_id,slug,name,website_url"
  exit 1
fi
PYTHONPATH=. python -m scraper.runner   --input  data/councils_input.csv   --output data/scrape_results.csv   --verbose   --limit 10
