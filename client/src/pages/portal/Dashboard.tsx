/**
 * Portal Dashboard — home page for subscribed councils.
 *
 * Displays:
 *  1. Current score, band, and delta since last re-score
 *  2. Completeness breakdown (assessed vs. not-yet-assessed indicators)
 *  3. Top 3 failing indicators sorted by points-available / effort
 *  4. Recent activity feed (score changes, challenges, etc.)
 *  5. Pro upgrade nudge (Verified tier only) — dismissable
 *  6. Next re-score date with explanation
 */

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import PortalLayout from "@/components/PortalLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, ArrowUp, ArrowDown, TrendingUp, Zap, Lock,
  Calendar, Activity, AlertCircle, X,
} from "lucide-react";
import {
  PILLAR_META, formatScore, formatCompleteness, bandColorClasses,
  type CouncilScore,
} from "@/lib/scoring";

export default function PortalDashboard() {
  const { data: council, isLoading } = trpc.portal.dashboard.useQuery();
  const { data: recentActivity } = trpc.portal.activity.list.useQuery({ limit: 5 });
  const [dismissProNudge, setDismissProNudge] = useState(false);

  useSEO({
    title: "Dashboard — Council ClearSight Portal",
    description: "Your council's transparency score, improvement roadmap, and peer benchmarks.",
    canonicalPath: "/portal/dashboard",
  });

  if (isLoading || !council) {
    return (
      <PortalLayout>
        <div className="container max-w-6xl py-12">
          <div className="grid gap-4">
            <div className="h-20 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-32 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </PortalLayout>
    );
  }

  const councilScore = council as CouncilScore;
  const bandCls = bandColorClasses(councilScore.band as any);
  const isVerifiedTier = councilScore.tier === "verified";
  const isPro = councilScore.tier === "pro";

  // Compute score delta (placeholder — real data from query)
  const scoreDelta = councilScore.score_delta ?? 0;
  const scoreDeltaDir = scoreDelta > 0 ? "up" : scoreDelta < 0 ? "down" : "flat";

  return (
    <PortalLayout council={councilScore}>
      <div className="container max-w-6xl py-10">
        {/* ─── Top header: council name, score, band, tier, next re-score ─── */}
        <section className="mb-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{councilScore.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="capitalize">{councilScore.tier}</Badge>
                <span>Next re-score: {new Date(councilScore.next_rescore_date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-end gap-6">
              <div className="text-right">
                <div className={`text-5xl font-bold ${bandCls.text}`}>{formatScore(councilScore.score)}</div>
                <div className={`text-sm font-semibold ${bandCls.text}`}>{councilScore.band}</div>
              </div>
              {scoreDelta !== 0 && (
                <div className="flex items-center gap-1.5 mb-2">
                  {scoreDeltaDir === "up" ? (
                    <ArrowUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-semibold ${scoreDeltaDir === "up" ? "text-emerald-600" : "text-red-600"}`}>
                    {scoreDelta > 0 ? "+" : ""}{scoreDelta.toFixed(1)} points
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* ─── 1. Completeness ─── */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Assessment Completeness</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-lg font-bold text-foreground">{formatCompleteness(councilScore.completeness)}</span>
              </div>
              <Progress value={councilScore.completeness * 100} className="h-2" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {councilScore.indicators_assessed} of {councilScore.indicators_total} indicators assessed. Missing indicators are shown as "Not Assessed" and excluded from the denominator.
              </p>
            </div>
          </Card>

          {/* ─── 2. Quickest wins ─── */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              Quickest wins (Pro feature)
            </h3>
            {isPro ? (
              <div className="space-y-2.5">
                {councilScore.top_failing_indicators?.slice(0, 3).map((ind, i) => (
                  <div key={i} className="flex items-start justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex-1">
                      <div className="text-xs font-mono text-amber-800 mb-0.5">{ind.id}</div>
                      <div className="text-sm font-medium text-foreground">{ind.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">Effort: {ind.effort}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-amber-900">+{ind.points_available}</div>
                      <div className="text-[10px] text-amber-700">points</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <Lock className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-sky-900 mb-2">Available in Pro</p>
                  <p className="text-xs text-sky-800 mb-3">See the exact actions with the highest ROI for your council.</p>
                  <Link href="/portal/settings?tab=billing">
                    <Button size="sm" variant="outline" className="text-sky-600 border-sky-300 hover:bg-sky-100">
                      Upgrade to Pro <ArrowRight className="w-3 h-3 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* ─── 3. Recent activity ─── */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent activity
            </h3>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-2.5">
                {recentActivity.map((event, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{event.description}</div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {new Date(event.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground p-4 bg-slate-50 rounded-lg">
                No recent activity yet. Your score will update when we re-verify documents on your website.
              </div>
            )}
          </Card>

          {/* ─── 4. Next re-score explanation ─── */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Re-score cadence
            </h3>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-foreground">
                {new Date(councilScore.next_rescore_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isPro
                  ? "Pro subscribers re-score quarterly when we detect changes on your website."
                  : "Verified subscribers re-score annually with the public cycle."}
              </p>
              {isPro && (
                <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                  Your active document scraping runs every 30 days.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* ─── 5. Pro upgrade nudge (Verified only, dismissable) ─── */}
        {isVerifiedTier && !dismissProNudge && (
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-sky-50 border-indigo-200 mb-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-indigo-900 mb-2">Upgrade to Pro</h3>
                <p className="text-xs text-indigo-800 mb-3 leading-relaxed">
                  Councils investing in transparency are upgrading to Pro for quarterly re-scoring, custom action plans, and peer benchmarking.
                </p>
                <div className="space-y-1.5 text-xs text-indigo-800 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>Quarterly re-scoring vs. annual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    <span>Specific action steps for each indicator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>See which peer councils are beating you</span>
                  </div>
                </div>
                <Link href="/portal/settings?tab=billing">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Compare tiers <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Button>
                </Link>
              </div>
              <button
                onClick={() => setDismissProNudge(true)}
                className="text-indigo-600 hover:text-indigo-900 flex-shrink-0 mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
