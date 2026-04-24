# Council ClearSight scraper

Polite, resume-safe scraper that populates the Pillar 3 governance-document
indicators (meeting agendas, minutes, AGAR, register of interests), the
accessibility statement indicator, and (as a bonus) chair/councillor-list
verification for the CC-TI v3 scoring engine.

## What it does

For each council with a known `website_url`, the scraper:

1. **HEAD-checks the URL** — resolves or not.
2. **Parses the homepage** (one request per council).
3. **Looks for an accessibility statement** via any link whose href or text
   contains "accessibility"; if found, fetches the linked page and confirms it
   references WCAG or the 2018 regulations.
4. **Harvests governance links** for agendas, minutes, AGAR and register of
   interests by keyword matching on link text/URL.
5. **Finds the councillors page** (one hop) and extracts:
   - Chair/Mayor name via a conservative regex;
   - Distinct councillor names;
   - Count of `mailto:` links.
6. **Writes one row** to `data/scrape_results.csv` and flushes immediately,
   so killing the script mid-run is safe.

The output CSV is then merged into the scoring engine's input, which regenerates
the per-slug JSON files the website reads.

## Rules of the road (non-negotiable)

- **robots.txt is respected.** Every new host is fetched once for `robots.txt`
  and checked before any request.
- **3-second minimum between requests to the same host.** This is the single
  most important politeness setting; do not lower it.
- **User-Agent is identified** with project name, URL and a contact email.
- **10-second timeout** per request; **3 retries** with exponential backoff
  for transient failures; **no retry** for 4xx (we trust the server's answer).
- **Resume-safe.** The runner skips councils already in the output CSV by slug.

## Directory layout

```
scraper/
  requirements.txt
  scraper/                       ← the Python package
    fetcher.py                   ← polite HTTP client
    runner.py                    ← iterates councils, writes CSV
    main.py                      ← entry point (python -m scraper.main)
    extractors/
      base.py                    ← shared HTML helpers
      accessibility.py
      governance.py              ← agendas / minutes / AGAR / register
      people.py                  ← chair / councillors / emails
  tests/
    fixtures/*.html              ← synthetic pages for offline tests
    test_extractors.py           ← 6 tests, run in <1s, no network
  scripts/
    run_local.sh                 ← 10-council smoke test
    merge_into_scoring.py        ← scrape_results.csv → merged_inputs.csv
    split_scored_json.py         ← councils_scored.json → per-slug files
  .github/workflows/scrape.yml   ← nightly scrape + auto-commit
```

## Step-by-step: first run on your machine

Assumes you've cloned `github.com/sabarrejonathan-stack/councilclearsight`
and are in its root.

### 1. Copy the scraper into the repo

```bash
# From the repo root:
mkdir -p scraper
cp -r /path/to/this/scraper/* scraper/
```

### 2. Install Python dependencies

```bash
cd scraper
python3 -m venv .venv
source .venv/bin/activate      # or `.\.venv\Scripts\Activate.ps1` on Windows
pip install -r requirements.txt
```

### 3. Run the test suite — must pass before scraping

```bash
PYTHONPATH=. python -m unittest discover -s tests -v
# expect: Ran 6 tests in <1s · OK
```

### 4. Build the input CSV

```bash
mkdir -p data
python <<'PY'
import json, csv, os
with open("../client/public/data/directory.json") as f:
    rows = json.load(f)
with open("data/councils_input.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["council_id","slug","name","website_url"])
    for r in rows:
        slug = r.get("slug","")
        wurl = ""
        p = f"../client/public/data/councils/{slug}.json"
        if os.path.exists(p):
            d = json.load(open(p))
            ind11 = next((i for i in d.get("indicators",[]) if i.get("id")=="1.1"), None)
            if ind11:
                wurl = ind11.get("input_snapshot",{}).get("website_url","") or ""
        w.writerow([r.get("id",""), slug, r.get("name",""), wurl])
print("done; row count:")
PY
wc -l data/councils_input.csv
```

### 5. Smoke test — 10 councils

```bash
PYTHONPATH=. python -m scraper.runner   --input  data/councils_input.csv   --output data/scrape_results.csv   --verbose   --limit 10
```

Expect ~30-90 seconds for 10 councils (polite rate limit). Open
`data/scrape_results.csv`. Spot-check 3 rows:
- Does `website_resolves` match reality (open the URL yourself)?
- If `has_agendas=1`, does the `agendas_evidence_url` actually show agendas?
- If `chair_name_scraped` has a value, is it actually the chair?

If the 10 look reasonable, proceed. If not, adjust keyword lists in
`extractors/*.py` and re-run with `--limit 10` (delete `data/scrape_results.csv`
first to force a re-scrape of those 10).

### 6. Full run — overnight

```bash
PYTHONPATH=. python -m scraper.runner   --input  data/councils_input.csv   --output data/scrape_results.csv   --verbose
```

With 7,031 councils and an average ~5 seconds per council (allowing for slow
homepages), expect **~10 hours**. You can Ctrl+C any time; re-running resumes.

### 7. Merge into scoring engine + rebuild data

```bash
python scripts/merge_into_scoring.py
# (This writes data/merged_inputs.csv. You will then need to update
# scoring_engine/build_audit.py to accept this as an override on top of the
# xlsx base — see the NOTE block in merge_into_scoring.py.)

cd ../scoring_engine
python -m unittest test_score.py        # confirm engine still green
python build_audit.py                   # regenerate councils_scored.json

cd ..
python scraper/scripts/split_scored_json.py   # regenerate per-slug files
```

### 8. Deploy the update

```bash
git add client/public/data scoring_engine/ scraper/ data/
git commit -m "scraper: full England sweep, regenerated scores"
git push
```

Netlify auto-builds. Within ~45 seconds the live site shows real Pillar 3
verdicts for every scraped council.

## Promoting to nightly automation

After step 6 works manually, enable the GitHub Action:

```bash
mkdir -p .github/workflows
cp scraper/.github/workflows/scrape.yml .github/workflows/scrape.yml
git add .github && git commit -m "ci: nightly scraper" && git push
```

On GitHub → Actions → "Council scraper" → **Run workflow** (manual first time).
Subsequent nightly runs at 02:00 UTC.

## What the scraper will NOT do

- **No Google searches.** The scraper only follows links a council has published.
  Discovering a council's website for the first time is a separate job (the
  `.gov.uk` probe script in the existing codebase does that).
