/**
 * Pricing — two tiers for individual councils.
 *
 * Verified: claim the page, own the narrative, react to changes.
 * Pro:      active help to improve the score AND engage residents.
 *
 * Public access to the score, rank, and pillar breakdown is always free. The
 * score is never paywalled. Subscriptions pay for everything you do with the
 * score once you've seen it.
 */

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  Check, Minus, ArrowRight, Sparkles, BadgeCheck, Eye, Shield,
  Bell, FileText, Users, MessageCircle, Megaphone, HeartHandshake,
  CalendarCheck, TrendingUp, Lock, Unlock, HelpCircle, Target,
} from "lucide-react";

type Billing = "annual" | "monthly";

type FeatureRow = {
  group?: string;
  label: string;
  sub?: string;
  free: boolean | string;
  verified: boolean | string;
  pro: boolean | string;
};

const FEATURES: FeatureRow[] = [
  // ── Always public ──
  { group: "What stays public for everyone",
    label: "Full CC-TI score and four-pillar breakdown",
    sub: "The number residents, journalists and councillors see is the same — subscribed or not.",
    free: true, verified: true, pro: true },
  { label: "National rank, regional rank, peer-type rank",
    free: true, verified: true, pro: true },
  { label: "All fourteen indicators with pass / fail / not-assessed markers",
    free: true, verified: true, pro: true },
  { label: "Evidence links on every indicator (the specific fact we saw)",
    free: true, verified: true, pro: true },
  { label: "The right to file a challenge against any score",
    free: "5-day SLA", verified: "3-day SLA", pro: "2-day SLA" },

  // ── Verified ──
  { group: "Verified — own your page, react to changes",
    label: "✓ Verified badge on the public page",
    sub: "Publicly signals that a real human from the council is paying attention.",
    free: false, verified: true, pro: true },
  { label: "Claim and edit contact fields directly",
    sub: "Fix wrong emails, URLs, clerk names without filing a challenge. Every edit appears in the public audit log.",
    free: false, verified: true, pro: true },
  { label: "Email alerts when any indicator changes",
    sub: "Know immediately if your website goes down, your address disappears from our records, or anyone challenges your score.",
    free: false, verified: true, pro: true },
  { label: "Printable noticeboard scorecard (A4 PDF)",
    sub: "One-page summary designed for the council noticeboard. Regenerate on demand.",
    free: false, verified: true, pro: true },
  { label: "Monthly digest of what changed this month",
    free: false, verified: true, pro: true },
  { label: "Unlimited users from your council",
    sub: "Clerk, deputy, chair, councillors — all share the same subscription.",
    free: false, verified: true, pro: true },

  // ── Pro ──
  { group: "Pro — personalised support to improve the score and engage residents",
    label: "Personalised improvement roadmap",
    sub: "A written, actionable plan tailored to your council: the specific documents we think you should publish next, at which URL, for how many points.",
    free: false, verified: false, pro: true },
  { label: "Quarterly re-scoring",
    sub: "See improvements within 90 days, not 12 months. Your public score updates every quarter; the free-tier cycle is annual.",
    free: false, verified: false, pro: true },
  { label: "Peer benchmarking against 10 similar councils",
    sub: "Head-to-head with councils of similar size and region. See what the leaders do that you don't.",
    free: false, verified: false, pro: true },
  { label: "Resident engagement playbook",
    sub: "Templates and plays tailored to your score: attendance at meetings, newsletters, consultations, social presence — what's worked for councils like yours.",
    free: false, verified: false, pro: true },
  { label: "Content templates (agendas, minutes, annual reports, newsletters)",
    sub: "Drop-in templates you adapt to your council. Built from what high-scoring peers publish.",
    free: false, verified: false, pro: true },
  { label: "Direct support channel for transparency and engagement questions",
    sub: "Email our team with specific questions — 'how do we run an accessible hybrid meeting?', 'what does a good AGAR summary look like?'. One working day to respond.",
    free: false, verified: false, pro: true },
  { label: "Annual 60-minute strategy call",
    sub: "Walk through your roadmap together. Prioritise what to do first; plan a quarter's improvement sprint.",
    free: false, verified: false, pro: true },
  { label: "Embeddable transparency badge for the council's own website",
    free: false, verified: false, pro: true },
  { label: "Score-drop refund guarantee",
    sub: "If your score drops 5+ points during your subscription without a fault on your side, we refund pro-rata. No other transparency tool in the sector makes this promise.",
    free: false, verified: false, pro: true },
];

