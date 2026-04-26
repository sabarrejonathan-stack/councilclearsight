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
            <Link href="/subscribe/platinum">
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-white">Choose Platinum <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
            <p className="text-[11px] text-center text-muted-foreground mt-3">Most popular for councils pursuing LCAS Quality Gold.</p>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
