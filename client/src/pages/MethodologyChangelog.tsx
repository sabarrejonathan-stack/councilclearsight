/**
 * /methodology/changelog — every rule change, versioned and signed.
 *
 * This is the accountability artefact that makes "the methodology is open to
 * scrutiny" real. Every change ever made to the scoring rules is listed here,
 * with the proposal, the public comment period, the diff, the sign-off, and
 * the score-delta it caused.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, FileText, Clock, Mail,
  CheckCircle2, AlertTriangle, ExternalLink, Lock,
} from "lucide-react";
import { METHODOLOGY_VERSION } from "@/lib/scoring";

type ChangeStatus = "accepted" | "proposed" | "rejected";

type Change = {
  version: string;
  status: ChangeStatus;
  date: string;
  title: string;
  rationale: string;
  proposer: string;
  reviewer?: string;
  publicCommentDays?: number;
  councilsMoved?: number;
  bandCrossings?: number;
};

/**
 * Real history of the methodology. Only actual events should be listed here —
 * this page is a public audit record and must not contain fabricated entries.
 */
const CHANGES: Change[] = [
  {
    version: "v3.0",
    status: "accepted",
    date: "24 April 2026",
    title: "Clean-slate rewrite: deterministic engine, honest gaps, no score cap",
    rationale:
      "Internal audit revealed non-determinism in the v2 scoring (same inputs → different scores), a methodology/data mismatch (Pillar 3 described differently on the site than in the database), and silent imputation of zero for not-assessed indicators. v3 re-architects scoring as a pure Python function with 20 unit tests, introduces 'Not Assessed' as distinct from zero, and retires the 95-score cap for non-subscribers.",
    proposer: "Jonathan Sabarre (founder)",
    reviewer: "[public comment period]",
    publicCommentDays: 7,
  },
  // Future entries will be appended below as methodology evolves.
];

const UPCOMING_PROPOSALS: Change[] = [
  // Deliberately empty at launch. Fill as proposals are opened.
];

const REJECTED: Change[] = [
  // Deliberately empty at launch.
];

