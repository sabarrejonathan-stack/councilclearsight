/**
 * Methodology — plain-English explanation of how every council is scored.
 *
 * Deliberately accessible: a resident with no technical background should be
 * able to read this and understand where their council's score came from. Every
 * rule is still rigorous — we just explain it with the vocabulary of everyday
 * English, not code.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, ShieldCheck, Eye, Scale, CheckCircle2, AlertCircle,
  FileText, Globe, Mail, Users, Layers, BookOpen, Landmark, Clock,
  HelpCircle, ChevronRight,
} from "lucide-react";

// ─── Layman's explanations for each of the 12 indicators ──────────────
// Warm, specific, and honest. Every explanation answers three questions:
//   Why this matters · How we check · What it's worth

type Indicator = {
  id: string;
  pillar: 1 | 2 | 3 | 4;
  title: string;
  why: string;
  how: string;
  points: string;
};

const INDICATORS: Indicator[] = [
  // ── Pillar 1 — Core Reachability (25 max) ──
  { id: "1.1", pillar: 1, title: "Working council website", points: "10 points",
    why: "When a resident wants to know about their council — who runs it, when meetings happen, what was decided — the first place they look is online. If there is no working website, the council is effectively invisible to anyone who didn't attend the last meeting in person. The Local Government Act 1972 requires councils to give 'proper notice' of business, which in 2026 means online.",
    how: "We check whether a website URL is on file for the council. The indicator earns full points only when a URL is recorded.",
  },
  { id: "1.2", pillar: 1, title: "Council email address published", points: "5 points",
    why: "Residents have questions. A working email address — published and actually monitored — is the single most useful thing a council can provide after a website. The Transparency Code 2015 § 2.2 expects every council to publish at least one contact point.",
    how: "We check whether a valid email address (containing @) is recorded for the council.",
  },
  { id: "1.3", pillar: 1, title: "Phone number published", points: "5 points",
    why: "Not every resident uses email. A phone number — even a clerk's mobile — gives people a second route in. Required for the contact point under Transparency Code 2015 § 2.2.",
    how: "We check whether a phone number is recorded for the council.",
  },
  { id: "1.4", pillar: 1, title: "Named clerk identified", points: "5 points",
    why: "The clerk is the council's principal officer under Section 112 of the Local Government Act 1972. Publishing who they are is the most basic form of accountability: residents know who to call, the press knows who to interview, and auditors know who is responsible for the council's records.",
    how: "We check whether the clerk's name is recorded. We don't require a photo or biography — just the name.",
  },

  // ── Pillar 2 — Statutory Meeting Transparency (25 max) ──
  { id: "2.1", pillar: 2, title: "Meeting agendas published", points: "15 points",
    why: "Section 100B of the Local Government Act 1972 requires every council to publish meeting agendas at least three clear days before each meeting. Without an agenda, residents cannot see what will be discussed and cannot meaningfully attend. A council that doesn't publish agendas is, in effect, meeting in private.",
    how: "We record whether the council is known to publish meeting agendas. Recency and document-level verification will be added once our scraper has confirmed the URL of each agenda PDF.",
  },
  { id: "2.2", pillar: 2, title: "Meeting minutes published", points: "10 points",
    why: "Section 100C of the Local Government Act 1972 requires that minutes of meetings be available for public inspection and preserved for at least six years. Minutes are the statutory record of what the council decided and how it spent public money. Without them, residents cannot scrutinise council decisions and auditors cannot retrace the council's reasoning.",
    how: "We record whether the council is known to publish meeting minutes. Recency rules will be added once our scraper has confirmed the URL of each minutes PDF.",
  },

  // ── Pillar 3 — Financial Accountability (25 max) ──
  { id: "3.1", pillar: 3, title: "AGAR / annual financial statement published", points: "15 points",
    why: "Section 10 of the Accounts and Audit Regulations 2015 requires every smaller authority to publish an Annual Governance and Accountability Return (AGAR). This is the council's statutory financial statement — what it collected in precept, what it spent it on. The single most important transparency document a council produces. Larger councils additionally publish under the Transparency Code 2015.",
    how: "We record whether the council is known to publish its AGAR. Document-level verification (most recent AGAR, audit certificate, notice of public rights) will be added once our scraper has read each PDF.",
  },
  { id: "3.2", pillar: 3, title: "Clerk email — correspondence channel for audit", points: "10 points",
    why: "The Accounts and Audit Regulations 2015 require the council's proper officer (the clerk under LGA 1972 § 112) to be the contactable point for audit correspondence and resident inspection requests. Without a published clerk email, the audit cycle and the right to inspect under § 100 cannot function.",
    how: "We check whether a valid email address (containing @) is recorded specifically for the clerk.",
  },

  // ── Pillar 4 — Democratic & Accessibility Transparency (25 max) ──
  { id: "4.1", pillar: 4, title: "Chair / Mayor named", points: "5 points",
    why: "The chair or mayor is the council's elected leader under Section 15 of the Local Government Act 1972. Publishing who they are lets residents know who represents them democratically. A field containing a semicolon-separated list of names is treated as a councillor list mis-attributed to the chair field — it does not count as a named chair.",
    how: "We check whether a single chair or mayor name is recorded. Lists of multiple names (joined by ';') do not count.",
  },
  { id: "4.2", pillar: 4, title: "At least one councillor identified", points: "5 points",
    why: "Councillors are elected volunteers who shape decisions on behalf of residents. A council that doesn't publish at least one councillor by name is asking residents to trust an anonymous body. Section 15 of the Local Government Act 1972 sets the electoral framework that makes councillor identification a baseline requirement.",
    how: "We check whether at least one councillor is recorded with a name.",
  },
  { id: "4.3", pillar: 4, title: "Accessibility statement published", points: "10 points",
    why: "Since 2018, every public body's website has been legally required to publish an accessibility statement describing how the site works for people who use screen readers, keyboard navigation or other assistive technology. The Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018 are not optional — the Equality and Human Rights Commission can issue compliance notices.",
    how: "We record whether the council's website is known to publish an accessibility statement. Page-level verification will be added once our scraper has confirmed the URL of the statement.",
  },
  { id: "4.4", pillar: 4, title: "Secure connection (HTTPS)", points: "5 points",
    why: "UK GDPR Article 32 requires appropriate technical measures to protect personal data. NCSC guidance and the GOV.UK service standard both make HTTPS a baseline expectation for any public-sector website. A council website served over plain HTTP exposes its visitors to interception and tampering.",
    how: "We check whether the council's website URL begins with https:// (i.e. has a valid TLS certificate). Plain HTTP scores zero.",
  },
];

const PILLAR_META = {
  1: { title: "Core Reachability",                shortTitle: "Reachability", max: 25, colour: "sky",     icon: Globe,       tagline: "Can a resident find and contact the council?" },
  2: { title: "Statutory Meeting Transparency",   shortTitle: "Meetings",     max: 25, colour: "indigo",  icon: ShieldCheck, tagline: "Are agendas and minutes published as required by LGA 1972 §§ 100B and 100C?" },
  3: { title: "Financial Accountability",         shortTitle: "Financial",    max: 25, colour: "emerald", icon: Users,       tagline: "Is the AGAR published as required by the Accounts and Audit Regs 2015?" },
  4: { title: "Democratic & Accessibility",       shortTitle: "Democratic",   max: 25, colour: "amber",   icon: Mail,        tagline: "Are councillors named, the website accessible, and the connection secure?" },
} as const;

function pillarClasses(p: 1|2|3|4) {
  const c = PILLAR_META[p].colour;
  return {
    bg: `bg-${c}-50`, border: `border-${c}-200`, text: `text-${c}-800`, ring: `ring-${c}-200`,
  };
}

export default function Methodology() {
  useSEO({
    title: "Methodology — How we score every council, explained clearly | Council ClearSight",
    description: "A clear, human explanation of how the Council ClearSight Transparency Index is calculated. Four pillars, twelve indicators, scored from publicly observable information. No jargon.",
    canonicalPath: "/methodology",
  });

  return (
    <PublicLayout>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-4xl relative">
          <Badge className="mb-5 bg-accent/20 text-accent border-accent/30 font-mono">Methodology</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-[1.1]">
            How we score every council,<br/>explained clearly.
          </h1>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
            Every council in England receives a single score out of 100. The score comes from fourteen specific, observable things — either the council does them or it doesn't. This page explains what each one means, why it matters, and how we check it. No jargon, no formulas, no fine print.
          </p>
        </div>
      </section>

      <div className="container max-w-4xl py-16 space-y-20">

        {/* ─── Trust statement (per April 2026 brief) ───── */}
        <section className="-mt-4">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl p-6">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber-800 mb-2">Important note for councils and residents</div>
            <p className="text-sm text-amber-950 leading-relaxed mb-3">
              <strong>Subscribing to Council ClearSight does not change the public scoring rules and does not buy a higher score.</strong> The score reflects publicly observable evidence and is calculated identically for every council. Subscriptions unlock evidence packs, recommendations and tools to improve future observable transparency.
            </p>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              <strong>What the score measures:</strong> whether key transparency evidence can be found through publicly observable sources. <strong>What it does not measure:</strong> political performance, service quality, financial judgement, councillor conduct, or resident satisfaction.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground font-mono">
            <span>VDTI v4.0</span>
            <span>·</span>
            <span>Data extraction: 16 April 2026</span>
            <span>·</span>
            <span>Assessment window: January – March 2026</span>
            <span>·</span>
            <span>Next assessment: January 2027</span>
          </div>
        </section>

        {/* ─── The big idea ───────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">The idea in one minute</h2>
          <div className="prose prose-slate max-w-none text-[15px] leading-relaxed space-y-4 text-foreground/90">
            <p>
              A transparent council is one a resident can learn about without having to phone a district councillor or file a Freedom of Information request. The most basic signals of transparency are things anyone can check: does the council have a website, can I email somebody, is the clerk named, are the minutes published, is there a register of interests.
            </p>
            <p>
              We check fourteen of those signals for every council in England. Each one is worth a fixed number of points. Add them up, and you get a score out of 100. The score is the <em>same for everyone</em> — a resident, a journalist, a councillor, or the clerk themselves. There is no different number for different readers.
            </p>
            <p>
              Where we genuinely haven't checked yet — because our checking programme is still rolling out to every council — the indicator is marked <strong className="text-foreground">"Not assessed"</strong> rather than scored as a zero. A missing check is a different thing from a missing document, and we are careful not to conflate them.
            </p>
          </div>
        </section>

        {/* ─── Four promises ──────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Four promises the score keeps</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Eye,         title: "One score for everyone",    body: "Every visitor sees the same score for a council — subscribed or not, resident or clerk. No hidden premium number, no paywalled 'real' rank." },
              { icon: Scale,       title: "Grounded in existing law",  body: "Every indicator maps to something already required of councils — the Transparency Code, the Accounts & Audit Regulations, the Local Government Act, the Localism Act. We didn't invent new duties; we measured existing ones." },
              { icon: CheckCircle2,title: "Honest about what we know", body: "Where we haven't yet checked, the indicator is 'Not assessed' — never silently zero. The score you see always reflects what we've actually observed." },
              { icon: Layers,      title: "Fair across council size",  body: "The same indicators apply to a 200-resident parish meeting and a 25,000-resident town council. Rankings are also published within council type, so peers are compared to peers." },
            ].map((p) => (
              <div key={p.title} className="p-5 bg-secondary/40 border border-border rounded-2xl">
                <p.icon className="w-5 h-5 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2 text-sm">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Four pillars overview ──────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Four pillars</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-3xl leading-relaxed">The twelve indicators are grouped into four pillars, each answering a slightly different question about a council.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {([1,2,3,4] as const).map((p) => {
              const meta = PILLAR_META[p];
              const Icon = meta.icon;
              const cls = pillarClasses(p);
              const count = INDICATORS.filter(i => i.pillar === p).length;
              return (
                <div key={p} className={`p-5 ${cls.bg} border ${cls.border} rounded-2xl`}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-5 h-5 ${cls.text}`} />
                    <span className={`text-2xl font-bold ${cls.text} font-mono`}>{meta.max}</span>
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono mb-1">Pillar {p}</div>
                  <h3 className={`font-semibold text-foreground mb-1.5`}>{meta.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{meta.tagline}</p>
                  <div className="text-[11px] text-muted-foreground">{count} indicator{count > 1 ? "s" : ""}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
            <Layers className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground">Why the pillars are equal in weight.</strong> All four pillars carry 25 points each so no single dimension dominates the score. Digital reachability, statutory meeting transparency, financial accountability and democratic openness are each rooted in distinct legal duties; weighting them equally avoids any inadvertent over-emphasis on what is easiest to observe. None of the weights were chosen to flatter any particular council, and the methodology is reproducible across every one of the 11,057 councils we track.
            </p>
          </div>
        </section>

        {/* ─── Each indicator, explained plainly ──────────── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Every indicator, explained clearly</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-3xl leading-relaxed">
            Click any indicator to see why it matters, how we check it, and what it's worth. These are the only things that affect a council's score.
          </p>

          <div className="space-y-5">
            {([1,2,3,4] as const).map((p) => {
              const meta = PILLAR_META[p];
              const Icon = meta.icon;
              const cls = pillarClasses(p);
              return (
                <div key={p} className={`border ${cls.border} rounded-2xl overflow-hidden bg-white`}>
                  <div className={`${cls.bg} px-5 py-4 border-b ${cls.border} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${cls.text}`} />
                      <div>
                        <h3 className={`font-bold ${cls.text}`}>Pillar {p}: {meta.title}</h3>
                        <div className="text-xs text-muted-foreground mt-0.5">{meta.tagline}</div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${cls.text} font-mono`}>max {meta.max} pts</span>
                  </div>
                  <Accordion type="multiple" className="px-2 py-1">
                    {INDICATORS.filter(i => i.pillar === p).map((ind) => (
                      <AccordionItem key={ind.id} value={ind.id} className="border-b border-border/40 last:border-0 px-3">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-3 text-left w-full">
                            <Badge variant="outline" className="font-mono text-xs flex-shrink-0">{ind.id}</Badge>
                            <span className="font-medium text-foreground flex-1 text-[15px]">{ind.title}</span>
                            <span className="text-xs text-muted-foreground font-mono flex-shrink-0 mr-3">{ind.points}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 pt-1">
                          <div className="pl-[52px] pr-2 space-y-3 text-[14px] leading-relaxed text-foreground/85">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">Why it matters</div>
                              <p>{ind.why}</p>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">How we check</div>
                              <p>{ind.how}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Bands ───────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">How we talk about a council's score</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-3xl leading-relaxed">Once we have the score out of 100, we put the council into one of four bands. The band is just a shortcut — the score itself is what matters.</p>
          <div className="space-y-2.5">
            {[
              { range: "80 – 100",  name: "Excellent",       colour: "emerald", body: "The council meets or exceeds almost every observable transparency requirement. It's publishing the documents it should and residents can easily see what's happening." },
              { range: "65 – 79",   name: "Good",            colour: "teal",    body: "The council meets most requirements with a handful of specific gaps. It's clearly engaged; the improvements needed are identifiable and achievable." },
              { range: "50 – 64",   name: "Developing",      colour: "amber",   body: "The council has partial transparency but significant gaps across at least one pillar. There's something to build on but a meaningful amount of work ahead." },
              { range: "0 – 49",    name: "Needs Attention", colour: "red",     body: "The council has substantial gaps in publicly visible transparency. Often this is a small parish with minimal online presence rather than a badly-run council — but the effect on residents is the same." },
              { range: "—",         name: "Not Yet Assessed", colour: "slate",   body: "We don't yet have enough evidence to give this council a meaningful score. They appear in the directory, but we don't band them until we have a fuller picture." },
              { range: "—",         name: "Under Audit",      colour: "sky",     body: "Council ClearSight tracks every council in England (11,057 in total). Councils marked Under Audit are in our queue but not yet fully verified — 1,682 are verified to date, with ~200 newly-verified each week. We never publish a score before verification." },
            ].map((b) => (
              <div key={b.name} className={`flex items-start gap-4 p-4 bg-${b.colour}-50 border border-${b.colour}-200 rounded-xl`}>
                <div className={`flex-shrink-0 mt-0.5`}><span className={`inline-block w-2 h-2 rounded-full bg-${b.colour}-500`} /></div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-3 mb-1">
                    <span className={`font-semibold text-${b.colour}-900`}>{b.name}</span>
                    <span className="mono text-xs text-muted-foreground">{b.range}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Where the evidence lives ────────────────────── */}
        <section className="p-8 bg-accent/5 border border-accent/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">The evidence for every score lives on the council's page</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Open any council in the directory and you'll see each of the twelve indicators with a clear pass / fail / not-assessed marker. Click through and the page shows exactly what we saw — the website URL we checked, the email address we found, the clerk name we recorded. If any of it is wrong, there is a one-click challenge button to tell us.
              </p>
              <div className="flex flex-wrap gap-3">
       