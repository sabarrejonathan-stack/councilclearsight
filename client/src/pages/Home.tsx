/**
 * Home — landing page (compact, valid).
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
  HeartHandshake, Megaphone, CheckCircle2,
} from "lucide-react";
import { METHODOLOGY_VERSION } from "@/lib/scoring";

const PILLARS = [
  { n: 1, icon: Globe,       label: "Digital Presence",     max: 30, items: "Website · .gov.uk domain · accessibility statement" },
  { n: 2, icon: Mail,        label: "Contact Transparency", max: 30, items: "Email · phone · named clerk · clerk email" },
  { n: 3, icon: ShieldCheck, label: "Governance Documents", max: 25, items: "Agendas · minutes · annual financials" },
  { n: 4, icon: Users,       label: "Democratic Openness",  max: 15, items: "Chair · councillors · register of interests" },
];

const PRO_FEATURES = [
  { icon: Target, title: "Personalised roadmap", body: "A written plan of the specific documents to publish, at which URL, for how many points." },
  { icon: Megaphone, title: "Engagement templates", body: "Every improvement comes with newsletter wording, social post, meeting announcement." },
  { icon: BarChart3, title: "Quarterly re-scoring", body: "Your public score updates every 90 days, not every 12 months." },
  { icon: Users, title: "Peer benchmarking", body: "See where you sit against 10 councils similar to yours." },
  { icon: MessageCircle, title: "Direct support", body: "Email our team. One working day response. Not a chatbot." },
  { icon: HeartHandshake, title: "Annual strategy call", body: "Sixty minutes a year to plan the next quarter's push." },
];

const AUDIENCES = [
  { icon: Users, audience: "Residents", pitch: "See what your council publishes. Challenge anything that looks wrong." },
  { icon: ShieldCheck, audience: "Clerks and councillors", pitch: "See your page as residents see it. Fix errors for free, or subscribe for a plan to move up." },
  { icon: BarChart3, audience: "Journalists and researchers", pitch: "Every score is pinned to its evidence. Use it to compare councils with confidence." },
];

export default function Home() {
  useSEO({
    title: "Council ClearSight — how transparent is your council, really?",
    description: "An independent transparency score for every parish, town and city council in England.",
    canonicalPath: "/",
  });
  return (
    <PublicLayout>
      <section className="bg-primary relative overflow-hidden">
        <div className="container max-w-6xl py-20 lg:py-28">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 font-mono text-[11px]">{METHODOLOGY_VERSION} · assessed April 2026</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              How transparent is your council,<br/>
              <span className="text-accent">really?</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl mb-8">
              An independent score for every parish, town and city council in England. Calculated from fourteen specific, observable things. Explained in plain English.
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

      <section className="container max-w-6xl py-20">
        <div className="max-w-3xl mb-12">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">What we measure</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-4">Four pillars. Fourteen indicators. One honest number.</h2>
          <p className="text-muted-foreground leading-relaxed">We measure observable public transparency. A high score means a resident can find, read, and scrutinise what the council is doing.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.n} className="p-5 bg-white border-slate-200">
                <div className="flex items-center justify-between mb-4"><Icon className="w-5 h-5 text-accent" /><span className="text-2xl font-bold font-mono">{p.max}</span></div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Pillar {p.n}</div>
                <div className="font-semibold text-foreground mb-2">{p.label}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.items}</p>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 text-center"><Link href="/methodology"><Button variant="outline">Read the methodology <ArrowRight className="w-4 h-4 ml-1.5" /></Button></Link></div>
      </section>

      <section className="container max-w-5xl py-20">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">For councils</Badge>
          <h2 className="text-3xl font-bold mb-4">Free to see your score. Two tiers if you want help improving it.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-7 bg-white border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><BadgeCheck className="w-5 h-5 text-sky-600" /><h3 className="font-bold text-xl">Verified</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">£149</span> <span className="text-muted-foreground">/year</span></div>
            <p className="text-sm mb-5 leading-relaxed">Claim your council's page. Fix errors directly. Get email alerts when anything changes.</p>
            <Link href="/pricing"><Button variant="outline" className="w-full">Start Verified</Button></Link>
          </Card>
          <Card className="p-7 bg-gradient-to-br from-white to-accent/5 border-2 border-accent rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-accent" /><h3 className="font-bold text-xl">Pro</h3></div>
            <div className="mb-4"><span className="text-3xl font-bold">£449</span> <span className="text-muted-foreground">/year</span></div>
            <p className="text-sm mb-5 leading-relaxed">Personalised roadmap, quarterly re-scoring, peer benchmarking, engagement templates, direct support.</p>
            <Link href="/pricing"><Button className="w-full bg-accent hover:bg-accent/90 text-white">Start Pro</Button></Link>
          </Card>
        </div>
      </section>

      <section className="bg-primary text-white py-20">
        <div className="container max-w-5xl">
          <div className="max-w-3xl mb-12">
            <Badge className="mb-3 bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">Pro in practice</Badge>
            <h2 className="text-3xl font-bold mb-4">We help you improve the score AND the conversation with residents.</h2>
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
        </div>
      </section>

      <section className="container max-w-6xl py-20">
        <div className="grid md:grid-cols-3 gap-5">
          {AUDIENCES.map((x) => {
            const Icon = x.icon;
            return (
              <div key={x.audience} className="p-6 border border-border rounded-2xl">
                <Icon className="w-5 h-5 text-accent mb-3" />
                <h3 className="font-semibold mb-2">{x.audience}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{x.pitch}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-50 border-t border-slate-200">
        <div className="container max-w-4xl py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Find your council. Read its story.</h2>
          <Link href="/directory"><Button size="lg">Open the directory <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
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
