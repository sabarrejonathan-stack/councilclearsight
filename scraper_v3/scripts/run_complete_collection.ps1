# scraper_v3 -- single-command end-to-end collection.
#
# Runs the full pipeline (stage 0 through 4) plus the master Excel export,
# resumable on every stage. This is the script to run when you want
# evidence-backed data for every English council with one command.
#
# What it does, in order:
#   0   Extract canonical council list from the existing Excel database
#   0+  Merge the ONS Parishes Register (April 2025) -- adds councils missing
#       from the Excel sheet, deduped by normalised name
#   1   Discover a working website per council (database URL -> pattern guess
#       -> parishcouncils.uk directory), every candidate validated by HTTP
#   2   Polite crawl of each resolved site (depth 3, max 60 pages, robots.txt
#       respected, response cache in SQLite)
#   3   Run the 12 evidence-backed indicator detectors over the cached corpus
#   4a  Publish per-slug JSON files to client/public/data/councils/
#   4b  Export ONE master Excel + CSV with every captured field per council
#
# Usage from the repo root:
#   powershell -File scraper_v3/scripts/run_complete_collection.ps1
#
# Optional environment overrides:
#   $env:XLSX           Path to the Excel database (defaults to current sheet)
#   $env:CONCURRENCY    Stage 1 concurrency (default 60)
#   $env:CRAWL_CONC     Stage 2 concurrency (default 50)
#   $env:DETECT_CONC    Stage 3 concurrency (default 30)
#
# Total expected runtime: 30-60 hours on a fresh run; 10-20 minutes when
# resumed (every stage skips work that is already done). Fully restart-safe.
#
# IMPORTANT: this file is intentionally pure ASCII (no em-dashes, arrows,
# smart quotes, etc.) because Windows PowerShell 5.1 reads .ps1 files as
# Windows-1252 by default, and multi-byte UTF-8 sequences confuse the parser.

$ErrorActionPreference = "Stop"
Set-Location -Path (Join-Path $PSScriptRoot "..\..")

# ---- Config ----------------------------------------------------------------

$Xlsx        = if ($env:XLSX)        { $env:XLSX }        else { "Council_ClearSight_16.04.26.xlsx" }
$Concurrency = if ($env:CONCURRENCY) { [int]$env:CONCURRENCY } else { 60 }
$CrawlConc   = if ($env:CRAWL_CONC)  { [int]$env:CRAWL_CONC }  else { 50 }
$DetectConc  = if ($env:DETECT_CONC) { [int]$env:DETECT_CONC } else { 30 }

if (-not (Test-Path $Xlsx)) {
    Write-Host "ERROR: Excel file not found at $Xlsx" -ForegroundColor Red
    Write-Host 'Set $env:XLSX to the absolute path before running, e.g.:' -ForegroundColor Yellow
    Write-Host '   $env:XLSX = "C:\path\to\Council_ClearSight.xlsx"' -ForegroundColor Yellow
    exit 1
}

New-Item -ItemType Directory -Force -Path "scraper_v3/data" | Out-Null
$started = Get-Date

function Step($label, $color = "Cyan") {
    $stamp = (Get-Date).ToString("HH:mm:ss")
    Write-Host ""
    Write-Host "[$stamp] === $label ===" -ForegroundColor $color
}

# ---- Pre-flight: ensure Python dependencies are installed -----------------

Step "Pre-flight  Verify Python dependencies" "Magenta"
$probe = python -c "import httpx, structlog, selectolax, pdfplumber, aiosqlite, yaml, openpyxl, pandas" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing missing dependencies from scraper_v3/requirements.txt..." -ForegroundColor Yellow
    python -m pip install -r scraper_v3/requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "pip install failed. Try manually:" -ForegroundColor Red
        Write-Host "   python -m pip install -r scraper_v3/requirements.txt" -ForegroundColor Yellow
        throw "Dependency install failed"
    }
} else {
    Write-Host "All dependencies present." -ForegroundColor Green
}

# ---- Stage 0: extract from Excel ------------------------------------------

Step "Stage 0  Extract canonical council list from Excel"
python -m scraper_v3.scripts.extract_council_list `
    --xlsx $Xlsx `
    --out scraper_v3/data/councils.csv
