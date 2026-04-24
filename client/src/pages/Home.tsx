/**
 * Home — the landing page.
 * Narrative: Your council has a score. It's calculated from 14 observable
 * things. Every score shows its evidence on the council's page. Free to view.
 * Subscribe to improve it and engage residents.
 */

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, Search, Eye, BadgeCheck, Sparkles, BookOpen, Flag,
  ShieldCheck, Users, BarChart3, Mail, Globe, Target, MessageCircle,
  HeartHandshake, Megaphone, CheckCircle2,
} from "lucide-react";
import { METHODOLOGY_VERSION } from "@/lib/scoring";

export default function Home() {
  useSEO({
    title: "Council ClearSight — how transparent is your council, really?",
    description: "An independent transparency score for every parish, town and city council in England. Score, band and evidence free for everyone. Optional subscriptions help councils improve their score and engage residents.",
    canonicalPath: "/",
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-6xl py-20 lg:py-28 relative">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 font-mono text-[11px]">{METHODOLOGY_VERSION} · assessed April 2026</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              How transparent is your council,<br/>
              <span className="text-accent">really?</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl mb-8">
              An independent score for every parish, town and city council in England. Calculated from fourteen specific, observable things. Explained in plain English. Publicly visible for anyone — with every score pinned to the evidence that produced it.
            </p>
            <CouncilSearchBar />
            <div className="flex flex-wrap gap-6 mt-10 text-xs text-white/60">
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />Score &amp; rank free for everyone</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />Methodology in plain English</span>
              <span className="flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" />Any score can be challenged</span>
            </div>
          </div>
        </div>
      </section>

      {/* What we measure */}
      <section className="container max-w-6xl py-20">
        <div className="max-w-3xl mb-12">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">What we measure</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">Four pillars. Fourteen indicators. One honest number.</h2>
          <p className="text-muted-foreground leading-relaxed">We measure <strong className="text-foreground">observable public transparency</strong> — not council quality, not resident satisfaction, not value for money. A high score means a resident can find, read, and scrutinise what the council is doing.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { n: 1, icon: Globe,       label: "Digital Presence",     max: 30, items: "Website · .gov.uk domain · accessibility statement" },
            { n: 2, icon: Mail,        label: "Contact Transparency", max: 30, items: "Email · phone · named clerk · clerk email" },
            { n: 3, icon: ShieldCheck, label: "Governance Documents", max: 25, items: "Agendas · minutes · annual financials" },
            { n: 4, icon: Users,       label: "Democratic Openness",  max: 15, items: "Chair · councillors · register of interests" },
          ].map((p) => (
            <Card key={p.n} className="p-5 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-4"><p.icon className="w-5 h-5 text-accent" /><span className="text-2xl font-bold text-foreground font-mono">{p.max}</span></div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Pillar {p.n}</div>
              <div className="font-semibold text-foreground mb-2">{p.label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.items}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center"><Link href="/methodology"><Button variant="outline">Read the methodology in plain English <ArrowRight className="w-4 h-4 ml-1.5" /></Button></Link></div>
      </section>

      {/* Evidence on every score */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-5xl py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <Badge variant="outline" className="mb-3 font-mono text-[10px]">Every score, its evidence</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">Click any indicator. See the exact fact we saw.</h2>
              <p className="text-muted-foreground leading-relaxed mb-5">Every council page lists all fourteen indicators with a clear pass / fail / not-assessed marker. Click through and the page shows exactly what our check found — the website URL, the email address, the clerk's name, the link to the minutes.</p>
              <p className="text-muted-foreground leading-relaxed mb-6">If any of it is wrong, there is a one-click challenge button right next to it. We aim to review every challenge within five working days and publish our decision on the public disputes page.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/directory"><Button>Find your council <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                <Link href="/methodology/disputes"><Button variant="outline">See past decisions</Button></Link>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-900 text-sm">Indicator 2.3 · Named clerk identified</span>
                  <span className="ml-auto text-xs font-mono text-emerald-700">10/10</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">What we saw</div>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs"><span className="text-slate-400">clerk_name: </span><span className="text-emerald-300">"Theresa Goss"</span></div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Source</div>
                  <span className="text-xs text-muted-foreground">Adderbury Parish Council website · last verified 20 April 2026</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex gap-3 text-xs text-muted-foreground">
                  <Link href="/challenge" className="hover:text-foreground inline-flex items-center gap-1"><Flag className="w-3 h-3" />Challenge this</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two tiers */}
      <section className="container max-w-5xl py-20">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">For councils</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-4">Free to see your score. Two tiers if you want help improving it.</h2>
          <p className="text-muted-foreground leading-relaxed">Every council's score, band, rank and evidence is publicly visible to everyone. Subscriptions pay for the tools and direct support that help a council improve its score and engage its residents more effectively.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-7 bg-white border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><BadgeCheck className="w-5 h-5 text-sky-600" /><h3 className="font-bold text-xl">Verified</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">£149</span> <span className="text-muted-foreground">/year</span></div>
            <p className="text-sm text-foreground/90 mb-5 leading-relaxed">Claim your council's page. Fix errors directly. Get email alerts when anything changes. Publicly signal (via the ✓ Verified badge) that a real human is paying attention.</p>
            <Link href="/pricing"><Button variant="outline" className="w-full">Start Verified <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </Card>
          <Card className="p-7 bg-gradient-to-br from-white to-accent/5 border-2 border-accent rounded-2xl relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most councils choose this</span>
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-accent" /><h3 className="font-bold text-xl">Pro</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">£449</span> <span className="text-muted-foreground">/year</span></div>
            <p className="text-sm text-foreground/90 mb-5 leading-relaxed">Personalised improvement roadmap, quarterly re-scoring, peer benchmarking, resident engagement playbook, content templates, and direct support. Score-drop refund if your score falls 5+ points.</p>
            <Link href="/pricing"><Button className="w-full bg-accent hover:bg-accent/90 text-white">Start Pro — 14-day trial <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </Card>
        </div>
        <p className="text-sm text-center text-muted-foreground mt-8">Managing a group of councils, a CALC or a principal authority? <Link href="/contact?topic=bulk" className="text-accent hover:underline">Talk to us about bulk arrangements.</Link></p>
      </section>

      {/* What Pro does */}
      <section className="bg-primary text-white py-20">
        <div className="container max-w-5xl">
          <div className="max-w-3xl mb-12">
            <Badge className="mb-3 bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">Pro in practice</Badge>
            <h2 className="text-3xl font-bold mb-4 leading-tight">We don't just tell you your score.<br/>We help you improve it — and the conversation with residents.</h2>
            <p className="text-white/75 leading-relaxed">Every transparency improvement is an engagement opportunity. Pro turns one into the other.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Target, title: "Personalised roadmap", body: "A written plan of the specific documents to publish, at which URL, for how many points. Delivered within seven days of subscribing." },
              { icon: Megaphone, title: "Engagement templates", body: "Every improvement comes with a template — newsletter wording, social post, meeting announcement — so residents know what changed and why." },
              { icon: BarChart3, title: "Quarterly re-scoring", body: "Your public score updates every 90 days, not every 12 months." },
              { icon: Users, title: "Peer benchmarking", body: "See where you sit against 10 councils similar to yours in size and region. Three things the leaders do that you don't." },
              { icon: MessageCircle, title: "Direct support", body: "Email our team with specific questions. One working day response. Not a chatbot." },
              { icon: HeartHandshake, title: "Annual strategy call", body: "Sixty minutes a year with us to plan the next quarter's push — whether that's a remediation sprint or a new engagement initiative." },
            ].map((f) => (
              <div key={f.title} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                <f.icon className="w-5 h-5 text-accent mb-3" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/75 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="container max-w-6xl py-20">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Users, audience: "Residents", pitch: "See what your council publishes and what it doesn't. Compare it with neighbouring councils. Challenge anything that looks wrong." },
            { icon: ShieldCheck, audience: "Clerks and councillors", pitch: "See your page the way residents see it. Fix what's out of date for free, or subscribe for a structured plan to move the score up." },
            { icon: BarChart3, audience: "Journalists and researchers", pitch: "Every score is pinned to its evidence. The methodology is documented in plain English. Use it to compare councils with confidence." },
          ].map((x) => (
            <div key={x.audience} className="p-6 border border-border rounded-2xl">
              <x.icon className="w-5 h-5 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">{x.audience}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{x.pitch}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="container max-w-4xl py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Find your council. Read its story.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">The directory has every council in England. Most residents find theirs in under ten seconds.</p>
          <Link href="/directory"><Button size="lg">Open the directory <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
      </section>

      </div>
    </PublicLayout>
  );
}
