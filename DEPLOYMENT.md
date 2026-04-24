# Deployment — Council ClearSight rebuild

This rebuild is in place in your codebase. Follow these steps in order to publish it.

## What has already been done in your working tree

- All 18 public and portal pages replaced with the new CC-TI v3 versions at `client/src/pages/`.
- `client/src/lib/scoring.ts` added — typed mirror of the scoring engine.
- `client/src/App.tsx` updated with two new routes: `/methodology/changelog` and `/methodology/disputes`.
- `server/routers.ts` updated:
  - The public score cap (`capPublicScore`) is now a no-op — every visitor sees the same score.
  - Two new tRPC procedures: `councils.getBySlug` (CC-TI v3 shape with evidence trail) and `councils.directory` (slim list).
  - `challenges.listPublic` — anonymised public queue of decided challenges.
- `public/data/councils_scored.json` and `public/data/directory.json` — the 7,031-council audit the UI reads from.
- `public/preview.html` — a standalone in-browser design preview.

## One-time setup on your machine

```powershell
cd "C:\Users\jonat\OneDrive\Council Clearsight\CC Website"
npm install
```

## Build + deploy

```powershell
# 1. Build the front-end and the server bundle
npm run build

# 2. Smoke test locally before pushing
npm run start
# open http://localhost:3000 — spot-check:
#   - the home page loads
#   - /methodology reads in plain English
#   - /pricing shows two tiers only
#   - /directory lists councils
#   - /council/adderbury-parish-council shows the new evidence trail
#   - /methodology/changelog and /methodology/disputes render

# 3. Deploy via your existing process
#    (Push to the hosting environment you were using — no new provider needed.)
```

## What you'll need to wire up separately (outside the code)

These are business/operational tasks the code can't do for itself:

1. **Stripe Checkout** — create products for the two tiers:
   - `cc-ti-verified-annual` — £149/year
   - `cc-ti-verified-monthly` — £15/month
   - `cc-ti-pro-annual` — £449/year
   - `cc-ti-pro-monthly` — £45/month

   Wire the subscribe buttons (currently linking to `/subscribe/verified` and `/subscribe/pro`) to Stripe Checkout sessions. This can be done via a new tRPC mutation `subscriptions.createCheckoutSession({ tier, billing })`.

2. **Support email inbox** — `support@councilclearsight.org.uk` (or your preferred alias) for the Pro "direct support channel" feature.

3. **Editorial review inbox** — `review@councilclearsight.org.uk` (referenced from the methodology & contact pages) for methodology proposals and peer-review offers.

4. **Annual re-score cadence** — the scoring-engine run is currently manual. To automate: add a scheduled task (cron / GitHub Actions / Vercel cron) that runs `python scoring_engine/build_audit.py` against fresh data and commits the updated `public/data/councils_scored.json`.

5. **Governance-document scraping** — the data currently has 67% completeness across every council because Pillar 3 indicators (agendas/minutes/AGAR) aren't yet populated. Schedule a separate scraper task to visit each council website, set `governance_scrape_attempted=1` and the individual has-flag inputs, then re-run the scoring engine. The engine immediately picks up the new evidence; no code changes needed.

6. **Data placeholders in `Legal.tsx`** — replace these before publishing:
   - Company registration number
   - Registered address
   - ICO registration number
   - "Last updated" date on each legal tab
   - Privacy contact email

## Rollback plan

If anything breaks in production:

1. `git revert <commit>` on the deploy and push — your existing hosting auto-redeploys.
2. The `capPublicScore` function is now a no-op but still exists — nothing else in the codebase needs to change to revert score-cap behaviour (which we don't recommend reinstating).
3. MySQL scores were untouched. The new UI reads from `public/data/councils_scored.json`; the MySQL VDTI columns still exist for legacy paths.

## File inventory of what changed

```
New or replaced:
  client/src/lib/scoring.ts                          ← shared scoring metadata
  client/src/pages/Home.tsx                          ← new landing page
  client/src/pages/Methodology.tsx                   ← plain-English rewrite
  client/src/pages/MethodologyChangelog.tsx          ← NEW
  client/src/pages/DisputesQueue.tsx                 ← NEW
  client/src/pages/Directory.tsx                     ← sortable directory
  client/src/pages/CouncilProfile.tsx                ← evidence-per-indicator
  client/src/pages/Pricing.tsx                       ← two tiers only
  client/src/pages/ForClerks.tsx                     ← conversion page
  client/src/pages/Features.tsx                      ← feature matrix
  client/src/pages/About.tsx                         ← new
  client/src/pages/FAQ.tsx                           ← new
  client/src/pages/HowItWorks.tsx                    ← new
  client/src/pages/Evidence.tsx                      ← statutory basis
  client/src/pages/Contact.tsx                       ← 3-route contact
  client/src/pages/Challenge.tsx                     ← dispute form
  client/src/pages/ClerkSuccess.tsx                  ← post-subscription
  client/src/pages/Legal.tsx                         ← privacy+terms+a11y
  client/src/pages/NotFound.tsx                      ← 404
  client/src/pages/portal/Dashboard.tsx              ← subscriber home
  client/src/pages/portal/Reports.tsx                ← downloadable artefacts
  client/src/pages/portal/Benchmarking.tsx           ← peer comparison
  client/src/pages/portal/Recommendations.tsx        ← roadmap
  client/src/pages/portal/PortalSettings.tsx         ← account/billing
  public/data/councils_scored.json                   ← 7,031-council audit
  public/data/directory.json                         ← slim search index
  public/preview.html                                ← standalone preview
  
Modified:
  client/src/App.tsx                                 ← +2 routes for new pages
  server/routers.ts                                  ← cap retired, new procedures
```

## Test checklist (do these yourself before pushing)

- [ ] `npm run build` completes without error
- [ ] `npm run check` (tsc --noEmit) has no errors in any of the new files
- [ ] Visit `/` — new hero loads, search bar works
- [ ] Visit `/pricing` — only two tiers visible (Verified + Pro), no GitHub or CSV download links
- [ ] Visit `/methodology` — plain English, 14 indicators explained warmly
- [ ] Visit `/directory` — sortable table of councils
- [ ] Visit a council page — 14 indicators expand to show evidence; each has a "Challenge this" button
- [ ] Visit `/methodology/changelog` — the v3.0 change appears; no "View diff on GitHub" link
- [ ] Visit `/methodology/disputes` — queue renders (empty or populated)
- [ ] Check footer and nav — no broken links
- [ ] Check any CouncilProfile for a subscribed council vs non-subscribed — score is the same (cap is retired)

When all ten are green, push.
