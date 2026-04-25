/**
 * CouncilProfile — per-council page with evidence trail (compact, valid).
 */
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { useCouncilBySlug } from "@/lib/staticData";
import {
  ArrowLeft, ArrowRight, Mail, Phone, Globe, User, BookOpen,
  CheckCircle2, XCircle, MinusCircle, Flag, Scale, FileText,
  BadgeCheck, Sparkles, FileDown, AlertCircle, ShieldOff, WifiOff, Search,
} from "lucide-react";
import {
  PILLAR_META, INDICATORS, indicatorsForPillar,
  bandColorClasses, pillarColorClasses,
  formatScore, formatCompleteness, ordinal,
  METHODOLOGY_VERSION,
  type CouncilScore, type IndicatorResult,
} from "@/lib/scoring";
import SampleReportModal from "@/components/SampleReportModal";

export default function CouncilProfile({ params }: { params: { slug: string } }) {
  const { data, isLoading } = useCouncilBySlug(params.slug);
  const council = data as CouncilScore | undefined;
  const [reportOpen, setReportOpen] = useState(false);

  useSEO({
    title: council ? `${council.name} · VDTI Score ${formatScore(council.score)}` : "Loading…",
    description: council ? `Transparency assessment of ${council.name}. VDTI score ${formatScore(council.score)}/100.` : undefined,
    canonicalPath: `/council/${params.slug}`,
  });

  if (isLoading || !council) return <PublicLayout><div className="container py-24 text-center text-muted-foreground">Loading…</div></PublicLayout>;

  const bandCls = bandColorClasses(council.band as any);

  return (
    <PublicLayout>
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="container max-w-6xl py-4">
          <Link href="/directory" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3 h-3" /> Back to the directory
          </Link>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200">
        <div className="container max-w-6xl py-10">

          {/* ── Sample Report CTA — top of every council page ── */}
          <div className="mb-6 p-5 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-2 border-accent/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                <FileDown className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-bold text-sm">Get the sample report for {council.name}</div>
                <div className="text-xs text-muted-foreground">4-page PDF · score, indicators, peer comparison &amp; the top improvement opportunity</div>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={() => setReportOpen(true)}
            >
              Get the sample report <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* ── Data-state disclaimer banner ── */}
          <DataStateDisclaimer council={council} />

          <div className="flex flex-wrap items-start gap-6 mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                <Badge variant="outline" className="capitalize">{council.type.replace("_", " ")} council</Badge>
                {council.county && <span className="text-muted-foreground">{council.county}</span>}
                {council.region && <><span className="text-muted-foreground/50">·</span><span className="text-muted-foreground">{council.region}</span></>}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{council.name}</h1>
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                {council.rank_national && <div><span className="font-semibold text-foreground">{ordinal(council.rank_national)}</span> nationally</div>}
                {council.rank_region && council.region && <div><span className="font-semibold text-foreground">{ordinal(council.rank_region)}</span> in {council.region}</div>}
                {council.rank_type && <div><span className="font-semibold text-foreground">{ordinal(council.rank_type)}</span> among {council.type.replace("_", " ")} councils</div>}
              </div>
            </div>

            <div className={`relative w-[150px] h-[150px] flex items-center justify-center rounded-2xl ${bandCls.bg} ${bandCls.border} border`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${bandCls.text}`}>{formatScore(council.score)}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">VDTI score</div>
              </div>
            </div>
          </div>

          <SampleReportModal open={reportOpen} onOpenChange={setReportOpen} council={council} />

          <div className={`${bandCls.bg} ${bandCls.border} border rounded-xl p-4 flex items-start gap-3`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${bandCls.dot}`} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <span className={`font-semibold ${bandCls.text}`}>{council.band}</span>
                <span className="text-xs text-muted-foreground">Completeness {formatCompleteness(council.completeness)}</span>
                <span className="text-xs text-muted-foreground font-mono">{council.methodology_version}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assessed on {council.indicators.filter(i => i.assessed).length} of {INDICATORS.length} indicators. Where we can't yet observe evidence, the indicator is marked "Not Assessed" and excluded from the denominator — we never punish a council for a gap in our measurement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-6xl py-10 grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-12 min-w-0">

          {/* ── Resident-facing explanation (per April 2026 brief) ── */}
          <section className="bg-sky-50 border-l-4 border-sky-500 rounded-r-2xl p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-sky-800 mb-2">For residents</div>
            <h2 className="text-base font-bold text-sky-950 mb-2">What this score does — and what it does not — measure</h2>
            <div className="text-sm text-sky-900/90 leading-relaxed space-y-2">
              <p>
                The score shows how easy it is for residents to find core council information online. It is calculated identically for every council from the same thirteen observable indicators across four pillars.
              </p>
              <p>
                A lower score does not automatically mean poor decision-making. It means important evidence may not be easy to find publicly. If something appears missing, you can <Link href="/challenge" className="underline text-sky-700 hover:text-sky-900">submit a score challenge with evidence</Link>, or contact the council constructively to ask where it can be found.
              </p>
              <p className="text-xs text-sky-800/80 pt-1">
                Last updated: 16 April 2026 · Assessed during January – March 2026 · Next assessment: January 2027
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Pillar breakdown</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {([1,2,3,4] as const).map((p) => {
                const earned = council.pillar_earned[String(p)] ?? 0;
                const maxAssessed = council.pillar_max_assessed[String(p)] ?? 0;
                const total = PILLAR_META[p].max;
                const notAssessed = total - maxAssessed;
                const pct = maxAssessed > 0 ? (earned / maxAssessed) : 0;
                const cls = pillarColorClasses(p);
                return (
                  <div key={p} className={`p-4 border ${cls.border} ${cls.bg} rounded-xl`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-mono ${cls.text} opacity-70`}>Pillar {p}</span>
                      <span className="text-xs text-muted-foreground">
                        {earned}/{maxAssessed}{notAssessed > 0 && <span className="text-amber-700"> · {notAssessed} NA</span>}
                      </span>
                    </div>
                    <div className="font-semibold text-sm mb-3">{PILLAR_META[p].label}</div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${pct >= 0.8 ? "bg-emerald-500" : pct >= 0.6 ? "bg-teal-500" : pct >= 0.4 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${Math.round(pct * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Every indicator, every input</h2>
                <p className="text-xs text-muted-foreground">Each row is an indicator, the rule applied, and what the rule saw.</p>
              </div>
              <Link href="/methodology"><Button size="sm" variant="outline"><BookOpen className="w-3.5 h-3.5 mr-1.5" /> How this is scored</Button></Link>
            </div>

            <Tabs defaultValue="p1" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {([1,2,3,4] as const).map((p) => (
                  <TabsTrigger key={p} value={`p${p}`} className="text-xs">
                    <span className="hidden sm:inline">P{p}</span>{' '}{PILLAR_META[p].shortLabel}
                  </TabsTrigger>
                ))}
              </TabsList>

              {([1,2,3,4] as const).map((p) => (
                <TabsContent key={p} value={`p${p}`} className="mt-4 space-y-2">
                  {indicatorsForPillar(p).map((indMeta) => {
                    const result = council.indicators.find(i => i.id === indMeta.id);
                    if (!result) return null;
                    return <IndicatorRow key={indMeta.id} indicator={result} slug={council.slug} />;
                  })}
                </TabsContent>
              ))}
            </Tabs>
          </section>
        </div>

        <aside className="space-y-6">
          {/* ── Claim CTA (clerks only, but visible to all as social proof) ── */}
          <Card className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/40">
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-bold">Are you this council's clerk?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Claim the page in 60 seconds. Fix the contact fields. Get email alerts when anything changes. From £349/year, cancel any time.
            </p>
            <Link href={`/pricing?claim=${council.slug}`}>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-white mb-2">
                <BadgeCheck className="w-3.5 h-3.5 mr-1.5" />Claim this page
              </Button>
            </Link>
            <Link href="/for-clerks">
              <Button size="sm" variant="outline" className="w-full text-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />What Pro adds (£499/yr)
              </Button>
            </Link>
          </Card>

          <Card className="p-5 bg-white">
            <h3 className="text-sm font-semibold mb-3">Contact the council</h3>
            <div className="space-y-2.5 text-sm">
              <ContactRow icon={Globe} label="Website" value={(council as any).website || undefined} href={(council as any).website || undefined} />
              <ContactRow icon={Mail} label="Email" value={(council as any).email || undefined} href={(council as any).email ? `mailto:${(council as any).email}` : undefined} />
              <ContactRow icon={Phone} label="Phone" value={(council as any).phone || undefined} />
              <ContactRow icon={User} label="Clerk" value={(council as any).clerk_name || undefined} subValue={(council as any).clerk_email || undefined} />
              <ContactRow icon={User} label="Chair" value={validChair((council as any).chair_name)} />
            </div>
          </Card>

          <Card className="p-5 bg-slate-50 border-slate-200">
            <h3 className="text-sm font-semibold mb-3">Understand this score</h3>
            <div className="space-y-2.5 text-xs">
              <Link href="/methodology" className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300">
                <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-slate-500" />Methodology explained clearly</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/methodology/disputes" className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300">
                <span className="flex items-center gap-2"><Scale className="w-3.5 h-3.5 text-slate-500" />Past dispute decisions</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>
              <Link href="/methodology/changelog" className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300">
                <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-500" />Methodology updates</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </Card>

          <Card className="p-5 bg-primary text-white">
            <Flag className="w-5 h-5 mb-3 text-accent" />
            <h3 className="font-semibold mb-2">Think something's wrong?</h3>
            <p className="text-xs text-white/75 leading-relaxed mb-4">
              Any resident, clerk, or councillor can challenge any score. Submit evidence, we'll respond within five working days, and the decision is logged publicly.
            </p>
            <Link href={`/challenge?slug=${council.slug}`}>
              <Button size="sm" className="w-full bg-white text-primary hover:bg-white/90">Challenge a score <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button>
            </Link>
          </Card>
        </aside>
      </div>
    </PublicLayout>
  );
}

function IndicatorRow({ indicator, slug }: { indicator: IndicatorResult; slug: string }) {
  const [open, setOpen] = useState(false);
  const status: "pass" | "fail" | "na" = !indicator.assessed ? "na" : indicator.earned > 0 ? "pass" : "fail";
  const StatusIcon = status === "pass" ? CheckCircle2 : status === "fail" ? XCircle : MinusCircle;
  const statusText = status === "pass" ? "Evidence found" : status === "fail" ? "Evidence not found" : "Not yet assessed";
  const statusCls = status === "pass" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : status === "fail" ? "text-red-700 bg-red-50 border-red-200" : "text-slate-600 bg-slate-50 border-slate-200";

  return (
    <div className="border border-slate-200 bg-white rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50">
        <StatusIcon className={`w-4 h-4 flex-shrink-0 ${status === "pass" ? "text-emerald-600" : status === "fail" ? "text-red-500" : "text-slate-400"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">{indicator.id}</Badge>
            <span className="font-medium text-sm">{indicator.label}</span>
          </div>
        </div>
        <div className={`text-xs font-mono px-2 py-0.5 rounded-full border ${statusCls}`}>{statusText}</div>
        <div className="text-sm font-bold w-14 text-right font-mono">
          {indicator.assessed ? `${indicator.earned}/${indicator.max_points}` : <span className="text-slate-400">—/{indicator.max_points}</span>}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50">
          <div className="pt-3 space-y-3">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Input snapshot (what the rule saw)</div>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                {Object.entries(indicator.input_snapshot).map(([k, v]) => (
                  <div key={k}><span className="text-slate-400">{k}: </span><span className="text-emerald-300">{JSON.stringify(v)}</span></div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <Link href={`/challenge?slug=${slug}&indicator=${indicator.id}`} className="text-accent hover:underline inline-flex items-center gap-1">
                <Flag className="w-3 h-3" />Think this is wrong? Challenge it.
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactRow({ icon: Icon, label, value, href, subValue }: { icon: any; label: string; value?: string; href?: string; subValue?: string }) {
  if (!value) {
    return <div className="flex items-center gap-2 text-muted-foreground/60 text-xs"><Icon className="w-3.5 h-3.5" /><span>No {label.toLowerCase()} recorded</span></div>;
  }
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        {href ? (
          <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-foreground hover:text-accent break-words text-sm">{value}</a>
        ) : (
          <div className="text-foreground text-sm break-words">{value}</div>
        )}
        {subValue && <div className="text-xs text-muted-foreground break-words mt-0.5">{subValue}</div>}
      </div>
    </div>
  );
}

// A chair_name field with semicolons is a councillor list mis-attributed to chair.
// Don't display such records — the data is unreliable.
function validChair(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  if (name.includes(";")) return undefined;
  return name;
}

function inputOf(council: CouncilScore, indicatorId: string, field: string): unknown {
  const ind = council.indicators.find(i => i.id === indicatorId);
  return ind?.input_snapshot?.[field];
}

function DataStateDisclaimer({ council }: { council: CouncilScore }) {
  const status = (council as any).scrape_status || "unknown";
  if (status === "ok" || status === "unknown") return null;

  if (status === "no-url") {
    return (
      <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-start gap-3">
        <Search className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-amber-950 text-sm mb-1">No website on file for this council</div>
          <p className="text-xs text-amber-900 leading-relaxed mb-2">
            We don't currently have a website URL for {council.name}. Pillar 1 (Digital Presence) is scored against absence; Pillars 3 and 4 are marked <strong>Not Assessed</strong> rather than zero — we don't punish a council for a gap in our measurement.
          </p>
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>If you're the clerk and your council does have a website,</strong>{" "}
            <Link href={`/challenge?slug=${council.slug}&indicator=1.1`} className="text-amber-700 underline font-semibold">tell us about it</Link>
            {" "}— scores update within 14 working days of new evidence being verified.
          </p>
        </div>
      </div>
    );
  }

  if (status === "robots-disallow") {
    return (
      <div className="mb-6 p-4 bg-sky-50 border-2 border-sky-200 rounded-xl flex items-start gap-3">
        <ShieldOff className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-sky-950 text-sm mb-1">Site blocks automated transparency tools</div>
          <p className="text-xs text-sky-900 leading-relaxed mb-2">
            This council's <code className="font-mono">robots.txt</code> directs automated transparency tools not to read the site. We respect that opt-out — but it means we can't observe whether agendas, minutes, the AGAR or the register of interests are published. Pillars 3 and 4 are recorded as <strong>Not Assessed</strong>.
          </p>
          <p className="text-xs text-sky-900 leading-relaxed">
            <strong>If you're the clerk:</strong> a one-line addition to <code className="font-mono">robots.txt</code> would let our scanner observe your council's published evidence again. <Link href="/contact?topic=evidence" className="underline text-sky-700">Tell us</Link> and we'll re-scan within 14 working days.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
