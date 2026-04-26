# run_full_audit.ps1 - end-to-end Council ClearSight audit pipeline (concurrent).
#
# Usage (from PowerShell, in the CC Website folder):
#
#   .\run_full_audit.ps1                       # default: 8 workers, full mode
#   .\run_full_audit.ps1 -Workers 16 -Fast     # 16 workers, skip slow checks
#   .\run_full_audit.ps1 -Limit 30             # smoke test
#   .\run_full_audit.ps1 -Workers 1            # serial (debugging)
#   .\run_full_audit.ps1 -Rescan               # ignore progress, re-do everything
#   .\run_full_audit.ps1 -DiscoverOnly         # only URL discovery
#   .\run_full_audit.ps1 -NoDiscover           # skip discovery
#   .\run_full_audit.ps1 -SkipPublish          # skip per-slug JSON regen at end
#
# Performance tips:
#   - Default 8 workers: ~5 hours for the full 11k councils.
#   - 16 workers + -Fast: ~2 hours.
#   - Network-bound; CPU rarely saturates. Safe to leave laptop running.
#
# Pure ASCII. No em-dashes, smart quotes, or > characters in display strings.

param(
    [int]$Limit = 0,
    [int]$Workers = 8,
    [switch]$Fast,
    [switch]$Rescan,
    [switch]$DiscoverOnly,
    [switch]$NoDiscover,
    [switch]$SkipPublish,
    [string]$FilterSource = ""
)

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '======================================================' -ForegroundColor Cyan
Write-Host '  Council ClearSight - full audit pipeline (concurrent)' -ForegroundColor Cyan
Write-Host '======================================================' -ForegroundColor Cyan
Write-Host ''

if (-not (Test-Path 'publish_v2/run_full_audit.py')) {
    Write-Host '[FAILED] Could not find publish_v2/run_full_audit.py.' -ForegroundColor Red
    Write-Host '         Run this script from the project root.' -ForegroundColor Yellow
    exit 1
}

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
    exit 1
}

Write-Host ''
Write-Host 'Installing/updating required Python packages...' -ForegroundColor Cyan
$packages = @('requests>=2.31', 'beautifulsoup4>=4.12', 'lxml>=5.0',
              'tenacity>=8.0', 'openpyxl>=3.1', 'pandas>=2.0', 'urllib3>=2.0')
& $python -m pip install --quiet --upgrade $packages
if ($LASTEXITCODE -ne 0) {
    Write-Host '[FAILED] pip install returned non-zero.' -ForegroundColor Red
    exit 1
}
Write-Host '[OK] Packages installed' -ForegroundColor Green

$pyArgs = @('publish_v2/run_full_audit.py')
if ($Limit -gt 0)         { $pyArgs += @('--limit', $Limit) }
if ($Workers -ge 1)       { $pyArgs += @('--workers', $Workers) }
if ($Fast)                { $pyArgs += '--fast' }
if ($Rescan)              { $pyArgs += '--rescan' }
if ($DiscoverOnly)        { $pyArgs += '--discover-only' }
if ($NoDiscover)          { $pyArgs += '--no-discover' }
if ($SkipPublish)         { $pyArgs += '--skip-publish' }
if ($FilterSource -ne '') { $pyArgs += @('--filter-source', $FilterSource) }

Write-Host ''
Write-Host "Starting audit pipeline ($Workers workers, fast=$Fast)..." -ForegroundColor Cyan
Write-Host '(Press Ctrl-C to stop. Progress is saved after every council.)' -ForegroundColor Yellow
Write-Host ''

& $python @pyArgs
$exitCode = $LASTEXITCODE

Write-Host ''
if ($exitCode -eq 0) {
    Write-Host '[SUCCESS] Audit pipeline finished.' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Next steps:' -ForegroundColor Cyan
    Write-Host '  1. Review publish_v2/data/coverage_progress.csv' -ForegroundColor White
    Write-Host '  2. Push the changes to GitHub:' -ForegroundColor White
    Write-Host '       .\deploy-to-github.ps1' -ForegroundColor White
} elseif ($exitCode -eq 130) {
    Write-Host '[STOPPED] Interrupted by user. Progress saved.' -ForegroundColor Yellow
    Write-Host '          Re-run this script to resume.' -ForegroundColor Yellow
} else {
    Write-Host "[FAILED] Pipeline exited with code $exitCode." -ForegroundColor Red
}

exit $exitCode
