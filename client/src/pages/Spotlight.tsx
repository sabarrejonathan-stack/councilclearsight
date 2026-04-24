import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  TrendingUp,
  Users,
  Zap,
  ExternalLink,
  AlertCircle,
  Star,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   CREWKERNE PILLAR DATA — ALIGNED TO REVISED METHODOLOGY
   ═══════════════════════════════════════════════════════════════════════════ */

const crewkernePillars = [
  {
    name: "Digital Presence",
    score: 25,
    maxPublic: 28.5,
    weight: "25%",
    status: "leading",
    color: "#2a9d8f",
    summary: "Near-perfect governance. Crewkerne publishes meeting minutes within the statutory timeframe, maintains a .gov.uk website with HTTPS, publishes its AGAR and accounts, and has standing orders and financial regulations available online. The accessibility statement is present but would benefit from a review against the full WCAG 2.1 AA standard. The ICO model publication scheme is referenced but not presented as a standalone page.",
    sources: [
      { label: "Council website", url: "https://www.crewkerne-tc.gov.uk" },
      { label: "Minutes page", url: "https://www.crewkerne-tc.gov.uk/your-council/council-meetings/" },
      { label: "Finance page", url: "https://www.crewkerne-tc.gov.uk/your-council/finance/budget-precept/" },
    ],
  },
  {
    name: "Governance & Compliance",
    score: 17,
    maxPublic: 23.75,
    weight: "25%",
    status: "emerging",
    color: "#f59e0b",
    summary: "The primary improvement opportunity. No publicly available evidence of a structured engagement programme or published feedback loop in the last 24 months. The complaints procedure is not prominently accessible on the website. Clerk and chair contact details are published, but a formal equalities statement meeting the Public Sector Equality Duty requirements is not visible. This is the single highest-impact area for score improvement.",
    sources: [
      { label: "Staff page", url: "https://www.crewkerne-tc.gov.uk/your-council/who-we-are/staff/" },
      { label: "Equality Act 2010", url: "https://www.legislation.gov.uk/ukpga/2010/15/contents" },
    ],
  },
  {
    name: "Contact Transparency",
    score: 20,
    maxPublic: 23.75,
    weight: "25%",
    status: "advanced",
    color: "#3b82f6",
    summary: "Strong community presence. Active Facebook and Instagram accounts with regular posts. The Crewkerne Neighbourhood Plan is in active development with published design codes. Two primary schools serve the parish — Maiden Beech Academy (Ofsted: Good) and Ashlands Primary School — with evidence of community connection. Evidence of partnership working with local organisations through the Neighbourhood Plan process.",
    sources: [
      { label: "Neighbourhood Plan", url: "https://www.crewkerne-tc.gov.uk/your-council/what-we-provide/neighbourhood-development-plan/" },
      { label: "Maiden Beech Academy", url: "https://www.maidenbeechprimary.org/" },
      { label: "Ashlands Primary School", url: "https://www.ashlandsprimaryschool.co.uk/" },
      { label: "Facebook page", url: "https://www.facebook.com/crewkernetowncouncil" },
    ],
  },
  {
    name: "Financial Accountability",
    score: 19,
    maxPublic: 19,
    weight: "25%",
    status: "advanced",
    color: "#2a9d8f",
    summary: "Good evidence of continuous improvement. The council publishes accounts and financial reports annually. The Clerk holds PSLCC membership, indicating professional development commitment. Evidence of training activity is present in minutes. An explicit improvement plan or strategic plan is not prominently published as a standalone document — this is a straightforward improvement opportunity.",
    sources: [
      { label: "Staff page (PSLCC)", url: "https://www.crewkerne-tc.gov.uk/your-council/who-we-are/staff/" },
      { label: "Accounts 2024/25 (PDF)", url: "https://www.crewkerne-tc.gov.uk/wp-content/uploads/2025/06/Accounts2025.pdf" },
    ],
  },
];

const overallScore = 81;
const nationalRank = "Top 1%";

