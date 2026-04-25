/**
 * How It Works page — Council ClearSight (VDTI v3)
 *
 * A five-step walkthrough of the scoring pipeline: discover → verify → score → publish → challenge.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, Search, CheckCircle2, Zap, Upload, Scale,
  Globe, Mail, ShieldCheck, FileText,
} from "lucide-react";

export default function HowItWorks() {
  useSEO({
    title: "How It Works — Council ClearSight Transparency Index",
    description: "From discovery to scoring to challenge: a five-step walkthrough of how Council ClearSight measures and publishes council transparency.",
    keywords: "scoring process, methodology, council assessment, transparency index",
    canonicalPath: "/how-it-works",
  });

  return (
    <PublicLayout>
      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden py-16">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-4xl relative">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.1]">
            How Council ClearSight scores every council
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
            Five steps from discovery to audit. Every step is logged. Every decision is public.
          </p>
        </div>
      </section>

      {/* ─── Video walkthrough ──────────────────────────────────── */}
      <section className="bg-slate-900">
        <div className="container max-w-5xl py-12">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <video
              controls
              preload="metadata"
              playsInline
              className="w-full h-auto block"
              aria-label="Council ClearSight scoring walkthrough video"
            >
              <source src="/videos/how-it-works.mp4" type="video/mp4" />
              Your browser does not support embedded video. The walkthrough is also explained step by step below.
            </video>
          </div>
          <p className="text-center text-xs text-white/50 mt-4">
            Two-minute walkthrough of how every council is discovered, verified, scored and published.
          </p>
        </div>
      </section>

      <div className="container max-w-5xl py-16 space-y-20">

        {/* ─── The five steps ───────────────────────────────────── */}
        <div className="space-y-6">
          {[
            {
              step: 1,
              icon: Search,
              title: "Discover",
              summary: "We find every English council and their public contact details.",
              body: "We start with three authoritative sources: (1) the Council ClearSight API seed corpus (7,031 councils), (2) independent .gov.uk domain discovery (adds +772 more), and (3) ModernGov directories from English district councils (adds clerk records from 2,000+ councils). The goal is 11,337 — every parish, town, community and city council in England.",
              sources: "ClearSight API · .gov.uk domain probe · ModernGov directories",
            },
            {
              step: 2,
              icon: CheckCircle2,
              title: "Verify",
              summary: "We check if published data is valid and accessible.",
              body: "For each council, we run HTTP checks on the website URL (does it resolve?), validate email format (is it a real email address?), validate phone format, and confirm the clerk name and email are non-empty strings. Invalid entries are logged as missing data. This creates the first input row.",
              sources: "HTTP resolution checks · Email/phone format validation",
            },
            {
              step: 3,
              icon: Zap,
              title: "Score",
              summary: "We apply fourteen binary rules across four pillars.",
              body: "Each of the twelve indicators is checked against the verified inputs for every council. Each rule either earns maximum points (when the evidence is present) or zero (when it isn't). If we haven't yet checked an indicator for a particular council, it's marked 'Not assessed' and excluded from the denominator — a missing check never masquerades as a fail. The final score is the points earned divided by the points we could assess, on a 0–100 scale.",
              sources: "12 binary indicators · 4 pillars · Max 100 points",
            },
            {
              step: 4,
              icon: Upload,
              title: "Publish",
              summary: "Every council page is regenerated with the latest evidence.",
              body: "Every council page on the site is updated to reflect the latest verdicts — the score, the band, the rank, and the specific evidence behind each of the twelve indicators. What you see on a council's page is exactly what the scoring process produced; there's no editorial layer between the evidence and the score.",
              sources: "Public annual refresh · Quarterly for Pro subscribers · Full evidence trail",
            },
            {
              step: 5,
              icon: Scale,
              title: "Challenge",
              summary: "Any council or resident can dispute a score; we respond within 5 working days.",
              body: "If you believe a score is wrong — for example, if your council publishes minutes we missed — submit a challenge via the council's page. We review the evidence, make a decision, and log it publicly. If the challenge succeeds, the input row updates and the score is recalculated. Every decision is published with full justification.",
              sources: "Public challenge form · 5-day SLA (3 days for Verified subscribers)",
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="flex gap-6">
                {/* Step number and connector */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border-2 border-accent flex items-center justify-center flex-shrink-0">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  {step.step < 5 && (
                    <div className="w-1 h-10 bg-accent/20 mt-3" />
                  )}
                </div>

                {/* Card content */}
                <Card className="flex-1 p-6 border-slate-200 bg-white">
                  <div className="mb-3">
                    <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Step {step.step} of 5</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{step.title}</h2>
                  <p className="text-sm font-medium text-accent mb-4">{step.summary}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {step.body}
                  </p>
                  <div className="text-xs text-muted-foreground font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    {step.sources}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* ─── Transparency toolkit ──────────────────────────────── */}
        <section className="grid md:grid-cols-3 gap-4 pt-8 border-t border-border">
          {[
            {
              icon: ShieldCheck,
              title: "Read the methodology",
              body: "Every rule explained clearly. No hidden formulae, no jargon. Residents and clerks can follow every step.",
              cta: "Read methodology",
              href: "/methodology",
              external: false,
            },
            {
              icon: Scale,
              title: "Past dispute decisions",
              body: "Every score challenge we've received and how we decided it — the evidence we considered and the outcome.",
              cta: "See the queue",
              href: "/methodology/disputes",
              external: false,
            },
            {
              icon: FileText,
              title: "Methodology changelog",
              body: "Every rule change ever made to the index, signed and dated. Public comment period of at least seven days.",
              cta: "Read the changelog",
              href: "/methodology/changelog",
              external: false,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-5 bg-white border-slate-200">
                <Icon className="w-5 h-5 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.body}</p>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full">
                      {item.cta} <ArrowRight className="w-3 h-3 ml-1.5" />
                    </Button>
                  </a>
                ) : (
                  <Link href={item.href}>
                    <Button size="sm" variant="outline" className="w-full">
                      {item.cta} <ArrowRight className="w-3 h-3 ml-1.5" />
                    </Button>
                  </Link>
                )}
              </Card>
            );
          })}
        </section>

        {/* ─── The integrity guarantee ────────────────────────────── */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-4">The integrity guarantee</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every score is reproducible from observable evidence. Every change is logged. Every challenge is published. We don't hide failures behind brand language — if a council's score is wrong, we fix it within five working days and publish the decision.
          </p>
        </section>

      </div>
    </PublicLayout>
  );
}
