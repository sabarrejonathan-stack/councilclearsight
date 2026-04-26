/**
 * Portal Benchmarking — peer comparison (Platinum only; Verified sees teaser + CTA).
 *
 * Content (Platinum):
 *  1. Peer group definition card
 *  2. Peer comparison table: rank, name, score, pillars, delta
 *  3. "What the leaders do differently" card
 *  4. Regional distribution chart
 */

import { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PortalLayout from "@/components/PortalLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import {
  Lock, TrendingUp, ArrowRight, Users, Award,
} from "lucide-react";
import {
  formatScore, bandColorClasses, PILLAR_META, type CouncilScore,
} from "@/lib/scoring";

export default function PortalBenchmarking() {
  const { data: council, isLoading } = trpc.portal.dashboard.useQuery();
  const { data: peers } = trpc.portal.benchmarking.peers.useQuery();
  const { data: leaders } = trpc.portal.benchmarking.leaders.useQuery();
  const { data: distribution } = trpc.portal.benchmarking.distribution.useQuery();

  useSEO({
    title: "Benchmarking — Council ClearSight Portal",
    description: "See how your council compares to peer councils in your region and type.",
    canonicalPath: "/portal/benchmarking",
  });

  if (isLoading || !council) {
    return (
      <PortalLayout>
        <div className="container max-w-6xl py-12">
          <div className="h-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </PortalLayout>
    );
  }

  const councilScore = council as CouncilScore;
  const isPro = councilScore.tier === "platinum";

  return (
    <PortalLayout council={councilScore}>
      <div className="container max-w-6xl py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Peer Benchmarking</h1>
          <p className="text-sm text-muted-foreground">See how you compare to councils in your region and type.</p>
        </div>

        {!isPro ? (
          // Verified tier: teaser + CTA
          <Card className="p-8 bg-gradient-to-br from-indigo-50 to-sky-50 border-indigo-200">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Lock className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-indigo-900 mb-2">Benchmarking is a Platinum feature</h3>
                <p className="text-sm text-indigo-800 mb-4 leading-relaxed">
                  See which peer councils are beating you on specific pillars. Discover what the top performers publish that you don't. Use those insights to focus your improvement roadmap.
                </p>
                <div className="space-y-2 mb-6 text-sm text-indigo-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Compare to 10 peer councils in your region</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>See regional score distribution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Learn from top-performing councils</span>
                  </div>
                </div>
                <Link href="/portal/settings?tab=billing">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Upgrade to Platinum <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* ─── 1. Peer group definition ─── */}
            <Card className="p-6 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Your Peer Group</h3>
              <div className="text-sm text-foreground leading-relaxed">
                <p className="mb-2">
                  The 10 councils in <span className="font-semibold">{councilScore.region}</span> of the same type ({councilScore.type.replace("_", " ")}) closest to your population band.
                </p>
                <p className="text-xs text-muted-foreground">
                  These councils face similar constraints and opportunities, making them your most relevant comparators.
                </p>
              </div>
            </Card>

            {/* ─── 2. Peer comparison table ─── */}
            <Card className="p-6 mb-6 overflow-x-auto">
              <h3 className="text-sm font-semibold text-foreground mb-4">Peer Comparison</h3>
              {peers && peers.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-2 font-semibold text-foreground text-xs">#</th>
                      <th className="text-left py-2 px-2 font-semibold text-foreground text-xs">Council</th>
                      <th className="text-center py-2 px-2 font-semibold text-foreground text-xs">Score</th>
                      {([1, 2, 3, 4] as const).map((p) => (
                        <th
                          key={p}
                          className="text-center py-2 px-2 font-semibold text-foreground text-xs"
                          title={PILLAR_META[p].label}
                        >
                          P{p}
                        </th>
                      ))}
                      <th className="text-center py-2 px-2 font-semibold text-foreground text-xs">vs. You</th>
                    </tr>
                  </thead>
                  <tbody>
                    {peers.map((peer, i) => {
                      const delta = peer.score - councilScore.score;
                      const isYou = peer.slug === councilScore.slug;
                      return (
                        <tr
                          key={i}
                          className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                            isYou ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="py-2.5 px-2 text-xs text-muted-foreground">{i + 1}</td>
                          <td className="py-2.5 px-2">
                            <Link href={`/council/${peer.slug}`} className="text-accent hover:underline font-medium text-sm">
                              {peer.name}
                            </Link>
                            {isYou && (
                              <Badge variant="outline" className="text-[10px] ml-2">
                                You
                              </Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-foreground">{formatScore(peer.score)}</td>
                          {([1, 2, 3, 4] as const).map((p) => (
                            <td key={p} className="py-2.5 px-2 text-center text-xs font-mono text-muted-foreground">
                              {peer.pillar_scores[p] ?? "—"}
                            </td>
                          ))}
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`text-xs font-semibold ${
                                delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-slate-600"
                              }`}
                            >
                              {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No peer councils found in your cohort yet.</p>
                </div>
              )}
            </Card>

            {/* ─── 3. What the leaders do differently ─── */}
            {leaders && leaders.length > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  What the leaders do differently
                </h3>
                <div className="space-y-3">
                  {leaders.map((leader, i) => (
                    <div key={i} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{leader.name}</div>
                          <div className="text-xs text-muted-foreground mb-2">Score: {formatScore(leader.score)}</div>
                          <div className="text-xs text-foreground leading-relaxed">
                            They publish <span className="font-semibold">{leader.differentiating_indicators.join(", ")}</span> which
                            {councilScore.score > 0 ? " you " : " "} currently don't, adding {leader.points_ahead} points to their score.
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ─── 4. Regional distribution (placeholder) ─── */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Regional Distribution</h3>
              {distribution ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-4">
                    Your position among the {distribution.total_in_region} councils in {councilScore.region}.
                  </p>
                  <div className="h-40 bg-slate-100 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    [Regional distribution chart — recharts or pure CSS bar]
                  </div>
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 mt-4">
                    <div>
                      <span className="font-semibold text-foreground">{distribution.percentile}th</span>
                      <div>percentile</div>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{distribution.regional_rank}</span>
                      <div>of {distribution.total_in_region}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-4 bg-slate-50 rounded">
                  Distribution data loading...
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
