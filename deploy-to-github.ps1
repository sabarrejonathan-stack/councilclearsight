# deploy-to-github.ps1 - one-command push of the CC Website to GitHub.
#
# Usage (from Windows PowerShell, in the CC Website folder):
#   .\deploy-to-github.ps1
#
# IMPORTANT: This file is pure ASCII. Do not save it as UTF-8 with em-dashes,
# arrows, bullet points or smart quotes - Windows PowerShell 5.1 reads .ps1
# as Windows-1252 and will fail to parse multi-byte characters.

$ErrorActionPreference = 'Stop'

$githubUser = 'sabarrejonathan-stack'
$repoName   = 'councilclearsight'
$remoteUrl  = "https://github.com/$githubUser/$repoName.git"

Write-Host ''
Write-Host "Deploying to $remoteUrl" -ForegroundColor Cyan
Write-Host ''

# 1. git init (idempotent)
if (-not (Test-Path '.git')) {
  git init | Out-Null
  git branch -M main
  Write-Host '[OK] Initialised git repository' -ForegroundColor Green
} else {
  Write-Host '[OK] Git repository already exists' -ForegroundColor Green
}

# 2. Stage and commit
git add -A
$staged = git diff --cached --name-only | Measure-Object
if ($staged.Count -eq 0) {
  Write-Host '[OK] Nothing new to commit' -ForegroundColor Yellow
} else {
  git commit -m "Deploy: 11,057 council audit universe, evidence URLs on verified profiles" | Out-Null
  Write-Host ("[OK] Committed " + $staged.Count + " changed files") -ForegroundColor Green
}

# 3. Set / update remote
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
  git remote set-url origin $remoteUrl
  Write-Host "[OK] Updated remote origin to $remoteUrl" -ForegroundColor Green
} else {
  git remote add origin $remoteUrl
  Write-Host "[OK] Added remote origin $remoteUrl" -ForegroundColor Green
}

# 4. Push
Write-Host ''
Write-Host 'Pushing to GitHub (you may be prompted for your GitHub credentials)...' -ForegroundColor Cyan
try {
  git push -u origin main
  Write-Host ''
  Write-Host '[SUCCESS] Push complete.' -ForegroundColor Green
  Write-Host ("  Repo: https://github.com/" + $githubUser + "/" + $repoName) -ForegroundColor Green
  Write-Host ''
  Write-Host 'Next: Netlify will auto-build and deploy. Watch progress at:' -ForegroundColor Cyan
  Write-Host '  https://app.netlify.com/' -ForegroundColor Cyan
} catch {
  Write-Host ''
  Write-Host '[FAILED] Push failed.' -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ''
  Write-Host 'Common causes:' -ForegroundColor Yellow
  Write-Host '  - The repo does not exist yet. Create it at https://github.com/new (no README/gitignore/licence).' -ForegroundColor Yellow
  Write-Host '  - You are not authenticated. Run: gh auth login' -ForegroundColor Yellow
  Write-Host '  - Different repo name? Edit $repoName at the top of this script.' -ForegroundColor Yellow
  exit 1
}
