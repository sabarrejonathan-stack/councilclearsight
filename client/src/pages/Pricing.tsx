/**
 * Pricing — automation-led platform tiers (Gold £349 / Platinum £499 ex VAT).
 *
 * Per April 2026 business model and pricing review:
 *   - No monthly billing — annual full payment only.
 *   - No score-drop refund.
 *   - No human-support promises (named contacts, phone, calls, workshops).
 *   - Feature comparison grouped by outcome.
 *   - Trust statement: subscription does not change scoring rules.
 *   - Digital add-ons section.
 *   - Evergreen wording — no scarcity claims.
 */
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  Check, Minus, ArrowRight, Sparkles, BadgeCheck, Eye, Shield,
  FileText, Users, Megaphone, Target, TrendingUp, Unlock, Lock, Download,
  ClipboardCheck, Calendar, MessageSquare, BookOpen,
} from "lucide-react";

type FeatureValue = string | boolean;
interface FeatureRow { label: string; gold: FeatureValue; platinum: FeatureValue; note?: string; }
interface FeatureGroup { title: string; icon: any; rows: FeatureRow[]; }

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "Evidence",
    icon: ClipboardCheck,
    rows: [
      { label: "Full VDTI score and evidence pack", gold: true, platinum: true },
      { label: "Indicator-by-indicator breakdown with source URLs", gold: true, platinum: true },
      { label: "Score history and last-updated dates", gold: true, platinum: true },
    ],
  },
  {
    title: "Improvement",
    icon: Target,
    rows: [
      { label: "Prioritised improvement roadmap", gold: "Top 5 actions", platinum: "Top 12 quarter-sequenced" },
      { label: "Next Best Action engine", gold: true, platinum: "Deeper rules + effort scoring" },
      { label: "Score updates", gold: "Annual refresh", platinum: "Quarterly refresh + change alerts" },
      { label: "LCAS evidence mapping", gold: "Foundation + Quality", platinum: "Foundation + Quality + Quality Gold" },
    ],
  },
  {
    title: "Benchmarking",
    icon: TrendingUp,
    rows: [
      { label: "Matched peer comparisons", gold: "3 peers", platinum: "10 peers" },
      { label: "County and regional comparisons", gold: false, platinum: true },
      { label: "Peer movement alerts", gold: false, platinum: true },
    ],
  },
  {
    title: "Resident Engagement",
    icon: Users,
    rows: [
      { label: "Resident-ready summary", gold: "Annual PDF", platinum: "Quarterly PDF + web blocks" },
      { label: "Resident survey templates", gold: "Library only", platinum: "Library + automated analysis" },
      { label: "Annual Meeting / AGM engagement pack", gold: "Standard template", platinum: "Auto-generated from your data" },
      { label: "School engagement templates", gold: false, platinum: true },
    ],
  },
  {
    title: "Communication",
    icon: Megaphone,
    rows: [
      { label: "Clerk improvement tips (automated)", gold: "Monthly", platinum: "Weekly + priority themes" },
      { label: "Resident-ready explanation blocks", gold: true, platinum: true },
      { label: "Press and website copy generator", gold: false, platinum: true },
      { label: "Quarterly chair/clerk briefing pack", gold: false, platinum: "Auto-generated" },
    ],
  },
  {
    title: "Data Export",
    icon: Download,
    rows: [
      { label: "CSV export of own score and evidence", gold: true, platinum: true },
      { label: "Trend history export", gold: false, platinum: true },
      { label: "Branded badge and asset pack", gold: "Static badge", platinum: "Static badge + social/web assets" },
    ],
  },
  {
    title: "Self-Serve Help",
    icon: BookOpen,
    rows: [
      { label: "Help centre and knowledge base", gold: true, platinum: true },
      { label: "Score challenge form", gold: true, platinum: true },
      { label: "Automated guidance library", gold: false, platinum: true },
      { label: "Transparency calendar (deadline prompts)", gold: true, platinum: true },
    ],
  },
];

