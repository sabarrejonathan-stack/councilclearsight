/**
 * Home — landing page (world-class marketing rewrite, April 2026).
 *
 * Narrative arc:
 *   Hero — legally required, independently visible
 *   Proof strip — real numbers (11,057 · 1,682 · 100 · 5 days)
 *   Reality check — your residents and journalists are already here
 *   Four pillars — what we measure, grounded in statute
 *   Commercial ladder — Free · Gold · Platinum
 *   Platinum in practice — six concrete outcomes
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
  ShieldCheck, Users, BarChart3, Mail, Globe, Target,
  Megaphone, Scale, FileCheck, FileDown, ClipboardCheck,
} from "lucide-react";
import { METHODOLOGY_VERSION } from "@/lib/scoring";

const PILLARS = [
  { n: 1, icon: Globe,       label: "Core Reachability",              max: 25, items: "Working website · council email · phone · named clerk (LGA 1972 § 112)" },
  { n: 2, icon: ShieldCheck, label: "Statutory Meeting Transparency", max: 25, items: "Agendas (LGA 1972 § 100B) · minutes (LGA 1972 § 100C)" },
  { n: 3, icon: BarChart3,   label: "Financial Accountability",       max: 25, items: "AGAR (Accounts & Audit Regs 2015 § 10) · contactable clerk for audit" },
  { n: 4, icon: Users,       label: "Democratic & Accessibility",     max: 25, items: "Chair named · councillor identified · accessibility statement · HTTPS" },
];

const PROOF = [
  { n: "11,057", label: "councils tracked",            sub: "every parish, town, city and community council in England" },
  { n: "1,682",  label: "fully verified to date",      sub: "every agenda, minute and AGAR link is a live URL on the council's domain" },
  { n: "100",    label: "points per council",          sub: "across 4 pillars and 12 statute-anchored indicators" },
  { n: "5 days", label: "to resolve a challenge",      sub: "evidence in, published decision out" },
];

const PRO_FEATURES = [
  { icon: Target, title: "Personalised roadmap", body: "A written plan of the specific documents to publish, at which URL, for how many points. Delivered automatically within 7 days of subscribing." },
  { icon: Megaphone, title: "Engagement templates", body: "Every improvement comes with newsletter wording, social posts, and a meeting announcement you can copy and send." },
  { icon: BarChart3, title: "Quarterly re-scoring", body: "Your score is refreshed every 90 days for subscribers. Improvements show up fast." },
  { icon: Users, title: "Peer benchmarking", body: "See where you sit against 10 councils similar to yours by size, type and region." },
  { icon: BookOpen, title: "Self-serve guidance library", body: "Every recommendation comes with worked examples, indicator definitions and templates. Help centre and score challenge form for queries." },
  { icon: ClipboardCheck, title: "Quarterly chair/clerk briefing pack", body: "Auto-generated each quarter from your score, peer movement, evidence gaps and progress. Ready to circulate before the next meeting." },
];

const AUDIENCES = [
  { icon: Users,       audience: "Residents",                   pitch: "See exactly what your council publishes — and what they don't. Every claim on this site is pinned to a public document." },
  { icon: ShieldCheck, audience: "Clerks and councillors",      pitch: "See your council the way residents see it. Fix errors for free in three fields. Subscribe if you want the tools to move up." },
  { icon: BarChart3,   audience: "Journalists and researchers", pitch: "Every score is evidence-first, versioned, and challengeable. Compare any two councils in seconds." },
];

export default function Home() {
  useSEO({
    title: "Council ClearSight — the independent transparency score for every English council",
    description: "11,057 parish, town and community councils tracked across England. 1,682 fully verified to date — every claim links to a public document. Free to view. Gold £349/yr or Platinum £499/yr.",
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
              An independent audit of every parish, town, city and community council in England — 11,057 in total. 1,682 fully verified to date, with the rest progressing through audit. Every published score is calculated from twelve things councils are already required to publish, and every claim links to a public document on the council's own domain.
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
            Every council page, score and evidence trail is publicly visible — forever, to everyone. Two subscriptions exist to help councils who want to move up the rankings.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 bg-slate-50 border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><Eye className="w-5 h-5 text-slate-500" /><h3 className="font-bold text-xl">Public</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">Free</span> <span className="text-muted-foreground">forever</span></div>
            <p className="text-sm mb-5 leading-relaxed">Read any council's score, rank, indicator-by-indicator breakdown, and the evidence URL behind every claim.</p>
            <Link href="/directory"><Button variant="outline" className="w-full">Browse every council</Button></Link>
          </Card>
          <Card className="p-6 bg-white border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><BadgeCheck className="w-5 h-5 text-sky-600" /><h3 className="font-bold text-xl">Gold</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">£349</span> <span className="text-muted-foreground">/year</span></div>
            <p className="text-sm mb-5 leading-relaxed">Top-5 improvement roadmap, monthly clerk tips, 3 peer comparisons, annual resident summary, automated evidence pack.</p>
            <Link href="/pricing"><Button variant="outline" className="w-full">Start Gold</Button></Link>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-white to-accent/5 border-2 border-accent rounded-2xl relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most councils choose this</span>
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-accent" /><h3 className="font-bold text-xl">Platinum</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">£499</span> <span className="text-muted-foreground">/year</span></div>
            <p className="text-sm mb-5 leading-relaxed">Top-12 quarter-sequenced roadmap, weekly tips, 10 peer comparisons + county/regional benchmarking, quarterly re-scoring, resident survey hub.</p>
            <Link href="/pricing"><Button className="w-full bg-accent hover:bg-accent/90 text-white">Start Platinum — 14-day trial</Button></Link>
          </Card>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-6">Both ex VAT. 14-day trial on both. Cancel any time.</p>
      </section>

      {/* ── Three sample reports ──────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-6xl py-20">
          <div className="max-w-3xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono text-[10px]">See what subscribers receive</Badge>
            <h2 className="text-3xl font-bold mb-4">Three real councils. Three sample reports. Free to download.</h2>
            <p className="text-muted-foreground leading-relaxed">
              These are the actual sample reports — auto-generated from the same data behind every public council page — for three real councils across the band spectrum. Click any one for the gated 60-second download.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {SAMPLE_REPORT_COUNCILS.map((c) => (
              <Link key={c.slug} href={`/council/${c.slug}`}>
                <Card className="p-6 bg-white border-slate-200 rounded-2xl hover:border-accent hover:shadow-lg transition cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={`${c.bandClasses} text-[10px]`}>{c.band}</Badge>
                    <span className="text-2xl font-bold font-mono">{c.score}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{c.region}</p>
                  <p className="text-sm leading-relaxed mb-4">{c.story}</p>
                  <div className="flex items-center gap-1.5 text-xs text-accent font-semibold">
                    <FileDown className="w-3.5 h-3.5" />Get the sample report <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/spotlight">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                <Sparkles className="w-4 h-4 mr-2" />See a full Platinum report (Spotlight: Woolsington)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Platinum in practice ────────────────────── */}
      <section className="bg-primary text-white py-20">
        <div className="container max-w-6xl">
          <div className="max-w-3xl mb-12">
            <Badge className="mb-3 bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">Platinum in practice</Badge>
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

const SAMPLE_REPORT_COUNCILS = [
  {
    slug: "fordingbridge-town-council",
    name: "Fordingbridge Town Council",
    region: "South East",
    score: 100,
    band: "Excellent",
    bandClasses: "bg-emerald-100 text-emerald-800 border-emerald-200",
    story: "What perfect transparency looks like — every statutory document published on a current website with valid evidence URLs across all 12 indicators.",
  },
  {
    slug: "allhallows-parish-council",
    name: "Allhallows Parish Council",
    region: "North West",
    score: 60,
    band: "Developing",
    bandClasses: "bg-amber-100 text-amber-800 border-amber-200",
    story: "Mid-band council with strong fundamentals but four specific gaps that are closable in days. The most relatable sample for the typical clerk.",
  },
  {
    slug: "compton-bassett-parish-council",
    name: "Compton Bassett Parish Council",
    region: "South West",
    score: 39,
    band: "Needs Attention",
    bandClasses: "bg-rose-100 text-rose-800 border-rose-200",
    story: "Where the score is a diagnostic — clear list of statutory publications missing, each with a fixable URL path. Demonstrates the diagnostic value clearly.",
  },
];

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
        