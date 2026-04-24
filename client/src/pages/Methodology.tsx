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

// ─── Layman's explanations for each of the 14 indicators ──────────────
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
  // ── Pillar 1 — Digital Presence ──
  { id: "1.1", pillar: 1, title: "Your council has a working website", points: "up to 20 points",
    why: "When a resident wants to know about their council — who runs it, when meetings happen, what was decided — the first place they look is online. If there is no website, the council is effectively invisible to anyone who didn't attend the last meeting in person.",
    how: "We look up the council's website. If the address works and loads a real page, the council earns the full 20 points. If there is no address, or the link is dead, the council earns zero.",
  },
  { id: "1.2", pillar: 1, title: "The website uses a proper .gov.uk address", points: "up to 5 bonus points",
    why: ".gov.uk addresses are free, verified, and signal to residents that they're on a real council website — not a lookalike. The government encourages every public body to use one.",
    how: "We check whether the council's website address ends in .gov.uk. If yes, 5 bonus points. If the site is at, say, .co.uk or a private hosting provider, the indicator scores zero — but the main website indicator still scores full.",
  },
  { id: "1.3", pillar: 1, title: "The website has an accessibility statement", points: "up to 5 points",
    why: "Since 2018, every public body's website has been legally required to publish an accessibility statement describing how the site works for people who use screen readers, keyboard navigation, or other assistive technology. It's both a legal duty and a signal that the council cares about every resident, not just the ones with good eyesight.",
    how: "We check whether the council's website has a published accessibility statement page. If we haven't visited the site yet, this indicator is marked 'Not assessed' — not a zero — because we don't count absence-of-check as failure.",
  },

  // ── Pillar 2 — Contact Transparency ──
  { id: "2.1", pillar: 2, title: "There is an email address for the council", points: "up to 10 points",
    why: "Residents have questions. A working email address — published and actually monitored — is the single most useful thing a council can provide after a website.",
    how: "We check whether a valid email address is listed for the council. It can be a generic address (clerk@yourcouncil.gov.uk) or any council inbox; we don't require it to be personally attributed.",
  },
  { id: "2.2", pillar: 2, title: "There is a phone number for the council", points: "up to 5 points",
    why: "Not every resident uses email. A phone number — even a clerk's mobile — gives people a second route in.",
    how: "We check whether a phone number is published for the council. If one is listed, full points.",
  },
  { id: "2.3", pillar: 2, title: "The clerk is named", points: "up to 10 points",
    why: "The clerk is the council's principal officer under the Local Government Act 1972. Publishing who they are is the most basic form of accountability: residents know who to call, the press knows who to interview, and auditors know who's responsible for the council's records.",
    how: "We check whether the clerk's name is publicly recorded. We don't require a photo or biography — just the name.",
  },
  { id: "2.4", pillar: 2, title: "The clerk has an email address", points: "up to 5 points",
    why: "A named clerk with a public email means residents can reach the person actually running the council. Without this, correspondence disappears into a generic inbox and often doesn't get answered.",
    how: "We check whether a valid email address for the clerk is published.",
  },

  // ── Pillar 3 — Governance Documents ──
  { id: "3.1", pillar: 3, title: "Meeting agendas are published", points: "up to 7 points",
    why: "The Local Government Act 1972 requires councils to publish agendas ahead of meetings so residents can see what will be discussed and attend if they want. A council that doesn't publish agendas is, in effect, meeting in private.",
    how: "We look for the council's meeting agendas on its website. If we haven't visited yet, this indicator is marked 'Not assessed'.",
  },
  { id: "3.2", pillar: 3, title: "Meeting minutes are published", points: "up to 8 points",
    why: "Minutes are the public record of what the council decided and how it spent public money. Without them, a resident cannot scrutinise council decisions, and auditors cannot retrace the council's reasoning.",
    how: "We look for meeting minutes on the council's website. Councils that publish promptly — within a few weeks of the meeting — score highest.",
  },
  { id: "3.3", pillar: 3, title: "The annual financial statement is published", points: "up to 10 points",
    why: "Every council is legally required to publish its Annual Governance and Accountability Return (AGAR) under the Accounts and Audit Regulations 2015. This is the council's financial statement — what it collected in precept, what it spent it on. The single most important transparency document a council produces.",
    how: "We look for the most recent AGAR (or equivalent annual accounts) on the council's website.",
  },

  // ── Pillar 4 — Democratic Openness ──
  { id: "4.1", pillar: 4, title: "The chair or mayor is named", points: "up to 3 points",
    why: "The chair or mayor is the council's elected leader. Publishing who they are lets residents know who represents them democratically.",
    how: "We check whether the chair's name is publicly recorded for the council.",
  },
  { id: "4.2", pillar: 4, title: "At least three councillors are listed with names", points: "up to 5 points",
    why: "Councillors are elected volunteers who shape decisions on behalf of residents. A council that doesn't even name its councillors publicly is asking residents to vote for people they can't identify.",
    how: "We look for a list of the council's councillors. If at least three are named, full points.",
  },
  { id: "4.3", pillar: 4, title: "There are ways to contact councillors", points: "up to 4 points",
    why: "Knowing a councillor's name is one thing; being able to write to them is another. Published contact details turn ceremonial representation into real accountability.",
    how: "We check whether at least one councillor has a published email address or equivalent contact method.",
  },
  { id: "4.4", pillar: 4, title: "The register of councillors' interests is published", points: "up to 3 points",
    why: "The Localism Act 2011 requires councillors to declare their interests so residents can see whether a council decision might affect a councillor personally. Publishing the register — rather than filing it in a drawer at the clerk's house — is the point.",
    how: "We look for the register of members' interests on the council's website.",
  },
];

