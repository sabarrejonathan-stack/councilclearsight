import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, MapPin, Trophy, TrendingUp, Users, Globe,
  ChevronRight, ExternalLink, Download, BarChart2, Award,
  CheckCircle2, XCircle,
} from "lucide-react";
import { useMemo } from "react";

// Slug → display name mapping (matches actual regions in database)
const REGION_NAMES: Record<string, string> = {
  "south-west": "South West",
  "south-east": "South East",
  "east-of-england": "East of England",
  "east-midlands": "East Midlands",
  "west-midlands": "West Midlands",
  "yorkshire-and-the-humber": "Yorkshire and the Humber",
  "north-west": "North West",
  "north-east": "North East",
  "london": "London",
};

// Region → county/area context (matches actual regions in database)
const REGION_CONTEXT: Record<string, { description: string; counties: string; area: string }> = {
  "South West": {
    description: "Covering parish and town councils across Cornwall, Devon, Somerset, and Wiltshire — from the Tamar Valley and Exmoor to the Mendips and Salisbury Plain.",
    counties: "Cornwall, Devon, Somerset, Wiltshire",
    area: "South West England",
  },
  "South East": {
    description: "Covering parish and town councils across Buckinghamshire, East Sussex, Hampshire, and Kent — from the Chilterns and South Downs to the North Downs and Romney Marsh.",
    counties: "Buckinghamshire, East Sussex, Hampshire, Kent",
    area: "South East England",
  },
  "East of England": {
    description: "Covering parish and town councils across Cambridgeshire, Essex, Norfolk, and Suffolk — from the Fens and Broads to the Suffolk Coast and Stour Valley.",
    counties: "Cambridgeshire, Essex, Norfolk, Suffolk",
    area: "East of England",
  },
  "East Midlands": {
    description: "Covering parish and town councils across Derbyshire, Lincolnshire, and Nottinghamshire — from the Peak District and Sherwood Forest to the Lincolnshire Wolds.",
    counties: "Derbyshire, Lincolnshire, Nottinghamshire",
    area: "East Midlands",
  },
  "West Midlands": {
    description: "Covering parish and town councils across Shropshire and Staffordshire — from the Shropshire Hills and Ironbridge Gorge to Cannock Chase and the Staffordshire Moorlands.",
    counties: "Shropshire, Staffordshire",
    area: "West Midlands",
  },
  "Yorkshire and the Humber": {
    description: "Covering parish and town councils across North Yorkshire, South Yorkshire, East Riding, and West Yorkshire \u2014 from the Yorkshire Dales and North York Moors to the Vale of York and the Humber Estuary.",
    counties: "North Yorkshire, South Yorkshire, East Riding, West Yorkshire",
    area: "Yorkshire and the Humber",
  },
  "North West": {
    description: "Covering parish and town councils across Cheshire, Lancashire, and Cumbria \u2014 from the Lake District and Forest of Bowland to the Cheshire Plain and Mersey Valley.",
    counties: "Cheshire, Lancashire, Cumbria",
    area: "North West England",
  },
  "North East": {
    description: "Covering parish and town councils across County Durham, Northumberland, and Tyne and Wear \u2014 from the Pennines and Hadrian's Wall to the Durham Dales and Northumberland Coast.",
    counties: "County Durham, Northumberland",
    area: "North East England",
  },
  "London": {
    description: "Greater London has only one parish council — Queen's Park in Westminster, established in 2014 as the first parish council in London since 1965.",
    counties: "Westminster (Greater London)",
    area: "Greater London",
  },
};

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) return <Badge className="bg-teal-600 text-white text-xs">Excellent</Badge>;
  if (score >= 65) return <Badge className="bg-blue-600 text-white text-xs">Good</Badge>;
  if (score >= 50) return <Badge className="bg-amber-500 text-white text-xs">Developing</Badge>;
  return <Badge className="bg-red-500 text-white text-xs">Needs Attention</Badge>;
}

function MiniBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  const color = pct >= 80 ? "#0d9488" : pct >= 65 ? "#3b82f6" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-bold text-slate-800 w-8 text-right">{Math.round(pct)}</span>
    </div>
  );
}

