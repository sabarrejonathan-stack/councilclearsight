# scraper_v3 — full pipeline runner (PowerShell version).
# Run from the project root: powershell -File scraper_v3/scripts/run_full_pipeline.ps1

$ErrorActionPreference = "Stop"

# Move to repo root (parent of scraper_v3/)
Set-Location -Path (Join-Path $PSScriptRoot "..\..")

# Allow override via env var
$Xlsx = if ($env:XLSX) { $env:XLSX } else { "uploads/Council_ClearSight_16.04.26.xlsx" }

if (-not (Test-Path $Xlsx)) {
    Write-Host "ERROR: $Xlsx not found." -ForegroundColor Red
    Write-Host "Set the XLSX environment variable, e.g.:" -ForegroundColor Yellow
    Write-Host '  $env:XLSX = "C:\path\to\Council_ClearSight_16.04.26.xlsx"' -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "── Stage 0 — extract council list ──" -ForegroundColor Cyan
python -m scraper_v3.scripts.extract_council_list --xlsx $Xlsx --out scraper_v3/data/councils.csv
if ($LASTEXITCODE -ne 0) { throw "Stage 0 failed" }

Write-Host ""
Write-Host "── Stage 1 — URL discovery (~2-4 hours) ──" -ForegroundColor Cyan
python -m scraper_v3.stage1_discovery.runner --councils scraper_v3/data/councils.csv --out scraper_v3/data/urls_resolved.json --max-concurrency 50
if ($LASTEXITCODE -ne 0) { throw "Stage 1 failed" }

Write-Host ""
Write-Host "── Stage 2 — polite crawl (~24-48 hours) ──" -ForegroundColor Cyan
python -m scraper_v3.stage2_crawl.runner --urls scraper_v3/data/urls_resolved.json --out scraper_v3/data/crawl_log.json --max-concurrency 50
if ($LASTEXITCODE -ne 0) { throw "Stage 2 failed" }

Write-Host ""
Write-Host "── Stage 3 — indicator detection (~6-12 hours) ──" -ForegroundColor Cyan
python -m scraper_v3.stage3_detect.runner --urls scraper_v3/data/urls_resolved.json --out scraper_v3/data/detections --max-concurrency 30
if ($LASTEXITCODE -ne 0) { throw "Stage 3 failed" }

Write-Host ""
Write-Host "── Stage 4 — publish to website ──" -ForegroundColor Cyan
python -m scraper_v3.stage4_publish.runner --detections scraper_v3/data/detections --councils scraper_v3/data/councils.csv --output client/public/data
if ($LASTEXITCODE -ne 0) { throw "Stage 4 failed" }

Write-Host ""
Write-Host "── Done ──" -ForegroundColor Green
Write-Host "Per-slug JSONs at client/public/data/councils/ now contain evidence URLs."