const ADDONS = [
  { title: "Additional resident survey pack", price: 49, body: "Extra survey templates and automated analysis allowance for councils running multiple consultations." },
  { title: "Enhanced public profile page", price: 79, body: "A branded resident-facing page with approved text blocks and your current score." },
  { title: "Advanced peer benchmarking pack", price: 99, body: "Extra peer groups, region/county comparisons and historical trend charts." },
  { title: "Annual transparency report generator", price: 99, body: "Auto-generated transparency report PDF for AGM or annual meeting use. No bespoke editing." },
  { title: "School / community engagement pack", price: 79, body: "School map, outreach email templates, meeting prompts and tracking sheet." },
  { title: "Website content improvement pack", price: 59, body: "Template pages for accessibility, finance, governance, contact and FOI/publication scheme." },
];

const FAQS = [
  { q: "Will subscribing improve our score?", a: "No. The scoring rules are the same for every council. Subscription gives you the evidence, recommendations and tools to identify what is missing and improve future observable transparency." },
  { q: "Do you provide consultancy or direct support?", a: "The subscription is designed as a self-serve improvement platform. It includes automated evidence packs, templates, prompts and dashboards rather than bespoke consultancy." },
  { q: "Can residents see our score?", a: "Yes. The public score exists so residents can understand what information is publicly available. Councils can use the resident-ready summary to explain progress constructively." },
  { q: "Can we challenge a score?", a: "Yes. Councils can submit evidence through the score challenge route. Where public evidence supports a change, the score can be updated through the standard review process." },
  { q: "Is this linked to LCAS accreditation?", a: "No. Council ClearSight can help organise evidence that may support improvement and preparation, but it does not award LCAS status and cannot guarantee accreditation." },
  { q: "Do we need a council vote to subscribe?", a: "Most councils' standing orders allow subscriptions under £250 without a vote. Gold (£349) typically fits. Platinum (£499) usually needs a vote, but is normal small-contract territory." },
  { q: "Our precept is very small — is this for us?", a: "Councils with a precept under £3,000/year can apply for Gold at no cost — submit a request through the contact page so we can confirm via MHCLG data." },
  { q: "Can we cancel at any time?", a: "Yes. Your public page and score remain online. Cancelling removes the verified-clerk badge and subscription benefits. We don't hold your data hostage." },
];

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-600 mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs">{value}</span>;
}

