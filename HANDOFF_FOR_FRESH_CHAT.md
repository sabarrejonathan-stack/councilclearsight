# Council ClearSight - Fresh Chat Handoff

Paste this into a new Claude conversation as the first message.

---

## Who I am and what I'm building

I'm Jonathan, owner of **Council ClearSight** (councilclearsight.org.uk), a public-facing transparency-scoring platform for England's parish/town/community councils. Each council gets a **VDTI v4.0** score (0-100) across 4 equal-weight pillars (25 points each), broken into 12 statute-anchored indicators. Every score is meant to be defensible: each indicator must have an evidence URL pointing to a page or PDF on the council's own domain.

The live site is essentially finished and deployed. I am NOT a developer - you're talking to a non-technical owner.

## Project root

`C:\Users\jonat\OneDrive\Council Clearsight\CC Website` (Windows, OneDrive-synced).

## Repo + deploy facts (verified from the actual config files)

- **GitHub repo**: `sabarrejonathan-stack/councilclearsight` (per `deploy-to-github.ps1` line 21)
- **Hosting**: Netlify, auto-deploys on push to GitHub
- **Domain**: councilclearsight.org.uk
- **Live Netlify subdomain**: not documented in repo files - likely `councilclearsight.netlify.app` but I'll need to confirm if you ask
- **Repo structure**: monorepo. `package.json` at the root; the React app is rooted in `client/` per `vite.config.ts`
- **Package manager**: pnpm `10.4.1` (pinned in `package.json`)
- **Node**: `22` (set in `netlify.toml`)
- **Build command**: `npm run build` -> `vite build`
- **Build output**: `dist/public` (this is what Netlify publishes)
- **Vite root**: `client/`
- **Vite publicDir**: `client/public` (so anything in there ships as static)
- **SPA fallback**: configured in `netlify.toml` (`/*` -> `/index.html`)
- **Cache headers**: `/data/*` cached 1 hour, `/assets/*` cached 1 year (set in `netlify.toml`)
- **Routing**: wouter (client-side)

## Local build/dev commands (per `DEPLOYMENT.md`)

```powershell
cd "C:\Users\jonat\OneDrive\Council Clearsight\CC Website"
npm install            # uses pnpm under the hood via packageManager field
npm run build
npm run start          # localhost:3000
```

Deploy:
```powershell
powershell -File deploy-to-github.ps1
```
That script does git init/add/commit/push to the repo above; Netlify picks up the push and rebuilds.

## What's working and shipped

- All marketing/transparency pages (Home, Pricing, Methodology, ForClerks, FAQ, About, Evidence, How It Works, News)
- Subscriber portal (Dashboard, Reports, Benchmarking, Recommendations, Settings)
- Methodology transparency (Changelog, Disputes queue)
- Brand book, copy, two-tier pricing - all final
- `client/src/lib/scoring.ts` - VDTI v4.0 scoring engine (TypeScript, source of truth)
- 7,031 per-council JSON files at `client/public/data/councils/{slug}.json` (already shipped, but currently from the Excel database, no evidence URLs)
- `client/public/data/directory.json` - 2.1 MB index for the directory page
- `client/public/data/councils_scored.json` - 2.1 MB scored summary
- Woolsington spotlight page - the only fully-evidenced example to use as the target shape

## Existing scraper workflows in the repo

Two scrapers already exist - the fresh chat should be aware of both:

1. **`scraper/`** (older, `scraper_v2`) - has its own README, runs nightly via `.github/workflows/scrape.yml` (cron `0 2 * * *`). Commits results back to `client/public/data/` as user `ccs-scraper-bot`. This currently works in some capacity.
2. **`scraper_v3/`** - my failed rebuild (see "What failed" below). The only piece of `scraper_v3/` worth keeping is `stage0_discovery/canonical_list.py` (merges Excel + ONS register into `councils.csv`).

The fresh chat should look at the GH Actions workflow before designing anything new - duplicating effort is worse than reusing what runs.

## Key data files at the project root

1. **`Council_ClearSight_16.04.26.xlsx`** - 7,031 councils with names, contacts, websites, existing VDTI scores. The shipped dataset.
2. **`Parishes_(April_2025)_Names_and_Codes_in_EW_v2.csv`** - ONS register, 11,338 parishes (10,460 English after E04 filter).
3. **`scraper_v3/data/councils.csv`** - already-merged canonical list (10,946 unique English councils). Output of `scraper_v3/stage0_discovery/canonical_list.py`. This part works; reuse it.
4. **`DEPLOYMENT.md`** - build/deploy/test checklist.
5. **There is no root `README.md`** - if you want one, ask me first.

## What I need help with - the actual problem

For each of the ~10,946 councils in `councils.csv`, capture **the data the scoring system requires** plus the contact data the website displays:

**Website-display fields (must come from the council's own site):**
- Working website URL
- Council email
- Phone
- Named clerk
- Clerk email
- Chair / Mayor name
- At least one named councillor
- Accessibility statement (yes/no)
- HTTPS (derived from URL)

**Document fields (each needs evidence URL + document date):**
- Most recent meeting agenda + date
- Most recent meeting minutes + date
- AGAR / annual financial statement

For each indicator the scoring engine needs `(found: bool, evidence_url, evidence_snippet, document_date, confidence)`. The output shape per council is documented in **`scraper_v3/stage4_publish/runner.py`** (the `assemble_council_json` function shows exactly what `client/public/data/councils/{slug}.json` must contain).

## What I need you to do FIRST

**Do not write any code yet.** Read these files in order:

1. `netlify.toml` - deploy config (build command, publish dir, headers)
2. `package.json` (root) - scripts and pnpm version
3. `vite.config.ts` - build root and output
4. `client/src/lib/scoring.ts` - what data the scoring engine consumes
5. `scraper_v3/stage4_publish/runner.py` - the contract for the per-slug JSON output
6. `client/public/data/councils/woolsington.json` - a real worked example
7. `.github/workflows/scrape.yml` - the existing nightly scraper workflow
8. `scraper/README.md` (if it exists) - what the older scraper does
9. `DEPLOYMENT.md` - build/test/deploy checklist
10. `deploy-to-github.ps1` - deploy script
11. First 5 rows of `scraper_v3/data/councils.csv` and `Parishes_(April_2025)_Names_and_Codes_in_EW_v2.csv`

## What I tried and what failed

A previous instance built a multi-stage async Python pipeline (`scraper_v3/stage1_discovery/`, `stage2_crawl/`, `stage3_detect/`, `stage4_publish/`) plus a PowerShell orchestrator. Across multiple attempts it accumulated:
- HEAD-vs-GET bugs (many CMSes return 405 on HEAD)
- Em-dash characters that crashed PowerShell parsing (Win PS 5.1 reads `.ps1` as Win-1252)
- Dataclass mismatch with `config.yaml`
- Missing dependencies discovered at runtime
- 9-hour runs producing only 331 results in one earlier attempt

**Discard the entire `scraper_v3/stage1_discovery`, `stage2_crawl`, `stage3_detect` content as a working approach.** `stage0_discovery/canonical_list.py` and `stage4_publish/runner.py` are the input/output contracts and are fine to reuse. Anything in between is up for redesign.

The over-engineering (async + concurrency + caching + robots layer + multi-stage orchestration) created too many integration points before the simplest version was proven to work. The next attempt must be different.

## Approaches I want you to weigh before suggesting one

Don't jump to an answer. Honestly weigh these:

**A. Drastically simpler synchronous Python script** - one file, one council at a time, hard cap at 100 councils for the proof. Phase 1 = URL coverage only. Phase 2 = indicator extraction. Each phase produces a checkpoint we manually inspect.

**B. Fix and reuse the existing nightly scraper at `scraper/`** - it already works, runs nightly, commits to the right path. Maybe the gap is just that it doesn't capture all 12 indicators with evidence URLs - extend it rather than rebuild.

**C. Common Crawl CDX API** - the open web is already indexed. Querying for `*.gov.uk` patterns matching council slugs may be faster than rediscovering URLs ourselves.

**D. Pay for verified council data** - NALC and county associations sell directories with verified URLs.

**E. Ship now with what we have** - 7,031 councils are already live with scores. ONS expansion (the extra 3,915 councils) could be a Phase 2 milestone after launch.

**F. Hybrid** - use existing Excel-database URLs for the 7,031 known councils (already in the data), only run discovery on the ~3,915 ONS-only councils.

## Hard rules

1. **Every indicator MUST have an evidence URL on the council's own domain.** No directory-page booleans. Click-through verifiability is the methodology.
2. **Use a transparent UA**: `CouncilClearSight/3.0 (+https://councilclearsight.org.uk/about/bot - info@councilclearsight.org.uk)`. No fake-Mozilla.
3. **Respect robots.txt and be polite** (per-host delay).
4. **PowerShell scripts must be pure ASCII.** No em-dashes, arrows, smart quotes, curly punctuation. Win PS 5.1 reads `.ps1` as Win-1252 and chokes on multi-byte UTF-8.
5. **No multi-stage async pipelines** unless the synchronous version is proven on 100 councils first.
6. **Output must land at `client/public/data/councils/{slug}.json`** - the path Netlify publishes (root `public/` is stale and unused by the live site).

## What I want from this first conversation

Don't start coding. I want you to:

1. Read all the files listed above
2. Recommend an approach (A through F or something else) with honest tradeoffs
3. Tell me what the smallest provable deliverable is (e.g. "100 councils end-to-end, you inspect, then we scale")
4. Wait for me to pick before writing anything

## Environment notes

- Windows + Python 3.13 at `C:\Users\jonat\AppData\Local\Programs\Python\Python313\`
- PowerShell is the shell I use; not a CLI power-user
- OneDrive sometimes truncates files mid-write - prefer fewer, larger writes over many small edits
- `git push` to `sabarrejonathan-stack/councilclearsight` triggers automatic Netlify rebuild
- The stale `public/` at the repo root (22 MB old `councils_scored.json`) is NOT used by the live site - data must be written to `client/public/data/` to be served
