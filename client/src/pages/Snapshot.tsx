import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

export default function Snapshot() {
  useSEO({
    title: "Council Snapshot | Council ClearSight \u2014 Your Council at a Glance",
    description: "Get a transparency snapshot for your parish or town council. See your VDTI score, pillar breakdown, and how you compare to peers.",
    keywords: "council snapshot, parish council score, transparency report, council VDTI score",
    canonicalPath: "/snapshot",
  });
  const [step, setStep] = useState<"search" | "email" | "sent">("search");
  const [councilSearch, setCouncilSearch] = useState("");
  const [selectedCouncil, setSelectedCouncil] = useState<{ id: number; name: string; slug: string; vdtiScore: string | null } | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const searchQuery = trpc.councils.list.useQuery(
    { search: councilSearch, limit: 8 },
    { enabled: councilSearch.length >= 2 }
  );
  // councils.list returns an array directly
  const councilResults = searchQuery.data ?? [];

  const requestSnapshot = trpc.snapshot.request.useMutation({
    onSuccess: () => setStep("sent"),
    onError: (err) => setEmailError(err.message || "Something went wrong. Please try again."),
  });

  const handleCouncilSelect = (council: { id: number; name: string; slug: string; vdtiScore: string | null }) => {
    setSelectedCouncil(council);
    setStep("email");
    setCouncilSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!selectedCouncil) return;
    requestSnapshot.mutate({
      email,
      councilId: selectedCouncil.id,
      councilName: selectedCouncil.name,
      councilSlug: selectedCouncil.slug,
    });
  };

  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0f2942] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-[#2a9d8f]/20 text-[#2a9d8f] border-[#2a9d8f]/30">
            Free — no payment required
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your council's VDTI score,<br />
            <span className="text-[#2a9d8f]">delivered free to your inbox</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-4">
            Search for your council, enter your email address, and receive a personalised one-page Snapshot showing your VDTI score, pillar breakdown, national ranking, and your two most impactful improvement opportunities.
          </p>
          <p className="text-sm text-slate-400">
            No payment. No commitment. No forms to fill in beyond your email address.
          </p>
        </div>
      </section>

      {/* ── Main form ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4">

          {/* Step 1: Search */}
          {step === "search" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#2a9d8f] text-white flex items-center justify-center text-sm font-bold">1</div>
                <h2 className="text-xl font-bold text-[#0f2942]">Search for your council</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10"
                  placeholder="e.g. Crewkerne, Ilminster, Sherborne..."
                  value={councilSearch}
                  onChange={(e) => setCouncilSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {councilSearch.length >= 2 && (
                <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
                  {searchQuery.isLoading && (
                    <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                    </div>
                  )}
                  {councilResults.length === 0 && !searchQuery.isLoading && (
                    <div className="p-4 text-sm text-slate-500">
                      No councils found matching "{councilSearch}". Try a different spelling or check the{" "}
                      <Link href="/directory" className="text-[#2a9d8f] underline">full directory</Link>.
                    </div>
                  )}
                  {councilResults.map((council) => (
                    <button
                      key={council.id}
                      onClick={() => handleCouncilSelect({ id: council.id, name: council.name, slug: council.slug, vdtiScore: council.vdtiOverallScore ?? null })}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-[#0f2942] text-sm">{council.name}</p>
                        <p className="text-xs text-slate-500">{council.county} · {council.councilType}</p>
                      </div>
                      {council.vdtiOverallScore !== null && (
                        <div className="text-right">
                          <span className="text-lg font-bold text-[#2a9d8f]">{council.vdtiOverallScore}</span>
                          <span className="text-xs text-slate-400">/100</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {councilSearch.length < 2 && (
                <p className="text-xs text-slate-400 mt-3">Type at least 2 characters to search from 10,511 councils</p>
              )}
            </div>
          )}

          {/* Step 2: Email */}
          {step === "email" && selectedCouncil && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <button
                onClick={() => { setStep("search"); setSelectedCouncil(null); }}
                className="text-sm text-slate-500 hover:text-slate-700 mb-6 flex items-center gap-1"
              >
                ← Change council
              </button>
              <div className="bg-[#0f2942]/5 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0f2942]">{selectedCouncil.name}</p>
                  <p className="text-sm text-slate-500">Selected council</p>
                </div>
                {selectedCouncil.vdtiScore !== null && (
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#2a9d8f]">{parseFloat(selectedCouncil.vdtiScore).toFixed(0)}</span>
                    <span className="text-sm text-slate-400">/100</span>
                    <p className="text-xs text-slate-500">VDTI Score</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#2a9d8f] text-white flex items-center justify-center text-sm font-bold">2</div>
                <h2 className="text-xl font-bold text-[#0f2942]">Where should we send your Snapshot?</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      placeholder="clerk@yourcouncil.gov.uk"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      autoFocus
                    />
                  </div>
                  {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
                  <p className="text-xs text-slate-400 mt-2">
                    We'll send your Snapshot to this address. We won't share it with third parties.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2a9d8f] hover:bg-[#238b7e] text-white font-semibold"
                  disabled={requestSnapshot.isPending}
                >
                  {requestSnapshot.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating your Snapshot...</>
                  ) : (
                    <>Send my Snapshot <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>
              <p className="text-xs text-slate-400 mt-4 text-center">
                By submitting, you agree to receive occasional updates from Council ClearSight. Unsubscribe at any time.
              </p>
            </div>
          )}

          {/* Step 3: Sent */}
          {step === "sent" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2a9d8f]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-[#2a9d8f]" />
              </div>
              <h2 className="text-2xl font-bold text-[#0f2942] mb-3">Your Snapshot is on its way</h2>
              <p className="text-slate-600 mb-2">
                We've sent your personalised VDTI Snapshot for <strong>{selectedCouncil?.name}</strong> to <strong>{email}</strong>.
              </p>
              <p className="text-sm text-slate-500 mb-8">
                Check your inbox — it should arrive within a few minutes. If you don't see it, check your spam folder.
              </p>
              <div className="bg-slate-50 rounded-xl p-5 mb-6 text-left">
                <p className="text-sm font-semibold text-[#0f2942] mb-3">Want the full picture?</p>
                <p className="text-sm text-slate-600 mb-4">
                  Your Snapshot gives you the headline score and top opportunities. A full Council ClearSight subscription includes a 21-page report with 8 evidence-based recommendations, peer benchmarking, local demographic context, and a resident-facing summary PDF — from just £499/yr (Platinum tier).
                </p>
                <Link href="/pricing">
                  <Button className="w-full bg-[#0f2942] hover:bg-[#1a3a5c] text-white">
                    View subscription plans <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/council/${selectedCouncil?.slug}`}>
                  <Button variant="outline" className="border-[#0f2942] text-[#0f2942]">
                    View {selectedCouncil?.name}'s profile
                  </Button>
                </Link>
                <Link href="/directory">
                  <Button variant="outline">Explore the directory</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── What's in the Snapshot ────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#0f2942] mb-3">What's in a Snapshot?</h2>
            <p className="text-slate-600">A personalised one-page PDF, generated from publicly observable data</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: "VDTI Score", body: "Your council's overall score out of 100, calculated from 14 statute-anchored observable indicators across four pillars." },
              { icon: ShieldCheck, title: "Pillar Breakdown", body: "Scores for each of the four pillars: Core Reachability, Statutory Meeting Transparency, Financial Accountability, and Democratic & Accessibility." },
              { icon: Users, title: "National Ranking", body: "Where your council sits among 4,500 verified councils nationally and within your region." },
              { icon: Zap, title: "Top 2 Opportunities", body: "The two most impactful improvements your council could make to increase its VDTI score, with specific recommended actions." },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-[#2a9d8f]/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-[#2a9d8f]" />
                </div>
                <h3 className="font-bold text-[#0f2942] mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upgrade prompt ────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#2a9d8f]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready for the full report?
          </h2>
          <p className="text-white/80 mb-2">
            The full Council ClearSight report is 21 pages, includes 8 evidence-based recommendations, peer benchmarking, and a resident-facing summary PDF.
          </p>
          <p className="text-white/60 text-sm mb-8">
            From £499/yr (Platinum tier) · Annual billing · Less than £8 per week
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-[#2a9d8f] hover:bg-white/90 font-semibold px-8">
                View plans & pricing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://d2xsxph8kpxj0f.cloudfront.net/95463635/RdCukD25kfPCpoWnb26XfY/crewkerne_vdti_report_2024_25_7be8aed4.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10">
                <FileText className="mr-2 h-4 w-4" /> View sample full report
              </Button>
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
