import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle2, Award, BarChart2, FileText, Users, School,
  ArrowRight, Star, TrendingUp, Shield
} from "lucide-react";

const BENEFITS = [
  {
    icon: FileText,
    title: "Annual Council ClearSight Report + On-Demand Update",
    desc: "A professionally produced annual report benchmarking your council against peers, plus an on-demand updated assessment delivered within 4 weeks.",
    color: "text-teal-600",
    bg: "bg-teal-50"
  },
  {
    icon: BarChart2,
    title: "VDTI Score & Peer Ranking",
    desc: "See exactly where you stand against councils of the same type, size, and region — with clear, actionable context.",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    icon: School,
    title: "School & Community Insights",
    desc: "Understand your community through school engagement evidence assessment and resident engagement — based on publicly verifiable data.",
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    icon: TrendingUp,
    title: "Improvement Roadmap",
    desc: "Prioritised, pillar-by-pillar recommendations so your council knows exactly what to focus on next.",
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
];

// No testimonials shown until real subscriber feedback is collected.
// Removed to maintain factual integrity.
const TESTIMONIALS: { quote: string; name: string; council: string; rating: number }[] = [];

export default function RegisterInterest() {
  useSEO({
      "title": "Register Interest | Council ClearSight — Join the Waitlist",
      "description": "Register your council's interest in Council ClearSight. Be among the first to receive your full benchmarking report when subscriptions open.",
      "keywords": "register interest council clearsight, council subscription waitlist, parish council benchmarking signup",
      "canonicalPath": "/register-interest"
  });
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    councilName: "",
    role: "",
  });

  const register = trpc.interest.register.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again or email us directly.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.councilName) {
      toast.error("Please fill in your name, email, and council name.");
      return;
    }
    register.mutate({ ...form, source: "register-interest-page" });
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 text-white"
        style={{ background: "linear-gradient(135deg, #0f2744 0%, #1e3a5f 40%, #0d4a3a 100%)" }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-teal-400 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-600/20 border border-teal-500/30 rounded-full px-4 py-1.5 text-sm text-teal-300 font-medium">
            <Award className="w-4 h-4" />
            For parish and town councils across England
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Your council deserves<br />
            <span className="text-teal-400">independent recognition.</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Register your interest today to learn how Council ClearSight can support your council —
            the only independently verified transparency benchmark for UK parish and town councils.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" />No commitment required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" />Score already in the directory</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" />Response within 48 hours</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-12">

          {/* Form — 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              {submitted ? (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-teal-800">You're registered!</h2>
                  <p className="text-teal-700">
                    Thank you. We'll be in touch within 48 hours with next steps for your council.
                  </p>
                  <div className="space-y-2 pt-2">
                    <Link href="/directory">
                      <Button className="w-full" variant="outline">
                        View the Directory <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                        See pricing plans
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Register your interest</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Takes 60 seconds. We'll be in touch within 48 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Your name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        placeholder="Cllr Jane Smith"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="councilName">Council name <span className="text-red-500">*</span></Label>
                      <Input
                        id="councilName"
                        placeholder="e.g. Harrogate Town Council"
                        value={form.councilName}
                        onChange={e => setForm(f => ({ ...f, councilName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email address <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="clerk@yourcouncil.gov.uk"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone number <span className="text-slate-400 font-normal">(optional)</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="07700 000000"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="role">Your role <span className="text-slate-400 font-normal">(optional)</span></Label>
                      <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clerk">Parish / Town Clerk</SelectItem>
                          <SelectItem value="councillor">Councillor</SelectItem>
                          <SelectItem value="chair">Chair / Mayor</SelectItem>
                          <SelectItem value="deputy">Deputy Clerk</SelectItem>
                          <SelectItem value="rfo">Responsible Financial Officer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 text-base"
                      disabled={register.isPending}
                    >
                      {register.isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Registering…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Register my interest
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>

                    <p className="text-xs text-slate-400 text-center">
                      By registering you agree to our{" "}
                      <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
                      We will never share your details with third parties.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Benefits — 3 cols */}
          <div className="lg:col-span-3 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What you'll receive</h2>
              <p className="text-slate-500">
                Council ClearSight gives your council the independent evidence it needs to demonstrate value,
                build resident trust, and drive meaningful improvement.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {BENEFITS.map(b => (
                <div key={b.title} className={`rounded-xl p-5 border ${b.bg} border-transparent`}>
                  <div className={`w-9 h-9 rounded-lg ${b.bg} flex items-center justify-center mb-3`}>
                    <b.icon className={`w-5 h-5 ${b.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{b.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Pricing teaser */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Transparent, affordable pricing</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-2xl font-black text-slate-800">£499<span className="text-sm font-normal text-slate-500">/yr</span></div>
                  <div className="font-semibold text-slate-700 mt-1">Gold</div>
                  <p className="text-xs text-slate-500 mt-1">Annual report + 1 update, VDTI score, peer benchmarking</p>
                </div>
                <div className="bg-teal-600 rounded-lg p-4 text-white relative">
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">Popular</span>
                  </div>
                  <div className="text-2xl font-black">£499<span className="text-sm font-normal opacity-75">/yr</span></div>
                  <div className="font-semibold mt-1">Platinum</div>
                  <p className="text-xs opacity-80 mt-1">Unlimited updates, school insights, ward-level data</p>
                </div>
              </div>
              <Link href="/pricing">
                <Button variant="outline" className="w-full mt-4">
                  Compare all plans <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Why councils trust Council ClearSight — fact-based, no fake testimonials */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Why independent evidence matters</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                According to the Local Government Association's Resident Satisfaction Polling Round 40 (October 2025),
                only 49% of residents trust their local council and 49% feel well-informed about council services.
                Council ClearSight gives your council the independently verified evidence to change that — not just for
                your own records, but for the residents who need to see it.
              </p>
              <a
                href="https://www.local.gov.uk/publications/polling-resident-satisfaction-councils-round-40"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-600 underline hover:text-teal-800"
              >
                Source: LGA Resident Satisfaction Polling Round 40, October 2025 →
              </a>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: Shield, label: "GDPR compliant", sub: "Your data is safe" },
                { icon: Award, label: "Verified methodology", sub: "Publicly verifiable data" },
                { icon: Users, label: "10,511 councils tracked", sub: "4,174 verified to date" },
              ].map(s => (
                <div key={s.label} className="p-4 bg-slate-50 rounded-xl">
                  <s.icon className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">{s.label}</div>
                  <div className="text-xs text-slate-400">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