const topRecommendations = [
  {
    number: 1,
    title: "Establish a structured resident engagement programme with published feedback loops",
    impact: "+10 pts",
    pillar: "Governance & Compliance",
    effort: "Low cost",
    body: "Crewkerne's most impactful single action. Creating a 'You Said, We Did' page on the council website, publishing responses to resident feedback, and scheduling regular community drop-in sessions would address the primary gap in the Governance & Compliance pillar. Demonstrating a visible feedback loop is what distinguishes high-scoring councils. Guidance is available from NALC and SLCC at no cost.",
    source: "NALC Good Councillor Guide (2022), Section 4: Financial Accountability",
  },
  {
    number: 2,
    title: "Publish a formal Equalities & Accessibility Statement",
    impact: "+5 pts",
    pillar: "Governance & Compliance",
    effort: "Minimal cost",
    body: "The council's obligations under the Equality Act 2010 and the Public Sector Equality Duty require a published statement demonstrating how the council considers the needs of people with protected characteristics. Given Crewkerne's higher-than-average disability rate (19.0% vs 17.8% nationally, ONS Census 2021), this is particularly relevant. Template statements are available from NALC.",
    source: "Equality Act 2010, s.149; ONS Census 2021 parish-level disability data",
  },
  {
    number: 3,
    title: "Publish a standalone complaints procedure page",
    impact: "+5 pts",
    pillar: "Governance & Compliance",
    effort: "Minimal cost",
    body: "A clearly accessible complaints procedure — published as a standalone page on the council website rather than embedded in other documents — demonstrates accountability and is a requirement of the Local Council Award Scheme at Bronze level. This is a quick win that signals openness to resident feedback.",
    source: "NALC/SLCC Local Council Award Scheme criteria (2023), Bronze level",
  },
  {
    number: 4,
    title: "Publish a strategic improvement plan",
    impact: "+5 pts",
    pillar: "Financial Accountability",
    effort: "Low cost",
    body: "The council's Neighbourhood Plan work demonstrates strategic thinking, but a standalone improvement plan — setting out the council's priorities for the year ahead, with measurable objectives — would strengthen the Financial Accountability pillar score. This also provides a framework for reporting back to residents at the Annual Parish Meeting.",
    source: "NALC/SLCC Local Council Award Scheme criteria (2023), Quality level",
  },
];

