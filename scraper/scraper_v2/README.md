# scraper_v2 — Comprehensive Council Data Capture

This is the data layer that makes the new Gold/Platinum subscription model defensible. The original scraper (`scraper/`) captured 22 fields per council, which is enough for a basic 14-indicator transparency score. The new product described in the April 2026 Business Model and Pricing Review brief — automated improvement roadmaps, peer benchmarking, LCAS evidence packs, resident summaries — needs roughly 70 fields per council, every one of which has to be defensible if a council, journalist or resident challenges what we publish.

The v2 scraper sits **alongside** the v1 scraper. It uses the same `PoliteFetcher` (3-second per-host gate, robots.txt respected, identifies as `CouncilClearSightBot/1.0`) so councils see no change in scraping behaviour. It just asks more questions of each homepage, and captures more about every document it finds.

## Why this is necessary before launch

The brief (page 7, *Methodology and public scrutiny recommendations*) is explicit: scores will be scrutinised by councils, residents and journalists, so limitations must be prominent and every claim must have evidence standards. The original scraper records "agendas: yes/no". That's not enough. A council that posted its last agenda in 2018 should not score the same as one that posts agendas monthly. A council whose published email bounces should not score the same as one whose email actually reaches the clerk.

Every field captured by v2 is designed so that **nothing on a council's public profile is an assumption**. Every claim is one of:
- An observation we made, with an evidence URL we can link to
- An "Not Assessed" — explicit acknowledgement that we couldn't see it
- A validation result (e.g. "this email's domain doesn't resolve")

## What the script captures

The output is a single CSV (`scrape_results_enriched.csv`), with one row per council and ~70 columns. The columns fall into seven groups.

### 1. Identity (4 columns)

`council_id`, `slug`, `name`, `website_url` — straight pass-through from the existing council database, used as the join key against the scoring engine.

### 2. Run metadata (3 columns)

`scraped_at` (ISO timestamp), `scrape_status` (`ok` | `no-url` | `robots-disallow` | `unreachable (status)` | `runner-error`), `error` (short message if anything failed).

This is what lets us distinguish on the public profile between "we checked and the council doesn't have it" versus "we couldn't check yet". The brief explicitly calls for an "extracted on" date on every council profile (page 8).

### 3. Per-indicator evidence (~28 indicators × 7 columns = 196 columns)

For every transparency document we look for, we record seven pieces of evidence:

| Suffix | What it captures | Why it matters |
|---|---|---|
| `_found` | 0 or 1 — did we observe a matching link? | Drives the binary scoring rule |
| `_evidence_url` | the URL we'd cite on the public profile | The brief calls this "evidence pack" — every claim must link to a public document |
| `_last_modified` | server-reported Last-Modified header (ISO UTC) | A 2018 minutes file should not score the same as a 2026 one. This is the only objective way to know |
| `_inferred_date` | date guessed from the filename or link text | Cross-check against `_last_modified`; when both agree we have very strong evidence |
| `_file_format` | `pdf`, `html`, `docx`, etc. | Some clerks ask "should we publish PDFs?"; some accessibility regulations care about format |
| `_http_status` | the actual HTTP status when we HEAD the evidence URL | A council that lists "minutes" as a link to a 404 page should not score for it |
| `_document_count` | how many distinct matching links exist on the homepage | "12 minutes files" is a stronger signal than "1" |

The 28 indicators we look for break down as follows:

#### a) Existing scoring (5 indicators)
These are already in the v1 scraper, but v2 captures them with the full 7-column evidence dossier described above.

- `accessibility_statement` — required by the Accessibility Regulations 2018
- `agendas` — Local Government Act 1972 Schedule 12
- `minutes` — LGA 1972 Schedule 12
- `agar` — Accounts and Audit Regulations 2015
- `register_of_interests` — Localism Act 2011

#### b) Transparency Code 2015 — additional statutory items (7 indicators)
These are *legally required* publications under the Local Government Transparency Code for Smaller Authorities. The current scoring barely touches them, and they're the strongest defence against any "you invented these requirements" challenge.

- `expenditure_over_100` — TC2015 §3.1
- `end_of_year_accounts` — TC2015 §3.2
- `annual_governance_statement` — TC2015 §3.3 (AGAR Section 1)
- `internal_audit_report` — TC2015 §3.4 (AGAR Section 4)
- `councillor_responsibilities` — TC2015 §3.5
- `asset_register` — TC2015 §3.6
- `dates_of_meetings` — TC2015 §3.7

#### c) LCAS Foundation / Quality criteria (12 indicators)
The Local Council Award Scheme (NALC) doesn't *require* these to be online, but a council pursuing Foundation, Quality or Quality Gold accreditation needs to be able to point to each one. Detecting them from the website is what powers the brief's *"LCAS evidence alignment"* feature in the Gold and Platinum tiers (brief page 4).

