/**
 * Pricing — two tiers for individual councils (compact, valid).
 */
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  Check, Minus, ArrowRight, Sparkles, BadgeCheck, Eye, Shield,
  Bell, FileText, Users, MessageCircle, Megaphone, HeartHandshake,
  Target, TrendingUp, Unlock, Lock,
} from "lucide-react";

type Billing = "annual" | "monthly";

const FAQS = [
  { q: "Do we need a council vote to subscribe?", a: "Most councils' standing orders allow subscriptions under £250 without a vote. Verified (£149) typically fits. Pro (£449) usually needs a vote but is normal small-contract territory." },
  { q: "What's the difference between Verified and Pro?", a: "Verified lets you own and react — claim the page, see changes, fix errors. Pro adds proactive help: roadmap, quarterly re-scoring, peer benchmarking, templates, direct support." },
  { q: "If we subscribe to Pro and nothing changes, what then?", a: "The score-drop refund: if your score drops 5+ points during your subscription without your fault, we refund pro-rata." },
  { q: "Our precept is very small — is this for us?", a: "Councils with precept under £3,000/year get Verified free — email us to confirm via MHCLG data." },
  { q: "Will subscribing improve our score automatically?", a: "No. Subscribing gets you tools and support; improving the score requires publishing more. We tell you exactly what to publish and help you draft it." },
  { q: "Can we cancel any time?", a: "Yes. Your public page remains online and scored. Cancelling removes the Verified badge and subscription benefits. No data held hostage." },
];