export default function Spotlight() {
  useSEO({
      "title": "Council Spotlight | Council ClearSight — Featured Councils",
      "description": "Spotlight on parish and town councils making a difference. See how top-performing councils achieve high transparency scores.",
      "keywords": "council spotlight, top parish councils, best town councils, council transparency leaders",
      "canonicalPath": "/spotlight"
  });
  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0f2942] text-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Badge className="bg-[#2a9d8f]/20 text-[#2a9d8f] border-[#2a9d8f]/30">
              Council in the Spotlight
            </Badge>
            <span className="text-slate-400 text-sm">Issue 01 · Assessment period: January–March 2026</span>
          </div>
          <div className="grid md:grid-cols-3 gap-12 items-start">
            <div className="md:col-span-2">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Crewkerne Town Council
              </h1>
              <p className="text-lg text-slate-300 mb-4 leading-relaxed">
                Crewkerne Town Council serves approximately 7,000 residents in the Somerset market town of Crewkerne. With a precept published on the council's finance page, significant housing development pressure from a proposed 325-home development on Station Road, and a community navigating the loss of its last bank branch, the council faces a defining period.
              </p>
              <p className="text-slate-400 leading-relaxed mb-4">
                This Spotlight analysis examines Crewkerne's performance against the Council ClearSight CC-TI framework — what the publicly available evidence shows, where the council excels, and where specific, achievable improvements would have the greatest impact.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Assessed during the standard annual window (January–March). Next assessment: January 2026.</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-3">CC-TI Score 2024/25</p>
              <div className="text-7xl font-black text-[#2a9d8f] mb-1">{overallScore}</div>
              <p className="text-slate-400 text-sm mb-1">out of 100 (public max)</p>
              <p className="text-slate-500 text-xs mb-4">Full 100-point scale available to subscribers</p>
              <div className="space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">National position</span>
                  <span className="text-white font-semibold">{nationalRank}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Council type</span>
                  <span className="text-white font-semibold">Town Council</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">County</span>
                  <span className="text-white font-semibold">Somerset</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Website</span>
                  <a href="https://www.crewkerne-tc.gov.uk" target="_blank" rel="noopener noreferrer" className="text-[#2a9d8f] font-semibold hover:underline">crewkerne-tc.gov.uk</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Assessment period banner ─────────────────────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-900">
            <strong>Assessment period:</strong> This analysis is based on publicly available evidence observed during the standard annual assessment window (January–March 2026). Councils can receive an updated assessment within 4 weeks by subscribing to Council ClearSight.
          </p>
        </div>
      </div>

      {/* ── Pillar scores ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-10">
            <Badge className="mb-4 bg-slate-100 text-slate-600 border-slate-200">Four-pillar breakdown</Badge>
            <h2 className="text-2xl font-bold text-[#0f2942]">Performance by pillar</h2>
            <p className="text-slate-600 mt-2">Each pillar is scored from publicly observable evidence. All sources are cited and independently verifiable.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {crewkernePillars.map((pillar) => (
              <div key={pillar.name} className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-[#0f2942] text-sm">{pillar.name}</h3>
                    <span className="text-xs text-slate-400">Weight: {pillar.weight}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(pillar.score / pillar.maxPublic) * 100}%`, backgroundColor: pillar.color }}
                      />
                    </div>
                    <span className="text-xl font-black" style={{ color: pillar.color }}>{pillar.score}</span>
                    <span className="text-slate-400 text-xs">/{pillar.maxPublic}</span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{pillar.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {pillar.sources.map((src) => (
                      <a
                        key={src.label}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-1 rounded"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {src.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Local context ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <Badge className="mb-4 bg-[#0f2942]/10 text-[#0f2942] border-[#0f2942]/20">Local context</Badge>
              <h2 className="text-2xl font-bold text-[#0f2942] mb-6">What the numbers don't capture</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                The CC-TI measures observable transparency and governance practice. It does not capture the full complexity of the challenges a council faces — but understanding that context is essential to interpreting the score fairly.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Building2,
                    title: "325-home development pressure",
                    body: "A proposed 325-home development on Station Road (submitted September 2025) represents one of the most significant planning decisions in the town's recent history. The council's ability to engage residents meaningfully on this issue will be a defining test.",
                    source: "BBC News, 13 October 2025; Chard & Ilminster News, 16 September 2025",
                  },
                  {
                    icon: Users,
                    title: "Older age profile and higher disability rate",
                    body: "ONS Census 2021 data shows Crewkerne has an older age profile than the national average, with 22.4% aged 65+ (vs 18.4% nationally) and 19.0% identifying as disabled (vs 17.8% nationally). This has direct implications for accessibility obligations and engagement strategy.",
                    source: "ONS Census 2021, Crewkerne parish-level data",
                  },
                  {
                    icon: MapPin,
                    title: "Community banking and asset management",
                    body: "The loss of the town's last bank branch has prompted community banking hub discussions. The council manages significant community assets including the Town Hall and recreational facilities — responsibilities that require transparent financial reporting.",
                    source: "Crewkerne Town Council minutes; local press",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-100">
                    <item.icon className="h-5 w-5 text-[#2a9d8f] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0f2942] text-sm mb-1">{item.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed mb-1">{item.body}</p>
                      <p className="text-xs text-slate-400 italic">Source: {item.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Badge className="mb-4 bg-[#2a9d8f]/10 text-[#2a9d8f] border-[#2a9d8f]/20">Demographic comparison</Badge>
              <h2 className="text-2xl font-bold text-[#0f2942] mb-6">Crewkerne vs national averages</h2>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left py-3 px-4 text-slate-500 font-medium text-xs">Indicator</th>
                      <th className="text-center py-3 px-3 text-[#0f2942] font-semibold text-xs">Crewkerne</th>
                      <th className="text-center py-3 px-3 text-slate-500 font-medium text-xs">England</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Population (Census 2021)", crewkerne: "~7,000", england: "—" },
                      { label: "Age 65+", crewkerne: "22.4%", england: "18.4%" },
                      { label: "Disability rate", crewkerne: "19.0%", england: "17.8%" },
                      { label: "Owner-occupied housing", crewkerne: "68%", england: "63%" },
                      { label: "No qualifications", crewkerne: "21%", england: "18%" },
                      { label: "Economically active", crewkerne: "72%", england: "78%" },
                      { label: "IMD deprivation decile", crewkerne: "4–6", england: "5 (median)" },
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                        <td className="py-2.5 px-4 text-slate-700 text-xs">{row.label}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-[#0f2942] text-xs">{row.crewkerne}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500 text-xs">{row.england}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    Sources:{" "}
                    <a href="https://www.ons.gov.uk/releases/parishdataenglandandwalescensus2021" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">ONS Census 2021</a>,{" "}
                    <a href="https://www.somersetintelligence.org.uk/census2021/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">Somerset Intelligence</a>,{" "}
                    <a href="https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">MHCLG IMD 2019</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top recommendations ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-10">
            <Badge className="mb-4 bg-[#2a9d8f]/10 text-[#2a9d8f] border-[#2a9d8f]/20">Evidence-based recommendations</Badge>
            <h2 className="text-2xl font-bold text-[#0f2942] mb-2">Top 4 improvement opportunities</h2>
            <p className="text-slate-600">Each recommendation is specific, achievable, and linked to a measurable CC-TI score impact. Full implementation guidance is included in the subscriber report.</p>
          </div>
          <div className="space-y-5">
            {topRecommendations.map((rec) => (
              <div key={rec.number} className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-[#0f2942] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {rec.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0f2942] text-sm">{rec.title}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500">{rec.pillar}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-emerald-600 font-medium">{rec.effort}</span>
                    </div>
                  </div>
                  <Badge className="bg-[#2a9d8f]/10 text-[#2a9d8f] border-[#2a9d8f]/20 text-xs font-bold">
                    {rec.impact}
                  </Badge>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-slate-600 leading-relaxed mb-2">{rec.body}</p>
                  <p className="text-xs text-slate-400 italic">Source: {rec.source}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Conversion hook — natural, not salesy */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[#0f2942] mb-1">Want to see how these recommendations apply to your council?</p>
                <p className="text-sm text-slate-600">
                  Every council's assessment includes tailored recommendations with specific actions, cited sources, and projected score impact. Subscribers receive their full report within 4 weeks — including the 5 additional points only available through direct verification.
                </p>
              </div>
              <Link href="/pricing" className="flex-shrink-0">
                <Button className="bg-[#0f2942] hover:bg-[#1a3a5c] text-white">
                  View plans <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── What other councils can learn ─────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-10">
            <Badge className="mb-4 bg-slate-100 text-slate-600 border-slate-200">Lessons for other councils</Badge>
            <h2 className="text-2xl font-bold text-[#0f2942] mb-2">What Crewkerne's assessment tells us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: "Governance excellence is achievable",
                body: "Crewkerne's strong Digital Presence score demonstrates that even councils under significant development pressure can maintain high standards of publication and compliance. The foundations — minutes, AGAR, standing orders — are straightforward to get right.",
              },
              {
                icon: TrendingUp,
                title: "Governance & Compliance is the universal opportunity",
                body: "The gap between governance compliance and active resident engagement is the most common pattern in Council ClearSight's assessments. Councils that close this gap — through surveys, published responses, and accessible complaints procedures — see the largest score improvements.",
              },
              {
                icon: Zap,
                title: "The highest-impact actions are often the simplest",
                body: "Three of Crewkerne's four top recommendations — a resident engagement programme, an equalities statement, and a complaints procedure page — are low-cost, template-based actions. The biggest improvements rarely require the biggest budgets.",
              },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
                <card.icon className="h-7 w-7 text-[#2a9d8f] mb-4" />
                <h3 className="font-bold text-[#0f2942] mb-2 text-sm">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Is your council next? ─────────────────────────────────────────── */}
      <section className="py-16 bg-[#0f2942]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Your council's assessment is already underway
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Council ClearSight assesses councils during the standard annual window of January to March each year. Your council's public CC-TI score will be published following the next assessment cycle.
              </p>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Subscribing councils receive their full report — including the 5 additional points available through direct verification — within <strong className="text-white">4 weeks</strong> of subscribing. This means you can see your complete score, with tailored recommendations, before the next public assessment is published.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/snapshot">
                  <Button className="bg-[#2a9d8f] hover:bg-[#238b7e] text-white">
                    Get your free Snapshot <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    View subscription plans
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-4">Coming up in the Spotlight series</p>
              {[
                { council: "A high-scoring rural parish council", county: "Wiltshire", date: "Next issue", teaser: "How a small parish with under 1,000 residents achieved one of the highest CC-TI scores in the South West — and what larger councils can learn from it." },
                { council: "A council that improved significantly", county: "Lancashire", date: "Following issue", teaser: "From Emerging to Advanced in 12 months: the specific, low-cost actions that drove the biggest score improvements." },
                { council: "A council navigating major development", county: "Oxfordshire", date: "Future issue", teaser: "How to maintain governance excellence while managing a 500-home development consultation and rising precept pressure." },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold text-sm">{item.council}</p>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{item.county}</p>
                  <p className="text-xs text-slate-500 italic">{item.teaser}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sources ───────────────────────────────────────────────────────── */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sources & methodology</p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
            {[
              { text: "Crewkerne Town Council website", url: "https://www.crewkerne-tc.gov.uk" },
              { text: "ONS Census 2021 — Crewkerne parish-level data", url: "https://www.ons.gov.uk/releases/parishdataenglandandwalescensus2021" },
              { text: "Somerset Intelligence — area profiles", url: "https://www.somersetintelligence.org.uk/census2021/" },
              { text: "MHCLG English Indices of Deprivation 2019", url: "https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019" },
              { text: "Maiden Beech Academy (Ofsted: Good)", url: "https://www.maidenbeechprimary.org/" },
              { text: "Ashlands Primary School", url: "https://www.ashlandsprimaryschool.co.uk/" },
              { text: "Crewkerne Neighbourhood Plan", url: "https://www.crewkerne-tc.gov.uk/your-council/what-we-provide/neighbourhood-development-plan/" },
              { text: "BBC News — Crewkerne housing development, Oct 2025", url: "https://www.bbc.com/news/articles/cx20ngjgvgeo" },
              { text: "Transparency Code for Smaller Authorities (DCLG, 2015)", url: "https://www.gov.uk/government/publications/transparency-code-for-smaller-authorities" },
              { text: "Accounts and Audit Regulations 2015", url: "https://www.legislation.gov.uk/uksi/2015/234/contents/made" },
              { text: "Public Sector Bodies Accessibility Regulations 2018", url: "https://www.legislation.gov.uk/uksi/2018/952/made" },
              { text: "NALC/SLCC Local Council Award Scheme criteria (2023)", url: "https://www.nalc.gov.uk/support/local-council-award-scheme.html" },
              { text: "Equality Act 2010", url: "https://www.legislation.gov.uk/ukpga/2010/15/contents" },
              { text: "Council ClearSight CC-TI Methodology", url: "/methodology" },
            ].map((source, i) => (
              <a
                key={i}
                href={source.url}
                target={source.url.startsWith("/") ? undefined : "_blank"}
                rel={source.url.startsWith("/") ? undefined : "noopener noreferrer"}
                className="text-xs text-slate-500 py-1.5 border-b border-slate-50 hover:text-blue-600 flex items-start gap-1.5"
              >
                <span className="text-slate-400 font-mono flex-shrink-0">[{i + 1}]</span>
                <span>{source.text}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