export default function Pricing() {
  useSEO({
    title: "Pricing — two tiers to help your council improve | Council ClearSight",
    description: "Every council's score is free to view. Subscribe to claim your page and react to changes (Verified, £149/year) or to get personalised help improving your score and engaging residents (Pro, £449/year).",
    canonicalPath: "/pricing",
  });

  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <PublicLayout>
      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-4xl relative text-center">
          <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 font-mono">Pricing</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-5 leading-[1.05]">
            Your score is free.<br/>
            <span className="text-accent">Improving it is where we help.</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
            Every council's score, rank and evidence trail is publicly visible to everyone — subscribed or not. Subscriptions pay for the tools and personal support that help a council move up the rankings and engage its residents more effectively.
          </p>
          <div className="flex items-center justify-center gap-1 p-1 bg-white/10 rounded-full w-fit mx-auto text-sm">
            {(["annual","monthly"] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)} className={`px-4 py-1.5 rounded-full font-medium transition ${billing === b ? "bg-white text-primary" : "text-white/75 hover:text-white"}`}>
                {b === "annual" ? "Annual (save 20%)" : "Monthly"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Two tier cards ──────────────────────────── */}
      <section className="container max-w-5xl -mt-10 relative z-10 mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* ─── Verified card ─── */}
          <Card className="p-7 bg-white border border-slate-200 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck className="w-6 h-6 text-sky-600" />
              <h2 className="text-2xl font-bold text-foreground">Verified</h2>
            </div>
            <p className="text-sm text-foreground/90 mb-6 leading-relaxed">Own your council's page. React to changes. Fix what's wrong the moment it's wrong.</p>
            <div className="mb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">£{billing === "annual" ? "149" : "15"}</span>
                <span className="text-muted-foreground">{billing === "annual" ? "/year" : "/month"}</span>
              </div>
              {billing === "annual" && <p className="text-[11px] text-accent font-medium mt-1">Works out at £12.42/month — less than most councils spend on printing one meeting agenda.</p>}
            </div>
            <Link href="/subscribe/verified">
              <Button className="w-full" size="lg">Start Verified <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
            <p className="text-[11px] text-center text-muted-foreground mt-2">14-day free trial · cancel any time</p>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">What you get</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { icon: BadgeCheck, text: "The ✓ Verified badge on your public page" },
                  { icon: Shield,     text: "Power to edit contact fields directly" },
                  { icon: Bell,       text: "Email alert the moment any indicator changes" },
                  { icon: FileText,   text: "Printable A4 scorecard for the noticeboard" },
                  { icon: CalendarCheck, text: "Monthly digest of everything that changed" },
                  { icon: Users,      text: "Unlimited council users under one subscription" },
                  { icon: HelpCircle, text: "Priority challenge lane — 3 working days" },
                ].map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    <f.icon className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Best for</strong> clerks of smaller parish councils who want a say in how their council appears, but aren't yet ready for a full improvement programme.
              </p>
            </div>
          </Card>

          {/* ─── Pro card ─── */}
          <Card className="p-7 bg-gradient-to-br from-white to-accent/5 border-2 border-accent rounded-3xl relative shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most councils choose this</span>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-foreground">Pro</h2>
            </div>
            <p className="text-sm text-foreground/90 mb-6 leading-relaxed">Active help to improve your score AND engage your residents. Comes with the roadmap, the templates, and us on the other end of an email.</p>
            <div className="mb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">£{billing === "annual" ? "449" : "45"}</span>
                <span className="text-muted-foreground">{billing === "annual" ? "/year" : "/month"}</span>
              </div>
              {billing === "annual" && <p className="text-[11px] text-accent font-medium mt-1">£37.42/month equivalent — less than one hour of professional consultancy.</p>}
            </div>
            <Link href="/subscribe/pro">
              <Button className="w-full bg-accent hover:bg-accent/90 text-white" size="lg">Start Pro — 14-day trial <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
            <p className="text-[11px] text-center text-muted-foreground mt-2">14-day free trial · cancel any time · score-drop refund guarantee</p>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-3">Everything in Verified, plus</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { icon: Target,         text: "Personalised improvement roadmap — specific files to publish, at which URL, for how many points" },
                  { icon: TrendingUp,     text: "Quarterly re-scoring (public cycle is annual)" },
                  { icon: Users,          text: "Peer benchmarking against 10 councils similar to yours" },
                  { icon: Megaphone,      text: "Resident engagement playbook tailored to your score" },
                  { icon: FileText,       text: "Drop-in templates: agendas, minutes, annual reports, newsletters" },
                  { icon: MessageCircle,  text: "Direct support channel — one working day response" },
                  { icon: HeartHandshake, text: "60-minute annual strategy call" },
                  { icon: Shield,         text: "Score-drop refund if your score falls 5+ points" },
                ].map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    <f.icon className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
              <p className="text-xs text-foreground/90 leading-relaxed">
                <strong className="text-foreground">Best for</strong> town councils, parish councils with ambition, and any council where the score currently sits in Developing or Strong and the clerk wants a practical, ongoing plan to move up.
              </p>
            </div>
          </Card>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">All prices ex. VAT. Annual billing renews yearly; monthly carries a 20% uplift. Managing a group of councils, a CALC, or a principal authority? <Link href="/contact?topic=bulk" className="text-accent hover:underline">Talk to us about bulk arrangements.</Link></p>
      </section>

      {/* ─── Value expansion: what Pro actually does for engagement ──── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-5xl py-16">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono text-[10px]">Pro in depth</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">What "personalised engagement support" actually means</h2>
            <p className="text-muted-foreground leading-relaxed">Pro isn't a dashboard and a congratulatory email. It's concrete, continuous help to improve both the transparency score and the council's relationship with residents. Here's what happens.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { n: "Week 1", title: "We audit your council and draft a roadmap", body: "Within seven days of subscribing, we run a fresh audit of your council's website and publicly available information. You receive a written roadmap — an ordered list of the five to ten most impactful actions, each with the exact URL to publish, the wording to use, and the points you'll gain." },
              { n: "Week 2", title: "We connect your roadmap to resident engagement", body: "Every transparency improvement is an engagement opportunity. When you publish the May minutes, we help you draft the accompanying resident newsletter. When you adopt the register of interests, we help you announce it at the AGM. No loose ends." },
              { n: "Month 1", title: "Your first re-score", body: "Thirty days in, we re-run the full audit. Your public score updates with any improvements you've made. If you haven't moved yet, the roadmap persists until the next scheduled re-score." },
              { n: "Month 3", title: "Benchmarking + strategy call", body: "At the quarter mark, we compare you head-to-head with 10 similar councils, identify three things the leaders are doing that you aren't, and schedule your annual 60-minute strategy call to plan the next quarter's push." },
              { n: "Ongoing", title: "Direct support channel", body: "Any time you have a specific question — 'what should our accessibility statement say?', 'can you review our draft agenda?' — email the support channel. One working day response from our team, not a chatbot." },
              { n: "Ongoing", title: "Templates as you need them", body: "Agendas, minutes templates, annual report structures, resident newsletter outlines, AGM programmes, consultation questionnaires — all drawn from councils performing at Exemplary level. Drop in, adapt, publish." },
            ].map((step) => (
              <div key={step.n} className="p-5 bg-white border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-accent font-semibold font-mono">{step.n}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Four promises ────────────────────────────── */}
      <section className="container max-w-5xl py-16">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Our commitments</Badge>
          <h2 className="text-3xl font-bold mb-3">Four things no subscription will ever buy</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">The product only works if everyone trusts it. These aren't policies; they're structural features of how the site runs.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: Eye,    title: "A different score for you than for the public", body: "There is one score per council. Every visitor, subscribed or not, sees the same number, the same band, the same rank. No premium 'real' score hidden behind a paywall." },
            { icon: Unlock, title: "Removal of your low score because you pay us",   body: "A score reflects what's been published. If you want it higher, publish more. We cannot — and will not — edit a score for a paying customer." },
            { icon: Shield, title: "Silence about your weaknesses",                   body: "Every failing indicator stays publicly visible on your page with its evidence. Paying for Pro gives you the tools to fix them, not to hide them." },
            { icon: Lock,   title: "Hostage data if you cancel",                      body: "When a subscription ends, the ✓ Verified badge disappears. The public page, score, and evidence remain. Nothing private was held because nothing private existed." },
          ].map((p) => (
            <div key={p.title} className="p-5 bg-white border border-slate-200 rounded-2xl flex gap-4">
              <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0"><p.icon className="w-4 h-4 text-accent" /></div>
              <div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">We will not sell you…</h3>
                <p className="text-sm text-foreground/90 font-medium mb-1">{p.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Full feature comparison ──────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-5xl py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold mb-3">Everything, side by side</h2>
            <p className="text-muted-foreground text-sm">Scroll on mobile.</p>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
            <table className="w-full text-sm">
              <thead className="bg-white sticky top-0 z-10">
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[260px]">Feature</th>
                  <th className="py-4 px-4 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">Free</th>
                  <th className="py-4 px-4 text-center font-semibold text-xs uppercase tracking-wider text-sky-700">Verified</th>
                  <th className="py-4 px-4 text-center font-semibold text-xs uppercase tracking-wider text-accent bg-accent/5">Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr key={i} className={row.group ? "bg-slate-50/60 border-b border-slate-200" : "border-b border-slate-100 hover:bg-slate-50/30"}>
                    <td className={`py-3 px-5 ${row.group ? "text-[11px] uppercase tracking-wider text-slate-500 font-bold pt-5" : "text-foreground"}`}>
                      {row.group && <div className="mb-1">{row.group}</div>}
                      <div className={row.group ? "font-medium text-foreground text-sm normal-case tracking-normal" : "font-medium"}>{row.label}</div>
                      {row.sub && !row.group && <div className="text-xs text-muted-foreground mt-1 leading-relaxed font-normal">{row.sub}</div>}
                      {row.sub && row.group && <div className="text-xs text-muted-foreground mt-1 leading-relaxed font-normal normal-case tracking-normal">{row.sub}</div>}
                    </td>
                    <td className="py-3 px-4 text-center"><FeatureCell v={row.free} /></td>
                    <td className="py-3 px-4 text-center"><FeatureCell v={row.verified} /></td>
                    <td className="py-3 px-4 text-center bg-accent/5"><FeatureCell v={row.pro} highlight /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      </div>
    </PublicLayout>
  );
}
