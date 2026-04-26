# scraper_v3 — first-party evidence pipeline for VDTI v4.0

This is the scraper that supersedes `scraper_v2`. It captures URL-level evidence
for every observable indicator in the VDTI v4.0 methodology so that scores are
reproducible from public web evidence rather than third-party flags.

**Goal**: every score on the website should be grounded in a fetched URL we can
show. No more "Has Agendas = 1" with no link to back it up.

---

## Architecture

Four sequential, checkpointable stages. Any stage can be re-run; each writes its
output to `data/` and reads what previous stages produced.

```
   ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
   │ Stage 1 — Discovery  │ -> │ Stage 2 — Crawl      │ -> │ Stage 3 — Detection  │ -> │ Stage 4 — Publish    │
   │ Find every council's │    │ Polite, async, deep  │    │ 12 detectors run     │    │ Per-slug JSON +      │
   │ working website URL  │    │ HTML+PDF cache build │    │ on cached corpus     │    │ directory + evidence │
   └──────────────────────┘    └──────────────────────┘    └──────────────────────┘    └──────────────────────┘
        ~2-4 hours                  ~24-48 hours                ~6-12 hours                 ~1 hour
```

### Stage 1 — URL Discovery

For each council in `data/councils.csv` (extracted from the April 2026 database):

1. **Validate database URL.** If a URL is on file, run a lightweight HTTP HEAD.
   If 200/301/302 with content-type text/html, accept.
2. **Pattern guess.** If no URL or HEAD failed, try common patterns:
   `https://{slug}-pc.gov.uk`, `https://{slug}-tc.gov.uk`,
   `https://{slug}.gov.uk`, `https://{slug}-parish-council.gov.uk`,
   `https://www.{slug}-pc.org.uk`, `https://{slug}.org.uk`,
   `https://{slug}parishcouncil.co.uk` (and a dozen variants).
3. **Search engines.** As a last resort, query DuckDuckGo Lite (no API key
   needed) with `"{council name}" parish council site:gov.uk OR site:org.uk`
   and score the top results by domain match + title contains "council".
4. **Confidence score.** Each candidate URL gets a confidence score based on
   pattern strength, response code, and content match. Lower-confidence URLs
   are flagged for manual review.

Output: `data/urls_resolved.json` — `{slug, council_name, url, confidence, source}`.

### Stage 2 — Polite Site Crawl

For each confirmed URL:

- **robots.txt** — fetched and cached. We respect `Disallow:` for our
  user-agent. Councils whose robots disallow our crawler are recorded with
  status `robots-disallowed` and Pillar 2/3 indicators are marked
  Not-Assessed in stage 4.
- **User-Agent**:
  `CouncilClearSight/3.0 (+https://councilclearsight.org.uk/about/bot — info@councilclearsight.org.uk)`
- **Rate limit**: 3-second per-host delay (well under the 1-req/sec convention).
- **Concurrency**: 50 hosts in parallel, but at most 1 in-flight request per
  host at any time.
- **Crawl depth**: 3 hops from homepage.
- **Page cap**: 60 pages per host (covers all but the largest town councils).
- **PDF download**: any link ending `.pdf` (or with `application/pdf` content
  type) is downloaded and stored.
- **Cache**: every response (HTML and PDF) is stored in `data/cache.sqlite`
  keyed by `(url, etag, last_modified)`. Re-runs are nearly free thanks to
  conditional `If-None-Match` / `If-Modified-Since` requests.
- **Backoff**: 429/503 trigger exponential backoff (10s, 30s, 90s) before the
  host is parked for the rest of the run.

Output: `data/cache.sqlite` (response cache) + `data/crawl_log.jsonl`
(audit trail of every fetch).

### Stage 3 — Indicator Detection

12 detectors run on the cached corpus per council. Each returns:

```python
DetectorResult(
    indicator_id="2.1",
    found=True,
    confidence=0.95,
    evidence_url="https://example-pc.gov.uk/agendas/2026-03.pdf",
    evidence_snippet="WPC Agenda 11.03.2026",
    document_date=date(2026, 3, 11),
    notes="Most recent agenda; published 12 working days before meeting.",
)
```

