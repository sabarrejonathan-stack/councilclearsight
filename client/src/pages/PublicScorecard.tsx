import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
  Share2,
  Users,
} from "lucide-react";

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 80 ? "#2a9d8f" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
      />
      <text
        x={size / 2} y={size / 2 + 5}
        textAnchor="middle"
        fill={color}
        fontSize={size / 4}
        fontWeight="bold"
        className="rotate-90"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
      >
        {score}
      </text>
    </svg>
  );
}

function getGrade(score: number) {
  if (score >= 80) return { label: "Excellent", color: "text-[#2a9d8f]", bg: "bg-[#2a9d8f]/10" };
  if (score >= 65) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
  if (score >= 50) return { label: "Developing", color: "text-amber-600", bg: "bg-amber-50" };
  return { label: "Needs Attention", color: "text-red-600", bg: "bg-red-50" };
}

export default function PublicScorecard() {
  useSEO({
      "title": "Public Scorecard | Council ClearSight — National Overview",
      "description": "View the national public scorecard for parish and town councils in England. Explore CC-TI scores, regional averages, and performance trends.",
      "keywords": "public scorecard, national council scores, parish council performance overview, CC-TI national average",
      "canonicalPath": "/scorecard"
  });
  const [search, setSearch] = useState("");

  const searchQuery = trpc.councils.list.useQuery(
    { search, limit: 12, sortBy: "score" },
    { enabled: search.length >= 2 }
  );
  const topCouncils = trpc.councils.list.useQuery(
    { sortBy: "score", limit: 6 },
    { enabled: search.length < 2 }
  );

  const displayCouncils = search.length >= 2
    ? (searchQuery.data ?? [])
    : (topCouncils.data ?? []);
  const isLoading = search.length >= 2 ? searchQuery.isLoading : topCouncils.isLoading;

  const shareText = (name: string, score: number) =>
    `${name} has a Council ClearSight CC-TI score of ${score}/100. Is your council on Council ClearSight? Check at councilclearsight.co.uk`;

  const handleShare = (name: string, score: number) => {
    if (navigator.share) {
      navigator.share({ title: `${name} — Council ClearSight Score`, text: shareText(name, score), url: window.location.origin + "/scores" }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText(name, score));
    }
  };

  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0f2942] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-[#2a9d8f]/20 text-[#2a9d8f] border-[#2a9d8f]/30">
            For residents
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How does your council score?
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Council ClearSight publishes independent performance scores for parish and town councils across England. Search for your council to see how it performs — and what you can do if it's not on Council ClearSight yet.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              className="pl-12 h-14 text-base bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20"
              placeholder="Search for your council..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── Scores grid ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-[#0f2942]">
                {search.length >= 2 ? `Results for "${search}"` : "Top-scoring councils"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {search.length >= 2 ? `${displayCouncils.length} councils found` : "Highest CC-TI scores nationally"}
              </p>
            </div>
            <Link href="/directory">
              <Button variant="outline" size="sm" className="border-[#0f2942] text-[#0f2942]">
                Full directory <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#2a9d8f]" />
            </div>
          )}

          {!isLoading && displayCouncils.length === 0 && search.length >= 2 && (
            <div className="text-center py-16">
              <p className="text-slate-600 mb-2">No councils found matching "{search}".</p>
              <p className="text-sm text-slate-500">
                Try a different spelling, or{" "}
                <Link href="/directory" className="text-[#2a9d8f] underline">browse the full directory</Link>.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayCouncils.map((council) => {
              const score = council.vdtiOverallScore ? Math.round(parseFloat(council.vdtiOverallScore)) : null;
              const grade = score !== null ? getGrade(score) : null;
              return (
                <div key={council.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="font-bold text-[#0f2942] text-sm leading-tight mb-1 truncate">{council.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{council.county ?? council.region ?? "England"}</span>
                      </div>
                      {council.vdtiOverallRank && (
                        <p className="text-xs text-slate-400 mt-1">Ranked #{council.vdtiOverallRank} nationally</p>
                      )}
                    </div>
                    {score !== null ? (
                      <ScoreRing score={score} size={64} />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-xs text-slate-400 text-center leading-tight">Not<br />scored</span>
                      </div>
                    )}
                  </div>
                  {grade && (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${grade.bg} ${grade.color} mb-3`}>
                      {grade.label}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/councils/${council.slug}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full border-[#0f2942] text-[#0f2942] hover:bg-[#0f2942] hover:text-white text-xs">
                        View profile
                      </Button>
                    </Link>
                    {score !== null && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-200 text-slate-500 hover:bg-slate-50"
                        onClick={() => handleShare(council.name, score)}
                        title="Share this score"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Council not on Council ClearSight ─────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200">Is your council missing?</Badge>
                <h2 className="text-2xl font-bold text-[#0f2942] mb-4">
                  Ask your council to get a Council ClearSight score
                </h2>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  If your council doesn't have a Council ClearSight score yet, you can ask them to get one. Every council in England has a public CC-TI score — and a full subscription with detailed recommendations starts from £499/yr (Pro tier).
                </p>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Copy the message below and send it to your Parish Clerk, or raise it at the next Annual Parish Meeting.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-amber-200 p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Message to copy</p>
                <p className="text-sm text-slate-700 leading-relaxed italic mb-4">
                  "I'd like to ask the council to get a Council ClearSight score. Council ClearSight is an independent performance assessment service that gives parish and town councils a CC-TI score — covering digital presence, contact transparency, governance & compliance, and financial accountability. A full Pro subscription with the personalised roadmap, peer benchmarking and direct support is £499/year. I think it would help the council demonstrate its value to residents and support our LCAS accreditation work. More information at councilclearsight.co.uk/for-clerks."
                </p>
                <Button
                  size="sm"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "I'd like to ask the council to get a Council ClearSight score. Council ClearSight is an independent performance assessment service that gives parish and town councils a CC-TI score — covering digital presence, contact transparency, governance & compliance, and financial accountability. A full Pro subscription with the personalised roadmap, peer benchmarking and direct support is £499/year. I think it would help the council demonstrate its value to residents and support our LCAS accreditation work. More information at councilclearsight.co.uk/for-clerks."
                    );
                  }}
                >
                  Copy message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How scoring works ─────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#0f2942] mb-3">How the score is calculated</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              The CC-TI score is calculated from 14 observable indicators across four pillars, using only publicly available evidence.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { icon: BarChart3, title: "Digital Presence", weight: "25%", desc: "Active website, accessibility statement — verified from the council's recorded URL" },
              { icon: Users, title: "Contact Transparency", weight: "25%", desc: "Published email, phone number, and named clerk — verified from directories and council websites" },
              { icon: MapPin, title: "Governance & Compliance", weight: "25%", desc: "Published governance documents including audit notices, asset register, register of interests, financial regulations, and standing orders" },
              { icon: ArrowRight, title: "Financial Accountability", weight: "25%", desc: "Annual accounts, governance statement, meeting agendas and minutes — verified from published statutory documents" },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <p.icon className="h-6 w-6 text-[#2a9d8f] mx-auto mb-3" />
                <p className="font-bold text-[#0f2942] text-sm mb-1">{p.title}</p>
                <p className="text-xs text-[#2a9d8f] font-semibold mb-2">{p.weight} of total score</p>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/methodology">
              <Button variant="outline" className="border-[#0f2942] text-[#0f2942] hover:bg-[#0f2942] hover:text-white">
                Full methodology <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#2a9d8f]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Are you a Parish Clerk or Councillor?
          </h2>
          <p className="text-white/80 mb-8">
            Look up your council's CC-TI score and see how it compares nationally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/snapshot">
              <Button size="lg" className="bg-white text-[#2a9d8f] hover:bg-white/90 font-semibold px-8">
                Find your council <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/for-clerks">
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10">
                Clerk's guide
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
