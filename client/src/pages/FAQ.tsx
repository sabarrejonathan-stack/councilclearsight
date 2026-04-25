/**
 * FAQ page — Council ClearSight (VDTI v3)
 *
 * Answers to the 12 real questions residents, clerks, and researchers ask.
 * Grouped into three sections: For residents, For clerks, About the methodology.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight, HelpCircle, Users, ShieldCheck } from "lucide-react";

export default function FAQ() {
  useSEO({
    title: "FAQ — Council ClearSight Transparency Index",
    description: "Answers to common questions about Council ClearSight scores, how the index works, and how to challenge or verify your council's assessment.",
    keywords: "FAQ, transparency index, council scores, challenges, methodology",
    canonicalPath: "/faq",
  });

  return (
    <PublicLayout>
      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden py-16">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-4xl relative">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.1]">
            Frequently asked questions
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
            Questions from residents, clerks, and researchers. If you don't find your answer here, email <code className="text-xs bg-white/20 px-2 py-1 rounded font-mono">hello@councilclearsight.org.uk</code>.
          </p>
        </div>
      </section>

      <div className="container max-w-4xl py-16 space-y-12">

        {/* ─── For residents ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">For residents</h2>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {[
              {
                q: "Why is my council's score so low?",
                a: "A low score means the council publishes fewer of the statutory documents or contact details that the index measures. This could be because: (1) the council genuinely publishes less than peers, (2) it publishes to a place we haven't yet scraped (contact them to ask for a public link), or (3) our scraper missed it (file a challenge with the link and we'll update it within 5 working days). Start by checking the 'Evidence' tab on your council's page — it shows exactly which documents we found and which we didn't.",
              },
              {
                q: "My council has a website — why does it say 'no website'?",
                a: "Indicator 1.2 specifically looks for a .gov.uk domain (e.g., your-council.gov.uk). This is a government standard. If your council's website is on a .co.uk or .org domain, you won't score points for that indicator, but you can still score on other parts of Pillar 1 (like having an active, resolving website). Councils can apply for a free .gov.uk domain; contact the Government Digital Service or your regional CALC for help. You can also challenge the score and let us know where your real website is — if it's genuinely published, we'll accept the evidence.",
              },
              {
                q: "How often are scores updated?",
                a: "The public score is updated once per year (next scheduled update: April 2027). If you file a challenge that results in new evidence, the score updates within 5 working days and the decision is logged publicly. If a council is a VDTI Pro subscriber, their score is recalculated every 90 days, so improvements show up faster.",
              },
              {
                q: "Can I see the exact inputs you used for my council?",
                a: "Yes — every council page shows each of the twelve indicators with the exact evidence we found: the website URL we checked, the email address we recorded, the clerk's name, the meeting document we saw. Click any indicator to expand the details. If something looks wrong, there's a one-click challenge button next to it.",
              },
              {
                q: "What's a good score for a council our size?",
                a: "Scores are size-neutral — a 5-person parish and a 25,000-resident town council are held to the same standard (both should publish meeting minutes if they're holding meetings). However, the Methodology page publishes band definitions: 80–100 is 'Exemplary', 60–79 is 'Strong', 40–59 is 'Developing', 0–39 is 'At Risk'. If your council is 'Developing' or above, it's doing reasonably well relative to the index. You can also see how councils of your type rank in your region on the Directory page.",
              },
            ].map((item, i) => (
              <AccordionItem key={i} value={`resident-${i}`} className="border border-border rounded-lg px-5 data-[state=open]:bg-slate-50">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-semibold text-foreground">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-muted-foreground leading-relaxed pt-2">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ─── For clerks ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">For clerks</h2>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {[
              {
                q: "How does this differ from the NALC Award Scheme (LCAS)?",
                a: "The NALC Local Council Award Scheme is self-assessed by councils and accredits councils that meet published standards — it's a badge of honour. VDTI is independently observed and scores all councils the same way, whether they engage with us or not. They're complementary. You can have both: LCAS accreditation shows your council's commitment to self-improvement; VDTI shows what a resident can independently verify. Many councils use LCAS as a roadmap and VDTI as a benchmark.",
              },
              {
                q: "What if I disagree with a score?",
                a: "File a challenge via your council's page. The process: (1) tell us which indicator you're challenging, (2) provide evidence (a URL, screenshot, or PDF), (3) we review it within 5 working days, (4) we publish the decision and any resulting score change. If your council is a VDTI Verified or Pro subscriber, challenges get a 3-day SLA. All disputes are logged on a public queue.",
              },
              {
                q: "Do you take down negative information if we ask?",
                a: "No. VDTI is built on the principle of public verifiability (see the Methodology). If we've recorded a decision (e.g., 'council does not publish minutes'), and that decision was based on evidence we can show, it stays. What changes is the *input* — if you publish minutes next month, the input row updates and the score improves. We don't rewrite history, but we do update as councils improve.",
              },
              {
                q: "My council is a Pro subscriber — how do quarterly re-scores work?",
                a: "Pro subscribers are re-scored every 90 days instead of once per year. In addition, the Pro plan includes active monthly website scraping, so if you publish new minutes or agendas, we'll find them faster. When your score updates, you'll get an email with the delta (which indicators changed and by how much).",
              },
            ].map((item, i) => (
              <AccordionItem key={i} value={`clerk-${i}`} className="border border-border rounded-lg px-5 data-[state=open]:bg-slate-50">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-semibold text-foreground">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-muted-foreground leading-relaxed pt-2">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ─── About the methodology ───────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">About the methodology</h2>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {[
              {
                q: "Is my subscription money used to lobby or campaign?",
                a: "No. Subscription revenue funds the engineering and research that keeps the index fair and updated. We do not lobby government, do not campaign on behalf of councils, and do not donate to political parties or candidates. We publish transparency data; we don't advocate policy.",
              },
              {
                q: "Why is 'Not Assessed' better than a zero?",
                a: "If we've checked your website and found no published minutes, that's a genuine zero — you should improve. But if we haven't yet set up the scraping pipeline for minutes (as was the case in April 2026), 'Not Assessed' is honest. It says: we don't have data yet, so we can't score you fairly on this. Using zero would penalise councils for our pipeline gaps. This is the 'honest gap' principle.",
              },
              {
                q: "Are the scores GDPR-compliant?",
                a: "Yes. We only use data that councils publish themselves — meeting minutes, contact details, website URLs, etc. We don't collect, store, or process personal data beyond what the council has already made public. The lawful basis is legitimate interest (scrutiny of public bodies spending public money) under GDPR Article 6(1)(f). If you have GDPR questions, email us.",
              },
              {
                q: "What happens to my data if I cancel my subscription?",
                a: "Your council's public score, all evidence, and historical data remain on the site — they're public records. The only things you lose are subscriber-only features: the ✓ Verified-clerk badge, priority challenge SLA, re-scoring cadence, and improvement roadmap. We do not delete or hide anything when you cancel. Your public page stays online and stays current.",
              },
            ].map((item, i) => (
              <AccordionItem key={i} value={`methodology-${i}`} className="border border-border rounded-lg px-5 data-[state=open]:bg-slate-50">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-semibold text-foreground">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-muted-foreground leading-relaxed pt-2">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ─── CTA ────────────────────────────────────────────────── */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Didn't find your answer?</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Email us at <code className="bg-white px-2 py-1 rounded font-mono">hello@councilclearsight.org.uk</code> or find your council in the directory and file a formal challenge.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:hello@councilclearsight.org.uk">
              <Button size="sm">Get in touch</Button>
            </a>
            <Link href="/directory">
              <Button size="sm" variant="outline">Find your council <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button>
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