Detectors live in `stage3_detect/detectors/`. Each is a single `.py` file with
a function `detect(corpus: CouncilCorpus) -> DetectorResult`. They are
testable in isolation against fixtures.

Detector list (mirrors `lib/scoring.ts:INDICATORS`):

| ID  | Pillar | Detector                                       | Statute                                      |
| --- | ------ | ---------------------------------------------- | -------------------------------------------- |
| 1.1 | 1      | Working website (HTTP 200 OK)                  | LGA 1972 § 96–101                            |
| 1.2 | 1      | Council email published on the website         | Transparency Code 2015 § 2.2                 |
| 1.3 | 1      | Phone number published on the website          | Transparency Code 2015 § 2.2                 |
| 1.4 | 1      | Named clerk identified                         | LGA 1972 § 112                               |
| 2.1 | 2      | Meeting agendas published (recency: <90 days)  | LGA 1972 § 100B                              |
| 2.2 | 2      | Meeting minutes published (recency: <90 days)  | LGA 1972 § 100C                              |
| 3.1 | 3      | AGAR / annual financial statement              | Accounts and Audit Regs 2015 § 10            |
| 3.2 | 3      | Clerk email published                          | Accounts and Audit Regs 2015                 |
| 4.1 | 4      | Chair / Mayor named                            | LGA 1972 § 15                                |
| 4.2 | 4      | At least one councillor identified             | LGA 1972 § 15                                |
| 4.3 | 4      | Accessibility statement published              | Accessibility Regs 2018                      |
| 4.4 | 4      | Secure HTTPS connection                        | UK GDPR Art. 32; NCSC guidance               |

Output: `data/detections/{slug}.json` — full evidence record per council.

### Stage 4 — Score & Publish

Apply binary rules from `lib/scoring.ts:scoreCouncil()` mirror in Python.
Generate the same per-slug JSON shape the website expects, with a parallel
`evidence` block: `{indicator_id: {url, snippet, fetched_at, document_date}}`.

Output: `client/public/data/councils/{slug}.json` (overwrites existing) +
`directory.json` + `councils_scored.json`.

---

## Politeness and ethics

- We are not adversarial. Every council is a public body publishing public
  information; this scraper retrieves only what is already publicly available.
- We respect `robots.txt` even when we'd be entitled to ignore it.
- We rate-limit aggressively — a council's website probably gets <100 visits
  per day; we will not contribute to outages.
- The User-Agent string identifies us and links to a public bot information
  page so any clerk can ask us to back off.
- We email `info@councilclearsight.org.uk` if we receive 403 or 429 from a
  host — there is a human at the other end.

## Re-run cadence

After the initial 48-hour seed run, we re-scrape **monthly**, sharded across
30 nights. With the cache, most pages return 304 Not Modified and the
incremental cost is small. Quarterly subscribers see fresh evidence within
30 days of any change.

## Tech stack

- Python 3.11+
- `httpx` (async HTTP) + `asyncio` for concurrent fetching
- `selectolax` for HTML parsing (faster than BeautifulSoup4)
- `pdfplumber` for PDF text extraction
- `aiosqlite` for response cache
- `pydantic` v2 for typed records
- `structlog` for structured audit logs
- `pytest` + `pytest-asyncio` for tests

## How to run

```bash
# install
cd scraper_v3
pip install -r requirements.txt

# stage 1 — URL discovery (~2-4 hours for 7,031 councils)
python -m scraper_v3.stage1_discovery.runner --councils data/councils.csv

# stage 2 — polite crawl (~24-48 hours)
python -m scraper_v3.stage2_crawl.runner --resume

# stage 3 — indicator detection (~6-12 hours, parallelisable)
python -m scraper_v3.stage3_detect.runner

# stage 4 — publish JSONs to client/public/data/
python -m scraper_v3.stage4_publish.runner
```

Each stage is checkpointable and resumable. Stage 1 can re-run only failed
councils. Stage 2 uses the cache so re-runs of existing councils are near-free.

## Tests

```bash
pytest -v scraper_v3/tests
```

The test suite includes fixtures from real council websites (sanitised) so
detectors can be tested in isolation.
