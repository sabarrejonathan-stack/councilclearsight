# scraper_v3 — COMPLETE pipeline runner.
# Builds the canonical English council list (Excel + ONS) and runs all four stages.
#
# Usage from repo root:
#   powershell -File scraper_v3/scripts/run_complete_pipeline.ps1
#
# Total expected runtime: 30-60 hours. Fully resumable — re-run after a crash.

$ErrorActionPreference = "Stop"
Set-Location -Path (Join-Path $PSScriptRoot "..\..")

$Xlsx = if ($env:XLSX) { $env:XLSX } else { "Council_ClearSight_16.04.26.xlsx" }
if (-not (Test-Path $Xlsx)) {
    Write-Host "ERROR: Excel file not found at $Xlsx" -ForegroundColor Red
    Write-Host 'Set $env:XLSX to the absolute path before running.' -ForegroundColor Yellow
    exit 1
}

$started = Get-Date

Write-Host ""
Write-Host "═══ Stage 0 — extract council list from Excel ═══" -ForegroundColor Cyan
python -m scraper_v3.scripts.extract_council_list --xlsx $Xlsx --out scraper_v3/data/councils.csv
if ($LASTEXITCODE -ne 0) { throw "Stage 0 failed" }

Write-Host ""
Write-Host "═══ Stage 0+ — merge with ONS Parishes Register (full England coverage) ═══" -ForegroundColor Cyan
python -m scraper_v3.stage0_discovery.canonical_list --existing scraper_v3/data/councils.csv --out scraper_v3/data/councils.csv
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: ONS merge failed — continuing with Excel-only list" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══ Stage 1 — URL discovery (~2-4 hours) ═══" -ForegroundColor Cyan
python -m scraper_v3.stage1_discovery.runner --councils scraper_v3/data/councils.csv --out scraper_v3/data/urls_resolved.json --max-concurrency 50
if ($LASTEXITCODE -ne 0) { throw "Stage 1 failed" }

Write-Host ""
Write-Host "═══ Stage 2 — polite crawl (~24-48 hours) ═══" -ForegroundColor Cyan
python -m scraper_v3.stage2_crawl.runner --urls scraper_v3/data/urls_resolved.json --out scraper_v3/data/crawl_log.json --max-concurrency 50
if ($LASTEXITCODE -ne 0) { throw "Stage 2 failed" }

Write-Host ""
Write-Host "═══ Stage 3 — indicator detection (~6-12 hours) ═══" -ForegroundColor Cyan
python -m scraper_v3.stage3_detect.runner --urls scraper_v3/data/urls_resolved.json --out scraper_v3/data/detections --max-concurrency 30
if ($LASTEXITCODE -ne 0) { throw "Stage 3 failed" }

Write-Host ""
Write-Host "═══ Stage 4 — publish per-slug JSONs to client/public/data/ ═══" -ForegroundColor Cyan
python -m scraper_v3.stage4_publish.runner --detections scraper_v3/data/detections --councils scraper_v3/data/councils.csv --output client/public/data
if ($LASTEXITCODE -ne 0) { throw "Stage 4 failed" }

$elapsed = (Get-Date) - $started
Write-Host ""
Write-Host "═══ Complete in $($elapsed.ToString('dd\.hh\:mm\:ss')) ═══" -ForegroundColor Green
Write-Host ""
Write-Host "Per-slug JSONs at client/public/data/councils/ now contain real evidence URLs."
Write-Host ""
Write-Host "Next: review a few council JSONs, then commit + push:" -ForegroundColor Yellow
Write-Host '   git add client/public/data/'
Write-Host '   git commit -m "data: scraper_v3 first full run — evidence-backed VDTI v4.0 scores"'
Write-Host '   git push'
