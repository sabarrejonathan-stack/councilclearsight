/**
 * Features page — the "what's under the hood" deep-dive for evaluators.
 *
 * Where the Pricing page sells and the ForClerks page converts, Features is
 * where a cautious chair or councillor goes to read the fine print before
 * approving a subscription. Long-form, honest, organised by use-case.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, BadgeCheck, ShieldCheck, Eye, Sparkles, Bell, Users,
  BookOpen, Mail, FileText, BarChart2, Flag, Clock,
  CheckCircle2, Lock, Building2, Globe, Briefcase, Megaphone,
  HeartHandshake, Target, MessageCircle, TrendingUp,
} from "lucide-react";

export default function Features() {
  useSEO({
    title: "Features — every capability mapped to the tier that unlocks it | Council ClearSight",
    description: "The full feature map. What's in the free public site, what a Verified subscription adds, what Pro makes possible, and what Enterprise means for CALCs and principal authorities.",
    canonicalPath: "/features",
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 font-mono">Features</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">Every feature, mapped to the tier that unlocks it</h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">No marketing fog. The capabilities below are the exact set we ship today. Anything that is coming is labelled "Planned".</p>
        </div>
      </section>

      {/* Capability groups */}
      <div className="container max-w-5xl py-16 space-y-16">

        <CapabilityGroup
          icon={Eye}
          title="Public transparency (always free)"
          body="Every capability below is free forever and available to anyone with a browser. This is the layer the entire product stands on; it cannot be gated."
          features={[
            { label: "The CC-TI score",         body: "A single 0–100 score per council. Same score for every viewer." },
            { label: "14 indicator verdicts",   body: "Each one with the exact input our rule saw and the verdict it produced." },
            { label: "Evidence trail",          body: "Every source link, last-verified date, and input value, stored nightly." },
            { label: "Audit CSV",               body: "Downloadable file containing every input and score. Regenerated every night." },
            { label: "Methodology document",    body: "The complete description of how scoring works — in plain English. Versioned in a changelog so you can see every rule change." },
            { label: "Public challenge route",  body: "Any member of the public can challenge any indicator. 5 working-day SLA. Decisions logged publicly." },
            { label: "Directory search & sort", body: "All 11,000+ councils, searchable and sortable by rank, score, completeness, band." },
          ]}
        />

        <CapabilityGroup
          icon={BadgeCheck}
          title="Page ownership (Verified tier and above)"
          body="The Verified tier is for a clerk who wants to claim the council's page, fix any errors, and receive alerts when things change. At £149/year it's priced to fit under the typical unvoted-purchase threshold for a parish."
          features={[
            { label: "Verified badge",          body: "A ✓ badge appears publicly on the council's page confirming the clerk has claimed it and is paying attention." },
            { label: "Direct field editing",    body: "Change contact details without filing a challenge. Every edit appears in the public audit log." },
            { label: "Priority challenge lane", body: "Challenges from a verified clerk have a 3-working-day SLA instead of 5." },
            { label: "Score-change alerts",     body: "Email to the clerk the moment any indicator flips. Summarises the exact point delta." },
            { label: "Printable scorecard",     body: "One-page A4 PDF for the council noticeboard. Regenerate any time." },
            { label: "Monthly digest",          body: "A short email every month summarising what's changed on the council's public page." },
            { label: "Unlimited council users", body: "All councillors, deputies and officers can share one subscription. No per-seat fee." },
          ]}
        />

        <CapabilityGroup
          icon={Sparkles}
          title="Active improvement & engagement support (Pro tier)"
          body="Pro is where Council ClearSight stops being a dashboard and starts being a partner. Every Pro feature is about moving the score up AND improving the council's relationship with residents — not hiding weaknesses, but fixing them visibly."
          features={[
            { label: "Personalised improvement roadmap", body: "A specific, actionable checklist within seven days of subscribing: which documents to publish, at which URL, for how many points. Generated fresh on subscription and updated every quarter." },
            { label: "Quarterly re-scoring",     body: "Public scores are re-run annually. Pro scores are re-run every 90 days so improvements are visible within a quarter, not a year." },
            { label: "Resident engagement playbook", body: "Every transparency improvement paired with an engagement template — newsletter wording, social post, meeting announcement. Score improvements that residents don't know about aren't really improvements." },
            { label: "Content templates",        body: "Drop-in templates for agendas, minutes, annual reports, newsletters, AGM programmes, consultation questionnaires — drawn from councils performing at Exemplary level." },
            { label: "Peer benchmarking",        body: "Head-to-head comparison against 10 similar councils in the region. Shows which indicators peers have won that you haven't, and what they did to get there." },
            { label: "Direct support channel",   body: "Email the team with specific questions — 'what should our accessibility statement say?', 'can you review our draft agenda?'. One working day response from a human." },
            { label: "60-minute annual strategy call", body: "Walk through your roadmap together. Prioritise what to do first; plan a quarter's improvement sprint." },
            { label: "Embeddable transparency badge", body: "Drop-in snippet for the council's own website. Shows your live CC-TI score as a third-party endorsement." },
            { label: "Score-drop refund",        body: "If the score drops by 5+ points during the subscription without a fault on your side, we refund pro-rata. Unique in the sector." },
          ]}
        />

        <CapabilityGroup
          icon={Flag}
          title="Accountability infrastructure (across all tiers)"
          body="Some capabilities are not tier-specific — they exist so the whole index stays trustworthy regardless of who's paying."
          features={[
            { label: "Public disputes queue",    body: "Every challenge and its decision is published at /methodology/disputes. You can see what we've been asked, how we decided, and what evidence we considered." },
            { label: "Methodology changelog",    body: "Every change to the scoring rules is versioned. Past versions remain reproducible from past audit CSVs." },
            { label: "Score-delta CI guard",     body: "A change that would move more than 10 councils per band requires explicit editorial sign-off before it can ship." },
            { label: "Seven-day public comment", body: "Material methodology proposals sit publicly for a minimum of seven days, with the evidence and rationale, before being accepted." },
            { label: "Named editorial lead",     body: "Every methodology decision is signed by a named human. The queue is never processed silently." },
          ]}
        />
      </div>

      {/* Roadmap */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-4xl py-16">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Planned (not shipped yet)</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-3">Where we're going next</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-2xl">Our public roadmap. Everything here is shipped within 12 months of the April 2026 launch or publicly de-scoped with a reason.</p>
          <div className="space-y-3">
            {[
              { quarter: "Q3 2026", title: "Governance scraping for all councils", body: "Pillar 3 scraping currently runs for Pro subscribers. In Q3 we extend to every council with a .gov.uk domain, closing the 'Not Assessed' gap for the entire index." },
              { quarter: "Q3 2026", title: "API (public, read-only)", body: "Stable public API for researchers and journalists to query the index programmatically." },
              { quarter: "Q4 2026", title: "Welsh & Scottish community councils", body: "Extend the index to ~730 Welsh community councils and ~1,200 Scottish community councils under methodology v3.1." },
              { quarter: "Q4 2026", title: "Historical scores archive", body: "Permanent archive of every past quarterly score for every council. Trend charts on each public page." },
              { quarter: "Q1 2027", title: "Councillor-conduct index (companion)", body: "Separate scoring for the Localism Act 2011 conduct regime — register of interests, dispensations, complaints history. Opt-in for councils." },
            ].map((r) => (
              <div key={r.title} className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="mono text-[11px] text-accent font-semibold w-16 flex-shrink-0 pt-1">{r.quarter}</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk / CALC arrangements */}
      <section className="container max-w-4xl py-14">
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <h3 className="font-semibold text-foreground text-base mb-1">Managing a group of councils?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">County Associations (CALCs), principal authorities, and organisations managing several councils can arrange bulk subscriptions at a group rate. Get in touch to discuss.</p>
          </div>
          <Link href="/contact?topic=bulk"><Button variant="outline" size="sm">Talk to us about bulk <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button></Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-4xl py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to see the features against a real council?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Pick your council from the directory. Every capability above is available to evaluate on a real page.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/directory"><Button size="lg">Find your council <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          <Link href="/pricing"><Button size="lg" variant="outline">See pricing</Button></Link>
        </div>
      </section>
    </PublicLayout>
  );
}

// ─── Components ──────────────────────────────────────

function CapabilityGroup({ icon: Icon, title, body, features }: { icon: any; title: string; body: string; features: Array<{ label: string; body: string }> }) {
  return (
    <section>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-accent" /></div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">{body}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {features.map((f) => (
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
}
                                              