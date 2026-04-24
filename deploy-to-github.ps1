# deploy-to-github.ps1 — one-command push of the CC Website to GitHub.
#
# Usage (from Windows PowerShell, in the CC Website folder):
#   .\deploy-to-github.ps1
#
# What it does:
#   1. Initialises a git repo if none exists.
#   2. Stages and commits the current code as "Initial CC-TI v3 deploy".
#   3. Sets the remote to github.com/sabarrejonathan-stack/councilclearsight
#      (change the variable below if you want a different repo name).
#   4. Pushes to GitHub main branch.
#
# PREREQUISITE: create an empty repo on GitHub first —
#   github.com/new  (leave README/gitignore/licence UNCHECKED — this script adds them).
# The script will guide you to the new-repo page if needed.

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
  Write-Host '✓ Initialised git repository' -ForegroundColor Green
} else {
  Write-Host '✓ Git repository already exists' -ForegroundColor Green
}

# 2. Stage and commit
git add -A
$staged = git diff --cached --name-only | Measure-Object
if ($staged.Count -eq 0) {
  Write-Host '✓ Nothing new to commit' -ForegroundColor Yellow
} else {
  git commit -m "Deploy CC-TI v3 rebuild (methodology, two-tier pricing, evidence-per-indicator)" | Out-Null
  Write-Host "✓ Committed $($staged.Count) changed files" -ForegroundColor Green
}

# 3. Set / update remote
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
  git remote set-url origin $remoteUrl
  Write-Host "✓ Updated remote origin to $remoteUrl" -ForegroundColor Green
} else {
  git remote add origin $remoteUrl
  Write-Host "✓ Added remote origin $remoteUrl" -ForegroundColor Green
}

# 4. Push
Write-Host ''
Write-Host "Pushing to GitHub… (you may be prompted for your GitHub credentials)" -ForegroundColor Cyan
try {
  git push -u origin main
  Write-Host ''
  Write-Host '✓ PUSH COMPLETE' -ForegroundColor Green
  Write-Host "  Repo: https://github.com/$githubUser/$repoName" -ForegroundColor Green
  Write-Host ''
  Write-Host 'Next step: go to Netlify > Add new project > Import from GitHub > pick councilclearsight.' -ForegroundColor Cyan
  Write-Host '          Or let Claude drive it in the browser — it is waiting for this push to complete.' -ForegroundColor Cyan
} catch {
  Write-Host ''
  Write-Host '✗ PUSH FAILED' -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ''
  Write-Host 'Common causes:' -ForegroundColor Yellow
  Write-Host '  • The repo does not exist yet on GitHub — create it at https://github.com/new' -ForegroundColor Yellow
  Write-Host '  • You are not authenticated — run: gh auth login   (or configure a credential manager)' -ForegroundColor Yellow
  Write-Host '  • You chose a different repo name — edit $repoName at the top of this script' -ForegroundColor Yellow
  exit 1
}
