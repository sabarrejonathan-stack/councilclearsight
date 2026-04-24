/**
 * Home — landing page (world-class marketing rewrite, April 2026).
 *
 * Narrative arc:
 *   Hero — legally required, independently visible
 *   Proof strip — real numbers (7,031 · 100 · 1,676 · 5 days)
 *   Reality check — your residents and journalists are already here
 *   Four pillars — what we measure, grounded in statute
 *   Commercial ladder — Free · Verified · Pro
 *   Pro in practice — six concrete outcomes
 *   Three audiences — residents, clerks, journalists
 *   Close — find your council
 */
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { useDirectory } from "@/lib/staticData";
import {
  ArrowRight, Search, Eye, BadgeCheck, Sparkles, BookOpen, Flag,
  ShieldCheck, Users, BarChart3, Mail, Globe, Target, MessageCircle,
  HeartHandshake, Megaphone, Scale, FileCheck,
} from "lucide-react";
import { METHODOLOGY_VERSION } from "@/lib/scoring";

const PILLARS = [
  { n: 1, icon: Globe,       label: "Digital Presence",     max: 30, items: "Working website · .gov.uk domain · accessibility statement" },
  { n: 2, icon: Mail,        label: "Contact Transparency", max: 30, items: "Council email · phone · named clerk · clerk email" },
  { n: 3, icon: ShieldCheck, label: "Governance Documents", max: 25, items: "Agendas · minutes · annual financial return (AGAR)" },
  { n: 4, icon: Users,       label: "Democratic Openness",  max: 15, items: "Chair named · councillors listed · register of interests" },
];

const PROOF = [
  { n: "7,031",   label: "councils scored",          sub: "every parish, town, city and community council in England" },
  { n: "100",     label: "points per council",       sub: "across 4 pillars and 14 observable indicators" },
  { n: "1,676",   label: "fully audited by scraper", sub: "every agenda, minute and AGAR link is a live URL" },
  { n: "5 days",  label: "to resolve a challenge",   sub: "evidence in, published decision out" },
];

const PRO_FEATURES = [
  { icon: Target, title: "Personalised roadmap", body: "A written plan of the specific documents to publish, at which URL, for how many points. Delivered within 7 days of subscribing." },
  { icon: Megaphone, title: "Engagement templates", body: "Every improvement comes with newsletter wording, social posts, and a meeting announcement you can copy and send." },
  { icon: BarChart3, title: "Quarterly re-scoring", body: "Your public score updates every 90 days, not every 12 months. Improvements show up fast." },
  { icon: Users, title: "Peer benchmarking", body: "See where you sit against 10 councils similar to yours by size, type and region." },
  { icon: MessageCircle, title: "Direct support", body: "Email a human. One working day response. Not a chatbot, not a helpdesk ticket." },
  { icon: HeartHandshake, title: "Score-drop refund", body: "If your score drops 5+ points during your subscription through no fault of your own, we refund pro-rata." },
];

const AUDIENCES = [
  { icon: Users,       audience: "Residents",                   pitch: "See exactly what your council publishes — and what they don't. Every claim on this site is pinned to a public document." },
  { icon: ShieldCheck, audience: "Clerks and councillors",      pitch: "See your council the way residents see it. Fix errors for free in three fields. Subscribe if you want the tools to move up." },
  { icon: BarChart3,   audience: "Journalists and researchers", pitch: "Every score is evidence-first, versioned, and challengeable. Compare any two councils in seconds." },
];

