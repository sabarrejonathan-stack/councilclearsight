/**
 * ForClerks — landing page for parish and town clerks (compact, valid).
 */
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight, AlertCircle, CheckCircle2, BadgeCheck, Sparkles, Target, Megaphone, TrendingUp, MessageCircle, HeartHandshake, Users } from "lucide-react";

const STEPS = [
  { n: "01", title: "Find your council", body: "Search the directory. Open your page. Read the thirteen indicators.", cta: "Open the directory", href: "/directory" },
  { n: "02", title: "Submit a correction", body: "If a field is wrong — an old email, a changed URL — file a challenge. No account required.", cta: "Submit a challenge", href: "/challenge" },
  { n: "03", title: "Read the methodology", body: "How your score is calculated, explained clearly. Share it with your chair.", cta: "Read the methodology", href: "/methodology" },
];

const FAQS = [
  { q: "Our council already has a Quality Council Award. Why add this?", a: "LCAS is self-assessed and point-in-time. VDTI is externally observed and continuously updated. Most Quality and Quality Gold councils we've spoken to subscribe to Gold as a continuous proof-of-work." },
  { q: "What if a councillor reads our score as criticism?", a: "The score is a diagnostic — a specific, fixable to-do list, not a judgement of the council's work. Platinum&apos;s roadmap is literally designed to give you the talking points for that council meeting." },
  { q: "Does Platinum help with engagement or just the score?", a: "Both, deliberately linked. Every transparency improvement is an engagement opportunity. When you publish the May minutes, we help you draft the newsletter that tells residents about it." },
  { q: "Is the data GDPR-compliant?", a: "Yes. We process only publicly-available register data. Our lawful basis is 'public task' under UK GDPR Art. 6(1)(e)." },
  { q: "Our precept is under £3,000/year. £349 is significant.", a: "Email us — councils with a verified precept under £3,000 get Gold free." },
  { q: "If we subscribe, does our score improve automatically?", a: "No. Subscribing gets you tools and support; improving the score requires actually publishing more on the council's website." },
];

const PRO_STEPS = [
  { n: "Week 1", icon: Target, title: "Personalised audit and roadmap", body: "Within seven days of subscribing, we run a fresh audit and send you a written roadmap." },
  { n: "Week 2", icon: Megaphone, title: "Engagement templates tailored to your council", body: "Every roadmap item comes with newsletter wording, social post, meeting announcement." },
  { n: "Month 1", icon: TrendingUp, title: "First quarterly re-score", body: "Improvements you've made are reflected publicly within the month." },
  { n: "Month 2", icon: MessageCircle, title: "Help centre and score challenge route", body: "Any time you hit a specific question, the self-serve help centre and score challenge form route the answer to you. We aim to acknowledge enquiries within two working days." },
  { n: "Month 3", icon: Users, title: "Peer benchmarking", body: "See where you sit against ten matched councils, plus county and regional comparisons. Use the dashboard to plan next quarter's push." },
  { n: "Ongoing", icon: HeartHandshake, title: "Continuous automated value", body: "New templates, automated quarterly re-scores, peer movement alerts, fresh evidence prompts. Self-serve, scalable, no human-support burden." },
];