export default function MethodologyChangelog() {
  useSEO({
    title: `Methodology changelog — every rule change ever made | Council ClearSight`,
    description: "A public, versioned log of every change to the CC-TI scoring methodology. Every proposal, every decision, every score delta.",
    canonicalPath: "/methodology/changelog",
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container max-w-4xl">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 font-mono">Changelog</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">Every methodology change, versioned and signed.</h1>
          <p className="text-white/80 text-sm leading-relaxed max-w-2xl">A public log of every change to the CC-TI scoring rules. Every proposal sits for at least seven days of public comment; every accepted change carries a named reviewer and a record of how many councils it moved.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/contact?topic=methodology">
              <Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                <Mail className="w-4 h-4 mr-2" /> Propose a methodology change
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container max-w-4xl py-16 space-y-16">

        {/* Process explainer */}
        <section>
          <h2 className="text-xl font-bold mb-4">How a change happens</h2>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { n: 1, title: "Proposal opened", body: "A written proposal sent to the editorial team, describing the change, the rationale, and the expected impact on councils' scores." },
              { n: 2, title: "7-day public comment", body: "Minimum seven calendar days for any member of the public to raise objections or suggest refinements." },
              { n: 3, title: "Score-delta report", body: "The engine runs the proposed change against the current audit CSV. A diff is posted: how many councils move by more than one band?" },
              { n: 4, title: "Sign-off + merge", body: "The editorial lead signs off. A new methodology version is cut. A fresh audit CSV publishes the next night." },
            ].map((s) => (
              <div key={s.n} className="p-4 bg-white border border-slate-200 rounded-xl">
                <div className="mono text-[10px] text-accent font-semibold mb-2">Step {s.n}</div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Guardrail:</strong> if a change would move more than 10 councils per band, it requires explicit editorial sign-off, a delay of at least 14 days, and an email notification to every affected subscribed council before the change takes effect.
            </p>
          </div>
        </section>

        {/* Accepted changes */}
        <section>
          <h2 className="text-xl font-bold mb-2">Accepted changes</h2>
          <p className="text-sm text-muted-foreground mb-6">Ordered newest first. Current methodology: <Badge className="mono text-[10px]">{METHODOLOGY_VERSION}</Badge></p>
          <div className="space-y-4">
            {CHANGES.map((c) => <ChangeCard key={c.version} change={c} />)}
          </div>
        </section>

        {/* Upcoming proposals */}
        <section>
          <h2 className="text-xl font-bold mb-2">Upcoming proposals <Badge variant="outline" className="ml-2 font-mono text-[10px]">{UPCOMING_PROPOSALS.length} open</Badge></h2>
          <p className="text-sm text-muted-foreground mb-4">Changes currently in the public-comment window.</p>
          {UPCOMING_PROPOSALS.length === 0 ? (
            <Card className="p-6 bg-slate-50 border-dashed border-slate-300 text-center text-sm text-muted-foreground">
              No open proposals right now. Think the methodology should change? <Link href="/contact?topic=methodology" className="text-accent hover:underline">Send us a proposal.</Link>
            </Card>
          ) : (
            <div className="space-y-4">{UPCOMING_PROPOSALS.map((c) => <ChangeCard key={c.version} change={c} />)}</div>
          )}
        </section>

        {/* Rejected */}
        <section>
          <h2 className="text-xl font-bold mb-2">Rejected proposals <Badge variant="outline" className="ml-2 font-mono text-[10px]">{REJECTED.length} logged</Badge></h2>
          <p className="text-sm text-muted-foreground mb-4">Proposals we considered and declined. The reasoning is public so future proposals don't retread the same ground.</p>
          {REJECTED.length === 0 ? (
            <Card className="p-6 bg-slate-50 border-dashed border-slate-300 text-center text-sm text-muted-foreground">
              No rejections yet. A rejected proposal lives here forever with the reasoning.
            </Card>
          ) : (
            <div className="space-y-4">{REJECTED.map((c) => <ChangeCard key={c.version} change={c} />)}</div>
          )}
        </section>

      </div>
    </PublicLayout>
  );
}

function ChangeCard({ change }: { change: Change }) {
  const statusStyles: Record<ChangeStatus, string> = {
    accepted: "bg-emerald-50 border-emerald-200 text-emerald-800",
    proposed: "bg-amber-50 border-amber-200 text-amber-800",
    rejected: "bg-slate-100 border-slate-200 text-slate-700",
  };
  const statusIcons: Record<ChangeStatus, any> = {
    accepted: CheckCircle2,
    proposed: Clock,
    rejected: AlertTriangle,
  };
  const StatusIcon = statusIcons[change.status];

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Badge className="mono">{change.version}</Badge>
          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${statusStyles[change.status]}`}>
            <StatusIcon className="w-3 h-3" />
            <span className="capitalize">{change.status}</span>
          </span>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />{change.date}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 leading-snug">{change.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{change.rationale}</p>
      <div className="grid sm:grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
        <div><span className="text-muted-foreground">Proposer: </span><span className="font-medium text-foreground">{change.proposer}</span></div>
        {change.reviewer && <div><span className="text-muted-foreground">Reviewer: </span><span className="font-medium text-foreground">{change.reviewer}</span></div>}
        {change.publicCommentDays && <div><span className="text-muted-foreground">Public comment: </span><span className="font-medium text-foreground">{change.publicCommentDays} days</span></div>}
        {change.councilsMoved !== undefined && <div><span className="text-muted-foreground">Councils moved: </span><span className="font-medium text-foreground">{change.councilsMoved.toLocaleString()}</span></div>}
        {change.bandCrossings !== undefined && <div><span className="text-muted-foreground">Band crossings: </span><span className="font-medium text-foreground">{change.bandCrossings.toLocaleString()}</span></div>}
      </div>
    </Card>
  );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           