/**
 * Spotlight — Woolsington Parish Council
 *
 * The full Pro-tier transparency report rendered inline as the marketing
 * showcase for what Council ClearSight Platinum subscribers receive.
 *
 * Data is loaded from /data/spotlight/woolsington-parish-council.json
 * — the hand-curated dossier compiled from direct verification of the
 * council's published website, Newcastle City Council records, ONS
 * 2021 Census and the Northumberland Association of Local Councils.
 *
 * Ungated, downloadable, and CTA'd to Pro (£499/yr) throughout.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, ExternalLink, CheckCircle2, AlertCircle, Sparkles, BadgeCheck,
  MapPin, Users, Globe, Mail, Phone, FileText, ShieldCheck, BookOpen,
  Plane, Award, Flag, FileDown,
} from "lucide-react";

interface Officer { name: string; ward?: string; email?: string; phone?: string; email_domain_concern?: string; }
interface Councillor { name: string; ward: string; role: string; }
interface Evidence { label: string; url?: string; source_page?: string; verified: boolean; notes?: string; improvement_note?: string; }
interface Strength { title: string; summary: string; indicator_ids?: string[]; }
interface Opportunity {
  id: string;
  priority: "high" | "medium" | "low";
  pillar: string;
  estimated_uplift_points: number;
  title: string;
  rationale: string;
  effort: string;
  evidence_source?: string;
  source_url?: string;
}
interface Dossier {
  slug: string;
  name: string;
  type: string;
  county: string;
  district: string;
  region: string;
  principal_authority: string;
  website: string;
  compiled_at: string;
  compiled_method: string;
  demographics: any;
  officers: { chair: Officer; vice_chair: Officer; clerk: Officer };
  councillors: Councillor[];
  wards_represented: string[];
  evidence: Record<string, Evidence>;
  strengths: Strength[];
  improvement_opportunities: Opportunity[];
  local_context: any;
  pro_tier_recommendations_summary: any;
}

export default function Spotlight() {
  useSEO({
    title: "Woolsington Parish Council — full Council ClearSight Platinum report (Spotlight)",
    description: "The full Pro-tier transparency report for Woolsington Parish Council in Newcastle upon Tyne — strengths, gaps, statutory references and the 9 specific improvement opportunities. Showcase example of what Platinum subscribers receive.",
    canonicalPath: "/spotlight",
  });

  const [d, setD] = useState<Dossier | null>(null);
  useEffect(() => {
    fetch("/data/spotlight/woolsington-parish-council.json")
      .then((r) => r.json())
      .then(setD)
      .catch(() => setD(null));
  }, []);

  if (!d) {
    return <PublicLayout><div className="container py-24 text-center text-muted-foreground">Loading spotlight report…</div></PublicLayout>;
  }

  const highPriority = d.improvement_opportunities.filter(o => o.priority === "high");
  const mediumPriority = d.improvement_opportunities.filter(o => o.priority === "medium");
  const lowPriority = d.improvement_opportunities.filter(o => o.priority === "low");
  const totalUplift = d.improvement_opportunities.reduce((s, o) => s + (o.estimated_uplift_points || 0), 0);

  return (
    <PublicLayout>
      {/* ── Spotlight banner ──────────────────────────── */}
      <section className="bg-accent/10 border-b-2 border-accent/30">
        <div className="container max-w-6xl py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-semibold">Spotlight</span>
            <span className="text-muted-foreground">— this is the full Platinum report, ungated, as a public showcase</span>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">
              Subscribe to Platinum (£499/yr) <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-primary text-white">
        <div className="container max-w-6xl py-16">
          <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-start">
            <div>
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">
                CC-TI v3.0 · Refreshed April 2026 · Hand-verified spotlight
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">{d.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/70 mb-6">
                <Badge variant="outline" className="border-white/30 text-white capitalize">{d.type} council</Badge>
                <span>{d.district}</span>
                <span className="text-white/40">·</span>
                <span>{d.county}</span>
                <span className="text-white/40">·</span>
                <span>{d.region}</span>
              </div>
              <p className="text-lg text-white/85 leading-relaxed max-w-3xl mb-6">
                A civil parish containing Newbiggin Hall, Woolsington village and Newcastle International Airport — a unique mix of suburban residential and major national infrastructure. {d.demographics.population_2021_census.toLocaleString()} residents across {d.wards_represented.length} wards.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={d.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                    <Globe className="w-4 h-4 mr-2" />Visit council website
                  </Button>
                </a>
                <Link href={`/council/${d.slug}`}>
                  <Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                    Public profile <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-w-[260px]">
              <div className="text-xs uppercase tracking-wider text-white/60 mb-1 font-mono">Pro-tier headline</div>
              <div className="text-3xl font-bold mb-1">+{totalUplift} pts</div>
              <p className="text-sm text-white/80 leading-relaxed mb-4">
                {d.pro_tier_recommendations_summary?.estimated_total_uplift || "Score-uplift potential within one quarter."}
              </p>
              <Link href="/pricing"><Button className="w-full bg-accent hover:bg-accent/90 text-white">Subscribe to Platinum</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Officers + demographics strip ─────────────── */}
      <section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="container max-w-6xl py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50 font-mono mb-1">Population</div>
            <div className="text-xl font-bold">{d.demographics.population_2021_census.toLocaleString()}</div>
            <div className="text-xs text-white/50">2021 Census · {d.demographics.households.toLocaleString()} households</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50 font-mono mb-1">Median age</div>
            <div className="text-xl font-bold">{d.demographics.median_age}</div>
            <div className="text-xs text-white/50">{d.demographics.uk_born_pct}% UK-born</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50 font-mono mb-1">Chair</div>
            <div className="text-base font-bold">{d.officers.chair.name}</div>
            <div className="text-xs text-white/50">{d.officers.chair.ward}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50 font-mono mb-1">Clerk</div>
            <div className="text-base font-bold">{d.officers.clerk.name}</div>
            <div className="text-xs text-white/50">{d.officers.clerk.email}</div>
          </div>
        </div>
      </section>

      {/* ── Executive summary ─────────────────────────── */}
      <section className="container max-w-5xl py-16">
        <Badge variant="outline" className="mb-3 font-mono text-[10px]">Executive summary</Badge>
        <h2 className="text-3xl font-bold mb-5">A genuine governance case study — strong fundamentals, specific gaps</h2>
        <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed">
          <p className="mb-4">
            Woolsington Parish Council is a notable case study because it does the hardest thing well — two consecutive AGARs with audit certificates, a multi-year meeting archive, distributed ward representation across {d.wards_represented.length} wards — but stops short on a small, specific set of fundamentals that other councils get right. Each of those gaps is closable in days, not quarters.
          </p>
          <p className="mb-4">
            The parish covers an unusual mix of suburban residential (Newbiggin Hall, Woolsington village, Bedeburn, Callerton, Bankfoot) and major national infrastructure (Newcastle International Airport). For a council of {d.demographics.population_2021_census.toLocaleString()} residents, hosting a piece of nationally-significant infrastructure means transparency duties carry an extra weight: airport-related decisions affect every ward, and structured resident engagement on those decisions is exactly the kind of activity Platinum-tier tools are designed to support.
          </p>
          <p>
            This report identifies <strong>{highPriority.length} high-priority, {mediumPriority.length} medium-priority and {lowPriority.length} low-priority improvement opportunities</strong>, with a combined achievable score uplift of <strong>+{totalUplift} CC-TI points within one quarter</strong>.
          </p>
        </div>
      </section>

      {/* ── Strengths ──────────────────────────────────── */}
      <section className="bg-emerald-50 border-y border-emerald-200">
        <div className="container max-w-5xl py-16">
          <Badge variant="outline" className="mb-3 font-mono text-[10px] border-emerald-300 text-emerald-700">Strengths</Badge>
          <h2 className="text-3xl font-bold mb-3 text-emerald-950">What this council already does well</h2>
          <p className="text-emerald-900/80 mb-8 leading-relaxed">Hand-verified against the published website, NCC parish-council records and the Northumberland ALC directory.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {d.strengths.map((s, i) => (
              <Card key={i} className="p-6 bg-white border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-3" />
                <h3 className="font-bold text-lg mb-2 text-emerald-950">{s.title}</h3>
                <p className="text-sm text-emerald-900/80 leading-relaxed">{s.summary}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Evidence pack ──────────────────────────────── */}
      <section className="container max-w-5xl py-16">
        <Badge variant="outline" className="mb-3 font-mono text-[10px]">Evidence pack</Badge>
        <h2 className="text-3xl font-bold mb-3">Verified document trail</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Every claim made about Woolsington in this report is pinned to a public document. This is the verified evidence trail.
        </p>
        <div className="space-y-3">
          {Object.entries(d.evidence).map(([key, ev]) => (
            <div key={key} className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
              <FileText className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{ev.label}</span>
                  {ev.verified && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" />Verified
                    </Badge>
                  )}
                </div>
                {ev.notes && <p className="text-xs text-muted-foreground leading-relaxed mb-2">{ev.notes}</p>}
                {ev.improvement_note && (
                  <p className="text-xs text-amber-700 leading-relaxed mb-2 bg-amber-50 px-2 py-1 rounded">
                    <AlertCircle className="w-3 h-3 inline mr-1" />{ev.improvement_note}
                  </p>
                )}
                {(ev.url || ev.source_page) && (
                  <a href={ev.url || ev.source_page} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />View source
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Improvement opportunities — full list ─────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-5xl py-16">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Improvement roadmap</Badge>
          <h2 className="text-3xl font-bold mb-3">{d.improvement_opportunities.length} prioritised, evidence-based recommendations</h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Each recommendation is grounded in a specific statutory reference, scored for impact, and closable with the council's existing capacity. This is the full Platinum roadmap as it would be delivered to a Woolsington subscriber.
          </p>

          <RecGroup priority="high"   label="High priority"   recs={highPriority} />
          <RecGroup priority="medium" label="Medium priority" recs={mediumPriority} />
          <RecGroup priority="low"    label="Low priority"    recs={lowPriority} />
        </div>
      </section>

      {/* ── Local context ─────────────────────────────── */}
      <section className="container max-w-5xl py-16">
        <Badge variant="outline" className="mb-3 font-mono text-[10px]">Local context</Badge>
        <h2 className="text-3xl font-bold mb-5 flex items-center gap-3">
          <Plane className="w-7 h-7 text-accent" />
          {d.local_context.headline_issue}
        </h2>
        <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-4">
          <p>{d.local_context.summary}</p>
          <p><strong className="text-foreground">Demographics implication:</strong> {d.local_context.demographic_implication}</p>
          <p><strong className="text-foreground">Regional context:</strong> {d.local_context.north_east_regional_context}</p>
        </div>
      </section>

      {/* ── Councillors directory ─────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-5xl py-16">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Council membership</Badge>
          <h2 className="text-3xl font-bold mb-8">{d.councillors.length} councillors across {d.wards_represented.length} wards</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {d.councillors.map((c, i) => (
              <Card key={i} className="p-4 bg-white border-slate-200">
                <div className="font-semibold text-sm mb-1">{c.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3" />{c.ward}
                </div>
                <Badge variant={c.role === "Chair" ? "default" : c.role === "Vice-Chair" ? "secondary" : "outline"} className="text-[10px]">
                  {c.role}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Methodology + close ───────────────────────── */}
      <section className="bg-primary text-white py-16">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">How this report is compiled</Badge>
          <h2 className="text-3xl font-bold mb-5">Verified, statute-grounded, evidence-pinned</h2>
          <p className="text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
            {d.compiled_method} Compiled {d.compiled_at} using CC-TI v3.0 methodology.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/methodology">
              <Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                <BookOpen className="w-4 h-4 mr-2" />Read the methodology
              </Button>
            </Link>
            <Link href="/pricing">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                <Sparkles className="w-4 h-4 mr-2" />Subscribe to Platinum (£499/yr)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="container max-w-4xl py-12 text-center">
          <h2 className="text-2xl font-bold mb-3">Want this depth for your council?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Platinum subscribers receive this exact format — verified evidence pack, prioritised roadmap, local context, councillor directory — refreshed every 90 days.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/directory"><Button size="lg" variant="outline">Find your council</Button></Link>
            <Link href="/pricing"><Button size="lg" className="bg-accent hover:bg-accent/90 text-white">View pricing <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function RecGroup({ priority, label, recs }: { priority: string; label: string; recs: Opportunity[] }) {
  if (recs.length === 0) return null;
  const colour = priority === "high" ? "rose" : priority === "medium" ? "amber" : "slate";
  return (
    <div className="mb-10">
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-${colour}-100 text-${colour}-800 border border-${colour}-200`}>
        {label} · {recs.length} recommendations
      </div>
      <div className="space-y-4">
        {recs.map((o) => (
          <Card key={o.id} className="p-6 bg-white border-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-[280px]">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] font-mono">{o.pillar}</Badge>
                  {o.estimated_uplift_points > 0 && (
                    <Badge className="bg-accent/15 text-accent border-accent/30 text-[10px]">
                      +{o.estimated_uplift_points} pts available
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2">{o.title}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{o.rationale}</p>
            <div className="grid md:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
              <div>
                <span className="font-semibold text-foreground">Effort:</span>
                <span className="text-muted-foreground"> {o.effort}</span>
              </div>
              {o.evidence_source && (
                <div>
                  <span className="font-semibold text-foreground">Source:</span>{" "}
                  {o.source_url ? (
                    <a href={o.source_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {o.evidence_source} <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{o.evidence_source}</span>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