export default function ForClerks() {
  useSEO({
    title: "For clerks — find your page, fix what's wrong, improve your score",
    description: "A straight-talking guide for parish and town clerks.",
    canonicalPath: "/for-clerks",
  });
  return (
    <PublicLayout>
      <section className="bg-primary py-20">
        <div className="container max-w-5xl">
          <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 font-mono">For clerks</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-5 leading-[1.05]">
            Your council has a page here,<br/>
            <span className="text-accent">whether you engage with us or not.</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl mb-4">
            We publish an independent score for every parish, town, city and community council in England — based entirely on whether the council is meeting transparency duties it already owes residents under law.
          </p>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl mb-8">
            Here's what's on your page, how it got there, what you can fix for free, and what the two subscription tiers buy if you decide you want our help.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/directory"><Button size="lg" className="bg-white text-primary hover:bg-white/90">See your council's page <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">View the two tiers</Button></Link>
          </div>
        </div>
      </section>

      <section className="bg-amber-50 border-b border-amber-200">
        <div className="container max-w-4xl py-12">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-amber-700 mb-1">Read this first</div>
              <h2 className="text-xl font-bold text-amber-950 mb-3">Is this a threat, or an opportunity?</h2>
              <p className="text-sm text-amber-900 leading-relaxed mb-2">
                An opportunity. Council ClearSight doesn't invent transparency requirements — Parliament did. The Transparency Code 2015, the Local Government Act 1972, the Accounts &amp; Audit Regulations 2015, and the Accessibility Regulations 2018 already require councils to publish specific things. We aggregate what's required, check whether it's there, and publish the result.
              </p>
              <p className="text-sm text-amber-900 leading-relaxed">
                We're a publishing project with a support offering, not an enforcement body. If we've got something wrong, tell us — we fix it within five working days, no subscription required.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container max-w-5xl py-20">
        <div className="max-w-3xl mb-10">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Before anything else</Badge>
          <h2 className="text-3xl font-bold mb-4">Three things you can do for free</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-6 bg-white border border-slate-200 rounded-2xl">
              <div className="mono text-[11px] text-accent font-semibold mb-3">Step {s.n}</div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.body}</p>
              <Link href={s.href}><Button size="sm" variant="outline" className="w-full">{s.cta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button></Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-5xl py-20">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-3 font-mono text-[10px]">If you want help</Badge>
            <h2 className="text-3xl font-bold mb-4">Two tiers. Both cancel any time.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-7 bg-white border border-slate-200 rounded-3xl">
              <div className="flex items-center gap-2 mb-4"><BadgeCheck className="w-6 h-6 text-sky-600" /><h3 className="text-2xl font-bold">Gold</h3></div>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-4xl font-bold">£349</span><span className="text-muted-foreground">/year</span></div>
              <p className="text-xs text-muted-foreground mb-5">Typically fits under parish no-vote purchase thresholds.</p>
              <p className="text-sm mb-5 leading-relaxed">For the clerk who wants to claim the page, fix what's wrong, and know when anything changes.</p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Verified-clerk badge on the public page (Gold)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Edit contact fields directly</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Alerts when indicators change</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Printable A4 scorecard</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />3-day challenge SLA</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Unlimited council users</li>
              </ul>
              <Link href="/subscribe/gold"><Button className="w-full">Start Gold <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </Card>

            <Card className="p-7 bg-gradient-to-br from-white to-accent/5 border-2 border-accent rounded-3xl relative shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most councils choose this</span>
              <div className="flex items-center gap-2 mb-4"><Sparkles className="w-6 h-6 text-accent" /><h3 className="text-2xl font-bold">Platinum</h3></div>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-4xl font-bold">£499</span><span className="text-muted-foreground">/year</span></div>
              <p className="text-xs text-muted-foreground mb-5">Less than one hour of professional consultancy per month.</p>
              <p className="text-sm mb-5 leading-relaxed">For councils ready to improve the score AND their relationship with residents.</p>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2 font-semibold border-b border-slate-200 pb-1 mb-1">Everything in Gold, plus:</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Personalised improvement roadmap</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Quarterly re-scoring</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Resident engagement playbook</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Content templates</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Peer benchmarking vs. 10 councils</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Quarterly chair/clerk briefing pack (auto-generated)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Help centre + score challenge form (acknowledged within two working days)</li>
              </ul>
              <Link href="/subscribe/platinum"><Button className="w-full bg-accent hover:bg-accent/90 text-white">Start Platinum <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white py-20">
        <div className="container max-w-5xl">
          <div className="max-w-3xl mb-10">
            <Badge className="mb-3 bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">Platinum in practice</Badge>
            <h2 className="text-3xl font-bold mb-4">The 90-day picture: improving the score AND the conversation with residents</h2>
          </div>
          <div className="space-y-3">
            {PRO_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-accent" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="mono text-[10px] text-accent font-semibold uppercase tracking-wider">{step.n}</span>
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container max-w-3xl py-20">
        <div className="text-center mb-8"><h2 className="text-3xl font-bold">What clerks ask before signing up</h2></div>
        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`f${i}`} className="border border-border rounded-xl