export default function Pricing() {
  useSEO({
    title: "Pricing — two tiers to help your council improve | Council ClearSight",
    description: "Every council's score is free. Subscribe (£149 Verified / £449 Pro) for tools and personal support to improve your score and engage residents.",
    canonicalPath: "/pricing",
  });
  const [billing, setBilling] = useState<Billing>("annual");
  return (
    <PublicLayout>
      <section className="bg-primary relative overflow-hidden py-20">
        <div className="container max-w-4xl text-center">
          <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 font-mono">Pricing</Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-5 leading-[1.05]">
            Your score is free.<br/>
            <span className="text-accent">Improving it is where we help.</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
            Every council's score, rank and evidence trail is publicly visible — forever, to everyone. Subscriptions pay for the tools and personal support that help you meet transparency duties you already owe residents under law, and move up the rankings as you do.
          </p>
          <div className="flex items-center justify-center gap-1 p-1 bg-white/10 rounded-full w-fit mx-auto text-sm">
            {(["annual","monthly"] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)} className={`px-4 py-1.5 rounded-full font-medium transition ${billing === b ? "bg-white text-primary" : "text-white/75 hover:text-white"}`}>
                {b === "annual" ? "Annual (save 20%)" : "Monthly"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container max-w-5xl -mt-10 relative z-10 mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-7 bg-white border border-slate-200 rounded-3xl">
            <div className="flex items-center gap-2 mb-4"><BadgeCheck className="w-6 h-6 text-sky-600" /><h2 className="text-2xl font-bold">Verified</h2></div>
            <p className="text-sm mb-6 leading-relaxed">Own your council's page. React to changes. Fix what's wrong.</p>
            <div className="mb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">£{billing === "annual" ? "149" : "15"}</span>
                <span className="text-muted-foreground">{billing === "annual" ? "/year" : "/month"}</span>
              </div>
              {billing === "annual" && <p className="text-[11px] text-accent mt-1">£12.42/month equivalent.</p>}
            </div>
            <Link href="/subscribe/verified"><Button className="w-full" size="lg">Start Verified <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <p className="text-[11px] text-center text-muted-foreground mt-2">14-day trial · cancel any time</p>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2.5"><BadgeCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Verified badge on your public page</li>
                <li className="flex items-start gap-2.5"><Shield className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Edit contact fields directly</li>
                <li className="flex items-start gap-2.5"><Bell className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Email alerts on indicator changes</li>
                <li className="flex items-start gap-2.5"><FileText className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Printable A4 scorecard</li>
                <li className="flex items-start gap-2.5"><Users className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Unlimited council users</li>
                <li className="flex items-start gap-2.5"><TrendingUp className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />Priority challenge lane (3 days)</li>
              </ul>
            </div>
          </Card>

          <Card className="p-7 bg-gradient-to-br from-white to-accent/5 border-2 border-accent rounded-3xl relative shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most councils choose this</span>
            <div className="flex items-center gap-2 mb-4"><Sparkles className="w-6 h-6 text-accent" /><h2 className="text-2xl font-bold">Pro</h2></div>
            <p className="text-sm mb-6 leading-relaxed">Active help to improve your score AND engage residents. Roadmap, templates, and us on email.</p>
            <div className="mb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">£{billing === "annual" ? "449" : "45"}</span>
                <span className="text-muted-foreground">{billing === "annual" ? "/year" : "/month"}</span>
              </div>
              {billing === "annual" && <p className="text-[11px] text-accent mt-1">£37.42/month equivalent.</p>}
            </div>
            <Link href="/subscribe/pro"><Button className="w-full bg-accent hover:bg-accent/90 text-white" size="lg">Start Pro — 14-day trial <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <p className="text-[11px] text-center text-muted-foreground mt-2">Score-drop refund guarantee</p>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-3">Everything in Verified, plus</p>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2.5"><Target className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Personalised improvement roadmap</li>
                <li className="flex items-start gap-2.5"><TrendingUp className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Quarterly re-scoring (public is annual)</li>
                <li className="flex items-start gap-2.5"><Users className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Peer benchmarking vs. 10 councils</li>
                <li className="flex items-start gap-2.5"><Megaphone className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Resident engagement playbook</li>
                <li className="flex items-start gap-2.5"><FileText className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Drop-in content templates</li>
                <li className="flex items-start gap-2.5"><MessageCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Direct support (1 working day)</li>
                <li className="flex items-start gap-2.5"><HeartHandshake className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />60-min annual strategy call</li>
                <li className="flex items-start gap-2.5"><Shield className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />Score-drop refund if 5+ points lost</li>
              </ul>
            </div>
          </Card>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-6">Managing a group of councils? <Link href="/contact?topic=bulk" className="text-accent hover:underline">Talk to us about bulk arrangements.</Link></p>
      </section>

      <section className="container max-w-5xl py-16">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 font-mono text-[10px]">Our commitments</Badge>
          <h2 className="text-3xl font-bold mb-3">Four things no subscription will ever buy</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex gap-4">
            <Eye className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div><h3 className="font-semibold text-sm mb-1">A different score for you than the public</h3><p className="text-xs text-muted-foreground leading-relaxed">Every visitor sees the same number, band, and rank.</p></div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex gap-4">
            <Unlock className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div><h3 className="font-semibold text-sm mb-1">Removal of a low score because you pay</h3><p className="text-xs text-muted-foreground leading-relaxed">Scores reflect what's published. We will not edit for paying customers.</p></div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex gap-4">
            <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div><h3 className="font-semibold text-sm mb-1">Silence about weaknesses</h3><p className="text-xs text-muted-foreground leading-relaxed">Failing indicators stay publicly visible with their evidence.</p></div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex gap-4">
            <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div><h3 className="font-semibold text-sm mb-1">Hostage data if you cancel</h3><p className="text-xs text-muted-foreground leading-relaxed">The public page, score, and evidence remain when a subscription ends.</p></div>
          </div>
        </div>
      </section>

      <section className="container max-w-3xl py-16">
        <div className="text-center mb-8"><h2 className="text-3xl font-bold mb-3">Questions councils ask</h2></div>
        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`q${i}`} className="border border-border rounded-xl px-4 bg-white">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="bg-primary text-white">
        <div className="container max-w-4xl py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">See your council, then decide.</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">Every tier starts with a 14-day trial. Every subscription is cancel-any-time.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/directory"><Button size="lg" className="bg-white text-primary hover:bg-white/90">Find your council first <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/contact?topic=pricing"><Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">Ask us a question</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
