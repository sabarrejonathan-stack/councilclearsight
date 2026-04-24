@echo off
REM deploy-to-github.bat — robust one-command push to GitHub (works in cmd.exe).
REM Run from this folder:
REM   .\deploy-to-github.bat
REM
REM What it does:
REM   1. If a broken .git exists, wipes it and starts fresh.
REM   2. git init (main branch).
REM   3. Stages and commits.
REM   4. Sets remote.
REM   5. Pushes to github.com/sabarrejonathan-stack/councilclearsight

setlocal EnableDelayedExpansion

echo.
echo Deploying to github.com/sabarrejonathan-stack/councilclearsight
echo.

REM 1. Detect broken .git (exists but `git status` fails) and wipe it
if exist ".git" (
  git rev-parse --is-inside-work-tree >nul 2>&1
  if errorlevel 1 (
    echo [FIX] Removing broken .git directory...
    attrib -r -h -s ".git" /s /d >nul 2>&1
    rmdir /s /q ".git"
    if exist ".git" (
      echo [ERROR] Could not remove .git folder. Close any program with the folder open (VS Code, File Explorer showing .git) and re-run.
      exit /b 1
    )
    echo [OK] Wiped broken .git
  ) else (
    echo [OK] Git repository already exists and is valid
    goto :after_init
  )
)

REM 2. Fresh init
git init
if errorlevel 1 goto :fail_init
git branch -M main
echo [OK] Initialised git repository

:after_init

REM Set user if not already set (so commit doesn't fail)
git config user.email >nul 2>&1
if errorlevel 1 (
  git config user.email "sabarrejonathan@gmail.com"
  git config user.name "Jonathan Sabarre"
)

REM 3. Stage + commit
git add -A
if errorlevel 1 goto :fail_stage

REM Commit (suppress error if nothing to commit)
git commit -m "Deploy CC-TI v3 rebuild (methodology, two-tier pricing, evidence-per-indicator)" 2>nul
if errorlevel 1 (
  echo [OK] Nothing new to commit
) else (
  echo [OK] Committed changes
)

REM 4. Set remote
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin https://github.com/sabarrejonathan-stack/councilclearsight.git
) else (
  git remote set-url origin https://github.com/sabarrejonathan-stack/councilclearsight.git
)
echo [OK] Remote origin configured

REM 5. Push
echo.
echo Pushing to GitHub... (first-time push will pop up GitHub sign-in)
git push -u origin main
if errorlevel 1 goto :fail_push

echo.
echo ============================================================
echo   PUSH COMPLETE
echo   Repo: https://github.com/sabarrejonathan-stack/councilclearsight
echo ============================================================
echo.
echo Next: tell Claude the push is done.
exit /b 0

:fail_init
echo [ERROR] git init failed. Is git installed?  where git
exit /b 1

:fail_stage
echo [ERROR] git add failed. Something is blocking staging.
exit /b 1

:fail_push
echo.
echo ============================================================
echo   PUSH FAILED
echo ============================================================
echo   Common causes:
echo   - Authentication cancelled or wrong account
echo   - Repo doesn't exist: https://github.com/sabarrejonathan-stack/councilclearsight
echo   - Network hiccup — just re-run this script
echo.
exit /b 1
