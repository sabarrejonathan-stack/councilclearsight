/**
 * ForClerks — the landing page a clerk arrives on from an email or a Google search.
 *
 * Answers the real first question: "Is this a threat or an opportunity?"
 * Then moves quickly to the two-tier value proposition: own the page (Verified),
 * or get active help to improve the score and engage residents (Pro).
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Clock,
  Bell, FileText, Users, Sparkles, BadgeCheck, Megaphone,
  HeartHandshake, MessageCircle, Target, Eye, Unlock, TrendingUp,
} from "lucide-react";

export default function ForClerks() {
  useSEO({
    title: "For clerks — find your page, fix what's wrong, improve your score | Council ClearSight",
    description: "A straight-talking guide for parish and town clerks. Your council has a CC-TI page whether you engage with us or not. Here's what's on it, how to correct it for free, and how our two-tier support can help you improve it.",
    canonicalPath: "/for-clerks",
  });

  return (
    <PublicLayout>
      {/* ─── Hero ─────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-5xl relative">
          <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 font-mono">For clerks</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-5 leading-[1.05]">
            Your council has a page here,<br/>
            <span className="text-accent">whether you engage with us or not.</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl mb-8">
            Here's what's on it, how it got there, what you can fix for free, and what the two subscription tiers buy if you decide you want our help improving both the score and your council's engagement with residents.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/directory"><Button size="lg" className="bg-white text-primary hover:bg-white/90">See your council's page <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">View the two tiers</Button></Link>
          </div>
        </div>
      </section>

      {/* ─── Threat or opportunity? ─────────────── */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="container max-w-4xl py-12">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-amber-700 mb-1">Read this first</div>
              <h2 className="text-xl font-bold text-amber-950 mb-3">Is this a threat, or an opportunity?</h2>
              <p className="text-sm text-amber-900 leading-relaxed mb-3">
                An opportunity. We know clerks are stretched; we know the transparency requirements keep growing; we know councillor time is finite. Our job is to make the existing legal requirements for transparency visible in one place — so you can see exactly what residents see, fix what's wrong for free, and (if you want help) subscribe to a plan that does the heavy lifting with you.
              </p>
              <p className="text-sm text-amber-900 leading-relaxed">
                We're a publishing project with a support offering, not an enforcement body. If we have something wrong about your council, tell us — we'll fix it within five working days, no subscription required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Three things you can do for free ─────── */}
      <section className="container max-w-5xl py-20">
        <div className="max-w-3xl mb-10">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Before you decide on anything</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-4">Three things you can do right now, at no cost</h2>
          <p className="text-muted-foreground leading-relaxed">Start here. These cost nothing and they're often enough to correct the record without a subscription.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: "01", title: "Find your council", body: "Search the directory. Open your council's page. Read the fourteen indicators. Most clerks find at least one thing that's out of date.", cta: "Open the directory", href: "/directory" },
            { n: "02", title: "Submit a correction", body: "If a field is wrong — an old email, a changed URL, a previous clerk's name still showing — file a challenge. No account required. We respond within five working days.", cta: "Submit a challenge", href: "/challenge" },
            { n: "03", title: "Read the methodology", body: "Everything about how your score is calculated is explained in plain English. Share it with your chair or councillors if there are questions at the next meeting.", cta: "Read the methodology", href: "/methodology" },
          ].map((s) => (
            <Card key={s.n} className="p-6 bg-white border border-slate-200 rounded-2xl">
              <div className="mono text-[11px] text-accent font-semibold mb-3">Step {s.n}</div>
              <h3 className="font-bold text-foreground text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.body}</p>
              <Link href={s.href}><Button size="sm" variant="outline" className="w-full">{s.cta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button></Link>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Two tiers, side by side ──────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container max-w-5xl py-20">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-3 font-mono text-[10px]">If you want to subscribe</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Two tiers. Both cancel any time. No data hostage.</h2>
            <p className="text-muted-foreground leading-relaxed">Verified is for clerks who want to own the page and react to changes. Pro is for councils that want active, ongoing help — improving the score and improving how they engage residents.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Verified */}
            <Card className="p-7 bg-white border border-slate-200 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <BadgeCheck className="w-6 h-6 text-sky-600" />
                <h3 className="text-2xl font-bold text-foreground">Verified</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">£149</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-xs text-muted-foreground mb-5">£12.42/month equivalent. Typically fits under parish "no council vote required" thresholds.</p>
              <p className="text-sm text-foreground/90 mb-5 leading-relaxed">
                For the clerk who wants to claim the page, fix what's wrong, and know the moment anything changes.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  "✓ Verified badge publicly visible on your page",
                  "Edit contact fields directly (with public audit log)",
                  "Email alerts the moment any indicator changes",
                  "Printable A4 scorecard for the noticeboard",
                  "Monthly digest of what changed",
                  "Priority challenge lane — 3 working days",
                  "Unlimited council users under one subscription",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground/90"><CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <Link href="/subscribe/verified"><Button className="w-full">Start Verified <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
              <p className="text-[11px] text-center text-muted-foreground mt-3">14-day trial · cancel any time · no card for trial</p>
            </Card>

            {/* Pro */}
            <Card className="p-7 bg-gradient-to-br from-white to-accent/5 border-2 border-accent rounded-3xl relative shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most councils choose this</span>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
                <h3 className="text-2xl font-bold text-foreground">Pro</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">£449</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-xs text-muted-foreground mb-5">£37.42/month equivalent. Less than one hour of professional consultancy per month.</p>
              <p className="text-sm text-foreground/90 mb-5 leading-relaxed">
                For councils ready to improve their score AND their relationship with residents. A roadmap, the templates, and us on the other end of an email.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  "Everything in Verified, plus:",
                  "Personalised written improvement roadmap",
                  "Quarterly re-scoring (public cycle is annual)",
                  "Resident engagement playbook tailored to you",
                  "Templates: agendas, minutes, newsletters, annual reports",
                  "Peer benchmarking vs. 10 similar councils",
                  "Direct email support (1 working day response)",
                  "60-minute annual strategy call",
                  "Score-drop refund guarantee",
                ].map((f, i) => (
                  <li key={f} className={`flex items-start gap-2 ${i === 0 ? "font-semibold text-foreground pb-1 border-b border-slate-200 mb-1" : "text-foreground/90"}`}>
                    {i > 0 && <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />}
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/subscribe/pro"><Button className="w-full bg-accent hover:bg-accent/90 text-white">Start Pro — 14-day trial <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
              <p className="text-[11px] text-center text-muted-foreground mt-3">14-day trial · cancel any time · score-drop refund</p>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── What Pro does for engagement ───────── */}
      <section className="bg-primary text-white py-20">
        <div className="container max-w-5xl">
          <div className="max-w-3xl mb-10">
            <Badge className="mb-3 bg-accent/20 text-accent border-accent/30 font-mono text-[10px]">What Pro looks like in practice</Badge>
            <h2 className="text-3xl font-bold mb-4">The 90-day picture: improving the score AND the conversation with residents</h2>
            <p className="text-white/75 leading-relaxed">Pro isn't a dashboard you log into and forget. It's a continuous, ongoing programme we run with you. Every improvement to the transparency score is an opportunity to engage residents — and Pro helps you turn one into the other.</p>
          </div>
          <div className="space-y-3">
            {[
              { n: "Week 1", icon: Target, title: "Personalised audit and roadmap", body: "Within seven days of subscribing, we run a fresh audit and send you a written roadmap: the specific actions (with expected point gains) that will move your score the most. You don't guess what to prioritise; the document tells you." },
              { n: "Week 2", icon: Megaphone, title: "Engagement templates tailored to your council", body: "Every roadmap item comes with an engagement template: the wording for the resident newsletter that accompanies the publication, the social post to announce it, the summary to read at the next meeting. Transparency without communication is just filing." },
              { n: "Month 1", icon: TrendingUp, title: "Quarterly re-scoring kicks in", body: "Thirty days in, your first quarterly re-score publishes. Improvements you've made are reflected publicly within the month, not the year." },
              { n: "Month 2", icon: MessageCircle, title: "Direct support channel", body: "Any time you hit a specific question — 'what does a good accessibility statement look like?', 'can you review our draft minutes before we publish them?' — email the support channel. One working day response from a human, not a chatbot." },
              { n: "Month 3", icon: Users, title: "Peer benchmarking + strategy call", body: "At the quarter mark, you see exactly where you sit against ten councils of similar size and region. We identify three things the leaders do that you don't. Your 60-minute strategy call plans the next quarter's push." },
              { n: "Ongoing", icon: HeartHandshake, title: "We keep showing up", body: "New templates as they're produced. Re-audits each quarter. Support channel open the whole time. The score-drop refund if anything goes backwards without your fault. You never feel alone in this." },
            ].map((step) => (
              <div key={step.n} className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center"><step.icon className="w-5 h-5 text-accent" /></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="mono text-[10px] text-accent font-semibold uppercase tracking-wider">{step.n}</span>
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Common clerk objections ───────────── */}
      <section className="container max-w-3xl py-20">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Common clerk objections</Badge>
          <h2 className="text-3xl font-bold">What clerks ask before signing up</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {[
            { q: "Our council already has a Quality Council Award. Why add this?", a: "LCAS (the Award Scheme) is a self-assessed, point-in-time accreditation. The CC-TI is an externally-observed, continuously-updated score. They answer different questions. Most Quality and Quality Gold councils we've spoken to subscribe to Verified as a continuous proof-of-work alongside their LCAS status." },
            { q: "What if a councillor reads our score as criticism?", a: "It's the most common first reaction and the easiest to reframe. The score is a diagnostic — it tells you what residents can see. A low score is a specific, fixable to-do list, not a judgement of the council's work. Pro's roadmap is literally designed to give you the talking points for that council meeting: here's what we scored, here's what we can do about it, here's the points we'll gain." },
            { q: "Does Pro actually help with resident engagement, or just the score?", a: "Both, deliberately linked. Every transparency improvement is an engagement opportunity. When you publish the May minutes for the first time in two years, we help you draft the newsletter that tells residents about it. When you adopt the register of interests, we help you announce it at the AGM. Score improvements that residents don't know about aren't really improvements." },
            { q: "We're a small parish and our website is hosted by a supplier. Does Pro work for us?", a: "Yes — the indicators don't care what platform publishes a document, only that it's published. If your supplier's platform is the blocker, the Pro roadmap tells you that clearly and helps you plan next steps (pressuring the supplier, moving platforms, or finding workarounds)." },
            { q: "Is the data GDPR-compliant?", a: "Yes. We process only publicly-available register data and any data a council publishes on its own website. Our lawful basis is 'public task' under UK GDPR Art. 6(1)(e). Subscriber account data is processed under 'contract'. Full detail in /privacy." },
            { q: "Our precept is under £3,000/year. £149 is significant.", a: "Email us — councils with a verified precept under £3,000 get Verified on the house. We'd rather every small parish claimed its page than price out the smallest ones." },
            { q: "If we subscribe, does our score improve just from subscribing?", a: "No. Subscribing gets you tools and support; improving the score requires actually publishing more on the council's website. We'll tell you exactly what to publish and help you draft it — but the council still has to adopt and publish." },
            { q: "Can we pay annually, invoice-by-BACS?", a: "Yes. Annual billing is BACS or card with 30-day invoice terms. We'll issue a formal invoice for the clerk to present at a council meeting if that helps." },
          ].map((item, i) => (
            <AccordionItem key={i} value={`f${i}`} className="border border-border rounded-xl px-4 bg-white">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ─── Final CTA ─────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="container max-w-3xl py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Five minutes to your council's page.</h2>
          <p className="text-muted-foreground mb-8">No card required, no form to fill, no subscription to start. If the score is wrong, you can say so now. If you want help improving it, you know where to find us.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/directory"><Button size="lg">Find your council <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline">Compare the two tiers</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
                      