export default function Home() {
  useSEO({
    title: "Council ClearSight — the independent transparency score for every English council",
    description: "7,031 councils scored on 14 observable indicators — from statutory duty to public proof. Free to view. Verified £149/yr or Pro £449/yr if your council wants help improving.",
    canonicalPath: "/",
  });
  return (
    <PublicLayout>
      {/* ── Hero ───────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden">
        <div className="container max-w-6xl py-20 lg:py-28">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 font-mono text-[11px]">
              {METHODOLOGY_VERSION} · refreshed April 2026
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              Council transparency is<br/>
              <span className="text-accent">legally required.</span> We make it visible.
            </h1>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl mb-8">
              An independent score for every parish, town, city and community council in England. Calculated from fourteen things councils are already required to publish. Explained in plain English. Pinned to evidence.
            </p>
            <CouncilSearchBar />
            <div className="flex flex-wrap gap-6 mt-10 text-xs text-white/60">
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />Every score free for everyone</span>
              <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" />Grounded in statute, not opinion</span>
              <span className="flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" />Any score can be challenged</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Proof strip ─────────────────────────── */}
      <section className="bg-slate-900 border-b border-slate-800">
        <div className="container max-w-6xl py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {PROOF.map((p) => (
              <div key={p.label}>
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1 font-mono">{p.n}</div>
                <div className="text-sm font-semibold text-white/90">{p.label}</div>
                <div className="text-xs text-white/50 leading-relaxed mt-0.5">{p.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reality check ───────────────────────── */}
      <section className="container max-w-5xl py-20">
        <div className="grid md:grid-cols-[1fr_auto] items-start gap-10">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-3 font-mono text-[10px]">The uncomfortable truth</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-5 leading-tight">Your residents are already on this site. So are journalists.</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Transparency Code 2015, the Local Government Act 1972, the Accounts &amp; Audit Regulations, the Accessibility Regulations 2018 — all of these require councils to publish specific things. We've never invented an indicator. We check what's already required, then publish what we find.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That means any council's score is a scorecard of compliance with laws already on the books. The only question is whether residents find out from you — or from us.
            </p>
          </div>
          <Card className="p-6 bg-primary text-white border-primary max-w-xs">
            <FileCheck className="w-6 h-6 text-accent mb-3" />
            <div className="font-semibold mb-2">Every indicator cites a law.</div>
            <p className="text-sm text-white/75 leading-relaxed mb-4">The statutory source is named on the methodology page, with section number.</p>
            <Link href="/methodology"><Button size="sm" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 w-full">Read the methodology <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button></Link>
          </Card>
        </div>
      </section>

      {/* ── Four pillars ───────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-6xl py-20">
          <div className="max-w-3xl mb-12">
            <Badge variant="outline" className="mb-3 font-mono text-[10px]">What we measure</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Four pillars. Fourteen indicators. One honest number.</h2>
            <p className="text-muted-foreground leading-relaxed">
              A high score means a resident can find, read, and scrutinise what the council is doing. A low score means they can't — and that's usually a statutory failure, not a stylistic choice.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.n} className="p-5 bg-white border-slate-200">
                  <div className="flex items-center justify-between mb-4"><Icon className="w-5 h-5 text-accent" /><span className="text-2xl font-bold font-mono">{p.max}</span></div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Pillar {p.n} · max {p.max} pts</div>
                  <div className="font-semibold text-foreground mb-2">{p.label}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.items}</p>
                </Card>
              );
            })}
          </div>
          <div className="mt-8 text-center"><Link href="/methodology"><Button variant="outline">Read the full methodology <ArrowRight className="w-4 h-4 ml-1.5" /></Button></Link></div>
        </div>
      </section>

      {/* ── The commercial ladder ──────────────── */}
      <section className="container max-w-5xl py-20">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">For councils</Badge>
          <h2 className="text-3xl font-bold mb-4">The score is free. Improving it is where we help.</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every council page, score and evidence trail is publicly visible — no paywall, no tier for hiding things. Two subscriptions exist to help councils who want to move up the rankings.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 bg-slate-50 border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><Eye className="w-5 h-5 text-slate-500" /><h3 className="font-bold text-xl">Public</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">Free</span> <span className="text-muted-foreground">forever</span></div>
            <p className="text-sm mb-5 leading-relaxed">Read any council's score, rank, indicator-by-indicator breakdown, and the evidence URL behind every claim. Submit a challenge if something looks wrong.</p>
            <Link href="/directory"><Button variant="outline" className="w-full">Browse every council</Button></Link>
          </Card>
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><BadgeCheck className="w-5 h-5 text-sky-600" /><h3 className="font-bold text-xl">Verified</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">£149</span> <span className="text-muted-foreground">/year</span></div>
            <p className="text-sm mb-5 leading-relaxed">Claim your council's page. Fix incorrect contact fields. Email alerts when anything changes. Priority 3-day challenge lane. Fits under most no-vote purchase thresholds.</p>
            <Link href="/pricing"><Button variant="outline" className="w-full">Start Verified</Button></Link>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-white to-accent/5 border-2 border-accent rounded-2xl relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most councils choose this</span>
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-accent" /><h3 className="font-bold text-xl">Pro</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">£449</span> <span className="text-muted-foreground">/year</span></div>
            <p className="text-sm mb-5 leading-relaxed">Personalised roadmap, quarterly re-scoring, peer benchmarking, engagement templates, direct support. Less than one hour of professional consultancy per month.</p>
            <Link href="/pricing"><Button className="w-full bg-accent hover:bg-accent/90 text-white">Start Pro — 14-day trial</Button></Link>
          </Card>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-6">Both paid tiers include a 14-day trial and cancel-any-time. Score-drop refund on Pro.</p>
      </section>

      {/* ── Pro in practice ────────────────────── */}
      <section className="bg-primary text-white py-20">
        <div className="container max-w-6xl">
          <div className="max-w-3xl mb-12">
            <Badge className="mb-3 bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">Pro in practice</Badge>
            <h2 className="text-3xl font-bold mb-4">We help you improve the score <em>and</em> the conversation with residents.</h2>
            <p className="text-white/70 leading-relaxed">Every item we tell you to publish comes with the words you'd say about it. So publishing becomes a newsletter. Compliance becomes engagement.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PRO_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <Icon className="w-5 h-5 text-accent mb-3" />
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-white/75 leading-relaxed">{f.body}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/for-clerks"><Button size="lg" className="bg-accent hover:bg-accent/90 text-white">See the 90-day timeline <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* ── Three audiences ────────────────────── */}
      <section className="container max-w-6xl py-20">
        <div className="max-w-2xl mb-10">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Who this is for</Badge>
          <h2 className="text-3xl font-bold mb-3">One set of scores. Three good reasons to use them.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {AUDIENCES.map((x) => {
            const Icon = x.icon;
            return (
              <div key={x.audience} className="p-6 border border-border rounded-2xl bg-white">
                <Icon className="w-5 h-5 text-accent mb-3" />
                <h3 className="font-semibold mb-2">{x.audience}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{x.pitch}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Close ───────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="container max-w-4xl py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Find your council. Read its story.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Four pillars. Fourteen indicators. One honest number. Every claim pinned to evidence you can click.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/directory"><Button size="lg">Open the directory <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/methodology"><Button size="lg" variant="outline"><BookOpen className="w-4 h-4 mr-2" /> How scores are calculated</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function CouncilSearchBar() {
  const [q, setQ] = useState("");
  const { data = [] } = useDirectory({ enabled: q.length > 1 });
  const suggestions = (data as any[]).filter((r) => r.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  return (
    <div className="relative max-w-xl">
      <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 pl-4 shadow-lg">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find your council by name…" className="border-0 shadow-none focus-visible:ring-0" />
        <Link href="/directory"><Button size="lg" className="bg-primary hover:bg-primary/90 text-white">Browse all</Button></Link>
      </div>
      {q.length > 1 && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl border shadow-xl overflow-hidden z-50">
          {suggestions.map((s) => (
            <Link key={s.id} href={`/council/${s.slug}`} className="block px-4 py-3 hover:bg-slate-50 border-b last:border-0">
              <div className="font-medium text-sm">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.county} · {s.region} · Score {s.score ?? "—"}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
