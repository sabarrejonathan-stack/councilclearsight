# Show progress of a running (or finished) scraper_v3 pipeline.
# Open a SECOND PowerShell window while the main run is going and:
#   powershell -File scraper_v3/scripts/status.ps1
#
# Reads the on-disk checkpoint files -- safe to call any time.

$ErrorActionPreference = "Stop"
Set-Location -Path (Join-Path $PSScriptRoot "..\..")

function Section($title) {
    Write-Host ""
    Write-Host "=== $title ===" -ForegroundColor Cyan
}

# ---- Canonical list -------------------------------------------------------

Section "Canonical council list"
if (Test-Path scraper_v3/data/councils.csv) {
    $total = (Import-Csv scraper_v3/data/councils.csv | Measure-Object).Count
    Write-Host "Total councils to process: $total"
} else {
    Write-Host "councils.csv not yet built." -ForegroundColor Yellow
    return
}

# ---- Stage 1 status -------------------------------------------------------

Section "Stage 1  URL discovery"
$resolvedPath = "scraper_v3/data/urls_resolved.json"
if (Test-Path $resolvedPath) {
    $r = Get-Content $resolvedPath -Raw | ConvertFrom-Json
    $count = $r.Count
    $found = ($r | Where-Object { $_.url -and $_.confidence -ge 0.6 }).Count
    $rate = if ($count -gt 0) { ($found / $count).ToString("P1") } else { "0.0%" }
    Write-Host ("Processed:  {0} / {1}" -f $count, $total)
    Write-Host ("Resolved:   {0} ({1})" -f $found, $rate)
    Write-Host ""
    Write-Host "By source:"
    $r | Where-Object { $_.url -and $_.confidence -ge 0.6 } |
        Group-Object source |
        Sort-Object Count -Descending |
        Format-Table Count, @{Label="Source"; Expression={$_.Name}} -AutoSize | Out-Host
} else {
    Write-Host "Stage 1 has not produced a checkpoint yet (writes every 50 councils)." -ForegroundColor Yellow
}

# ---- Stage 2 status -------------------------------------------------------

Section "Stage 2  Crawl"
if (Test-Path scraper_v3/data/cache.sqlite) {
    $size = (Get-Item scraper_v3/data/cache.sqlite).Length
    Write-Host ("Response cache: {0:N1} MB" -f ($size / 1MB))
} else {
    Write-Host "Stage 2 has not started." -ForegroundColor Yellow
}
if (Test-Path scraper_v3/data/crawl_log.json) {
    $cl = Get-Content scraper_v3/data/crawl_log.json -Raw | ConvertFrom-Json
    Write-Host "Crawl log entries: $($cl.Count)"
}

# ---- Stage 3 status -------------------------------------------------------

Section "Stage 3  Indicator detection"
if (Test-Path scraper_v3/data/detections) {
    $det = Get-ChildItem scraper_v3/data/detections -Filter *.json
    Write-Host "Detection files: $($det.Count)"
} else {
    Write-Host "Stage 3 has not started." -ForegroundColor Yellow
}

# ---- Stage 4 status -------------------------------------------------------

Section "Stage 4  Published"
if (Test-Path client/public/data/councils) {
    $pub = Get-ChildItem client/public/data/councils -Filter *.json
    Write-Host "Per-slug JSONs published: $($pub.Count)"
}
if (Test-Path scraper_v3/data/master_export.xlsx) {
    $size = (Get-Item scraper_v3/data/master_export.xlsx).Length
    Write-Host ("Master export: scraper_v3/data/master_export.xlsx ({0:N1} KB)" -f ($size / 1KB))
}

# ---- Live tail hint -------------------------------------------------------

Section "Live tail (Ctrl-C to stop)"
Write-Host "To watch validation attempts in real time:"
Write-Host "   Get-Content scraper_v3/data/stage1.jsonl -Tail 20 -Wait" -ForegroundColor Yellow
