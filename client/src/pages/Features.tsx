/**
 * Features — what each tier unlocks (compact, valid).
 */
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight, BadgeCheck, ShieldCheck, Eye, Sparkles, CheckCircle2, Flag } from "lucide-react";

const GROUPS = [
  {
    icon: Eye,
    title: "Public transparency (always free)",
    body: "Every capability below is free forever and available to anyone with a browser.",
    features: [
      { label: "The CC-TI score", body: "A single 0–100 score per council. Same for every viewer." },
      { label: "14 indicator verdicts", body: "Each with the exact input our rule saw and the verdict." },
      { label: "Evidence trail", body: "Every source link, last-verified date, and input value." },
      { label: "Methodology document", body: "Plain English. Versioned in a changelog." },
      { label: "Public challenge route", body: "Any member of the public can challenge any indicator." },
      { label: "Directory search & sort", body: "All 7,031 councils in England, searchable and sortable." },
    ],
  },
  {
    icon: BadgeCheck,
    title: "Page ownership (Verified tier)",
    body: "The Verified tier is for a clerk who wants to claim the page and react to changes.",
    features: [
      { label: "Verified badge", body: "Publicly confirms the clerk has claimed the page." },
      { label: "Direct field editing", body: "Change contact details without filing a challenge." },
      { label: "Priority challenge lane", body: "3-day SLA instead of 5." },
      { label: "Score-change alerts", body: "Email the clerk when any indicator flips." },
      { label: "Printable scorecard", body: "One-page A4 PDF for the council noticeboard." },
      { label: "Unlimited council users", body: "No per-seat fee. All councillors share one subscription." },
    ],
  },
  {
    icon: Sparkles,
    title: "Active improvement & engagement (Pro tier)",
    body: "Pro is where we stop being a dashboard and start being a partner.",
    features: [
      { label: "Personalised roadmap", body: "A specific, actionable checklist within 7 days of subscribing." },
      { label: "Quarterly re-scoring", body: "Every 90 days, not every 12 months." },
      { label: "Resident engagement playbook", body: "Newsletter wording, social posts, meeting announcements." },
      { label: "Content templates", body: "Agendas, minutes, annual reports, newsletters — drawn from Exemplary peers." },
      { label: "Peer benchmarking", body: "Head-to-head comparison against 10 similar councils." },
      { label: "Direct support channel", body: "One working day response from a human." },
      { label: "60-minute annual strategy call", body: "Plan a quarter's improvement sprint together." },
      { label: "Score-drop refund", body: "If the score drops 5+ points without your fault, we refund pro-rata." },
    ],
  },
  {
    icon: Flag,
    title: "Accountability infrastructure (all tiers)",
    body: "The capabilities that keep the whole index trustworthy regardless of who's paying.",
    features: [
      { label: "Public disputes queue", body: "Every challenge and its decision is published." },
      { label: "Methodology changelog", body: "Every rule change is versioned." },
      { label: "Seven-day public comment", body: "Material methodology proposals sit publicly before being accepted." },
      { label: "Named editorial lead", body: "Every methodology decision is signed by a named human." },
    ],
  },
];

export default function Features() {
  useSEO({
    title: "Features — every capability mapped to the tier | Council ClearSight",
    description: "The full feature map across the free public site, Verified, and Pro tiers.",
    canonicalPath: "/features",
  });
  return (
    <PublicLayout>
      <section className="bg-primary py-20">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 font-mono">Features</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">Every feature, mapped to its tier</h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">No marketing fog. The capabilities below are the exact set we ship today.</p>
        </div>
      </section>

      <div className="container max-w-5xl py-16 space-y-16">
        {GROUPS.map((g) => {
          const Icon = g.icon;
          return (
            <section key={g.title}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-accent" /></div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{g.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">{g.body}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {g.features.map((f) => (
                  <div key={f.label} className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-start gap-2 mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <h3 className="font-semibold text-foreground text-sm">{f.label}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed ml-6">{f.body}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="bg-slate-50 border-t border-slate-200">
        <div className="container max-w-4xl py-14">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-[240px]">
              <h3 className="font-semibold text-base mb-1">Managing a group of councils?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">CALCs, principal authorities and organisations managing several councils can arrange bulk subscriptions at a group rate.</p>
            </div>
            <Link href="/contact?topic=bulk"><Button variant="outline" size="sm">Talk to us about bulk <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button></Link>
          </div>
        </div>
      </section>

      <section className="container max-w-4xl py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">See features against a real council</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/directory"><Button size="lg">Find your council <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          <Link href="/pricing"><Button size="lg" variant="outline">See pricing</Button></Link>
        </div>
      </section>
    </PublicLayout>
  );
}