export default function Pricing() {
  useSEO({
    title: "Pricing — Gold £349 / Platinum £499 | Council ClearSight",
    description: "Two clear annual subscriptions for parish and town councils that want to turn public transparency data into practical improvement. Automated tools, evidence packs, peer benchmarking and resident engagement.",
    canonicalPath: "/pricing",
  });

  return (
    <PublicLayout>
      {/* ── Hero ───────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden py-20">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 font-mono">Pricing</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-[1.1]">
            Two clear ways to turn transparency data into practical improvement.
          </h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Every council receives the same independent public score. Subscribing councils receive the evidence, benchmarking, recommendations and resident-ready tools to understand the score, improve over time and explain progress clearly.
          </p>
        </div>
      </section>

      {/* ── Tier cards ─────────────────────────────── */}
      <section className="container max-w-5xl -mt-10 relative z-10 mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* GOLD */}
          <Card className="p-7 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-3"><BadgeCheck className="w-6 h-6 text-sky-600" /><h2 className="text-2xl font-bold">Gold</h2></div>
            <p className="text-sm leading-relaxed mb-5">For councils that want a clear, practical improvement plan.</p>
            <div className="mb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">£349</span>
                <span className="text-muted-foreground">/year ex VAT</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Billed annually. No setup fees.</p>
            </div>
            <Link href="/subscribe/gold"><Button className="w-full" size="lg">Start Gold <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <p className="text-[11px] text-center text-muted-foreground mt-2">Cancel any time · No human-support overhead</p>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs uppercase tracking-wider text-sky-700 font-semibold mb-3">Includes</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2.5"><ClipboardCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Full VDTI score and evidence pack</li>
                <li className="flex items-start gap-2.5"><Target className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Top 5 prioritised actions</li>
                <li className="flex items-start gap-2.5"><TrendingUp className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />3 matched peer comparisons</li>
                <li className="flex items-start gap-2.5"><FileText className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Annual resident-ready summary (PDF)</li>
                <li className="flex items-start gap-2.5"><Megaphone className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Monthly automated clerk tips</li>
                <li className="flex items-start gap-2.5"><BookOpen className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />LCAS Foundation + Quality evidence mapping</li>
                <li className="flex items-start gap-2.5"><BadgeCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Static verified badge for your website</li>
                <li className="flex items-start gap-2.5"><Download className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />CSV export of own score and evidence</li>
                <li className="flex items-start gap-2.5"><Shield className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Self-serve score challenge route</li>
                <li className="flex items-start gap-2.5"><Calendar className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Annual score refresh + transparency calendar</li>
              </ul>
            </div>
          </Card>

          {/* PLATINUM */}
          <Card className="p-7 bg-gradient-to-br from-white to-accent/5 border-2 border-accent rounded-3xl relative shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Recommended for active councils</span>
            <div className="flex items-center gap-2 mb-3"><Sparkles className="w-6 h-6 text-accent" /><h2 className="text-2xl font-bold">Platinum</h2></div>
            <p className="text-sm leading-relaxed mb-5">For councils that want deeper benchmarking and automated resident engagement tools.</p>
            <div className="mb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">£499</span>
                <span className="text-muted-foreground">/year ex VAT</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Billed annually. No setup fees.</p>
            </div>
            <Link href="/subscribe/platinum"><Button className="w-full bg-accent hover:bg-accent/90 text-white" size="lg">Start Platinum <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <p className="text-[11px] text-center text-muted-foreground mt-2">Cancel any time · Automated, scalable platform</p>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-3">Everything in Gold, plus</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2.5"><Target className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Top 12 quarter-sequenced actions</li>
                <li className="flex items-start gap-2.5"><TrendingUp className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />10 peer comparisons + county/regional benchmarking</li>
                <li className="flex items-start gap-2.5"><Calendar className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Quarterly score refresh + change alerts</li>
                <li className="flex items-start gap-2.5"><FileText className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Quarterly resident-ready summary + web-ready content blocks</li>
                <li className="flex items-start gap-2.5"><Megaphone className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Weekly clerk tips + priority theme prompts</li>
                <li className="flex items-start gap-2.5"><Users className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Resident survey templates with automated analysis</li>
                <li className="flex items-start gap-2.5"><ClipboardCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Quarterly chair/clerk briefing pack (auto-generated)</li>
                <li className="flex items-start gap-2.5"><BookOpen className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />School engagement templates and outreach pack</li>
                <li className="flex items-start gap-2.5"><Download className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Trend history export + social/web asset pack</li>
                <li className="flex items-start gap-2.5"><MessageSquare className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Press and website copy generator</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Trust statement under cards */}
        <div className="mt-8 max-w-3xl mx-auto p-5 bg-slate-50 border-l-4 border-accent rounded-r-xl">
          <p className="text-sm text-foreground leading-relaxed">
            <strong>Subscribing does not change the scoring rules and does not buy a higher score.</strong> It gives your council clearer evidence, practical recommendations and communication tools to improve future observable transparency.
          </p>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Managing a group of councils? <Link href="/contact?topic=bulk" className="text-accent hover:underline">Talk to us about bulk arrangements.</Link>
        </p>
      </section>

      {/* ── Outcome-grouped feature comparison ─────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-5xl py-16">

          {/* ─── Feature tour video ──────────────────────────── */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-black">
              <video
                controls
                preload="metadata"
                playsInline
                className="w-full h-auto block"
                aria-label="Council ClearSight Gold and Platinum feature tour"
              >
                <source src="/videos/pricing-feature-tour.mp4" type="video/mp4" />
                Your browser does not support embedded video. The full feature comparison is also tabulated below.
              </video>
            </div>
          </div>

          <div className="text-center mb-10 max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-3 font-mono text-[10px]">Compare in detail</Badge>
            <h2 className="text-3xl font-bold mb-3">Every feature, grouped by what it does for you</h2>
            <p className="text-muted-foreground leading-relaxed">
              Both tiers are automation-led. No phone support, no onboarding calls, no bespoke services. Everything below is delivered through the dashboard, automated emails or downloadable templates.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURE_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <Card key={group.title} className="overflow-hidden border-slate-200">
                  <div className="bg-white px-6 py-3 border-b border-slate-200 flex items-center gap-3">
                    <Icon className="w-4 h-4 text-accent" />
                    <h3 className="font-semibold text-foreground">{group.title}</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-2 px-6 font-medium text-muted-foreground text-xs uppercase tracking-wider"></th>
                        <th className="py-2 px-4 font-semibold text-sky-700 text-xs uppercase tracking-wider w-32 text-center">Gold</th>
                        <th className="py-2 px-4 font-semibold text-accent text-xs uppercase tracking-wider w-40 text-center">Platinum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row, i) => (
                        <tr key={i} className="border-b last:border-0 border-slate-100">
                          <td className="py-3 px-6">{row.label}</td>
                          <td className="py-3 px-4 text-center"><FeatureCell value={row.gold} /></td>
                          <td className="py-3 px-4 text-center"><FeatureCell value={row.platinum} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Commitments ────────────────────────────── */}
      <section className="container max-w-5xl py-16">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Our commitments</Badge>
          <h2 className="text-3xl font-bold mb-3">Four things no subscription will ever buy</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex gap-4">
            <Eye className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div><h3 className="font-semibold text-sm mb-1">A different score for you than the public sees</h3><p className="text-xs text-muted-foreground leading-relaxed">Every visitor sees the same number, band, rank and evidence trail.</p></div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex gap-4">
            <Unlock className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div><h3 className="font-semibold text-sm mb-1">Removal of a low score because you pay</h3><p className="text-xs text-muted-foreground leading-relaxed">Scores reflect what is publicly observable. We will not edit them for paying customers.</p></div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex gap-4">
            <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div><h3 className="font-semibold text-sm mb-1">Silence about weaknesses</h3><p className="text-xs text-muted-foreground leading-relaxed">Failing indicators stay publicly visible with their evidence URLs.</p></div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex gap-4">
            <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div><h3 className="font-semibold text-sm mb-1">Hostage data if you cancel</h3><p className="text-xs text-muted-foreground leading-relaxed">Your public page, score and evidence remain online when a subscription ends.</p></div>
          </div>
        </div>
      </section>

      {/* ── Digital add-ons ────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="container max-w-5xl py-16">
          <div className="max-w-2xl mb-10">
            <Badge className="mb-3 bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">Digital add-ons</Badge>
            <h2 className="text-3xl font-bold mb-3">Optional extras — all automated, no human delivery</h2>
            <p className="text-white/70 leading-relaxed">
              Stack any of these on top of Gold or Platinum. Every add-on is fulfilled through templates, automated outputs or dashboard features — no scheduling, no calls, no bespoke writing.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADDONS.map((a) => (
              <div key={a.title} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold">£{a.price}</span>
                  <span className="text-xs text-white/60">/year ex VAT</span>
                </div>
                <h3 className="font-semibold text-sm mb-2">{a.title}</h3>
                <p className="text-xs text-white/70 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 mt-6">All add-ons require an active Gold or Platinum subscription. Add-ons run on the same annual cycle as your subscription.</p>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────── */}
      <section className="container max-w-3xl py-16">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Frequently asked</Badge>
          <h2 className="text-3xl font-bold mb-3">Questions councils ask</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`q${i}`} className="border border-border rounded-xl px-4 bg-white">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-4 text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── Close ──────────────────────────────────── */}
      <section className="bg-primary text-white">
        <div className="container max-w-4xl py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Annual subscriptions for councils ready to improve transparency.</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">See your council, read the methodology, then choose the tier that fits.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/directory"><Button size="lg" className="bg-white text-primary hover:bg-white/90">Find your council first <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/methodology"><Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10"><BookOpen className="w-4 h-4 mr-2" /> Read the methodology</Button></Link>
            <Link href="/contact?topic=pricing"><Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">Ask a question</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