export default function RegionalDirectory() {
  useSEO({
      "title": "Regional Directory | Council ClearSight — Councils by Region",
      "description": "Explore parish and town council transparency scores by English region. Compare performance across South East, North West, East of England, and more.",
      "keywords": "regional council directory, parish councils by region, council transparency regional, English regions council performance",
      "canonicalPath": "/regions"
  });
  const params = useParams<{ region: string }>();
  const regionSlug = params?.region ?? "";
  const regionName = REGION_NAMES[regionSlug] ?? regionSlug.replace(/-/g, " ");
  const context = REGION_CONTEXT[regionName] as { description: string; counties: string; area: string } | undefined;

  const { data: councils, isLoading } = trpc.councils.list.useQuery({
    region: regionName,
    sortBy: "rank",
    limit: 200,
  });

  const { data: allStats } = trpc.councils.regionalStats.useQuery();

  const regionStats = useMemo(() => {
    if (!allStats) return null;
    const stats = allStats as unknown as Array<{ region: string | null; count: number; avgScore: number; minScore: number; maxScore: number }>;
    return stats.find(s => s.region === regionName) ?? null;
  }, [allStats, regionName]);

  // Compute distribution bands from the councils list
  const distribution = useMemo(() => {
    if (!councils) return null;
    const list = councils as Array<{ vdtiOverallScore: number | null }>;
    const excellent = list.filter(c => (Number(c.vdtiOverallScore) || 0) >= 80).length;
    const good = list.filter(c => { const s = Number(c.vdtiOverallScore) || 0; return s >= 65 && s < 80; }).length;
    const developing = list.filter(c => { const s = Number(c.vdtiOverallScore) || 0; return s >= 50 && s < 65; }).length;
    const needsAttention = list.filter(c => (Number(c.vdtiOverallScore) || 0) < 50).length;
    return { excellent, good, developing, needsAttention, total: list.length };
  }, [councils]);

  // Accept both exact slug matches and dynamic region names
  const isValidRegion = !!REGION_NAMES[regionSlug] || regionSlug.length > 0;
  if (!isValidRegion) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">Region not found</h1>
            <p className="text-slate-500">This regional page does not exist.</p>
            <Link href="/directory">
              <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to Directory</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/directory" className="hover:text-teal-600 transition-colors">Directory</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-medium">{regionName}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="text-white py-14" style={{ background: "linear-gradient(135deg, #0f2744 0%, #1e3a5f 50%, #0f2744 100%)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span className="text-teal-300 text-sm font-medium uppercase tracking-wider">
                  {context?.area ?? regionName}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {regionName}<br />
                <span className="text-teal-300">Council Rankings</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed">
                {context?.description ?? `Parish and town council transparency rankings for ${regionName}.`}
              </p>
              <p className="text-slate-400 text-sm">
                Rankings are based on the Council ClearSight CC-TI (Council ClearSight Transparency Index), computed
                entirely from publicly observable data. Every score can be independently verified.{" "}
                <Link href="/methodology" className="text-teal-300 hover:underline">Read the methodology →</Link>
              </p>
            </div>
            {/* Regional summary card */}
            {regionStats && (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 min-w-[220px] space-y-4 border border-white/20">
              <div className="text-center">
                <div className="text-5xl font-bold text-white">{Math.round(Number((regionStats as { avgScore: number }).avgScore) || 0)}</div>
                <div className="text-teal-300 text-sm mt-1">Regional average score</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Councils assessed</span>
                  <span className="font-semibold text-white">{(regionStats as { count: number }).count}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Highest score</span>
                  <span className="font-semibold text-white">{Math.round(Number((regionStats as { maxScore: number }).maxScore) || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Lowest score</span>
                  <span className="font-semibold text-white">{Math.round(Number((regionStats as { minScore: number }).minScore) || 0)}</span>
                </div>
              </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Distribution summary */}
        {distribution && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Excellent", count: distribution.excellent, color: "bg-teal-50 border-teal-200 text-teal-700", dot: "bg-teal-600" },
              { label: "Good", count: distribution.good, color: "bg-blue-50 border-blue-200 text-blue-700", dot: "bg-blue-600" },
              { label: "Developing", count: distribution.developing, color: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500" },
              { label: "Needs Attention", count: distribution.needsAttention, color: "bg-red-50 border-red-200 text-red-700", dot: "bg-red-500" },
            ].map(band => (
              <div key={band.label} className={`rounded-xl border p-4 ${band.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${band.dot}`} />
                  <span className="text-xs font-medium uppercase tracking-wide">{band.label}</span>
                </div>
                <div className="text-3xl font-bold">{band.count}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {distribution.total > 0 ? Math.round((band.count / distribution.total) * 100) : 0}% of councils
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Score distribution bar */}
        {distribution && distribution.total > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-600" />
              Score distribution across {distribution.total} councils
            </h3>
            <div className="flex h-8 rounded-full overflow-hidden gap-0.5">
              {distribution.excellent > 0 && (
                <div className="bg-teal-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(distribution.excellent / distribution.total) * 100}%` }}>
                  {distribution.excellent > 2 ? distribution.excellent : ""}
                </div>
              )}
              {distribution.good > 0 && (
                <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(distribution.good / distribution.total) * 100}%` }}>
                  {distribution.good > 2 ? distribution.good : ""}
                </div>
              )}
              {distribution.developing > 0 && (
                <div className="bg-amber-400 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(distribution.developing / distribution.total) * 100}%` }}>
                  {distribution.developing > 2 ? distribution.developing : ""}
                </div>
              )}
              {distribution.needsAttention > 0 && (
                <div className="bg-red-400 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(distribution.needsAttention / distribution.total) * 100}%` }}>
                  {distribution.needsAttention > 2 ? distribution.needsAttention : ""}
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />80–100: Excellent</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />65–79: Good</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />50–64: Developing</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />0–49: Needs Attention</span>
            </div>
          </div>
        )}

        {/* League table */}
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-teal-600" />
                  {regionName} — Full Rankings
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Ranked by CC-TI overall score. Click any council to view its full score breakdown.
                </p>
              </div>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Request PDF report
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !councils || (councils as unknown[]).length === 0 ? (
              <div className="text-center py-12 text-slate-500">No councils found for this region.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[48px_1fr_140px_100px_120px] gap-4 px-5 py-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <span>Rank</span>
                  <span>Council</span>
                  <span>Score</span>
                  <span>Band</span>
                  <span className="text-right">Website</span>
                </div>
                {(councils as Array<{
                  id: number;
                  name: string;
                  slug: string;
                  councilType: string | null;
                  county: string | null;
                  vdtiOverallScore: number | null;
                  vdtiOverallRank: number | null;
                  vdtiRegionalRank: number | null;
                  websiteUrl: string | null;
                }>).map((council, idx) => {
                  const score = Number(council.vdtiOverallScore) || 0;
                  const rank = council.vdtiRegionalRank ?? idx + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <Link key={council.id} href={`/councils/${council.slug}`}>
                      <div className={`grid grid-cols-[48px_1fr] md:grid-cols-[48px_1fr_140px_100px_120px] gap-4 px-5 py-4 hover:bg-teal-50/50 transition-colors cursor-pointer items-center ${isTop3 ? "bg-teal-50/30" : ""}`}>
                        {/* Rank */}
                        <div className="flex items-center justify-center">
                          {rank === 1 ? (
                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-yellow-900" />
                            </div>
                          ) : rank === 2 ? (
                            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-700">2</span>
                            </div>
                          ) : rank === 3 ? (
                            <div className="w-8 h-8 rounded-full bg-amber-600/30 flex items-center justify-center">
                              <span className="text-xs font-bold text-amber-800">3</span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-slate-400 w-8 text-center">{rank}</span>
                          )}
                        </div>
                        {/* Name + type */}
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">{council.name}</div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {council.councilType && (
                              <span className="text-xs text-slate-500 capitalize">{council.councilType} council</span>
                            )}
                            {council.county && (
                              <span className="text-xs text-slate-400">· {council.county}</span>
                            )}
                          </div>
                        </div>
                        {/* Score bar */}
                        <div className="hidden md:block">
                          <MiniBar score={score} />
                        </div>
                        {/* Band */}
                        <div className="hidden md:flex items-center">
                          <ScoreBadge score={score} />
                        </div>
                        {/* Website */}
                        <div className="hidden md:flex items-center justify-end">
                          {council.websiteUrl ? (
                            <CheckCircle2 className="w-4 h-4 text-teal-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Methodology note */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600" />
            About these rankings
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Rankings are produced using the Council ClearSight CC-TI (Council ClearSight Transparency Index), a scoring
            framework built on 14 publicly observable indicators across four pillars: Digital Presence, Contact
            Transparency, Governance & Compliance, and Financial Accountability. Every indicator is derived from
            data recorded in the Council ClearSight database, which is itself compiled from publicly available sources
            including council websites, the DfE Get Information About Schools register, and the ICO Data Protection
            Register. No self-reported data is used.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Scores were assessed during the January–March 2025 assessment window. If you believe a score is inaccurate, visit the individual
            council profile page and use the "Dispute this score" form.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/methodology">
              <Button variant="outline" size="sm">Read the full methodology</Button>
            </Link>
            <Link href="/directory">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-3 h-3 mr-1.5" />
                All regions
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-white text-center space-y-4"
          style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" }}>
          <TrendingUp className="w-10 h-10 mx-auto text-teal-200" />
          <h2 className="text-2xl font-bold">Is your council in {regionName}?</h2>
          <p className="text-teal-100 max-w-xl mx-auto">
            Council ClearSight subscribers receive a detailed improvement roadmap, peer benchmarking against councils
            in their region, and a publishable annual report. Get in touch — no commitment required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact?subject=subscription">
              <Button size="lg" className="bg-white text-teal-800 hover:bg-teal-50 font-semibold">
                Register your interest
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Request a sample report
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
