/**
 * Portal Recommendations — actionable improvement plan (core Platinum value).
 *
 * Content:
 *  1. Your roadmap: ordered list of 5–10 recommendations
 *  2. In progress: recommendations the clerk marked as "working on"
 *  3. Completed: done recommendations with dates + points earned
 *  4. Request custom action: form for bespoke guidance (1 request/quarter in Platinum)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PortalLayout from "@/components/PortalLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import {
  Zap, CheckCircle2, Clock, Lock, ArrowRight, AlertCircle, Send,
} from "lucide-react";
import {
  type CouncilScore,
} from "@/lib/scoring";

export default function PortalRecommendations() {
  const { data: council, isLoading } = trpc.portal.dashboard.useQuery();
  const { data: recommendations } = trpc.portal.recommendations.list.useQuery();
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestText, setRequestText] = useState("");

  useSEO({
    title: "Recommendations — Council ClearSight Portal",
    description: "Your customised improvement roadmap to increase transparency.",
    canonicalPath: "/portal/recommendations",
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

  const roadmap = recommendations?.filter((r) => r.status === "pending") ?? [];
  const inProgress = recommendations?.filter((r) => r.status === "in_progress") ?? [];
  const completed = recommendations?.filter((r) => r.status === "completed") ?? [];

  const handleSubmitRequest = async () => {
    if (!requestText.trim()) return;
    // In production: await trpc.portal.recommendations.requestCustom.mutate({ text: requestText })
    console.log("Custom request:", requestText);
    setRequestText("");
    setRequestOpen(false);
  };

  return (
    <PortalLayout council={councilScore}>
      <div className="container max-w-6xl py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Improvement Roadmap</h1>
          <p className="text-sm text-muted-foreground">
            {isPro ? "Your personalised action plan to close gaps and reach Excellent." : "Platinum feature — upgrade to unlock."}
          </p>
        </div>

        {!isPro ? (
          // Verified tier: teaser
          <Card className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 mb-10">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-900 mb-2">Recommendations are a Platinum feature</h3>
                <p className="text-sm text-emerald-800 mb-4 leading-relaxed">
                  Get a specific, prioritised action plan: "Publish May 2026 minutes at /minutes/2026-05.pdf and link from your homepage." Each action shows the exact points it'll earn and estimated effort.
                </p>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Upgrade to Platinum <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* ─── 1. Your roadmap ─── */}
            <Card className="p-6 mb-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Your roadmap
                </h3>
                <span className="text-xs text-muted-foreground">{roadmap.length} actions</span>
              </div>

              {roadmap.length > 0 ? (
                <div className="space-y-3">
                  {roadmap.map((rec, i) => (
                    <RoadmapItem key={i} rec={rec} index={i + 1} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recommendations yet. We'll add actions as we detect gaps.</p>
                </div>
              )}
            </Card>

            {/* ─── 2. In progress ─── */}
            {inProgress.length > 0 && (
              <Card className="p-6 mb-10">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  In progress ({inProgress.length})
                </h3>
                <div className="space-y-3">
                  {inProgress.map((rec, i) => (
                    <div key={i} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge className="text-[10px] font-mono mb-2">{rec.indicator_id}</Badge>
                          <div className="text-sm font-medium text-foreground">{rec.action}</div>
                          <div className="text-xs text-muted-foreground mt-1">Effort: {rec.effort}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-blue-900">+{rec.points_available}</div>
                          <div className="text-[10px] text-blue-700">points</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Mark done
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ─── 3. Completed ─── */}
            {completed.length > 0 && (
              <Card className="p-6 mb-10">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Completed ({completed.length})
                </h3>
                <div className="space-y-2">
                  {completed.map((rec, i) => (
                    <div key={i} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground line-through opacity-75">
                          {rec.action}
                        </div>
                        <div className="text-xs text-emerald-700 mt-1">
                          Done on {new Date(rec.completed_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-emerald-900">+{rec.points_available}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ─── 4. Request custom action ─── */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-600" />
                Request custom guidance
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {councilScore.custom_requests_used ?? 0}/1 request used this quarter.
              </p>

              {requestOpen ? (
                <div className="space-y-3">
                  <textarea
                    placeholder="E.g., 'Our minutes are published in a folder — how do we link each month to the agenda?' One request per quarter."
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSubmitRequest}
                      disabled={!requestText.trim() || (councilScore.custom_requests_used ?? 0) >= 1}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Send request
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRequestOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRequestOpen(true)}
                  disabled={(councilScore.custom_requests_used ?? 0) >= 1}
                >
                  Ask for help on an indicator
                </Button>
              )}
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
}

// --- components ---------------------------------------------------------

interface Recommendation {
  id: string;
  indicator_id: string;
  action: string;
  effort: string;
  points_available: number;
  peer_example_council?: string;
  peer_example_url?: string;
  status: "pending" | "in_progress" | "completed";
  completed_at?: string;
}

function RoadmapItem({ rec, index }: { rec: Recommendation; index: number }) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-4 mb-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-xs font-semibold">
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <Badge className="text-[10px] font-mono mb-2">{rec.indicator_id}</Badge>
          <div className="text-sm font-medium text-foreground mb-1">{rec.action}</div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            Example: {rec.peer_example_council ? (
              <a href={rec.peer_example_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                {rec.peer_example_council}
              </a>
            ) : (
              "[peer example]"
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2 py-1 bg-slate-100 rounded text-muted-foreground">Effort: {rec.effort}</span>
          <span className="font-semibold text-foreground">+{rec.points_available} points</span>
        </div>
        <Button size="sm" variant="outline">
          Mark as working on this
        </Button>
      </div>
    </div>
  );
}
