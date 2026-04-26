# run_full_audit.ps1 - end-to-end Council ClearSight audit pipeline.
#
# Usage (from PowerShell, in the CC Website folder):
#
#   .\run_full_audit.ps1                 # full run, all 11,057 councils
#   .\run_full_audit.ps1 -Limit 30       # smoke test on first 30
#   .\run_full_audit.ps1 -Rescan         # ignore progress, re-do everything
#   .\run_full_audit.ps1 -DiscoverOnly   # only URL discovery, no scraping
#   .\run_full_audit.ps1 -NoDiscover     # only scrape councils that already have URLs
#   .\run_full_audit.ps1 -SkipPublish    # skip the final per-slug JSON regeneration
#
# What it does:
#   1. Confirms Python 3.10+ is available.
#   2. Installs (or upgrades) the required Python packages.
#   3. Runs publish_v2/run_full_audit.py.
#   4. The Python pipeline writes progress to publish_v2/data/coverage_progress.csv
#      after every council, so safe to Ctrl-C any time and re-run to resume.
#   5. After all councils are processed, it regenerates per-slug JSONs.
#
# Pure ASCII. No em-dashes, smart quotes, or > characters in display strings -
# Windows PowerShell 5.1 reads .ps1 as Windows-1252 and chokes on multi-byte chars.

param(
    [int]$Limit = 0,
    [switch]$Rescan,
    [switch]$DiscoverOnly,
    [switch]$NoDiscover,
    [switch]$SkipPublish,
    [string]$FilterSource = ""
)

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '======================================================' -ForegroundColor Cyan
Write-Host '  Council ClearSight - full audit pipeline' -ForegroundColor Cyan
Write-Host '======================================================' -ForegroundColor Cyan
Write-Host ''

# 1. Confirm we are in the right directory
if (-not (Test-Path 'publish_v2/run_full_audit.py')) {
    Write-Host '[FAILED] Could not find publish_v2/run_full_audit.py.' -ForegroundColor Red
    Write-Host '         Run this script from the CC Website root folder:' -ForegroundColor Yellow
    Write-Host '            cd "C:\Users\jonat\OneDrive\Council Clearsight\CC Website"' -ForegroundColor Yellow
    exit 1
}

# 2. Confirm Python is available
$python = $null
foreach ($candidate in @('py', 'python', 'python3')) {
    try {
        $v = & $candidate --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $python = $candidate
            Write-Host "[OK] Found Python: $candidate ($v)" -ForegroundColor Green
            break
        }
    } catch { }
}
if (-not $python) {
    Write-Host '[FAILED] Python not found. Install from https://www.python.org/downloads/' -ForegroundColor Red
    Write-Host '         and re-run this script.' -ForegroundColor Yellow
    exit 1
}

# 3. Install required packages
Write-Host ''
Write-Host 'Installing/updating required Python packages...' -ForegroundColor Cyan
$packages = @('requests>=2.31', 'beautifulsoup4>=4.12', 'lxml>=5.0', 'tenacity>=8.0',
              'openpyxl>=3.1', 'pandas>=2.0', 'urllib3>=2.0')
& $python -m pip install --quiet --upgrade $packages
if ($LASTEXITCODE -ne 0) {
    Write-Host '[FAILED] pip install returned non-zero. Try running as admin or in a venv.' -ForegroundColor Red
    exit 1
}
Write-Host '[OK] Packages installed' -ForegroundColor Green

# 4. Build argument list for the Python script
$pyArgs = @('publish_v2/run_full_audit.py')
if ($Limit -gt 0)         { $pyArgs += @('--limit', $Limit) }
if ($Rescan)              { $pyArgs += '--rescan' }
if ($DiscoverOnly)        { $pyArgs += '--discover-only' }
if ($NoDiscover)          { $pyArgs += '--no-discover' }
if ($SkipPublish)         { $pyArgs += '--skip-publish' }
if ($FilterSource -ne '') { $pyArgs += @('--filter-source', $FilterSource) }

# 5. Run the pipeline. We use Start-Process so Ctrl-C is forwarded cleanly.
Write-Host ''
Write-Host 'Starting audit pipeline...' -ForegroundColor Cyan
Write-Host '(Press Ctrl-C to stop. Progress is saved after every council, so re-running resumes.)' -ForegroundColor Yellow
Write-Host ''

& $python @pyArgs
$exitCode = $LASTEXITCODE

Write-Host ''
if ($exitCode -eq 0) {
    Write-Host '[SUCCESS] Audit pipeline finished.' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Next steps:' -ForegroundColor Cyan
    Write-Host '  1. Review publish_v2/data/coverage_progress.csv' -ForegroundColor White
    Write-Host '  2. Spot-check a few new verified councils in client/public/data/councils/' -ForegroundColor White
    Write-Host '  3. Push the changes to GitHub:' -ForegroundColor White
    Write-Host '       .\deploy-to-github.ps1' -ForegroundColor White
} elseif ($exitCode -eq 130) {
    Write-Host '[STOPPED] Interrupted by user. Progress saved.' -ForegroundColor Yellow
    Write-Host '          Re-run this script to resume from where it stopped.' -ForegroundColor Yellow
} else {
    Write-Host "[FAILED] Pipeline exited with code $exitCode." -ForegroundColor Red
    Write-Host '         Check the error above. Progress is saved, so re-running resumes.' -ForegroundColor Yellow
}

exit $exitCode