if ($LASTEXITCODE -ne 0) { throw "Stage 0 failed" }

# ---- Stage 0+: merge ONS Parishes Register --------------------------------

Step "Stage 0+ Merge ONS Parishes Register (April 2025)"
python -m scraper_v3.stage0_discovery.canonical_list `
    --existing scraper_v3/data/councils.csv `
    --out scraper_v3/data/councils.csv
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: ONS merge failed -- continuing with Excel-only list" -ForegroundColor Yellow
}

$rowCount = (Import-Csv scraper_v3/data/councils.csv | Measure-Object).Count
Write-Host "Canonical list: $rowCount councils ready for discovery." -ForegroundColor Green

# ---- Stage 1: URL discovery ------------------------------------------------

Step "Stage 1  URL discovery (database -> pattern -> directory)"
Write-Host "Concurrency: $Concurrency. Resumable: yes." -ForegroundColor DarkGray
python -m scraper_v3.stage1_discovery.runner `
    --councils scraper_v3/data/councils.csv `
    --out scraper_v3/data/urls_resolved.json `
    --max-concurrency $Concurrency
if ($LASTEXITCODE -ne 0) { throw "Stage 1 failed" }

# ---- Stage 2: polite crawl -------------------------------------------------

Step "Stage 2  Polite crawl (depth 3, robots respected, response cached)"
Write-Host "Concurrency: $CrawlConc. Resumable: yes (cache + per-slug log)." -ForegroundColor DarkGray
python -m scraper_v3.stage2_crawl.runner `
    --urls scraper_v3/data/urls_resolved.json `
    --out scraper_v3/data/crawl_log.json `
    --max-concurrency $CrawlConc
if ($LASTEXITCODE -ne 0) { throw "Stage 2 failed" }

# ---- Stage 3: indicator detection -----------------------------------------

Step "Stage 3  Run 12 evidence-backed detectors over the corpus"
Write-Host "Concurrency: $DetectConc. Resumable: yes." -ForegroundColor DarkGray
python -m scraper_v3.stage3_detect.runner `
    --urls scraper_v3/data/urls_resolved.json `
    --out scraper_v3/data/detections `
    --max-concurrency $DetectConc
if ($LASTEXITCODE -ne 0) { throw "Stage 3 failed" }

# ---- Stage 4a: publish per-slug JSONs -------------------------------------

Step "Stage 4a Publish per-slug JSONs to client/public/data/"
python -m scraper_v3.stage4_publish.runner `
    --detections scraper_v3/data/detections `
    --councils scraper_v3/data/councils.csv `
    --output client/public/data
if ($LASTEXITCODE -ne 0) { throw "Stage 4a failed" }

# ---- Stage 4b: master Excel + CSV -----------------------------------------

Step "Stage 4b Build master Excel + CSV (one row per council)"
python -m scraper_v3.stage4_publish.master_export `
    --councils scraper_v3/data/councils.csv `
    --urls scraper_v3/data/urls_resolved.json `
    --detections scraper_v3/data/detections `
    --published client/public/data `
    --out-csv scraper_v3/data/master_export.csv `
    --out-xlsx scraper_v3/data/master_export.xlsx
if ($LASTEXITCODE -ne 0) { throw "Stage 4b failed" }

# ---- Done ------------------------------------------------------------------

$elapsed = (Get-Date) - $started
Write-Host ""
Write-Host "=== Complete in $($elapsed.ToString('dd\.hh\:mm\:ss')) ===" -ForegroundColor Green
Write-Host ""
Write-Host "Outputs:" -ForegroundColor Cyan
Write-Host "  scraper_v3/data/master_export.xlsx     (review here)"
Write-Host "  scraper_v3/data/master_export.csv      (same data, lossless)"
Write-Host "  client/public/data/councils/*.json     (live website data)"
Write-Host "  client/public/data/directory.json      (directory + ranks)"
Write-Host ""
Write-Host "When you are happy, commit + push:" -ForegroundColor Yellow
Write-Host '   git add client/public/data/ scraper_v3/data/master_export.csv'
Write-Host '   git commit -m "data: full evidence-backed VDTI v4.0 collection"'
Write-Host '   git push'
