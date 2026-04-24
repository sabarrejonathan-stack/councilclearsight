/**
 * /methodology/disputes — every public challenge and its decision, logged.
 *
 * Residents, clerks, and journalists can see the full body of disputes the
 * index has received. This page makes two promises real:
 *   1. We act on challenges (not just accept them).
 *   2. We explain every decision so future submitters know what's required.
 */

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import {
  Search, ArrowRight, Clock, CheckCircle2, XCircle, ExternalLink,
  TrendingUp, Flag, AlertTriangle,
} from "lucide-react";

type Decision = "pending" | "upheld" | "rejected" | "partial";

type Dispute = {
  id: string;
  submittedAt: string;      // ISO
  decidedAt?: string;       // ISO
  slaDays: number;
  councilSlug: string;
  councilName: string;
  indicator: string;        // "1.1" or "overall"
  indicatorLabel: string;
  submitterRole: string;    // resident / clerk / ...
  evidence: string;         // short public-facing summary
  decision: Decision;
  decisionSummary?: string; // short public-facing summary
  pointsDelta?: number;     // e.g. +20 if the score was revised upwards
};

const DECISION_META: Record<Decision, { label: string; cls: string; icon: any }> = {
  pending:  { label: "Pending",  cls: "bg-amber-50 border-amber-200 text-amber-800",     icon: Clock },
  upheld:   { label: "Upheld",   cls: "bg-emerald-50 border-emerald-200 text-emerald-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", cls: "bg-slate-100 border-slate-200 text-slate-700",    icon: XCircle },
  partial:  { label: "Partial",  cls: "bg-sky-50 border-sky-200 text-sky-800",           icon: CheckCircle2 },
};

export default function DisputesQueue() {
  useSEO({
    title: "Public disputes queue — every challenge, every decision | Council ClearSight",
    description: "The public log of every score challenge ever filed against the CC-TI index, and every decision we've made on it. Full transparency, including the evidence reviewed.",
    canonicalPath: "/methodology/disputes",
  });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Decision>("all");
  const [indicator, setIndicator] = useState<string>("all");

  const { data: disputes = [], isLoading } = trpc.challenges.listPublic.useQuery();

  // Stats
  const stats = useMemo(() => {
    const list = disputes as Dispute[];
    const pending = list.filter((d) => d.decision === "pending");
    const decided = list.filter((d) => d.decision !== "pending");
    const upheld = list.filter((d) => d.decision === "upheld" || d.decision === "partial");
    const avgSla = decided.length === 0 ? null : Math.round(10 * decided.reduce((a, d) => a + d.slaDays, 0) / decided.length) / 10;
    return {
      total: list.length,
      pending: pending.length,
      decided: decided.length,
      upheldPct: decided.length === 0 ? null : Math.round(100 * upheld.length / decided.length),
      avgSlaDays: avgSla,
    };
  }, [disputes]);

  const visible = useMemo(() => {
    const list = disputes as Dispute[];
    return list
      .filter((d) => q === "" || d.councilName.toLowerCase().includes(q.toLowerCase()) || d.indicatorLabel.toLowerCase().includes(q.toLowerCase()))
      .filter((d) => status === "all" || d.decision === status)
      .filter((d) => indicator === "all" || d.indicator === indicator)
      .sort((a, b) => new Date(b.submittedAt).valueOf() - new Date(a.submittedAt).valueOf());
  }, [disputes, q, status, indicator]);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container max-w-4xl">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 font-mono">Disputes queue</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">Every challenge. Every decision. Published here.</h1>
          <p className="text-white/80 text-sm leading-relaxed max-w-2xl">The disputes queue is the accountability half of the methodology. We aim to decide every challenge within five working days and publish the evidence, the decision, and any resulting score delta. If we ever fail to do that, it shows up on this page as a stuck entry — which is exactly the point.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="container max-w-5xl -mt-8 relative z-10 mb-10">
        <Card className="p-5 bg-white border-slate-200 rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat label="Challenges received" value={stats.total.toLocaleString()} />
            <Stat label="Pending decision" value={stats.pending.toLocaleString()} tone={stats.pending > 10 ? "warn" : "neutral"} />
            <Stat label="Upheld (of decided)" value={stats.upheldPct === null ? "—" : `${stats.upheldPct}%`} />
            <Stat label="Avg. decision time" value={stats.avgSlaDays === null ? "—" : `${stats.avgSlaDays} days`} tone={stats.avgSlaDays !== null && stats.avgSlaDays > 5 ? "warn" : "neutral"} />
          </div>
        </Card>
      </section>

      {/* Filters + table */}
      <section className="container max-w-5xl pb-20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by council or indicator…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="upheld">Upheld</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={indicator} onValueChange={setIndicator}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Any indicator" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All indicators</SelectItem>
              <SelectItem value="overall">Overall score</SelectItem>
              {["1.1","1.2","1.3","2.1","2.2","2.3","2.4","3.1","3.2","3.3","4.1","4.2","4.3","4.4"].map((i) => (
                <SelectItem key={i} value={i}>Indicator {i}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/contact"><Button variant="outline"><Flag className="w-3.5 h-3.5 mr-1.5" /> Submit a challenge</Button></Link>
        </div>

        {isLoading ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">Loading the queue…</Card>
        ) : visible.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-sm text-muted-foreground mb-2">No challenges match those filters.</p>
            {stats.total === 0 && <p className="text-xs text-muted-foreground">(Launch queue is empty. Challenges filed after 24 April 2026 will appear here.)</p>}
          </Card>
        ) : (
          <div className="space-y-3">
            {visible.map((d) => <DisputeRow key={d.id} dispute={d} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function Stat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warn" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${tone === "warn" ? "text-amber-700" : "text-foreground"} mono`}>{value}</div>
    </div>
  );
}

function DisputeRow({ dispute }: { dispute: Dispute }) {
  const meta = DECISION_META[dispute.decision];
  const Icon = meta.icon;
  return (
    <Card className="p-5 bg-white border-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="mono text-[10px]">{dispute.id}</Badge>
          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${meta.cls}`}>
            <Icon className="w-3 h-3" />{meta.label}
          </span>
          <span className="text-xs text-muted-foreground">Submitted {new Date(dispute.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} by {dispute.submitterRole}</span>
        </div>
        {dispute.pointsDelta !== undefined && dispute.pointsDelta !== 0 && (
          <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ${dispute.pointsDelta > 0 ? "text-emerald-700" : "text-red-700"}`}>
            <TrendingUp className="w-3 h-3" />
            {dispute.pointsDelta > 0 ? "+" : ""}{dispute.pointsDelta} pts
          </span>
        )}
      </div>
      <h3 className="font-semibold text-foreground mb-1">
        <Link href={`/council/${dispute.councilSlug}`} className="hover:text-accent">{dispute.councilName}</Link>
        <span className="text-muted-foreground font-normal text-sm"> · indicator {dispute.indicator} · {dispute.indicatorLabel}</span>
      </h3>
      <div className="text-sm text-muted-foreground mb-3 leading-relaxed"><strong className="text-foreground">Evidence submitted:</strong> {dispute.evidence}</div>
      {dispute.decisionSummary && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Decision ({dispute.decidedAt ? new Date(dispute.decidedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}, {dispute.slaDays} working days)</div>
          <p className="text-foreground/90 leading-relaxed">{dispute.decisionSummary}</p>
        </div>
      )}
    </Card>
  );
}