- `standing_orders`
- `financial_regulations`
- `risk_assessment`
- `code_of_conduct`
- `complaints_procedure`
- `gdpr_policy`
- `foi_publication_scheme`
- `health_safety_policy`
- `equality_policy`
- `co_option_policy`
- `training_policy`
- `grants_policy`
- `communications_policy`

#### d) Digital engagement signals (4 indicators)
The brief's *"resident-facing summary"* and *"Annual Meeting engagement pack"* features need to know what channels each council actually uses. These four indicators tell us.

- `forward_meeting_calendar` — does the council publish *upcoming* meetings (vs only past minutes)?
- `newsletter` — does the council have a public newsletter?
- `consultation_page` — does the council run public consultations?
- `annual_report` — chair/mayor's annual report (separate from AGAR)

### 4. Social media presence (6 columns)

`social_facebook_url`, `social_twitter_url`, `social_instagram_url`, `social_youtube_url`, `social_linkedin_url`, `social_nextdoor_url`.

We capture only links the council itself publishes on its homepage — never inferred or guessed handles. The brief's resident-survey hub and engagement templates need to know which channels the council uses so the templates can target the right platforms.

### 5. Contact validation (16 columns)

For both the council email and the clerk email, six checks each:

- `_raw` — the address as recorded
- `_format_valid` — passes a robust regex
- `_domain` — the domain part
- `_domain_resolves` — DNS lookup succeeded (we don't test deliverability — that requires SMTP probing which most servers consider abusive)
- `_is_gov_uk` — domain ends in `.gov.uk`
- `_is_generic_clerk` — local part is `clerk@`, `info@`, etc. (informational only; not a scoring penalty)

For phones: `phone_raw`, `phone_format_valid`, `phone_normalised` (E.164), `phone_is_mobile`.

This eliminates a class of false positives in the existing scoring — councils currently get full points for "has a clerk email" even if the email doesn't resolve.

### 6. Website TLS & domain quality (5 columns)

`website_scheme`, `website_is_https`, `website_is_gov_uk`, `website_domain_resolves`, `website_ssl_valid`.

A council whose website serves over plain HTTP, or whose SSL certificate is expired, is one a resident's browser may refuse to display. That's a transparency failure even if the documents are technically present.

### 7. Legacy enrichment from the April 2026 Excel (15 columns)

When `--legacy-xlsx` is supplied, we merge in fields from the April 2026 file (`Council_ClearSight_16.04.26.xlsx`). We were deliberately selective — much of the legacy file is stale or wrong, but a handful of fields are real and worth integrating:

**Trustworthy enrichment (kept as-is):**
- `legacy_district` — geographic enrichment (93% coverage, 6,554 councils). The current scoring data has region but not district. Useful for tighter peer benchmarking.
- `legacy_school_count`, `legacy_school_names`, `legacy_school_websites`, `legacy_school_head_teachers` — pre-mapped school data from a 2026 GIAS / DfE join. Powers the brief's "school engagement map" (Platinum tier) without further scraping.
- Council and clerk contact baselines — the legacy file has stronger contact coverage (59% emails, 40% phones, 31% clerk names) than what's in the v1 results. The v2 runner now falls back to legacy contacts when the v1 results don't have them, then validates them from scratch.

**Stale-but-useful for movement detection (kept only as baseline):**
- `legacy_has_website`, `legacy_has_agendas`, `legacy_has_minutes`, `legacy_has_financials`, `legacy_has_contact_details`, `legacy_has_accessibility_statement` — the older Yes/No audit. Don't trust these as truth (they're a snapshot from before the April 2026 refresh) but they're useful for movement detection.

**Movement deltas (computed from v2 vs legacy):**
- `movement_minutes`, `movement_agendas`, `movement_financials`, `movement_accessibility_statement` — each is `added` / `removed` / `unchanged` / `unknown`. This is exactly the brief's "Peer movement alerts" feature: a council whose legacy says `Has Minutes=Yes` but where v2 finds nothing now is flagged as `removed` — the subscriber dashboard will surface this so the clerk can investigate the broken/moved link.

**What we deliberately discarded from the legacy file:**
- VDTI Score / Pillar 1-4 / VDTI ranks — old methodology, replaced.
- "Chair Name" field — only 203 rows populated, AND the values are semicolon-separated *councillor lists*, not chair names. The field is mislabeled. Skipped entirely.
- Address, Population Band, Precept Band, Meeting Frequency, Chair Email, Councillors Top 3 fields, School Emails, GIAS URNs — all <1% populated. Effectively empty.

### 8. Quality summary (6 columns)

Roll-up metrics computed across all the indicator columns:

- `indicators_assessed_count` — how many extractors ran (always 28 if scrape succeeded)
- `indicators_evidence_found_count` — how many returned `_found = 1`
- `evidence_links_total_count` — sum of `_document_count` across all indicators
- `stale_documents_count` — evidence URLs whose Last-Modified is older than 365 days
- `fresh_documents_count` — evidence URLs whose Last-Modified is within 90 days
- `data_completeness_pct` — found / assessed × 100

