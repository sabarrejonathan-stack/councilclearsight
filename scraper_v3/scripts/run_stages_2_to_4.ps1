# scraper_v3 — chain stages 2, 3, 4 after stage 1 completes.
# Run this once `data/urls_resolved.json` has been produced by stage 1.
#
# Usage:
#   cd "C:\Users\jonat\OneDrive\Council Clearsight\CC Website"
#   powershell -File scraper_v3/scripts/run_stages_2_to_4.ps1
#
# Total expected runtime: 30-60 hours. Fully resumable — if anything crashes,
# re-run the same command and it picks up where it left off.

$ErrorActionPreference = "Stop"
Set-Location -Path (Join-Path $PSScriptRoot "..\..")

# Pre-flight: stage 1 must have finished
$urlsFile = "scraper_v3/data/urls_resolved.json"
if (-not (Test-Path $urlsFile)) {
    Write-Host "ERROR: $urlsFile not found. Run stage 1 first." -ForegroundColor Red
    exit 1
}
$urlsContent = Get-Content $urlsFile -Raw | ConvertFrom-Json
$resolvedCount = ($urlsContent | Where-Object { $_.url -and $_.confidence -ge 0.6 }).Count
Write-Host "Stage 1 complete — $resolvedCount councils resolved at confidence >= 0.6" -ForegroundColor Green

if ($resolvedCount -lt 100) {
    Write-Host "WARNING: only $resolvedCount resolved. Stage 1 may not be complete yet." -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/N)"
    if ($confirm -ne "y") { exit 0 }
}

$started = Get-Date

Write-Host ""
Write-Host "── Stage 2 — polite crawl (~24-48 hours, fully resumable) ──" -ForegroundColor Cyan
Write-Host "  Will fetch homepage + up to 60 pages + every PDF for each of the $resolvedCount councils."
Write-Host "  Per-host delay: 3s. Robots.txt respected. Cache: scraper_v3/data/cache.sqlite"
python -m scraper_v3.stage2_crawl.runner --urls scraper_v3/data/urls_resolved.json --out scraper_v3/data/crawl_log.json --max-concurrency 50
if ($LASTEXITCODE -ne 0) { throw "Stage 2 failed" }

Write-Host ""
Write-Host "── Stage 3 — indicator detection (~6-12 hours) ──" -ForegroundColor Cyan
Write-Host "  12 detectors run against the cached corpus per council."
python -m scraper_v3.stage3_detect.runner --urls scraper_v3/data/urls_resolved.json --out scraper_v3/data/detections --max-concurrency 30
if ($LASTEXITCODE -ne 0) { throw "Stage 3 failed" }

Write-Host ""
Write-Host "── Stage 4 — publish per-slug JSONs to client/public/data/ ──" -ForegroundColor Cyan
python -m scraper_v3.stage4_publish.runner --detections scraper_v3/data/detections --councils scraper_v3/data/councils.csv --output client/public/data
if ($LASTEXITCODE -ne 0) { throw "Stage 4 failed" }

$elapsed = (Get-Date) - $started
Write-Host ""
Write-Host "── Done in $($elapsed.ToString('dd\.hh\:mm\:ss')) ──" -ForegroundColor Green
Write-Host "Per-slug JSONs at client/public/data/councils/ now contain real evidence URLs."
Write-Host ""
Write-Host "Next: review a few council JSONs, then commit + push:" -ForegroundColor Yellow
Write-Host '   git add client/public/data/'
Write-Host '   git commit -m "data: scraper_v3 first full run — evidence-backed VDTI v4.0 scores"'
Write-Host '   git push'