- **No writes to the DB.** Scraping output goes to a CSV; merge is a deliberate
  manual step until you have reviewed a sample.
- **No PDF parsing yet.** We confirm that an AGAR/minutes link exists and points
  at a PDF; we do NOT parse the PDF content. That's a Phase 2 feature.
- **No fabrication.** If a signal is absent, the indicator is 0. If we could not
  reach the site at all, `governance_scrape_attempted=1` is STILL set — we
  attempted the site and found nothing. That's an honest zero.

## Tuning extractors

If spot-checks show systematic misses, edit the keyword lists in:

- `scraper/extractors/accessibility.py` — the `ACCESSIBILITY_KEYWORDS` list
- `scraper/extractors/governance.py` — four keyword lists for the four doc types
- `scraper/extractors/people.py` — `COUNCILLOR_PAGE_KEYWORDS` and regexes

Re-run the test suite before committing changes. Add a fixture file to
`tests/fixtures/` for any new edge case you discover; tests protect future you.

## Sanity check on volume

- **7,031 councils.**
- **1 homepage fetch + 1 follow-up fetch each** = ~14,000 requests total.
- **3s between requests per host**, but we iterate councils sequentially and
  each is a different host, so wall-clock is dominated by network latency
  (average ~1-2s per fetch).
- Expected runtime: **6-12 hours** on a single worker. Good enough for nightly.

## License

The scraper is part of the Council ClearSight project. Publish as you see fit.
