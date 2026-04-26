/**
 * MethodologyChangelog — every rule change versioned (compact, valid).
 */
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight, FileText, Clock, Mail, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
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
};

const CHANGES: Change[] = [
  {
    version: "v4.0",
    status: "accepted",
    date: "26 April 2026",
    title: "Universal coverage, three audit states, click-through evidence URLs",
    rationale: "v4.0 expands the registry from 7,031 to 11,057 councils — every parish, town, city and community council in England (ONS parish register + the Council ClearSight database). Introduces the three audit states (verified / under_audit / under_audit_with_url) so every council page is honest about whether it has been independently scanned. Every verified indicator now carries an evidence_url linking to a public document on the council's own domain. Bands renamed to Excellent (80–100) / Good (65–79) / Developing (50–64) / Needs Attention (0–49) to match the binary 80/65/50 cutoffs. The pillar weighting is corrected to four equal pillars at 25 points each.",
    proposer: "Jonathan Sabarre (founder)",
  },
  {
    version: "v3.0",
    status: "accepted",
    date: "24 April 2026",
    title: "Clean-slate rewrite: deterministic engine, honest gaps, no score cap",
    rationale: "Internal audit revealed non-determinism in v2 scoring, a methodology/data mismatch, and silent imputation of zero for not-assessed indicators. v3 re-architects scoring as a pure function, introduces 'Not Assessed' as distinct from zero, and retires the 95-score cap for non-subscribers.",
    proposer: "Jonathan Sabarre (founder)",
  },
];

const UPCOMING: Change[] = [];
const REJECTED: Change[] = [];

const PROCESS = [
  { n: 1, title: "Proposal opened", body: "A written proposal sent to the editorial team, describing the change and expected impact." },
  { n: 2, title: "7-day public comment", body: "Minimum seven days for anyone to raise objections or suggestions." },
  { n: 3, title: "Score-delta report", body: "The engine runs the proposed change. We publish how many councils would move by more than one band." },
  { n: 4, title: "Sign-off + merge", body: "Editorial lead signs off. A new methodology version is cut. Fresh scores publish." },
];

export default function MethodologyChangelog() {
  useSEO({
    title: "Methodology changelog — every rule change | Council ClearSight",
    description: "A public log of every change to the VDTI scoring methodology.",
    canonicalPath: "/methodology/changelog",
  });
  return (
    <PublicLayout>
      <section className="bg-primary py-16">
        <div className="container max-w-4xl">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 font-mono">Changelog</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">Every methodology change, versioned and signed.</h1>
          <p className="text-white/80 text-sm leading-relaxed max-w-2xl">A public log of every change to the VDTI scoring rules. Every proposal sits for seven days of public comment; every accepted change carries a named reviewer.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/contact?topic=methodology"><Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10"><Mail className="w-4 h-4 mr-2" /> Propose a methodology change</Button></Link>
          </div>
        </div>
      </section>

      <div className="container max-w-4xl py-16 space-y-16">
        <section>
          <h2 className="text-xl font-bold mb-4">How a change happens</h2>
          <div className="grid md:grid-cols-4 gap-3">
            {PROCESS.map((s) => (
              <div key={s.n} className="p-4 bg-white border border-slate-200 rounded-xl">
                <div className="mono text-[10px] text-accent font-semibold mb-2">Step {s.n}</div>
                <h3 className="font-semibold text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Guardrail:</strong> if a change would move more than 10 councils per band, it requires editorial sign-off, a delay of at least 14 days, and email notification to every affected subscribed council.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Accepted changes</h2>
          <p className="text-sm text-muted-foreground mb-6">Current methodology: <Badge className="mono text-[10px]">{METHODOLOGY_VERSION}</Badge></p>
          <div className="space-y-4">
            {CHANGES.map((c) => <ChangeCard key={c.version} change={c} />)}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Upcoming proposals <Badge variant="outline" className="ml-2 font-mono text-[10px]">{UPCOMING.length} open</Badge></h2>
          {UPCOMING.length === 0 ? (
            <Card className="p-6 bg-slate-50 border-dashed text-center text-sm text-muted-foreground">
              No open proposals right now. Think the methodology should change? <Link href="/contact?topic=methodology" className="text-accent hover:underline">Send us a proposal.</Link>
            </Card>
          ) : (
            <div className="space-y-4">{UPCOMING.map((c) => <ChangeCard key={c.version} change={c} />)}</div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Rejected proposals <Badge variant="outline" className="ml-2 font-mono text-[10px]">{REJECTED.length} logged</Badge></h2>
          {REJECTED.length === 0 ? (
            <Card className="p-6 bg-slate-50 border-dashed text-center text-sm text-muted-foreground">
              No rejections yet.
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
  const StatusIcon = change.status === "accepted" ? CheckCircle2 : change.status === "proposed" ? Clock : AlertTriangle;
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
        <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {change.date}</div>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{change.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{change.rationale}</p>
    </Card>
  );
}
