/**
 * Portal Reports — downloadable artefacts and past score snapshots.
 *
 * Displays:
 *  1. Printable scorecard (A4 PDF)
 *  2. Detailed audit (Platinum only)
 *  3. Score history CSV
 *  4. Certificate of claim (Verified+)
 *  5. Snapshot archive with dates
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PortalLayout from "@/components/PortalLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import {
  Download, Lock, FileText, Eye, Calendar, Award,
} from "lucide-react";
import {
  formatScore, bandColorClasses,
  type CouncilScore,
} from "@/lib/scoring";

export default function PortalReports() {
  const { data: council, isLoading } = trpc.portal.dashboard.useQuery();
  const { data: scoreHistory } = trpc.portal.scoreHistory.list.useQuery();
  const { data: snapshots } = trpc.portal.snapshots.list.useQuery();
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useSEO({
    title: "Reports — Council ClearSight Portal",
    description: "Download scorecards, audit reports, and historical score data.",
    canonicalPath: "/portal/reports",
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
  const bandCls = bandColorClasses(councilScore.band as any);
  const isPro = councilScore.tier === "platinum";

  const handleGenerateScorecard = async () => {
    setGeneratingPDF(true);
    try {
      // In production, call: await trpc.portal.generateScorecard.mutate()
      // For now, placeholder
      console.log("Generating scorecard PDF...");
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <PortalLayout council={councilScore}>
      <div className="container max-w-6xl py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
          <p className="text-sm text-muted-foreground">Download scorecards, audits, and historical data.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* ─── 1. Printable scorecard ─── */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Printable Scorecard</h3>
                <p className="text-xs text-muted-foreground mt-1">A4 PDF for your noticeboard</p>
              </div>
              <FileText className="w-4 h-4 text-slate-500" />
            </div>

            <div className={`p-4 rounded-lg border mb-4 ${bandCls.bg} ${bandCls.border}`}>
              <div className="flex items-baseline justify-between mb-2">
                <span className={`text-2xl font-bold ${bandCls.text}`}>{formatScore(councilScore.score)}</span>
                <span className={`text-xs font-semibold ${bandCls.text}`}>{councilScore.band}</span>
              </div>
              <div className="text-xs text-muted-foreground">{councilScore.name}</div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-mono text-foreground">{new Date(councilScore.last_scored_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Valid until</span>
                <span className="font-mono text-foreground">{new Date(councilScore.next_rescore_date).toLocaleDateString()}</span>
              </div>
            </div>

            <Button
              size="sm"
              className="w-full"
              onClick={handleGenerateScorecard}
              disabled={generatingPDF}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {generatingPDF ? "Generating..." : "Download PDF"}
            </Button>
          </Card>

          {/* ─── 2. Detailed audit (Platinum only) ─── */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Detailed Audit</h3>
                <p className="text-xs text-muted-foreground mt-1">One page per pillar, with evidence</p>
              </div>
              <Lock className={`w-4 h-4 ${isPro ? "text-slate-400" : "text-amber-600"}`} />
            </div>

            {isPro ? (
              <>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Comprehensive PDF with evidence links and recommendations for each pillar.
                </p>
                <Button size="sm" className="w-full" variant="outline">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download PDF
                </Button>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-900 mb-2">
                  Available in <span className="font-semibold">Platinum</span> tier.
                </p>
                <p className="text-[10px] text-amber-800 mb-3">Get detailed evidence for each pillar and action steps.</p>
                <Button size="sm" variant="outline" className="w-full text-amber-700 border-amber-300 hover:bg-amber-100">
                  Upgrade to Platinum
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* ─── 3. Score history CSV ─── */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Score History</h3>
                <p className="text-xs text-muted-foreground mt-1">CSV of all past scores</p>
              </div>
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>

            {scoreHistory && scoreHistory.length > 0 ? (
              <>
                <div className="space-y-1.5 mb-4 text-xs">
                  {scoreHistory.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-muted-foreground">{new Date(h.scored_at).toLocaleDateString()}</span>
                      <span className="font-semibold text-foreground">{formatScore(h.score)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mb-3">
                  {scoreHistory.length} score records available
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground mb-4">No historical data yet. Check back after your next re-score.</p>
            )}

            <Button size="sm" className="w-full" variant="outline">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download CSV
            </Button>
          </Card>

          {/* ─── 4. Certificate of claim ─── */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Certificate of Claim</h3>
                <p className="text-xs text-muted-foreground mt-1">Verified badge on file</p>
              </div>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>

            {councilScore.tier !== "free" ? (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4 text-xs text-emerald-900">
                  <div className="font-semibold mb-1">Verified by Council ClearSight</div>
                  <div className="text-emerald-800">
                    as of {new Date(councilScore.verified_at).toLocaleDateString()}
                  </div>
                </div>
                <Button size="sm" className="w-full" variant="outline">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download PDF
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Claim your page by upgrading to Verified to earn a formal certificate.
              </p>
            )}
          </Card>
        </div>

        {/* ─── 5. Snapshot archive ─── */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Scorecard Archive</h3>

          {snapshots && snapshots.length > 0 ? (
            <div className="space-y-2">
              {snapshots.map((snap, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{formatScore(snap.score)}</div>
                    <div className="text-xs text-muted-foreground">{new Date(snap.scored_at).toLocaleDateString()}</div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{snap.band}</Badge>
                  <Button size="sm" variant="ghost" className="ml-2">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No archived snapshots yet.</p>
            </div>
          )}
        </Card>

        {/* Empty state messaging */}
        {!scoreHistory || scoreHistory.length === 0 ? (
          <div className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Getting started</h4>
            <p className="text-xs text-blue-800">
              Once your council is scored, you'll see detailed reports, historical snapshots, and downloadable certificates here. Check back after your first re-score.
            </p>
          </div>
        ) : null}
      </div>
    </PortalLayout>
  );
}