These are exactly the numbers the brief's *"Evidence completeness checker"* (page 4, *Automation-led product enhancements*) needs to show in the subscriber dashboard.

## How this maps to the brief

| Feature in the brief (page 4) | v2 columns that power it |
|---|---|
| Full evidence pack (Gold + Platinum) | All 196 indicator columns |
| Improvement roadmap (top 5 / top 12) | `*_found` + `*_last_modified` lets the rules engine surface "missing" and "stale" gaps |
| LCAS evidence alignment | The 13 LCAS indicators + their evidence URLs |
| Peer benchmarking | `data_completeness_pct` + indicator pass rates, joined to council size |
| Resident-facing summary | `data_completeness_pct` + `fresh_documents_count` |
| Score updates (annual / quarterly) | `*_last_modified` lets us detect movement between scrapes |
| Clerk improvement prompts | Indicator gaps + LCAS gaps, fed to the 52-week tip rotation |
| Resident survey templates | `social_*_url` tells us which channels to target |
| Council meeting/AGM pack | `forward_meeting_calendar_*` + `dates_of_meetings_*` |
| Evidence completeness checker | `indicators_evidence_found_count`, `stale_documents_count` |
| Peer movement alerts | Comparing two consecutive enriched CSVs |
| Resident-ready explanation blocks | `data_completeness_pct` band + which indicators failed |

## How to run it

The runner is resume-safe (writes per-row, skips slugs already in the output CSV) and politeness-safe (3-second per-host gate, honours robots.txt). Expect the same ~24 councils/minute throughput as the v1 scraper, so a full 7,031-council run is ~5 hours.

```powershell
cd "C:\Users\jonat\OneDrive\Council Clearsight\CC Website\scraper"
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt   # one-off; pulls pandas + openpyxl
$env:PYTHONPATH = "."

# Place the April 2026 legacy Excel where the runner expects it
# (or pass any path via --legacy-xlsx)
copy "..\Council_ClearSight_16.04.26-628e922f.xlsx" data\legacy.xlsx

# Smoke test (first 10 councils with URLs, with full enrichment)
python -m scraper_v2.runner `
    --identity data\councils_smoke.csv `
    --v1-results data\scrape_results_full.csv `
    --legacy-xlsx data\legacy.xlsx `
    --output data\scrape_enriched_smoke.csv

# Full run
python -m scraper_v2.runner `
    --identity data\councils_input.csv `
    --v1-results data\scrape_results_full.csv `
    --legacy-xlsx data\legacy.xlsx `
    --output data\scrape_results_enriched.csv
```

`--legacy-xlsx` is optional — omit it and the runner produces the same 243-column output as before. Supply it and you get an additional 15 columns (district, school data, legacy snapshots, movement deltas).

If anything fails partway through, just run the same command again — the runner reads the output file and resumes from the next unprocessed slug.

## What this script does NOT do (deliberately)

- **No SMTP probing.** Many servers blacklist hosts that probe inbox existence. We validate format and DNS only.
- **No JavaScript rendering.** The fetcher uses plain `requests`. A small number of councils run SPAs that won't reveal documents to a non-JS scraper. They'll show up as having low data completeness, and will be flagged for manual review.
- **No deep crawling.** We fetch the homepage and read links *from* it; we don't recursively follow links to subpages. Anything buried more than one click deep is invisible. This is deliberate — depth-1 enforces the principle that *transparency means findable, not just published*.
- **No external data joins.** Precept, electorate and population data are required by the brief but come from MHCLG/ONS open datasets, not from scraping. They should be merged in a separate enrichment step before scoring.
- **No screenshot capture.** Not currently needed for scoring. If a future challenge requires visual proof, we can add it.

## Defensibility checklist (what to tell a journalist or aggrieved clerk)

When someone challenges a score, this is what the v2 data lets us answer:

| Question | Where in the data |
|---|---|
| "Where exactly did you find that we don't publish minutes?" | `minutes_evidence_url` if found; if `_found=0`, the absence itself is the evidence |
| "When did you last check?" | `scraped_at` |
| "What link were you using?" | `*_evidence_url` |
| "How old was the document you saw?" | `*_last_modified` and `*_inferred_date` |
| "Did the link actually work?" | `*_http_status` |
| "How many of these documents do we have?" | `*_document_count` |
| "What about our clerk's email?" | `clerk_email_format_valid`, `clerk_email_domain_resolves` |
| "Why don't you have data for this council?" | `scrape_status` (`no-url` / `robots-disallow` / `unreachable`) |

Every challenge is answerable from a single CSV row.

## File map

```
scraper/scraper_v2/
├── __init__.py            # version stub
├── README.md              # this file
├── runner.py              # CLI entry point + per-council orchestrator
├── extractors.py          # 28 indicator extractors + date inference
├── validators.py          # email, phone, URL, TLS validation
└── document_meta.py       # HEAD-based Last-Modified capture
```

Total ≈ 900 lines of Python. No new dependencies beyond what `scraper/requirements.txt` already pins (requests, beautifulsoup4, lxml, urllib3, tenacity).