const PILLAR_META = {
  1: { title: "Digital Presence",       shortTitle: "Digital",       max: 30, colour: "sky",     icon: Globe,       tagline: "Can a resident find the council online?" },
  2: { title: "Contact Transparency",   shortTitle: "Contact",       max: 30, colour: "indigo",  icon: Mail,        tagline: "Can a resident actually reach somebody?" },
  3: { title: "Governance Documents",   shortTitle: "Governance",    max: 25, colour: "emerald", icon: ShieldCheck, tagline: "Are the statutory documents published?" },
  4: { title: "Democratic Openness",    shortTitle: "Democracy",     max: 15, colour: "amber",   icon: Users,       tagline: "Can residents see who represents them?" },
} as const;

function pillarClasses(p: 1|2|3|4) {
  const c = PILLAR_META[p].colour;
  return {
    bg: `bg-${c}-50`, border: `border-${c}-200`, text: `text-${c}-800`, ring: `ring-${c}-200`,
  };
}

export default function Methodology() {
  useSEO({
    title: "Methodology — How we score every council, in plain English | Council ClearSight",
    description: "A clear, human explanation of how the Council ClearSight Transparency Index is calculated. Four pillars, fourteen indicators, scored from publicly observable information. No jargon.",
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
            How we score every council,<br/>in plain English.
          </h1>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
            Every council in England receives a single score out of 100. The score comes from fourteen specific, observable things — either the council does them or it doesn't. This page explains what each one means, why it matters, and how we check it. No jargon, no formulas, no fine print.
          </p>
        </div>
      </section>

      <div className="container max-w-4xl py-16 space-y-20">

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
          <p className="text-muted-foreground text-sm mb-6 max-w-3xl leading-relaxed">The fourteen indicators are grouped into four pillars, each answering a slightly different question about a council.</p>
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
              <strong className="text-foreground">Why the pillars aren't equal in weight.</strong> Digital presence and contact transparency each carry 30 points because they are the most reliably observable. Governance documents carry 25 because they take more effort to verify at scale. Democratic openness carries 15 because the artefacts are harder to check consistently across 11,000 councils. None of the weights were chosen to flatter any particular council.
            </p>
          </div>
        </section>

        {/* ─── Each indicator, explained plainly ──────────── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Every indicator, in plain English</h2>
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
              { range: "80 – 100",  name: "Exemplary",        colour: "emerald", body: "The council meets or exceeds almost every observable transparency requirement. It's publishing the documents it should and residents can easily see what's happening." },
              { range: "60 – 79",   name: "Strong",           colour: "teal",    body: "The council meets most requirements with a handful of specific gaps. It's clearly engaged; the improvements needed are identifiable and achievable." },
              { range: "40 – 59",   name: "Developing",       colour: "amber",   body: "The council has partial transparency but significant gaps across at least one pillar. There's something to build on but a meaningful amount of work ahead." },
              { range: "0 – 39",    name: "At Risk",          colour: "red",     body: "The council has substantial gaps in publicly visible transparency. Often this is a small parish with minimal online presence rather than a badly-run council — but the effect on residents is the same." },
              { range: "—",         name: "Not Yet Assessed", colour: "slate",   body: "We don't yet have enough evidence to give this council a meaningful score. They appear in the directory, but we don't band them until we have a fuller picture." },
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
                Open any council in the directory and you'll see each of the fourteen indicators with a clear pass / fail / not-assessed marker. Click through and the page shows exactly what we saw — the website URL we checked, the email address we found, the clerk name we recorded. If any of it is wrong, there is a one-click challenge button to tell us.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/directory"><Button>Find your council <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                <Link href="/methodology/changelog"><Button variant="outline">Methodology updates</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── What the score is not ───────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">What the score isn't</h2>
          <p className="text-muted-foreground text-sm mb-5 max-w-3xl leading-relaxed">It's easy to read any single number as broader judgement than it's meant to be. Four things the score does <em>not</em> measure:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: "Whether a council makes good decisions",   body: "A council can publish every document on time and still make decisions residents disagree with. The score is about visibility, not quality of judgement." },
              { title: "Whether residents are happy with it",      body: "We don't survey residents. A council might be loved by its community and still score modestly; or score highly and have difficult relationships — the score is about the artefacts, not the atmosphere." },
              { title: "Whether the precept is good value",        body: "Precept efficiency, procurement, value-for-money — none of these are measured. A separate question, for a separate day." },
              { title: "Whether the clerk or councillors are competent", body: "The score describes what has been published, not the people who published it. A new clerk at a previously-silent council can move a score dramatically in three months." },
            ].map((p) => (
              <div key={p.title} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">{p.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
